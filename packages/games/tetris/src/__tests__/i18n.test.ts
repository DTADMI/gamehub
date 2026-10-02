import { describe, expect, it } from "vitest";

import { TETRIS_TX } from "../i18n";

describe("TETRIS_TX", () => {
  it("EN et FR exposent les memes cles", () => {
    const en = Object.keys(TETRIS_TX.en).sort();
    const fr = Object.keys(TETRIS_TX.fr).sort();
    expect(fr).toEqual(en);
  });

  it("aucune valeur vide", () => {
    const values = [...Object.values(TETRIS_TX.en), ...Object.values(TETRIS_TX.fr)];
    for (const value of values) {
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });
});
