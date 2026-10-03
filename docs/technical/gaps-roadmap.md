# GameHub - Gaps & Roadmap

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

## i18n Consolidation (Item 15 - Completed Aug 2026)

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
| `lib/site-copy.ts` | Deleted - content moved to translations |
| `pointclick-engine/src/lib/i18n.ts` | Key `lang`→`gamehub-locale`, default `en`→`fr` |
| `game-platform/src/lib/site-locale.ts` | Key `lang`→`gamehub-locale`, default `en`→`fr` |
| 6 game packages | `@gamehub/game-platform/lib/i18n`→`@/lib/i18n` |
| 4 app pages | `siteCopy[locale].*`→`t("site.*")` |
| `components/LocaleInitializer.tsx` | New - inits standalone module-level `t()` |
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

*Document maintained by Nebula Forge Digital Studio - August 2026*

---

## Backlog - features manquantes / pertinentes (recherche 2026-09-30)

Priorite : P1 (fort impact), P2 (utile), P3 (confort). Effort : S/M/L.

| # | Feature | Pourquoi | Prio | Effort | Statut |
|---|---------|----------|------|--------|--------|
| B1 | Refactor des 3 jeux monolithes | Breakout/Systems Discovery/Toymaker Escape en un seul fichier (>75 KB) : fragile et lent a faire evoluer (gap #1) | P2 | L | 🔵 2026-10-03 (registre D3, option B strangler fig) : etape 1 (filet de caracterisation) en cours - breakout `settings.ts` (6 tests), `BreakoutBoard` `computeBrickLayout`/`buildBricks` (9 tests, positions/points/solides figes) et `BreakoutPowerUps` (`pickWeightedPowerUp` + `desiredSpeedFromModifier`, 12 tests, selection ponderee et bornes de vitesse), toymaker-escape `data/scenes.ts` (7 tests, graphe narratif) ; `systems-discovery` est deja decoupe. Reste : extraire une responsabilite a la fois de `BreakoutGame.tsx` (rendu, etat, entree), tests en filet a chaque etape |
| B2 | Tests unitaires par package | 43 specs E2E mais peu de tests unitaires sur `packages/` ; filet de securite pour le refactor (gap #3) | P2 | M | 🔵 partiel 2026-10-02 : puzzle-core, modules lib sensibles (CSRF, schemas zod, lecture d IP) et modules game-platform purs (capture clavier, resolution de langue, detection WebGPU 7 tests, lecture de drapeaux 4 tests). Reste : `pg-*` (integration, exige Postgres). `authed-fetch` (3 tests) et `query-client` (1 test) faits 2026-10-02. 🔵 2026-10-03 : caracterisation des modules purs des monolithes amorcee (breakout `settings.ts` 6 tests, toymaker-escape `data/scenes.ts` 7 tests, precondition explicite de B1/D3) ; systems-discovery est deja decoupe (`scripts/split-systems-discovery.mjs`) ; reste la logique interne de `BreakoutGame.tsx` (a extraire en modules purs avant test). 🔵 2026-10-03 (suite) : utilitaires purs du pointclick-engine couverts (`utils/EventSystem.ts` 8 tests, `utils/Helpers.ts` 12 tests), utilises par tous les jeux point-and-click ; suite gamehub a 325 tests verts |
| B3 | Systeme de succes (achievements) | Recompense pro-sociale, non compulsive ; attendu par les joueurs et deja prevu cote design | P2 | M | ✅ fait 2026-10-02 : moteur pur (6 succes, sans streak, sans perte) cable dans GameContext (les succes de progression se debloquent et s'affichent via GameProgress) + 9 tests ; les succes globaux (exploration, cooperation, entraide) attendent une agregation profil |
| B4 | Classements manquants | Plusieurs jeux n'ont pas de leaderboard integre (ex. Dungeon Delver : profondeur, vitesse) | P2 | S | 🔵 triage 2026-10-02 : Dungeon Delver soumet DEJA son score (DUNGEON_DELVER/DAILY, profondeur + metadata kills/items), la note etait fausse. Soumettent : breakout, bubble-pop, chrono-shift, elemental-conflux, quantum-architect, snake, tetris, dungeon-delver. Ne soumettent pas malgre un type supporte : memory (coups), knitzy (ms), checkers, chess, tower-defense. Blocage : `validateScore` n'accepte qu'un entier positif et le classement trie « au plus haut », or plusieurs de ces jeux se mesurent « au plus bas » (temps/coups) : il faut une decision produit (inverser le tri par type, ou convertir en points) avant d'ecrire la soumission. |
| B5 | i18n EN/FR de tous les jeux | NF-BLOG-001/i18n : le launcher est traduit, pas tous les jeux | P2 | M | ✅ fait 2026-10-02 : verifie par scan, AUCUN jeu n a de texte code en dur sans i18n. tetris, quantum-architect et elemental-conflux cables via leur carte ; les autres utilisent deja t() ou des ternaires de langue. Deux garde-fous : parite EN/FR de tous les JSON de jeu (15) et de toutes les cartes TX (15) |
| B6 | Audit accessibilite par jeu | Reduire les animations, navigation clavier, lecteurs d'ecran ; NF exige 320px + accessibilite | P1 | M | 🔵 partiel 2026-10-02 : reduced-motion globalise a snake/memory/tetris/breakout + test-gardien ; garde-fou statique d'accessibilite ajoute (boutons-icones sans nom accessible, elements cliquables sans role/tabIndex/clavier) et 3 boutons ✔ corriges. 🔵 2026-10-03 : angle mort corrige (le garde-fou ignorait les boutons a texte visible vide, soit `<button><Icone /></button>`, le cas le plus courant) + auto-verification qui prouve que le detecteur echoue sur ce cas ; reste un audit clavier/lecteur d'ecran manuel par jeu |
| B7 | Commandes tactiles mobiles | Le web est responsive mais les jeux WebGPU supposent clavier/souris | P2 | M | 🔵 partiel 2026-10-02 : createTouchControls cable dans bubble-pop (tap = selection/pop, swipe = curseur) chrono-shift (swipe = deplacement, double-tap = rembobinage) et elemental-conflux (swipe = deplacement, double-tap = capacite) ; defaut corrige : `moved` ne se mettait a jour que si un callback pan etait enregistre, donc le swipe n'etait JAMAIS detecte sans onPan (5 tests ajoutes) ; reste a cabler les autres jeux clavier-seuls |
| B8 | Sauvegarde cloud de progression | Reprendre une partie sur un autre appareil | P3 | M | ✅ fait 2026-10-03 (registre D1, option C) : migration `004_user_game_progress` (RLS + GRANT + charge bornee 64 Ko + rollout/rollback), resolution pure `packages/game-platform/src/lib/progress.ts` qui **signale** le conflit (7 tests), API `app/api/progress` GET/PUT ou une copie locale plus ancienne recoit 409 avec la copie distante (jamais d'ecrasement silencieux, 6 tests). Reste : brancher le `GameContext` client sur cette API |
| B9 | Replays / mode spectateur | Partager une performance sans capture video | P3 | L | 🔵 2026-10-02 : brique pure `packages/game-platform/src/lib/replay.ts` (RNG seme deterministe mulberry32, format entetes+trames, version de format refusee si differente) + 8 tests. 🔵 2026-10-03 (registre D2) : horloge injectable ajoutee (`lib/clock.ts` : createClock + createManualClock, 7 tests) - les deux preconditions techniques du replay deterministe sont reunies. Reste : brancher RNG + horloge dans les moteurs jeu par jeu, puis l'interface de partage et la decision stockage/confidentialite |
| B10 | Extension anti-triche | Complement des regles de score (schema de detection d'anomalies) | P2 | M | ✅ fait 2026-10-02 : validation et dedupe existaient ; detection d'anomalies ajoutee (perfect_score, implausible_jump, high_frequency) qui marque flagged pour revue humaine, helper pur + 7 tests |