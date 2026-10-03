# Classement inter-jeux : pourquoi le score brut ne marche pas, et par quoi le remplacer

Owner: Nebula Forge Digital Studio
Last Updated: 2026-10-03
Statut: recommande, premiere brique implementee

## Le probleme

Comparer des joueurs sur leurs **scores bruts** dans des jeux differents revient a comparer
qui a « mange le plus » alors que les plats etaient differents : 12 000 points a Breakout et
40 au Memory ne veulent pas dire que le premier joueur est 300 fois meilleur. Les unites, les
echelles et meme le **sens** de la mesure changent d'un jeu a l'autre :

- Breakout / Snake / Tetris : score cumulatif, **plus haut = mieux** ;
- Memory : nombre de coups, **plus bas = mieux** ;
- Knitzy : temps en millisecondes, **plus bas = mieux** ;
- Echecs / Dames : pas un score mais un resultat (victoire/nulle/defaite).

Un classement qui additionne ces valeurs produit un nombre qui n'a **aucun sens objectif**.

## Ce que dit la litterature et l'industrie

| Approche | Ce qu'elle fait | Limite |
| --- | --- | --- |
| **Z-score** (valeur - moyenne) / ecart-type | Ramene des metriques d'unites differentes sur une meme echelle (SkillCorner) | Suppose une distribution ~normale ; sensible aux valeurs extremes |
| **Percentile / rang centile** | Position relative a la population du jeu, bornes 0-100 (TrueParse rescale une kill-speed ladder en percentiles) | Exige une population de reference ; un petit effectif rend le percentile instable |
| **Elo / Glicko / TrueSkill** | Note de **competence** issue de duels (Microsoft TrueSkill) | Concue pour le **tete-a-tete** ; nos jeux solo n'ont pas d'adversaire |
| **Agregation normalisee** | Normalise les resultats de plusieurs jeux vers des valeurs unifiees avant presentation (brevet US 11 986 734) | Brevet (a ne pas copier) ; confirme que la normalisation est l'etape incontournable |

Conclusion : pour des jeux **solo heterogenes**, la brique juste est le **percentile intra-jeu**
(direction-aware), agrege ensuite. Elo/TrueSkill ne s'appliquent pas faute de duels.

## Recommandation

1. **Ne jamais comparer ni sommer des scores bruts** entre jeux.
2. Pour chaque jeu, calculer un **percentile** (0-100) du joueur dans la population de ce jeu.
   La **direction** du jeu est declaree une fois (`scoreDirection: "asc" | "desc"` dans le
   manifeste) : un temps de 12 s doit donner un bon percentile, pas un mauvais.
3. Vue inter-jeux = **agregation de percentiles** (moyenne des *N* meilleurs jeux du joueur),
   presentee comme une **note normalisee**, jamais comme un « score ». Cela evite qu'un joueur
   qui joue beaucoup grimpe mecaniquement, et qu'un seul excellent jeu domine tout.
4. Le **classement par jeu reste inchange** : c'est la seule comparaison qui a un sens objectif.

## Ce qui est livre

- `packages/game-platform/src/lib/rating.ts` : brique PURE - percentile direction-aware et
  agregation des meilleurs jeux, avec effectif minimal et refus explicite (jamais de valeur
  inventee quand la population est trop petite).
- `scoreDirection` dans le manifeste des jeux.
- Les tests figent les cas limites (population vide, valeur au-dela du min/max, ex aequo,
  moitie basse).

## Reste a faire

- Exposer le percentile via l'API/RPC du classement (agregation cote SQL) et l'afficher dans une
  vue inter-jeux distincte du classement par jeu.

## Sources

- SkillCorner, *Comparing Players With Z-Scores* (z-scores pour comparer des metriques
  d'unites differentes) : <https://landing.skillcorner.com/us/articles/skillcorner-open-data-2-comparing-players-with-z-scores> (ouverte 2026-10-03)
- TrueParse, commit *Kill-speed percentiles: rescale WCL's capped leaderboard* (percentiles
  direction-aware sur une echelle « plus bas = mieux ») : <https://github.com/Rathe001/TrueParse/commit/d25a9b4cd92060f8853010800033145bcd17f0c3> (ouverte 2026-10-03)
- Microsoft Research, *TrueSkill Ranking System* : <https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/> (ouverte 2026-10-03)
- Brevet US 11 986 734, *Video game content aggregation, normalization, and publication
  systems and methods* : <https://patents.justia.com/patent/10864443> (ouverte 2026-10-03 ; brevet,
  cite comme confirmation que la normalisation est l'etape requise, pas comme modele a copier)
- Google DeepMind, `dqn_zoo/atari_data.py` (normalisation de scores entre jeux Atari, pour
  reference) : <https://github.com/google-deepmind/dqn_zoo/blob/master/dqn_zoo/atari_data.py> (ouverte 2026-10-03)
