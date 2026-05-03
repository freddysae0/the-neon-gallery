import GUI from 'lil-gui';

export function setupGUI(deps) {
  const {
    lights,
    post,
    scene,
    camera,
    accentObjects,
  } = deps;

  const gui = new GUI({ title: 'The Neon Gallery', width: 300 });

  // -- Environment --
  const envFolder = gui.addFolder('Environment');
  const envData = { envIntensity: 1.0 };
  envFolder.add(envData, 'envIntensity', 0, 3, 0.01).onChange((v) => {
    scene.environmentIntensity = v;
  });
  envFolder
    .add({ blur: 0.3 }, 'blur', 0, 1, 0.01)
    .name('Bg Blur')
    .onChange((v) => {
      scene.backgroundBlurriness = v;
    });

  // -- Directional Light --
  const dirFolder = gui.addFolder('Directional Light');
  dirFolder
    .add(lights.directionalLight, 'intensity', 0, 20, 0.1)
    .name('Intensity');
  dirFolder
    .addColor(lights.directionalLight, 'color')
    .name('Color');
  dirFolder
    .add(lights.directionalLight.position, 'x', -10, 10, 0.1)
    .name('Pos X');
  dirFolder
    .add(lights.directionalLight.position, 'y', 0, 15, 0.1)
    .name('Pos Y');
  dirFolder
    .add(lights.directionalLight.position, 'z', -10, 10, 0.1)
    .name('Pos Z');
  dirFolder
    .add(lights.directionalLight, 'castShadow')
    .name('Cast Shadow');

  // -- Point Lights --
  const pt1Folder = gui.addFolder('Point Light (Warm)');
  pt1Folder.add(lights.pointLight1, 'intensity', 0, 80, 0.5).name('Intensity');
  pt1Folder.addColor(lights.pointLight1, 'color').name('Color');

  const pt2Folder = gui.addFolder('Point Light (Cool)');
  pt2Folder.add(lights.pointLight2, 'intensity', 0, 80, 0.5).name('Intensity');
  pt2Folder.addColor(lights.pointLight2, 'color').name('Color');

  // -- Shadows --
  const shadowFolder = gui.addFolder('Shadows');
  const shadowSizes = { 512: 512, 1024: 1024, 2048: 2048, 4096: 4096 };
  shadowFolder
    .add(
      { size: 2048 },
      'size',
      shadowSizes,
    )
    .name('Map Size')
    .onChange((v) => {
      lights.directionalLight.shadow.mapSize.set(v, v);
    });
  shadowFolder
    .add(lights.directionalLight.shadow, 'bias', -0.01, 0.001, 0.0001)
    .name('Bias');
  shadowFolder
    .add(lights.directionalLight.shadow.camera, 'near', 0.1, 10, 0.1)
    .name('Near');
  shadowFolder
    .add(lights.directionalLight.shadow.camera, 'far', 10, 100, 0.5)
    .name('Far');
  shadowFolder
    .add(
      { frustum: 8 },
      'frustum',
      2,
      20,
      0.5,
    )
    .name('Frustum Size')
    .onChange((v) => {
      const cam = lights.directionalLight.shadow.camera;
      cam.left = -v;
      cam.right = v;
      cam.top = v;
      cam.bottom = -v;
      cam.updateProjectionMatrix();
    });

  // -- Bloom --
  const bloomFolder = gui.addFolder('Bloom');
  bloomFolder
    .add(post.bloomPass, 'strength', 0, 3, 0.01)
    .name('Strength');
  bloomFolder
    .add(post.bloomPass, 'radius', 0, 1, 0.01)
    .name('Radius');
  bloomFolder
    .add(post.bloomPass, 'threshold', 0, 1, 0.01)
    .name('Threshold');

  // -- Vignette + Grain --
  const vgFolder = gui.addFolder('Vignette & Grain');
  vgFolder
    .add(post.vignettePass.uniforms['vignetteStrength'], 'value', 0, 1, 0.01)
    .name('Vignette');
  vgFolder
    .add(post.vignettePass.uniforms['grainStrength'], 'value', 0, 0.15, 0.001)
    .name('Grain');

  // -- Animation --
  const animFolder = gui.addFolder('Animation');
  const animData = {
    autoRotate: true,
    autoRotateSpeed: 1.2,
    accentOrbit: true,
  };
  animFolder.add(animData, 'autoRotate').onChange((v) => {
    camera.userData.controls.autoRotate = v;
  });
  animFolder
    .add(animData, 'autoRotateSpeed', 0.1, 5, 0.1)
    .onChange((v) => {
      camera.userData.controls.autoRotateSpeed = v;
    });
  animFolder.add(animData, 'accentOrbit').onChange((v) => {
    accentObjects.forEach((obj) => {
      obj.visible = v;
    });
  });

  // -- Helpers --
  const helperFolder = gui.addFolder('Helpers');
  helperFolder.add(lights.dirLightHelper, 'visible').name('DirLightHelper');
  helperFolder.add(lights.shadowCameraHelper, 'visible').name('ShadowCamera');
  helperFolder.add(lights.pointHelper1, 'visible').name('PointHelper 1');
  helperFolder.add(lights.pointHelper2, 'visible').name('PointHelper 2');
  helperFolder.add(lights.axesHelper, 'visible').name('AxesHelper');

  return gui;
}
