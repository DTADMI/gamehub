# GameHub — Gaps & Roadmap

> **Owner**: Nebula Forge Digital Studio  
> **Last Updated**: 2026-08-20  

---

## Summary

| Metric | Count |
|---|---|
| Total items tracked | 18 |
| Closed | 14 |
| Remaining | 4 |
| Completion | 78% |

---

## Closed (This Pass)

| # | Item | Resolution |
|---|---|---|
| 1 | Type checking | ✅ `pnpm type-check` passing |
| 2 | Architecture migration | ✅ Monorepo imports unified |
| 3 | Test reliability | ✅ Organized by domain |
| 4 | Game launcher gating | ✅ Launchable check aligned |
| 5 | Supabase SSR auth clients | ✅ `@supabase/ssr` across all layers |
| 6 | CI/CD deployment | ✅ GitHub Actions + Vercel |
| 7 | Redis provider | ✅ Upstash with memory fallback |
| 8 | Leaderboard auth gating | ✅ Signed-in requirement |
| 9 | Admin feature-flag pilot UI | ✅ `/admin/flags` |
| 10 | Local CI parity gate | ✅ `pnpm ci:local` |
| 11 | UI/UX integration pass | ✅ Cards, carousel, hero, leaderboard teaser |
| 12 | Post-game CTA modal | ✅ PostGameCTA + hook + 9 games wired |
| 13 | Build config completeness | ✅ optimizePackageImports + transpilePackages |
| 14 | Portfolio/blog media upload | ✅ Supabase Storage upload flow |

---

## Remaining Gaps

| # | Priority | Gap | Impact | Recommendation |
|---|---|---|---|---|
| 1 | P2 | Game monolith refactoring | Breakout (81KB), Systems Discovery (80KB), Toymaker Escape (77KB) are single-file | Split into renderer/logic/UI/state modules |
| 2 | P3 | i18n system consolidation | 3 parallel systems: Context lib/i18n/, pointclick-engine static t(), game JSONs | Unify under Context pattern, fix localStorage key conflict |
| 3 | P3 | Docs completeness | docs/README.md ✅, perf ✅, feature-flags ✅, encoding ✅ — all created Aug 2026 | Maintain going forward |
| 4 | P3 | Test coverage expansion | 43 E2E specs but unit test coverage could expand for packages/ | Add package-level unit tests |

---

## Not Applicable / Won't Do

| Item | Reason |
|---|---|
| Mobile app | Platform is web-first WebGPU; mobile via responsive web only |
| Offline/PWA games | Individual games load once; PWA not needed for launcher |

---

*Document maintained by Nebula Forge Digital Studio — August 2026*