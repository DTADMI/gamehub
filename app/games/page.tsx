"use client";

import GamesList from "@gamehub/game-platform/components/games/GamesList";
import { useFlags } from "@gamehub/game-platform/contexts/FlagsContext";
import { useSiteLocale } from "@gamehub/game-platform/lib/site-locale";
import { isGameLaunchable } from "@gamehub/game-platform/metadata/games";
import type { GameEntry } from "@gamehub/game-platform/metadata/games";

import { useGamesManifest } from "@/lib/portfolio-queries";
import { siteCopy } from "@/lib/site-copy";

export default function GamesPage() {
  const { flags } = useFlags();
  const { locale } = useSiteLocale();
  const { data: manifestData } = useGamesManifest();
  const manifest = (manifestData ?? []) as GameEntry[];

  const entries = manifest.filter((entry) => entry.visible !== false);
  const isNonProd =
    typeof window !== "undefined" &&
    (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_E2E === "true");
  const enableUpcomingLocal =
    (typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL === "true" &&
      isNonProd) ||
    !!flags.ui?.allowPlayUpcomingLocal;

  type GamesListItem = {
    id: string;
    title: string;
    description: string;
    image: string;
    tags: string[];
    playable?: boolean;
    devPlayable?: boolean;
  };

  const games: GamesListItem[] = entries.map((entry) => {
    const devPlayable = Boolean(
      entry.upcoming && entry.enabled === false && enableUpcomingLocal && isGameLaunchable(entry),
    );

    return {
      id: entry.slug,
      title: entry.title,
      description: entry.shortDescription,
      image: entry.image,
      tags: entry.tags,
      playable:
        (entry.enabled !== false && !entry.upcoming && isGameLaunchable(entry)) || devPlayable,
      devPlayable,
    };
  });

  if (flags.sdBodEnabled) {
    games.push({
      id: "systems-discovery?pack=breath",
      title: "Systems Discovery - Body Systems",
      description:
        "Explore the Body Systems sub-packs (Breath, Fuel, Move, Signal and Defend, Grow).",
      image: "/images/games/systems-discovery-card.svg",
      tags: ["Educational", "Packs", "Accessible"],
      playable: true,
    });
  }

  return <GamesList games={games} copy={siteCopy[locale].games} />;
}
