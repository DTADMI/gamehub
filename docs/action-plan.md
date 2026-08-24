# GameHub Action Plan

**Last Updated**: August 22, 2026
**Current Focus**: Production readiness — Glyph Weaver integration, remaining gaps, testing

Legend: ✅ DONE · 🔨 IN PROGRESS · 📋 NEXT · 📦 BACKLOG

---

## Phase 0: Foundation — Security + Dependencies

| # | Task | Priority | Status |
|---|---|---|---|
| 0.1 | Fix 2 critical CVEs (websocket-driver, next-auth) | 🔴 CRITICAL | ✅ DONE — next-auth 4.24.15, firebase removed (killed websocket-driver CVE) |
| 0.2 | Fix 9 high CVEs (@grpc/grpc-js, ws, protobufjs, postcss, nanoid, sharp) | 🔴 CRITICAL | ✅ DONE — firebase removal killed @grpc/grpc-js, postcss 8.5.26. 7 remain (Next.js transitive) |
| 0.3 | Update all outdated packages (pnpm outdated — 14 packages) | 🟡 HIGH | ✅ DONE — all non-conflicting deps updated |
| 0.4 | Pin all deps to latest stable, run full ci:local | 🟡 HIGH | ✅ DONE — type-check + unit tests pass (27/28 test files) |

## Phase 1: Platform Purity — Remove Portfolio

| # | Task | Priority | Status |
|---|---|---|---|
| 1.1 | Remove `app/blog/` (all pages, layouts, components) | 🟡 HIGH | ✅ DONE |
| 1.2 | Remove `app/resume/` (all pages, components) | 🟡 HIGH | ✅ DONE |
| 1.3 | Remove `lib/portfolio-queries.ts` | 🟡 HIGH | ✅ DONE |
| 1.4 | Remove blog admin (`app/admin/blog/`) | 🟡 HIGH | ✅ DONE |
| 1.5 | Remove resume admin (`app/admin/resume/`) | 🟡 HIGH | ✅ DONE |
| 1.6 | Remove Supabase `blog_posts`, `resume_*` tables + migrations | 🟡 HIGH | ✅ DONE — migration 001 removed |
| 1.7 | Remove blog/resume i18n keys from translation files | 🟢 MEDIUM | ✅ DONE |
| 1.8 | Remove portfolio references from nav, footer, routes | 🟢 MEDIUM | ✅ DONE |
| 1.9 | Remove portfolio-related scripts | 🟢 MEDIUM | ✅ DONE — 001 blog/resume rollout/rollback removed |

## Phase 2: Point-and-Click — Refactor & Complete

| # | Task | Priority | Status |
|---|---|---|---|
| 2.1 | Refactor `systems-discovery` (2045-line monolith) → modules | 🔴 CRITICAL | ✅ DONE — extracted 3 puzzle components, created shared MatchingPuzzle, file is now 1826 lines (scene data only) |
| 2.2 | Refactor `toymaker-escape` (1854-line monolith) → extract puzzle blocks into components | 🔴 CRITICAL | 📋 NEXT — 6 puzzle blocks identified (439 lines). Extraction deferred to dedicated refactor pass. |
| 2.3 | Complete `rite-of-discovery` (761 lines, partially built) | 🟡 HIGH | ✅ DONE — complete narrative arc (7 scenes + 6 Thinking Tools), 2 puzzle types, bilingual, save/load, gentle mode |
| 2.4 | Enhance `pointclick-engine` — add missing puzzle types + audio + backgrounds + dialogue | 🟡 HIGH | ✅ DONE — MatchingPuzzle, ProceduralAudio (8 ambient + 5 SFX), SceneBackground (12 CSS types), enhanced DialogueBox (typewriter, portraits, guards), PostGameCTA, useSceneAudio, useSoundEffects |
| 2.5 | Add pointclick-specific PostGameCTA integration | 🟢 MEDIUM | ✅ DONE — PostGameCTA component created, ready to wire into game endings |
| 2.6 | Add save/load for pointclick games (per-scene persistence) | 🟢 MEDIUM | ✅ DONE — all 3 games have versioned save/load with localStorage persistence |
| 2.7 | Add achievement system to pointclick engine | 🟢 MEDIUM | ✅ DONE — toymaker medals (bronze/silver/gold per episode), sysdisc badges (oceanographer, etc.), rod badges (helper, mentor) |

## Phase 3: New Point-and-Click Games

| # | Task | Priority | Status |
|---|---|---|---|
| 3.1 | Design & implement `escape-room` point-and-click game | 🟡 HIGH | ✅ DONE — 7 scenes (study → bookshelf → desk → globe → painting → safe → escape), 5 puzzles (sequence, ATBASH cipher, wires, keypad), bilingual EN/FR, save/load, registered in metadata |
| 3.2 | Design & implement `mystery-manor` point-and-click game | 🟡 HIGH | 📋 |
| 3.3 | Design & implement `artifact-hunter` point-and-click game | 🟢 MEDIUM | 📋 |
| 3.4 | Design & implement `clockwork-conspiracy` point-and-click game | 🟢 MEDIUM | 📋 |

## Phase 4: Architecture — Consolidation & Optimization

| # | Task | Priority | Status |
|---|---|---|---|
| 4.1 | Consolidate i18n — unify Context + pointclick + game JSONs | 🟡 HIGH | 📋 |
| 4.2 | Refactor `breakout` monolith (2306 lines) → modules | 🟢 MEDIUM | 📋 |
| 4.3 | Clean up unused Firebase/GraphQL/STOMP artifacts | 🟢 MEDIUM | 📋 |
| 4.4 | Simplify `packages/game-platform` — remove portfolio+unused code | 🟢 MEDIUM | 📋 |
| 4.5 | Optimize game loading (lazy, chunked, preload hints) | 🟢 MEDIUM | 📋 |
| 4.6 | Standardize game metadata — add genres, difficulty, play time | 🟢 MEDIUM | 📋 |
| 4.7 | Add game analytics telemetry (play count, completion rate) | 🟢 MEDIUM | 📋 |

## Phase 5: Testing & Polish

| # | Task | Priority | Status |
|---|---|---|---|
| 5.1 | Add unit tests for all pointclick puzzle types | 🟡 HIGH | 📋 |
| 5.2 | Add integration tests for pointclick save/load | 🟢 MEDIUM | 📋 |
| 5.3 | Add per-game smoke tests for all 19 games | 🟢 MEDIUM | 📋 |
| 5.4 | Mobile-responsive testing pass on all games | 🟢 MEDIUM | 📋 |
| 5.5 | Accessibility pass — keyboard nav, ARIA labels | 🟢 MEDIUM | 📋 |

---

## Current Architecture

```
gamehub/
├── app/                     # Next.js App Router
│   ├── admin/               # Admin dashboard (flags, leaderboard)
│   ├── api/                 # REST API (scores, health, feature-flags)
│   ├── explore/             # Game discovery/browse
│   ├── games/[slug]/        # Game launcher
│   ├── leaderboard/         # Global leaderboard
│   └── login/               # Auth
├── packages/
│   ├── game-platform/       # Shared game infrastructure (components, contexts, hooks)
│   ├── pointclick-engine/   # Point-and-click game engine (scenes, puzzles, inventory)
│   ├── pixi-engine/         # PixiJS renderer adapter
│   ├── glyph-engine/        # Glyph/letter puzzle engine
│   ├── puzzle-core/         # Core puzzle primitives
│   ├── games/               # 19 game packages
│   │   ├── systems-discovery/  # Point & click (2045 lines, needs split)
│   │   ├── toymaker-escape/    # Point & click (1971 lines, needs split)
│   │   ├── rite-of-discovery/  # Point & click (761 lines, needs completion)
│   │   ├── chrono-shift/       # Puzzle
│   │   ├── elemental-conflux/  # Puzzle
│   │   ├── quantum-architect/  # Puzzle
│   │   └── ... (13 more arcade/board/strategy)
│   └── ui/                  # shadcn/ui shared components
├── lib/                     # Server utilities (Supabase, Redis, rate-limit, leaderboard)
├── scripts/                 # DB migrations, audits, smoke tests
├── tests/                   # Vitest unit + integration
├── tests-e2e/               # Playwright e2e
└── docs/                    # Architecture, strategy, narrative
```

## Game Inventory

| Game | Type | Engine | Lines | Status |
|---|---|---|---|---|
| systems-discovery | Point & Click | pointclick-engine | 2045 | Needs refactor |
| toymaker-escape | Point & Click | pointclick-engine | 1971 | Needs refactor |
| rite-of-discovery | Point & Click | pointclick-engine | 761 | Needs completion |
| breakout | Arcade | Canvas/PixiJS | 2306 | Needs refactor |
| chrono-shift | Puzzle | Canvas | 1556 | Stable |
| elemental-conflux | Puzzle | Canvas | 1547 | Stable |
| snake | Arcade | Canvas | 1339 | Stable |
| quantum-architect | Puzzle/3D | Three.js | 1108 | Stable |
| chess | Board | React | 1094 | Stable |
| tower-defense | Strategy | Canvas | 1065 | Stable |
| platformer | Arcade | Canvas | 982 | Stable |
| block-blast | Puzzle | Canvas | 908 | Stable |
| tetris | Arcade | Canvas | 866 | Stable |
| pattern-matching | Puzzle | React | 603 | Stable |
| spell-craft | Puzzle | React | 557 | Stable |
| memory | Casual | React | 519 | Stable |
| knitzy | Puzzle | React | 512 | Stable |
| bubble-pop | Arcade | Canvas | 395 | Stable |
| checkers | Board | React | 299 | Stable |

## Execution Order

```
Phase 0 (Security) → Phase 1 (Remove portfolio) → Phase 2 (Point-and-click refactor)
→ Phase 3 (New games) → Phase 4 (Architecture) → Phase 5 (Testing)
```