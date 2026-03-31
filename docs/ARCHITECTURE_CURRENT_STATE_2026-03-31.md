# GameHub Current Structure and Architecture (March 31, 2026)

## Current structure

- `app/`: Next.js App Router pages (home, games, explore, admin, blog, resume, project pages).
- `components/`: app-level UI and admin components.
- `lib/`: Supabase clients (`client`, `server`, `admin`) and generated DB types.
- `packages/game-platform/`: shared platform layer (providers, HUD/shell, flags, metadata).
- `packages/pointclick-engine/`: extracted narrative/point-and-click engine and puzzle modules.
- `packages/ui/`: reusable UI component package.
- `packages/games/*`: individual game packages (breakout, memory, snake, chess, checkers, etc.).
- `tests/` and `tests-e2e/`: Vitest unit/integration tests and Playwright E2E tests.

## Architecture summary

- Frontend: single Next.js app with client-rendered game launch flows.
- Runtime composition: app routes load game entries from `packages/game-platform/src/metadata/games.ts` and dynamic-import game packages.
- Content/CMS: Supabase-backed resume and blog content with admin CRUD pages.
- Feature control: local flag context (`FlagsContext`) and env-based toggles.
- Transitional compatibility: code still uses both `@games/shared` (legacy alias) and `@gamehub/game-platform` (new package identity).

## Functional status

- Partially functional.
- Confirmed working in this pass:
  - Point-click compatibility tests after fixes:
    - `tests/pointclick.engine.test.ts`
    - `tests/pointclick.persistence.test.ts`
- Not fully functional as a platform:
  - `pnpm type-check` fails with multiple errors in admin/blog/resume typing, package exports/aliases, and strict type issues.
  - Some tests and docs still point to pre-migration paths/layout.

## What is missing

- Complete package migration cleanup:
  - Remove dual namespace usage (`@games/shared` vs `@gamehub/game-platform`) and finish migration.
- Stable type safety:
  - Supabase table typings currently produce `never` in several admin/blog/resume flows.
  - `ignoreBuildErrors: true` in Next config hides real regressions.
- Legacy compatibility debt:
  - Older point-click import paths still expected by tests and some code paths.
- Test suite modernization:
  - Vitest config was pointing to old directory layout; fixed in this pass, but remaining tests still reference retired routes/modules.
- Gameplay readiness labeling:
  - Upcoming/stub entries could appear playable in local/dev mode even when implementation was placeholder-only.

## Implemented in this pass

- Added launchability guard in game metadata:
  - `isGameLaunchable(entry)` in `packages/game-platform/src/metadata/games.ts`
- Fixed local/dev upcoming-play logic mismatch:
  - `/games` no longer marks scaffold-only games as playable.
  - `/games/[slug]` now uses same flag seam (`FlagsContext`) and allows local play only for launchable entries.
- Corrected client route shape:
  - `app/games/[slug]/page.tsx` now uses synchronous client component params.
- Added missing alias wiring:
  - `tsconfig.json` and `next.config.ts` now include explicit `@gamehub/game-platform` and `@games/pointclick-engine` paths.
- Fixed incorrect engine import:
  - `E1CabinetCanvas` now imports `GameEngine` from `@games/pointclick-engine`.
- Repaired Vitest monorepo aliases:
  - `vitest.config.ts` now points to `packages/*` instead of retired paths.
- Added compatibility re-exports for legacy point-click paths:
  - `packages/game-platform/src/pointclick/**` re-exports from `@games/pointclick-engine`.

## Prioritized recommendations

1. Complete namespace consolidation to `@gamehub/game-platform` and remove `@games/shared`.
2. Fix Supabase generated types and remove `ignoreBuildErrors`.
3. Clean/retarget stale tests that reference removed routes/modules.
4. Add a CI architecture gate:
   - `pnpm type-check`
   - selected fast Vitest suites
   - smoke Playwright spec(s)
5. Convert remaining placeholder game entries (`impl:none`) into explicit non-playable cards with roadmap metadata.
