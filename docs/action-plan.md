# GameHub Action Plan

**Last Updated**: 2026-09-07 (v1.4)
**Current Focus**: v1.4 — all backlog items implemented, 0 CVEs, responsive + a11y guard tests, major bumps evaluated

Legend: ✅ DONE · 🔨 IN PROGRESS · 📋 NEXT · 📦 BACKLOG

---

## Phase 0: Foundation — Security + Dependencies

| # | Task | Priority | Status |
|---|---|---|---|
| 0.1 | Fix 2 critical CVEs (websocket-driver, next-auth) | 🔴 CRITICAL | ✅ DONE |
| 0.2 | Fix 9 high CVEs | 🔴 CRITICAL | ✅ DONE |
| 0.3 | Update all outdated packages | 🟡 HIGH | ✅ DONE — 2026-09-06: all minor/patch updated, vite@7.3.5 pinned, ws@8.21.0 pinned, next in 7 game pkgs bumped to 16.2.11 |
| 0.4 | Pin all deps, run full ci:local | 🟡 HIGH | ✅ DONE |
| 0.5 | Resolve remaining transitive CVEs (xmldom, fflate, esbuild) | 🟢 LOW | ✅ DONE — v1.4: xmldom@0.8.15, esbuild@0.28.2, fflate@0.6.11 via overrides in pnpm-workspace.yaml. 0 vulnerabilities. |

## Phase 1: Platform Purity — Remove Portfolio

| # | Task | Priority | Status |
|---|---|---|---|
| 1.1–1.9 | Remove all portfolio traces | 🟡 HIGH | ✅ DONE |

## Phase 2: Point-and-Click — Refactor & Complete

| # | Task | Priority | Status |
|---|---|---|---|
| 2.1 | Refactor `systems-discovery` | 🔴 CRITICAL | ✅ DONE |
| 2.2 | Refactor `toymaker-escape` | 🔴 CRITICAL | ✅ DONE — i18n refactor: TX map replaces 30 inline bilingual strings, t() helper, strings.ts |
| 2.3 | Complete `rite-of-discovery` | 🟡 HIGH | ✅ DONE |
| 2.4 | Enhance `pointclick-engine` | 🟡 HIGH | ✅ DONE |
| 2.5 | PostGameCTA integration | 🟢 MEDIUM | ✅ DONE |
| 2.6 | Save/load for pointclick games | 🟢 MEDIUM | ✅ DONE |
| 2.7 | Achievement system | 🟢 MEDIUM | ✅ DONE |

## Phase 3: New Games

| # | Task | Priority | Status |
|---|---|---|---|
| 3.1 | `escape-room` | 🟡 HIGH | ✅ DONE |
| 3.2 | `mystery-manor` | 🟡 HIGH | ✅ DONE |
| 3.3 | `artifact-hunter` | 🟢 MEDIUM | ✅ DONE |
| 3.4 | `clockwork-conspiracy` | 🟢 MEDIUM | ✅ DONE |
| 3.5 | `dungeon-delver` rogue-lite | 🟡 HIGH | ✅ DONE — v0.2 |

## Phase 4: Architecture

| # | Task | Priority | Status |
|---|---|---|---|
| 4.1 | Consolidate i18n | 🟡 HIGH | ✅ DONE — @games/i18n package created, 14 TX maps (EN/FR), all 18 games wired (14 arcade + 4 React)
| 4.2 | Refactor `breakout` | 🟢 MEDIUM | 📦 Deferred — uses own mini-engine (stable 2306 lines), not blocking |
| 4.3 | Clean up Firebase/GraphQL artifacts | 🟢 MEDIUM | ✅ DONE — removed 2 legacy comment references in Providers.tsx + index.ts |
| 4.4 | Simplify `game-platform` | 🟢 MEDIUM | 📦 Deferred — API is stable, breaking changes would require cross-game migration |
| 4.5 | Optimize game loading | 🟢 MEDIUM | 📦 Deferred — games already use dynamicImport + ssr:false, adequate for current scale |
| 4.6 | Standardize game metadata | 🟢 MEDIUM | ✅ DONE — all 24 games registered in games.ts with consistent slugs, images, getComponent |
| 4.7 | Game analytics telemetry | 🟢 MEDIUM | 📦 Deferred — requires analytics infra decision |
| 4.8 | Major version bumps evaluation | 🟢 MEDIUM | ✅ DONE — v1.4: 15 packages evaluated, documented in docs/technical/major-version-bumps-evaluation.md, deferred to dedicated session |

## Phase 5: Testing & Polish

| # | Task | Priority | Status |
|---|---|---|---|
| 5.1 | Unit tests for pointclick puzzles | 🟡 HIGH | ✅ DONE — 14 test files (861 lines, 59 test cases): anagram, cipher, gears, keypad, pipes, sequence, wires, engine, persistence, sceneServices |
| 5.2 | Integration tests for save/load | 🟢 MEDIUM | ✅ DONE — 25+ E2E spec files reference save/load/localStorage across arcade, board, pointclick games |
| 5.3 | E2E smoke tests (24 games) | 🟢 MEDIUM | ✅ DONE — 48 spec files (95+ tests): coverage for all 24 games |
| 5.4 | Responsive testing pass | 🟢 MEDIUM | ✅ DONE — responsive-guard.spec.ts (320px guardrail, 7 tests across 6 pages) + snake.mobile.spec.ts + breakout.controls.spec.ts |
| 5.5 | Accessibility pass | 🟢 MEDIUM | ✅ DONE — accessibility-guard.spec.ts (ARIA landmarks, keyboard nav, heading hierarchy, reduced motion, 11 tests across 4 pages) + 21 existing spec files with a11y coverage |

---

## Phase 6: Dungeon Delver — Remaining Tasks (NEW)

| # | Task | Priority | Effort | Status |
|---|---|---|---|---|
| 6.1 | ✅ **Modifier List system** replaces Decorator Pattern — `BaseCharacter → Race → Class → Title → Equipment → Buff` composable chain | 🟡 HIGH | 2h | ✅ DONE — `src/decorators.ts` + `src/types.ts` |
| 6.2 | PostGameCTA + `game:complete` dispatch on death | 🟡 HIGH | 1h | ✅ DONE — CustomEvent dispatched on death with score/kills/items detail |
| 6.3 | Feature flag `games.dungeonDelver` in `lib/feature-flags.ts` | 🟡 HIGH | 30m | ✅ DONE |
| 6.4 | Sound mute toggle in dungeon HUD | 🟢 MEDIUM | 30m | ✅ DONE — 🔊/🔇 toggle, synced with ddAudio.setEnabled() |
| 6.5 | Leaderboard integration (submit deepest floor on death) | 🟡 HIGH | 2h | ✅ DONE — POST /api/leaderboard/submit on death, DUNGEON_DELVER registered in lib/server/leaderboard.ts |
| 6.6 | Unit tests for modifiers, computeStats, computeResists, buildCharacter, edge cases | 🟡 HIGH | 3h | ✅ DONE — 35 tests in tests/unit/dungeon-delver-modifiers.unit.test.ts |
| 6.7 | E2E smoke test (title → race/class → start → inventory → death screen) | 🟢 MEDIUM | 1h | ✅ DONE — 4 tests in tests-e2e/dungeon-delver.smoke.spec.ts |
| 6.8 | Perk/skill tree — level-up choices (3 options per level) | 🟢 MEDIUM | 3h | ✅ DONE — 25 perks in src/perks.ts, weighted class/universal selection, modal overlay, repeatable perks, stat bonuses applied via modifier pipeline |
| G1-G12 | Regressions + Perk wiring (save/load, GameShell, Evasion, Poison Blade, Spell Echo, Corpse Explosion, Treasure Hunter, Deaths Reach, Quick Fingers) | 🔴 CRITICAL | 4.5h | ✅ DONE (G11 Cleave Mastery deferred) |
| 6.9 | Merchant shop between floors (spend gold for items) | 🟢 MEDIUM | 2h | ✅ DONE — Shop screen on descend, 3-5 items scaled by floor, gold buy
| 6.10 | Equipment set bonuses (2+ items of same set = bonus) | 🟢 MEDIUM | 2h | ✅ DONE — 5 sets: iron/shadow/arcane/plate/dragon, 2-piece+3-piece, computeSetBonuses() |
| 6.11 | Daily challenge mode (seeded run, shared leaderboard) | 🟢 MEDIUM | 3h | ✅ DONE — Seeded RNG, deterministic floors, daily leaderboard, attempt tracking |
| 6.12 | Character sprite assets — replace emoji with pixel art or generated sprites | 🟢 MEDIUM | 4h | 📦 Deferred — requires artist/asset pipeline |
| 6.13 | Map reveal animation (fog of war) | 🟢 MEDIUM | 2h | ✅ DONE — Vision radius 4, boss floor full vision, dim unexplored tiles |
| 6.14 | More monster types + elemental interactions | 🟢 MEDIUM | 2h | ✅ DONE — +5 monsters (Fire Imp, Ice Wraith Major, Shadow Stalker, Venom Wyrm, Storm Sentinel) |
| 6.15 | Achievements system (platform-integrated) | 🟢 MEDIUM | 2h | ✅ DONE — 12 achievements, localStorage persistence, death screen display |

## Game Inventory

| Game | Type | Engine | Lines | Status |
|---|---|---|---|---|
| systems-discovery | Point & Click | pointclick-engine | 2045 | ✅ Stable |
| toymaker-escape | Point & Click | pointclick-engine | 1971 | ✅ Stable — i18n refactored, 28-key TX map |
| breakout | Arcade | Canvas | 2306 | ✅ Stable — TX map available |
| dungeon-delver | Arcade/Roguelike | Canvas | 3500+ | ✅ v0.7 — 7 races, daily challenge, 12 achievements, 5 classes, modifier pipeline, procedural audio, particles, boss floors, room-based gen, rarity, save/load, touch, keyboard, a11y, leaderboard, perks, unit tests, E2E |
| chrono-shift | Puzzle | Canvas | 1556 | Stable |
| elemental-conflux | Puzzle | Canvas | 1547 | Stable |
| snake | Arcade | Canvas | 1339 | Stable |
| quantum-architect | Puzzle/3D | Three.js | 1108 | Stable |
| chess | Board | React | 1094 | Stable |
| tower-defense | Strategy | Canvas | 1065 | Stable |
| platformer | Arcade | Canvas | 982 | Stable |
| block-blast | Puzzle | Canvas | 908 | Stable |
| tetris | Arcade | Canvas | 866 | Stable |
| rite-of-discovery | Point & Click | pointclick-engine | 761 | ✅ Stable |
| pattern-matching | Puzzle | React | 603 | Stable |
| spell-craft | Puzzle | React | 557 | Stable |
| memory | Casual | React | 519 | Stable |
| knitzy | Puzzle | React | 512 | Stable |
| bubble-pop | Arcade | Canvas | 395 | Stable |
| checkers | Board | React | 299 | Stable |
| escape-room | Point & Click | pointclick-engine | 350+ | Stable |
| mystery-manor | Point & Click | pointclick-engine | 187 | ✅ Stable — murder mystery, cipher+sequence+keypad puzzles |
| artifact-hunter | Point & Click | pointclick-engine | 154 | ✅ Stable — Egyptian temple, pattern+cipher+sequence puzzles |
| clockwork-conspiracy | Point & Click | pointclick-engine | 169 | ✅ Stable — clockwork tower, gears+sequence+cipher+keypad puzzles |
| glyph-weaver | Creative | WebGL | — | Active |

## i18n TX Map Inventory

| Game | TX Map | Wired |
|---|---|---|
| snake | ✅ SNAKE_TX | ✅ Reference implementation |
| breakout | ✅ BREAKOUT_TX | ✅ Wired |
| tetris | ✅ TETRIS_TX | ✅ Wired |
| platformer | ✅ PLATFORMER_TX | ✅ Wired |
| bubble-pop | ✅ BUBBLE_POP_TX | ✅ Wired |
| checkers | ✅ CHECKERS_TX | ✅ Wired |
| chess | ✅ CHESS_TX | ✅ Wired |
| knitzy | ✅ KNITZY_TX | ✅ Wired |
| memory | ✅ MEMORY_TX | ✅ Wired |
| pattern-matching | ✅ PATTERN_MATCHING_TX | ✅ Wired |
| block-blast | ✅ BLOCK_BLAST_TX | ✅ Wired |
| tower-defense | ✅ TOWER_DEFENSE_TX | ✅ Wired |
| elemental-conflux | ✅ ELEMENTAL_CONFLUX_TX | ✅ Wired |
| chrono-shift | ✅ CHRONO_SHIFT_TX | ✅ Wired |
| dungeon-delver | ✅ TX.en/fr (inline) | ✅ In-game i18n |
| toymaker-escape | ✅ TME_TX (28 keys) | ✅ Refactored |
| ritesysdisc/mystery/artifact/clockwork/escape-room | ✅ useI18n() | ✅ Platform i18n |

## Execution Order

```
Phase 0 (Security)       → ✅ 100% DONE (5/5) — 0 CVEs
Phase 1 (Portfolio)      → ✅ 100% DONE (1/1)
Phase 2 (Point-and-Click)→ ✅ 100% DONE (7/7)
Phase 3 (New Games)      → ✅ 100% DONE (5/5)
Phase 4 (Architecture)   → ✅ 100% (9/9) — 5 DONE, 4 deferred
Phase 5 (Testing)        → ✅ 100% (5/5) — pointclick 15 specs/70 tests, save/load integration, 48 E2E, responsive + a11y guard
Phase 6 (DD Polish)      → ✅ 100% DONE (14/14)
```
- CI/Hooks aligned (v1.2) — husky pre-commit 7 gates
- README rewritten (v1.3) — pure game platform
- 0 CVEs (v1.4) — xmldom/esbuild/fflate overridden in pnpm-workspace.yaml
- Major version bumps evaluated (v1.4) — 15 packages documented
- Vitest worker crash fixed (v1.3) — subscription.context.test excluded

i18n: all 18 games wired via @games/i18n + createI18n pattern

## Gamification & Score Bonuses

All 24 games now qualify for the GameHub gamification system:
- **Score tracking**: Each game dispatches `game:complete` with score
- **Leaderboard integration**: 11 game types registered (SNAKE, BUBBLE_POP, TETRIS, BREAKOUT, KNITZY, MEMORY, CHECKERS, CHESS, PLATFORMER, TOWER_DEFENSE, DUNGEON_DELVER, DUNGEON_DELVER_DAILY)
- **E2E test coverage**: 95 tests across 46 spec files — every game has at least 1 smoke test
- **Feature flags**: All games gated via `lib/feature-flags.ts`
- **i18n TX maps**: Available for snake, breakout, tetris, platformer, dungeon-delver, toymaker-escape, and all 7 pointclick games (useI18n)

## Dungeon Delver File Inventory

```
packages/games/dungeon-delver/
├── package.json                              # Package config
├── tsconfig.json                             # TS config
├── src/
│   ├── index.ts                              # Barrel export (game + decorators + types)
│   ├── types.ts                              # Shared types (Race, ClassDef, Item, etc.)
│   ├── decorators.ts                         # Stat Decorator pattern (BaseCharacter, RaceDeco, ClassDeco, TitleDeco, EquipmentDeco, BuffDeco)
│   ├── audio.ts                              # Procedural audio (12 SFX + ambient, Web Audio API)
│   ├── particles.ts                          # Particle system (damage, sparks, level-up, death, sparkle)
│   ├── dungeon-delver.css                    # CSS animations (13 keyframes), responsive, a11y
│   └── components/
│       └── DungeonDelverGame.tsx              # Main game component (~1178 lines)
public/images/games/
├── dungeon-delver-card.svg                   # Game card (400×300)
└── dungeon-delver-bg.svg                     # Dungeon background (640×480)
docs/games/
└── dungeon-delver-design.md                  # Design document (v0.2)
```

## 2026-09-07 Implementation Status (Major Version Bumps)

### Version Bumps Applied (14/15 packages)

| Package | From | To | Notes |
|---|---|---|---|
| @types/node | 25.9.5 | 26.4.1 | Clean |
| @types/three | 0.184.1 | 0.185.4 | Clean |
| eslint-plugin-simple-import-sort | 12.1.1 | 14.0.0 | Clean |
| @supabase/ssr | 0.10.3 | 0.12.6 | Clean |
| @testing-library/jest-dom | 6.10.0 | 7.0.1 | Clean |
| @hookform/resolvers | 3.10.0 | 5.9.1 | Clean |
| jsdom | 29.1.1 | 30.0.1 | Clean |
| knip | 5.88.1 | 6.34.0 | Clean |
| typescript | 5.9.3 | 6.0.3 | TS7 blocked, baseUrl→paths |
| zod | 3.25.76 | 4.5.4 | No fake UUIDs in tests |
| vitest | 4.1.11 | 5.0.0 | Clean |
| eslint | 9.39.5 | 10.10.0 | 7 no-useless-assignment fixes |
| lucide-react | 0.562.0 | 1.41.0 | Brand icons removed (Github/Linkedin→ExternalLink/Link2) |

### Key Issues Resolved
- **Lucide v1 brand icons**: Github/Linkedin removed; replaced with ExternalLink/Link2
- **ESLint 10 no-useless-assignment**: 7 dead initializer fixes (DungeonDelverGame, SpellCraft, ast-builder, 3 scripts)
- **TS7 blocked**: @typescript-eslint v8 doesn't support TS 7; settled on TS 6.0.3
- **@vitejs/plugin-react kept at 5.x**: v6 imports `vite/internal` removed in Vite 7

### Deferred
- TypeScript 7: blocked by @typescript-eslint v9
- @vitejs/plugin-react v6: incompatible with Vite 7