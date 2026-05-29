# GameHub — i18n Status Audit

**Audit Date**: 2026-05-28

## Approach

| Aspect | Value |
|--------|-------|
| Pattern | Cross-project Context pattern |
| Config | `lib/i18n/config.ts` |
| Provider | `lib/i18n/provider.tsx` (React Context) |
| Server | `lib/i18n/server.ts` + `server-provider.tsx` |
| Translation format | TypeScript modules (`lib/i18n/translations/*.ts`) + JSON per-game (`packages/pointclick-engine/src/i18n/<game>/*.json`) |
| Locale resolution | Cookie → Accept-Language → default `fr` |

## Locale Configuration

| Setting | Value |
|---------|-------|
| Default locale | `fr` (correct) |
| Supported locales | en, fr |
| Cookie name | `gamehub-locale` |
| Storage key | `gamehub-locale` |

## Translation Key Counts

| Locale | Keys | Status |
|--------|------|--------|
| EN (core) | 32 | Baseline (app shell) |
| FR (core) | 32 | Fully synced |
| Game EN (13 games) | 432 | Per-game JSON |
| Game FR (13 games) | 432 | Fully synced |
| **Total EN** | **464** | |
| **Total FR** | **464** | Fully synced |

### Per-Game Breakdown

| Game | EN | FR |
|------|----|----|
| breakout | 14 | 14 |
| bubble-pop | 14 | 14 |
| checkers | 14 | 14 |
| chess | 14 | 14 |
| chrono-shift | 29 | 29 |
| elemental-conflux | 21 | 21 |
| memory | 14 | 14 |
| platformer | 14 | 14 |
| quantum-architect | 17 | 17 |
| rite-of-discovery | 61 | 61 |
| snake | 14 | 14 |
| systems-discovery | 138 | 138 |
| toymaker-escape | 54 | 54 |
| tower-defense | 14 | 14 |

## Quebec French Conventions

| Convention | Count | Notes |
|------------|-------|-------|
| "connexion" (vs "login") | 3 occurrences (core) | Weak across game files |
| "courriel" (vs "email") | 0 occurrences | Missing entirely |
| "mot de passe" (vs "password") | 0 occurrences | Missing entirely |
| Hardcoded `t('en', ...)` | 0 | Clean |

## Missing Keys / Issues

- Core i18n key count is very low (32); most text is in per-game JSONs
- Quebec French conventions are weak — game i18n appears to use direct translations without Quebec-specific vocabulary
- No "courriel" or "mot de passe" in any FR translations

## Assessment

- Architecture matches cross-project Context pattern
- Default locale `fr` is correct
- Game i18n uses parallel JSON system alongside core Context TS modules
- FR key parity is complete across all 13 games + core
- Quebec French conventions need significant improvement — essentially zero use of Quebec-specific terms
- Core app shell (32 keys) is adequately translated but vocabulary is generic
- Recommended: audit game FR translations for Quebec French terminology
