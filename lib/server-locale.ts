import { cookies } from "next/headers";

import type { SiteLocale } from "./site-copy";

export async function getServerLocale(): Promise<SiteLocale> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  return lang === "fr" ? "fr" : "en";
}
