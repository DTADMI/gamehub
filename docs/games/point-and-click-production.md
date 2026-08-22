# Point-and-Click Games — Production Reference

**Owner**: Nebula Forge GameHub Team
**Last Updated**: 2026-08-22

## Overview

GameHub ships three point-and-click narrative games powered by `@gamehub/pointclick-engine`. Each game uses procedural Web Audio API sound synthesis — no external audio files needed. Scene atmospheres are rendered with CSS gradients and subtle animations.

---

## Architecture

```
gamehub/
├── packages/
│   ├── pointclick-engine/      # Shared engine
│   │   └── src/
│   │       ├── audio/          # ProceduralAudio, useSceneAudio, useSoundEffects
│   │       ├── core/           # Engine, Persistence, SceneManager, etc.
│   │       ├── entities/       # Character, GameObject, Hotspot, Item
│   │       ├── puzzles/        # anagram, cipher, gears, keypad, pipes, sequence, wires
│   │       ├── react/          # SceneController, SceneBackground, MatchingPuzzle, DialogueBox, InventoryBar
│   │       ├── plugins/        # AchievementPlugin, DialoguePlugin, InventoryPlugin
│   │       └── ui/             # DialogSystem, InventoryUI, MenuSystem
│   │
│   └── games/
│       ├── systems-discovery/  # 7 topic packs, 28 scenes, 3 puzzle types
│       ├── toymaker-escape/    # 3 episodes, 15+ scenes, 8 puzzle types
│       └── rite-of-discovery/  # 7 narrative scenes, 6 Thinking Tools, 2 puzzle types
│
├── app/games/
│   ├── systems-discovery/page.tsx
│   ├── toymaker-escape/page.tsx
│   └── rite-of-discovery/page.tsx
│
└── public/images/
    ├── bg-systems-discovery.svg
    ├── bg-toymaker-escape.svg
    └── bg-pastel-pattern.svg
```

---

## Systems Discovery

**Theme**: Interactive science education through exploration.

### Game Structure

| Pack | Scenes | Puzzle Types | Domain |
|------|--------|-------------|--------|
| Intro/Hub | SD_INTRO, B1, B2, B3, WRAP, SD_OUTRO | Choice-based navigation | Overview |
| Breath (Body) | SD_BOD_BREATH_INTRO, BB1, BB2, BB3, BOD_BREATH_WRAP | Pipes flow (BreathPuzzle) | Respiratory system |
| Fuel (Body) | SD_BOD_FUEL_INTRO, BF1, BF2, BF3, BOD_FUEL_WRAP | Food→nutrient matching (FuelMatchingPuzzle) | Nutrition |
| Move (Body) | SD_BOD_MOVE_INTRO, BM1, BM2, BM3, BOD_MOVE_WRAP | Sequence puzzle | Muscular/skeletal |
| Signal (Body) | SD_BOD_SIGNAL_INTRO, BSD1, BSD2, BSD3, BOD_SIGNAL_WRAP | Signal matching | Nervous system |
| Grow (Body) | SD_BOD_GROW_INTRO, BG1, BG2, BG3, BOD_GROW_WRAP | Pipes + sequence | Cell biology |
| Space | SD_SPACE_INTRO, S1, S2, S3, SPACE_WRAP, SD_SPACE_OUTRO | OrbitsPuzzle (pipes-based planetary alignment) | Astronomy |
| Ocean | SD_OCEAN_INTRO, O1, O2, O3, OCEAN_WRAP, SD_OCEAN_OUTRO | Creature→zone matching, multi-valve pipes | Marine biology |

### Technical Details

- **Component**: `SystemsDiscoveryGame` → `SceneController` → 28 scenes
- **Save key**: `sysdisc:save:v1`
- **Puzzle components** (extracted): `BreathPuzzle`, `FuelMatchingPuzzle`, `OrbitsPuzzle`
- **URL packs**: `?pack=breath|fuel|move|signal|grow|space|ocean`
- **Audio**: `body` ambient (heartbeat pulse), `space` (deep drone + filter sweep), `ocean` (wave-like modulation), `thinking` (neutral pad)
- **Backgrounds**: CSS gradients per domain — warm red for body, deep space radial, ocean blue linear

### Bilingual Support

All strings use `t("sysdisc.xxx.yyy")` from `lib/i18n/translations/`. Complete EN/FR coverage.

---

## Toymaker Escape

**Theme**: 3-episode escape-room mystery in a toymaker's atelier.

### Episode Map

| Episode | Scenes | Puzzles | Setting |
|---------|--------|---------|---------|
| Intro | INTRO | — | Workshop — dim ambient |
| E1 — Gears | E1_GEAR, E1_WRAP | Gears alignment, ScuffLatch (long-press discovery), basic pipes | Workshop |
| E2 — The Office | E2_INTRO, E2_GEARWALL, E2_CIPHER, E2_FILING, E2_BROKEN_TOYS, E2_SHADOW, E2_WRAP | Gear wall, cipher, filing logic, broken toy matching, shadow shape alignment | Office — quiet, clock-ticking atmosphere |
| E3 — The Apartment | E3_INTRO, E3_PHOTO_MATCH, E3_LOCKS, E3_FINAL_ESCAPE, E3_TOYMAKER_REVEAL, E3_WRAP | Photo matching, sequence locks, final escape dials, toymaker reveal | Apartment — mysterious, rosy-warm tones |

### Puzzle Types

| Puzzle | Engine Module | Description |
|--------|-------------|------------|
| Gears | `puzzles/gears` | Align gear teeth ratios to transmit power |
| Cipher | `puzzles/cipher` | Caesar shift cipher (A→X, B→Y...) |
| Filing Logic | Inline matching | Sort toys into A/B/C cabinets |
| Broken Toys | Inline matching | Match broken toys to their missing pieces |
| Shadow Alignment | Canvas-based, inline | Drag 3 shapes into target outline zone |
| Pipes | `puzzles/pipes` | Rotate tiles + toggle valves for source→sink flow |
| Sequence | `puzzles/sequence` | Press colored buttons in correct order |
| Keypad | `puzzles/keypad` | PIN entry with clear/submit |
| Anagram | `puzzles/anagram` | Unscramble letters |
| Wires | `puzzles/wires` | Match wire connections without crossing |
| Final Escape | Sequence variant | Dial turn sequence (left/left/right) |
| Photo Match | Matching variant | Match childhood objects to their pairs |

### Save System

- `TmeSaveV1` schema with versioned persistence
- Auto-saves on `sceneId` or `ctx` change (debounced — only writes on actual change)
- Medal system: bronze/silver/gold per episode based on hints used

### Technical Details

- **Component**: `ToymakerEscapeGame` → manual scene routing (not SceneController)
- **Save key**: `tme:save:v1`
- **Audio**: `workshop` (warm A2 hum), `office` (quiet D3 pad), `apartment` (neutral G3)
- **Backgrounds**: CSS gradients — warm brown workshop, deep indigo office, rosy-mauve apartment
- **Canvas puzzle**: E2_SHADOW uses a canvas-based drag-and-drop shape alignment system
- **State**: 20+ useState hooks managing all puzzle states independently

---

## Rite of Discovery

**Theme**: A child discovers the truth behind family magic traditions.

### Narrative Arc

| Scene | Content | Puzzle |
|-------|---------|--------|
| INTRO | Introduction — "Something doesn't add up" | — |
| S1_NIGHT_BEFORE | Gift tags don't match handwriting | Sequence: assemble star→heart→bell tags |
| S2_TOOTH_TRADITION | Compare "Tooth Fairy" note vs parent's note | Letter matching: match lowercase→uppercase (a→A, b→B...) |
| S3_PROOF_MOMENT | Receipt + gift bag evidence — confront or wait? | Choice-based branching |
| EPILOGUE | Parents reveal the tradition | Branch-dependent outcome |
| OUTRO | Conclusion, replays, NG+, Thinking Tools | Navigation hub |
| TT_INTRO → TT6_SAMPLE | 6 Thinking Tools (cognitive biases) | Multiple-choice reasoning |

### Thinking Tools

1. **TT1_COUPON** — Anchoring bias (misleading discount)
2. **TT2_ECHO** — Confirmation bias (echo chamber)
3. **TT3_COIN** — Gambler's fallacy (independent events)
4. **TT4_MIRACLE** — Post hoc fallacy
5. **TT5_POSTER** — Authority bias
6. **TT6_SAMPLE** — Base rate neglect

### Technical Details

- **Component**: `RiteOfDiscoveryGame` → GameContainer + DialogueBox + InventoryBar
- **Save key**: `rod:save:v1` (from `SAVE_KEYS.rod`)
- **Audio**: `home` (warm C4 pad) for narrative, `thinking` (A3 triangle) for Thinking Tools
- **Backgrounds**: warm home gradient, deep thinking blue
- **Gentle mode**: Available via flags — shows extra hints and reassurance text
- **NG+ mode**: `ngplus.mentor` flag — adds mentor guidance text

---

## Engine Capabilities

### Used by All Games
- `SceneController` / manual scene routing
- `SceneBackground` + `SceneCard` (CSS atmospheric backgrounds)
- `ProceduralAudio` + `useSceneAudio` + `useSoundEffects` (Web Audio API synthesis)
- `Persistence` (save/load/versioned)
- `engine.ts` (nextScene, effects, ensureCtx, detectLang)
- `DialogueBox` + `InventoryBar` (React components)
- `MatchingPuzzle` (shared match-left→right component)

### Available but Not Yet Used
- `AnimationManager` — sprite-based animation system
- `AssetManager` — image/audio/json/spritesheet/font loading
- `Character`, `GameObject`, `Hotspot`, `Item` — entity models
- `AchievementPlugin` — unlock tracking
- `DialogSystem` — advanced branching dialogue (beyond simple choices)
- `MenuSystem` — in-game menus
- `EventSystem` — pub/sub event bus
- `InputSequenceDetector` — combo/key-sequence detection

---

## Asset Generation

All three games use **zero external audio files**. Sound is generated procedurally via Web Audio API:

- **SFX**: click, solve, reveal, error, collect — synthesized oscillator envelopes
- **Ambient**: Domain-specific drones with LFO modulation matching scene atmosphere
- **Volume**: Controllable via Gentle Mode toggle in SceneController

Scene backgrounds use CSS gradients with subtle GPU-composited animations:
- `@keyframes workshopShimmer` — warm brown background-position shift
- `@keyframes spaceDrift` — deep-space radial gradient pan
- `@keyframes oceanWaves` — vertical background-position undulation
- `@keyframes bodyPulse` — subtle scale heartbeat
- `@keyframes homeWarm` — brightness/saturation gentle oscillation

Card images are SVGs in `public/images/games/`.

---

## Testing

### Manual Smoke Test Checklist

1. **Load each game page** — no errors in console
2. **Navigate through intro scenes** — choices work, scene transitions smooth
3. **Solve each puzzle type** — onSolved fires correctly, flags set
4. **Test gentle mode toggle** — hints appear, volume changes
5. **Switch language (EN↔FR)** — all text updates
6. **Reload mid-game** — save state persists, resumes at correct scene
7. **Test save/load** — localStorage contains valid JSON
8. **Complete each game** — epilogue/outro scenes accessible

### Known Limitations

- ToymakerEscape puzzle blocks are still inline (not extracted to separate components)
- ShadowPuzzle canvas is basic — no touch support, no drag handles
- No accessibility mode beyond Gentle Mode (no screen reader optimizations)
- Achievements tracked in state but not persisted to backend
- No analytics telemetry for puzzle completion rates

---

## Roadmap

| Priority | Task | Estimate |
|----------|------|----------|
| HIGH | Extract toymaker puzzle blocks into components | 2h |
| HIGH | Add TouchEvent support to ShadowPuzzle canvas | 1h |
| MEDIUM | Wire achievements to backend persistence | 2h |
| MEDIUM | Add analytics events for puzzle solves | 1h |
| LOW | Migrate toymaker-escape to SceneController | 3h |
| LOW | Use entity models (GameObject, Hotspot, Item) for scene data | 2h |