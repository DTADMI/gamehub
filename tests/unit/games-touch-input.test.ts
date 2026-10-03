// Garde-fou tactile (B7) : chaque jeu doit offrir une VOIE TACTILE.
//
// Motif : le web est responsive, mais un jeu qui n'ecoute que le clavier est
// injouable sur telephone. Ce test statique (analyse du JSX) verifie que chaque
// paquet de jeu contient au moins un chemin d'entree utilisable au doigt :
//   - `createTouchControls` (balayage/tap sur toile), ou
//   - `onPointerDown` / `onTouchStart` (commandes dediees), ou
//   - `onClick` (interface tapable).
//
// Il ne juge pas la qualite de l'experience : il empeche la regression silencieuse
// ou un nouveau jeu arriverait sans aucune entree tactile.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..");
const GAMES_DIR = join(ROOT, "packages", "games");
const EXCLUDE = new Set(["_engine", "i18n", "shared"]);

const TOUCH_PATTERN = /createTouchControls|onPointerDown|onTouchStart|onClick/;

function gameDirs(): string[] {
  return readdirSync(GAMES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !EXCLUDE.has(entry.name))
    .map((entry) => entry.name);
}

function tsxFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "__tests__") continue;
      tsxFiles(full, out);
    } else if (/\.tsx$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe("entree tactile des jeux (B7)", () => {
  const games = gameDirs();

  it("trouve des paquets de jeux a analyser", () => {
    expect(games.length).toBeGreaterThan(10);
  });

  it("chaque jeu offre au moins une voie tactile", () => {
    const missing: string[] = [];
    for (const game of games) {
      const files = tsxFiles(join(GAMES_DIR, game, "src"));
      const hasTouch = files.some((file) => TOUCH_PATTERN.test(readFileSync(file, "utf8")));
      if (!hasTouch) missing.push(game);
    }
    // Le message nomme les jeux fautifs pour rendre la correction immediate.
    expect(missing, `jeux sans entree tactile : ${missing.join(", ")}`).toEqual([]);
  });

  it("le detecteur attrape bien un jeu sans entree tactile (auto-verification)", () => {
    // NF-REPEAT-001 : prouver que le garde-fou echoue sur le cas surveille.
    expect(TOUCH_PATTERN.test(`window.addEventListener("keydown", onKey);`)).toBe(false);
    expect(TOUCH_PATTERN.test(`<button onClick={start}>Start</button>`)).toBe(true);
    expect(TOUCH_PATTERN.test(`controls.onTap(handle)`)).toBe(false);
    expect(TOUCH_PATTERN.test(`const c = createTouchControls(canvas);`)).toBe(true);
    expect(TOUCH_PATTERN.test(`<div onPointerDown={press} />`)).toBe(true);
  });

  it("le message d'echec cite les jeux fautifs", () => {
    const missing = ["un-jeu-fictif"];
    expect(() =>
      expect(missing, `jeux sans entree tactile : ${missing.join(", ")}`).toEqual([]),
    ).toThrowError(/sans entree tactile : un-jeu-fictif/);
  });
});
