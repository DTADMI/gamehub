# GameHub Docs State Index

> Generated 2026-06-29 (Cluster F consolidation). GameHub has 30 SCREAMING_SNAKE_CASE docs
> that are mostly status/evaluation snapshots. This index classifies them as **live** vs
> **superseded/archive** so navigators don't read stale state as current.
>
> Nothing was deleted — superseded docs remain on disk under their original names. This index
> just tells you which to trust. When a doc is superseded, prefer the live replacement.

## Live (current source of truth)

| Doc | Purpose |
| --- | --- |
| `docs/action-plan.md` | Current prioritized backlog |
| `docs/SETUP.md` | Setup / quick start |
| `docs/DEPLOYMENT.md` | Deployment process |
| `docs/QUICK_START.md` | Quick start |
| `docs/ADMIN_DASHBOARD_REQUIREMENTS.md` | Admin dashboard requirements |
| `docs/GAME_ENGINE_STRATEGY.md` | Game engine strategy |
| `docs/PACKAGE_ARCHITECTURE.md` | Monorepo package architecture |
| `docs/ARCHITECTURE_STRATEGY.md` | Architecture strategy |
| `docs/ARCHITECTURE_CURRENT_STATE_2026-03-31.md` | Current architecture state (verify still current before relying) |
| `docs/PERSONAL_BLOG_REQUIREMENTS.md` | Personal blog requirements |
| `docs/UI-UX-INDEX.md` | UI/UX docs index |
| `docs/UI-UX-DESIGN-IMPROVEMENTS.md` | UI/UX design improvements |
| `docs/UI-UX-IMPLEMENTATION-SUMMARY.md` | UI/UX implementation summary |

## Decisions / analyses (historical context, may still inform)

| Doc | Note |
| --- | --- |
| `docs/ARCHITECTURE_OPTIONS_ANALYSIS.md` | Options analysis feeding ARCHITECTURE_STRATEGY |
| `docs/ARCHITECTURE_TABLES_ADDED.md` | DB tables added (verify against current schema) |
| `docs/CONVEX_MIGRATION_PLAN.md` | Convex migration plan (superseded by Postgres-first strategy — see NF-root `docs/technical/postgres-substitution-strategy.md`) |
| `docs/SPACETIMEDB_EVALUATION.md` | SpacetimeDB evaluation (see NF-root `docs/spacetimedb-2.0-comparative-analysis.md`) |
| `docs/IMPORT_STRATEGY_DECISION.md` | Import strategy decision |
| `docs/STANDALONE_PROJECTS_MIGRATION.md` | Standalone projects migration |
| `docs/PROJECTS_INTEGRATION_PLAN.md` | Projects integration plan |
| `docs/EVALUATION_CRITERIA_UPDATE.md` | Evaluation criteria |
| `docs/FINAL_SOLUTION.md` | Final solution (verify currency) |

## Superseded / archive (do not rely on as current)

| Doc | Superseded by |
| --- | --- |
| `docs/IMPLEMENTATION_STATUS_ARCHIVED_2026-01.md` | Already archived (Jan 2026) |
| `docs/ACTION_PLAN_CLEANUP.md` | `docs/action-plan.md` |
| `docs/ACTION_PLAN_EVALUATION_UPDATE.md` | `docs/action-plan.md` |
| `docs/BUILD_OUTPUT.md` | CI / `docs/DEPLOYMENT.md` |
| `docs/BUILD_STATUS.md` | CI / `docs/DEPLOYMENT.md` |
| `docs/DATABASE_CONSOLIDATION_STATUS.md` | Current schema in `packages/` |
| `docs/DEPENDENCY_AUDIT.md` | NF-root dependency-sweep docs / OSV audit |
| `docs/SESSION_SUMMARY.md` | Historical session summary |
| `docs/QUICK-START-UI-ENHANCEMENTS.md` | `docs/UI-UX-INDEX.md` |

## Recommendation

Consider folding the **Superseded** set into `docs/archive/` (gamehub already has
`docs/action-plan-archive.md` and `IMPLEMENTATION_STATUS_ARCHIVED_2026-01.md` as precedent)
to keep `docs/` top level focused on live docs. This is left to the gamehub maintainers
to execute to avoid disrupting in-flight work.
