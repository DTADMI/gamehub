"use client";

import { GameShell, getGame, isGameLaunchable } from "@gamehub/game-platform";
import MiniBoard from "@gamehub/game-platform/components/leaderboards/MiniBoard";
import { useAuth } from "@gamehub/game-platform/contexts/AuthContext";
import { submitScore } from "@gamehub/game-platform/lib/graphql/queries";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { useCallback, useEffect, useState } from "react";

type ChronoShiftProps = {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number, won: boolean) => void;
};

const ChronoShiftGame = dynamic(
  () => {
    const entry = getGame("chrono-shift");
    if (!entry || !isGameLaunchable(entry)) {
      return Promise.reject(new Error("not_playable"));
    }
    if (entry.upcoming && !process.env.NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL) {
      return Promise.reject(new Error("upcoming_gated"));
    }
    return entry.getComponent();
  },
  { loading: () => <LoadingShell variant="spinner" /> }
) as ComponentType<ChronoShiftProps>;

const SAVE_KEY = "chronoshift:save:v1";

export default function ChronoShiftPage() {
  const [seed, setSeed] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent).detail as { score?: number; won?: boolean } | undefined;
      const score = detail?.score ?? lastScore;
      if (user && score > 0) {
        try {
          await submitScore({
            gameType: "PLATFORMER",
            score,
            metadata: { client: "web", subgame: "chrono-shift" },
          });
        } catch (err) {
          console.warn("submitScore failed (chrono-shift)", err);
        }
      }
    };
    window.addEventListener("chrono-shift:gameover", handler as EventListener);
    window.addEventListener("game:gameover", handler as EventListener);
    return () => {
      window.removeEventListener("chrono-shift:gameover", handler as EventListener);
      window.removeEventListener("game:gameover", handler as EventListener);
    };
  }, [user, lastScore]);

  const handleScoreUpdate = useCallback((score: number) => {
    setLastScore(score);
  }, []);

  const handleGameOver = useCallback((score: number, won: boolean) => {
    window.dispatchEvent(
      new CustomEvent("chrono-shift:gameover", { detail: { score, won } })
    );
    window.dispatchEvent(
      new CustomEvent("game:gameover", { detail: { score } })
    );
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {}
  }, []);

  return (
    <GameShell
      ariaLabel="Chrono Shift game"
      tips="WASD/Arrows to move | R to Rewind | E to Shift Wall"
      onRestartAction={() => setSeed((s) => s + 1)}
    >
      <ChronoShiftGame
        key={seed}
        onScoreUpdate={handleScoreUpdate}
        onGameOver={handleGameOver}
      />
      <div className="px-4">
        <MiniBoard gameType="PLATFORMER" limit={10} />
      </div>
    </GameShell>
  );
}
