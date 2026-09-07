"use client";

import { GameCard } from "@gamehub/game-platform";
import { listGames } from "@gamehub/game-platform/metadata/games";
import { Badge, Button } from "@gamehub/ui";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function ExplorePage() {
  const gameManifestData = useMemo(() => listGames(), []);
  const gamesError = null;

  const allGames = useMemo(
    () =>
      (gameManifestData ?? [])
        .filter((game) => game.visible !== false)
        .map((game) => ({
          id: game.slug,
          title: game.title,
          description: game.shortDescription,
          image: game.image,
          tags: game.tags,
          slug: game.slug,
          upcoming: !!game.upcoming,
          featured: game.enabled !== false && !game.upcoming,
        })),
    [gameManifestData],
  );

  const playableGames = useMemo(() => allGames.filter((game) => !game.upcoming), [allGames]);
  const upcomingGames = useMemo(() => allGames.filter((game) => game.upcoming), [allGames]);

  return (
    <section className="space-y-8 px-6 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Explore</h1>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold"><Gamepad2 className="mr-1.5 inline h-4 w-4" /> Playable now</h3>
          <Badge variant="secondary">{playableGames.length}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {playableGames.map((game, index) => (
            <GameCard key={game.id} game={game} featured priorityImage={index === 0} />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Coming soon</h3>
          <Badge variant="secondary">{upcomingGames.length}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        <Button asChild variant="outline">
          <Link href="/games">Open Games page</Link>
        </Button>
      </div>
    </section>
  );
}
