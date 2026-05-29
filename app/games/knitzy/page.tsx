"use client";
import { enableGameKeyCapture, getGame, isGameLaunchable } from "@gamehub/game-platform";
import { useFlags } from "@gamehub/game-platform/contexts/FlagsContext";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

const KnitzyGame = dynamic(
  () => getGame("knitzy")!.getComponent(),
  { ssr: false },
);

export default function KnitzyPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { flags } = useFlags();

  const entry = getGame("knitzy")!;
  const isNonProd =
    typeof window !== "undefined" &&
    (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_E2E === "true");
  const allowUpcomingLocal =
    ((typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL === "true" &&
      isNonProd) ||
      !!flags.ui?.allowPlayUpcomingLocal) &&
    isGameLaunchable(entry);

  const isPlayable = !entry.upcoming || allowUpcomingLocal;

  useEffect(() => {
    const el = rootRef.current;
    el?.focus();
    const cleanup = enableGameKeyCapture({ rootEl: el ?? undefined });
    return () => cleanup();
  }, []);

  if (!isPlayable) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">{entry.title}</h1>
        <p className="text-muted-foreground mb-4">{entry.shortDescription}</p>
        <div className="rounded-md border bg-amber-50 p-4 dark:bg-amber-900/20">
          This game is marked as <b>Coming Soon</b>.
        </div>
      </div>
    );
  }

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
