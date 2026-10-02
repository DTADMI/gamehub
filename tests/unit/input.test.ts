// Tests de la capture clavier partagee (B2 / B6) : enableGameKeyCapture empeche le
// navigateur de faire defiler la page sur Space/Arrow pendant une partie. Sans test,
// une regression laisserait la page sauter a chaque coup, ou bloquerait la saisie
// dans un champ (le pire des deux mondes).
import { afterEach, describe, expect, it } from "vitest";

import { enableGameKeyCapture } from "../../packages/game-platform/src/lib/input";

const cleanups: Array<() => void> = [];

function press(key: string, target: EventTarget = window): boolean {
  const e = new KeyboardEvent("keydown", { key, cancelable: true, bubbles: true });
  target.dispatchEvent(e);
  return e.defaultPrevented;
}

afterEach(() => {
  while (cleanups.length) cleanups.pop()?.();
  document.body.innerHTML = "";
});

describe("enableGameKeyCapture", () => {
  it("empeche le defilement sur les fleches et l espace", () => {
    cleanups.push(enableGameKeyCapture());
    expect(press("ArrowLeft")).toBe(true);
    expect(press(" ")).toBe(true);
  });

  it("laisse passer les touches normales", () => {
    cleanups.push(enableGameKeyCapture());
    expect(press("a")).toBe(false);
  });

  it("capture aussi les touches supplementaires demandees", () => {
    cleanups.push(enableGameKeyCapture({ extraKeys: ["q"] }));
    expect(press("q")).toBe(true);
  });

  it("ne capture rien quand isActive renvoie false", () => {
    cleanups.push(enableGameKeyCapture({ isActive: () => false }));
    expect(press("ArrowLeft")).toBe(false);
  });

  it("ne capture pas la saisie dans un champ de texte", () => {
    cleanups.push(enableGameKeyCapture());
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    expect(press("ArrowLeft", input)).toBe(false);
  });

  it("ne capture que lorsque le focus est dans rootEl", () => {
    const root = document.createElement("div");
    const outside = document.createElement("button");
    const inside = document.createElement("button");
    root.appendChild(inside);
    document.body.append(root, outside);

    cleanups.push(enableGameKeyCapture({ rootEl: root }));
    outside.focus();
    expect(press("ArrowLeft")).toBe(false);
    inside.focus();
    expect(press("ArrowLeft")).toBe(true);
  });

  it("retire l ecouteur apres cleanup", () => {
    const cleanup = enableGameKeyCapture();
    cleanup();
    expect(press("ArrowLeft")).toBe(false);
  });
});
