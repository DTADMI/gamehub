// ── NF-Standard i18n System ────────────────────────────────────────────────
// Context-based for React components + standalone exports for non-React usage

export { defaultLocale, type LocaleCode, SUPPORTED_LOCALES } from "./config";
export { I18nProvider, useI18n, useTranslation } from "./provider";
export { getServerTranslations } from "./server";
export { default as I18nServerProvider } from "./server-provider";
export type { Translations } from "./translations/types";

// ── Standalone t() for non-React contexts (game packages, helpers) ──────────
export { initI18n, getLocale, setLocale, setStandaloneLocale, t } from "./standalone";
