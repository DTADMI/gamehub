# Major Version Bumps — Evaluation

**Last Updated**: 2026-09-06
**Author**: Agent audit
**Status**: Evaluated, not applied

Per NF policy: major version bumps require documented evaluation before application.
Minor/patch bumps are applied within 30 days of release.

---

## Bump Candidates (15 packages)

### 🟢 Low Risk — Apply Immediately

| Package | Current | Latest | Type | Notes |
|---|---|---|---|---|
| `@types/node` | 25.9.5 | 26.4.1 | dev | Type defs for Node 26. We target 26.3.0. Safe bump. |
| `@types/three` | 0.184.1 | 0.185.4 | dev | Minor type update for Three.js. Safe. |
| `eslint-plugin-simple-import-sort` | 12.1.1 | 14.0.0 | dev | Changelog shows only new options, no breaking renames. Safe. |
| `@supabase/ssr` | 0.10.3 | 0.12.6 | prod | Pre-1.0 semver means minor can break. Checked: 0.12.x fixes cookie handling edge cases. Safe. |

### 🟡 Medium Risk — Apply With Caution

| Package | Current | Latest | Type | Notes |
|---|---|---|---|---|
| `@vitejs/plugin-react` | 5.2.0 | 6.1.1 | dev | Vite 7 plugin. v6 may require Vite 7+ (we have 7.3.5). Check API surface for `babel` vs `swc` plugin split. |
| `@testing-library/jest-dom` | 6.10.0 | 7.0.1 | dev | v7 drops deprecated matchers (`toBeInTheDOM`, `toBeEmpty`). Check test files for deprecated usage. |
| `jsdom` | 29.1.1 | 30.0.1 | dev | Major bump. DOM spec changes may affect test behavior (especially form/input interactions). Full test suite re-run required. |
| `@hookform/resolvers` | 3.10.0 | 5.9.1 | prod | Jump from 3→5 (v4 was short-lived). Used in admin forms. Check Zod resolver compat with zod@3 vs zod@4. |
| `knip` | 5.88.1 | 6.34.0 | dev | Major config format changes. knip.json may need migration. Low impact (dev tool only). |
| `lucide-react` | 0.562.0 | 1.41.0 | prod | 0.x→1.0 — icon names may have changed. 500+ icons to verify. Riskiest cosmetic bump. |

### 🔴 High Risk — Requires Full Test Suite + Staged Rollout

| Package | Current | Latest | Type | Notes |
|---|---|---|---|---|
| `zod` | 3.25.76 | 4.5.4 | prod | Zod v4 is a major rewrite. Schema definitions should still work but `z.object()`, `z.string()`, `.parse()` behavior may differ. Used in feature flags, leaderboard validation, admin forms. Requires full typecheck + test re-run. |
| `vitest` | 4.1.11 | 5.0.0 | dev | Major breaking changes: worker pool config, changed reporter API, `vi.mock()` hoisting behavior. 161 tests affected. Must be done in isolation with full suite re-run. |
| `@eslint/js` | 9.39.5 | 10.0.1 | dev | ESLint 10 flat config only. We already use flat config (eslint.config.mjs). Primary risk: plugin compat (`@typescript-eslint`, `eslint-plugin-react`). |
| `eslint` | 9.39.5 | 10.10.0 | dev | Must be bumped together with `@eslint/js` and all ESLint plugins. High coordination cost. |
| **`typescript`** | **5.9.3** | **7.0.2** | dev | **⚠️ HIGHEST RISK** — Two major versions skipped (5→6→7). New strictness checks, changed type inference, potential new errors across 36 workspace packages. Full `tsc --noEmit` re-run required. `@typescript-eslint` must be compatible. |

---

## Recommended Rollout Order

### Batch 1 — Apply Now (4 packages, 5 min)

```
pnpm update @types/node @types/three eslint-plugin-simple-import-sort @supabase/ssr
```
Verify: `tsc --noEmit`, `pnpm test:unit`

### Batch 2 — Staged (5 packages, 30 min)

```
pnpm update @vitejs/plugin-react @testing-library/jest-dom jsdom @hookform/resolvers knip
```
Verify: full test suite + build

### Batch 3 — Isolated (3 packages, 2h)

```
pnpm update vitest
```
Full test suite, check worker behavior, reporter output

```
pnpm update zod
```
Full test suite, check all Zod schemas (feature flags, leaderboard, admin forms)

```
pnpm update lucide-react
```
Verify no missing/renamed icons, check all game UIs

### Batch 4 — Coordinated (3 packages, 3h)

```
pnpm update typescript eslint @eslint/js
```
**Must be done as a single coordinated bump:**
1. Update `typescript` → run `tsc --noEmit`, fix all new errors
2. Update `eslint` + `@eslint/js` → verify flat config compatibility
3. Update `@typescript-eslint/*` → verify no regressions
4. Run full `pnpm run-all checks`

---

## Decision

| Decision | Rationale |
|---|---|
| **Defer all major bumps** | Batches 1-4 total ~6h effort. No security CVEs driving urgency. TypeScript 5→7 is the highest-risk item and warrants a dedicated session. |
| **Apply when needed** | Apply individual batches as needed (e.g., when a CVE requires a bump, or when a new feature needs a new API from a bumped package). |
| **Batch 1 is trivial** | Can be applied anytime with minimal risk. Not blocking anything. |

---

## Related

- `pnpm-workspace.yaml` — overrides for security pins
- `docs/action-plan.md` — Phase 0 security tasks
- NF policy: major version bumps require documented evaluation