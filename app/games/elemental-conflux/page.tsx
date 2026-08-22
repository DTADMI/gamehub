"use client";

import { GameShell, getGame, isGameLaunchable } from "@gamehub/game-platform";
import MiniBoard from "@gamehub/game-platform/components/leaderboards/MiniBoard";
import { useAuth } from "@gamehub/game-platform/contexts/AuthContext";
import { submitScore } from "@/lib/score-submit";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { useCallback, useEffect, useState } from "react";

type ElementalConfluxProps = {
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number) => void;
};

const ElementalConfluxGameComp = dynamic(
  () => {
    const entry = getGame("elemental-conflux");
    if (!entry || !isGameLaunchable(entry)) {
      return Promise.reject(new Error("not_playable"));
    }
    if (entry.upcoming && !process.env.NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL) {
      return Promise.reject(new Error("upcoming_gated"));
    }
    return entry.getComponent();
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center text-lg">
        Loading game...
      </div>
    ),
  },
) as ComponentType<ElementalConfluxProps>;

export default function ElementalConfluxPage() {
  const [seed, setSeed] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent).detail as { score?: number } | undefined;
      const score = detail?.score ?? lastScore;
      if (user && score > 0) {
        try {
          await submitScore("PLATFORMER", score, { client: "web", subgame: "elemental-conflux" });
        } catch (err) {
          console.warn("submitScore failed (elemental-conflux)", err);
        }
      }
    };
    window.addEventListener("elemental-conflux:gameover", handler as EventListener);
    window.addEventListener("game:gameover", handler as EventListener);
    return () => {
      window.removeEventListener("elemental-conflux:gameover", handler as EventListener);
      window.removeEventListener("game:gameover", handler as EventListener);
    };
  }, [user, lastScore]);

  const handleScoreUpdate = useCallback((score: number) => {
    setLastScore(score);
  }, []);

  const handleGameOver = useCallback((score: number) => {
    window.dispatchEvent(
      new CustomEvent("elemental-conflux:gameover", { detail: { score } })
    );
    window.dispatchEvent(
      new CustomEvent("game:gameover", { detail: { score } })
    );
  }, []);

  return (
    <GameShell
      ariaLabel="Elemental Conflux game"
      tips="WASD/Arrows to move | Tab/1/2 to switch characters | F = Fire ability | Q = Water ability"
      onRestartAction={() => setSeed((s) => s + 1)}
    >
      <ElementalConfluxGameComp
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
