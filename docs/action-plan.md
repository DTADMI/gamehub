# GameHub Action Plan

**Last Updated**: March 31, 2026
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

## Remaining Gaps and Tasks

| Priority | Gap | Impact | Recommendation | Status |
| --- | --- | --- | --- | --- |
| P1 | Full legacy Vitest suite triage (non-unit folders) | Some older tests are still outside new staged gates | Incrementally migrate/repair old tests and fold into staged pipelines | IN_PROGRESS |
| P2 | Portfolio/blog media upload workflow | Admin UX still uses URL-only cover image input | Add Supabase Storage upload flow in admin | NEXT |
| P3 | Feature flag management UI | Operational toggles still code/env driven | Build admin-facing feature flag panel with audit metadata | BACKLOG |

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

## Next Execution Steps

| Order | Step | Owner | Target |
| --- | --- | --- | --- |
| 1 | Migrate additional legacy Vitest specs into staged unit/integration buckets | Agent | Next iteration |
| 2 | Add Supabase Storage image upload for blog covers | Agent | Next iteration |
| 3 | Add admin feature-flag management page/API | Agent | Future iteration |
