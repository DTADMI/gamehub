// Tests de la resolution de langue du site (B2) : la priorite est le choix stocke,
// puis la langue du navigateur, puis le defaut. Une inversion ici afficherait
// l'anglais a un visiteur francophone (ou l'inverse), ce que NF veut eviter.
import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteLocale, setSiteLocale } from "../../packages/game-platform/src/lib/site-locale";

const LOCALE_KEY = "gamehub-locale";

function setNavigatorLanguage(value: string) {
  Object.defineProperty(window.navigator, "language", { value, configurable: true });
}

afterEach(() => {
  window.localStorage.clear();
  document.cookie = `${LOCALE_KEY}=; path=/; max-age=0`;
  setNavigatorLanguage("en-US");
  vi.restoreAllMocks();
});

describe("getSiteLocale", () => {
  it("utilise la langue du navigateur quand rien n est stocke", () => {
    setNavigatorLanguage("fr-CA");
    expect(getSiteLocale()).toBe("fr");
    setNavigatorLanguage("en-US");
    expect(getSiteLocale()).toBe("en");
  });

  it("donne la priorite au choix stocke", () => {
    setNavigatorLanguage("en-US");
    window.localStorage.setItem(LOCALE_KEY, "fr");
    expect(getSiteLocale()).toBe("fr");
  });

  it("ignore une valeur stockee invalide", () => {
    setNavigatorLanguage("fr-CA");
    window.localStorage.setItem(LOCALE_KEY, "de");
    expect(getSiteLocale()).toBe("fr");
  });
});

describe("setSiteLocale", () => {
  it("ecrit le stockage, le cookie et emet un evenement", () => {
    const listener = vi.fn();
    window.addEventListener("gamehub:locale-change", listener);

    setSiteLocale("fr");

    expect(window.localStorage.getItem(LOCALE_KEY)).toBe("fr");
    expect(document.cookie).toContain(`${LOCALE_KEY}=fr`);
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener("gamehub:locale-change", listener);
  });
});
