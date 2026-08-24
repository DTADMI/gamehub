# GameHub Action Plan

**Last Updated**: 2026-08-24
**Current Focus**: Dungeon Delver v0.2 complete — decorator pattern, remaining gaps, asset strategy

Legend: ✅ DONE · 🔨 IN PROGRESS · 📋 NEXT · 📦 BACKLOG

---

## Phase 0: Foundation — Security + Dependencies

| # | Task | Priority | Status |
|---|---|---|---|
| 0.1 | Fix 2 critical CVEs (websocket-driver, next-auth) | 🔴 CRITICAL | ✅ DONE |
| 0.2 | Fix 9 high CVEs | 🔴 CRITICAL | ✅ DONE |
| 0.3 | Update all outdated packages | 🟡 HIGH | ✅ DONE |
| 0.4 | Pin all deps, run full ci:local | 🟡 HIGH | ✅ DONE |

## Phase 1: Platform Purity — Remove Portfolio

| # | Task | Priority | Status |
|---|---|---|---|
| 1.1–1.9 | Remove all portfolio traces | 🟡 HIGH | ✅ DONE |

## Phase 2: Point-and-Click — Refactor & Complete

| # | Task | Priority | Status |
|---|---|---|---|
| 2.1 | Refactor `systems-discovery` | 🔴 CRITICAL | ✅ DONE |
| 2.2 | Refactor `toymaker-escape` | 🔴 CRITICAL | 📋 |
| 2.3 | Complete `rite-of-discovery` | 🟡 HIGH | ✅ DONE |
| 2.4 | Enhance `pointclick-engine` | 🟡 HIGH | ✅ DONE |
| 2.5 | PostGameCTA integration | 🟢 MEDIUM | ✅ DONE |
| 2.6 | Save/load for pointclick games | 🟢 MEDIUM | ✅ DONE |
| 2.7 | Achievement system | 🟢 MEDIUM | ✅ DONE |

## Phase 3: New Games

| # | Task | Priority | Status |
|---|---|---|---|
| 3.1 | `escape-room` | 🟡 HIGH | ✅ DONE |
| 3.2 | `mystery-manor` | 🟡 HIGH | 📋 |
| 3.3 | `artifact-hunter` | 🟢 MEDIUM | 📋 |
| 3.4 | `clockwork-conspiracy` | 🟢 MEDIUM | 📋 |
| 3.5 | `dungeon-delver` rogue-lite | 🟡 HIGH | ✅ DONE — v0.2 |

## Phase 4: Architecture

| # | Task | Priority | Status |
|---|---|---|---|
| 4.1 | Consolidate i18n | 🟡 HIGH | 📋 |
| 4.2 | Refactor `breakout` | 🟢 MEDIUM | 📋 |
| 4.3 | Clean up Firebase/GraphQL artifacts | 🟢 MEDIUM | 📋 |
| 4.4 | Simplify `game-platform` | 🟢 MEDIUM | 📋 |
| 4.5 | Optimize game loading | 🟢 MEDIUM | 📋 |
| 4.6 | Standardize game metadata | 🟢 MEDIUM | 📋 |
| 4.7 | Game analytics telemetry | 🟢 MEDIUM | 📋 |

## Phase 5: Testing & Polish

| # | Task | Priority | Status |
|---|---|---|---|
| 5.1 | Unit tests for pointclick puzzles | 🟡 HIGH | 📋 |
| 5.2 | Integration tests for save/load | 🟢 MEDIUM | 📋 |
| 5.3 | Per-game smoke tests (now 21 games) | 🟢 MEDIUM | 📋 |
| 5.4 | Mobile-responsive testing pass | 🟢 MEDIUM | 📋 |
| 5.5 | Accessibility pass | 🟢 MEDIUM | 📋 |

---

## Phase 6: Dungeon Delver — Remaining Tasks (NEW)

| # | Task | Priority | Effort | Status |
|---|---|---|---|---|
| 6.1 | ✅ **Decorator pattern** refactored — `BaseCharacter → Race → Class → Title → Equipment → Buff` composable chain | 🟡 HIGH | 2h | ✅ DONE — `src/decorators.ts` + `src/types.ts` |
| 6.2 | PostGameCTA + `game:complete` dispatch on death | 🟡 HIGH | 1h | 📋 |
| 6.3 | Feature flag `games.dungeonDelver` in `lib/feature-flags.ts` | 🟡 HIGH | 30m | 📋 |
| 6.4 | Sound mute toggle in dungeon HUD | 🟢 MEDIUM | 30m | 📋 |
| 6.5 | Leaderboard integration (submit deepest floor on death) | 🟡 HIGH | 2h | 📋 |
| 6.6 | Unit tests for decorators, particles, audio, game logic | 🟡 HIGH | 3h | 📋 |
| 6.7 | E2E smoke test (start game → move → attack → die → check titles) | 🟢 MEDIUM | 1h | 📋 |
| 6.8 | Perk/skill tree — level-up choices (3 options per level) | 🟢 MEDIUM | 3h | 📦 |
| 6.9 | Merchant shop between floors (spend gold for items) | 🟢 MEDIUM | 2h | 📦 |
| 6.10 | Equipment set bonuses (2+ items of same set = bonus) | 🟢 MEDIUM | 2h | 📦 |
| 6.11 | Daily challenge mode (seeded run, shared leaderboard) | 🟢 MEDIUM | 3h | 📦 |
| 6.12 | Character sprite assets — replace emoji with pixel art or generated sprites | 🟢 MEDIUM | 4h | 📦 |
| 6.13 | Map reveal animation (fog of war) | 🟢 MEDIUM | 2h | 📦 |
| 6.14 | More monster types + elemental interactions | 🟢 MEDIUM | 2h | 📦 |
| 6.15 | Achievements system (platform-integrated) | 🟢 MEDIUM | 2h | 📦 |

## Game Inventory

| Game | Type | Engine | Lines | Status |
|---|---|---|---|---|
| systems-discovery | Point & Click | pointclick-engine | 2045 | Needs refactor |
| toymaker-escape | Point & Click | pointclick-engine | 1971 | Needs refactor |
| breakout | Arcade | Canvas/PixiJS | 2306 | Needs refactor |
| dungeon-delver | Arcade/Roguelike | Canvas | 1178 | ✅ v0.2 — 7 races, 5 classes, decorator pattern, procedural audio, particles, boss floors, room-based gen, rarity, save/load, touch, keyboard, a11y |
| chrono-shift | Puzzle | Canvas | 1556 | Stable |
| elemental-conflux | Puzzle | Canvas | 1547 | Stable |
| snake | Arcade | Canvas | 1339 | Stable |
| quantum-architect | Puzzle/3D | Three.js | 1108 | Stable |
| chess | Board | React | 1094 | Stable |
| tower-defense | Strategy | Canvas | 1065 | Stable |
| platformer | Arcade | Canvas | 982 | Stable |
| block-blast | Puzzle | Canvas | 908 | Stable |
| tetris | Arcade | Canvas | 866 | Stable |
| rite-of-discovery | Point & Click | pointclick-engine | 761 | Needs completion |
| pattern-matching | Puzzle | React | 603 | Stable |
| spell-craft | Puzzle | React | 557 | Stable |
| memory | Casual | React | 519 | Stable |
| knitzy | Puzzle | React | 512 | Stable |
| bubble-pop | Arcade | Canvas | 395 | Stable |
| checkers | Board | React | 299 | Stable |
| escape-room | Point & Click | pointclick-engine | 350+ | Stable |
| mystery-manor | Point & Click | pointclick-engine | — | 📋 Scaffold only |
| artifact-hunter | Point & Click | pointclick-engine | — | 📋 Scaffold only |
| clockwork-conspiracy | Point & Click | pointclick-engine | — | 📋 Scaffold only |
| glyph-weaver | Creative | WebGL | — | Active |

## Execution Order

```
Phase 0 (Security) → Phase 1 (Portfolio removal) → Phase 2 (Point-and-click refactor)
→ Phase 3 (New games) → Phase 4 (Architecture) → Phase 5 (Testing) → Phase 6 (Dungeon Delver polish)
```

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