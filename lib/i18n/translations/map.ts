import type { Translations } from "./types";
import type { LocaleCode } from "../config";
import en from "./en";
import fr from "./fr";

const translationsMap: Record<LocaleCode, Translations> = {
  en,
  fr,
};

export default translationsMap;
