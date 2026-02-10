"use client";

import { useEffect, useState } from "react";

export function useFeature(flag: string, defaultValue = false) {
  const [value] = useState<boolean>(() => readEnv(flag, defaultValue));
  return value;
}

export function readEnv(flag: string, defaultValue = false): boolean {
  const key = `NEXT_PUBLIC_FEATURE_${flag.toUpperCase()}`;
  const env = process.env as unknown as Record<string, string | undefined>;
  const raw = env[key];
  if (typeof raw === "string") return raw === "true";
  return defaultValue;
}
