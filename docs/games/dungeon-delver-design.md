# Dungeon Delver — Game Design Document

**Owner**: GameHub Team  
**Last Updated**: 2026-08-24  
**Version**: 0.2.0

## Overview

**Dungeon Delver** (FR: *Fouilleur de Donjon*) is a browser-based rogue-lite dungeon crawler for GameHub. Spiritual successor to *Hack Slash Crawl* (Hatched Games / Void, 2011, koreus.com), reimagined as a modern React + Canvas game with procedural audio, particle effects, touch/keyboard controls, save/load, boss floors, item rarity, and full bilingual EN/FR + a11y support.

## Core Game Loop

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  TITLE   │───▶│  CREATE  │───▶│ DUNGEON  │◀──┐
│ (Start /  │    │ (Race +  │    │ (Explore)│   │ Save/Load
│  Continue)│    │  Class)  │    └────┬─────┘   │
└──────────┘    └──────────┘         │         │
                          ┌──────────┼──────────┤
                          ▼          ▼          ▼
                   ┌─────────┐ ┌─────────┐ ┌──────────┐
                   │ COMBAT  │ │  LOOT   │ │  STAIRS  │
                   │ Click/  │ │ Pick up │ │ Descend  │
                   │ Keyboard│ │ equip   │ │ deeper   │
                   └─────────┘ └─────────┘ └────┬─────┘
                                                │
                          ┌─────────────────────┼─────────────┐
                          ▼                     ▼             ▼
                   ┌────────────┐       ┌───────────┐  ┌──────────┐
                   │ NEXT FLOOR │       │ BOSS FLOOR│  │  DEATH   │
                   │ (harder)   │       │ (every 5) │  │ (Titles) │
                   └────────────┘       └───────────┘  └──────────┘
```

## v0.2 Feature Matrix

| Feature | Status | File |
|---------|--------|------|
| Procedural audio (Web Audio API) | ✅ 12 SFX + ambient | `src/audio.ts` |
| Particle system (damage, sparks, level-up) | ✅ 6 effect types | `src/particles.ts` |
| CSS animations (fades, shakes, pulses) | ✅ 13 keyframes | `src/dungeon-delver.css` |
| Room-based dungeon generation | ✅ rooms + corridors | `DungeonDelverGame.tsx` |
| Boss floors (every 5) | ✅ 3 boss types | `DungeonDelverGame.tsx` |
| Item rarity (5 tiers) | ✅ common→legendary | `DungeonDelverGame.tsx` |
| Save/Load run (localStorage) | ✅ auto-save on descend | `DungeonDelverGame.tsx` |
| Keyboard navigation (WASD+ZQSD) | ✅ Space attack, > stairs | `DungeonDelverGame.tsx` |
| Touch controls (mobile D-pad) | ✅ 5-button D-pad | `DungeonDelverGame.tsx` |
| Responsive canvas scaling | ✅ resize-aware | `DungeonDelverGame.tsx` |
| Minimap | ✅ top-right overlay | `DungeonDelverGame.tsx` |
| Accessibility (ARIA live, keyboard) | ✅ screen reader, focus | `DungeonDelverGame.tsx` |
| Character icons (per race) | ✅ emoji-based | `DungeonDelverGame.tsx` |
| 25 items (was 15) | ✅ boots, helm, cape, tome | `DungeonDelverGame.tsx` |
| 10 titles (was 8) | ✅ Executioner, Pioneer | `DungeonDelverGame.tsx` |
| Toasts / notifications | ✅ level-up, boss, save | `DungeonDelverGame.tsx` |

## Races

| ID | Name | Stats | Resistances | Icon |
|----|------|-------|-------------|------|
| human | Human / Humain | STR+1 STA+1 WIL+1 INT+1 | — | 🧑 |
| elf | Elf / Elfe | INT+3 WIL+2 STA-1 | Ice+15% | 🧝 |
| dwarf | Dwarf / Nain | STA+3 STR+1 INT-1 | Fire+25% | 🪓 |
| vampire | Vampire / Vampire | STR+1 INT+2 WIL+1 | Poison+30% | 🧛 |
| demon | Demon / Démon | STR+3 STA+1 WIL-1 | Fire+40% Lightning+15% | 😈 |
| golem | Golem / Golem | STA+4 STR+2 INT-2 | Poison+50% Ice+20% | 🗿 |
| celestial | Celestial / Céleste | WIL+4 INT+2 STR-1 | Lightning+40% Ice+20% | ✨ |

## Classes

| ID | Type | Stats | Skill | Icon |
|----|------|-------|-------|------|
| warrior | Melee | STR+3 STA+2 | Cleave: 3 adjacent | ⚔️ |
| mage | Ranged | INT+4 WIL+2 STR-2 | Barrage: 3-tile AoE | 🔮 |
| rogue | Hybrid | STR+2 INT+1 STA+1 | Backstab: 2x behind | 🗡️ |
| paladin | Melee | STR+2 STA+2 WIL+2 | Holy Light: 25% / 5 turns | 🛡️ |
| necromancer | Ranged | INT+3 WIL+2 STR-1 | Soul Drain: 40% spell lifesteal | 💀 |

## Monsters by Depth

| Floor | Monsters |
|-------|----------|
| 1-2 | Giant Rat, Skeleton, Goblin, Slime (poison) |
| 3-4 | Giant Spider (poison), Zombie, Orc Warrior |
| 5 | 🐀 **BOSS: Rat King** |
| 5-6 | Wraith (ice), Zombie, Orc |
| 7-9 | Cave Troll, Lich (lightning) |
| 10 | 💀 **BOSS: Skeleton Lord** (ice) |
| 10+ | Young Dragon (fire), Void Horror (lightning) |
| 15 | 🐲 **BOSS: Ancient Dragon** (fire) |

## Item Rarity System

| Tier | Color | Weight | Example |
|------|-------|--------|---------|
| Common | #aaa (gray) | 50% | Iron Sword, Oak Staff |
| Uncommon | #4caf50 (green) | 28% | Shadow Dagger, Chainmail |
| Rare | #2196f3 (blue) | 14% | Greatsword, Arcane Staff |
| Epic | #9c27b0 (purple) | 6% | Plate Armor, Phoenix Ring |
| Legendary | #ffd700 (gold) | 2% | Starcrown, Void Blade |

## Audio System (Procedural, Web Audio API)

| Type | Description |
|------|-------------|
| `hit` | Short square wave thud |
| `crit` | Rising sawtooth with punch |
| `death` | Deep descending sawtooth |
| `block` | Quick triangle click |
| `step` | Subtle bass tap |
| `stairs` | Descending 4-note arpeggio |
| `click` | Short sine tick |
| `equip` | Double sine ping |
| `pickup` | Rising sine sweep |
| `levelUp` | Triumphant 5-note ascending arpeggio |
| `bossAppear` | Dramatic layered chord |
| `ambient` | Sawtooth drone + harmonic, floor-dependent frequency LFO |

## Particle System

| Effect | Trigger | Visual |
|--------|---------|--------|
| `spawnDamage` | Combat hit/crit/heal | Floating numbers (+gravity) |
| `spawnSparks` | Combat impact | Colored burst particles |
| `spawnLevelUp` | Level-up | Golden ring burst (40 particles) |
| `spawnSparkle` | Item pickup | Golden shimmer |
| `spawnDeathBurst` | Player/monster death | Dark explosion (50 particles) |

## Controls

| Input | Action |
|-------|--------|
| Click tile | Move to tile |
| Click adjacent monster | Attack |
| Click distant monster (ranged) | Ranged attack |
| WASD / ZQSD / Arrows | Move player |
| Space / Enter | Attack nearest adjacent |
| > / . / , | Descend stairs |
| I | Open inventory |
| Esc | Close inventory |
| Mobile D-pad | Directional movement + attack button |

## CSS Animations

| Class | Animation |
|-------|-----------|
| `dd-anim-fade-in` | Opacity + translateY |
| `dd-anim-slide-up` | Slide from below |
| `dd-anim-shake` | Horizontal shake (damage) |
| `dd-anim-pulse-gold` | Box-shadow pulse |
| `dd-anim-title-enter` | Scale+rotate entrance |
| `dd-anim-damage-flash` | Red background flash |
| `dd-anim-heal-flash` | Green background flash |
| `dd-level-up-glow` | Gold drop-shadow pulse |

All animations respect `prefers-reduced-motion: reduce`.

## Accessibility

- **ARIA live region** for combat log announcements (`role="status"`)
- **Keyboard navigable** race/class cards (`aria-pressed`, `focus-visible`)
- **Canvas keyboard handler** for full keyboard movement + combat
- **Screen reader accessible** inventory (`aria-label` on every slot)
- **`prefers-reduced-motion`** disables all animations
- **Touch targets ≥ 44px** (WCAG 2.1 AAA)

## Technical

| Aspect | Detail |
|--------|--------|
| Engine | React + Canvas 2D |
| Game Loop | `useGameLoop` from `@games/_engine` (10 FPS AI) |
| Resolution | 640×480 logical, retina-aware DPR scaling |
| Grid | 20×13 dungeon + 64px HUD, room-based generation |
| Audio | Web Audio API, zero MP3 files |
| State | React `useState` + `useRef` for mutable stats |
| Persistence | `localStorage` (titles + save game) |
| Package | `packages/games/dungeon-delver/` |
| Total lines | ~1440 (game) + ~200 (audio) + ~170 (particles) + ~230 (CSS) |

## Files Inventory

```
packages/games/dungeon-delver/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                          # Barrel export
│   ├── audio.ts                          # Procedural audio (12 SFX)
│   ├── particles.ts                      # Particle system
│   ├── dungeon-delver.css                # CSS animations + responsive
│   └── components/
│       └── DungeonDelverGame.tsx          # Full game (~1440 lines)
public/images/games/
├── dungeon-delver-card.svg               # Game card (400×300)
└── dungeon-delver-bg.svg                 # Dungeon background (640×480)
docs/games/
└── dungeon-delver-design.md              # This document
```

## Roadmap (v0.3+)

- [ ] Leaderboard integration (deepest floor, fastest clear)
- [ ] PostGameCTA + game:complete dispatch
- [ ] Perk/skill tree on level-up choices
- [ ] Merchant shops between floors
- [ ] Achievements system
- [ ] More consumable types (bombs, teleport scrolls, identify scrolls)
- [ ] Equipment set bonuses
- [ ] Daily challenge mode (seeded run)
- [ ] Multiplayer co-op (experimental)