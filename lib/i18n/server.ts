import { cookies, headers } from "next/headers";
import { defaultLocale, getSupportedLocale, type LocaleCode } from "./config";
import enTranslations from "./translations/en";
import translationsMap from "./translations/map";

async function resolveLocale(): Promise<LocaleCode> {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get("gamehub-locale")?.value;
  if (storedLocale && getSupportedLocale(storedLocale)) {
    return storedLocale as LocaleCode;
  }

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language") || "";
  const candidates = acceptLanguage
    .split(",")
    .map((entry) => entry.trim().split(";")[0])
    .filter(Boolean);

  for (const candidate of candidates) {
    if (getSupportedLocale(candidate)) {
      return candidate as LocaleCode;
    }
    const base = candidate.split("-")[0];
    if (getSupportedLocale(base)) {
      return base as LocaleCode;
    }
  }

  return defaultLocale;
}

function createTranslator(locale: LocaleCode) {
  const translations = translationsMap[locale] || enTranslations;

  const t = (key: string, params?: Record<string, string | number>): string => {
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
          return params
            ? fallbackValue.replace(/\{\{(\w+)\}\}/g, (_, paramKey) =>
                String(params[paramKey] ?? `{{${paramKey}}}`)
              )
            : fallbackValue;
        }
        return key;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    return params
      ? value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) =>
          String(params[paramKey] ?? `{{${paramKey}}}`)
        )
      : value;
  };

  return { t, locale, translations };
}

export async function getServerTranslations() {
  const locale = await resolveLocale();
  return createTranslator(locale);
}
