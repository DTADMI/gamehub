# Glyph Weaver — GameHub Integration Gap Analysis

**Date**: 2026-08-23
**Last Updated**: 2026-08-23 (all gaps addressed)
**Scope**: Full native integration audit of GW into GameHub as a roster game

---

## Status: COMPLETE ✅

All identified gaps have been addressed. GW is now a fully integrated native roster game.

---

## Architecture Principle

> GW must be a game in GH's roster like all others — not a standalone that GH just happens to load. The standalone glyph-weaver monorepo is a PoC/experiment. Content + engines live inside GH.

---

## Current State

GW packages are copied into `packages/games/glyph-weaver/packages/`:
core, dictionary, parser, compiler, dsl, renderer, ui, tools.

`GlyphWeaverGame.tsx` wraps `GlyphWeaverShell`, and the page uses `GameShell` + `next/dynamic`.

---

## Gap Inventory

### ✅ GW-001: i18n Duplication — FIXED

GW's provider reads GH's `gamehub-locale` cookie first, then falls back to own storage.
Listens for `gamehub:localeChange` custom event dispatched by GH's I18nProvider.
When GW changes locale, it syncs back to both storage keys.

### ✅ GW-002: Theme Duplication — FIXED

ThemeProvider now sets `data-theme` on its own container div (via ref), not `documentElement`.
GW no longer interferes with GH's theme system.

### ✅ GW-003: iframe Code — REMOVED

Pure bundled mode only. No env var or iframe logic.

### ✅ GW-004: Missing Auth Integration — FIXED

GW page imports `useAuth()` from `@gamehub/game-platform/contexts/AuthContext`.
Shows sign-in prompt for guest users matching spell-craft pattern.

### ✅ GW-005: Missing gameSlug in Page — FIXED

`gameSlug="glyph-weaver"` passed to GameShell.

### ✅ GW-006: No game:complete Event — FIXED

`useGameCompleteEvent()` hook in GlyphWeaverGame subscribes to store and dispatches
`game:complete` custom event when spell transitions to `active` status.

### ✅ GW-007: Styling Isolation — FIXED

`--gw-*` CSS custom properties injected via `<style>` block in GlyphWeaverGame.
Scoped to `.gw-root` wrapper div. Light theme values via `[data-theme='light'] .gw-root`.

### ✅ GW-008: Save/Persistence Gap — DEFERRED

GW's own localStorage persistence is sufficient. No GH save system integration needed.

### ✅ GW-009: Tool/Export Features Stub — FIXED

Save wired to `PersistenceManager.saveSlot('current', ...)`.
Export wired to `exportToSVG()` with browser download trigger.

---

## Implementation Log

| ID | Task | Status | Date |
|----|------|--------|------|
| GW-003 | Remove iframe code | ✅ | 2026-08-23 |
| GW-001 | i18n sync with GH | ✅ | 2026-08-23 |
| GW-005 | Add gameSlug prop | ✅ | 2026-08-23 |
| GW-006 | Add game:complete event | ✅ | 2026-08-23 |
| GW-007 | CSS vars injected | ✅ | 2026-08-23 |
| GW-002 | Scope ThemeProvider to container | ✅ | 2026-08-23 |
| GW-004 | Auth integration | ✅ | 2026-08-23 |
| GW-009 | Wire save/export tools | ✅ | 2026-08-23 |

All gaps addressed. GW-008 (save/persistence) deferred — localStorage is sufficient.