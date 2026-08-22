"use client";

import { useCallback, useMemo } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useFlags } from "../contexts/FlagsContext";

const STORAGE_KEY = "gh:completions";

function getCompletionCount(gameSlug: string): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {return 0;}
    const data = JSON.parse(raw) as Record<string, number>;
    return data[gameSlug] ?? 0;
  } catch {
    return 0;
  }
}

function incrementCompletionCount(gameSlug: string): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const next = (data[gameSlug] ?? 0) + 1;
    data[gameSlug] = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return next;
  } catch {
    return 1;
  }
}

export function usePostGameCTA(slug: string) {
  const { flags } = useFlags();
  const { user } = useAuth();

  const frequency = flags.auth?.postGameCTAFrequency ?? "occasional";

  const shouldShow = useCallback((): boolean => {
    if (!flags.ui?.postGameAuthCTA) {return false;}
    if (user) {return false;}
    if (frequency === "never") {return false;}

    const count = incrementCompletionCount(slug);

    switch (frequency) {
      case "always":
        return true;
      case "occasional":
        return count % 3 === 0;
      case "rare":
        return count % 10 === 0;
      default:
        return false;
    }
  }, [flags.ui?.postGameAuthCTA, flags.auth?.postGameCTAFrequency, frequency, slug, user]);

  const completionCount = useMemo(() => getCompletionCount(slug), [slug]);

  return { shouldShow, completionCount };
}
