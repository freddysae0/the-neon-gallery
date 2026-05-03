# AGENTS.md

## Project overview
Three.js 0.170 standalone demo ("The Neon Gallery") bundled with Vite. No framework — vanilla ES modules. A Damaged Helmet GLTF model on a reflective pedestal with HDR environment lighting, animated accent objects, post-processing, and a lil-gui control panel.

## Commands
```bash
npm run dev      # Start dev server (opens browser)
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## Architecture

```
src/
├── main.js          # Entry: renderer, camera, OrbitControls, stats, resize, animation loop
├── scene.js         # Ground disc, pedestal, GLTF centerpiece (async), orbiting accent knots
├── lights.js        # DirectionalLight + 2 PointLights + helpers (all helpers visible=false)
├── environment.js   # HDR from URL → PMREMGenerator → scene.environment (canvas gradient fallback)
├── postprocessing.js# EffectComposer pipeline + custom VignetteGrain shader
├── gui.js           # lil-gui: env, lights, shadows, bloom, vignette/grain, animation, helpers
└── style.css        # Fullscreen canvas, margin reset
```

## Key technical details

### Renderer
- `antialias: false` — AA is handled by the FXAA pass in the post-processing pipeline
- `renderer.shadowMap.type = THREE.PCFSoftShadowMap`
- `renderer.toneMapping = THREE.ACESFilmicToneMapping` (applied by OutputPass)
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` — DPR capped at 2× for performance

### Post-processing pipeline (order matters)
```
RenderPass → UnrealBloomPass → VignetteGrainPass (custom ShaderPass) → FXAA → OutputPass
```
- `OutputPass` must be **last** — it renders to screen with tone mapping + sRGB encoding
- `VignetteGrainPass.uniforms['time'].value` must be updated each frame for animated grain

### Resize handler
On `window.resize`, ALL of these must be updated:
1. `camera.aspect` + `camera.updateProjectionMatrix()`
2. `renderer.setSize(w, h)` + `renderer.setPixelRatio(min(dpr, 2))`
3. `composer.setSize(w, h)` + `composer.setPixelRatio(dpr)`
4. `bloomPass.resolution.set(w, h)`
5. `vignettePass.uniforms['resolution'].value.set(w * dpr, h * dpr)`
6. `fxaaPass.uniforms['resolution'].value.set(1/(w*dpr), 1/(h*dpr))`

### Environment map
- `scene.environmentIntensity` controls global env intensity (not the texture object)
- `scene.backgroundBlurriness` controls background blur (0–1)
- External URLs may fail — there are **fallbacks**: canvas gradient for HDR, procedural TorusKnotGeometry for the GLTF model

### Shadows
- Shadow map size, bias, near/far, and frustum size are controllable via GUI
- Changing frustum size requires `shadowCamera.updateProjectionMatrix()` afterward

### Helpers
- All helpers are added to the scene with `visible: false` by default
- GUI checkboxes toggle each helper's `visible` property

### Stats
- `Stats` panel always visible; `stats.begin()` / `stats.end()` wrap each animation frame
