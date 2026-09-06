"use client";
import { GameShell } from "@gamehub/game-platform";
import { useFlags } from "@gamehub/game-platform/contexts/FlagsContext";
import { LoadingShell } from "@gamehub/ui/components/shell";
import dynamicImport from "next/dynamic";

const DungeonDelver = dynamicImport(
  () => import("@games/dungeon-delver").then((m) => m.DungeonDelverGame),
  { ssr: false, loading: () => <LoadingShell message="Loading..." /> },
);

export default function DungeonDelverPage() {
  const { flags } = useFlags();

  if (flags.games?.dungeonDelver === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">Dungeon Delver</h1>
        <p className="text-muted-foreground mb-4">A roguelike dungeon crawler.</p>
        <div className="rounded-md border bg-gray-50 p-4 dark:bg-gray-800">
          This game is temporarily <b>unavailable</b>.
        </div>
      </div>
    );
  }
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