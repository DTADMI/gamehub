import type { LocaleCode } from "../config";
import en from "./en";
import fr from "./fr";
import type { Translations } from "./types";

const translationsMap: Record<LocaleCode, Translations> = {
  en,
  fr,
};

export default translationsMap;
