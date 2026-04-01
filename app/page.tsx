"use client";

import { Carousel, GameCard } from "@gamehub/game-platform";
import { useSiteLocale } from "@gamehub/game-platform/lib/site-locale";
import type { GameEntry } from "@gamehub/game-platform/metadata/games";
import { isGameLaunchable } from "@gamehub/game-platform/metadata/games";
import type { ProjectEntry } from "@gamehub/game-platform/metadata/projects";
import { Badge, Button, Skeleton } from "@gamehub/ui";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { useGamesManifest, useProjectsManifest } from "@/lib/portfolio-queries";
import { siteCopy } from "@/lib/site-copy";

type HomeGame = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  slug: string;
  featured?: boolean;
};

export default function HomePage() {
  const { locale } = useSiteLocale();
  const copy = siteCopy[locale].home;
  const { data: gamesData, isError: gamesError } = useGamesManifest();
  const { data: projectsData, isError: projectsError } = useProjectsManifest();

  const featured = useMemo(() => {
    const games = (gamesData ?? []) as GameEntry[];
    const entries = games.filter((e) => e.visible !== false);
    const allGames: HomeGame[] = entries.map((e) => ({
      id: e.slug,
      title: e.title,
      description: e.shortDescription,
      image: e.image,
      tags: e.tags,
      slug: e.slug,
      featured: e.enabled !== false && !e.upcoming && isGameLaunchable(e),
    }));
    return allGames.filter((g) => g.featured);
  }, [gamesData]);

  const featuredProjects = useMemo(
    () =>
      ((projectsData ?? []) as ProjectEntry[]).filter(
        (p) => p.featured && p.visible !== false && p.enabled !== false,
      ),
    [projectsData],
  );

  return (
    <div className="min-h-screen">
      <main className="flex-1">
        <div className="space-y-10 px-6 py-6 md:px-8">
          <section className="surface rounded-xl p-6">
            <div className="max-w-4xl">
              <h1 className="text-foreground mb-4 text-4xl font-bold text-balance">{copy.title}</h1>
              <p className="text-muted-foreground mb-6 text-lg text-pretty">{copy.subtitle}</p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/explore">
                    <ExternalLink className="h-4 w-4" />
                    {copy.exploreAll}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/resume">{copy.viewResume}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/blog">{copy.readBlog}</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-xl p-0">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-foreground text-2xl font-semibold">{copy.featuredGames}</h2>
              <Badge variant="secondary">{featured.length}</Badge>
            </div>
            {gamesError ? (
              <div className="text-destructive rounded-md border border-current/30 p-4 text-sm">
                Unable to load games right now.
              </div>
            ) : featured.length > 0 ? (
              <Carousel>
                {featured.map((game, index) => (
                  <GameCard key={game.id} game={game} featured priorityImage={index === 0} />
                ))}
              </Carousel>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`game-skeleton-${index}`} className="space-y-3">
                    <Skeleton className="aspect-[16/9] w-full rounded-md" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl p-0">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-foreground text-2xl font-semibold">{copy.featuredProjects}</h2>
              <Badge variant="secondary">{featuredProjects.length}</Badge>
            </div>
            {projectsError ? (
              <div className="text-destructive rounded-md border border-current/30 p-4 text-sm">
                Unable to load projects right now.
              </div>
            ) : featuredProjects.length > 0 ? (
              <Carousel>
                {featuredProjects.map((p) => (
                  <article key={p.slug} className="group flex h-full flex-col overflow-hidden rounded-lg shadow transition-all duration-300 hover:shadow-lg">
                    <div className="bg-muted/30 relative aspect-[16/9] w-full">
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        className="h-full w-full object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>
                    <div className="bg-card/80 text-card-foreground flex flex-1 flex-col gap-3 p-4 backdrop-blur-sm">
                      <h3 className="mb-1 text-lg font-semibold">{p.title}</h3>
                      <p className="text-muted-foreground line-clamp-2 text-sm">{p.shortDescription}</p>
                      <div className="mt-auto flex gap-2">
                        <Button
                          asChild={p.repoVisibility === "public"}
                          size="sm"
                          variant={p.repoVisibility === "public" ? "outline" : "secondary"}
                          className="flex-1"
                          disabled={p.repoVisibility !== "public"}
                        >
                          {p.repoVisibility === "public" ? (
                            <a href={p.repoUrl} target="_blank" rel="noreferrer">
                              GitHub repo
                            </a>
                          ) : (
                            <span>Private repo</span>
                          )}
                        </Button>
                        <Button
                          asChild={p.deployed && !!p.websiteUrl}
                          size="sm"
                          className="flex-1"
                          variant={p.deployed ? "default" : "secondary"}
                          disabled={!p.deployed || !p.websiteUrl}
                        >
                          {p.deployed && p.websiteUrl ? (
                            <a href={p.websiteUrl} target="_blank" rel="noreferrer">
                              Website
                            </a>
                          ) : (
                            <span>Coming soon</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </Carousel>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`project-skeleton-${index}`} className="space-y-3">
                    <Skeleton className="aspect-[16/9] w-full rounded-md" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
