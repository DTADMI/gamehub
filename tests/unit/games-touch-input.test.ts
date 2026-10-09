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

// --- Garde-fou de visibilite (incident 2026-10-08) ---
//
// `hidden` s'applique SOUS le point de rupture : `hidden md:flex` masque donc
// l'element sur mobile et l'affiche a partir de md. Combine a un gestionnaire
// tactile, c'est un conteneur injouable au doigt.
const RESPONSIVE_HIDDEN =
  /\bhidden\s+(?:sm|md|lg|xl|2xl):(?:flex|block|grid|inline-flex|inline-block)\b/g;
const TOUCH_HANDLER = /\bon(?:PointerDown|TouchStart)\b/;
// Fenetre d'analyse apres la classe : borne la recherche au sous-arbre proche,
// pour ne pas accuser un conteneur masque a cause d'un gestionnaire tactile
// situe ailleurs dans le fichier.
const CONTAINER_WINDOW = 2000;

/** Retire commentaires de bloc et de ligne : un commentaire qui cite le motif
 * fautif ne doit pas declencher le garde-fou. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

/** Compte les conteneurs qui portent une classe de masquage responsive ET, dans
 * leur sous-arbre proche, un gestionnaire tactile. */
function maskedTouchContainers(source: string): number {
  let count = 0;
  for (const match of source.matchAll(RESPONSIVE_HIDDEN)) {
    const start = match.index ?? 0;
    if (TOUCH_HANDLER.test(source.slice(start, start + CONTAINER_WINDOW))) count += 1;
  }
  return count;
}

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

  // --- Garde-fou de VISIBILITE (ajoute apres l'incident du 2026-10-08) ---
  //
  // Le test precedent verifie qu'un jeu CONTIENT une voie tactile. Il ne pouvait
  // pas voir le defaut trouve dans `platformer` : les trois boutons tactiles
  // existaient (donc le test passait), mais leur conteneur portait
  // `hidden md:flex`, ou `hidden` s'applique SOUS le point de rupture. Les
  // commandes etaient donc masquees sur telephone et affichees sur desktop :
  // l'inverse de ce qu'il faut, et un jeu de deplacement injouable au doigt.
  //
  // Presence n'est pas visibilite. Ce garde-fou controle la seconde.
  it("aucun conteneur tactile n'est masque sous un point de rupture", () => {
    const fautifs: string[] = [];
    for (const game of games) {
      for (const file of tsxFiles(join(GAMES_DIR, game, "src"))) {
        const source = stripComments(readFileSync(file, "utf8"));
        const hits = maskedTouchContainers(source);
        if (hits > 0) fautifs.push(`${game} (${relative(ROOT, file)}): ${hits} conteneur(s)`);
      }
    }
    expect(
      fautifs,
      "controles tactiles masques sous un point de rupture (utiliser TouchControlsOverlay) : " +
        fautifs.join("; "),
    ).toEqual([]);
  });

  it("le detecteur de masquage attrape le defaut d'origine (auto-verification)", () => {
    // NF-REPEAT-001 : prouver que le garde-fou echoue sur le cas surveille.
    // Fixture : la forme EXACTE du defaut de `platformer` (classe sur le parent,
    // gestionnaire sur l'enfant).
    const defaut = `<div className="mt-3 hidden md:flex gap-2">
  <button onPointerDown={() => setLeft(true)}>◀</button>
</div>`;
    expect(maskedTouchContainers(defaut)).toBe(1);
    // Variante : les deux sur la meme balise.
    expect(maskedTouchContainers(`<button className="hidden lg:flex" onTouchStart={go} />`)).toBe(1);
    // Correct : aucun masquage.
    expect(maskedTouchContainers(`<button className="flex" onPointerDown={go} />`)).toBe(0);
    // Correct : masque sur desktop, pas sous un point de rupture.
    expect(maskedTouchContainers(`<div className="md:flex" onPointerDown={go} />`)).toBe(0);
    // Un commentaire qui cite la classe fautive ne doit PAS declencher le garde.
    const commente = `/* ne pas ecrire hidden md:flex avec onPointerDown */\n<div className="flex" />`;
    expect(maskedTouchContainers(stripComments(commente))).toBe(0);
  });
});
