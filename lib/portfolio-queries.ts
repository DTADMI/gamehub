"use client";

import { listGames, listProjects } from "@gamehub/game-platform";
import type { GameEntry } from "@gamehub/game-platform/metadata/games";
import type { ProjectEntry } from "@gamehub/game-platform/metadata/projects";
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

export function useProjectsManifest() {
  return useQuery<ProjectEntry[]>(
    {
      queryKey: ["manifest", "projects"],
      queryFn: async () => listProjects(),
      initialData: () => listProjects(),
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    },
    appQueryClient,
  );
}
