import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Garde-fou accessibilite (B6) : chaque jeu avec sa propre feuille de style doit
// honorer prefers-reduced-motion. Un jeu qui perd ce bloc fait echouer ce test.
const GAME_CSS = [
  "packages/games/snake/src/app/globals.css",
  "packages/games/memory/src/app/globals.css",
  "packages/games/tetris/src/app/globals.css",
  "packages/games/breakout/src/app/globals.css",
];

describe("accessibilite - reduced motion", () => {
  for (const relativePath of GAME_CSS) {
    it(`${relativePath} honore prefers-reduced-motion`, () => {
      const absolute = path.join(__dirname, "..", "..", relativePath);
      expect(fs.existsSync(absolute)).toBe(true);
      const css = fs.readFileSync(absolute, "utf8");
      expect(css).toContain("prefers-reduced-motion: reduce");
    });
  }
});
