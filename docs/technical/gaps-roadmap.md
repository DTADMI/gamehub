# GameHub — Gaps & Roadmap

> **Owner**: Nebula Forge Digital Studio  
> **Last Updated**: 2026-08-22

---

## Summary

| Metric | Count |
|---|---|
| Total items tracked | 18 |
| Closed | 15 |
| Remaining | 3 |
| Completion | 83% |

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
| **15** | **i18n consolidation** | ✅ 4 systems → 1 (see below) |

---

## i18n Consolidation (Item 15 — Completed Aug 2026)

GameHub had **4 separate i18n systems** fighting each other:

| # | System | Location | Key | Default | Status |
|---|---|---|---|---|---|
| 1 | NF-standard Context | `lib/i18n/` | `gamehub-locale` | `fr` | ✅ Canonical |
| 2 | Pointclick-engine dict | `packages/pointclick-engine/src/lib/i18n.ts` | `lang` (was) | `en` (was) | ✅ Wrapped by #1 |
| 3 | Site locale hook | `packages/game-platform/src/lib/site-locale.ts` | `lang` (was) | `en` (was) | ✅ Key unified |
| 4 | Hardcoded site copy | `lib/site-copy.ts` | Manual | N/A | ✅ Migrated to translations |

### Changes

| File | Change |
|---|---|
| `lib/i18n/index.ts` | Added standalone `t()`, `setLocale()`, `getLocale()`, `initI18n()` |
| `lib/i18n.ts` | Removed dual-export of `@gamehub/game-platform/lib/i18n` |
| `lib/server-locale.ts` | Deleted |
| `lib/site-copy.ts` | Deleted — content moved to translations |
| `pointclick-engine/src/lib/i18n.ts` | Key `lang`→`gamehub-locale`, default `en`→`fr` |
| `game-platform/src/lib/site-locale.ts` | Key `lang`→`gamehub-locale`, default `en`→`fr` |
| 6 game packages | `@gamehub/game-platform/lib/i18n`→`@/lib/i18n` |
| 4 app pages | `siteCopy[locale].*`→`t("site.*")` |
| `components/LocaleInitializer.tsx` | New — inits standalone module-level `t()` |
| `lib/i18n/translations/en.ts`, `fr.ts` | Added `site.*` namespace |

**Result**: One system, one localStorage key (`gamehub-locale`), default `fr`, 0 tsc errors.

---

## Remaining Gaps

| # | Priority | Gap | Impact | Recommendation |
|---|---|---|---|---|
| 1 | P2 | Game monolith refactoring | Breakout (81KB), Systems Discovery (80KB), Toymaker Escape (77KB) are single-file | Split into renderer/logic/UI/state modules |
| 2 | P3 | Docs completeness | README ✅, perf ✅, feature-flags ✅, encoding ✅, i18n ✅ | Maintain going forward |
| 3 | P3 | Test coverage expansion | 43 E2E specs but unit test coverage could expand for packages/ | Add package-level unit tests |

---

## Not Applicable / Won't Do

| Item | Reason |
|---|---|
| Mobile app | Platform is web-first WebGPU; mobile via responsive web only |
| Offline/PWA games | Individual games load once; PWA not needed for launcher |

---

*Document maintained by Nebula Forge Digital Studio — August 2026*