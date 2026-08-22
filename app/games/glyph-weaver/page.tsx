"use client";
import { GameShell } from "@gamehub/game-platform";
import dynamicImport from "next/dynamic";
import React from "react";

const GlyphWeaverGame = dynamicImport(
  () => import("@games/glyph-weaver").then((m) => m.GlyphWeaverGame),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-purple-500/30 animate-spin border-t-purple-400" />
          <p className="text-muted-foreground">Loading Glyph Weaver...</p>
        </div>
      </div>
    ),
  }
);

export default function GlyphWeaverPage() {
  return (
    <GameShell
      ariaLabel="Glyph Weaver — Spell Crafting Studio"
      tips="Draw a glyph ring, then sigils inside it. Close the ring to cast your spell!"
    >
      <GlyphWeaverGame />
    </GameShell>
  );
}