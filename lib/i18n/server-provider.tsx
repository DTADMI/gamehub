import type { ReactNode } from "react";

import { I18nProvider } from "./provider";
import { getServerTranslations } from "./server";

export default async function I18nServerProvider({ children }: { children: ReactNode }) {
  const { locale, translations } = await getServerTranslations();

  return (
    <I18nProvider initialLocale={locale} initialTranslations={translations}>
      {children}
    </I18nProvider>
  );
}
