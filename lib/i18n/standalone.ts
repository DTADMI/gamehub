// ── Standalone i18n state (non-React) ──────────────────────────────────────
// Shared by the React I18nProvider (via setStandaloneLocale) and the
// standalone t() used by game packages at module scope.
//
// Keeping this in a separate module (not index.ts) avoids a circular import
// between provider.tsx and index.ts.

import {
  detectLang as pointclickDetect,
  initI18n as pointclickInit,
  setLocale as pointclickSetLocale,
  t as pointclickT,
} from "@gamehub/game-platform/lib/i18n";

import { defaultLocale } from "./config";
import enTranslations from "./translations/en";
import translationsMap from "./translations/map";

let _locale: string = defaultLocale;

/** Initialize standalone i18n — call once at app startup */
export function initI18n(initial?: "en" | "fr") {
  _locale = initial ?? (typeof window !== "undefined" ? pointclickDetect() : defaultLocale);
  pointclickInit(_locale as "en" | "fr");
}

/** Get current standalone locale */
export function getLocale(): string {
  return _locale;
}

/** Set standalone locale (updates localStorage → cookie → module var) */
export function setLocale(locale: "en" | "fr") {
  _locale = locale;
  pointclickSetLocale(locale);
  if (typeof window !== "undefined") {
    localStorage.setItem("gamehub-locale", locale);
    document.cookie = `gamehub-locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  }
}

/** Alias used by the React provider to keep standalone state in sync */
export function setStandaloneLocale(locale: "en" | "fr") {
  _locale = locale;
  pointclickSetLocale(locale);
}

/**
 * Standalone translator — works outside React components.
 * Uses NF-standard translations first, falls back to pointclick-engine game dicts.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const locale = _locale as "en" | "fr";
  const nfTranslations = translationsMap[locale] || enTranslations;

  // Try NF-standard translations first
  const keys = key.split(".");
  let value: unknown = nfTranslations;
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Not found in NF dict — try pointclick-engine game dicts
      const result = pointclickT(key);
      if (result !== key) {
        return params
          ? result.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => String(params[paramKey] ?? `{{${paramKey}}}`))
          : result;
      }
      return key;
    }
  }

  if (typeof value !== "string") {return key;}

  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) =>
      String(params[paramKey] ?? `{{${paramKey}}}`)
    );
  }
  return value;
}
