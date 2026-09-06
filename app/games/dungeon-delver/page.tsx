"use client";
import { GameShell } from "@gamehub/game-platform";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamicImport from "next/dynamic";

const DungeonDelver = dynamicImport(
  () => import("@games/dungeon-delver").then((m) => m.DungeonDelverGame),
  { ssr: false, loading: () => <LoadingShell message="Loading..." /> },
);

export default function DungeonDelverPage() {
  return (
    <GameShell
      ariaLabel="Dungeon Delver — Fouilleur de Donjon"
      tips="WASD/ZQSD · Space · I · > descend · touch D-pad"
      gameSlug="dungeon-delver"
    >
      <DungeonDelver />
    </GameShell>
  );
}