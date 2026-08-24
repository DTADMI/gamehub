"use client";
import { GameShell, getGame, isGameLaunchable } from "@gamehub/game-platform";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const KnitzyGame = dynamic(
  () => {
    const entry = getGame("knitzy");
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

export default function KnitzyPage() {
  
  // Bridge game-specific completion events to GameShell's game:complete
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ score?: number; won?: boolean }>).detail ?? {};
      window.dispatchEvent(new CustomEvent('game:complete', { detail }));
    };
    // Listen for both game-specific and generic game:over events
    window.addEventListener('knitzy:gameover', handler);
    window.addEventListener('game:gameover', handler);
    return () => {
      window.removeEventListener('knitzy:gameover', handler);
      window.removeEventListener('game:gameover', handler);
    };
  }, []);


  return (
    <GameShell
      ariaLabel="Knitzy game"
      tips="Swap adjacent tiles to match patterns and clear the board"
      gameSlug="knitzy"
    >
      <KnitzyGame />
    </GameShell>
  );
}