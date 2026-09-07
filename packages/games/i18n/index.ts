/**
 * Shared minimal i18n helper for arcade games
 *
 * Pattern: import { createI18n } from "@games/i18n";
 *          const { t, locale } = createI18n(TX, "en");
 *
 * No React Context needed. Uses localStorage for locale persistence.
 * Compatible with the platform's useI18n() pattern.
 */

export type SupportedLocale = "en" | "fr";

export interface I18nMap {
  en: Record<string, string>;
  fr: Record<string, string>;
}

const LOCALE_KEY = "gh-locale";

function detectLocale(): SupportedLocale {
  try {
    // 1) Check stored preference
    const stored = localStorage.getItem(LOCALE_KEY) as SupportedLocale | null;
    if (stored === "en" || stored === "fr") {return stored;}

    // 2) Check browser language
    if (typeof navigator !== "undefined") {
      const navLang = navigator.language?.split("-")[0];
      if (navLang === "fr") {return "fr";}
    }

    // 3) Default: English (platform default for arcade games)
    return "en";
  } catch {
    return "en";
  }
}

export function createI18n<T extends I18nMap>(tx: T, defaultLocale?: SupportedLocale) {
  let locale: SupportedLocale = defaultLocale || detectLocale();

  function t(key: keyof T["en"] & string): string {
    return tx[locale]?.[key] || tx.en[key] || key;
  }

  function setLocale(loc: SupportedLocale): void {
    locale = loc;
    try { localStorage.setItem(LOCALE_KEY, loc); } catch { /* ignore */ }
  }

  function getLocale(): SupportedLocale {
    return locale;
  }

  return { t, setLocale, getLocale };
}

/**
 * Quick bilingual string helper — returns { en: "...", fr: "..." }
 * Use for scene titles, button labels, etc. in TX maps.
 */
export function b(en: string, fr: string): { en: string; fr: string } {
  return { en, fr };
}