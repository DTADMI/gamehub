import { afterEach, describe, expect, it, vi } from "vitest";

import { Helpers } from "../Helpers";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Helpers (arithmetique)", () => {
  it("clamp borne dans l'intervalle", () => {
    expect(Helpers.clamp(5, 0, 10)).toBe(5);
    expect(Helpers.clamp(-1, 0, 10)).toBe(0);
    expect(Helpers.clamp(11, 0, 10)).toBe(10);
  });

  it("lerp interpole lineairement", () => {
    expect(Helpers.lerp(0, 100, 0)).toBe(0);
    expect(Helpers.lerp(0, 100, 1)).toBe(100);
    expect(Helpers.lerp(0, 100, 0.25)).toBe(25);
  });

  it("distance calcule la distance euclidienne", () => {
    expect(Helpers.distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(Helpers.distance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
  });

  it("formatTime produit m:ss", () => {
    expect(Helpers.formatTime(0)).toBe("0:00");
    expect(Helpers.formatTime(61)).toBe("1:01");
    expect(Helpers.formatTime(600)).toBe("10:00");
  });

  it("formatNumber separe les milliers", () => {
    expect(Helpers.formatNumber(1000)).toBe("1,000");
    expect(Helpers.formatNumber(1234567)).toBe("1,234,567");
    expect(Helpers.formatNumber(42)).toBe("42");
  });
});

describe("Helpers (geometrie)", () => {
  const rect = { x: 0, y: 0, width: 10, height: 10 };

  it("pointInRect inclut les bords", () => {
    expect(Helpers.pointInRect({ x: 5, y: 5 }, rect)).toBe(true);
    expect(Helpers.pointInRect({ x: 0, y: 0 }, rect)).toBe(true);
    expect(Helpers.pointInRect({ x: 10, y: 10 }, rect)).toBe(true);
    expect(Helpers.pointInRect({ x: 11, y: 5 }, rect)).toBe(false);
    expect(Helpers.pointInRect({ x: -1, y: 5 }, rect)).toBe(false);
  });

  it("rectsOverlap : chevauchement, contact et disjonction", () => {
    expect(Helpers.rectsOverlap(rect, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
    // Bords qui se touchent exactement : pas de chevauchement de surface.
    expect(Helpers.rectsOverlap(rect, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
    expect(Helpers.rectsOverlap(rect, { x: 20, y: 20, width: 5, height: 5 })).toBe(false);
  });
});

describe("Helpers (aleatoire)", () => {
  it("randomInt reste dans les bornes incluses", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(Helpers.randomInt(1, 6)).toBe(1);
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(Helpers.randomInt(1, 6)).toBe(6);
  });

  it("randomFloat reste dans l'intervalle", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(Helpers.randomFloat(2, 5)).toBe(2);
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(Helpers.randomFloat(2, 5)).toBe(3.5);
  });

  it("randomChoice renvoie un element de la liste", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(Helpers.randomChoice(["a", "b", "c"])).toBe("a");
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(Helpers.randomChoice(["a", "b", "c"])).toBe("c");
  });

  it("shuffle renvoie une permutation sans muter la source", () => {
    const source = [1, 2, 3, 4, 5];
    const copy = [...source];
    const shuffled = Helpers.shuffle(source);
    expect(source).toEqual(copy);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(copy);
  });
});

describe("Helpers (divers)", () => {
  it("deepClone copie en profondeur", () => {
    const original = { a: 1, nested: { b: [1, 2, 3] } };
    const clone = Helpers.deepClone(original);
    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
    expect(clone.nested).not.toBe(original.nested);
    clone.nested.b.push(4);
    expect(original.nested.b).toEqual([1, 2, 3]);
  });
});
