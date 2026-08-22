"use client";
import { GameShell, getGame, isGameLaunchable } from "@gamehub/game-platform";
import MiniBoard from "@gamehub/game-platform/components/leaderboards/MiniBoard";
import { useAuth } from "@gamehub/game-platform/contexts/AuthContext";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { submitScore } from "@/lib/score-submit";

const TetrisGame = dynamic(
  () => {
    const entry = getGame("tetris");
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

export default function TetrisGamePage() {
  const [seed, setSeed] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent).detail as { score?: number } | undefined;
      const score = detail?.score ?? 0;
      if (user && score > 0) {
        try {
          await submitScore("TETRIS", score, { client: "web" });
        } catch (err) {
          console.warn("submitScore failed (TETRIS)", err);
        }
      }
    };
    window.addEventListener("tetris:gameover", handler as EventListener);
    window.addEventListener("game:gameover", handler as EventListener);
    return () => {
      window.removeEventListener("tetris:gameover", handler as EventListener);
      window.removeEventListener("game:gameover", handler as EventListener);
    };
  }, [user]);

  return (
    <GameShell
      ariaLabel="Tetris game"
      tips="Arrows to move • Up to rotate • Space to drop/pause"
      onRestartAction={() => setSeed((s) => s + 1)}
      preloadSounds={[
        { key: "line", url: "/sounds/line.mp3" },
        { key: "move", url: "/sounds/move.mp3" },
        { key: "rotate", url: "/sounds/rotate.mp3" },
        { key: "drop", url: "/sounds/drop.mp3" },
        { key: "gameOver", url: "/sounds/game-over.mp3" },
        { key: "background", url: "/sounds/tetris-bg.mp3", loop: true },
      ]}
    >
      <TetrisGame key={seed} />
      <div className="px-4">
        <MiniBoard gameType="TETRIS" limit={10} />
      </div>
    </GameShell>
  );
}



