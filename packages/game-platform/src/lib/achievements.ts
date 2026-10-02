// ─────────────────────────────────────────────────────────
// GameHub - moteur de succes (feature B3)
//
// Regle de conception : recompense pro-sociale, NON compulsive. Aucun succes ne
// depend d'une serie a maintenir (pas de « streak » a ne pas briser), aucun
// succes ne se perd, et les succes valorisent la decouverte et l'entraide plutot
// que le volume. Moteur pur, sans etat ni reseau, pour etre testable.
// ─────────────────────────────────────────────────────────

export interface AchievementStats {
  gamesPlayed: number
  distinctGames: number
  coopSessions: number
  sharedCreations: number
  helpedOthers: number
}

export type AchievementId =
  | "first_game"
  | "explorer"
  | "collaborator"
  | "generous"
  | "creator"
  | "veteran"

export interface AchievementDefinition {
  id: AchievementId
  /** Cle i18n du titre (prefixe `achievements.`). */
  titleKey: string
  /** Cle i18n de la description. */
  descriptionKey: string
  /** Vrai si les statistiques satisfont le succes. Jamais de perte. */
  unlockedBy: (stats: AchievementStats) => boolean
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first_game",
    titleKey: "achievements.firstGame.title",
    descriptionKey: "achievements.firstGame.description",
    unlockedBy: (s) => s.gamesPlayed >= 1,
  },
  {
    id: "explorer",
    titleKey: "achievements.explorer.title",
    descriptionKey: "achievements.explorer.description",
    unlockedBy: (s) => s.distinctGames >= 5,
  },
  {
    id: "collaborator",
    titleKey: "achievements.collaborator.title",
    descriptionKey: "achievements.collaborator.description",
    unlockedBy: (s) => s.coopSessions >= 3,
  },
  {
    id: "generous",
    titleKey: "achievements.generous.title",
    descriptionKey: "achievements.generous.description",
    unlockedBy: (s) => s.helpedOthers >= 1,
  },
  {
    id: "creator",
    titleKey: "achievements.creator.title",
    descriptionKey: "achievements.creator.description",
    unlockedBy: (s) => s.sharedCreations >= 1,
  },
  {
    id: "veteran",
    titleKey: "achievements.veteran.title",
    descriptionKey: "achievements.veteran.description",
    unlockedBy: (s) => s.gamesPlayed >= 25,
  },
]

/** Succes debloques pour ces statistiques (dans l'ordre de definition). */
export function evaluateAchievements(stats: AchievementStats): AchievementId[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.unlockedBy(stats)).map((a) => a.id)
}

/**
 * Fusionne les succes deja debloques avec ceux recalcules : un succes debloque
 * ne se perd jamais, meme si les statistiques locales repartent de zero.
 */
export function mergeUnlocked(
  known: readonly string[],
  stats: AchievementStats,
): AchievementId[] {
  const merged = new Set<string>(known)
  for (const id of evaluateAchievements(stats)) merged.add(id)
  return ACHIEVEMENTS.map((a) => a.id).filter((id) => merged.has(id))
}

/**
 * Projette les statistiques d'une partie (`GameStats`) sur le moteur. Les
 * succes globaux (exploration, cooperation, entraide) restent hors de portee
 * d'une seule partie : ils se debloquent via les statistiques du profil.
 */
export function achievementStatsFromGameStats(game: {
  totalPlays: number
  highScore: number
}): AchievementStats {
  return {
    gamesPlayed: Math.max(0, game.totalPlays),
    distinctGames: game.totalPlays > 0 ? 1 : 0,
    coopSessions: 0,
    sharedCreations: 0,
    helpedOthers: 0,
  }
}
