"use client";
import { GameShell } from "@gamehub/game-platform";
import { PresenceBadge } from "@gamehub/game-platform";
import LocalLeaderboard, { submitLocalScore } from "@gamehub/game-platform/components/games/LocalLeaderboard";
import StatsPanel from "@gamehub/game-platform/components/games/StatsPanel";
import MiniBoard from "@gamehub/game-platform/components/leaderboards/MiniBoard";
import { useAuth } from "@gamehub/game-platform/contexts/AuthContext";
import { useProfile } from "@gamehub/game-platform/contexts/ProfileContext";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamicImport from "next/dynamic";
import { useEffect, useState } from "react";

import { submitScore } from "@/lib/score-submit";

const SnakeGame = dynamicImport(() => import("@games/snake").then((mod) => mod.SnakeGame), {
  ssr: false,
  loading: () => <LoadingShell message="Loading Snake..." />,
});

function DifficultySelector() {
  const [difficulty, setDifficulty] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("snakeDifficulty") || "normal"
  );

  useEffect(() => {
    try { localStorage.setItem("snakeDifficulty", difficulty); } catch {}
  }, [difficulty]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("snake:setDifficulty", { detail: { difficulty } }));
  }, [difficulty]);

  return (
    <div className="mb-4 flex items-center justify-center gap-2">
      {(["easy", "normal", "hard"] as const).map((d) => (
        <button
          key={d}
          onClick={() => setDifficulty(d)}
          className={`rounded-md px-3 py-1 text-sm ${
            difficulty === d
              ? "bg-primary text-primary-foreground"
              : "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          }`}
          aria-pressed={difficulty === d}
        >
          {d[0].toUpperCase() + d.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default function SnakeGamePage() {
  const { profile, updateStat } = useProfile();
  const { user } = useAuth();

  useEffect(() => {
    const onGameOver = async (e: Event) => {
      const detail = (e as CustomEvent).detail as { score?: number } | undefined;
      const score = detail?.score ?? 0;

      updateStat("snake", { lastScore: score, sessions: 1 });
      submitLocalScore("snake", profile.nickname, score);

      if (user && score > 0) {
        try {
          await submitScore("SNAKE", score, {
            difficulty: (localStorage.getItem("snakeDifficulty") || "normal").toString(),
          });
          window.dispatchEvent(new Event("snake:leaderboardUpdated"));
        } catch (err) {
          console.warn("submitScore failed:", err);
        }
      }
    };
    window.addEventListener("snake:gameover", onGameOver as EventListener);
    return () => {
      window.removeEventListener("snake:gameover", onGameOver as EventListener);
    };
  }, [user, profile.nickname, updateStat]);

  return (
    <GameShell
      ariaLabel="Snake game"
      tips="Arrows to move • Space to pause/resume • Space after Game Over to restart"
      preloadSounds={[
        { key: "eat", url: "/sounds/eat.mp3" },
        { key: "gameOver", url: "/sounds/game-over.mp3" },
        { key: "background", url: "/sounds/snake-bg.mp3", loop: true },
      ]}
    >
      <div className="pt-4"><DifficultySelector /></div>
      <SnakeGame />
      <div className="text-foreground mt-6 grid grid-cols-1 gap-4 px-4 pb-8 md:grid-cols-2">
        <StatsPanel gameSlug="snake" />
        <div className="flex flex-col gap-4">
          <MiniBoard gameType="SNAKE" limit={10} />
          <LocalLeaderboard gameSlug="snake" />
        </div>
      </div>
    </GameShell>
  );
}