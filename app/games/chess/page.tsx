"use client";
import { GameShell, getGame, isGameLaunchable } from "@gamehub/game-platform";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";
import { useState } from "react";

const ChessGame = dynamic(
  () => {
    const entry = getGame("chess");
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

export default function ChessPage() {
  const [seed, setSeed] = useState(0);

  return (
    <GameShell
      ariaLabel="Chess game"
      tips="Click a piece then a square • Checkmate the opponent"
      gameSlug="chess"
      onRestartAction={() => setSeed((s) => s + 1)}
    >
      <ChessGame key={seed} />
    </GameShell>
  );
}