/**
 * Snake — Bilingual string map (EN/FR)
 *
 * Usage: import { createI18n } from "@games/i18n";
 *        import { SNAKE_TX } from "@games/snake/i18n";
 *        const { t } = createI18n(SNAKE_TX);
 */

export const SNAKE_TX = {
  en: {
    title: "Snake",
    score: "Score",
    highScore: "High Score",
    gameOver: "Game Over",
    pressStart: "Press Space or tap to start",
    pause: "Paused",
    resume: "Press Space to resume",
    speed: "Speed",
    length: "Length",
    newGame: "New Game",
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  },
  fr: {
    title: "Serpent",
    score: "Score",
    highScore: "Meilleur Score",
    gameOver: "Partie Terminée",
    pressStart: "Espace ou touchez pour commencer",
    pause: "Pause",
    resume: "Espace pour reprendre",
    speed: "Vitesse",
    length: "Longueur",
    newGame: "Nouvelle Partie",
    difficulty: "Difficulté",
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile",
  },
} as const;