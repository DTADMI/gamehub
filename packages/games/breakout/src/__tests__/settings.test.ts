import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  BREAKOUT_SETTINGS_KEY,
  getBreakoutSettings,
  saveBreakoutSettings,
} from "../settings";

describe("breakout settings", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("revient au defaut quand rien n'est stocke", () => {
    expect(getBreakoutSettings()).toEqual({ mouseControl: false });
  });

  it("relit une valeur enregistree (aller-retour)", () => {
    saveBreakoutSettings({ mouseControl: true });
    expect(getBreakoutSettings()).toEqual({ mouseControl: true });
  });

  it("utilise la cle de stockage stable du jeu", () => {
    saveBreakoutSettings({ mouseControl: true });
    expect(localStorage.getItem(BREAKOUT_SETTINGS_KEY)).toBe(JSON.stringify({ mouseControl: true }));
  });

  it("coerce une valeur non booleenne en booleen", () => {
    localStorage.setItem(BREAKOUT_SETTINGS_KEY, JSON.stringify({ mouseControl: "oui" }));
    expect(getBreakoutSettings()).toEqual({ mouseControl: true });
  });

  it("ne jette pas sur un JSON invalide et revient au defaut", () => {
    localStorage.setItem(BREAKOUT_SETTINGS_KEY, "{ pas du json");
    expect(getBreakoutSettings()).toEqual({ mouseControl: false });
  });

  it("ne jette pas si l'ecriture echoue", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => saveBreakoutSettings({ mouseControl: true })).not.toThrow();
  });
});
