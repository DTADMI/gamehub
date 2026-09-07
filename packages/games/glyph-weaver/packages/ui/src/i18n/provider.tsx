'use client';

import React, { createContext, useCallback,useContext, useEffect, useState } from 'react';

import type { I18nContextValue,Locale, TranslationMap } from './config';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './config';
import { en, fr } from './translations/index';

const translations: Record<Locale, TranslationMap> = { en, fr };

function getNestedValue(obj: TranslationMap, path: string): string {
  const keys = path.split('.');
  let current: TranslationMap | string = obj;
  for (const key of keys) {
    if (typeof current !== 'object' || current === null) {return path;}
    current = (current as TranslationMap)[key]!;
    if (current === undefined) {return path;}
  }
  return typeof current === 'string' ? current : path;
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {return undefined;}
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match?.[1];
}

function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') {return;}
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function resolveClientLocale(): Locale {
  // ── Priority 1: GameHub's shared locale cookie (GW is embedded in GH) ──
  const ghCookie = readCookie('gamehub-locale');
  if (ghCookie && SUPPORTED_LOCALES.includes(ghCookie as Locale)) {
    return ghCookie as Locale;
  }

  // ── Priority 2: GW's own cookie (standalone fallback) ──
  const gwCookie = readCookie('glyph-weaver-locale');
  if (gwCookie && SUPPORTED_LOCALES.includes(gwCookie as Locale)) {
    return gwCookie as Locale;
  }

  // ── Priority 3: localStorage ──
  try {
    const fromStorage = localStorage.getItem('gamehub-locale') ?? localStorage.getItem('glyph-weaver-locale');
    if (fromStorage && SUPPORTED_LOCALES.includes(fromStorage as Locale)) {
      return fromStorage as Locale;
    }
  } catch {
    // localStorage unavailable
  }

  // ── Priority 4: browser language ──
  if (typeof navigator !== 'undefined' && navigator.languages) {
    for (const lang of navigator.languages) {
      const base = lang.split('-')[0]!;
      if (SUPPORTED_LOCALES.includes(base as Locale)) {
        return base as Locale;
      }
    }
  }

  return DEFAULT_LOCALE;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(resolveClientLocale());
  }, []);

  // ── Listen for GameHub locale changes via custom event ──
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ locale: string }>).detail;
      if (detail?.locale && SUPPORTED_LOCALES.includes(detail.locale as Locale)) {
        setLocaleState(detail.locale as Locale);
      }
    };
    window.addEventListener('gamehub:localeChange', handler);
    return () => window.removeEventListener('gamehub:localeChange', handler);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    if (!SUPPORTED_LOCALES.includes(next)) {return;}
    setLocaleState(next);
    try {
      localStorage.setItem('glyph-weaver-locale', next);
      // Also sync to GameHub's locale storage so GH and GW stay in sync
      localStorage.setItem('gamehub-locale', next);
    } catch {
      // localStorage unavailable
    }
    setCookie('glyph-weaver-locale', next);
    setCookie('gamehub-locale', next);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dict = translations[locale] ?? translations[DEFAULT_LOCALE];
      return getNestedValue(dict, key);
    },
    [locale],
  );

  return React.createElement(I18nContext.Provider, { value: { locale, setLocale, t } }, children);
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}

export type { I18nContextValue,Locale } from './config';