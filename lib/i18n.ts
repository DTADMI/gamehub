export {
  I18nProvider,
  useI18n,
  useTranslation,
  defaultLocale,
  SUPPORTED_LOCALES,
  type LocaleCode,
  type Translations,
} from "./i18n/index";
export { default as I18nServerProvider } from "./i18n/server-provider";
export { getServerTranslations } from "./i18n/server";
export { detectLang, getLocale, i18n, initI18n, setLocale, t } from "@gamehub/game-platform/lib/i18n";
