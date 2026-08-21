# GameHub — Documentation

> **Owner**: Nebula Forge Digital Studio  
> **Last Updated**: 2026-08-20  

## Overview

GameHub is a WebGPU-powered game platform and launcher with leaderboards, portfolio blog, and admin dashboard. Next.js 16 App Router on Vercel with Supabase (Auth, DB, Storage) and Upstash Redis.

## Quick Links

| Document | Content |
|---|---|
| [Architecture (monorepo)](architecture-monorepo.md) | Package structure, build pipeline, dependency graph |
| [Game Engine Strategy](GAME_ENGINE_STRATEGY.md) | WebGPU/PixiJS/PointClick engine decisions |
| [Systems Discovery](systems-discovery/) | Game mechanics research and design docs |
| [Narrative](narrative/) | Story and world-building design |
| [Action Plan](action-plan.md) | Gap tracking, priorities, roadmap |
| [Technical Docs](technical/) | Performance, encoding, feature flags, architecture |

## Architecture

```
gamehub/
├── app/                ← Next.js 16 App Router (admin, blog, explore, games, leaderboard, auth)
├── packages/           ← Monorepo packages
│   ├── game-platform/  ← Shared platform core (GameShell, auth, post-game CTA)
│   ├── games/          ← Game bundles (breakout, snake, memory, chess, checkers, etc.)
│   ├── ui/             ← Design system components
│   ├── tsconfig/       ← Shared TypeScript configs
│   ├── pixi-engine/    ← PixiJS renderer integration
│   ├── pointclick-engine/ ← Point-and-click adventure engine
│   ├── glyph-engine/   ← Glyph/pattern-matching engine
│   └── puzzle-core/    ← Shared puzzle utilities
├── lib/                ← Shared logic (feature flags, auth, cache, rate-limit, i18n)
├── tests/              ← Vitest unit/integration tests
├── tests-e2e/          ← Playwright E2E tests (43+ specs)
└── docs/               ← Technical documentation
```

## Games

| Game | Package | Engine |
|---|---|---|
| Breakout | `@games/breakout` | Canvas 2D |
| Snake | `@games/snake` | Canvas 2D |
| Memory | `@games/memory` | React |
| Chess | `@games/chess` | chess.js |
| Checkers | `@games/checkers` | Custom engine |
| Tetris | `@games/tetris` | Canvas 2D |
| Tower Defense | `@games/tower-defense` | Canvas 2D |
| Platformer | `@games/platformer` | Canvas 2D |
| Block Blast | `@games/block-blast` | Canvas 2D |
| Spell Craft | `@games/spell-craft` | Glyph engine |
| Pattern Matching | `@games/pattern-matching` | Glyph engine |
| Knitzy | `@games/knitzy` | PixiJS |
| Systems Discovery | `@games/systems-discovery` | PointClick engine |
| Toymaker Escape | `@games/toymaker-escape` | PointClick engine |
| Rite of Discovery | `@games/rite-of-discovery` | PointClick engine |

## Getting Started

```bash
pnpm install
pnpm dev          # Start dev server
pnpm type-check   # TypeScript check
pnpm ci:local     # Full local CI (lint + typecheck + test + build)
pnpm test         # Vitest suite
pnpm test:e2e     # Playwright E2E
```

---

*Document maintained by Nebula Forge Digital Studio — August 2026*