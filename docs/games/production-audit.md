# GameHub — Production Audit & Remaining Tasks

**Audit Date**: 2026-08-22
**Scope**: All 19 games, engine layers, assets, infrastructure
**Method**: File-by-file audit against production-ready criteria

---

## Executive Summary

GameHub is **85% production-ready**. Three point-and-click games are functionally complete with procedural audio, atmospheric backgrounds, save/load, and bilingual support. 16 arcade/board/puzzle games are stable. The primary remaining work is asset enrichment, dialogue system polish, infrastructure consolidation, and testing.

---

## Detailed Gap Analysis

### 1. DIALOGUE SYSTEM — ENHANCED ✅

| Gap | Status | Detail |
|-----|--------|--------|
| Typewriter animation | ✅ DONE | `DialogueBox.tsx` rewritten with character-by-character reveal |
| Character portraits | ✅ DONE | Left/right portrait with image or emoji fallback |
| Guard evaluation in UI | ✅ DONE | Locked choices shown greyed out with 🔒 icon |
| Click-to-skip typing | ✅ DONE | Click during typing completes text instantly |
| Continue indicator | ✅ DONE | Animated "Click to continue ▾" after typing completes |
| `DialogSystem.ts` (Canvas) | ⚠️ UNUSED | Canvas-based dialogue renderer exists but no game uses Canvas rendering mode |
| `DialoguePlugin.ts` | ⚠️ UNUSED | Plugin system not wired into any game |

**Recommendation**: Wire `DialogSystem` to toymaker-escape's E2_SHADOW canvas scene. Add `DialoguePlugin` as an optional engine plugin.

---

### 2. GAME ASSETS

#### 2.1 Game Cards (SVG)

| Game | Card | Quality |
|------|------|---------|
| All 18 existing games | ✅ Present | Simple but functional |
| **spell-craft** | ✅ CREATED | Rune circle design, gradient background |

#### 2.2 Scene Backgrounds (SVG)

| Scene Type | File | Status |
|------------|------|--------|
| Workshop (toymaker E1) | `scenes/workshop-scene.svg` | ✅ CREATED — shelves, workbench, hanging lamp, window, toys |
| Office (toymaker E2) | `scenes/office-scene.svg` | ✅ CREATED — bookshelves, desk, filing cabinets, clock, coded letter |
| Apartment (toymaker E3) | `scenes/apartment-scene.svg` | ✅ CREATED — wallpaper, couch, coffee table, framed photos, rug |
| Space (sysdisc) | `scenes/space-scene.svg` | ⬜ PENDING |
| Ocean (sysdisc) | `scenes/ocean-scene.svg` | ⬜ PENDING |
| Body (sysdisc) | `scenes/body-scene.svg` | ⬜ PENDING |
| Home (rite-of-discovery) | `scenes/home-scene.svg` | ⬜ PENDING |
| Thinking Tools (rod) | `scenes/thinking-scene.svg` | ⬜ PENDING |

#### 2.3 Sound Assets

| Type | Status |
|------|--------|
| `ProceduralAudio` class | ✅ DONE — 5 SFX + 8 ambient types |
| Real mp3/ogg files | ⬜ NONE — all sounds are synthesized, no files needed |
| `useSceneAudio` hook | ✅ DONE — deployed in all 3 games |
| `useSoundEffects` hook | ✅ DONE — typed play functions |

#### 2.4 Character/Item Sprites

| Asset | Status |
|-------|--------|
| Character portraits | ⬜ NONE — emoji fallbacks used |
| Inventory item icons | ⬜ NONE — text-only |
| Object interaction sprites | ⬜ NONE |
| Achievement badge icons | ⬜ NONE |

**Recommendation**: Generate simple SVG sprites for key characters (Toymaker, Child, Parent) and inventory items (gears, keys, letters, puzzle pieces).

---

### 3. POINT-AND-CLICK ENGINE CAPABILITIES

| Capability | Status | Usage |
|------------|--------|-------|
| `SceneController` | ✅ Active | Used by systems-discovery |
| Manual scene routing | ✅ Active | Used by toymaker-escape, rite-of-discovery |
| `ProceduralAudio` | ✅ Active | Deployed in all 3 games |
| `SceneBackground` | ✅ Active | Deployed in all 3 games |
| `MatchingPuzzle` | ✅ Active | Available, used in sysdisc variants |
| `DialogueBox` (enhanced) | ✅ Active | Used by toymaker, rite-of-discovery |
| `InventoryBar` | ✅ Active | Used by toymaker, rite-of-discovery |
| `PostGameCTA` | ✅ CREATED | Ready to wire into game endings |
| `Persistence` (save/load) | ✅ Active | Versioned saves in all 3 games |
| `Puzzle systems` (7 types) | ✅ Active | Pipes, gears, keypad, sequence, wires, anagram, cipher |
| `AnimationManager` | ⚠️ Unused | Full sprite animation system unused |
| `AssetManager` | ⚠️ Unused | Image/audio/json/spritesheet loader unused |
| `Character` entity | ⚠️ Unused | x/y position, sprite, interaction radius |
| `GameObject` entity | ⚠️ Unused | Base entity with render/update/onclick |
| `Hotspot` entity | ⚠️ Unused | Clickable region with hover states |
| `Item` entity | ⚠️ Unused | Inventory item with use/combine/examine |
| `AchievementPlugin` | ⚠️ Unused | Unlock tracking plugin |
| `DialogSystem` (Canvas) | ⚠️ Unused | Canvas-rendered typewriter dialogue |
| `MenuSystem` | ⚠️ Unused | In-game menu framework |
| `EventSystem` | ⚠️ Unused | Pub/sub event bus |
| `InputSequenceDetector` | ⚠️ Unused | Combo detection |

**Assessment**: The engine has significant unused capabilities. Hotspot/Item/Character entities would enable proper point-and-click mechanics (clickable objects in scenes). Current games bypass these in favor of inline React rendering.

---

### 4. REMAINING PHASE TASKS

#### Phase 2 — Point-and-Click (1 remaining)

| # | Task | Priority | Status |
|---|---|---|---|
| 2.2 | Extract toymaker puzzle blocks → components | 🔴 CRITICAL | 📋 6 blocks: FilingPuzzle (103L), ShadowPuzzle (98L), LocksPuzzle (52L), BrokenToysPuzzle (103L), ToymakerReveal (24L), FinalEscapePuzzle (59L) |
| 2.5 | Wire `PostGameCTA` to all 3 game endings | 🟢 MEDIUM | 📋 Component created, needs integration |

#### Phase 3 — New Games (deferred)

| # | Task | Priority | Status |
|---|---|---|---|
| 3.1-3.4 | 4 new point-and-click games | 🟡 HIGH | 📋 Design only. Too large for this sprint. Deferred. |

#### Phase 4 — Architecture (7 tasks)

| # | Task | Priority | Status |
|---|---|---|---|
| 4.1 | Consolidate i18n — unify Context + pointclick + game JSONs | 🟡 HIGH | 📋 Two systems: `lib/i18n/` (Context-based, 87 keys) + `pointclick-engine/src/lib/i18n.ts` (JSON merge, 15 game namespaces) |
| 4.2 | Refactor `breakout` monolith (2306 lines) → modules | 🟢 MEDIUM | 📋 |
| 4.3 | Clean up unused Firebase/GraphQL/STOMP artifacts | 🟢 MEDIUM | 📋 Mostly done in Phase 1. Check for stragglers. |
| 4.4 | Simplify `packages/game-platform` — remove unused code | 🟢 MEDIUM | 📋 |
| 4.5 | Optimize game loading (lazy, chunked, preload hints) | 🟢 MEDIUM | 📋 |
| 4.6 | Standardize game metadata — add genres, difficulty, play time | 🟢 MEDIUM | 📋 |
| 4.7 | Add game analytics telemetry | 🟢 MEDIUM | 📋 |

#### Phase 5 — Testing (5 tasks)

| # | Task | Priority | Status |
|---|---|---|---|
| 5.1 | Unit tests for all pointclick puzzle types | 🟡 HIGH | 📋 |
| 5.2 | Integration tests for pointclick save/load | 🟢 MEDIUM | 📋 |
| 5.3 | Per-game smoke tests for all 19 games | 🟢 MEDIUM | 📋 |
| 5.4 | Mobile-responsive testing pass | 🟢 MEDIUM | 📋 |
| 5.5 | Accessibility pass | 🟢 MEDIUM | 📋 |

---

### 5. PRODUCTION GAPS BY GAME

#### Systems Discovery
| Gap | Severity |
|-----|----------|
| Scene data is one massive inline array (1826 lines) | MEDIUM |
| `t()` called at module scope — breaks if locale changes | HIGH |
| No space/ocean/body scene background images | MEDIUM |
| No PostGameCTA on WRAP/OUTRO scenes | LOW |
| `HomeostasisMeter` component in game-platform but only used here | LOW |

#### Toymaker Escape
| Gap | Severity |
|-----|----------|
| 6 puzzle blocks inline (439 lines total) — should be components | HIGH |
| 20+ useState hooks in one component | MEDIUM |
| ShadowPuzzle canvas has no touch support | MEDIUM |
| `soundManager` references already removed — procedural audio used | ✅ |
| No PostGameCTA on E3_WRAP | LOW |

#### Rite of Discovery
| Gap | Severity |
|-----|----------|
| LetterMatching puzzle is inline (not using shared MatchingPuzzle) | MEDIUM |
| `t()` called at module scope in scenes | HIGH |
| No character portraits for parent/child scenes | LOW |
| Thinking Tools scenes are basic text — no visuals | MEDIUM |
| No PostGameCTA on OUTRO | LOW |

#### Arcade/Board Games (16 games)
| Gap | Severity |
|-----|----------|
| `breakout` is monolithic (2306 lines) | MEDIUM |
| `snake` page still references removed `publish()` and `connected` vars | LOW |
| No consistent score submission pattern across games | LOW |

---

### 6. IMPLEMENTATION PRIORITY (this sprint)

```
[CRITICAL]
├── 2.2 Extract toymaker puzzle blocks → components
├── Fix t() at module scope in systems-discovery + rite-of-discovery
├── 4.1 i18n consolidation
├── Create remaining scene backgrounds (space, ocean, body, home, thinking)

[HIGH]
├── 2.5 Wire PostGameCTA to all 3 games
├── 4.3 Final dead-code sweep
├── 4.6 Standardize game metadata
├── Create character sprites (Toymaker, Child)

[MEDIUM]
├── 4.2 breakout refactor
├── 4.5 Loading optimization
├── 5.1-5.5 Testing
├── Wire entity system to one game as proof-of-concept

[LOW / DEFERRED]
├── Phase 3: New games (needs dedicated sprint)
├── Canvas DialogSystem integration
├── AchievementPlugin wiring to backend
└── Analytics telemetry
```

---

## Asset Generation Tracker

| Asset | Format | Location | Status |
|-------|--------|----------|--------|
| Workshop scene bg | SVG | `public/images/scenes/workshop-scene.svg` | ✅ |
| Office scene bg | SVG | `public/images/scenes/office-scene.svg` | ✅ |
| Apartment scene bg | SVG | `public/images/scenes/apartment-scene.svg` | ✅ |
| Space scene bg | SVG | `public/images/scenes/space-scene.svg` | ⬜ |
| Ocean scene bg | SVG | `public/images/scenes/ocean-scene.svg` | ⬜ |
| Body scene bg | SVG | `public/images/scenes/body-scene.svg` | ⬜ |
| Home scene bg | SVG | `public/images/scenes/home-scene.svg` | ⬜ |
| Thinking scene bg | SVG | `public/images/scenes/thinking-scene.svg` | ⬜ |
| Spell Craft card | SVG | `public/images/games/spell-craft-card.svg` | ✅ |
| Toymaker character | SVG | `public/images/characters/toymaker.svg` | ⬜ |
| Child character | SVG | `public/images/characters/child.svg` | ⬜ |
| Gear item icon | SVG | `public/images/items/gear.svg` | ⬜ |
| Key item icon | SVG | `public/images/items/key.svg` | ⬜ |
| Letter item icon | SVG | `public/images/items/letter.svg` | ⬜ |
| Puzzle piece icon | SVG | `public/images/items/puzzle-piece.svg` | ⬜ |
| Badge icons (×6) | SVG | `public/images/badges/*.svg` | ⬜ |
| Achievement icons | SVG | `public/images/achievements/*.svg` | ⬜ |