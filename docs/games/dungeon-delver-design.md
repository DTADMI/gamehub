# Dungeon Delver — Game Design Document

**Owner**: GameHub Team  
**Last Updated**: 2026-08-24  
**Version**: 0.1.0 (MVP)

## Overview

**Dungeon Delver** (FR: *Fouilleur de Donjon*) is a browser-based rogue-lite dungeon crawler for GameHub. It is a spiritual successor to *Hack Slash Crawl* (Hatched Games / Void, 2011, koreus.com), reimagined as a modern React + Canvas game with bilingual EN/FR support, meta-progression, and leaderboard integration.

### Inspiration

The original Hack Slash Crawl was a Flash-based semi-roguelike RPG where players choose a race and class, then explore randomly-generated dungeons fighting monsters, collecting loot, and leveling up. Key features included:

- 7 races (Human, Atlantian, Vampire, Demon, Goblin, Golem, Celestial)
- 5 classes (Warrior, Necromancer, Mage, Paladin, Cursed)
- 4 stats: Strength, Stamina, Willpower, Intellect
- 4 resistances: Fire, Ice, Poison, Electricity
- Random dungeon generation
- "Titles" earned on death for meta-progression

### Elevator Pitch

> Choose your race and class, then descend into the depths of a procedurally-generated dungeon. Fight monsters, collect legendary loot, and earn Titles that persist across lives. How deep can you go?

## Core Game Loop

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ TITLE SCREEN │───▶│ CHAR CREATE  │───▶│   DUNGEON    │
│  (Start)      │    │ (Race+Class) │    │  (Explore)   │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          ▼                    ▼                    ▼
                   ┌────────────┐      ┌────────────┐      ┌────────────┐
                   │ COMBAT     │      │ LOOT       │      │ STAIRS     │
                   │ (Click to  │      │ (Pick up   │      │ (Descend   │
                   │  attack)   │      │  items)    │      │  deeper)   │
                   └────────────┘      └────────────┘      └─────┬──────┘
                                                                  │
                                               ┌──────────────────┘
                                               ▼
                                        ┌────────────┐
                                        │ NEXT FLOOR │
                                        │ (harder    │
                                        │  enemies)  │
                                        └─────┬──────┘
                                              │
                          ┌───────────────────┼───────────────────┐
                          ▼                                       ▼
                   ┌────────────┐                          ┌────────────┐
                   │  CONTINUE  │                          │   DEATH    │
                   │  (repeat)  │                          │ (Earn Title│
                   └────────────┘                          │  Restart)  │
                                                           └────────────┘
```

## Races

| ID | Name (EN/FR) | Stats | Resistances | Ability |
|----|-------------|-------|-------------|---------|
| human | Human / Humain | STR+1 STA+1 WIL+1 INT+1 | — | Perseverance: +10% XP |
| elf | Elf / Elfe | INT+3 WIL+2 STA-1 | Ice+15% | Arcane Affinity: +15% magic dmg |
| dwarf | Dwarf / Nain | STA+3 STR+1 INT-1 | Fire+25% | Forgeborn: +20% armor |
| vampire | Vampire / Vampire | STR+1 INT+2 WIL+1 | Poison+30% | Blood Drain: heal 20% melee dmg |
| demon | Demon / Démon | STR+3 STA+1 WIL-1 | Fire+40% Lightning+15% | Hellfire: +25% fire dmg |
| golem | Golem / Golem | STA+4 STR+2 INT-2 | Poison+50% Ice+20% | Stoneform: +30 HP, poison immune |
| celestial | Celestial / Céleste | WIL+4 INT+2 STR-1 | Lightning+40% Ice+20% | Divine Grace: 15% dmg negate |

## Classes

| ID | Name (EN/FR) | Stats | Type | Skill |
|----|-------------|-------|------|-------|
| warrior | Warrior / Guerrier | STR+3 STA+2 | Melee | Cleave: hits 3 adjacent |
| mage | Mage / Mage | INT+4 WIL+2 STR-2 | Ranged | Arcane Barrage: 3-tile AoE |
| rogue | Rogue / Voleur | STR+2 INT+1 STA+1 | Hybrid | Backstab: 2x from behind |
| paladin | Paladin / Paladin | STR+2 STA+2 WIL+2 | Melee | Holy Light: 25% heal / 5 turns |
| necromancer | Necromancer / Nécromancien | INT+3 WIL+2 STR-1 | Ranged | Soul Drain: 40% spell lifesteal |

## Stats

| Stat | Abbr | Effect |
|------|------|--------|
| Strength | STR | Melee damage (+2 per point) |
| Stamina | STA | Max HP (+8 per point) |
| Willpower | WIL | Healing boost, resistance |
| Intellect | INT | Magic damage (+3 per point), Max MP (+5 per point) |

## Resistances

- 🔥 Fire
- ❄️ Ice  
- ☠️ Poison
- ⚡ Lightning

Resistances reduce incoming damage of that element by the percentage value (capped at 75%).

## Monsters (by depth)

| Floor | Monsters |
|-------|----------|
| 1-2 | Giant Rat, Skeleton, Goblin, Slime |
| 3-4 | Giant Spider, Zombie, Orc Warrior |
| 5-6 | Wraith (ice), Zombie, Orc |
| 7-9 | Cave Troll, Lich (lightning) |
| 10+ | Young Dragon (fire), Void Horror (lightning), Lich |

Monsters scale: HP increases by `floor * 2`.

## Items

### Weapons
- Iron Sword, Battle Axe, Oak Staff, Shadow Dagger, Greatsword, Arcane Staff

### Armor
- Leather Armor, Chainmail, Plate Armor

### Accessories
- Ring of Fire, Ring of Frost, Amulet of Life

### Consumables
- Health Potion (+30 HP), Mana Potion (+20 MP), Scroll of Power (+3 STR/INT)

## Meta-Progression: Titles

Titles are permanent bonuses earned on death, persisting across runs via `localStorage`.

| Title | Requirement | Bonus |
|-------|-------------|-------|
| Fledgling Delver | Reach floor 2 | STA+2 |
| Dungeon Scout | Reach floor 5 | STR+1 STA+3 |
| Crypt Walker | Reach floor 8 | STR+2 STA+4 INT+1 |
| Abyss Strider | Reach floor 10 | STR+3 STA+5 INT+2 WIL+2 |
| Monster Slayer | Kill 50 enemies | STR+2 |
| Dragonbane | Kill a dragon | STR+2 INT+2 |
| Lorewarden | Collect 20 items | INT+2 WIL+1 |
| Phantom | Die on floor 1 (hidden) | WIL+1 |

## Controls

- **Click** empty tile to move
- **Click** adjacent monster to melee attack
- **Click** distant monster (ranged classes) to ranged attack
- **Click** stairs when standing on them to descend
- **Press I** to open inventory
- **Press Escape** to close inventory
- **Click** items in inventory to equip/use

## Technical Implementation

| Aspect | Detail |
|--------|--------|
| Engine | React + Canvas 2D |
| Game Loop | `useGameLoop` from `@games/_engine` |
| Rendering | 640×480 canvas, 32×32 grid cells, 20×13 dungeon area + 64px HUD |
| DPR | Retina-aware (`window.devicePixelRatio`) |
| i18n | Bilingual EN/FR via inline translations |
| State | React `useState` for game state; `localStorage` for title persistence |
| Package | `packages/games/dungeon-delver/` |
| Lines | ~935 (including all game data, rendering, AI, and UI) |

## Roadmap (v0.2+)

- [ ] Sound effects (combat, item pickup, level up, death)
- [ ] Particle effects (combat sparks, level-up glow)
- [ ] Leaderboard integration (deepest floor)
- [ ] Save/Load run state
- [ ] Boss monsters on every 5th floor
- [ ] Equipment rarity tiers (Common/Rare/Epic/Legendary)
- [ ] More consumable types (bombs, shields, teleport scrolls)
- [ ] Touch/mobile swipe controls
- [ ] Accessibility: keyboard-only navigation mode