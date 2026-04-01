"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Simple feature flag reader for the frontend.
 * - Reads NEXT_PUBLIC_FEATURE_* env at build/runtime first
 * - Optionally fetches backend evaluation at /api/features when `preferBackend` is true
 */
export function useFeature(flag: string, defaultValue = false, opts?: { preferBackend?: boolean }) {
  const preferBackend = opts?.preferBackend ?? false;
  const fallbackValue = readEnv(flag, defaultValue);
  const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080/api";

  const { data } = useQuery<Record<string, unknown> | null>({
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
  });

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
