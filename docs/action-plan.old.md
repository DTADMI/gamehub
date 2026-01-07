# GameHub Action Plan

Legend: ✅ Completed • 🟡 In Progress • 🔜 Next • 🗂️ Backlog

## Project Overview

GameHub is a Next.js 16 frontend application where users can play web games and browse projects. This repository
is transitioning to a monorepo with a dedicated TypeScript Node.js backend.

---

## Sprint Plan — Dec 2025 (at‑a‑glance)

### ✅ Completed

- Snake: Swipe default with prevent‑scroll; optional Joystick/D‑pad and Taps; pause/resume overlay; HUD
  spacing/typography and color/contrast improvements.
- Memory: On match, cards spin+fade, then become inert placeholders to preserve grid; stable layout verified by E2E.
- E2E: Breakout particles smoke; Systems Discovery BOD smoke; mobile coverage on Pixel 5 and iPhone 12 for Snake.
- Settings/Profiles scaffolding: localStorage‑backed `ProfileProvider`; Settings page with Music/SFX/Particles/Reduced
  Motion.
- Docs: README controls quick‑ref and accessibility guardrails; credits file present with Kenney SFX attribution.

### 🟡 In Progress

- CI health: Monitor the next scheduled CI run on `main` and keep the pipeline green.
- Tests: Maintain mobile Snake spec parity and Memory animation unit test stability.
- Narrative engine fusion: keep canvas `core/*` as primary and integrate `EngineCtx`+`guards/effects`, puzzle primitives
  and React a11y UI (DialogueBox, InventoryBar). Implement first keypad puzzle and wire TME E1.

— — —

## Execution Plan — Proceeding Now (per approval)

Legend: ✅ Completed • 🟡 In Progress • 🔜 Next • 🗂️ Backlog

## Monolith Integration & Factorization (Priority)

- ✅ Centralize Metadata (Games and Projects) in `packages/shared`
- ✅ Maintain only ONE database (Prisma in `apps/api`)
- ✅ Merge all project schemas into the unified `apps/api` schema
- ✅ Delete redundant backends/databases in individual project packages
- 🟡 Factorize and update dependencies to `@latest` (using `pnpm`)
- 🟡 Implement centralized Admin Controls (Feature Flags, User Access, Visibility)
- 🟡 Unify and clean up documentation (READMEs, Action Plans)
- 🔜 Ensure workspace-wide build, lint, and test stability
- 🔜 Fix all errors and warnings across the monorepo

## Engine improvements (mobile‑first authoring)

- ✅ Keep `libs/shared/src/pointclick/core/*` as primary runtime
- ✅ Helpers: `EngineCtx`, `guards/effects`, save/load/migrate
- ✅ Puzzle primitives shipped: `keypad`, `sequence`, `wires` (+ unit tests)
- 🟡 Integrate `InputSequenceDetector` with `core/InputManager` gesture macros
- 🔜 Scene services: timers, cutscene runner, per‑scene blackboard
- 🔜 Versioned save migrations: `rod:save:v1`, `tme:save:v1`, `sysdisc:save:v1`

2) New puzzle primitives & wrappers

- 🟡 Gears ratio mesh (logic + UI wrapper, ≥44px targets)
- 🔜 Pipes/Flow (network satisfaction)
- 🔜 Sorter (tap/drag categories; reduced‑motion path)

3) Game delivery

- TME (Episode 1)
    - ✅ Keypad gate integrated; inventory award, medal flag
    - 🟡 Implement Gears mini and integrate into scene flow
    - 🔜 Implement Sorter mini; add EN/FR copy polish; captions a11y sweep
    - 🔜 Save migration and unit tests for guards/effects
- ROD
    - 🟡 Keypad + Wires gates; guarded choices, inventory (0–3)
    - 🔜 EN/FR copy; captions; accessibility sweep
    - 🔜 Local save + migration; progression tests
- SD (Core + Body Systems: Breath, Fuel, Move, Signal, Grow)
    - 🟡 Core + Breath playable with smokes (existing BOD Breath smoke retained)
    - 🔜 Fuel/Move/Signal/Grow simple educational puzzles using primitives
    - 🔜 Local saves, badges per pack

    6) Monorepo Transition (Architecture Upgrade)

    - ✅ Initialize `pnpm-workspace.yaml` and formalize workspaces
    - ✅ Migrate `libs/shared` to `packages/shared`
  - ✅ Scaffold `apps/api` (NestJS/TypeScript Node.js server)
    - 🔜 Setup Turborepo for optimized builds/tasks
  - 🔜 Implement Core Backend Features (Health, Meta, Auth Scaffolding)
    - 🗂️ Integrate Prisma/Drizzle ORM with PostgreSQL
  - 🗂️ Game Metadata API and Score Service

    7) New Games Pipeline (from Roadmap)

    - ✅ ChronoShift Labyrinth: Scaffolded (upcoming)
    - ✅ Elemental Conflux: Scaffolded (upcoming)
    - ✅ Quantum Architect: Scaffolded (upcoming)
    - 🔜 Engine: Implement `TimePlugin` for ChronoShift
    - 🔜 Engine: Implement `MultiCharacterPlugin` for Elemental Conflux
    - 🔜 Engine: Implement `ObserverPlugin` for Quantum Architect

4) Tests & CI

- ✅ Unit: keypad/sequence/wires
- 🟡 Add unit: gears; scene progression tests for TME/ROD/SD
- 🟡 Playwright E2E smokes per title (desktop + mobile Pixel 5/iPhone 12)

5) Docs & Assets

- ✅ README: engine architecture + keypad/sequence/wires usage examples
- 🟡 Add `/docs/narrative/scene-puzzles.md` (designer handoff briefs) and update per title
- 🟡 Update `public/credits.md` as placeholder art/SFX are added

Tracking note: I will mark each sub‑item above as completed as I land code, and keep this section at the top for quick
status.

---

### 🟡 New — Execution Plan for this Issue (Engine improvements + Finish ROD, TME, SD)

Legend: ✅ Completed • 🟡 In Progress • 🔜 Next • 🗂️ Backlog

- ✅ Architecture decision: Use `libs/shared/src/pointclick/core/*` as the primary runtime; fuse declarative helpers from
  `pointclick/engine.ts` (EngineCtx, guards/effects), React a11y UI, and puzzle primitives.
- ✅ Implemented helpers/UI: `EngineCtx`, `guards/effects`, `DialogueBox`, `InventoryBar`.
- ✅ Puzzle primitive shipped: `keypad` (+ unit test scaffold).
- ✅ TME: integrated keypad gate in E1; local save `tme:save:v1`.

- ✅ Engine improvements to implement now (mobile‑first, complex puzzles):
    - ✅ InputSequenceDetector integration with `InputManager` for gesture macros (tap patterns, hold‑then‑drag). ✓
    - ✅ Scene Services (API + unit tests): timers (pausable), cutscene runner, and a tiny per‑scene blackboard with
      typed hooks. ✓
    - ✅ Additional puzzle primitives (pure logic + light UI wrappers): ✓
        - ✅ sequence/simon (logic, hint playback, strict mode) ✓
        - ✅ wires/connectors (no crossings, target mapping, helpers) ✓
        - ✅ gears ratio mesh (ratio evaluator, target match, tolerances) ✓
        - ✅ pipes/flow (grid pathing, leaks, goal constraints) ✓
    - ✅ Persistence helpers: versioned save helpers + migration stubs for `rod:save:v1`, `tme:save:v1`,
      `sysdisc:save:v1`. ✓

- ✅ Game implementation (parallel TME → ROD → SD):
    - TME (Episode 1)
        - ✅ Gears mesh mini + medals; inventory use on hotspot ✓
        - ✅ Sorter mini (tap/drag) with reduced‑motion path ✓
        - ✅ EN/FR final copy pass; captions and a11y review ✓
    - ROD
        - ✅ Keypad door + wires/connectors puzzle; guarded choices with flags ✓
        - ✅ EN/FR strings, inventory 0–3, captions region, reduced‑motion ✓
    - SD (Core + Body Systems: Breath, Fuel, Move, Signal, Grow)
        - ✅ Implement simple educational variants using primitives (e.g. Pipes for Breath); EN/FR copy ✓
        - ✅ Local saves, badges per pack ✓

- ✅ Tests & CI
    - ✅ Unit tests for each puzzle primitive (keypad, sequence, wires, gears, pipes). ✓
    - ✅ Scene graph/progression unit tests (guards/effects) and Scene Services tests (timers/cutscene/blackboard). ✓
    - ✅ Playwright E2E smokes per title path (one golden path each: ROD, TME, SD). ✓

- ✅ Docs & Assets
    - ✅ README — engine overview and examples (expand with Scene Services + primitives usage). ✓
    - ✅ docs/ — per‑game scene & puzzle briefs with steps/hints/assets (TME E1 updated with filenames). ✓
    - ✅ Narrative puzzle cleverness pass (observation, environmental clues) — focus TME E1 first ✓ plan approved ✓
    - ✅ Add designer briefs for TME E1 (scenes, objects, props, audio, VFX) with asset lists + filenames (EN/FR). ✓
    - [ ] public/credits.md — add placeholder asset credits as needed

- ✅ Localization & Settings
    - ✅ EN/FR flat JSON per title; tiny i18n helper with persistence in localStorage. ✓
    - ✅ Language switch in header with persistence; in-game header toggle; E2E smoke added. ✓

Notes: Frontend‑only MVPs; EN/FR localization; accessibility guardrails; mobile‑first ≥44px targets; local saves.

### 🔜 Next (Narrative Games — ROD, TME, SD)

- TME, ROD, SD (frontend-only MVPs): finalize scenes, hotspots, dialogue, puzzles; EN/FR; accessibility + mobile UX;
  local saves.
- Shared engine/i18n/assets: extract common point-and-click primitives, localization scaffolding, and placeholder
  assets.

---

## TME Episode 1 — Clever Puzzles Plan (approved)

Scope: Apply environmental/diegetic clues and multi-step reasoning to Toymaker Escape E1, leveraging keypad, gears,
wires, pipes, and gesture macros. Maintain a11y parity and reduced-motion.

### Targets

- Keypad: remove inline code from UI; move clues into decor and captions.
- Gears: ratio inferred via environment; tolerate small error; confirm via subtle SFX.
- Wires: enforce no-crossing; pairing hinted via poster and lighting order.
- Pipes: fix leaks; diegetic hissing/decals guide; reduced-motion highlight.
- Hidden latch: require long-press→drag macro.
- Persistence: persist clues and solves in `tme:save:v1`.

### Implementation tasks

- [x] Update TME E1 scene data to remove overt keypad hint and add decor-based clues. ✓
- [x] Implement wires/connectors logic integration in TME E1 scene. ✓
- [x] Implement pipes/flow logic and minimal UI wrapper; add reduced-motion path (static highlight/text). ✓
- [x] Extend gears mini with tolerance + decor hint states. ✓
- [x] Register input macro `holdThenDrag` to reveal hidden latch hotspot; update blackboard flags. ✓
- [x] Persist discovered clues/solves in `tme:save:v1`. ✓
- [x] Unit tests: sequence, wires, gears, pipes; scene progression for TME E1 (logic units added for pipes; others
  present). ✓
- [x] Playwright smoke (desktop + Pixel 5) golden path solving at least one optional hint (added ROD and SD smokes too).
  ✓
- [x] Docs: README section "Designing clever puzzles" and `docs/narrative/scene-puzzles.md` with TME E1 briefs. ✓

### Designer brief — assets & scene description (summary)

- Rooms: Workshop (entry), Shelf Nook, Workbench, Cabinet Wall.
- Key props: Toy shelf (4 sizes/colors), faded ratio plate ("3:1"), wiring board with colored jacks, pipe grid panel
  with valve, scuffed cabinet edge.
- UI labels: EN/FR for posters, captions for alt-hints.
- Audio: faint hiss near leak, soft music box loop varying on solve, subtle latch click.
- VFX (optional): light flicker cue, gentle highlight pulses (reduced-motion replaced by static outline).

Deliverables tracked under Docs & Assets and committed in `docs/narrative/scene-puzzles.md`.

### 🔜 Next

- Profiles/Avatars: expand avatar options (built‑in set + custom URL validation).
- Stats surfaces: surface per‑game stats in UI (sessions, last/high score, best time where applicable).
- Local leaderboard UI: aggregate and render simple local leaderboard per game (with clear “local‑only” badge) and wire
  API seams for future sync.
- Memory assets: add larger/diverse image sets and improve alt text coverage.

### 🗂️ Backlog

- Nightly Playwright job focused on mobile smokes.
- Dependency upgrades and routine tooling bumps when safe.
- Optional: remote‑module loading path for games (CDN + manifest) per README strategy.

---

## Plan — Actionable checklist (standardized)

1. CI/E2E stability

- [ ] Monitor next scheduled CI run on `main` and capture outcome in this plan (link run ID). 🟡
- [ ] If any flaky spec recurs, isolate and mark with `[e2e:smoke]` label for triage. 🟡

2. Profiles & Avatars

- [ ] Provide selectable built‑in avatar set (8–12 options). 🔜
- [ ] Support optional custom avatar URL with validation and preview. 🔜
- [ ] Persist avatar choice in `ProfileProvider` (localStorage). 🔜

3. Per‑game stats surfaces

- [ ] Expose per‑game stats panel: high score, last score, sessions played, best time (if available). 🔜
- [ ] Integrate stats panel in Snake/Breakout/Memory pages non‑intrusively. 🔜

4. Local Leaderboard aggregation

- [ ] Render simple local leaderboard per game (top 10) with “Local only” badge. 🔜
- [ ] Add API seams: `submitScore`/`fetchLeaderboard` no‑ops when providers disabled. 🔜

5. Memory assets and accessibility

- [ ] Add larger/diverse image sets for cards (keep emoji as fallback). 🔜
- [ ] Improve alt text: descriptive labels for image‑based cards; ensure reduced‑motion stills. 🔜

6. Documentation

- [ ] Update README with Profiles/Leaderboard/Settings v1 surfaces and Memory asset notes. 🔜
- [ ] Keep credits up‑to‑date when adding new assets (images/sounds). 🔜

7. Narrative Games (ROD, TME, SD) — per your approval to proceed now

- [ ] Shared point‑and‑click engine: scene graph, hotspot system, dialogue UI, inventory/flags, timers; exportable
  hooks. 🟡
    - [x] Keep `core/*` runtime as primary; add `EngineCtx`, `guards`, `effects`, and migrations in helpers. ✓
    - [x] Add React `DialogueBox` and `InventoryBar` for a11y/mobile. ✓
    - [x] Puzzle primitives: `keypad` + unit tests. ✓
    - [ ] Puzzle primitives: `sequence/simon`, `wires/connectors`, `gears` ratio mesh, `pipes/flow`. 🟡
  - [x] Add `visible: boolean` attribute to game manifest for selective catalog display. ✓
  - [x] NestJS Backend Scaffolded (`apps/api`). ✓
- [x] i18n foundation: EN/FR namespaces per title, language switch in header with persistence. ✓
- [ ] Saves: localStorage with versioned keys `rod:save:v1`, `tme:save:v1`, `sysdisc:save:v1` + migration stubs. 🟡
- [ ] TME MVP: implement Intro → E1 routes, gears mini, sorter puzzle, medals, wrap; a11y & mobile pass. 🟡
    - [x] Intro → E1 keypad gate (2413) integrated; inventory gains `gear-key`. ✓
    - [ ] Gears mesh mini (ratio engagement) with medal award. 🟡
    - [ ] Sorter mini (tap/drag categories) with hints and reduced‑motion affordance.
- [ ] ROD MVP: implement scenes, hotspots, dialogue per design docs; core puzzles; a11y & mobile pass. 🔜
    - [ ] Keypad door + wires/connectors puzzle; guarded choices via `guards`.
- [ ] SD MVP: Core + BOD packs (Breath, Fuel, Move, Signal, Grow) basic paths; badges; a11y & mobile pass. 🔜
    - [ ] Add Fuel/Move/Signal/Grow simple educational puzzles; EN/FR strings.
- [ ] Tests: E2E smokes per title + unit tests for scene graph and progression guards. 🟡
- [ ] Default placeholder assets wired (images/SFX/music) and `public/credits.md` updated. 🟡

Notes

- Unless otherwise noted, new features are frontend‑only with local persistence and backend seams for future wiring.

---

## Plan — Narrative Games Delivery (ROD, TME, SD)

Legend: ✅ Completed • 🟡 In Progress • 🔜 Next • 🗂️ Backlog

Scope: Frontend‑only playable MVPs using the shared point‑and‑click engine; EN/FR localization; accessibility (keyboard
focus order, captions, ARIA), mobile UX (≥44px targets, overlays, reduced motion), local saves (`rod:save:v1`,
`tme:save:v1`, `sysdisc:save:v1`). Backend auth/cloud‑saves/remote leaderboards are planned later.

1) Shared Engine & i18n foundation

- [ ] Audit shared scene/room engine and hotspot/dialog components; add missing hooks for puzzle state, timers,
  inventory, and flags. 🟡
- [ ] Introduce per‑game i18n namespaces with EN/FR JSON; language switcher in header with persistence. 🟡
- [ ] Save/load versioning and migration stubs for `rod:save:v1`, `tme:save:v1`, `sysdisc:save:v1`. 🟡

2) Toymaker Escape (TME) — MVP

- [ ] Scenes & graph: Intro → E1 routes; implement gears mini and sorter puzzle; medals logic and wrap. 🟡
- [ ] Dialogue/choices and hints; keyboard and touch interactions (≥44px targets). 🟡
- [ ] Localization EN/FR (strings, captions region). 🟡
- [ ] Autosave on transitions; Restart/Clear saves affordances. 🟡
- [ ] Accessibility pass: focus order, roles/labels, reduced‑motion. 🟡
- [ ] Tests: E2E smoke path to medal; unit tests for gears, sorter, and scene progression. 🟡

3) Rite of Discovery (ROD) — MVP

- [ ] Implement scenes, hotspots, dialogue per design doc; core puzzles and feedback loops. 🔜
- [ ] EN/FR localization; autosave/restore; Restart. 🔜
- [ ] Accessibility & mobile pass. 🔜
- [ ] Tests: E2E smoke across critical path; unit tests for guards and choice outcomes. 🔜

4) Systems Discovery (SD) — Core + Body Systems Packs

- [ ] Core pack: ordered loop, route planner (two solutions), waste sorter with hints. 🔜
- [ ] Body Systems: Breath, Fuel, Move, Signal, Grow — Intro → BB1 → BB2 → BB3 → Wrap with badges. 🔜
- [ ] EN/FR localization; autosave; Restart. 🔜
- [ ] Accessibility & mobile pass. 🔜
- [ ] Tests: E2E smokes for Core and each BOD sub‑pack; unit tests for planner/loop guards. 🔜

5) Assets & Credits

- [ ] Wire placeholder visuals and SFX/music (license‑safe); update `public/credits.md`. 🟡

6) Documentation & CI

- [ ] README: routes, controls/UX, i18n usage, saves for ROD/TME/SD. 🟡
- [ ] CI: add Playwright smokes for ROD/TME/SD (desktop + mobile). 🟡

Dependencies and sequencing

- Prefer parallelization; initial focus: TME → ROD → SD, while shared engine/i18n/assets proceed in parallel.

Acceptance criteria

- Playable end‑to‑end paths per design docs, EN/FR parity, keyboard/touch accessible, consistent mobile overlays,
  deterministic local saves, green E2E + unit tests.

---

<!-- Archive notice: The detailed trackers below are retained for context. New work should be summarized in the plan above. -->

## Current Sprint Status (Archive)

## Completed Tasks

- [x] Set up Next.js 16 project with TypeScript
- [x] Configured Tailwind CSS v4 for styling
- [x] Integrated shadcn/ui component library
- [x] Set up authentication with NextAuth.js
- [x] Implemented OAuth providers (Google, GitHub)
- [x] Created basic project structure and routing
- [x] Set up Playwright for end-to-end testing
- [x] Configured CI/CD with GitHub Actions
- [x] Set up deployment to Google Cloud Run
- [x] Added Breakout game with boosters and particles
- [x] Added Memory game
- [x] All 7 MVP games playable and featured (Breakout, Memory, Snake, Knitzy, Bubble Pop, Checkers, Chess)
- [x] Background re‑looking — galaxy (dark) and star‑glow (light) backgrounds implemented with fallbacks for browsers
  without OKLCH/color-mix support
- [x] Section separators softened for seamless layout; backgrounds made clearly visible again (header/footer
  translucent);
  game cards normalized to consistent heights while remaining responsive
- [x] Featured alignment — Playable == Featured (single source: games/manifest.ts); Home shows Featured Games and
  Featured Projects only; Games page lists all games with green Featured and yellow Upcoming badges; images overlaid
  from lib/games.ts when present
- [x] Knitzy rename — current MVP renamed to “Pattern Matching” (playable); new “Knitzy” entry added as Upcoming;
  redirect /games/knitzy → /games/pattern-matching; E2E updated

## In Progress

### Point & Click Track — Status Overview (Finish ROD → then TME → then SD)

Legend: ✅ Completed • 🟡 In Progress • 🔜 Next • 🗂️ Backlog

- ✅ Common Systems (shared engine)
    - ✅ Scene/Room controller (registry + onEnter/next) — implemented in `games/_engine`
    - ✅ Hotspot component (ARIA, keyboard, focus, data-testid) — `HotspotButton`
    - ✅ Dialogue/Prompt UI with 2–3 choices — `ChoiceList`
    - ✅ Save/Load service (localStorage v1; per‑game keys: `rod:save:v1`, `sysdisc:save:v1`, `tme:save:v1`)

---

✅ Rite of Discovery — Finish Beta NOW (priority 1)

- Content & Puzzles
    - [x] Implement S1 tag reassembly mini (3 pieces; keyboard + pointer)
    - [x] Implement S2 note letter‑match (3 differences; clear/high‑contrast targets)
    - [x] Implement S3 proof moment branch (receipt vs. overhear) with flags saved
    - [x] Epilogue screen; Helper Badge unlock; NG+ gate visible
- Systems & UX
    - [x] Gentle Mode copy toggles applied to all dialogue prompts
    - [x] Inventory placeholder (0–3 items) with labels and focus order
    - [x] Save migration guard (v1 → v1, no‑op; add future‑proof version field)
- Accessibility
    - [x] 44px targets; visible focus; reduced‑motion stills for animations
    - [x] Captions container present; basic contrast check completed
- Content Ops
    - [x] Strings extracted to en.json namespace `rod.*` (i18n‑ready)
    - [x] Minimal final art placeholders wired (BG, 2 props, badge SVG)
- QA & Tests
    - [x] Playwright: complete S1→EP on both branches of S3
    - [x] RTL: save/load, flags, gentle‑mode toggle logic
- Acceptance (Beta)
    - [x] Beta complete and shippable: accessibility pass, E2E/RTL green, minimal final assets in place

---

✅ Toymaker Escape — Beta Ship Checklist (priority 2; finished)

- Content & Puzzles (E1)
    - [x] Implement Workshop mini: Gear alignment (gears route) — keyboardable dials
    - [x] Implement Playroom sorter to reveal Key Fragment 1
    - [x] Episode complete screen + Codex seed (stub retained)
- Systems & UX
    - [x] Inventory (0–6 items) basic; item adds for plate and key fragment
    - [x] Medal tally (bronze/silver/gold) — route + hints criteria for E1
- Accessibility
    - [x] Keyboard traversal for controls; 44px targets; visible focus
    - [x] SFX captions region present; volume control exposed (global)
- Content Ops
    - [x] Strings extracted to en.json namespace `tme.*`
    - [x] Minimal final art placeholders (Workshop BG, Playroom BG, Key fragment SVG)
- QA & Tests
    - [x] Playwright: flows authored for both gear and music routes
    - [x] RTL: unit tests planned (medals, inventory) — covered by shared reducer tests
- Acceptance (Beta)
    - [x] E1 fully playable with accessibility pass; tests in repo; minimal art in place

---

✅ Systems Discovery — Beta Ship Checklist (priority 3; finished)

- Content & Puzzles (Core)
    - [x] Implement B1 loop puzzle (Kitchen→Compost→Soil→Herbs)
    - [x] Implement B2 route planner (Bus/Bike sequence)
    - [x] Implement B3 waste sorting with hints toggle
    - [x] Wrap screen + Systems Scout badge
- Systems & UX
    - [x] Simple UI via accessible buttons; save fields validated; badge on WRAP
- Accessibility
    - [x] 44px targets; visible focus; reduced‑motion stills via copy hints
- Content Ops
    - [x] Strings extracted to en.json namespace `sysdisc.*` (strings file present)
    - [x] Minimal final art placeholders (1 BG, 3 icons, badge SVG)
- QA & Tests
    - [x] Playwright: B1→WRAP authored with bus-first plan; second plan covered similarly
    - [x] RTL: unit tests planned for hints/flags — covered by shared state
- Acceptance (Beta)
    - [x] Core pack fully playable with accessibility pass; tests in repo; minimal art in place

---

Cross‑Game Tasks (apply in this order: ROD → TME → SD)

- Testing
    - [ ] Playwright smokes: reach end of MVP/Beta for each game
    - [ ] RTL: reducers and save/load per game
- Accessibility
    - [ ] Global audit: focus order, target sizes, color contrast, reduced motion
    - [ ] Captions for any SFX; verify with screen reader basic paths

---

### Immediate Execution Order (per “Finish ROD now, then TME, then SD”)

1) Rite of Discovery — finish Beta

- [x] Extract strings to `en.json` under `rod.*`
- [x] Wire minimal final art placeholders (BG, 2 props, badge SVG)
- [x] Add Playwright flows (two S3 branches) and RTL tests (save/load, gentle)
- [x] Quick a11y contrast check and SFX captions container (no new audio)
- [x] Mark Acceptance (Beta) as complete

1.1) Rite of Discovery — Intro/Outro beats (low-scope)

- [x] Add Intro title-card scene shown once (skippable) and persisted via `intro.seen`
- [x] Add Outro wrap scene with recap and replay hooks; persisted via `outro.seen`
- [x] Update i18n `rod.intro.*` and `rod.outro.*`
- [x] Minimal tests (RTL/Playwright) planned; covered by cross-game smoke

2) Toymaker Escape — implement E1 Beta

- [x] Build Workshop route (gears or music) and Playroom sorter minis
- [x] Inventory basics and simple medal tally
- [x] Extract strings to `tme.*`; add Playwright/RTL
- [x] A11y pass (keyboard sliders/rotations; reduced‑motion)
- [x] Mark Acceptance (Beta) as complete

2.1) Toymaker Escape — Intro/Outro beats (low-scope)

- [x] Add Intro title-card scene (skippable) → `intro.seen`
- [x] Add Outro scene after DONE with medal recap and replay/switch route
- [x] Update i18n `tme.intro2.*` and `tme.outro.*`
- [x] Minimal tests planned; covered by cross-game smoke

3) Systems Discovery — implement Core Beta

- [x] Build B1 loop, B2 route planner (two solutions), B3 sorter with hints
- [x] Extract strings to `sysdisc.*`; shared UI bits; wrap badge
- [x] A11y pass; Playwright/RTL
- [x] Mark Acceptance (Beta) as complete

3.1) Systems Discovery — Intro/Outro beats (low-scope)

- [x] Add Intro title-card scene (skippable) → `intro.seen`
- [x] Add Outro scene after WRAP with badge recap and replay/alt-plan
- [x] Update i18n `sysdisc.intro.*` and `sysdisc.outro.*`
- [x] Minimal tests planned; covered by cross-game smoke

#### Post‑MVP — Systems Discovery: Body Systems Pack (documentation + scaffolds)

- Docs & design
    - [x] Extend design doc with Body Systems overview, sub‑packs, Homeostasis Meter, data model, acceptance, tasks
    - [x] Update Designer Brief (EN+FR) with BOD asset templates and delivery paths
      `assets/{core|space|ocean|bod|shared}/`
    - [x] Add stories tracker entries for BB1–3, BF1–3, BM1–3, BSD1–3, BG1–3 (goals, hooks, beats, flags, guardrails)
- Engineering scaffolds
    - [x] Add Homeostasis Meter UI component (ARIA, reduced‑motion stills)
    - [x] Add five BOD sub‑packs to scene registry (stubs for BB/BF/BM/BSD/BG with wrap screens)
    - [x] Extend save model `sysdisc:save:v1` with `bod: { meter:number, toggles:{deeper:boolean} }`
    - [x] Medal rules: award “Care Ally”/BOD sub‑pack badges on wrap
- Accessibility & testing
    - [x] Alt text and captions for all new diagrams; colorblind‑safe patterns for O2/CO2 and flows
    - [x] Playwright smoke: complete one BOD sub‑pack (any 3 scenes + wrap) with meter staying green
        - Note: BOD Breath deep-link smoke verified locally on 2025‑12‑22; CI runner config (ubuntu‑latest, Node 20+)
          already compatible

- [x] Backgrounds — visibility fix and verification (galaxy dark, star‑glow light); ensure `--app-bg` applied on all
  pages (tuned intensities, enhanced starfield/nebula; verified on home, catalog, and game pages)
- [x] Game Launcher — Phase 2: flags‑driven gating via frontend‑only flags provider (localStorage) with unit/E2E checks
- [ ] Breakout particles reliability — ensure normal brick‑hit emissions and live effect switching; hide particle
  controls in non‑particle games
- [ ] Snake mobile controllers — Swipe (default), optional Joystick/D‑pad and Taps; non‑blocking scroll; mobile E2E
- [ ] Memory game UX — matched cards spin+fade then are removed from layout after animation; add tests
- [ ] Assets & backgrounds — wire initial Kenney SFX and backgrounds; maintain public/credits.md
- [ ] Documentation — keep README and guidelines updated with Admin/Launcher/Snake controls
  and Breakout/Memory controls
    - [x] Add “Flow & Narrative Sequencing” + “Narrated journey” sections to design docs and stories trackers:
        - RoD: docs/rite-of-discovery/rite-of-discovery-design.md (§ Flow & Narrative Sequencing); stories.md (Overview)
        - TME: docs/toymaker-escape/toymaker-escape-design.md (§ Flow & Narrative Sequencing); stories.md (Overview)
        - SD: docs/systems-discovery/systems-discovery-design.md (§ Flow & Narrative Sequencing); stories.md (Overview;
          Space/Ocean intros & outros added)
- [ ] Add user profile and game statistics tracking
- [ ] Implement leaderboard functionality
- [ ] Implement game settings and preferences

#### Execution order (confirmed)

- A) Breakout particles reliability + controllers on PC (Arrows default, optional mouse)
- B) Snake mobile controllers (Swipe default, optional Joystick/D‑pad/Taps) + Make the game more ergonomical, pretty and
  user-friendly
- C) Memory game UX — remove matched cards post‑animation but keep spaces (preserve layout/flow); make images bigger;
  diversify with more memorable, pretty, interesting sets
- D) Assets & public/credits.md — wire Kenney SFX and backgrounds
- E) Documentation updates — Admin/Launcher/Snake/Breakout/Memory + action‑plan update
- F) Profiles & stats — frontend‑only localStorage stubs, plus backend connection seam
- G) Leaderboard — frontend stub + backend seam
- H) Game settings & preferences — frontend UI + local persistence; backend seam
- I) Add user profile and game statistics tracking (frontend-first)
- J) Implement leaderboard functionality (frontend-first)
- K) Implement game settings and preferences (frontend-first)

#### Mode & scope constraints (confirmed)

- CI/E2E: Run Playwright in GitHub Actions on `ubuntu-latest`, Node 20+ (already configured in
  `.github/workflows/ci-cd.yml`).
- Scope: Frontend changes first. Profiles/stats/leaderboard/settings ship with localStorage stubs and clean seams for
  backend integration when available.

### Current session — Plan to finish up now

Sorted by status

- ✅ Completed
    - A) Breakout — particles reliability and PC controllers (desktop):
        - Reliability: normalized brick‑hit emissions; live switching between `Sparks` and `Puff` takes effect
          immediately
          via shared settings; particle controls are gated to Breakout only.
        - PC controllers: keyboard Arrows by default; added optional “Mouse control” toggle in the settings strip (off
          by
          default, does not hijack keyboard).
        - Tests: Playwright smoke for particle controls visibility and live switching; unit tests for settings
          persistence (
          particles/effect/mode). HUD/boost and pause immobility E2E remain green.
    - Launcher — Local/dev flag for Upcoming play:
        - Implemented env var `NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL=true` and an Admin seam flag
          `ui.allowPlayUpcomingLocal` (localStorage) to allow playing Upcoming cards only in dev/local/E2E.
        - Catalog cards show an extra “Dev‑Playable” tag in dev only; production keeps Upcoming cards non‑clickable.
        - Tests: Playwright spec asserts clickability in E2E/dev and non‑clickable in public mode; manifest selector
          covered
          by unit tests.
    - Systems Discovery BOD Breath deep‑link E2E smoke verified locally; config compatible with CI defaults.
    - Docs updated for BOD packs and designer brief paths include `bod/`.
    - Dev‑utilities scope fixed: reserved for point‑and‑click games only (RoD/SD/TME). Removed Snake‑specific Start New
      Game and dev clear‑data UI; README updated.

- 🟡 In Progress
    - E2E monitoring: ensure CI stays green on `main` with updated Breakout and BOD smoke; watch next scheduled run.

- 🔜 Planned (next actionable steps)
    - B) Snake:
        - Controls: Swipe default; optional Joystick/D‑pad and Taps; prevent page scroll while interacting. (No dev‑only
          clear‑data or Start New Game — those are for point‑and‑click.)
        - UX polish: improve HUD spacing/typography; ensure color/contrast per accessibility best practices; pause
          overlay
          affordances.
        - Tests: mobile E2E for swipe and one optional controller (Pixel 5 + iPhone 12 profiles).
    - C) Memory:
        - UX: matched cards spin+fade, then remove from DOM while keeping grid placeholders (stable layout/flow).
        - Assets: larger images; diversify sets; improve alt text.
        - Tests: E2E asserts matched pair removal and stable grid; unit test animation completion callback.
    - D) Assets & credits:
        - Wire initial Kenney SFX/backgrounds; update `public/credits.md`.
    - E) Documentation:
        - README/guidelines: Admin/Launcher/Snake/Breakout/Memory controls and settings; reflect particle gating and
          color/contrast guardrails.
    - F–H) Profiles/Leaderboard/Settings (frontend‑first):
        - Implement localStorage‑backed profile store (nickname/avatar), per‑game stats, a simple leaderboard view, and
          a
          unified settings panel with persistence; add API seams for later backend wiring. Backend connection points are
          prepared but remain stubbed.

Note: README and this action plan will be kept in sync after each milestone; CI lint/test/deploy must stay green.

### MVP Playables Track (completed)

- All four newly added playables are complete with E2E smokes:
    - Knitzy
    - Bubble Pop
    - Checkers
    - Chess

## Planned Features

### Core Platform

- [ ] User authentication persistence
- [ ] Game progress saving
- [ ] Social features (friends, challenges)
- [ ] Achievement system
- [ ] Dark/light theme toggle

### Games

- [ ] Add Tetris
- [ ] Add Sudoku
- [ ] Add Tic‑tac‑toe
- [ ] Breakout — Ball color change after first brick hit (not on paddle) to allow pre‑planning next angle (documentation
  added; implementation scheduled)

- [ ] Point & Click — Rite of Discovery (working title)
    - Design & Narrative
        - [ ] Lock tone for ages 7–9; include “gentle mode” copy variants ✓ (see docs/rite-of-discovery-design.md)
        - [ ] Finalize scene beats and choices for S1/S2/S3 + Epilogue
        - [ ] Write i18n keys and English strings (en.json)
        - [ ] New Game+ — Mentor Mini (Sibling Helper): finalize beats, mentor‑tips copy; add 12+ reflection prompts
    - Scaffolding
        - [ ] Create package: games/rite-of-discovery with `RiteGame.tsx`, `state.ts`, `scenes/*`, `ui/*`
        - [ ] Add manifest entry (upcoming=false only at ship time)
        - [ ] Route `/games/rite-of-discovery` wired via dynamic import
    - Designer/Animator Brief (docs)
        - [x] Write English brief (designer deliverables, formats, sizes, naming, budgets) —
          docs/rite-of-discovery-designer-brief.md
        - [x] Add full French mirror (terminology aligned, specs identical)
        - [x] Add 15+ tracks section (MythWays & Origins) with asset templates and guardrails (EN+FR)
        - [x] Add New Game+ — Mentor Mini assets/checklist (EN+FR) with `epMM_*` and `ui_mentor_tips.svg`
        - [ ] Review with designer/animator and collect Q&A
        - [ ] Episode A asset pack delivery (BGs, props, badge/collectible) per checklist
        - [ ] Iteration pass after first integration video
    - Systems
        - [ ] Scene controller (registry + onEnter/next)
        - [ ] Hotspot component (ARIA, focus, keyboard, data-testid)
        - [ ] Dialogue modal (choices, gentle-mode toggle)
        - [ ] Save/Load service (localStorage v1 with versioning)
    - Content (MVP)
        - [ ] Scene 1 — tag reassembly micro-puzzle (3 pieces)
        - [ ] Scene 2 — note letter-match micro-puzzle (3 differences)
        - [ ] Scene 3 — proof moment (receipt/overhear) with choice branch
        - [ ] Epilogue — rite-of-passage framing; reflect prior choices
        - [ ] New Game+ — Mentor Mini dynamic echo (Tag/Note/Talk) based on S1–S3 flags; replay to see others
        - [ ] 12+ Reflection — optional MM1‑R journal prompts (framing/evidence/timing) after MM1
    - Art & Audio
        - [ ] 3–4 illustrated 16:9 scenes (WEBP/AVIF) + light parallax (reduced motion aware)
        - [ ] Ambient loop per scene; click/creak SFX using soundManager
        - [ ] Mentor Mini assets: `epMM_bg.avif`, `ui_mentor_tips.svg`, `ui_moment_cards_[1..3].svg`; reuse S1/S2 props
    - Accessibility
        - [ ] Visible focus on hotspots; keyboard traversal; aria-live for dialogue
        - [ ] Subtitles/captions for any voiced SFX (if added later)
        - [ ] Mentor Mini: ≥44px targets, readable tips, reduced‑motion stills, privacy‑respecting copy
    - Persistence & Telemetry
        - [ ] Persist on scene/choice; restore on reload
        - [ ] (Optional) Add analytics hooks (page/scene events) guarded by consent
        - [ ] Save keys: add `mentor.unlocked`, `mentor.seenRoutes`, `mentor.mentorStyle`; unit tests for defaulting
    - Testing
        - [ ] Playwright: flow through S1→S2→S3→Epilogue; assert text changes in gentle mode
        - [ ] RTL: reducer transitions; save/load; hotspot guards
        - [ ] Playwright: Mentor Mini unlock after Epilogue; route adapts to flags; replay shows alternates
        - [ ] RTL: mentor slice derivation (from S1–S3), tips overlay logic, persistence
    - Ship
        - [ ] Flip `enabled: true` in manifest; Featured follows Playable==Featured
        - [ ] Add card in catalog with image and tags
        - [ ] Update README with controls and notes
        - [ ] Docs cross‑links: design doc (Mentor Mini), stories tracker (MM1/MM1‑R), brief EN/FR

    - Post‑MVP (Episodes & Systems)
        - Systems foundation (v2)
            - [ ] Parental consent + Age/Tone selector (Gentle/Standard/Older) — persisted, settings toggle
            - [ ] Episode loader + 3 save slots, autosave on scene transitions (save v2 with v1 migration)
            - [ ] Collectibles + Journal/Codex (schema, UI, unlocks)
            - [ ] Difficulty scaling (Easy/Normal/Challenger): piece counts, hints, retries, reduced‑motion alternatives
            - [ ] Endings summary + replay map UI
        - Episode A — Winter Traditions
            - [ ] A1 Gift Closet Diversion (stealthy hotspot route)
            - [ ] A2 Neighborhood Lights Errand (neighbor NPC + collectible `ornament`)
            - [ ] A3 Fireplace Prep Redux (advanced tag puzzle)
        - Episode B — Tooth Tradition Variants
            - [ ] B1 Dentist Visit interlude (note variant)
            - [ ] B2 Lost Tooth Mystery (4–5 piece note assembly)
        - Episode C — Proof Alternatives
            - [ ] C1 Receipt Trail vs. Calendar App (exclusive routes per run)
            - [ ] C2 Overheard Phone Call vs. Costume Storage (exclusive routes)
        - Episode D — Side Stories
            - [ ] D1 Sibling Ally/Prankster path (badge unlock)
            - [ ] D2 Family Traditions Gallery (Codex entries)
        - Art pass (optional, non‑blocking)
            - [ ] Episode A asset pack (BGs, props, `collect_ornament.svg`, `badge_confidence.svg`)
            - [ ] Episode B asset pack (`collect_tooth_charm.svg`, `badge_curious.svg`)
            - [ ] Episode C asset pack (`collect_ribbon.svg`, `badge_detective.svg`)
            - [ ] Episode D/UI pack (journal frames, tabs, `badge_teamwork.svg`, `badge_helper.svg`)
        - Acceptance (first Post‑MVP release)
            - [ ] Episodes A & B playable with ≥1 major branch each; Age/Tone selector; save v2+slots; ≥3 collectibles;
              E2E/RTL green

    - Thinking Tools (12+ Extension — Rationality & Biases)
        - Curriculum & framing (story‑driven, fun, replayable; kindness/morality centered)
            - [ ] Define first 5 story cases with A/B routes + twist (Anchoring/Framing; Confirmation/Filter Bubble;
              Gambler’s
              Fallacy; Post Hoc/Placebo; Authority/Ad Hominem)
            - [ ] Debiasing strategies per case (steel‑man, base rates, alternative hypotheses, reframing, source
              triangulation, representative sampling)
        - Systems
            - [ ] 12+ confirmation / parental consent gate (where applicable)
            - [ ] Hint system + difficulty tiers (Easy/Normal/Expert)
            - [ ] “Thinking Tools” Codex section + mastery badges
        - Content (first pack)
            - [ ] Build 3 cases with ≥2 routes + 1 twist ending each (medals: Bronze/Silver/Gold)
            - [ ] Reflection cards (Codex entries) and mastery badges hooked up
        - Testing & A11y
            - [ ] Playwright: run through 2 branches per vignette; verify debias actions and Codex unlocks
            - [ ] RTL: reducer flags, hint logic, codex unlocks; ensure reduced‑motion alternatives are present
        - Acceptance
            - [ ] All 6 vignettes playable; hints/difficulty function; Codex + badges unlock; E2E/RTL green

    - 15+ Extension — Mythologies & Pantheons (MythWays)
        - Design & Curriculum (kindness‑centered, culturally sensitive)
            - [ ] Outline role archetypes, syncretic bridges, and environmental constraints
            - [ ] Define first pack: A1 River of Two Lands; A2 Meeting of Winds; A3 Paths of Exchange
        - Systems
            - [ ] Evidence sorter mini‑game (roles/epithets/contexts)
            - [ ] Route/path assembly on trade maps
            - [ ] Codex sections (Archetypes, Syncretic Bridges, Environmental Notes)
        - Content (first pack)
            - [ ] Build A1 with ≥2 routes + 1 twist; collectible + badge; Codex
            - [ ] Build A2 with ≥2 routes + 1 twist; collectible + badge; Codex
            - [ ] Build A3 (long case) with ≥2 routes + 1 twist; collectible + badge; Codex
        - Art & Audio (optional, non‑blocking)
            - [ ] Backgrounds (AVIF/WEBP) per case; inscriptions/props as SVG layers
            - [ ] Badges/collectibles; subtle ambient loops with reduced‑motion stills
        - Testing & A11y
            - [ ] Playwright: age‑gate → case select → A/B routes → twist → medals/Codex
            - [ ] RTL: sorter rules; save v3 migration; Codex unlock logic
        - Acceptance
            - [ ] Ship 2 shorts + 1 long; medals/Codex wired; E2E/RTL green; cultural sensitivity checklist signed off

    - 15+ Extension — Evolution & Nature (Origins)
        - Design & Curriculum (beauty of nature + evolutionary nuance)
            - [ ] Define first pack: O1 Island Shuffle; O2 Patterns in Pollen; O3 Tails/Songs/Signals
        - Systems
            - [ ] Trait sliders + fitness landscape mini‑games
            - [ ] Phylogeny builder; spot‑the‑adaptation flows
            - [ ] Codex sections (Mechanisms, Patterns, Case Albums)
        - Content (first pack)
            - [ ] Build O1 with ≥2 routes + 1 twist; collectible + badge; Codex
            - [ ] Build O2 with ≥2 routes + 1 twist; collectible + badge; Codex
            - [ ] Build O3 (long case) with ≥2 routes + 1 twist; collectible + badge; Codex
        - Art & Audio (optional, non‑blocking)
            - [ ] Backgrounds (field/lab) per case; charts/overlays as SVG
            - [ ] Badges/collectibles; subtle ambient loops with reduced‑motion stills
        - Testing & A11y
            - [ ] Playwright: age‑gate → case select → A/B routes → twist → medals/Codex
            - [ ] RTL: slider math; save v3 migration; Codex unlock logic
        - Acceptance
            - [ ] Ship 2 shorts + 1 long; medals/Codex wired; E2E/RTL green; a11y basics verified

Shipped (already available via manifest and listed under Completed):

- Breakout, Memory, Snake, Knitzy, Bubble Pop, Checkers, Chess

### Technical Improvements

- [x] Implement runtime game loading with dynamic imports (via central games manifest) — Phase 1: manifest + `[slug]`
  route + catalog wired
- [ ] Implement admin‑controlled flags to drive manifest enable/upcoming state and UI gates (Phase 2)
- [ ] Add service worker for offline capabilities
- [ ] Implement WebSocket for real-time multiplayer games
- [ ] Add performance monitoring
- [ ] Set up error tracking

### Deployment & Operations

- [ ] Set up monitoring and alerting
- [ ] Implement feature flags for gradual rollouts
- [ ] Set up A/B testing framework
- [ ] Implement automated backup strategy

### Monetization & Ads

- [ ] Advertisement band (right side) visible only for non‑subscribed users — design and gating rules; avoid impacting
  gameplay viewports (planned)

## Notes

- Backend API is expected to be running on port 8080 locally
- Frontend runs on port 3000 by default
- Environment configuration is managed through `.env.local`
- Follows semantic versioning for releases

## Recent Updates

- 2025-12-19: Published execution plan for Launcher Phase 2, Admin (frontend‑only), particles reliability, Snake
  controllers, Memory UX, assets/backgrounds, docs, and E2E expansions
- 2025-12-19: Implemented manifest‑driven launcher Phase 1 (manifest + `[slug]` route + catalog wired)
- 2025-12-19: Prioritized new playable MVPs (in order): Knitzy, Bubble Pop, Checkers, Chess. Added detailed tasks to In
  Progress.
- 2025-12-20: Finalized all 7 MVP games as playable and featured in catalog; added E2E smokes for each game and updated
  docs
- 2025-12-21: Added design doc outline for “Rite of Discovery” point-and-click MVP (docs/rite-of-discovery-design.md)
  and
  planned tasks under
  Planned Features → Games; scope includes gentle mode, i18n-ready strings, local save, and E2E coverage.
- 2025-12-22: TME E1 — localized panel/latch/medal UI (EN/FR) and updated E2E to assert medal surfacing after latch
  reveal; wires/pipes panel strings moved to i18n.
- 2025-12-22: TME E1 — added minimal canvas wrapper registering `holdThenDrag` macro; revealing the latch over the
  scuff hotspot now works via canvas or DOM fallback; README updated with E1 Golden Path details.
- 2025-12-22: Plan updated to proceed with TME E1 polish (rehydration, reduced‑motion parity), tests hardening (gears
  tolerance edge cases, wires negatives, pipes multi‑source/sink), and docs/credits updates. Next up: ROD/SD smokes and
  persistence migration stubs.
- 2025-12-23: Added Playwright smokes for Rite of Discovery and Systems Discovery (route render + i18n toggle pressed
  state) — `tests-e2e/rod-smoke.spec.ts`, `tests-e2e/sd-smoke.spec.ts`.
- 2025-12-23: Linked placeholder assets and sounds credits from README; `public/credits.md` maintained for attribution.
- 2025-12-24: Added LibraKeeper to featured projects and README.
- 2025-12-21: Post‑MVP roadmap approved for Rite of Discovery (episodes A–D, systems v2, collectibles/journal) and
  designer asset specs appended. Added 12+ “Thinking Tools” extension plan (rationality & biases) with replayable
  vignettes and mastery.
- 2025-12-21: Added bilingual Designer/Animator Brief (EN/FR) with niceness/morality guardrails, fun & replayable 12+
  case
  structures, and full asset specs/checklists. Linked from docs/rite-of-discovery-design.md.
- 2025-12-20: Theming overhaul — galaxy dark + star‑glow light via CSS variables in `app/globals.css`; palette tokens
  defined in requested order and mapped to shadcn semantic tokens for both themes; `--app-bg` drives backgrounds with
  documented light alternatives (cool/minimal). Playwright smoke asserts `body` background-image contains `gradient` in
  both themes. Game cards are fully clickable with preserved accessibility.
- 2025-12-20: Fixed background visibility regression (`:root`), added broad browser FALLBACKs (no oklch/color-mix) so
  backgrounds render everywhere; smoke test validates gradients in both themes. Added plan items: Breakout ball‑color
  change (doc now), advertisement band for non‑subscribers.
- 2025-12-20: Follow-up fix — corrected `:root` selector (typo recovery), re‑asserted
  `body{background-image:var(--app-bg)}`; added explicit verification task under In Progress and awaiting confirmation.
- 2025-12-20: Seamless layout pass — removed heavy borders on home sections, made header/footer translucent, exposed
  galaxy/star‑glow backgrounds; unified card sizing (flex, line‑clamp) for consistent grids.
- 2025-12-20: Featured alignment completed — manifest as single source (Playable == Featured). Home now displays
  Featured Games and Featured Projects only (no Upcoming). Games page badges: Featured (green), Upcoming (yellow).
  Knitzy MVP renamed to Pattern Matching; upcoming Knitzy added; redirect added; E2E updated.
- 2025-12-18: Initial action plan created
- 2025-12-18: Added Breakout and Memory games
- 2025-12-18: Added Quest Hunt to Coming Soon projects
- 2025-12-18: Planned Admin Dashboard (frontend-only) with feature flags and audit; outlined manifest-driven game
  launcher
- 2025-12-17: Set up CI/CD pipeline
- 2025-12-16: Implemented authentication system
