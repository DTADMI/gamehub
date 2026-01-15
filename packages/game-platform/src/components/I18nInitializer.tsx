"use client";

import { initI18n } from "@games/pointclick-engine";
import { useEffect } from "react";

export function I18nInitializer() {
  useEffect(() => {
    initI18n();
  }, []);
  return null;
}

export default I18nInitializer;
