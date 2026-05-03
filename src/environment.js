import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import * as THREE from 'three';

const HDR_URL =
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_country_hall_1k.hdr';

export async function setupEnvironment(renderer, scene) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  let envMapTexture;

  try {
    const rgbeLoader = new RGBELoader();
    rgbeLoader.setDataType(THREE.HalfFloatType);

    const texture = await new Promise((resolve, reject) => {
      rgbeLoader.load(HDR_URL, resolve, undefined, reject);
    });

    envMapTexture = pmremGenerator.fromEquirectangular(texture).texture;
    texture.dispose();
    pmremGenerator.dispose();
  } catch {
    console.warn('HDR load failed, using procedural fallback.');

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4a5b6e');
    gradient.addColorStop(0.4, '#8495a8');
    gradient.addColorStop(0.6, '#c0c8d0');
    gradient.addColorStop(1, '#e8ecf0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const fallbackTex = new THREE.CanvasTexture(canvas);
    fallbackTex.colorSpace = THREE.SRGBColorSpace;
    envMapTexture = pmremGenerator.fromEquirectangular(fallbackTex).texture;
    fallbackTex.dispose();
    pmremGenerator.dispose();
  }

  scene.environment = envMapTexture;
  scene.background = envMapTexture;
  scene.backgroundBlurriness = 0.3;

  return { envMapTexture };
}
