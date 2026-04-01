"use client";

import { useEffect, useEffectEvent, useState } from "react";

export type SiteLocale = "en" | "fr";

const LOCALE_KEY = "lang";
const LOCALE_EVENT = "gamehub:locale-change";

function isLocale(value: string | null | undefined): value is SiteLocale {
  return value === "en" || value === "fr";
}

export function getSiteLocale(): SiteLocale {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(LOCALE_KEY);
  if (isLocale(stored)) {
    return stored;
  }

  const nav = (window.navigator.language || "en").toLowerCase();
  return nav.startsWith("fr") ? "fr" : "en";
}

export function setSiteLocale(locale: SiteLocale) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCALE_KEY, locale);
  document.cookie = `lang=${locale}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new CustomEvent<SiteLocale>(LOCALE_EVENT, { detail: locale }));
}

export function useSiteLocale() {
  const [locale, setLocale] = useState<SiteLocale>("en");
  const onLocaleChangeEvent = useEffectEvent((event: Event) => {
    const customEvent = event as CustomEvent<SiteLocale>;
    if (isLocale(customEvent.detail)) {
      setLocale(customEvent.detail);
    }
  });
  const onStorageEvent = useEffectEvent((event: StorageEvent) => {
    if (event.key === LOCALE_KEY && isLocale(event.newValue)) {
      setLocale(event.newValue);
    }
  });

  useEffect(() => {
    setLocale(getSiteLocale());
    window.addEventListener(LOCALE_EVENT, onLocaleChangeEvent as EventListener);
    window.addEventListener("storage", onStorageEvent);
    return () => {
      window.removeEventListener(LOCALE_EVENT, onLocaleChangeEvent as EventListener);
      window.removeEventListener("storage", onStorageEvent);
    };
  }, [onLocaleChangeEvent, onStorageEvent]);

  return { locale, setLocale: setSiteLocale };
}
