"use client";

import { Carousel, Game, GameCard } from "@gamehub/game-platform";
import { useFeature } from "@gamehub/game-platform/lib/flags";
import type { GameEntry } from "@gamehub/game-platform/metadata/games";
import type { ProjectEntry } from "@gamehub/game-platform/metadata/projects";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@gamehub/ui";
import { FolderKanban, Gamepad2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useGamesManifest, useProjectsManifest } from "@/lib/portfolio-queries";

export default function ExplorePage() {
  const { data: gameManifestData } = useGamesManifest();
  const { data: projectManifestData } = useProjectsManifest();
  const gameManifest = (gameManifestData ?? []) as GameEntry[];
  const projectManifest = (projectManifestData ?? []) as ProjectEntry[];

  const allGames: Game[] = gameManifest
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
    }));

  const projects = projectManifest
    .filter((project) => project.visible !== false && project.enabled !== false);

  const useCarousels = useFeature("EXPLORE_CAROUSELS", true);

  return (
    <section className="space-y-8 px-6 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Explore</h1>
      </div>

      <Tabs defaultValue="games" className="w-full">
        <TabsList className="bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1">
          <TabsTrigger value="games" className="inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium">
            <Gamepad2 className="h-4 w-4" /> Games
          </TabsTrigger>
          <TabsTrigger value="projects" className="inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium">
            <FolderKanban className="h-4 w-4" /> Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="mt-6 space-y-6">
          <h3 className="text-lg font-semibold">Playable now</h3>
          {useCarousels ? (
            <Carousel>
              {allGames
                .filter((game) => game.featured)
                .map((game, index) => (
                  <GameCard key={game.id} game={game} featured priorityImage={index === 0} />
                ))}
            </Carousel>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allGames
                .filter((game) => game.featured)
                .map((game, index) => (
                  <GameCard key={game.id} game={game} featured priorityImage={index === 0} />
                ))}
            </div>
          )}

          <h3 className="text-lg font-semibold">Coming soon</h3>
          {useCarousels ? (
            <Carousel>
              {allGames
                .filter((game) => game.upcoming)
                .map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
            </Carousel>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allGames
                .filter((game) => game.upcoming)
                .map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
            </div>
          )}

          <Button asChild variant="outline">
            <Link href="/games">Open Games page</Link>
          </Button>
        </TabsContent>

        <TabsContent value="projects" className="mt-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article key={project.slug} className="bg-card text-card-foreground overflow-hidden rounded-lg border shadow-sm">
                <div className="relative aspect-[16/9]">
                  <Image src={project.image} alt={project.title} fill className="object-cover" />
                </div>
                <div className="space-y-3 p-5">
                  <h2 className="text-lg font-semibold">{project.title}</h2>
                  <p className="text-muted-foreground text-sm">{project.shortDescription}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="bg-accent/10 text-accent inline-flex items-center rounded-md px-2 py-1 text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild={project.repoVisibility === "public"} variant="outline" size="sm" disabled={project.repoVisibility !== "public"}>
                      {project.repoVisibility === "public" ? (
                        <a href={project.repoUrl} target="_blank" rel="noreferrer">GitHub repo</a>
                      ) : (
                        <span>Private repo</span>
                      )}
                    </Button>
                    <Button asChild={project.deployed} size="sm" disabled={!project.deployed}>
                      {project.deployed && project.websiteUrl ? (
                        <a href={project.websiteUrl} target="_blank" rel="noreferrer">Website</a>
                      ) : (
                        <span>Coming soon</span>
                      )}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Button asChild variant="outline">
            <Link href="/projects">Open Projects page</Link>
          </Button>
        </TabsContent>
      </Tabs>
    </section>
  );
}
