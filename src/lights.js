import * as THREE from 'three';

export function setupLights(scene) {
  // -- Directional light (main shadow caster) --
  const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
  directionalLight.position.set(5, 8, 3);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(2048, 2048);
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -8;
  directionalLight.shadow.camera.right = 8;
  directionalLight.shadow.camera.top = 8;
  directionalLight.shadow.camera.bottom = -8;
  directionalLight.shadow.bias = -0.0003;
  directionalLight.shadow.normalBias = 0.02;
  scene.add(directionalLight);

  // -- Directional light helper --
  const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.5);
  dirLightHelper.visible = false;
  scene.add(dirLightHelper);

  // -- Shadow camera helper --
  const shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  shadowCameraHelper.visible = false;
  scene.add(shadowCameraHelper);

  // -- Warm point light (right side) --
  const pointLight1 = new THREE.PointLight('#ff9966', 8, 10);
  pointLight1.position.set(3, 2, 2);
  scene.add(pointLight1);

  const pointHelper1 = new THREE.PointLightHelper(pointLight1, 0.2);
  pointHelper1.visible = false;
  scene.add(pointHelper1);

  // -- Cool point light (left side) --
  const pointLight2 = new THREE.PointLight('#6699ff', 6, 10);
  pointLight2.position.set(-3, 1.5, -2);
  scene.add(pointLight2);

  const pointHelper2 = new THREE.PointLightHelper(pointLight2, 0.2);
  pointHelper2.visible = false;
  scene.add(pointHelper2);

  // -- Axes helper --
  const axesHelper = new THREE.AxesHelper(3);
  axesHelper.visible = false;
  scene.add(axesHelper);

  return {
    directionalLight,
    pointLight1,
    pointLight2,
    dirLightHelper,
    shadowCameraHelper,
    pointHelper1,
    pointHelper2,
    axesHelper,
  };
}
