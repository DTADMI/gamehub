# GameHub Action Plan

**Last Updated**: April 1, 2026
**Current Focus**: Deployment-ready stabilization (Vercel + GitHub)

Legend: `DONE` · `IN_PROGRESS` · `NEXT` · `BACKLOG`

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Type checking | DONE | `pnpm type-check` passing |
| Architecture migration | DONE | App/tests migrated to `@gamehub/game-platform` and `@games/pointclick-engine` imports |
| Test reliability | DONE | Dedicated runnable test stages: unit, integration, e2e smoke |
| Game launcher gating | DONE | Local upcoming-play behavior aligned with launchable game check |
| Supabase SSR auth clients | DONE | `@supabase/ssr` used in browser, server, and proxy auth guard |
| CI/CD deployment path | DONE | GitHub Actions + Vercel deployment workflow configured |
| Redis provider | DONE | Upstash Redis adapter with safe in-memory fallback for local/CI |
| Leaderboard auth gating | DONE | `/leaderboard` now requires signed-in session to access ranking preview content |
| Admin feature-flag pilot UI | DONE | `/admin/flags` now controls local rollout toggles |
| Local CI parity gate | DONE | Pre-push now runs `pnpm ci:local` to mirror pipeline checks |
| UI/UX recommendation integration pass | DONE | Enhanced cards/carousel + hero/loading feedback + leaderboard teaser integrated in active runtime files |

## Remaining Gaps and Tasks

| Priority | Gap | Impact | Recommendation | Status |
| --- | --- | --- | --- | --- |
| P1 | Full legacy Vitest suite triage (non-unit folders) | Some older tests are still outside new staged gates | Incrementally migrate/repair old tests and fold into staged pipelines | IN_PROGRESS |
| P2 | Portfolio/blog media upload workflow | Admin UX still uses URL-only cover image input | Add Supabase Storage upload flow in admin | NEXT |
| P1 | Server-backed feature flag persistence | Flags are now persisted via Supabase + audited admin API with Redis fallback | Continue with dashboard analytics and staged rollout tooling | DONE |
| P2 | Real leaderboard backend | Scores and seasons are now server-backed with validation and rate limits | Added moderation workflows, season lock controls, and active-season guardrail | DONE |
| P3 | Feature flag management UI | Admin matrix + sensitive toggle restrictions now enforced | Added audit timeline view and CSV export from admin | DONE |
| P1 | Post-game completion CTA modal integration | Auth CTA is available in launcher and ranking flows | Expand to unified modal contracts in all games | IN_PROGRESS |

## Recommendations

| Recommendation | Pros | Cons | Decision |
| --- | --- | --- | --- |
| Keep staged test pipeline (`unit` / `integration` / `e2e smoke`) in CI | Fast, deterministic checks on every PR | Legacy tests need separate migration plan | Adopted |
| Use `@supabase/ssr` as default auth client layer | Future-proof for Next.js and server/client parity | Requires strict env discipline | Adopted |
| Use Upstash Redis with memory fallback in non-configured environments | Vercel-friendly + local developer resilience | Fallback path is not production-equivalent | Adopted |

## Implemented This Pass

| Item | Result |
| --- | --- |
| Migrated Supabase from auth helpers to `@supabase/ssr` (client/server/proxy) | DONE |
| Added Upstash Redis adapter (`lib/redis.ts`) | DONE |
| Added `/api/health` dependency health endpoint | DONE |
| Removed `ignoreBuildErrors` and completed alias cleanup | DONE |
| Completed namespace migration off `@games/shared` in app/tests | DONE |
| Added CI workflows for quality, unit/integration, e2e smoke | DONE |
| Added Vercel deployment workflow + `vercel.json` | DONE |
| Added and validated unit/integration/e2e smoke commands | DONE |
| Ran end-to-end local validation (`pnpm test:all`) | PASSING |
| Added signed-in gating for leaderboard route | DONE |
| Added games account CTA for profile/leaderboard unlock messaging | DONE |
| Added admin flags management page | DONE |
| Fixed integration test crash on `/api/health` optional request handling | DONE |
| Upgraded CI workflow actions and switched to Corepack-managed pnpm | DONE |
| Added Supabase-backed feature flags + audit API + role-gated admin controls | DONE |
| Added Supabase-backed leaderboard seasons/scores with anti-spam and rate-limit guardrails | DONE |
| Added e2e coverage for leaderboard auth gating and admin flags toggles | DONE |
| Added leaderboard moderation APIs/UI, season lock + activation controls, and moderation audit trail | DONE |
| Added feature flag audit timeline endpoint + admin CSV export | DONE |
| Added blog cover image upload API (Supabase Storage) + admin UI integration | DONE |
| Added and applied migration `003_leaderboard_moderation_and_flags_audit.rollout.sql` | DONE |

## Next Execution Steps

| Order | Step | Owner | Target |
| --- | --- | --- | --- |
| 1 | Migrate additional legacy Vitest specs into staged unit/integration buckets | Agent | Next iteration |
| 2 | Complete post-game CTA modal wiring across all game end events | Agent | Next iteration |
| 3 | Migrate additional legacy Vitest specs into staged unit/integration buckets | Agent | Ongoing |
