"use client";

import { GameShell } from "@gamehub/game-platform";
import LocalLeaderboard, { submitLocalScore } from "@gamehub/game-platform/components/games/LocalLeaderboard";
import StatsPanel from "@gamehub/game-platform/components/games/StatsPanel";
import MiniBoard from "@gamehub/game-platform/components/leaderboards/MiniBoard";
import { useProfile } from "@gamehub/game-platform/contexts/ProfileContext";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MemoryGame = dynamic(() => import("@games/memory").then((m) => m.MemoryGame), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function MemoryGamePage() {
  const { profile, updateStat } = useProfile();
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { score?: number } | undefined;
      const score = detail?.score ?? 0;

      updateStat("memory", {
        lastScore: score,
        sessions: 1,
      });
      submitLocalScore("memory", profile.nickname, score);
    };
    window.addEventListener("memory:gameover", handler as EventListener);
    return () => window.removeEventListener("memory:gameover", handler as EventListener);
  }, [profile.nickname, updateStat]);

  return (
    <GameShell
      ariaLabel="Memory game"
      tips="Click cards to match pairs • Try to remember positions"
      onRestartAction={() => {
        setSeed((s) => s + 1);
      }}
      preloadSounds={[
        { key: "card-flip", url: "/sounds/card-flip.mp3" },
        { key: "match", url: "/sounds/match.mp3" },
        { key: "win", url: "/sounds/win.mp3" },
        { key: "background", url: "/sounds/memory-bg.mp3", loop: true },
      ]}
    >
      <MemoryGame key={seed} />

      <div className="text-foreground mt-6 grid grid-cols-1 gap-4 px-4 pb-8 md:grid-cols-2">
        <StatsPanel gameSlug="memory" />
        <div className="flex flex-col gap-4">
          <LocalLeaderboard gameSlug="memory" />
          <MiniBoard gameType="MEMORY" limit={10} />
        </div>
      </div>
    </GameShell>
  );
}

