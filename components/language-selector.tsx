"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import type { LocaleCode } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n";

export default function LanguageSelector({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { locale, setLocale } = useI18n();
  const [isPending, setIsPending] = useState(false);

  const switchTo = (nextLocale: LocaleCode) => {
    if (nextLocale === locale || isPending) {return;}

    setIsPending(true);
    startTransition(() => {
      setLocale(nextLocale);
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
      <Globe className="mr-1 h-4 w-4 text-muted-foreground" />
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
        aria-label="Changer la langue en fran\u00e7ais"
        data-testid="lang-fr"
      >
        FR
      </button>
    </div>
  );
}
