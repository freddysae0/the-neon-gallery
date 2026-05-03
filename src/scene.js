import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const HELMET_URL =
  'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';

export function createScene() {
  const scene = new THREE.Scene();

  // -- Ground turntable disc --
  const groundGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.06, 64);
  const groundMat = new THREE.MeshPhysicalMaterial({
    color: '#1a1a1a',
    metalness: 0.98,
    roughness: 0.12,
    clearcoat: 0.2,
    clearcoatRoughness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.03;
  ground.receiveShadow = true;
  scene.add(ground);

  // -- Pedestal --
  const pedestalGeo = new THREE.CylinderGeometry(0.45, 0.55, 0.7, 64);
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: '#2a2a2a',
    metalness: 0.9,
    roughness: 0.18,
  });
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.y = 0.35;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);

  // -- Pedestal top ring --
  const ringGeo = new THREE.TorusGeometry(0.45, 0.03, 16, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: '#d4af37',
    metalness: 0.9,
    roughness: 0.3,
    emissive: '#d4af37',
    emissiveIntensity: 0.4,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.7;
  ring.castShadow = true;
  scene.add(ring);

  // -- Model group (placeholder until GLTF loads) --
  const modelGroup = new THREE.Group();
  modelGroup.position.y = 0.7;
  scene.add(modelGroup);

  // -- Accent orbiting objects --
  const accentObjects = [];
  const accentColors = ['#00e5ff', '#ff4081', '#ffd740', '#69f0ae', '#b388ff'];
  const accentRadii = [1.6, 1.9, 2.2, 1.75, 2.0];
  const accentHeights = [0.3, 1.2, 0.8, 1.5, 0.5];
  const accentSpeeds = [0.5, -0.7, 0.4, -0.6, 0.55];
  const accentPhases = [0, 1.2, 2.4, 3.6, 4.8];

  for (let i = 0; i < 5; i++) {
    const geo = new THREE.TorusKnotGeometry(0.1, 0.04, 64, 8, 2, 3);
    const mat = new THREE.MeshStandardMaterial({
      color: accentColors[i],
      metalness: 0.3,
      roughness: 0.4,
      emissive: accentColors[i],
      emissiveIntensity: 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.userData = {
      radius: accentRadii[i],
      height: accentHeights[i],
      speed: accentSpeeds[i],
      phase: accentPhases[i],
    };
    accentObjects.push(mesh);
    scene.add(mesh);
  }

  return { scene, modelGroup, accentObjects, ground, pedestal };
}

export function loadCenterpiece(scene, modelGroup, envMapTexture) {
  const loader = new GLTFLoader();

  return loader
    .loadAsync(HELMET_URL)
    .then((gltf) => {
      const model = gltf.scene;

      // Override materials to use scene environment
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material];
            materials.forEach((mat) => {
              mat.envMap = envMapTexture || null;
              mat.envMapIntensity = 1.0;
              mat.needsUpdate = true;
            });
          }
        }
      });

      // Scale and position
      model.scale.set(1.6, 1.6, 1.6);
      model.position.set(0, 0, 0);

      // Lift model so its base sits on the pedestal (local Y=0)
      const box = new THREE.Box3().setFromObject(model);
      model.position.y = -box.min.y;

      modelGroup.add(model);
      return model;
    })
    .catch((err) => {
      console.warn('Model load failed, using procedural fallback.', err);
      const fallbackGeo = new THREE.TorusKnotGeometry(0.4, 0.15, 128, 16, 3, 4);
      const fallbackMat = new THREE.MeshPhysicalMaterial({
        color: '#c0c0c0',
        metalness: 0.8,
        roughness: 0.1,
        clearcoat: 0.3,
        clearcoatRoughness: 0.05,
      });
      const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
      fallbackMesh.castShadow = true;
      fallbackMesh.receiveShadow = true;
      modelGroup.add(fallbackMesh);
      return fallbackMesh;
    });
}

export function updateAccents(accentObjects, time) {
  for (const obj of accentObjects) {
    const { radius, height, speed, phase } = obj.userData;
    const angle = time * speed + phase;
    obj.position.x = Math.cos(angle) * radius;
    obj.position.z = Math.sin(angle) * radius;
    obj.position.y = height;
    obj.rotation.x = time * 0.8;
    obj.rotation.y = time * 0.6;
  }
}
