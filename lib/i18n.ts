export {
  defaultLocale,
  I18nProvider,
  type LocaleCode,
  SUPPORTED_LOCALES,
  type Translations,
  useI18n,
  useTranslation,
} from "./i18n/index";
export { getServerTranslations } from "./i18n/server";
export { default as I18nServerProvider } from "./i18n/server-provider";
export { detectLang, getLocale, i18n, initI18n, setLocale, t } from "@gamehub/game-platform/lib/i18n";
