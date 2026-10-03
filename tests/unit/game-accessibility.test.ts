// Garde-fou accessibilite (B6) : les controles de jeu doivent etre utilisables au
// clavier et lisibles par un lecteur d'ecran. Un composant qui introduit un bouton
// sans nom accessible, ou un gestionnaire de clic sur un element non interactif sans
// role ni gestion clavier, fait echouer ce test. Test statique (analyse du JSX), donc
// il s'execute sans navigateur.
//
// Le parseur suit la profondeur des accolades : un `>` a l'interieur d'un
// attribut `onClick={() => ...}` ne termine pas la balise (piege rencontre en
// premier essai, qui produisait des faux positifs).
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..");
const GAMES_DIR = join(ROOT, "packages", "games");

function components(dir: string, out: string[] = []): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "__tests__") continue;
      components(p, out);
    } else if (e.isFile() && /\.tsx$/.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

/** Balises ouvrantes d'un element, en ignorant un `>` situe dans `{...}` ou entre guillemets. */
function scanTags(src: string, tagName: string): { attrs: string; inner: string; index: number }[] {
  const out: { attrs: string; inner: string; index: number }[] = [];
  const open = new RegExp(`<${tagName}\\b`, "g");
  let m;
  while ((m = open.exec(src)) !== null) {
    const start = m.index;
    let i = start + m[0].length;
    let depth = 0;
    let quote: string | null = null;
    for (; i < src.length; i++) {
      const c = src[i];
      if (quote) {
        if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        quote = c;
        continue;
      }
      if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
    }
    const attrs = src.slice(start + m[0].length, i);
    const close = src.indexOf(`</${tagName}>`, i);
    const inner = close === -1 ? "" : src.slice(i + 1, close);
    out.push({ attrs, inner, index: start });
    if (close === -1) break;
    open.lastIndex = close;
  }
  return out;
}

/** Retire les expressions JSX {...} en suivant la profondeur des accolades. */
function stripExpressions(s: string): string {
  let out = "";
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === "{") {
      let depth = 1;
      i++;
      while (i < s.length && depth > 0) {
        if (s[i] === "{") depth++;
        else if (s[i] === "}") depth--;
        i++;
      }
      out += " ";
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/** Texte visible d'un contenu JSX : on retire les expressions {...} et les balises. */
function visibleText(inner: string): string {
  return stripExpressions(inner)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const files = components(GAMES_DIR).filter((f) => f.includes("/src/components/"));

describe("accessibilite des jeux (B6)", () => {
  it("trouve des composants de jeu a analyser", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it("tout bouton sans texte visible porte un nom accessible", () => {
    const violations: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      for (const { attrs, inner } of scanTags(src, "button")) {
        const text = visibleText(inner);
        const hasAccessibleName = /aria-label=|aria-labelledby=/.test(attrs);
        // Un enfant expression JSX ({t(...)}, {price}, {icon}) peut rendre du texte :
        // on ne le declare pas fautif sur la base du texte litteral seul.
        const hasExpression = /\{/.test(inner);
        // Icône seule : aucun texte visible (y compris le cas « texte vide », qui est
        // le plus courant : <button><Pause /></button>) et aucune expression JSX.
        const isIconOnly = !hasExpression && !/[A-Za-z0-9]/.test(text);
        if (isIconOnly && !hasAccessibleName) {
          violations.push(`${relative(ROOT, file)}: bouton icone (${JSON.stringify(text)}) sans aria-label`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("le detecteur attrape bien un bouton icone sans nom (auto-verification)", () => {
    // NF-REPEAT-001 : prouver que le garde-fou echoue sur le cas qu'il surveille,
    // sinon un detecteur casse passerait pour vert.
    const isFlaggedWithoutName = (attrs: string, inner: string) =>
      !/\{/.test(inner) && !/[A-Za-z0-9]/.test(visibleText(inner)) && !/aria-label=/.test(attrs);

    const unnamed = scanTags(`<button><Pause className="h-4 w-4" /></button>`, "button").filter(
      ({ attrs, inner }) => isFlaggedWithoutName(attrs, inner),
    );
    expect(unnamed.length).toBe(1);

    const named = scanTags(`<button aria-label="Pause"><Pause /></button>`, "button").filter(
      ({ attrs, inner }) => isFlaggedWithoutName(attrs, inner),
    );
    expect(named.length).toBe(0);

    const labelled = scanTags(`<button><span>Pause</span></button>`, "button").filter(
      ({ attrs, inner }) => isFlaggedWithoutName(attrs, inner),
    );
    expect(labelled.length).toBe(0);
  });

  it("tout gestionnaire de clic sur un element non interactif est joignable au clavier", () => {
    const violations: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      for (const tag of ["div", "span"]) {
        for (const { attrs } of scanTags(src, tag)) {
          if (!/onClick=/.test(attrs)) continue;
          // Un fond de fermeture (clic exterieur) porte aria-hidden : il est
          // decoratif pour les lecteurs d'ecran, et le bouton de fermeture fournit
          // l'acces clavier. On ne l'exige donc pas joignable au clavier.
          if (/aria-hidden="true"/.test(attrs)) continue;
          const hasRole = /role=/.test(attrs);
          const hasTabIndex = /tabIndex=/.test(attrs);
          const hasKeyHandler = /onKeyDown=|onKeyUp=|onKeyPress=/.test(attrs);
          if (!(hasRole && hasTabIndex && hasKeyHandler)) {
            violations.push(`${relative(ROOT, file)}: <${tag} onClick> sans role/tabIndex/onKeyDown`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
