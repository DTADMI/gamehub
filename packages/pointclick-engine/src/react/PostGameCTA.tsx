"use client";
import Link from "next/link";
import React from "react";

export type PostGameCTAProps = {
  /** Game slug for linking back */
  gameSlug: string;
  /** Whether the game was completed (true) or just exited (false) */
  completed?: boolean;
  /** Score or result to display */
  score?: number;
  /** Achievements earned */
  achievements?: string[];
  /** Callback to replay */
  onReplay?: () => void;
  /** Callback to go to next recommended game */
  onNextGame?: () => void;
  /** Suggested next game slug */
  nextGameSlug?: string;
  /** Suggested next game title */
  nextGameTitle?: string;
  /** Language */
  lang?: "en" | "fr";
  /** Custom message */
  message?: string;
};

/**
 * PostGameCTA — End-of-game call-to-action panel shown after completing
 * or exiting a point-and-click game.
 *
 * Inspired by adventure game completion screens: shows score/achievements,
 * offers replay, next game recommendation, and return to hub.
 */
export function PostGameCTA({
  gameSlug,
  completed = true,
  score,
  achievements = [],
  onReplay,
  onNextGame,
  nextGameSlug,
  nextGameTitle,
  lang = "en",
  message,
}: PostGameCTAProps) {
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-3 text-5xl">{completed ? "🎉" : "👋"}</div>
        <h2 className="mb-2 text-2xl font-bold">
          {completed
            ? t("Adventure Complete!", "Aventure terminée !")
            : t("Thanks for playing!", "Merci d'avoir joué !")}
        </h2>
        {message && <p className="text-sm opacity-70">{message}</p>}
      </div>

      {/* Score */}
      {score !== undefined && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-xs uppercase tracking-wider opacity-50">
            {t("Score", "Pointage")}
          </p>
          <p className="text-3xl font-bold">{score.toLocaleString()}</p>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-70">
            {t("Achievements Earned", "Badges obtenus")}
          </p>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300"
              >
                🏅 {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {/* Replay */}
        {onReplay && (
          <button
            onClick={onReplay}
            className="bg-primary/20 hover:bg-primary/30 w-full min-h-[48px] rounded-xl border border-primary/30 px-4 py-3 text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {completed
              ? t("🔄 Replay Adventure", "🔄 Rejouer l'aventure")
              : t("🔄 Try Again", "🔄 Réessayer")}
          </button>
        )}

        {/* Next Game */}
        {nextGameSlug && nextGameTitle && (
          <Link
            href={`/games/${nextGameSlug}`}
            className="bg-primary hover:bg-primary/90 flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
            onClick={onNextGame}
          >
            <span>{t("▶ Next:", "▶ Prochain :")}</span>
            <span className="font-bold">{nextGameTitle}</span>
          </Link>
        )}

        {/* Back to Games Hub */}
        <Link
          href="/explore"
          className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm opacity-70 transition-all hover:opacity-100 hover:border-white/20"
        >
          {t("🏠 Back to Game Hub", "🏠 Retour à l'accueil des jeux")}
        </Link>
      </div>

      {/* Game slug reference */}
      <p className="text-center text-xs opacity-30">
        {gameSlug}
      </p>
    </div>
  );
}