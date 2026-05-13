---
name: gamehub-asset-pipeline
description: Handle GameHub game assets, WebGPU compute textures, WASM bundles, 3D models, shaders, and asset optimization. Use when a task touches game asset loading, bundle management, WebGPU/WebGL resources, or asset pipeline scripts.
---

# GameHub Asset Pipeline

Use this skill for game asset and rendering pipeline work.

## Workflow

1. Identify the asset surface: texture loading, WASM bundle management, 3D model import, shader compilation, or asset optimization.
2. Follow the WebGPU/WebGL capability detection pattern: check runtime support and provide documented fallbacks.
3. Keep asset bundles manageable: lazy load non-critical assets, use progressive loading for large textures.
4. Use the monorepo asset conventions: game assets live in `packages/games/<game-name>/public/` or `public/games/<game-name>/`.
5. Verify WebGPU compute shaders have CPU fallback paths where practical.
6. Run performance tests after significant asset changes: `pnpm run-performance-tests` or equivalent.
7. Document new asset conventions in `docs/technical/` or game-specific docs.

## Guardrails

- Do not ship WASM bundles without compression and lazy loading.
- Do not use experimental WebGPU features without feature-flag gating.
- Keep shader code in dedicated `.wgsl` or GLSL files, not inline strings.
