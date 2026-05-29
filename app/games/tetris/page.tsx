"use client";
import { GameShell, getGame, isGameLaunchable } from "@gamehub/game-platform";
import MiniBoard from "@gamehub/game-platform/components/leaderboards/MiniBoard";
import { useAuth } from "@gamehub/game-platform/contexts/AuthContext";
import { useFlags } from "@gamehub/game-platform/contexts/FlagsContext";
import { submitScore } from "@gamehub/game-platform/lib/graphql/queries";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const TetrisGame = dynamic(
  () => getGame("tetris")!.getComponent(),
  { ssr: false },
);

export default function TetrisGamePage() {
  const [seed, setSeed] = useState(0);
  const { user } = useAuth();
  const { flags } = useFlags();

  const entry = getGame("tetris")!;
  const isNonProd =
    typeof window !== "undefined" &&
    (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_E2E === "true");
  const allowUpcomingLocal =
    ((typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL === "true" &&
      isNonProd) ||
      !!flags.ui?.allowPlayUpcomingLocal) &&
    isGameLaunchable(entry);

  const isPlayable = !entry.upcoming || allowUpcomingLocal;

  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent).detail as { score?: number } | undefined;
      const score = detail?.score ?? 0;
      if (user && score > 0) {
        try {
          await submitScore({
            gameType: "TETRIS",
            score,
            metadata: { client: "web" },
          });
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

  if (!isPlayable) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">{entry.title}</h1>
        <p className="text-muted-foreground mb-4">{entry.shortDescription}</p>
        <div className="rounded-md border bg-amber-50 p-4 dark:bg-amber-900/20">
          This game is marked as <b>Coming Soon</b>.
        </div>
      </div>
    );
  }

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
