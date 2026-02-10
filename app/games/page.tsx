"use client";

import { GameCard } from "@/components/game-card";
import { listGames } from "@/lib/games";

export default function GamesPage() {
  const entries = listGames().filter((e) => e.visible !== false);
  const games = entries.map((e) => ({
    id: e.slug,
    title: e.title,
    description: e.shortDescription,
    image: e.image,
    tags: e.tags,
    slug: e.slug,
    featured: e.enabled !== false && !e.upcoming,
    upcoming: !!e.upcoming,
  }));

  const featured = games.filter((g) => g.featured);
  const upcoming = games.filter((g) => g.upcoming);

  return (
    <div className="px-6 py-8 md:px-8">
      <h1 className="mb-8 text-3xl font-bold">All Games</h1>

      {featured.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Available Now</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((g) => (
              <GameCard key={g.id} game={g} featured />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Coming Soon</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
