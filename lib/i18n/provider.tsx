"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { defaultLocale, getSupportedLocale, isRTL, type LocaleCode } from "./config";
import enTranslations from "./translations/en";
import translationsMap from "./translations/map";
import type { Translations } from "./translations/types";

const isBrowser = typeof window !== "undefined";

interface I18nContextType {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  direction: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  children,
  initialLocale,
  initialTranslations,
}: {
  children: React.ReactNode;
  initialLocale?: LocaleCode;
  initialTranslations?: Translations;
}) {
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale ?? defaultLocale);
  const [translations, setTranslations] = useState<Translations>(
    initialTranslations ?? enTranslations
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const loadTranslations = useCallback((localeCode: LocaleCode) => {
    const loadedTranslations = translationsMap[localeCode] || enTranslations;
    setTranslations(loadedTranslations);
  }, []);

  useEffect(() => {
    if (!isBrowser) {return;}

    const storedLocale = localStorage.getItem("gamehub-locale") as LocaleCode | null;
    const browserCandidates =
      navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language];

    const normalizedStoredLocale = (() => {
      if (!storedLocale) {return null;}
      if (getSupportedLocale(storedLocale)) {return storedLocale;}
      const base = storedLocale.split("-")[0] as LocaleCode;
      if (getSupportedLocale(base)) {return base;}
      return null;
    })();

    const resolvedLocale =
      normalizedStoredLocale ||
      browserCandidates
        .map((candidate) => candidate.trim())
        .filter(Boolean)
        .reduce<LocaleCode | null>((resolved, candidate) => {
          if (resolved) {return resolved;}
          if (getSupportedLocale(candidate)) {return candidate as LocaleCode;}
          const base = candidate.split("-")[0];
          if (getSupportedLocale(base)) {return base as LocaleCode;}
          return null;
        }, null) ||
      defaultLocale;

    setLocaleState(resolvedLocale);
    loadTranslations(resolvedLocale);
    document.cookie = `gamehub-locale=${resolvedLocale}; path=/; max-age=31536000; samesite=lax`;

    document.documentElement.dir = isRTL(resolvedLocale) ? "rtl" : "ltr";
    document.documentElement.lang = resolvedLocale;

    setIsHydrated(true);
  }, [loadTranslations]);

  const setLocale = useCallback(
    (newLocale: LocaleCode) => {
      setLocaleState(newLocale);
      if (isBrowser) {
        localStorage.setItem("gamehub-locale", newLocale);
        document.cookie = `gamehub-locale=${newLocale}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.dir = isRTL(newLocale) ? "rtl" : "ltr";
        document.documentElement.lang = newLocale;
      }
      loadTranslations(newLocale);
    },
    [loadTranslations]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      if (!translations) {return key;}

      const keys = key.split(".");
      let value: unknown = translations;

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          let fallbackValue: unknown = enTranslations;
          for (const fk of keys) {
            if (fallbackValue && typeof fallbackValue === "object" && fk in fallbackValue) {
              fallbackValue = (fallbackValue as Record<string, unknown>)[fk];
            } else {
              return key;
            }
          }
          if (typeof fallbackValue === "string") {
            if (params) {
              return fallbackValue.replace(/\{\{(\w+)\}\}/g, (_, paramKey) =>
                String(params[paramKey] ?? `{{${paramKey}}}`)
              );
            }
            return fallbackValue;
          }
          return key;
        }
      }

      if (typeof value !== "string") {
        return key;
      }

      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) =>
          String(params[paramKey] ?? `{{${paramKey}}}`)
        );
      }

      return value;
    },
    [translations]
  );

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        isLoading,
        direction: isRTL(locale) ? "rtl" : "ltr",
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

const defaultI18nContext: I18nContextType = {
  locale: defaultLocale,
  setLocale: () => {},
  t: (key: string, params?: Record<string, string | number>) => {
    const keys = key.split(".");
    let value: unknown = enTranslations;
    for (const segment of keys) {
      if (value && typeof value === "object" && segment in value) {
        value = (value as Record<string, unknown>)[segment];
      } else {
        return key;
      }
    }
    if (typeof value !== "string") {return key;}
    if (!params) {return value;}
    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) =>
      String(params[paramKey] ?? `{{${paramKey}}}`)
    );
  },
  isLoading: true,
  direction: "ltr",
};

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return defaultI18nContext;
  }
  return context;
}

export function useTranslation() {
  const { t, locale, isLoading } = useI18n();
  return { t, locale, isLoading };
}
