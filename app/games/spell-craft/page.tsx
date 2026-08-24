"use client";
import { GameShell } from "@gamehub/game-platform";
import { useAuth } from "@gamehub/game-platform/contexts/AuthContext";
import dynamicImport from "next/dynamic";
import { useEffect, useState } from "react";

const SpellCraftGame = dynamicImport(
  () => import("@games/spell-craft").then((m) => m.SpellCraftGame),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-xl">Loading Spell Craft...</div>
      </div>
    ),
  }
);

export default function SpellCraftPage() {
  const [seed, setSeed] = useState(0);
  const { user } = useAuth();

  
  // Bridge game-specific completion events to GameShell's game:complete
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ score?: number; won?: boolean }>).detail ?? {};
      window.dispatchEvent(new CustomEvent('game:complete', { detail }));
    };
    // Listen for both game-specific and generic game:over events
    window.addEventListener('spell-craft:gameover', handler);
    window.addEventListener('game:gameover', handler);
    return () => {
      window.removeEventListener('spell-craft:gameover', handler);
      window.removeEventListener('game:gameover', handler);
    };
  }, []);


  return (
    <GameShell
      gameSlug="spell-craft"
      ariaLabel="Spell Craft game"
      tips="Draw a ring, then a sigil inside it. Close the ring to cast your spell!"
      onRestartAction={() => {
        setSeed((s) => s + 1);
      }}
    >
      <SpellCraftGame key={seed} />
      {!user ? (
        <div className="px-4 pb-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to save your spell creations to the leaderboard.
          </p>
        </div>
      ) : null}
    </GameShell>
  );
}
