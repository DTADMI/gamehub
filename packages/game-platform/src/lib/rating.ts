/**
 * Note inter-jeux (B4, decision register 2026-10-03).
 *
 * Un score brut n'est comparable qu'a l'interieur d'un meme jeu : les unites et
 * meme le sens de la mesure changent. On ne compare donc jamais deux scores
 * bruts ; on compare des **percentiles**, c'est-a-dire la position relative du
 * joueur dans la population de son jeu, ramenee sur une echelle commune 0-100.
 *
 * Voir `docs/technical/cross-game-rating.md` (sources : z-score/percentile,
 * SkillCorner, TrueParse) pour la justification.
 *
 * Module PUR : l'appelant fournit la population ; aucune dependance au reseau ni
 * a la base.
 */

export type ScoreDirection = "asc" | "desc";

export interface PercentileOptions {
  /**
   * Effectif minimal de la population pour qu'un percentile soit publie.
   * Un percentile calcule sur 2 joueurs est du bruit : on renvoie `null` plutot
   * qu'un chiffre qui aurait l'air d'une mesure (NF-RIGOR-001).
   */
  minPopulation?: number;
}

/**
 * Percentile (0-100) d'une valeur dans une population, selon la direction du jeu.
 *
 * Definition retenue : part de la population que la valeur egale ou depasse en
 * qualite. `desc` = plus haut mieux ; `asc` = plus bas mieux. Un ex aequo compte
 * comme « egal », donc les ties partagent le meme percentile.
 *
 * Renvoie `null` si la population est vide ou trop petite.
 */
export function percentileRank(
  value: number,
  population: number[],
  direction: ScoreDirection,
  { minPopulation = 5 }: PercentileOptions = {},
): number | null {
  if (population.length === 0 || population.length < minPopulation) return null;
  if (!Number.isFinite(value)) return null;

  // On ne compte que les valeurs finies, et on divise par ce meme effectif :
  // sinon une valeur non finie dans la population fausserait le denominateur.
  const finite = population.filter((v) => Number.isFinite(v));
  if (finite.length < minPopulation) return null;

  let atLeastAsGood = 0;
  for (const other of finite) {
    const better = direction === "desc" ? value >= other : value <= other;
    if (better) atLeastAsGood += 1;
  }
  return (atLeastAsGood / finite.length) * 100;
}

export interface AggregateOptions {
  /** Nombre de meilleurs jeux retenus (defaut : 3). */
  topN?: number;
}

/**
 * Note inter-jeux = moyenne des `topN` meilleurs percentiles du joueur.
 *
 * Retenir les N meilleurs plutot que la moyenne de tout :
 * - un joueur qui joue beaucoup de jeux ne grimpe pas mecaniquement ;
 * - un seul excellent jeu ne suffit pas non plus a tout porter (il faut du volume).
 * Renvoie `null` si aucun percentile n'est disponible.
 */
export function aggregateRating(
  percentiles: number[],
  { topN = 3 }: AggregateOptions = {},
): number | null {
  const usable = percentiles.filter((p) => Number.isFinite(p));
  if (usable.length === 0) return null;
  const top = [...usable].sort((a, b) => b - a).slice(0, Math.max(1, topN));
  return top.reduce((sum, p) => sum + p, 0) / top.length;
}
