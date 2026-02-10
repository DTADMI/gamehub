"use client";

import { Carousel } from "@/components/carousel";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import { listGames } from "@/lib/games";
import { listProjects } from "@/lib/projects";
import { FolderKanban, Gamepad2, Github } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const ALL_GAMES = listGames()
  .filter((g) => g.visible !== false)
  .map((g) => ({
    id: g.slug,
    title: g.title,
    description: g.shortDescription,
    image: g.image,
    tags: g.tags,
    slug: g.slug,
    upcoming: !!g.upcoming,
    featured: g.enabled !== false && !g.upcoming,
  }));

const PROJECTS = listProjects().map((p) => ({
  title: p.title,
  description: p.shortDescription,
  tags: p.tags,
  repo: p.repo,
  slug: p.slug,
  upcoming: !!p.upcoming,
}));

export default function ExplorePage() {
  const [tab, setTab] = useState<"games" | "projects">("games");

  return (
    <section className="space-y-8 px-6 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Explore</h1>
      </div>

      <div className="flex gap-2">
        <Button
          variant={tab === "games" ? "default" : "outline"}
          onClick={() => setTab("games")}
          className="gap-2"
        >
          <Gamepad2 className="h-4 w-4" /> Games
        </Button>
        <Button
          variant={tab === "projects" ? "default" : "outline"}
          onClick={() => setTab("projects")}
          className="gap-2"
        >
          <FolderKanban className="h-4 w-4" /> Projects
        </Button>
      </div>

      {tab === "games" && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Featured</h3>
            <Carousel>
              {ALL_GAMES.filter((g) => g.featured).map((g) => (
                <GameCard key={g.id} game={g} featured={g.featured} />
              ))}
            </Carousel>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Upcoming</h3>
            <Carousel>
              {ALL_GAMES.filter((g) => g.upcoming).map((g) => (
                <GameCard key={g.id} game={g} />
              ))}
            </Carousel>
          </div>
          <Button asChild variant="outline">
            <Link href="/games">Open Games page</Link>
          </Button>
        </div>
      )}

      {tab === "projects" && (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((p) => (
              <a
                key={p.slug}
                href={p.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card text-card-foreground block rounded-lg border shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="space-y-3 p-5">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    {p.title}
                    <Github className="text-muted-foreground h-4 w-4" />
                  </h2>
                  <p className="text-muted-foreground text-sm">{p.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="bg-accent/10 text-accent-foreground inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  {p.upcoming && (
                    <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      Coming soon
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
          <Button asChild variant="outline">
            <Link href="/projects">Open Projects page</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
