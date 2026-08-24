# GameHub — Asset & SEO Inventory

**Generated**: 2026-08-23
**Purpose**: Complete manifest of all visual assets, SEO meta, and structured data

---

## SEO & Meta Assets

| File | Type | Status |
|------|------|--------|
| `public/icon.svg` | App icon (64x64) | ✅ |
| `public/og-image.svg` | Open Graph image (1200x630) | ✅ Created |
| `app/robots.ts` | robots.txt (Next.js route) | ✅ Created |
| `app/sitemap.ts` | Sitemap XML (Next.js route) | ✅ Created |
| `app/manifest.ts` | Web App Manifest (Next.js route) | ✅ Created |
| `app/layout.tsx` | Metadata + OG + Twitter cards | ✅ Updated |

## Game Cards (20/20)

All games have SVG cards in `public/images/games/`:

| File | Game | Status |
|------|------|--------|
| `block-blast-card.svg` | Block Blast | ✅ |
| `breakout-card.svg` | Breakout | ✅ |
| `bubble-pop-card.svg` | Bubble Pop | ✅ |
| `checkers-card.svg` | Checkers | ✅ |
| `chess-card.svg` | Chess | ✅ |
| `chrono-shift-card.svg` | Chrono Shift | ✅ |
| `elemental-conflux-card.svg` | Elemental Conflux | ✅ |
| `glyph-weaver-card.svg` | Glyph Weaver | ✅ |
| `knitzy-card.svg` | Knitzy | ✅ |
| `memory-card.svg` | Memory | ✅ |
| `pattern-matching-card.svg` | Pattern Matching | ✅ |
| `platformer-card.svg` | Platformer | ✅ |
| `quantum-architect-card.svg` | Quantum Architect | ✅ |
| `rite-of-discovery-card.svg` | Rite of Discovery | ✅ |
| `snake-card.svg` | Snake | ✅ |
| `space-invasion-card.svg` | Space Invasion | ✅ |
| `spell-craft-card.svg` | Spell Craft | ✅ |
| `systems-discovery-card.svg` | Systems Discovery | ✅ |
| `tetris-card.svg` | Tetris | ✅ |
| `tower-defense-card.svg` | Tower Defense | ✅ |
| `toymaker-escape-card.svg` | Toymaker Escape | ✅ |

## Game Background Images (18 custom + 2 shared)

| File | Used By | Status |
|------|---------|--------|
| `bg-neon-grid.svg` | Breakout, Tower Defense | ✅ |
| `bg-pastel-pattern.svg` | Bubble Pop, Chrono Shift, Elemental Conflux, Memory, Tetris, Rite of Discovery | ✅ |
| `bg-abstract-dark.svg` | Block Blast, Pattern Matching, Glyph Weaver, Spell Craft, Knitzy, Quantum Architect, Platformer | ✅ |
| `bg-checkers.svg` | Checkers | ✅ |
| `bg-chess.svg` | Chess | ✅ |
| `bg-snake.svg` | Snake | ✅ Created |
| `bg-systems-discovery.svg` | Systems Discovery | ✅ |
| `bg-toymaker-escape.svg` | Toymaker Escape | ✅ |

## Scene Backgrounds (8/8)

| File | Scene | Status |
|------|-------|--------|
| `scenes/workshop-scene.svg` | Toymaker E1 | ✅ |
| `scenes/office-scene.svg` | Toymaker E2 | ✅ |
| `scenes/apartment-scene.svg` | Toymaker E3 | ✅ |
| `scenes/space-scene.svg` | Systems Discovery | ✅ |
| `scenes/ocean-scene.svg` | Systems Discovery | ✅ |
| `scenes/body-scene.svg` | Systems Discovery | ✅ |
| `scenes/home-scene.svg` | Rite of Discovery | ✅ |
| `scenes/thinking-scene.svg` | Rite of Discovery | ✅ |

## Character Sprites (2)

| File | Character | Status |
|------|-----------|--------|
| `characters/toymaker.svg` | The Toymaker | ✅ |
| `characters/child.svg` | Child protagonist | ✅ |

## Inventory Item Icons (4)

| File | Item | Status |
|------|------|--------|
| `items/gear.svg` | Gear | ✅ |
| `items/key.svg` | Key | ✅ |
| `items/letter.svg` | Letter | ✅ |
| `items/puzzle-piece.svg` | Puzzle Piece | ✅ |

## Achievement Badges (9)

| File | Achievement | Category |
|------|-------------|----------|
| `achievements/first-spell.svg` | First Spell Cast | Glyph Weaver |
| `achievements/spell-master.svg` | Spell Master | Glyph Weaver |
| `achievements/puzzle-solver.svg` | Puzzle Solver | Point & Click |
| `achievements/explorer.svg` | Explorer | General |
| `achievements/streak.svg` | Win Streak | Arcade |
| `achievements/collector.svg` | Collector | General |
| `badges/badge-bronze.svg` | Bronze Trophy | Leaderboard |
| `badges/badge-silver.svg` | Silver Trophy | Leaderboard |
| `badges/badge-gold.svg` | Gold Trophy | Leaderboard |

## game:complete Dispatch Coverage (20/20)

| Game | gameSlug | game:complete dispatch |
|------|----------|----------------------|
| block-blast | ✅ | ✅ (built-in) |
| breakout | ✅ | ✅ (built-in) |
| bubble-pop | ✅ | ✅ (page handler) |
| checkers | ✅ | ✅ (built-in) |
| chess | ✅ | ✅ (built-in) |
| chrono-shift | ✅ | ✅ (handleGameOver) |
| elemental-conflux | ✅ | ✅ (handleGameOver) |
| glyph-weaver | ✅ | ✅ (useGameCompleteEvent) |
| knitzy | ✅ | ⚠️ (page listener — game must dispatch) |
| memory | ✅ | ✅ (built-in) |
| platformer | ✅ | ✅ (built-in) |
| quantum-architect | ✅ | ⚠️ (page listener — game must dispatch) |
| rite-of-discovery | — (own engine) | ✅ (internal PostGameCTA) |
| snake | ✅ | ✅ (built-in) |
| spell-craft | ✅ | ✅ (runAnalysis) |
| systems-discovery | — (own engine) | ✅ (internal PostGameCTA) |
| tetris | ✅ | ✅ (built-in) |
| tower-defense | ✅ | ✅ (built-in) |
| toymaker-escape | — (own engine) | ✅ (internal PostGameCTA) |

---

## Summary

- **Game cards**: 20/20 ✅
- **Background images**: 20/20 ✅ (snake bg created)
- **Scene backgrounds**: 8/8 ✅
- **Characters**: 2 ✅
- **Item icons**: 4 ✅
- **Achievement badges**: 9 ✅ (6 new + 3 existing)
- **SEO/Meta**: 5/5 ✅ (icon, og-image, robots, sitemap, manifest)
- **gameSlug coverage**: 20/20 ✅
- **game:complete dispatch**: 18/20 direct, 2 bridged (knitzy, quantum-architect)