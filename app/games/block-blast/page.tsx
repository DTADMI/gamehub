"use client";
import { GameShell, getGame, isGameLaunchable } from "@gamehub/game-platform";
import MiniBoard from "@gamehub/game-platform/components/leaderboards/MiniBoard";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";
import { useState } from "react";

const BlockBlastGame = dynamic(
  () => {
    const entry = getGame("block-blast");
    if (!entry || !isGameLaunchable(entry)) {
      return Promise.reject(new Error("not_playable"));
    }
    if (entry.upcoming && !process.env.NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL) {
      return Promise.reject(new Error("upcoming_gated"));
    }
    return entry.getComponent();
  },
  { loading: () => <LoadingShell variant="spinner" /> },
);

export default function BlockBlastPage() {
  const [seed, setSeed] = useState(0);

  return (
    <GameShell
      ariaLabel="Block Blast game"
      tips="Drag pieces onto the grid • Clear rows and columns to score"
      onRestartAction={() => setSeed((s) => s + 1)}
    >
      <BlockBlastGame key={seed} />
      <div className="px-4">
        <MiniBoard gameType="BLOCK_BLAST" limit={10} />
      </div>
    </GameShell>
  );
}
