"use client";
import { enableGameKeyCapture, getGame, isGameLaunchable } from "@gamehub/game-platform";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

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
  const rootRef = useRef<HTMLDivElement | null>(null);

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
      aria-label="Knitzy game"
    >
      <KnitzyGame />
    </div>
  );
}



