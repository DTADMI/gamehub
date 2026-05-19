import { z } from "zod";

export const gameScoreSchema = z.object({
  gameType: z.string().min(1, "Game type is required").max(64),
  score: z.number().int().min(0, "Score must be non-negative"),
  metadata: z.unknown().optional(),
});

export type GameScorePayload = z.infer<typeof gameScoreSchema>;

export const featureFlagSchema = z.object({
  path: z.string().min(1),
  value: z.union([z.boolean(), z.string()]),
});

export type FeatureFlagPayload = z.infer<typeof featureFlagSchema>;

export const leaderboardQuerySchema = z.object({
  gameType: z.string().min(1).max(64).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;

export const gameSettingsSchema = z.object({
  volume: z.number().min(0).max(1).optional(),
  sfxEnabled: z.boolean().optional(),
  musicEnabled: z.boolean().optional(),
  difficulty: z.enum(["easy", "normal", "hard"]).optional(),
  controls: z.record(z.string(), z.string()).optional(),
});

export type GameSettings = z.infer<typeof gameSettingsSchema>;
