// ── Standalone i18n state (non-React) ──────────────────────────────────────
// Shared by the React I18nProvider (via setStandaloneLocale) and the
// standalone t() used by game packages at module scope.
//
// Keeping this in a separate module (not index.ts) avoids a circular import
// between provider.tsx and index.ts.
//
// v2 — game translations merged locally (no pointclick-engine dependency).

import { defaultLocale } from "./config";
import enTranslations from "./translations/en";
import { gameTranslations } from "./translations/games-map";
import translationsMap from "./translations/map";

let _locale: string = defaultLocale;

/** Detect browser/OS locale, respecting stored preference */
export function detectLang(): "en" | "fr" {
  if (typeof window === "undefined") {return _locale as "en" | "fr";}
  const stored = window.localStorage.getItem("gamehub-locale");
  if (stored === "en" || stored === "fr") {return stored;}
  const nav = (navigator?.language || "en").toLowerCase();
  if (nav.startsWith("fr")) {return "fr";}
  return "en";
}

/** Initialize standalone i18n — call once at app startup */
export function initI18n(initial?: "en" | "fr") {
  _locale = initial ?? detectLang();
}

/** Get current standalone locale */
export function getLocale(): string {
  return _locale;
}

/** Set standalone locale (updates localStorage → cookie → module var) */
export function setLocale(locale: "en" | "fr") {
  _locale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem("gamehub-locale", locale);
    document.cookie = `gamehub-locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  }
}

/** Alias used by the React provider to keep standalone state in sync */
export function setStandaloneLocale(locale: "en" | "fr") {
  _locale = locale;
}

/**
 * Look up a dot-path key in a nested dictionary.
 * Returns the value (string or object) or undefined if not found.
 */
function dictLookup(dict: Record<string, any>, path: string): string | undefined {
  const parts = path.split(".");
  let node: any = dict;
  for (const p of parts) {
    if (node && typeof node === "object" && p in node) {
      node = node[p];
    } else {
      return undefined;
    }
  }
  return typeof node === "string" ? node : undefined;
}

/**
 * Standalone translator — works outside React components.
 *
 * Lookup priority:
 * 1. NF-standard translations (lib/i18n/translations/{locale}.ts)
 * 2. Game translations (lib/i18n/translations/games/*.json)
 * 3. Fall back to the raw key
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const locale = _locale as "en" | "fr";

  // Try NF-standard translations first
  const nfDict = (translationsMap[locale] || enTranslations) as Record<string, any>;
  const nfResult = dictLookup(nfDict, key);
  if (nfResult !== undefined) {
    return params
      ? nfResult.replace(/\{\{(\w+)\}\}/g, (_, pk) => String(params[pk] ?? `{{${pk}}}`))
      : nfResult;
  }

  // Try game translations
  const gameDict = gameTranslations[locale];
  const gameResult = dictLookup(gameDict, key);
  if (gameResult !== undefined) {
    return params
      ? gameResult.replace(/\{\{(\w+)\}\}/g, (_, pk) => String(params[pk] ?? `{{${pk}}}`))
      : gameResult;
  }

  // Fallback: return the key itself
  return key;
}