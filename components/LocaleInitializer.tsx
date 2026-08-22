"use client";

import { useEffect } from "react";

import { initI18n } from "@/lib/i18n";

/** Initializes the standalone i18n module-level locale for non-React usage (game packages). */
export function LocaleInitializer() {
  useEffect(() => {
    initI18n();
  }, []);
  return null;
}

export default LocaleInitializer;