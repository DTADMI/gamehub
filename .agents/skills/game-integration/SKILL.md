---
name: game-integration
description: Add, update, or debug GameHub games using the Game Platform SDK. Use when a task touches game lifecycle, packaging, platform integration, game configuration, or game-specific UI within the GameHub monorepo.
---

# Game Integration

Use this skill for game development and integration work.

## Workflow

1. Identify the game surface: new game creation, existing game update, platform integration, or game debugging.
2. Use the Game Platform SDK (`@gamehub/game-platform`) for game registration, lifecycle hooks, and platform services.
3. Follow the package structure: each game lives in `packages/games/<game-name>/` with its own build, config, and assets.
4. Integrate with leaderboard, save state, and auth systems through the platform adapter layer.
5. Keep game bundles optimized: lazy load non-critical assets, use code splitting for large games.
6. Verify the game works in all target modes: local dev, production build, and mobile viewport.
7. Run game-specific tests before finalizing: `pnpm test:unit` for unit tests, `pnpm test:e2e:smoke` for smoke checks.

## Guardrails

- Do not bypass the platform SDK for core services (auth, leaderboard, saves).
- Do not ship games without feature-flag gating for experimental modes.
- Keep game metadata original and thematic; no generic filler titles or descriptions.
