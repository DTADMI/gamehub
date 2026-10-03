import { describe, expect, it } from "vitest";

import { TOYMAKER_SCENES } from "../data/scenes";

/**
 * Test de caracterisation (gamehub B2, precondition du refactor B1) : fige la
 * forme du graphe narratif de Toymaker Escape. Il ne juge pas le contenu, il
 * verifie que le decoupage du monolithe ne pourra pas casser silencieusement
 * une transition, une traduction ou un identifiant.
 */
type Localized = { en: string; fr: string };
type Choice = { id: string; text: Localized; target: string; puzzle?: boolean; puzzleId?: string };
type Scene = { id: string; title: Localized; body: Localized; choices?: Choice[] };

const scenes = TOYMAKER_SCENES as Record<string, Scene>;
const sceneIds = Object.keys(scenes);

describe("TOYMAKER_SCENES (caracterisation)", () => {
  it("contient au moins une scene", () => {
    expect(sceneIds.length).toBeGreaterThan(0);
  });

  it("la cle de chaque scene correspond a son id interne", () => {
    for (const key of sceneIds) {
      expect(scenes[key]?.id, `scene ${key}`).toBe(key);
    }
  });

  it("chaque scene a un titre et un corps traduits en EN et FR", () => {
    for (const key of sceneIds) {
      const scene = scenes[key]!;
      for (const field of ["title", "body"] as const) {
        const value = scene[field];
        expect(typeof value?.en, `${key}.${field}.en`).toBe("string");
        expect(value.en.trim().length, `${key}.${field}.en vide`).toBeGreaterThan(0);
        expect(typeof value?.fr, `${key}.${field}.fr`).toBe("string");
        expect(value.fr.trim().length, `${key}.${field}.fr vide`).toBeGreaterThan(0);
      }
    }
  });

  it("chaque choix pointe vers une scene existante", () => {
    for (const key of sceneIds) {
      for (const choice of scenes[key]!.choices ?? []) {
        expect(sceneIds, `${key} -> ${choice.target}`).toContain(choice.target);
      }
    }
  });

  it("les identifiants de choix sont uniques dans une scene", () => {
    for (const key of sceneIds) {
      const ids = (scenes[key]!.choices ?? []).map((choice) => choice.id);
      expect(new Set(ids).size, `scene ${key}`).toBe(ids.length);
    }
  });

  it("les choix sont traduits en EN et FR", () => {
    for (const key of sceneIds) {
      for (const choice of scenes[key]!.choices ?? []) {
        expect(choice.text?.en?.trim().length, `${key}/${choice.id}.en`).toBeGreaterThan(0);
        expect(choice.text?.fr?.trim().length, `${key}/${choice.id}.fr`).toBeGreaterThan(0);
      }
    }
  });

  it("un choix marque puzzle porte un puzzleId", () => {
    for (const key of sceneIds) {
      for (const choice of scenes[key]!.choices ?? []) {
        if (choice.puzzle) {
          expect(typeof choice.puzzleId, `${key}/${choice.id}`).toBe("string");
        }
      }
    }
  });
});
