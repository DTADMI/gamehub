"use client";
import { enableGameKeyCapture, GameHUD, getGame, isGameLaunchable } from "@gamehub/game-platform";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    const el = rootRef.current;
    el?.focus();
    const cleanup = enableGameKeyCapture({ rootEl: el ?? undefined });
    return () => cleanup();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative min-h-[80vh] outline-none focus:outline-none"
      tabIndex={0}
      role="application"
      aria-label="Quantum Architect game"
    >
      <QuantumArchitectGame key={seed} />
      <GameHUD
        onPauseToggleAction={() => {}}
        onRestartAction={() => setSeed((s) => s + 1)}
        tips="WASD/Arrows to move • Space to observe nearest platform"
      />
    </div>
  );
}
