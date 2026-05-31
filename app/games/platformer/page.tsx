"use client";
import { GameShell, getGame, isGameLaunchable } from "@gamehub/game-platform";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";
import { useState } from "react";

const PlatformerGame = dynamic(
  () => {
    const entry = getGame("platformer");
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

export default function PlatformerPage() {
  const [seed, setSeed] = useState(0);

  return (
    <GameShell
      ariaLabel="Platformer game"
      tips="Arrows/WASD to move • Space to jump"
      onRestartAction={() => setSeed((s) => s + 1)}
    >
      <PlatformerGame key={seed} />
    </GameShell>
  );
}
