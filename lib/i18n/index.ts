// ── NF-Standard i18n System ────────────────────────────────────────────────
// Context-based for React components + standalone exports for non-React usage

export { defaultLocale, type LocaleCode, SUPPORTED_LOCALES } from "./config";
export { I18nProvider, useI18n, useTranslation } from "./provider";
export type { Translations } from "./translations/types";

// ── Server-only (import directly from "@/lib/i18n/server") ──────────────────
// getServerTranslations — uses next/headers, SERVER ONLY
// I18nServerProvider — RSC wrapper, SERVER ONLY

// ── Standalone t() for non-React contexts (game packages, helpers) ──────────
export { getLocale, initI18n, setLocale, setStandaloneLocale, t } from "./standalone";
