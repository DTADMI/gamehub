"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGameComponent, hasGameComponent } from "@/games/registry";
import { getGame } from "@/lib/games";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

type PageProps = { params: Promise<{ slug: string }> };

export default function GameDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const entry = getGame(slug);
  if (!entry) return notFound();

  // Upcoming / disabled states
  if (entry.upcoming) {
    return (
      <div className="px-6 py-8 md:px-8">
        <Link href="/games" className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Games
        </Link>
        <h1 className="mb-2 text-2xl font-bold">{entry.title}</h1>
        <p className="text-muted-foreground mb-4">{entry.shortDescription}</p>
        <div className="rounded-md border bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-amber-800 dark:text-amber-200">{"This game is marked as "}<b>Coming Soon</b>.</p>
        </div>
      </div>
    );
  }

  if (entry.enabled === false) {
    return (
      <div className="px-6 py-8 md:px-8">
        <Link href="/games" className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Games
        </Link>
        <h1 className="mb-2 text-2xl font-bold">{entry.title}</h1>
        <p className="text-muted-foreground mb-4">{entry.shortDescription}</p>
        <div className="bg-muted rounded-md border p-4">
          <p className="text-muted-foreground">{"This game is currently "}<b>disabled</b>.</p>
        </div>
      </div>
    );
  }

  // Check if the game has a component registered
  const GameComponent = getGameComponent(slug);
  const hasComponent = hasGameComponent(slug);

  return (
    <div className="px-6 py-8 md:px-8">
      <Link href="/games" className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Games
      </Link>

      {!hasComponent && (
        <>
          <h1 className="mb-2 text-3xl font-bold">{entry.title}</h1>
          <p className="text-muted-foreground mb-4">{entry.shortDescription}</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {entry.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
          </div>
          <div className="bg-muted/30 flex min-h-[50vh] items-center justify-center rounded-lg border">
            <div className="text-center">
              <p className="text-muted-foreground mb-2 text-lg">Game component not yet registered</p>
              <p className="text-muted-foreground text-sm">
                Add an entry in <code className="bg-muted rounded px-1">games/registry.ts</code> to connect this game.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/games">Browse Other Games</Link>
              </Button>
            </div>
          </div>
        </>
      )}

      {hasComponent && GameComponent && <GameComponent />}
    </div>
  );
}
