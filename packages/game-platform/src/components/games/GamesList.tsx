"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "../../contexts/AuthContext";

interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  playable?: boolean;
  devPlayable?: boolean;
}

interface GamesListCopy {
  title: string;
  subtitle: string;
  signInHint: string;
  featured: string;
  upcoming: string;
  comingSoon: string;
  playNow: string;
  devPlayable: string;
}

interface GamesListProps {
  games: Game[];
  copy?: GamesListCopy;
}

const defaultCopy: GamesListCopy = {
  title: "Our Games Collection",
  subtitle: "Discover and play our selection of fun and engaging games",
  signInHint: "Sign in to track your progress and compete on the leaderboards!",
  featured: "Featured",
  upcoming: "Upcoming",
  comingSoon: "Coming Soon",
  playNow: "Play Now",
  devPlayable: "Dev-Playable",
};

export default function GamesList({ games, copy = defaultCopy }: GamesListProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-foreground text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl">
            {copy.title}
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-xl">{copy.subtitle}</p>
        </div>

        {!user && (
          <div className="bg-card/80 text-card-foreground mb-8 rounded-lg p-4 text-center backdrop-blur-sm">
            <p>{copy.signInHint}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div key={game.id}>
              {game.playable ? (
                <Link
                  href={`/games/${game.id}`}
                  className="group bg-card text-card-foreground relative block overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-2xl"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={game.image}
                      alt={game.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-2 right-2 rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white">
                      {copy.featured}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-card-foreground text-xl font-bold">{game.title}</h3>
                      <div className="flex flex-wrap justify-end gap-1">
                        {game.devPlayable && (
                          <span className="inline-flex items-center rounded-full bg-purple-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                            {copy.devPlayable}
                          </span>
                        )}
                        {game.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-accent/15 text-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-2">{game.description}</p>
                    <span className="bg-primary text-primary-foreground inline-flex items-center rounded-md px-4 py-2 text-sm font-medium">
                      {copy.playNow}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="group bg-card text-card-foreground relative overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-2xl">
                  <div className="relative h-48 w-full">
                    <Image
                      src={game.image}
                      alt={game.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-2 right-2 rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-bold text-yellow-900">
                      {copy.upcoming}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="bg-card text-card-foreground rounded-full px-4 py-2 font-bold">
                        {copy.comingSoon}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-card-foreground text-xl font-bold">{game.title}</h3>
                      <div className="flex flex-wrap justify-end gap-1">
                        {game.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-accent/15 text-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{game.description}</p>
                    <button
                      disabled
                      className="inline-flex cursor-not-allowed items-center rounded-md border border-transparent bg-gray-400 px-4 py-2 text-sm font-medium text-white shadow-sm"
                    >
                      {copy.comingSoon}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
