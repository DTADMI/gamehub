"use client";

import { listGames } from "@gamehub/game-platform";
import type { GameEntry } from "@gamehub/game-platform/metadata/games";
import { useQuery } from "@tanstack/react-query";

import { appQueryClient } from "@/lib/query-client";

export function useGamesManifest() {
  return useQuery<GameEntry[]>(
    {
      queryKey: ["manifest", "games"],
      queryFn: async () => listGames(),
      initialData: () => listGames(),
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    },
    appQueryClient,
  );
}
