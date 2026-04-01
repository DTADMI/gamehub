"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  DEFAULT_FEATURE_FLAGS,
  type FeatureFlags,
  mergeFeatureFlags,
  setByPath,
} from "@/lib/feature-flags";

const STORAGE_KEY = "gh:flags:v2";

type FlagsContextValue = {
  flags: FeatureFlags;
  setFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void;
  setFlagPath: (path: string, value: unknown) => void;
  reset: () => void;
  refreshFromServer: () => Promise<void>;
};

const FlagsContext = createContext<FlagsContextValue | null>(null);

export function FlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);

  const refreshFromServer = async () => {
    try {
      const response = await fetch("/api/feature-flags", { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as { flags?: Partial<FeatureFlags> };
      if (payload.flags) {
        setFlags((prev) => mergeFeatureFlags({ ...prev, ...payload.flags }));
      }
    } catch {
      // Keep local flags when server fetch fails.
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FeatureFlags>;
        setFlags(mergeFeatureFlags(parsed));
      }
    } catch {}

    void refreshFromServer();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch {}
  }, [flags]);

  const value = useMemo<FlagsContextValue>(
    () => ({
      flags,
      setFlag: (key, value) => {
        setFlags((prev) => mergeFeatureFlags({ ...prev, [key]: value }));
      },
      setFlagPath: (path, value) => {
        setFlags((prev) => {
          const next = structuredClone(prev) as FeatureFlags;
          setByPath(next as Record<string, any>, path, value);
          return mergeFeatureFlags(next);
        });
      },
      reset: () => setFlags(DEFAULT_FEATURE_FLAGS),
      refreshFromServer,
    }),
    [flags],
  );

  return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
}

export function useFlags() {
  const ctx = useContext(FlagsContext);
  if (!ctx) {
    throw new Error("useFlags must be used within FlagsProvider");
  }
  return ctx;
}

export default FlagsProvider;
