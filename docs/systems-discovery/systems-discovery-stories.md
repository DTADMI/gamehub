# Systems Discovery — Stories & Scenarios Tracker

Purpose

- Single source to describe, review, and iterate all Systems Discovery stories/puzzles. Newcomer‑friendly, with clear
  guardrails.

Related docs

- Design: docs/systems-discovery/systems-discovery-design.md
- Designer/Animator Brief: docs/systems-discovery/systems-discovery-designer-brief.md

Status key

- Idea → Draft → Ready for Art → Integrated → Polished

How to use this document

- Start with the Index to see status at a glance; each item links to a detailed entry.
- When creating/updating a story, copy the Story Template and fill it out with concise, kind wording.

Story Template

- ID/Name:
- Pack: CORE | SPACE | OCEAN | BOD‑BREATH | BOD‑FUEL | BOD‑MOVE | BOD‑SIGNAL | BOD‑GROW
- Goal (one line):
- Hooks:
- Core beats:
- Choices & flags:
- Kindness & accessibility guardrails:
- Assets needed (link to brief):
- Copy notes (tone hints):
- Open questions:
- Fact‑check notes:
- Review checklist: Content ✓ / Kindness ✓ / Accessibility ✓ / Art Ready ✓ / Integrated ✓

Index

- Core
  - [SD_INTRO Title Card](#sd_intro-title-card) — Status: Integrated — Owner: Narrative
  - [B1 Food Web at Home](#b1-food-web-at-home) — Status: Draft — Owner: Narrative
  - [B2 Transit Rhythm](#b2-transit-rhythm) — Status: Draft — Owner: Narrative
  - [B3 Waste Sorting](#b3-waste-sorting) — Status: Draft — Owner: Narrative
  - [WRAP — Systems Scout](#wrap--systems-scout) — Status: Draft — Owner: Narrative
- Space
  - [SD_SPACE_INTRO Title Card](#sd_space_intro-title-card) — Status: Integrated — Owner: Narrative
  - [S1 Orbits & Periods](#s1-orbits--periods) — Status: Draft — Owner: Narrative
  - [S2 Light & Shadows](#s2-light--shadows) — Status: Draft — Owner: Narrative
  - [S3 Habitable Clues](#s3-habitable-clues) — Status: Draft — Owner: Narrative
  - [SD_SPACE_OUTRO Wrap Hooks](#sd_space_outro-wrap-hooks) — Status: Integrated — Owner: Narrative
- Ocean
  - [SD_OCEAN_INTRO Title Card](#sd_ocean_intro-title-card) — Status: Integrated — Owner: Narrative
  - [O1 Layers of Light](#o1-layers-of-light) — Status: Draft — Owner: Narrative
  - [O2 Currents & Climate](#o2-currents--climate) — Status: Draft — Owner: Narrative
  - [O3 Deep Signals](#o3-deep-signals) — Status: Draft — Owner: Narrative
  - [SD_OCEAN_OUTRO Wrap Hooks](#sd_ocean_outro-wrap-hooks) — Status: Integrated — Owner: Narrative
- Body Systems (BOD)
  - [BB1 Respiratory Basics](#bb1-respiratory-basics) — Status: Draft — Owner: Narrative
  - [BB2 Cardiovascular Flow](#bb2-cardiovascular-flow) — Status: Draft — Owner: Narrative
  - [BB3 Coupling at the Exchange](#bb3-coupling-at-the-exchange) — Status: Draft — Owner: Narrative
  - [BF1 Digestive Journey](#bf1-digestive-journey) — Status: Draft — Owner: Narrative
  - [BF2 Absorption & Transport](#bf2-absorption--transport) — Status: Draft — Owner: Narrative
  - [BF3 Waste & Balance (Urinary)](#bf3-waste--balance-urinary) — Status: Draft — Owner: Narrative
  - [BM1 Skeletal Support](#bm1-skeletal-support) — Status: Draft — Owner: Narrative
  - [BM2 Muscular Action](#bm2-muscular-action) — Status: Draft — Owner: Narrative
  - [BM3 Coordination (Motor Signals)](#bm3-coordination-motor-signals) — Status: Draft — Owner: Narrative
  - [BSD1 Nervous & Senses](#bsd1-nervous--senses) — Status: Draft — Owner: Narrative
  - [BSD2 Endocrine Messages](#bsd2-endocrine-messages) — Status: Draft — Owner: Narrative
  - [BSD3 Immune, Lymphatic & Integumentary](#bsd3-immune-lymphatic--integumentary) — Status: Draft — Owner: Narrative
  - [BG1 Reproductive Basics](#bg1-reproductive-basics) — Status: Draft — Owner: Narrative
  - [BG2 Changes Over Time](#bg2-changes-over-time) — Status: Draft — Owner: Narrative
  - [BG3 Care Networks](#bg3-care-networks) — Status: Draft — Owner: Narrative

  - [SD_OUTRO Wrap Hooks](#sd_outro-wrap-hooks) — Status: Integrated — Owner: Narrative

Overview: Flow & Narrative

On a first visit, Systems Discovery greets the player with a simple title card that frames the day’s journey. The Core
pack flows gently from a home loop (Kitchen → Compost → Soil → Herbs) to a neighborhood route plan (Bus ↔ Bike), and
concludes by sorting everyday waste with optional hints. After celebrating the Systems Scout badge, the outro offers
friendly replay hooks to try an alternate route or hints setting. From there, the Space and Ocean packs each begin with
a short intro card, guide the player through three themed scenes, and close with their own wrap/outro, keeping the
experience skippable on replays. Body Systems sub‑packs follow the same rhythm with a Homeostasis Meter that responds to
balanced choices. Throughout, choices are recorded as calm flags and captions emphasize curiosity, kindness, and science
humility.

## SD_INTRO Title Card

- Pack: CORE
- Goal: Orient the player with a friendly premise before B1; reduce cold start.
- Beats:
  - Title card with two brief lines; primary “Begin”, secondary “Skip intro”.
  - On action, set `intro.seen=true` and proceed to `B1`.
- Choices & flags: `intro.seen = true` (persisted in `sysdisc:save:v1`).
- Copy keys: `sysdisc.intro.*`.
- Guardrails: Reduced motion; clear heading; accessible buttons (≥44px); visible focus.
- Status: Integrated.

## B1 Food Web at Home

- Pack: CORE
- Goal: Show flows (kitchen → compost → soil → herbs) and feedback loops.
- Hooks: sink, compost bin, herb planter, rain jar; loop arrows.
- Core beats:
  - Select steps in order: Kitchen → Compost → Soil → Herbs.
  - Gentle hint shows sequence when enabled.
- Choices & flags: `b1.route = loop-ok` once solved.
- Guardrails: High contrast; large click targets; reduced‑motion stills.
- Assets: BG `core_b1_bg.avif`; props arrows/sink/compost/herb/rain; UI `ui_loop_slots.svg`.
- Status: Draft.

## B2 Transit Rhythm

- Pack: CORE
- Goal: Plan an efficient route with two valid sequences.
- Hooks: neighborhood map; bus stop; bike lane; crosswalk signals.
- Core beats:
  - Pick a route plan: Bus then Bike, or Bike then Bus.
  - Optional: record time/cost flags for future secret commendations.
- Choices & flags: `b2.plan = bus-first | bike-first` (optional `b2.secret.fast`, `b2.secret.frugal`).
- Guardrails: Clear labels; readable map; no timers.
- Assets: BG `core_b2_bg.avif`; bus/bike/crosswalk/pins; UI `ui_route_steps.svg`.
- Status: Draft.

## B3 Waste Sorting

- Pack: CORE
- Goal: Sort items correctly with an optional hints toggle.
- Hooks: recycle/compost/trash bins; items like banana, bottle, paper.
- Core beats:
  - Toggle hints on/off; pick correct bins for 3 items.
  - Reveal/finish when all three are correctly selected.
- Choices & flags: `b3.hints = true|false`; `b3.result = sorted | sorted-nohints`.
- Guardrails: Accessible buttons (≥44px), captions for any SFX; reduced motion.
- Assets: BG `core_b3_bg.avif`; bin and item SVGs; UI `ui_sort_help.svg`.
- Status: Draft.

## WRAP — Systems Scout

- Pack: CORE
- Goal: Celebrate completion and award the Systems Scout badge.
- Hooks: codex panel with connected lines animating subtly (stills provided).
- Beats: recap B1/B2/B3 choices; suggest a simple loop to try at home; unlock badge.
- Guardrails: Reduced‑motion friendly; celebratory but calm.
- Assets: `badge_systems_scout.svg`.
- Status: Draft.

## S1 Orbits & Periods

- Pack: SPACE
- Goal: Arrange planets by orbital period; understand resonance examples.
- Hooks: planets cards; orbit rings.
- Beats: order cards; optional “resonance pair” bonus.
- Flags: `s1.gold = true` if resonance found.
- Guardrails: Avoid disaster framing; keep playful.
- Assets: BG `space_s1_bg.avif`; planets, rings; UI order overlay.
- Fact‑check: Use generic sizes; don’t imply exact scale.

## S2 Light & Shadows

- Pack: SPACE
- Goal: Demonstrate phases/eclipses with lamp and balls.
- Hooks: draggable light and spheres.
- Beats: place lamp and balls; align to create a phase; view caption.
- Guardrails: Reduced-motion stills; captions required.

## S3 Habitable Clues

- Pack: SPACE
- Goal: Compare atmospheric hints; practice humility.
- Hooks: generic cards with pressures, temps, gases.
- Beats: match a trio; unlock codex note “Clues aren’t proof.”

## O1 Layers of Light

- Pack: OCEAN
- Goal: Order ocean zones; map creatures to layers.
- Hooks: depth gradient; creature silhouettes.
- Beats: drag labels; then place creatures; show adaptations with alt text.

## O2 Currents & Climate

- Pack: OCEAN
- Goal: Connect winds → currents → upwelling; show coastal effects.
- Hooks: arrows; buoy; coast panel.
- Beats: draw arrows; watch subtle particles (stills available); read caption.

## O3 Deep Signals

- Pack: OCEAN
- Goal: Match pings/songs/lights to creature cards.
- Hooks: audio spectrogram cards (captioned), light icons.
- Beats: 3 matches; unlock “Deep Listener” collectible.

## BB1 Respiratory Basics

- Pack: BOD‑BREATH
- Goal: Show air path and gas exchange: lungs → alveoli → blood (O2 in, CO2 out).
- Hooks: airway diagram cards; O2/CO2 icons; calm “breath” meter tick.
- Core beats:
  - Order the pathway cards; flip to reveal a short caption per step.
  - Match O2→blood, CO2→airflow; Homeostasis Meter rises gently when balanced.
- Choices & flags: `bod.bb1.route = orderFirst|matchFirst`; `bod.meter += 5` on balanced move.
- Guardrails: Abstract icons; no gore/anatomy detail; neutral skin tones; reduced‑motion stills.
- Assets: BG `bod_breath_bb1_bg.avif`; props O2/CO2 cards; airway/lung/alveoli; UI `ui_bod_meter.svg`.
- Copy: “Air in, energy on. Air out, balance stays.”
- Fact‑check: Keep gas exchange generic; avoid exact percentages; add humility note.

## BB2 Cardiovascular Flow

- Pack: BOD‑BREATH
- Goal: Understand pump and flow directions (icons only).
- Hooks: simple heart outline; four chamber tiles; flow arrows.
- Beats: place chambers; drag arrows to show path; see “blue→lungs, red→body” legend.
- Flags: `bod.bb2.order = correct|helped`; `bod.meter += 3` for correct sequence; `gold` if no hints.
- Guardrails: No realistic imagery; colorblind‑safe patterns; high contrast.
- Assets: BG `bod_breath_bb2_bg.avif`; chambers, arrows; UI compare overlay.

## BB3 Coupling at the Exchange

- Pack: BOD‑BREATH
- Goal: Couple respiratory and cardiovascular; balance O2/CO2 to keep meter green.
- Hooks: exchange panel; two sliders with labels.
- Beats: adjust intake/activity sliders to keep meter in 45–65 “steady” zone for 10 seconds.
- Flags: `bod.bb3.balance = steady|low|high`; award `medal = silver|gold` based on time.
- Guardrails: Calm feedback; no punishment; captions only.
- Assets: BG `bod_breath_bb3_bg.avif`; UI `ui_bod_meter.svg`.

## BF1 Digestive Journey

- Pack: BOD‑FUEL
- Goal: Break foods into nutrients with enzyme cards.
- Hooks: food cards (generic); enzyme icons.
- Beats: match food→enzyme; flip to see “what becomes what” caption.
- Flags: `bod.bf1.matches = 3` for gold.
- Guardrails: Neutral, non‑diet messaging; inclusive foods; avoid moralizing.
- Assets: BG `bod_fuel_bf1_bg.avif`; cards.

## BF2 Absorption & Transport

- Pack: BOD‑FUEL
- Goal: Show villi absorption and transport via blood; liver/pancreas cameo.
- Hooks: villi diagram; transport arrows; organ icons.
- Beats: drag nutrients to villi; then to blood; optional liver detour bonus.
- Flags: `bod.bf2.detour = true|false`; `bod.meter += 4` for hydration choice.
- Assets: BG `bod_fuel_bf2_bg.avif`.

## BF3 Waste & Balance (Urinary)

- Pack: BOD‑FUEL
- Goal: Overview of kidneys/bladder; hydration affects meter.
- Hooks: water drop icon; kidney schematic.
- Beats: choose hydration level for activity; see meter respond gently; caption about balance.
- Flags: `bod.bf3.hydration = low|med|high`; `bod.meter += {low:0,med:3,high:1}`.
- Guardrails: No medical advice; neutral.
- Assets: BG `bod_fuel_bf3_bg.avif`; water drop; kidney/bladder icons.

## BM1 Skeletal Support

- Pack: BOD‑MOVE
- Goal: Bones as levers; joints and safety.
- Hooks: lever puzzle; joint icons.
- Beats: place bone pieces; select safe joint for motion; tip about posture.
- Flags: `bod.bm1.joint = hinge|ball`.
- Assets: BG `bod_move_bm1_bg.avif`.

## BM2 Muscular Action

- Pack: BOD‑MOVE
- Goal: Antagonistic pairs; stamina vs. strength.
- Hooks: flexor/extensor icons; timer or weight icon.
- Beats: choose “stamina” or “strength” route; both conclude with kindness tip.
- Flags: `bod.bm2.route = stamina|strength`.
- Assets: BG `bod_move_bm2_bg.avif`.

## BM3 Coordination (Motor Signals)

- Pack: BOD‑MOVE
- Goal: Nervous system sends motor signals; reaction mini‑game (with stills).
- Hooks: brain→nerve icon; simple tap reaction.
- Beats: react to signal or view still; both continue; caption connects systems.
- Flags: `bod.bm3.reactTime`; reduced motion path bypasses timer.
- Assets: BG `bod_move_bm3_bg.avif`; UI signal icon.

## BSD1 Nervous & Senses

- Pack: BOD‑SIGNAL
- Goal: Sense inputs and simple signal pathway.
- Hooks: light/sound/pressure/chemical sensors; path cards.
- Beats: pick 2 senses; follow signal path; unlock codex entry.
- Flags: `bod.bsd1.senses = [..]`.
- Assets: BG `bod_signal_bsd1_bg.avif`.

## BSD2 Endocrine Messages

- Pack: BOD‑SIGNAL
- Goal: Hormones as slow signals; balance sleep/energy/growth.
- Hooks: hormone cards; gland icons.
- Beats: place hormone cards to goals; see meter nudge; “deeper science” toggles add notes.
- Flags: `bod.bsd2.balance = good|needsWork`.
- Assets: BG `bod_signal_bsd2_bg.avif`.

## BSD3 Immune, Lymphatic & Integumentary

- Pack: BOD‑SIGNAL
- Goal: Barriers and defenders; match threat→response.
- Hooks: skin/barrier icons; immune cell cards; lymph flow tile.
- Beats: match 3 threats; unlock “Barrier Buddy” collectible.
- Flags: `bod.bsd3.matches = 3` for gold.
- Guardrails: No pathogen pictures; neutral shapes.
- Assets: BG `bod_signal_bsd3_bg.avif`.

## BG1 Reproductive Basics

- Pack: BOD‑GROW
- Goal: Cells and growth story (gametes→zygote→embryo) with schematic icons.
- Hooks: cell icons; growth arrow.
- Beats: order the 3 cards; consent/care caption.
- Guardrails: Scientific tone; inclusive language; no explicit imagery.
- Assets: BG `bod_grow_bg1.avif`.

## BG2 Changes Over Time

- Pack: BOD‑GROW
- Goal: Puberty and growth framed with consent/care; connects to endocrine.
- Hooks: support cards; hormone icons.
- Beats: choose support actions; see kindness notes; optional deeper science caption.
- Assets: BG `bod_grow_bg2.avif`.

## BG3 Care Networks

- Pack: BOD‑GROW
- Goal: Community and healthcare roles; social safety.
- Hooks: family/community/clinic icons.
- Beats: connect helpers to needs; unlock “Care Ally” badge for the sub‑pack.
- Assets: BG `bod_grow_bg3.avif`.

## SD_OUTRO Wrap Hooks

- Pack: CORE
- Goal: Provide closure and offer replay options without forcing repetition.
- Beats:
  - Brief congratulations and recap of B1/B2/B3.
  - Actions: Replay Core pack; try alternate B2 plan; toggle B3 hints for next run; teaser for Body Systems Pack.
  - Set `outro.seen=true` when shown the first time; can be opened on demand later.
- Flags: `outro.seen = true` (persisted in `sysdisc:save:v1`).
- Copy keys: `sysdisc.outro.*`.
- Guardrails: Accessible buttons (≥44px), visible focus, reduced motion.
- Status: Integrated.

## Suggestions (Additional Scenarios)

- CORE: Power at Home; Water In/Out; Community Garden Roles (pollinators, composters, growers).
- SPACE: Small Worlds; Signals from Space (spectra puzzle).
- OCEAN: Reef Helpers; Seafloor Builders.

## SD_OCEAN_INTRO Title Card

- Pack: OCEAN
- Goal: Set the tone for Ocean (depth, currents, signals) with a calm, curious framing.
- Beats:
  - Title card with two short lines; primary “Begin”, secondary “Skip intro”.
  - On action, set `flags.ocean.intro.seen=true` and proceed to O1.
- Flags: `flags.ocean.intro.seen = true` (persisted in `sysdisc:save:v1`).
- Copy keys: `sysdisc.ocean.intro.*`.
- Guardrails: Reduced motion; accessible heading and buttons.
- Status: Integrated.

## SD_OCEAN_OUTRO Wrap Hooks

- Pack: OCEAN
- Goal: Provide closure for Ocean pack and offer replay/next steps.
- Beats:
  - Brief congratulations and recap; friendly suggestion of what to try next.
  - Actions: Replay Ocean pack; toggle any helper/hints; proceed to a BOD sub‑pack (if available).
  - Set `flags.ocean.outro.seen=true` first time; link-openable later from Ocean WRAP.
- Flags: `flags.ocean.outro.seen = true`.
- Copy keys: `sysdisc.ocean.outro.*`.
- Guardrails: Accessible buttons (≥44px), visible focus, reduced motion.
- Status: Integrated.
