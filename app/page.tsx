"use client";

import { Carousel, GameCard } from "@gamehub/game-platform";
import { useFlags } from "@gamehub/game-platform/contexts/FlagsContext";
import type { GameEntry } from "@gamehub/game-platform/metadata/games";
import { isGameLaunchable, listGames } from "@gamehub/game-platform/metadata/games";
import { Badge, Button, Skeleton } from "@gamehub/ui";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { useI18n } from "@/lib/i18n";

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
  const { flags } = useFlags();
  const { t } = useI18n();
  const gamesData = useMemo(() => listGames(), []);

  const featured = useMemo(() => {
    const games = gamesData ?? [];
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

  return (
    <div className="min-h-screen">
      <main className="flex-1">
        <div className="space-y-10 px-6 py-6 md:px-8">
          <section className={`surface rounded-xl p-6 ${flags.ui.animatedHero ? "animate-fade-in-up" : ""}`}>
            <div className="max-w-4xl">
              <h1 className={`text-foreground mb-4 text-4xl font-bold text-balance ${flags.ui.animatedHero ? "animate-fade-in-up" : ""}`}>
                {t("site.home.title")}
              </h1>
              <p className={`text-muted-foreground mb-6 text-lg text-pretty ${flags.ui.animatedHero ? "animate-fade-in-up animation-delay-100" : ""}`}>
                {t("site.home.subtitle")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/explore">
                    <ExternalLink className="h-4 w-4" />
                    {t("site.home.exploreAll")}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/resume">{t("site.home.viewResume")}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/blog">{t("site.home.readBlog")}</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-xl p-0">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-foreground text-2xl font-semibold">{t("site.home.featuredGames")}</h2>
              <Badge variant="secondary">{featured.length}</Badge>
            </div>
            {featured.length > 0 ? (
              <Carousel>
                {featured.map((game, index) => (
                  <GameCard key={game.id} game={game} featured priorityImage={index === 0} />
                ))}
              </Carousel>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`game-skeleton-${index}`} className="space-y-3">
                    <Skeleton className={`aspect-[16/9] w-full rounded-md ${flags.ui.shimmerSkeletons ? "animate-shimmer" : ""}`} />
                    <Skeleton className={`h-5 w-2/3 ${flags.ui.shimmerSkeletons ? "animate-shimmer" : ""}`} />
                    <Skeleton className={`h-4 w-full ${flags.ui.shimmerSkeletons ? "animate-shimmer" : ""}`} />
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
