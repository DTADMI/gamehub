"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { setSiteLocale, useSiteLocale } from "../lib/site-locale";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { locale } = useSiteLocale();
  const [isPending, setIsPending] = useState(false);

  const switchTo = (nextLocale: "en" | "fr") => {
    if (nextLocale === locale || isPending) {
      return;
    }

    setIsPending(true);
    startTransition(() => {
      setSiteLocale(nextLocale);
      router.refresh();
      setTimeout(() => setIsPending(false), 200);
    });
  };

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => switchTo("en")}
        disabled={isPending}
        className={`min-h-11 rounded border px-3 text-sm ${locale === "en" ? "bg-primary text-primary-foreground" : "bg-muted"} ${isPending ? "opacity-60" : ""}`}
        aria-pressed={locale === "en"}
        aria-label="Switch language to English"
        data-testid="lang-en"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchTo("fr")}
        disabled={isPending}
        className={`min-h-11 rounded border px-3 text-sm ${locale === "fr" ? "bg-primary text-primary-foreground" : "bg-muted"} ${isPending ? "opacity-60" : ""}`}
        aria-pressed={locale === "fr"}
        aria-label="Changer la langue en français"
        data-testid="lang-fr"
      >
        FR
      </button>
    </div>
  );
}

export default LanguageToggle;
