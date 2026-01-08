"use client";

import { Carousel, GameCard,listGames, listProjects } from "@games/shared";
import { Button } from "@games/shared/components/ui/button";
import { useFeature } from "@games/shared/lib/flags";
import * as Tabs from "@radix-ui/react-tabs";
import { FolderKanban, Gamepad2 } from "lucide-react";
import Link from "next/link";

type Game = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  slug: string;
  upcoming?: boolean;
  featured?: boolean;
};

const ALL_GAMES: Game[] = listGames()
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
    // Add logic to check for feature flags/admin status if needed
  }));

type Project = {
  title: string;
  description: string;
  tags: string[];
  repo?: string;
  demo?: string;
  comingSoon?: boolean;
  slug: string;
  // Add access control fields
  hasAccess?: boolean;
};

const PROJECTS: Project[] = listProjects()
  .filter((p) => p.visible !== false)
  .map((p) => ({
    title: p.title,
    description: p.shortDescription,
    tags: p.tags,
    repo: p.repo,
    demo: p.demo,
    comingSoon: p.enabled === false || p.upcoming,
    slug: p.slug,
    hasAccess: true, // Defaulting to true for visibility, but should be filtered by user context
  }));

export default function ExplorePage() {
  const useCarousels = useFeature("EXPLORE_CAROUSELS", true);
  const showGamesFeatured = useFeature("EXPLORE_SHOW_FEATURED", true);
  const showGamesUpcoming = useFeature("EXPLORE_SHOW_UPCOMING", true);
  const showProjectsFeatured = useFeature("EXPLORE_SHOW_PROJECTS_FEATURED", true);
  const showProjectsComing = useFeature("EXPLORE_SHOW_PROJECTS_COMING_SOON", true);

  return (
    <section className="space-y-8 px-6 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Explore</h1>
      </div>

      <Tabs.Root defaultValue="games" className="w-full">
        <Tabs.List className="bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1">
          <Tabs.Trigger
            value="games"
            className="ring-offset-background focus-visible:ring-ring/50 data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:outline-none"
          >
            <Gamepad2 className="h-4 w-4" /> Games
          </Tabs.Trigger>
          <Tabs.Trigger
            value="projects"
            className="ring-offset-background focus-visible:ring-ring/50 data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:outline-none"
          >
            <FolderKanban className="h-4 w-4" /> Projects
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="games" className="mt-6 space-y-6">
          {showGamesFeatured && (
            <>
              <h3 className="text-lg font-semibold">Featured</h3>
              {useCarousels ? (
                <Carousel>
                  {ALL_GAMES.filter((g) => g.featured).map((g) => (
                    <GameCard key={g.id} game={g} featured={g.featured} />
                  ))}
                </Carousel>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {ALL_GAMES.filter((g) => g.featured).map((g) => (
                    <GameCard key={g.id} game={g} featured={g.featured} />
                  ))}
                </div>
              )}
            </>
          )}
          {showGamesUpcoming && (
            <>
              <h3 className="text-lg font-semibold">Upcoming</h3>
              {useCarousels ? (
                <Carousel>
                  {ALL_GAMES.filter((g) => g.upcoming).map((g) => (
                    <GameCard key={g.id} game={g} />
                  ))}
                </Carousel>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {ALL_GAMES.filter((g) => g.upcoming).map((g) => (
                    <GameCard key={g.id} game={g} />
                  ))}
                </div>
              )}
            </>
          )}
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/games">Open Games page</Link>
            </Button>
          </div>
        </Tabs.Content>

        <Tabs.Content value="projects" className="mt-6 space-y-6">
          {showProjectsFeatured && (
            <>
              <h3 className="text-lg font-semibold">Featured</h3>
              {useCarousels ? (
                <Carousel>
                  {PROJECTS.filter((p) => !p.comingSoon).map((p) => (
                    <article
                      key={p.title}
                      className="bg-card text-card-foreground rounded-lg border shadow-sm"
                    >
                      <div className="space-y-3 p-5">
                        <h2 className="text-lg font-semibold">{p.title}</h2>
                        <p className="text-muted-foreground text-sm">{p.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="bg-accent/10 text-accent dark:bg-accent/20 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </Carousel>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {PROJECTS.filter((p) => !p.comingSoon).map((p) => (
                    <article
                      key={p.title}
                      className="bg-card text-card-foreground rounded-lg border shadow-sm"
                    >
                      <div className="space-y-3 p-5">
                        <h2 className="text-lg font-semibold">{p.title}</h2>
                        <p className="text-muted-foreground text-sm">{p.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="bg-accent/10 text-accent dark:bg-accent/20 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
          {showProjectsComing && (
            <>
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              {useCarousels ? (
                <Carousel>
                  {PROJECTS.filter((p) => p.comingSoon).map((p) => (
                    <article
                      key={p.title}
                      className="bg-card text-card-foreground rounded-lg border shadow-sm"
                    >
                      <div className="space-y-3 p-5">
                        <h2 className="text-lg font-semibold">{p.title}</h2>
                        <p className="text-muted-foreground text-sm">{p.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="bg-accent/10 text-accent dark:bg-accent/20 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          Coming soon
                        </span>
                      </div>
                    </article>
                  ))}
                </Carousel>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {PROJECTS.filter((p) => p.comingSoon).map((p) => (
                    <article
                      key={p.title}
                      className="bg-card text-card-foreground rounded-lg border shadow-sm"
                    >
                      <div className="space-y-3 p-5">
                        <h2 className="text-lg font-semibold">{p.title}</h2>
                        <p className="text-muted-foreground text-sm">{p.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="bg-accent/10 text-accent dark:bg-accent/20 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          Coming soon
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/projects">Open Projects page</Link>
            </Button>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}
