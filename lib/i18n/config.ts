export type LocaleCode = "en" | "fr";

export const defaultLocale: LocaleCode = "fr";

export const SUPPORTED_LOCALES: { code: LocaleCode; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Fran\u00e7ais" },
];

export const isRTL = (_locale: LocaleCode): boolean => false;

export const getSupportedLocale = (code: string): LocaleCode | undefined =>
  SUPPORTED_LOCALES.find((l) => l.code === code)?.code;
