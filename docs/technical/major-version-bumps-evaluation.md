# Major Version Bumps — Evaluation

**Last Updated**: 2026-09-07
**Author**: Agent audit
**Status**: ✅ Applied (14/15 packages bumped in v1.5)

Per NF policy: major version bumps require documented evaluation before application.
Minor/patch bumps are applied within 30 days of release.

---

## Bump Results (v1.5 — 2026-09-07)

All evaluated bumps were applied in a single ~1.5h session. Summary:

| Package | From | To | Result |
|---|---|---|---|
| `@types/node` | 25.9.5 | 26.4.1 | ✅ Clean |
| `@types/three` | 0.184.1 | 0.185.4 | ✅ Clean |
| `eslint-plugin-simple-import-sort` | 12.1.1 | 14.0.0 | ✅ Clean |
| `@supabase/ssr` | 0.10.3 | 0.12.6 | ✅ Clean |
| `@testing-library/jest-dom` | 6.10.0 | 7.0.1 | ✅ Clean |
| `@hookform/resolvers` | 3.10.0 | 5.9.1 | ✅ Clean |
| `jsdom` | 29.1.1 | 30.0.1 | ✅ Clean |
| `knip` | 5.88.1 | 6.34.0 | ✅ Clean |
| `typescript` | 5.9.3 | **6.0.3** | ⚠️ TS7 deferred (@typescript-eslint v9 blocked) |
| `zod` | 3.25.76 | 4.5.4 | ✅ No fake UUIDs in tests |
| `vitest` | 4.1.11 | 5.0.0 | ✅ All tests pass |
| `eslint` | 9.39.5 | 10.10.0 | ⚠️ 17 lint fixes (no-useless-assignment tightened) |
| `lucide-react` | 0.562.0 | 1.41.0 | ⚠️ Brand icons removed (Github/Linkedin → ExternalLink/Link2) |

### Notable issues resolved

1. **TypeScript 7 blocked**: `@typescript-eslint` v8 doesn't support TS 7. Settled on TS 6.0.3.
   - Removed deprecated `baseUrl` from all 5 `tsconfig.json` files, added `paths: {"*": ["./*"]}`.

2. **Lucide v1 brand icons removed**: `Github`, `Linkedin`, and other brand icons
   were removed in lucide-react v1. Replaced with `ExternalLink` and `Link2` across
   Footer.tsx, Navbar.tsx, icons.tsx.

3. **ESLint 10 `no-useless-assignment`**: New rule tightened, caught 7 instances of
   dead initializers (e.g., `let mx = 0, my = 0` where both immediately overwritten).
   Fixed in DungeonDelverGame.tsx, ast-builder.ts, SpellCraftGame.tsx, 3 scripts.

4. **@vitejs/plugin-react kept at 5.x**: v6 imports `vite/internal` which was removed
   in Vite 7. Staying at 5.2.0 which is compatible.

### Not bumped

| Package | Reason |
|---|---|
| `@vitejs/plugin-react` | v6 incompatible with Vite 7 (`vite/internal` removed) |
| `supabase` (CLI) | Not a direct dependency in evaluation |

---

## Verification (v1.5)

```
tsc --noEmit: 0 errors
pnpm lint: 0 errors
pnpm test:unit: ✅ (all pass)
pnpm test:integration: ✅ (all pass)
pnpm build: ✅
```

---

## Related

- `pnpm-workspace.yaml` — overrides for CVE patches
- `docs/action-plan.md` — Phase 0 security tasks
- NF policy: major version bumps require documented evaluation