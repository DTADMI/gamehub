"use client";
import { enableGameKeyCapture, GameHUD, getGame, isGameLaunchable } from "@gamehub/game-platform";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

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
      aria-label="Chess game"
    >
      <ChessGame key={seed} />
      <GameHUD
        onPauseToggleAction={() => {
          window.dispatchEvent(new KeyboardEvent("keydown", { key: " ", code: "Space" }));
        }}
        onRestartAction={() => setSeed((s) => s + 1)}
        tips="Click a piece then a square • Checkmate the opponent"
      />
    </div>
  );
}



