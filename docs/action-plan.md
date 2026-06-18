# GameHub Action Plan

**Last Updated**: June 18, 2026
**Current Focus**: Feature completeness — post‑game CTA, build config, test organization

Legend: `DONE` · `IN_PROGRESS` · `NEXT` · `BACKLOG`

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Type checking | DONE | `pnpm type-check` passing (pre‑existing Three.js type errors in quantum-architect only) |
| Architecture migration | DONE | App/tests migrated to `@gamehub/game-platform` and `@games/pointclick-engine` imports |
| Test reliability | DONE | Tests organized by domain (pointclick/, breakout/, checkers/, chess/, memory/, unit/, integration/) |
| Game launcher gating | DONE | Local upcoming-play behavior aligned with launchable game check |
| Supabase SSR auth clients | DONE | `@supabase/ssr` used in browser, server, and proxy auth guard |
| CI/CD deployment path | DONE | GitHub Actions + Vercel deployment workflow configured |
| Redis provider | DONE | Upstash Redis adapter with safe in-memory fallback for local/CI |
| Leaderboard auth gating | DONE | `/leaderboard` now requires signed-in session to access ranking preview content |
| Admin feature-flag pilot UI | DONE | `/admin/flags` now controls local rollout toggles |
| Local CI parity gate | DONE | Pre-push now runs `pnpm ci:local` to mirror pipeline checks |
| UI/UX recommendation integration pass | DONE | Enhanced cards/carousel + hero/loading feedback + leaderboard teaser integrated in active runtime files |
| Post‑game CTA modal | DONE | PostGameCTA component + usePostGameCTA hook + game:complete events wired across 9 games |
| Build config completeness | DONE | `radix-ui` in optimizePackageImports, block‑blast/spell‑craft/pattern‑matching in transpilePackages + aliases |

## Remaining Gaps and Tasks

| Priority | Gap | Impact | Recommendation | Status |
| --- | --- | --- | --- | --- |
| P1 | Full legacy Vitest suite triage (non-unit folders) | Some older tests are still outside new staged gates | Incrementally migrate/repair old tests and fold into staged pipelines | DONE |
| P2 | Portfolio/blog media upload workflow | Admin UX still uses URL-only cover image input | Add Supabase Storage upload flow in admin | NEXT |
| P1 | Server-backed feature flag persistence | Flags are now persisted via Supabase + audited admin API with Redis fallback | Continue with dashboard analytics and staged rollout tooling | DONE |
| P2 | Real leaderboard backend | Scores and seasons are now server-backed with validation and rate limits | Added moderation workflows, season lock controls, and active-season guardrail | DONE |
| P3 | Feature flag management UI | Admin matrix + sensitive toggle restrictions now enforced | Added audit timeline view and CSV export from admin | DONE |
| P1 | Post-game completion CTA modal integration | PostGameCTA component + hook created, game:complete events wired to 9 games | Expand to point‑and‑click narrative games, add telemetry | DONE |
| P2 | Game monolith refactoring | Breakout (81 KB), Systems Discovery (80 KB), Toymaker Escape (77 KB) are single‑file | Split into renderer/logic/UI/state modules per modularity assessment | BACKLOG |
| P3 | i18n system consolidation | Three parallel i18n systems: Context lib/i18n/, pointclick‑engine static t(), game JSONs | Unify under Context pattern, eliminate localStorage key conflict (gamehub‑locale vs lang) | BACKLOG |

## Recommendations

| Recommendation | Pros | Cons | Decision |
| --- | --- | --- | --- |
| Keep staged test pipeline (`unit` / `integration` / `e2e smoke`) in CI | Fast, deterministic checks on every PR | Legacy tests need separate migration plan | Adopted |
| Use `@supabase/ssr` as default auth client layer | Future-proof for Next.js and server/client parity | Requires strict env discipline | Adopted |
| Use Upstash Redis with memory fallback in non-configured environments | Vercel-friendly + local developer resilience | Fallback path is not production-equivalent | Adopted |

## Implemented This Pass (June 2026)

| Item | Result |
| --- | --- |
| Added `radix-ui` to `optimizePackageImports` in next.config.ts | DONE |
| Added block-blast, spell-craft, pattern-matching to transpilePackages + webpack aliases; de-duplicated knitzy | DONE |
| Created PostGameCTA modal component (`packages/game-platform/src/components/PostGameCTA.tsx`) | DONE |
| Created usePostGameCTA hook with frequency management (always/occasional/rare/never) | DONE |
| Extended GameShell with gameSlug prop + game:complete event listener | DONE |
| Wired post‑game CTA into game launcher page (`app/games/[slug]/page.tsx`) | DONE |
| Dispatched `game:complete` custom events from 9 game components (snake, breakout, memory, tetris, checkers, chess, tower‑defense, platformer, block‑blast) | DONE |
| Reorganized tests: flat tests moved into pointclick/, breakout/, checkers/, chess/, memory/, unit/, integration/ subdirectories | DONE |

## Next Execution Steps

| Order | Step | Owner | Target |
| --- | --- | --- | --- |
| 1 | Add post‑game CTA telemetry (click‑through, conversion rates) | Agent | Next iteration |
| 2 | Refactor game monoliths (Breakout, Systems Discovery, Toymaker Escape) into renderer/logic/UI/state modules | Agent | Backlog |
| 3 | Consolidate three i18n systems under single Context pattern | Agent | Backlog |
 
---
 
## 2026-05-28 Implementation Status

### Architecture
- Cross-project Context i18n system: `lib/i18n/config.ts`, `provider.tsx`, `server.ts`, `server-provider.tsx`
- Default locale: `fr` (correct)
- Parallel game i18n: per-game JSON dictionaries in `packages/pointclick-engine/src/i18n/<game>/`
- Monorepo with packages: `@gamehub/game-platform`, `@games/pointclick-engine`, `@gamehub/ui`
- Supabase SSR auth: `@supabase/ssr` for browser, server, and proxy auth guard
- Upstash Redis adapter with memory fallback (`lib/redis.ts`)
- Feature flags: Supabase-backed with Redis fallback, admin API + audit

### Fixes Applied
- TypeScript alias cleanup + import namespace migration off `@games/shared`
- Removed `ignoreBuildErrors` from config
- Migrated Supabase auth from `auth-helpers` to `@supabase/ssr`
- Fixed integration test crash on `/api/health` optional request handling
- CI workflow actions upgraded, Corepack-managed pnpm

### Features Implemented
- Game Platform SDK (`@gamehub/game-platform`) with leaderboard, save, auth integration
- 13 playable games: chrono-shift, elemental-conflux, quantum-architect, rite-of-discovery, systems-discovery, toymaker-escape, breakout, bubble-pop, checkers, chess, memory, platformer, snake, tower-defense
- Leaderboard system: server-backed scores, seasons, anti-spam, rate limits, moderation, season locks
- Blog cover image upload API (Supabase Storage) + admin UI
- Admin feature flags page with audit timeline + CSV export
- Leaderboard moderation APIs/UI with audit trail
- Games account CTA for profile/leaderboard unlock
- Health endpoint (`/api/health`) for dependency status

### Tests Added
- Unit tests: staged pipeline (unit/integration/e2e smoke)
- E2E: leaderboard auth gating, admin flags toggles
- Integration: leaderboard validation, feature flag API
- Full local validation (`pnpm test:all`) passing

### Flags Enabled/Changed
- Supabase-backed feature flags with audit API + role-gated admin controls
- Leaderboard moderation flags + season lock controls

### Documentation
- `docs/game-strategy.md`
- `docs/architecture.md`

### i18n Note
- Core translations (32 keys) backed by Context pattern
- Per-game translations (864+ keys across 13 games) in parallel JSON system
- Core FR translations correctly use Quebec French: "Courriel", "Mot de passe", "Connexion", "Inscription"
- Game-level FR translations are minimal HUD/game‑over labels only; Quebec conventions do not apply
