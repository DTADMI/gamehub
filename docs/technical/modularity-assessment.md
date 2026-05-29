# GameHub — Modularity Assessment

**Date**: 2026-05-29
**Status**: Game platform with monorepo game packages. Good lib/, game packages need work.

## 1. Component Modularity

### Strengths
- **Small components/ directory** (3 files): Minimal shared UI
- **Games in monorepo packages** (`packages/games/`) — proper isolation
- Admin components separated: `components/admin/RichTextEditor.tsx`, `AdminTopBar.tsx`

### Critical Monoliths (in packages/games/)

| File | Size | Issue |
|------|------|-------|
| `packages/games/breakout/src/components/BreakoutGame.tsx` | 83 KB | Full Breakout game in one file |
| `packages/games/systems-discovery/src/index.tsx` | 54 KB | All systems logic in one file |
| `packages/games/toymaker-escape/src/components/ToymakerEscapeGame.tsx` | 46 KB | Single component for entire escape game |
| `packages/games/snake/src/components/SnakeGame.tsx` | 36 KB | Full Snake game in one component |
| `packages/games/elemental-conflux/src/components/ElementalConfluxGame.tsx` | 33 KB | Game logic + rendering combined |
| `packages/games/chrono-shift/src/components/TimeClonePuzzleGame.tsx` | 26 KB | Puzzle logic in monolithic component |
| `packages/games/quantum-architect/src/components/QuantumArchitectGame.tsx` | 27 KB | Single-component game |

### Recommendations
1. **Split game components** into: `{Game}Renderer.tsx`, `{Game}Logic.ts`, `{Game}UI.tsx`, `{Game}State.ts`
2. Extract shared game infrastructure: input handling, leaderboard, game loop, physics to a `packages/game-platform/` shared package
3. Each game package should have its own `lib/` for game-specific logic

## 2. Lib/Service Modularity

### Strengths
- **Well-organized lib/** (30 files, 4 dirs):
  - `lib/i18n/` — Complete i18n with config, server, provider, translations
  - `lib/supabase/` — Client, server, admin, public-server, service-role, types
  - `lib/server/` — Leaderboard, feature-flags-store
  - `lib/admin/` — Roles
- **Feature flags**: Client + server separation
- **Rate limiting**, CSRF, Redis, content cache, query client — all in dedicated files
- **Server locale**: `lib/server-locale.ts` for RSC locale detection

### Concerns
- **`lib/i18n.ts`** and **`lib/i18n/`** — Dual pattern like velvet-galaxy
- **`packages/game-platform/`** contains Firebase + physics (Rapier) — mixed concerns

## 3. Cross-Project Reuse Potential

| Module | Shareable? | Notes |
|--------|-----------|-------|
| `lib/i18n/` | Yes | Full NF i18n reference implementation |
| `lib/server/leaderboard.ts` | Yes | Leaderboard service reusable |
| `packages/game-platform/` | Yes | Game infrastructure could be shared |
| `lib/rate-limit.ts` | Yes | Rate limit pattern |
| `lib/csrf.ts` | Yes | CSRF protection |

## 4. Concern Separation

| Concern | Status | Notes |
|---------|--------|-------|
| Auth | Good | Supabase with client/server separation |
| Data access | Good | Supabase layered + Redis |
| UI rendering | Good | Small component surface |
| Game logic | Poor | Mixed with rendering in monolith components |
| Validation | Adequate | `lib/schemas.ts` present |
| i18n | Good | Full NF pattern |

## 5. Performance Impact

- **Game monoliths**: Each game loads as one chunk. No lazy loading within games.
- Firebase + Rapier3D physics (Rapier is 2MB+) in game-platform package — heavy
- Dynamic imports for individual games would help
- WebGPU access pattern in `packages/game-platform/` is forward-looking

## Summary

| Dimension | Score (1-5) | Notes |
|-----------|-------------|-------|
| Component Modularity | 2/5 | Game monoliths are the main issue |
| Lib/Service Modularity | 4/5 | Clean, well-structured core |
| Cross-Project Reuse | 4/5 | i18n reference, game platform shareable |
| Concern Separation | 3/5 | Lib is good; game packages mix logic + rendering |
| Performance Impact | 3/5 | Heavy game bundles, no intra-game splitting |

**Priority Actions**:
1. Split each game monolith into renderer/logic/UI/state modules
2. Extract shared game infrastructure (input, physics, game loop) as a clean shared package
3. Resolve dual i18n pattern
4. Add lazy loading within game components for complex games
