// Garde-fou i18n (B5) : chaque carte TX de jeu doit exposer la MEME cle en EN et en
// FR. Plusieurs jeux declarent une carte `*_TX` utilisee via createI18n ; une cle
// presente d'un seul cote affiche un libelle non traduit dans l'autre langue. Ce
// test decouvre les cartes automatiquement, donc il couvre aussi les jeux ajoutes
// plus tard.
import { describe, expect, it } from "vitest";

type Tx = { en: Record<string, string>; fr: Record<string, string> };

const modules = import.meta.glob("../../packages/games/*/src/i18n.ts");
const entries = Object.entries(modules);

describe("parite EN/FR des cartes TX de jeu (B5)", () => {
  it("trouve des cartes de traduction", () => {
    expect(entries.length).toBeGreaterThan(8);
  });

  for (const [path, load] of entries) {
    it(`${path} : memes cles en EN et FR`, async () => {
      const mod = (await load()) as Record<string, unknown>;
      const tx = Object.values(mod).find(
        (value): value is Tx =>
          typeof value === "object" &&
          value !== null &&
          "en" in value &&
          "fr" in value &&
          typeof (value as Tx).en === "object" &&
          typeof (value as Tx).fr === "object",
      );
      expect(tx, `carte TX introuvable dans ${path}`).toBeTruthy();
      expect(Object.keys(tx!.fr).sort()).toEqual(Object.keys(tx!.en).sort());
    });
  }
});
