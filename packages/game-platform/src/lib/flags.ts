"use client";

import { useQuery } from "@tanstack/react-query";

import { platformQueryClient } from "./query-client";

/**
 * UI/UX Enhancement Feature Flags
 * 
 * These flags control the rollout of new UI features.
 * Set via environment variables: NEXT_PUBLIC_FEATURE_<FLAG_NAME>=true
 * 
 * Available flags:
 * - UI_CARD_ANIMATIONS: Card hover effects (scale, glow, tilt)
 * - UI_PAGE_TRANSITIONS: Fade/slide page transitions
 * - UI_CONFETTI_CELEBRATIONS: Confetti on game win
 * - GAME_GHOST_PIECE: Tetris ghost piece preview
 * - GAME_SNAKE_PARTICLES: Snake food collection particles
 * - POST_GAME_LOGIN_CTA: Show login prompt after game over for guests
 * - LEADERBOARD_GUEST_BLOCK: Block guests from viewing leaderboard
 * - UI_MOBILE_NAV_DRAWER: Mobile slide-out navigation drawer
 */

export const UI_FLAGS = {
  CARD_ANIMATIONS: "UI_CARD_ANIMATIONS",
  PAGE_TRANSITIONS: "UI_PAGE_TRANSITIONS",
  CONFETTI_CELEBRATIONS: "UI_CONFETTI_CELEBRATIONS",
  MOBILE_NAV_DRAWER: "UI_MOBILE_NAV_DRAWER",
} as const;

export const GAME_FLAGS = {
  GHOST_PIECE: "GAME_GHOST_PIECE",
  SNAKE_PARTICLES: "GAME_SNAKE_PARTICLES",
  COUNTDOWN: "GAME_COUNTDOWN",
} as const;

export const AUTH_FLAGS = {
  POST_GAME_LOGIN_CTA: "POST_GAME_LOGIN_CTA",
  LEADERBOARD_GUEST_BLOCK: "LEADERBOARD_GUEST_BLOCK",
} as const;

// Default values for all feature flags
export const FLAG_DEFAULTS: Record<string, boolean> = {
  [UI_FLAGS.CARD_ANIMATIONS]: true,
  [UI_FLAGS.PAGE_TRANSITIONS]: true,
  [UI_FLAGS.CONFETTI_CELEBRATIONS]: true,
  [UI_FLAGS.MOBILE_NAV_DRAWER]: true,
  [GAME_FLAGS.GHOST_PIECE]: true,
  [GAME_FLAGS.SNAKE_PARTICLES]: true,
  [GAME_FLAGS.COUNTDOWN]: true,
  [AUTH_FLAGS.POST_GAME_LOGIN_CTA]: true,
  [AUTH_FLAGS.LEADERBOARD_GUEST_BLOCK]: true,
};

/**
 * Simple feature flag reader for the frontend.
 * - Reads NEXT_PUBLIC_FEATURE_* env at build/runtime first
 * - Optionally fetches backend evaluation at /api/features when `preferBackend` is true
 */
export function useFeature(flag: string, defaultValue?: boolean, opts?: { preferBackend?: boolean }) {
  // Use predefined defaults if available
  const resolvedDefault = defaultValue ?? FLAG_DEFAULTS[flag] ?? false;
  const preferBackend = opts?.preferBackend ?? false;
  const fallbackValue = readEnv(flag, resolvedDefault);
  const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api";

  const { data } = useQuery<Record<string, unknown> | null>(
    {
      queryKey: ["feature-flags", api],
      enabled: preferBackend,
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: 1,
      queryFn: async () => {
        const res = await fetch(`${api}/features`);
        if (!res.ok) {
          return null;
        }
        const json = (await res.json()) as Record<string, unknown>;
        return json;
      },
    },
    platformQueryClient,
  );

  if (preferBackend && typeof data?.[flag] === "boolean") {
    return Boolean(data[flag]);
  }

  return fallbackValue;
}

export function readEnv(flag: string, defaultValue = false): boolean {
  const key = `NEXT_PUBLIC_FEATURE_${flag.toUpperCase()}`;

  // Safely access process.env with type assertion
  const env = process.env as unknown as Record<string, string | undefined>;
  const raw = env[key];
  if (typeof raw === "string") {
    return raw === "true";
  }

  // Check window object if in browser
  if (typeof window !== "undefined") {
    const winRaw = (window as unknown as Record<string, unknown>)[key];
    if (typeof winRaw === "string") {
      return winRaw === "true";
    }
  }

  return defaultValue;
}
