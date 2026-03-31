"use client";

import { enableGameKeyCapture, GameHUD } from "@gamehub/game-platform";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ChessGame = dynamic(() => import("@games/chess").then((m) => m.ChessGame), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

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

