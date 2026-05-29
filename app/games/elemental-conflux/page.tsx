"use client";

import { GameShell } from "@gamehub/game-platform";
import dynamicImport from "next/dynamic";

const ElementalConfluxGame = dynamicImport(
  () => import("@games/elemental-conflux").then((m) => m.ElementalConfluxGame),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center text-lg">
        Loading game...
      </div>
    ),
  },
);

export default function ElementalConfluxPage() {
  return (
    <GameShell
      ariaLabel="Elemental Conflux game"
      tips="WASD/Arrows to move | Tab/1/2 to switch characters | F = Fire ability | Q = Water ability"
    >
      <ElementalConfluxGame />
    </GameShell>
  );
}
