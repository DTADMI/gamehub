// ── NF-Standard i18n System ────────────────────────────────────────────────
// Context-based for React components + standalone exports for non-React usage

export { defaultLocale, type LocaleCode, SUPPORTED_LOCALES } from "./config";
export { I18nProvider, useI18n, useTranslation } from "./provider";
export { getServerTranslations } from "./server";
export { default as I18nServerProvider } from "./server-provider";
export type { Translations } from "./translations/types";

// ── Standalone t() for non-React contexts (game packages, helpers) ──────────

import { detectLang as pointclickDetect,getLocale as pointclickGetLocale, initI18n as pointclickInit, setLocale as pointclickSetLocale, t as pointclickT } from "@gamehub/game-platform/lib/i18n";

import { defaultLocale } from "./config";
import enTranslations from "./translations/en";
import translationsMap from "./translations/map";

let _locale: string = defaultLocale;

/** Initialize standalone i18n — call once at app startup */
export function initI18n(initial?: "en" | "fr") {
  _locale = initial ?? (typeof window !== "undefined" ? pointclickDetect() : defaultLocale);
  pointclickInit(_locale as "en" | "fr");
}

/** Get current locale */
export function getLocale(): string {
  return _locale;
}

/** Set locale (updates localStorage → cookie → module var) */
export function setLocale(locale: "en" | "fr") {
  _locale = locale;
  pointclickSetLocale(locale);
  if (typeof window !== "undefined") {
    localStorage.setItem("gamehub-locale", locale);
    document.cookie = `gamehub-locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  }
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
