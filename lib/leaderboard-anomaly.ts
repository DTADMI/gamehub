// ─────────────────────────────────────────────────────────
// GameHub - detection d'anomalies de score (feature B10, volet detection)
//
// Complement des regles de soumission (validation + dedupe). Detection pure et
// testable : un score peut etre marque « flagged » pour revue humaine, jamais
// supprime automatiquement — c'est la moderation qui tranche.
// ─────────────────────────────────────────────────────────

export interface AnomalyInput {
  score: number;
  /** Plafond declare pour ce jeu. */
  maxScore: number;
  /** Meilleur score precedent connu, sinon null. */
  previousBest: number | null;
  /** Nombre de soumissions recentes dans la fenetre. */
  recentSubmissions: number;
  /** Taille de la fenetre de frequence, en secondes. */
  recentWindowSeconds: number;
}

export interface AnomalyResult {
  flagged: boolean;
  reasons: string[];
}

const FREQUENCY_THRESHOLD = 25;
const JUMP_FACTOR = 5;

/**
 * Signaux d'anomalie, avec leur raison nommee :
 * - `perfect_score` : score egal au plafond declare ;
 * - `implausible_jump` : score plus de 5 fois superieur au meilleur precedent ;
 * - `high_frequency` : au moins 25 soumissions dans la fenetre.
 */
export function assessAnomaly(input: AnomalyInput): AnomalyResult {
  const reasons: string[] = [];

  if (input.maxScore > 0 && input.score >= input.maxScore) {
    reasons.push("perfect_score");
  }

  if (input.previousBest !== null && input.previousBest > 0 && input.score > input.previousBest * JUMP_FACTOR) {
    reasons.push("implausible_jump");
  }

  if (input.recentSubmissions >= FREQUENCY_THRESHOLD) {
    reasons.push("high_frequency");
  }

  return { flagged: reasons.length > 0, reasons };
}

/** Compte les soumissions recentes dans une liste d'horodatages. */
export function countRecentSubmissions(
  timestamps: ReadonlyArray<string | number | Date>,
  windowSeconds: number,
  now: number = Date.now(),
): number {
  const windowMs = windowSeconds * 1000;
  let count = 0;
  for (const value of timestamps) {
    const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
    if (!Number.isNaN(time) && now - time <= windowMs) count += 1;
  }
  return count;
}
