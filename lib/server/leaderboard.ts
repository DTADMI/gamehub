import { createHash } from "node:crypto";

import { createServerClient } from "@/lib/supabase/server";

export const SUPPORTED_GAME_TYPES = [
  "SNAKE",
  "BUBBLE_POP",
  "TETRIS",
  "BREAKOUT",
  "KNITZY",
  "MEMORY",
  "CHECKERS",
  "CHESS",
  "PLATFORMER",
  "TOWER_DEFENSE",
] as const;

export type LeaderboardGameType = (typeof SUPPORTED_GAME_TYPES)[number];

export function isSupportedGameType(value: string): value is LeaderboardGameType {
  return SUPPORTED_GAME_TYPES.includes(value as LeaderboardGameType);
}

const MAX_SCORE_BY_GAME: Record<LeaderboardGameType, number> = {
  SNAKE: 2_000_000,
  BUBBLE_POP: 2_000_000,
  TETRIS: 5_000_000,
  BREAKOUT: 5_000_000,
  KNITZY: 2_000_000,
  MEMORY: 1_000_000,
  CHECKERS: 100_000,
  CHESS: 100_000,
  PLATFORMER: 3_000_000,
  TOWER_DEFENSE: 5_000_000,
};

export function normalizeGameType(input: string): LeaderboardGameType {
  const normalized = input.toUpperCase().replace(/-/g, "_");
  if (!isSupportedGameType(normalized)) {
    throw new Error(`Unsupported game type: ${input}`);
  }
  return normalized;
}

export function validateScore(gameType: LeaderboardGameType, score: number) {
  if (!Number.isFinite(score) || !Number.isInteger(score) || score <= 0) {
    throw new Error("Score must be a positive integer.");
  }
  const max = MAX_SCORE_BY_GAME[gameType];
  if (score > max) {
    throw new Error(`Score is above allowed maximum for ${gameType}.`);
  }
}

export function sanitizeMetadata(input: unknown) {
  if (input == null || typeof input !== "object") {
    return {};
  }
  const safeString = JSON.stringify(input);
  if (safeString.length > 2_000) {
    return {};
  }
  return JSON.parse(safeString) as Record<string, unknown>;
}

export function dedupeHash(userId: string, gameType: LeaderboardGameType, score: number) {
  return createHash("sha256")
    .update(`${userId}:${gameType}:${score}`)
    .digest("hex")
    .slice(0, 32);
}

export async function getActiveSeasonId() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("leaderboard_seasons")
    .select("id")
    .eq("is_active", true)
    .maybeSingle();
  return data?.id ?? null;
}
