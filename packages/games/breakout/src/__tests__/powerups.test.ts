import { afterEach, describe, expect, it, vi } from "vitest";

import {
  FAST_FACTOR,
  desiredSpeedFromModifier,
  pickWeightedPowerUp,
  type ActiveModifier,
} from "../components/BreakoutPowerUps";

afterEach(() => {
  vi.restoreAllMocks();
  delete (window as unknown as { __gh_mode?: string }).__gh_mode;
});

describe("desiredSpeedFromModifier (caracterisation)", () => {
  it("aucun modificateur, niveau 1 : vitesse de base", () => {
    expect(desiredSpeedFromModifier(null, 1, 0.75)).toBeCloseTo(4.32, 5);
  });

  it("la vitesse augmente avec le niveau (plafonnee a +30%)", () => {
    expect(desiredSpeedFromModifier(null, 3, 0.75)).toBeCloseTo(4.32 * 1.1, 5);
    // Niveau tres haut : le bonus est borne a 1.3
    expect(desiredSpeedFromModifier(null, 50, 0.75)).toBeCloseTo(4.32 * 1.3, 5);
  });

  it("le modificateur fast applique FAST_FACTOR", () => {
    const fast: ActiveModifier = { type: "fast", endTime: 0 };
    expect(desiredSpeedFromModifier(fast, 1, 0.75)).toBeCloseTo(4.32 * FAST_FACTOR, 5);
  });

  it("le modificateur slow applique le facteur fourni", () => {
    const slow: ActiveModifier = { type: "slow", endTime: 0 };
    expect(desiredSpeedFromModifier(slow, 1, 0.9)).toBeCloseTo(4.32 * 0.9, 5);
  });

  it("le mode hard/chaos accentue la vitesse", () => {
    (window as unknown as { __gh_mode?: string }).__gh_mode = "chaos";
    // 4.32 * 1.25 = 5.4, sous le plafond
    expect(desiredSpeedFromModifier(null, 1, 0.75)).toBeCloseTo(4.32 * 1.25, 5);
  });

  it("la vitesse reste bornee entre MIN et MAX", () => {
    const fast: ActiveModifier = { type: "fast", endTime: 0 };
    (window as unknown as { __gh_mode?: string }).__gh_mode = "chaos";
    // 4.32 * 1.3 * 1.25 * 1.25 = 8.775 -> borne haute a 7.2
    expect(desiredSpeedFromModifier(fast, 50, 0.75)).toBe(7.2);

    delete (window as unknown as { __gh_mode?: string }).__gh_mode;
    // Sans mode : 4.32 * 0.7 = 3.024 -> borne basse a 3.6
    expect(desiredSpeedFromModifier({ type: "slow", endTime: 0 }, 1, 0.7)).toBe(3.6);
  });
});

describe("pickWeightedPowerUp (caracterisation)", () => {
  const noEntitlement = { auth: false, sub: false };

  it("sans droit, le premier tirage possible est fast", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(pickWeightedPowerUp(null, noEntitlement)).toBe("fast");
  });

  it("ne refait pas un modificateur deja actif", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const fast: ActiveModifier = { type: "fast", endTime: 0 };
    expect(pickWeightedPowerUp(fast, noEntitlement)).toBe("slow");
  });

  it("un tirage au maximum retombe sur le dernier type disponible", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(pickWeightedPowerUp(null, noEntitlement)).toBe("multiball");
  });

  it("sticky n'est disponible qu'avec un droit auth", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(pickWeightedPowerUp(null, { auth: true, sub: false })).toBe("sticky");
  });

  it("les types abonnes n'apparaissent qu'avec le droit sub", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(pickWeightedPowerUp(null, { auth: true, sub: true })).toBe("extraLife");
  });

  it("ne renvoie jamais un type hors de la liste disponible", () => {
    const allowed = new Set(["fast", "slow", "expand", "shrink", "multiball"]);
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(allowed.has(pickWeightedPowerUp(null, noEntitlement))).toBe(true);
  });
});
