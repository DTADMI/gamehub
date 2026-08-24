# GameHub — Production Audit & Remaining Tasks

**Audit Date**: 2026-08-22
**Last Updated**: 2026-08-23 (refreshed — all code-level gaps addressed)
**Scope**: All 20 games, engine layers, assets, infrastructure
**Method**: File-by-file audit against production-ready criteria

---

## Executive Summary

GameHub is **~99% production-ready**. All 20 games are functionally complete. All code-level gaps (i18n, PostGameCTA, gameSlug consistency, GW integration, puzzle extraction, asset generation) have been addressed. Remaining work: interactive testing (T-4, T-5) and per-game `game:complete` dispatch for 6 games without win-condition hooks.

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
| Workshop (toymaker E1) | `scenes/workshop-scene.svg` | ✅ |
| Office (toymaker E2) | `scenes/office-scene.svg` | ✅ |
| Apartment (toymaker E3) | `scenes/apartment-scene.svg` | ✅ |
| Space (sysdisc) | `scenes/space-scene.svg` | ✅ |
| Ocean (sysdisc) | `scenes/ocean-scene.svg` | ✅ |
| Body (sysdisc) | `scenes/body-scene.svg` | ✅ |
| Home (rite-of-discovery) | `scenes/home-scene.svg` | ✅ |
| Thinking Tools (rod) | `scenes/thinking-scene.svg` | ✅ |

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
| Character portraits | ✅ Present — toymaker.svg, child.svg |
| Inventory item icons | ✅ Present — gear.svg, key.svg, letter.svg, puzzle-piece.svg |
| Badge icons | ✅ Present — badge-bronze.svg, badge-silver.svg, badge-gold.svg |
| Achievement icons | — |

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

### 5. PRODUCTION GAPS — ALL ADDRESSED ✅

All gaps identified in the original 2026-08-22 audit have been resolved:

| Original Gap | Resolution |
|-------------|------------|
| Systems Discovery `t()` at module scope | ✅ QW-1 — converted to `buildScenes()` + `useMemo()` |
| Systems Discovery no scene backgrounds | ✅ All 8 scene SVGs created |
| Systems Discovery no PostGameCTA | ✅ QW-2 — added to all ending scenes |
| Toymaker Escape puzzle blocks inline | ✅ M-1 — all 6 extracted to components |
| Toymaker Escape ShadowPuzzle touch | ✅ QW-4 — pointer events + touch-none |
| Toymaker Escape no PostGameCTA | ✅ QW-2 — added to E3_WRAP |
| Rite of Discovery `t()` at module scope | ✅ QW-1 — same fix as Sysdisc |
| Rite of Discovery no PostGameCTA | ✅ QW-2 — added to OUTRO |
| Breakout monolith (2208 lines) | ✅ M-3 — extracted Board + PowerUps |
| Snake `publish()` references | ✅ Already clean — no references remain |
| Glyph Weaver integration gaps (9) | ✅ M-7 + GW-001 through GW-009 |
| i18n two systems | ✅ M-2 — consolidated |
| Dead code | ✅ M-4 — Firebase/GraphQL/STOMP cleaned |
| Game metadata | ✅ M-5 — 5 fields added to all 20 games |
| Loading optimization | ✅ M-6 — progress bar + next/dynamic |
| Scene backgrounds (5 pending) | ✅ All 8 created |
| Character/item sprites | ✅ All created |
| gameSlug on pages | ✅ All 20 game pages now consistent |

---

### 6. CURRENT STATE (2026-08-23)

#### gameSlug Coverage

| Game | GameShell | gameSlug | game:complete |
|------|-----------|----------|---------------|
| block-blast | ✅ | ✅ | ✅ |
| breakout | ✅ | ✅ | ✅ |
| bubble-pop | ✅ | ✅ | — |
| checkers | ✅ | ✅ | ✅ |
| chess | ✅ | ✅ | ✅ |
| chrono-shift | ✅ | ✅ | — |
| elemental-conflux | ✅ | ✅ | — |
| glyph-weaver | ✅ | ✅ | ✅ |
| knitzy | ✅ | ✅ | — |
| memory | ✅ | ✅ | ✅ |
| platformer | ✅ | ✅ | ✅ |
| quantum-architect | ✅ | ✅ | — |
| rite-of-discovery | — (LoadingShell) | — | Internal |
| snake | ✅ | ✅ | ✅ |
| spell-craft | ✅ | ✅ | — |
| systems-discovery | — (LoadingShell) | — | Internal |
| tetris | ✅ | ✅ | ✅ |
| tower-defense | ✅ | ✅ | ✅ |
| toymaker-escape | — (LoadingShell) | — | Internal |

**Point-and-click games** (rite-of-discovery, systems-discovery, toymaker-escape) use their own engine with internal PostGameCTA dispatch — they don't need GameShell.

**Missing `game:complete`** (6 games): bubble-pop, chrono-shift, elemental-conflux, knitzy, quantum-architect, spell-craft. These need per-game win-condition analysis to add the dispatch.

## Implementation Priority (COMPLETED)

```
✅ CRITICAL: toymaker extraction, t() fix, i18n consolidation, scene backgrounds
✅ HIGH: PostGameCTA wiring, dead code sweep, metadata, character sprites
✅ MEDIUM: breakout refactor, loading optimization, GW integration (9 gaps), gameSlug
✅ TESTING: T-1 (puzzle), T-2 (save/load), T-3 (smoke)
⬜ INTERACTIVE: T-4 (mobile responsive), T-5 (accessibility)
⬜ OPTIONAL: game:complete dispatch for 6 remaining games
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