import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import { createScene, loadCenterpiece, updateAccents } from './scene.js';
import { setupLights } from './lights.js';
import { setupEnvironment } from './environment.js';
import { setupPostProcessing, resizePostProcessing } from './postprocessing.js';
import { setupGUI } from './gui.js';

// -- Renderer --
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: false,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// -- Camera --
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  50,
);
camera.position.set(0, 2.5, 6);
camera.lookAt(0, 0.7, 0);

// -- OrbitControls --
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.7, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.2;
controls.minDistance = 2.5;
controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI * 0.65;
controls.update();
camera.userData.controls = controls;

// -- Scene --
const { scene, modelGroup, accentObjects } = createScene();

// -- Lights --
const lights = setupLights(scene);

// -- Post-processing --
const { composer, bloomPass, vignettePass, fxaaPass } = setupPostProcessing(
  renderer,
  scene,
  camera,
);

// -- Stats --
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// -- Clock --
const clock = new THREE.Clock();

// -- GUI (deferred until env loaded) --
let envMapTexture = null;
let gui = null;

// -- Animation loop --
function animate() {
  stats.begin();

  const elapsed = clock.getElapsedTime();

  controls.update();
  updateAccents(accentObjects, elapsed);

  // Update grain time uniform
  vignettePass.uniforms['time'].value = elapsed;

  composer.render();

  stats.end();
  requestAnimationFrame(animate);
}

// -- Resize handler --
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  resizePostProcessing(composer, bloomPass, vignettePass, fxaaPass, renderer);
});

// -- Bootstrap --
async function init() {
  const envResult = await setupEnvironment(renderer, scene);
  envMapTexture = envResult.envMapTexture;

  // Load model (use env map so model materials can reference it)
  loadCenterpiece(scene, modelGroup, envMapTexture);

  // Setup GUI now that env is ready
  gui = setupGUI({
    lights,
    post: { bloomPass, vignettePass },
    scene,
    camera,
    accentObjects,
  });

  // Start render loop
  requestAnimationFrame(animate);
}

init();
