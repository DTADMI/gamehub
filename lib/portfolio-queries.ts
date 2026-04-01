"use client";

import { useQuery } from "@tanstack/react-query";
import { listGames, listProjects } from "@gamehub/game-platform";
import type { GameEntry } from "@gamehub/game-platform/metadata/games";
import type { ProjectEntry } from "@gamehub/game-platform/metadata/projects";

export function useGamesManifest() {
  return useQuery<GameEntry[]>({
    queryKey: ["manifest", "games"],
    queryFn: async () => listGames(),
  });
}

export function useProjectsManifest() {
  return useQuery<ProjectEntry[]>({
    queryKey: ["manifest", "projects"],
    queryFn: async () => listProjects(),
  });
}
