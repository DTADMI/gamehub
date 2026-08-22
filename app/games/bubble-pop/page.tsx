"use client";
import { GameShell, getGame, isGameLaunchable } from "@gamehub/game-platform";
import MiniBoard from "@gamehub/game-platform/components/leaderboards/MiniBoard";
import { useAuth } from "@gamehub/game-platform/contexts/AuthContext";
import { submitScore } from "@/lib/score-submit";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const BubblePopGame = dynamic(
  () => {
    const entry = getGame("bubble-pop");
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

export default function BubblePopPage() {
  const { user } = useAuth();

  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent).detail as { score?: number } | undefined;
      const score = detail?.score ?? 0;
      if (user && score > 0) {
        try {
          await submitScore("BUBBLE_POP", score, { client: "web" });
        } catch (err) {
          console.warn("submitScore failed (BUBBLE_POP)", err);
        }
      }
    };
    window.addEventListener("bubble-pop:gameover", handler as EventListener);
    window.addEventListener("game:gameover", handler as EventListener);
    return () => {
      window.removeEventListener("bubble-pop:gameover", handler as EventListener);
      window.removeEventListener("game:gameover", handler as EventListener);
    };
  }, [user]);

  return (
    <GameShell
      ariaLabel="Bubble Pop game"
      tips="Click or tap to pop bubbles — chain pops for higher scores"
    >
      <BubblePopGame />
      <div className="px-4">
        <MiniBoard gameType="BUBBLE_POP" limit={10} />
      </div>
    </GameShell>
  );
}



