// Tests du helper tactile partage (B7) : createTouchControls traduit les gestes
// tactiles en swipe/tap/pan/pinch. Il n'avait aucun test alors que les jeux s'y
// appuient pour le mobile : un seuil ou un signe inverse rend un jeu injouable.
import { describe, expect, it, vi } from "vitest";

import { createTouchControls } from "../../packages/game-platform/src/lib/touch";

type TouchLike = { clientX: number; clientY: number; identifier: number };

function makeCanvas(width = 200, height = 200): HTMLElement {
  const el = document.createElement("div");
  el.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width, height, right: width, bottom: height, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
  return el;
}

function fire(el: HTMLElement, type: string, touches: TouchLike[]): void {
  const e = Object.assign(new Event(type, { bubbles: true }), {
    touches,
    changedTouches: touches,
    preventDefault: () => {},
  });
  el.dispatchEvent(e);
}

function t(x: number, y: number, id = 0): TouchLike {
  return { clientX: x, clientY: y, identifier: id };
}

describe("createTouchControls", () => {
  it("detecte un swipe vers la droite", () => {
    const el = makeCanvas();
    const controls = createTouchControls(el, { swipeThreshold: 20 });
    const onSwipe = vi.fn();
    controls.onSwipe(onSwipe);
    fire(el, "touchstart", [t(10, 10)]);
    fire(el, "touchmove", [t(80, 10)]);
    fire(el, "touchend", []);
    expect(onSwipe).toHaveBeenCalledWith("right", expect.any(Number));
    controls.destroy();
  });

  it("detecte un swipe vers le bas", () => {
    const el = makeCanvas();
    const controls = createTouchControls(el, { swipeThreshold: 20 });
    const onSwipe = vi.fn();
    controls.onSwipe(onSwipe);
    fire(el, "touchstart", [t(10, 10)]);
    fire(el, "touchmove", [t(10, 90)]);
    fire(el, "touchend", []);
    expect(onSwipe).toHaveBeenCalledWith("down", expect.any(Number));
    controls.destroy();
  });

  it("un simple tap rapporte des coordonnees relatives au canvas", () => {
    const el = makeCanvas(200, 200);
    const controls = createTouchControls(el, { tapTimeout: 1000 });
    const onTap = vi.fn();
    controls.onTap(onTap);
    fire(el, "touchstart", [t(50, 60)]);
    fire(el, "touchend", []);
    expect(onTap).toHaveBeenCalledWith(50, 60);
    controls.destroy();
  });

  it("signale le pan pendant le deplacement", () => {
    const el = makeCanvas();
    const controls = createTouchControls(el);
    const onPan = vi.fn();
    controls.onPan(onPan);
    fire(el, "touchstart", [t(10, 10)]);
    fire(el, "touchmove", [t(25, 10)]);
    expect(onPan).toHaveBeenCalled();
    expect(onPan.mock.calls[0][0]).toBeGreaterThan(0);
    controls.destroy();
  });

  it("destroy retire les ecouteurs", () => {
    const el = makeCanvas();
    const controls = createTouchControls(el);
    const onSwipe = vi.fn();
    controls.onSwipe(onSwipe);
    controls.destroy();
    fire(el, "touchstart", [t(10, 10)]);
    fire(el, "touchmove", [t(90, 10)]);
    fire(el, "touchend", []);
    expect(onSwipe).not.toHaveBeenCalled();
  });
});
