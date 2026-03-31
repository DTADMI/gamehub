# GameHub Action Plan

**Last Updated**: March 31, 2026
**Current Focus**: Stabilization + architecture consolidation

Legend: `DONE` · `IN_PROGRESS` · `NEXT` · `BACKLOG`

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Type checking | DONE | `pnpm type-check` now passes after first remediation batch |
| Architecture migration | IN_PROGRESS | Dual namespace (`@games/shared` + `@gamehub/game-platform`) still present |
| Test reliability | IN_PROGRESS | Vitest path mapping fixed; full suite still needs cleanup pass |
| Game launcher gating | DONE | Local upcoming-play behavior aligned with launchable game check |
| Supabase typing model | IN_PROGRESS | Runtime and compile stabilized via typed casts; strict DB typing model still needs finalization |

## Remaining Gaps and Tasks

| Priority | Gap | Impact | Recommendation | Status |
| --- | --- | --- | --- | --- |
| P0 | Dual package namespace (`@games/shared` and `@gamehub/game-platform`) | Ongoing migration complexity and import drift | Complete codemod and remove legacy alias surface | IN_PROGRESS |
| P0 | `next.config.ts` still uses `typescript.ignoreBuildErrors` | Can hide regressions in CI/build | Remove flag after CI gate hardening | NEXT |
| P0 | Supabase auth-helper typing does not infer table types cleanly | Forces local casts and weakens type confidence | Migrate to `@supabase/ssr` typed clients and regenerate DB types | NEXT |
| P1 | Legacy point-click compatibility layer now exists but adds debt | Extra maintenance surface | Keep for short-term compatibility, then remove after import migration | IN_PROGRESS |
| P1 | Full Vitest suite includes stale targets from old layout/routes | Test noise and CI instability | Triage failing tests by ownership and prune dead tests | NEXT |
| P1 | No enforced architecture gate in CI | Regressions can reappear | Add CI steps: `type-check`, smoke unit tests, smoke e2e | NEXT |
| P2 | Placeholder/upcoming game entries still mixed in manifest | User expectation mismatch risk | Keep `impl:none` non-playable by default and add roadmap metadata UI | BACKLOG |
| P2 | Portfolio/blog UX still missing media workflow | Limits content publishing quality | Add Supabase Storage upload flow for blog covers | NEXT |
| P3 | Feature flag management is developer-centric only | Ops friction | Build admin flag UI + audit trail | BACKLOG |

## Recommendations

| Recommendation | Pros | Cons | Decision |
| --- | --- | --- | --- |
| Standardize on `@gamehub/game-platform` and deprecate `@games/shared` | Removes ambiguity, improves onboarding, cleaner tooling | Requires broad import updates | Adopt now |
| Replace deprecated auth helpers with `@supabase/ssr` | Better forward compatibility and typed client control | Migration work across server/client utilities | Start next sprint |
| Enforce CI quality gates before deploy | Prevents silent regressions | Longer CI runtime | Adopt now |
| Keep short-lived compatibility re-exports during migration | Lower risk during transition | Temporary technical debt | Keep temporarily, remove after migration |

## Implementation Started (This Session)

| Item | Result |
| --- | --- |
| Fixed type-check blockers in `GameContext`, `RichTextEditor`, `resizable` component API alignment | DONE |
| Added/validated missing package dependencies and workspace install consistency | DONE |
| Fixed game launcher local-upcoming gating consistency and launchability checks | DONE |
| Added point-click compatibility re-exports and alias wiring (TS/Next/Vitest) | DONE |
| Stabilized blog/resume/admin Supabase call sites to restore compile health | DONE |
| Started app-layer import migration from `@games/shared` to `@gamehub/game-platform` | DONE |
| Verified `pnpm type-check` | PASSING |

## Next Execution Steps

| Order | Step | Owner | Target |
| --- | --- | --- | --- |
| 1 | Codemod remaining `@games/shared` imports to `@gamehub/game-platform` | Agent | Immediate |
| 2 | Introduce `@supabase/ssr` clients and replace current client/server helpers | Agent | Immediate |
| 3 | Remove `ignoreBuildErrors` and add CI gates (`type-check`, targeted tests) | Agent | Immediate |
| 4 | Run and triage full Vitest + Playwright smoke set | Agent | After steps 1-3 |
| 5 | Clean compatibility re-export layer after migration completion | Agent | Final cleanup |
