# GameHub — Feature Flags Reference

> **Owner**: Nebula Forge Digital Studio  
> **Last Updated**: 2026-08-20  
> **Canonical rules**: `../../docs/technical/feature-flags-testing.md` (NF root)

---

## Flag Registry

GameHub uses 23 feature flags defined in `lib/feature-flags.ts`. Flags are persisted in Supabase with Redis fallback and managed via the admin dashboard at `/admin/flags`.

## Flag Categories

| Category | Count | Examples |
|---|---|---|
| Game gating | 8 | Individual game enable/disable |
| Platform features | 6 | Leaderboards, blog, portfolio, search |
| Admin tools | 4 | Flag management UI, analytics, audit log |
| Infrastructure | 3 | Redis cache tier, rate limiting strategy |
| Experimental | 2 | New game engines, WebGPU accelerated features |

## Testing Feature Flags

### Local Development
```bash
# All flags default to enabled: true in dev
pnpm dev
```

### E2E Tests
```typescript
// tests-e2e/admin-flags-toggle.spec.ts — verifies admin UI toggle flow
// tests-e2e/leaderboard-auth-gating.spec.ts — verifies leaderboard respects auth + flags
// tests-e2e/games.badges.spec.ts — verifies game gating via flags
```

### CI Pipeline
- `pnpm ci:local` runs before push — typecheck + lint + test + build
- GitHub Actions runs full suite including E2E on PR

## Adding a New Flag

1. Add entry to `lib/feature-flags.ts`
2. Add DB persistence via `lib/features-pg.ts`
3. Add admin UI toggle in the flag matrix
4. Add E2E test verifying the gated behavior
5. Update this document

---

*Document maintained by Nebula Forge Digital Studio — August 2026*