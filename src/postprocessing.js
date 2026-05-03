import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

const VignetteGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    vignetteStrength: { value: 0.35 },
    grainStrength: { value: 0.04 },
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float vignetteStrength;
    uniform float grainStrength;
    uniform float time;
    uniform vec2 resolution;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Vignette
      vec2 center = vUv - 0.5;
      float dist = length(center) * 1.414;
      float vignette = 1.0 - smoothstep(0.2, 0.9, dist) * vignetteStrength;
      color.rgb *= mix(1.0, vignette, vignetteStrength * 2.0);

      // Film grain
      vec2 grainUV = vUv * resolution;
      float grain = random(grainUV + time * 100.0) * 2.0 - 1.0;
      color.rgb += grain * grainStrength;

      color.rgb = clamp(color.rgb, 0.0, 1.0);
      gl_FragColor = color;
    }
  `,
};

export function setupPostProcessing(renderer, scene, camera) {
  const rendererSize = new THREE.Vector2();
  renderer.getSize(rendererSize);
  const dpr = renderer.getPixelRatio();

  const composer = new EffectComposer(renderer);

  // RenderPass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // UnrealBloomPass
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(rendererSize.x, rendererSize.y),
    0.4,  // strength
    0.3,  // radius
    0.85, // threshold
  );
  composer.addPass(bloomPass);

  // Vignette + Film Grain
  const vignettePass = new ShaderPass(VignetteGrainShader);
  vignettePass.uniforms['resolution'].value.set(
    rendererSize.x * dpr,
    rendererSize.y * dpr,
  );
  composer.addPass(vignettePass);

  // FXAA (anti-aliasing)
  const fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.uniforms['resolution'].value.set(
    1 / (rendererSize.x * dpr),
    1 / (rendererSize.y * dpr),
  );
  composer.addPass(fxaaPass);

  // OutputPass (tone mapping + output encoding)
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return { composer, bloomPass, vignettePass, fxaaPass };
}

export function resizePostProcessing(
  composer,
  bloomPass,
  vignettePass,
  fxaaPass,
  renderer,
) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = renderer.getPixelRatio();

  composer.setSize(width, height);
  composer.setPixelRatio(dpr);

  bloomPass.resolution.set(width, height);

  vignettePass.uniforms['resolution'].value.set(width * dpr, height * dpr);

  fxaaPass.uniforms['resolution'].value.set(
    1 / (width * dpr),
    1 / (height * dpr),
  );
}
