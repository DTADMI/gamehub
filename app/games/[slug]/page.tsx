"use client";
import { GameShell, getGame } from "@gamehub/game-platform";
import MiniBoard from "@gamehub/game-platform/components/leaderboards/MiniBoard";
import { useAuth } from "@gamehub/game-platform/contexts/AuthContext";
import { useFlags } from "@gamehub/game-platform/contexts/FlagsContext";
import { isGameLaunchable } from "@gamehub/game-platform/metadata/games";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@gamehub/ui";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

type PageProps = { params: { slug: string } };

const SKELETON_FLAG_MAP: Record<string, string> = {
  "chrono-shift": "chronoShift",
  "elemental-conflux": "elementalConflux",
  "quantum-architect": "quantumArchitect",
  "block-blast": "blockBlast",
};

export default function GameLauncherPage({ params }: PageProps) {
  const { flags } = useFlags();
  const { user } = useAuth();
  const { slug } = params;
  const entry = getGame(slug);
  if (!entry) {
    return notFound();
  }

  const skeletonFlagKey = SKELETON_FLAG_MAP[slug] as string | undefined;
  const skeletonFlagEnabled = skeletonFlagKey
    ? !!(flags.games as Record<string, boolean>)[skeletonFlagKey]
    : false;

  const isNonProd =
    typeof window !== "undefined" &&
    (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_E2E === "true");
  const allowUpcomingLocal =
    ((typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL === "true" &&
      isNonProd) ||
      !!flags.ui?.allowPlayUpcomingLocal) &&
    isGameLaunchable(entry);

  if (entry.upcoming && !allowUpcomingLocal) {
    const isFlagGatedSkeleton = !!skeletonFlagKey && !skeletonFlagEnabled;

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">{entry.title}</h1>
        <p className="text-muted-foreground mb-4">{entry.shortDescription}</p>
        <div className="rounded-md border bg-amber-50 p-4 dark:bg-amber-900/20">
          This game is marked as <b>Coming Soon</b>.
        </div>
        {isFlagGatedSkeleton ? (
          <div className="text-muted-foreground mt-3 text-xs">
            Feature flag <code>games.{skeletonFlagKey}</code> is off.
          </div>
        ) : null}
      </div>
    );
  }
  if (entry.enabled === false && !allowUpcomingLocal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold">{entry.title}</h1>
        <p className="text-muted-foreground mb-4">{entry.shortDescription}</p>
        <div className="rounded-md border bg-gray-50 p-4 dark:bg-gray-800">
          This game is currently <b>disabled by admin</b>.
        </div>
      </div>
    );
  }

  const Game = dynamicImport(() => entry.getComponent().then((m) => m.default ?? m), {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    ),
  });

  return (
    <GameShell
      ariaLabel={`${entry.title} game`}
      tips={undefined}
      preloadSounds={entry.preloadAssets}
    >
      <Game />
      {entry.slug === "breakout" ? (
        <div className="px-4">
          <MiniBoard gameType="BREAKOUT" limit={10} />
        </div>
      ) : null}
      {!user ? (
        <div className="px-4 pb-6">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="text-base">Save your progress and unlock rankings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link href={`/auth?redirect=/games/${entry.slug}`}>Create account</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/auth?redirect=/games/${entry.slug}`}>Sign in</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </GameShell>
  );
}




