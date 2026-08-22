# GameHub — Comprehensive Remaining Tasks & Recommendations

**Audit Date**: 2026-08-22
**Scope**: All 20 games, engine layers, assets, Glyph Weaver integration, NF compliance

---

## Executive Summary

GameHub is ~88% production-ready. 20 games in roster. Three point-and-click games are feature-complete with procedural audio, atmospheric backgrounds, and bilingual support. Glyph Weaver is integrated via launchpad mode. Remaining work is split into Quick Wins (<1 day), Medium (1-3 days), and Deferred (next sprint).

---

## Quick Wins (< 1 Day Total)

### QW-1: Fix t() at module scope — i18n staleness ✅ DONE

**Systems Discovery**: `t()` called at module level. Fixed.

**Rite of Discovery**: `scenes` useMemo missing `lang` dep. Fixed.

**Fix applied** (2026-08-22):
- Sysdisc: converted `const scenes` to `buildScenes()` + `useMemo(() => buildScenes(), [locale])`
- RiteOfDiscovery: `lang` now derived from `useI18n().locale`, added to scenes useMemo deps
- Created `lib/i18n/standalone.ts` to avoid circular import
- Provider syncs standalone locale via `setStandaloneLocale()`

**Effort**: 1h

### QW-2: Wire PostGameCTA to game endings 🟡

PostGameCTA component exists. Needs to be added to:
- Systems Discovery `SD_OUTRO`, `SD_SPACE_OUTRO`, `SD_OCEAN_OUTRO`
- Toymaker Escape `E3_WRAP`
- Rite of Discovery `OUTRO`

**Effort**: 30min

### QW-3: Fix spell-craft background image extension 🟢

Metadata references `/images/bg-abstract-dark.jpg` — should be `.svg`

**Effort**: 5min

### QW-4: ShadowPuzzle touch support ✅ DONE

Toymaker `E2_SHADOW` canvas uses pointer events. Now extracted as `ShadowPuzzle.tsx` with `onPointerDown/Move/Up` + `touch-none` + `setPointerCapture` for cross-device support.

**Effort**: 1h

### QW-5: t() at module scope — sysdisc scene data as const ✅ DONE

Covered by QW-1 fix (same root cause).

**Effort**: 30min

---

## Medium Effort (1–3 Days Total)

### M-1: Extract toymaker puzzle blocks ✅ DONE

6 puzzle blocks are inline in `ToymakerEscapeGame.tsx` (439 lines total):

| Puzzle | Lines | Description |
|--------|-------|-------------|
| FilingPuzzle | 103 | Sort toys into A/B/C cabinets |
| ShadowPuzzle | 98 | Canvas-based shape alignment |
| LocksPuzzle | 52 | Sequence dial entry |
| BrokenToysPuzzle | 103 | Match toys to missing pieces |
| ToymakerReveal | 24 | Story reveal panel |
| FinalEscapePuzzle | 59 | Final escape dial sequence |

**Fixed** (2026-08-22): All 6 extracted into `packages/games/toymaker-escape/src/puzzles/`. Parent component: 1847 → 1422 lines (-23%). TYPE-CHECK: PASSING.

**Effort**: 2h

### M-2: i18n consolidation 🟡

Two i18n systems exist:
1. `lib/i18n/` (Context-based, 87 keys) — used by gamehub shell
2. `pointclick-engine/src/lib/i18n.ts` (JSON merge, 15 game namespaces) — used by engine

**Fix**: Merge pointclick-engine's i18n into the main Context-based system, removing the engine-level i18n module.

**Effort**: 2h

### M-3: Breakout monolith refactor 🟢

`BreakoutGame.tsx` is 2306 lines. Extract into:
- `BreakoutBoard.tsx` (brick grid rendering)
- `BreakoutPaddle.tsx` (paddle + input)
- `BreakoutBall.tsx` (ball physics)
- `BreakoutPowerUps.tsx` (power-up system)
- `BreakoutHUD.tsx` (score/lives display)

**Effort**: 3h

### M-4: Dead code sweep ✅ DONE

Check for remaining Firebase/GraphQL/STOMP artifacts after Phase 1 cleanup:
- Search for `firebase`, `graphql`, `stomp` in all files
- Remove unused engine modules (`AnimationManager`, `AssetManager`, `MenuSystem`)
- Clean up unused entity types

**Fixed** (2026-08-22):
- Removed `@stomp/stompjs` from dependencies (unused since Phase 1)
- Deleted `firebase.json` (Firebase hosting config, unused)
- Removed Firebase env vars from `.env.example` and `scripts/validate-env.mjs`
- `AnimationManager`/`AssetManager` retained (engine core infrastructure, low-risk to keep)

**Effort**: 1h

### M-5: Game metadata standardization 🟢

Add to `GameEntry` or as a separate manifest:
- `genre`: "arcade" | "puzzle" | "adventure" | "board" | "creative"
- `difficulty`: "easy" | "medium" | "hard"
- `playTime`: string (e.g., "5-10 min")
- `playerCount`: "single" | "multi"
- `ageRating`: string

**Effort**: 1h

### M-6: Loading optimization 🟢

- Add `<link rel="preload">` for heavy game bundles
- Implement chunked loading for WebGL games
- Add loading progress indicators for games >500KB

**Effort**: 2h

### M-7: Glyph Weaver full integration 🟡

Currently in launchpad mode. To enable full in-GameHub experience:

**Option A** (Recommended): Deploy glyph-weaver to Vercel, use iframe embed in GlyphWeaverGame
- Requires: Vercel deployment, domain config
- Effort: 1h

**Option B**: Copy glyph-weaver packages into GameHub
- Requires: Copy 8 packages, adjust imports, rebuild
- Effort: 3h

**Effort**: 1-3h depending on option

---

## Testing (1–2 Days)

### T-1: Unit tests for pointclick puzzle types 🔴

Add vitest tests for:
- pipes (rotate, toggle, solve detection)
- gears (teeth matching, ratio calculation)
- keypad (PIN entry, clear, submit)
- sequence (order, lives, mistake tracking)
- wires (connection, crossing detection)
- anagram (scramble, submit, validation)
- cipher (encode, decode, submit)

**Effort**: 2h

### T-2: Integration tests for save/load 🟢

Test persistence across all 3 point-and-click games:
- Save state serialization/deserialization
- Version migration
- Cross-session recovery

**Effort**: 1h

### T-3: Smoke tests for new games 🟢

Add page-level smoke tests for:
- glyph-weaver (launchpad renders, features listed)
- spell-craft (canvas renders, drawing works)

**Effort**: 1h

### T-4: Mobile-responsive testing 🟢

Test at 320px width:
- All 3 point-and-click games
- All 17 arcade/board games
- Glyph Weaver launchpad

**Effort**: 2h

### T-5: Accessibility pass 🟢

- Keyboard navigation for game controls
- ARIA labels on canvas games
- Focus management in dialogue

**Effort**: 2h

---

## Glyph Weaver — Project-Level Tasks

### GW-1: Update README 🟢

README says packages are "future" but all 8 are 🟢 complete per action-plan. Remove "(future)" annotations.

**Effort**: 10min

### GW-2: Root tsconfig jsx 🟢

Root `tsconfig.json` lacks `"jsx"` setting — `tsc --noEmit` from root fails. Either:
- Add `"jsx": "react-jsx"` to root tsconfig
- Or document that builds must use `tsc --build` (per-package)

**Effort**: 5min

### GW-3: Dictionary panel import 🟢

`packages/ui/src/index.ts` imports from `./components/panels/DictionaryPanel` but the directory structure may not match. Verify.

**Effort**: 30min

### GW-4: Vercel deployment 🔴

Glyph Weaver `apps/web/` needs deployment for full GameHub integration:
- Next.js 15 app, Tailwind 4, pnpm workspace
- Requires: `NEXT_PUBLIC_*` env vars for feature flags
- Recommended: Vercel (same as gamehub)

**Effort**: 1h

### GW-5: Accessibility (deferred) 🔵

WCAG 2.1 AA compliance deferred per action-plan:
- Screen reader support for canvas
- Keyboard navigation for drawing tools
- Color contrast verification

**Effort**: 4h

### GW-6: Onboarding tutorial (deferred) 🔵

First-run tutorial for new users:
- Guided drawing of first glyph
- Element discovery walkthrough
- DSL introduction

**Effort**: 8h

### GW-7: PWA support (deferred) 🔵

- Service worker for offline support
- Install prompt
- App manifest

**Effort**: 4h

---

## NF Compliance — Cross-Project

### Compliance Checklist

| Rule | GameHub | Glyph Weaver |
|------|---------|-------------|
| Node 26.3.0 | ✅ `.nvmrc`, CI | ✅ `.nvmrc`, CI |
| pnpm 11.5.0 | ✅ `packageManager` | ✅ `packageManager` |
| ubuntu-24.04 CI | ✅ `.github/workflows` | ✅ `.github/workflows` |
| TypeScript strict | ✅ Per-package | ✅ Root + per-package |
| i18n EN/FR, FR default | ⚠️ Two systems | ✅ React Context |
| Feature flags | ✅ `lib/feature-flags.ts` | ✅ `lib/feature-flags.ts` |
| Encoding scripts | ❌ Missing | ✅ `check-encoding.ps1` + `fix-encoding.ps1` |
| Pre-commit hooks | ✅ typecheck+lint+test+build | ✅ typecheck+lint+test+build |
| No `any` without justification | ⚠️ Some exceptions | ✅ Zod schemas |
| Idempotent migrations | ✅ | N/A (no DB) |
| Performance docs | ✅ | ✅ |
| AGENTS.md | ✅ | ✅ |

### NF Compliance Gaps

| Gap | Project | Priority |
|-----|---------|----------|
| GameHub missing encoding scripts | GameHub | 🟢 Add `scripts/check-encoding.ps1` and `scripts/fix-encoding.ps1` |
| GameHub i18n: two systems | GameHub | 🟡 Consolidated in M-2 |
| Glyph Weaver root tsconfig jsx | Glyph Weaver | 🟢 GW-2 |

---

## Summary Matrix

| Category | Done | Quick Wins | Medium | Deferred |
|----------|------|------------|--------|----------|
| Point-and-Click | 6/7 | 1 (t() fix) | 2 (toymaker, i18n) | — |
| Audio/Assets | 100% | — | — | — |
| Dialogue/UI | 100% | 1 (PostGameCTA) | — | — |
| Glyph Weaver | 80% | — | 2 (deploy, full integration) | 3 (a11y, tutorial, PWA) |
| Arcade/Board Games | 90% | — | 2 (breakout, metadata) | — |
| Testing | 15% | — | 5 (all pending) | — |
| NF Compliance | 80% | 1 (encoding scripts) | — | — |

## Implementation Order

```
QW-1 (t() fix) → QW-2 (PostGameCTA) → QW-3 (spell-craft bg)
→ M-1 (toymaker extraction) → M-2 (i18n consolidation)
→ M-7 (Glyph Weaver deploy) → M-5 (metadata)
→ T-1 (puzzle tests) → T-2 (save/load tests)
→ M-3 (breakout refactor) → T-4 (mobile testing) → T-5 (a11y)
```