import { Carousel, GameCard, listGames, listProjects } from "@games/shared";
import { Button } from "@gamehub/ui";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

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
  // Build games from manifest
  const entries = listGames().filter((e) => e.visible !== false);
  const allGames: HomeGame[] = entries.map((e) => {
    return {
      id: e.slug,
      title: e.title,
      description: e.shortDescription,
      image: e.image,
      tags: e.tags,
      slug: e.slug,
      featured: e.enabled !== false && !e.upcoming,
    };
  });
  const featured = allGames.filter((g) => g.featured);
  const featuredProjects = listProjects().filter((p) => p.featured && p.visible !== false);

  return (
    <div className="min-h-screen">
      <main className="flex-1">
        <div className="space-y-10 px-6 py-6 md:px-8">
          {/* Hero Section */}
          <section className="surface rounded-xl p-6">
            <div className="max-w-4xl">
              <h1 className="text-foreground mb-4 text-4xl font-bold text-balance">
                Playful Engineering, Practical Results
              </h1>
              <p className="text-muted-foreground mb-6 text-lg text-pretty">
                Explore a portfolio of interactive games and full-stack projects. Each experience
                highlights product thinking, performance work, and polished UI craft.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/explore">
                    <ExternalLink className="h-4 w-4" />
                    Explore All
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/resume">View Resume</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/blog">Read Blog</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Featured Games */}
          <section className="rounded-xl p-0">
            <h2 className="text-foreground mb-6 text-2xl font-semibold">Featured Games</h2>
            <Carousel>
              {featured.map((game) => (
                <GameCard key={game.id} game={game} featured />
              ))}
            </Carousel>
          </section>

          {/* Featured Projects */}
          <section className="rounded-xl p-0">
            <h2 className="text-foreground mb-6 text-2xl font-semibold">Featured Projects</h2>
            <Carousel>
              {featuredProjects.map((p) => (
                <a
                  key={p.slug}
                  href={p.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-visible:ring-primary block h-full rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label={`Open project ${p.title}`}
                >
                  <div className="group flex h-full flex-col overflow-hidden rounded-lg shadow transition-all duration-300 hover:shadow-lg">
                    <div className="bg-muted/30 relative aspect-[16/9] w-full">
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="bg-card/80 text-card-foreground flex flex-1 flex-col p-4 backdrop-blur-sm">
                      <h3 className="mb-1 text-lg font-semibold">{p.title}</h3>
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {p.shortDescription}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </Carousel>
          </section>

          {/* No Upcoming on Home; upcoming items live on /games or /projects */}
        </div>
      </main>
    </div>
  );
}
