// Garde-fou i18n (B5) : chaque jeu traduit doit avoir la MEME cle en EN et en FR.
// Un jeu ou une cle existe d'un seul cote affiche un libelle non traduit dans
// l'autre langue. Ce test parcourt tous les fichiers de traduction de jeu, donc il
// couvre aussi les jeux ajoutes plus tard sans qu'on y pense.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..");
const GAMES_TX = join(ROOT, "lib", "i18n", "translations", "games");

function flatten(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out.push(...flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

const dirs = readdirSync(GAMES_TX, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

describe("parite EN/FR des traductions de jeu (B5)", () => {
  it("trouve des jeux traduits", () => {
    expect(dirs.length).toBeGreaterThan(5);
  });

  for (const dir of dirs) {
    it(`${dir} : memes cles en EN et FR`, () => {
      const en = JSON.parse(readFileSync(join(GAMES_TX, dir, "en.json"), "utf8"));
      const fr = JSON.parse(readFileSync(join(GAMES_TX, dir, "fr.json"), "utf8"));
      const enKeys = flatten(en).sort();
      const frKeys = flatten(fr).sort();
      expect(frKeys, `cles FR manquantes dans ${relative(ROOT, GAMES_TX)}/${dir}`).toEqual(enKeys);
    });
  }
});
