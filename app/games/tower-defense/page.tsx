"use client";
import { GameShell, getGame, isGameLaunchable } from "@gamehub/game-platform";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";
import { useState } from "react";

const TowerDefenseGame = dynamic(
  () => {
    const entry = getGame("tower-defense");
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

export default function TowerDefensePage() {
  const [seed, setSeed] = useState(0);

  return (
    <GameShell
      ariaLabel="Tower Defense game"
      tips="Click to place towers • Defend the path against waves"
      onRestartAction={() => setSeed((s) => s + 1)}
    >
      <TowerDefenseGame key={seed} />
    </GameShell>
  );
}
