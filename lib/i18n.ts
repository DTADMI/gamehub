export {
  defaultLocale,
  getLocale,
  I18nProvider,
  initI18n,
  type LocaleCode,
  setLocale,
  SUPPORTED_LOCALES,
  // Standalone exports for game packages
  t,
  type Translations,
  useI18n,
  useTranslation,
} from "./i18n/index";

// Server-only exports — import directly from "@/lib/i18n/server" and "@/lib/i18n/server-provider"
// DO NOT re-export server-only modules here: they use next/headers (server-only) and
// would break the client bundle when this barrel is imported from a client component.
