"use client";
import { GameShell, getGame, isGameLaunchable } from "@gamehub/game-platform";
import MiniBoard from "@gamehub/game-platform/components/leaderboards/MiniBoard";
import { useAuth } from "@gamehub/game-platform/contexts/AuthContext";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { submitScore } from "@/lib/score-submit";

const QuantumArchitectGame = dynamic(
  () => {
    const entry = getGame("quantum-architect");
    if (!entry || !isGameLaunchable(entry)) {
      return Promise.reject(new Error("not_playable"));
    }
    if (entry.upcoming && !process.env.NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL) {
      return Promise.reject(new Error("upcoming_gated"));
    }
    return entry.getComponent();
  },
  { loading: () => <LoadingShell variant="spinner" /> }
);

export default function QuantumArchitectPage() {
  const [seed, setSeed] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent).detail as { score?: number } | undefined;
      const score = detail?.score ?? lastScore;
      if (user && score > 0) {
        try {
          await submitScore("PLATFORMER", score, { client: "web", subgame: "quantum-architect" });
        } catch (err) {
          console.warn("submitScore failed (quantum-architect)", err);
        }
      }
    };
    window.addEventListener("quantum-architect:gameover", handler as EventListener);
    window.addEventListener("game:gameover", handler as EventListener);
    return () => {
      window.removeEventListener("quantum-architect:gameover", handler as EventListener);
      window.removeEventListener("game:gameover", handler as EventListener);
    };
  }, [user, lastScore]);

  return (
    <GameShell
      ariaLabel="Quantum Architect game"
      tips="WASD/Arrows to move | Space to observe nearest platform"
      onRestartAction={() => setSeed((s) => s + 1)}
    >
      <QuantumArchitectGame key={seed} />
      <div className="px-4">
        <MiniBoard gameType="PLATFORMER" limit={10} />
      </div>
    </GameShell>
  );
}
