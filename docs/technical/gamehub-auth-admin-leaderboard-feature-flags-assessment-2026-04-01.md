# GameHub Auth/Admin/Leaderboard/Flags Assessment

Date: April 1, 2026

## Scope

This assessment compares:

1. Historical plan (`docs/action-plan.md`, `docs/action-plan-archive.md`)
2. Current implementation state
3. QuestHunt-inspired operational patterns (`quest-hunt-web/docs/action-plan.md`)

It also documents regressions fixed in this pass and recommendations with pros/cons.

## Planned vs Implemented vs Gaps

| Area | Planned | Current (after this pass) | Gap |
| --- | --- | --- | --- |
| Leaderboard access | Signed-in user value surface | `/leaderboard` gates guest access and uses server-backed entries | Moderation controls now available in `/admin/leaderboard` |
| Games account CTA | Invite account creation for progression features | Games page now includes account CTA with clear benefits | CTA copy is static and not A/B tested |
| Admin account model | Admin users controlled from Supabase (`app_admins`) | Role matrix (`owner/admin/editor/analyst`) enforced in admin surfaces | Needs richer delegated policy UI |
| Feature-flag piloting | Admin-manageable flags (future expansion) | `/admin/flags` reads/writes via audited server API | Audit timeline + CSV export added |
| CI reliability | Pre-merge confidence gates | Local + CI checks improved; integration regression fixed | Need periodic CI runtime version audit |

## Regressions Identified and Fixed

| Regression | Root Cause | Fix |
| --- | --- | --- |
| Missing cards in home/explore/projects | Manifest hooks used empty `initialData` + infinite stale cache | `initialData` now hydrates from metadata source |
| CI integration test failure on `/api/health` | Route assumed `request.headers` always present | Route now accepts optional request and falls back safely |
| `/leaderboard` 404 and unrestricted preview mismatch | Route was missing then re-added without auth gating | Route now exists and is gated to signed-in users |
| Feature-flag operations absent from admin UI | Dashboard only exposed resume/blog content | Added `/admin/flags` and admin home entry |

## QuestHunt-Inspired Patterns Applied

| Pattern (QuestHunt style) | Why it matters | GameHub implementation |
| --- | --- | --- |
| Feature flags as explicit operations surface | Safe rollout and quick rollback | `/admin/flags` operational panel |
| Signed-in gating for competitive/social features | Better anti-abuse baseline + user value exchange clarity | Leaderboard page requires auth |
| Action-plan + technical docs kept aligned | Prevent drift between implementation and roadmap | Added this assessment + updated planning notes |
| CI-first discipline + local parity | Fewer preventable pipeline failures | Added pre-push `ci:local` execution |

## Recommendations (with Pros and Cons)

| Recommendation | Pros | Cons | Decision |
| --- | --- | --- | --- |
| Move feature flags from local storage to Supabase table + audited admin API | Real environment control, role-aware auditing, multi-admin consistency | Adds schema + API complexity | Implemented |
| Add role tiers in `app_admins` (`owner`, `admin`, `editor`, `analyst`) | Safer delegation, reduced blast radius | Additional permission checks across admin routes | Implemented |
| Replace leaderboard preview with server-backed scoring API | Actual product value, better retention loops | Requires anti-cheat and moderation safeguards | Implemented (baseline) |
| Add explicit auth-gated CTA telemetry (click-through, conversion) | Data-driven UX improvements | Additional analytics implementation | Recommended next |
| Keep pre-push local CI mirror (`pnpm ci:local`) | Prevents obvious CI breakage before push | Longer local push cycle | Adopted |

## Security and Operations Notes

1. `/admin/*` remains protected by Supabase session checks and admin table membership.
2. `/api/health` now handles test/runtime invocation safely and remains rate-limited.
3. CI workflows were modernized to reduce Node runtime deprecation warnings by using current action majors and Corepack-managed pnpm.

## Next Implementation Backlog

1. Extend post-game completion contracts so all games share one CTA/telemetry hook.
2. Add fine-grained moderation queue filters (per IP hash, velocity spikes, repeated duplicates).
3. Add delegated admin policy UI for owner approval workflows.
