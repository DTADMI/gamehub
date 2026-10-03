import { describe, expect, it, vi } from "vitest";

import { EventSystem } from "../EventSystem";

describe("EventSystem", () => {
  it("appelle les abonnes sur emit", () => {
    const bus = new EventSystem();
    const handler = vi.fn();
    bus.on("score", handler);
    bus.emit("score", 42);
    expect(handler).toHaveBeenCalledWith(42);
  });

  it("ne fait rien quand aucun abonne n'ecoute", () => {
    const bus = new EventSystem();
    expect(() => bus.emit("inconnu", 1)).not.toThrow();
  });

  it("la fonction renvoyee par on() desabonne", () => {
    const bus = new EventSystem();
    const handler = vi.fn();
    const off = bus.on("score", handler);
    off();
    bus.emit("score");
    expect(handler).not.toHaveBeenCalled();
  });

  it("off() desabonne", () => {
    const bus = new EventSystem();
    const handler = vi.fn();
    bus.on("score", handler);
    bus.off("score", handler);
    bus.emit("score");
    expect(handler).not.toHaveBeenCalled();
  });

  it("once() ne se declenche qu'une fois", () => {
    const bus = new EventSystem();
    const handler = vi.fn();
    bus.once("start", handler);
    bus.emit("start");
    bus.emit("start");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("un abonne qui jette n'empeche pas les autres", () => {
    const bus = new EventSystem();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const second = vi.fn();
    bus.on("tick", () => {
      throw new Error("boom");
    });
    bus.on("tick", second);

    expect(() => bus.emit("tick")).not.toThrow();
    expect(second).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("clear() retire tous les abonnes", () => {
    const bus = new EventSystem();
    const handler = vi.fn();
    bus.on("a", handler);
    bus.on("b", handler);
    bus.clear();
    bus.emit("a");
    bus.emit("b");
    expect(handler).not.toHaveBeenCalled();
  });

  it("ne s'abonne qu'une fois pour un meme handler", () => {
    const bus = new EventSystem();
    const handler = vi.fn();
    bus.on("score", handler);
    bus.on("score", handler);
    bus.emit("score");
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
