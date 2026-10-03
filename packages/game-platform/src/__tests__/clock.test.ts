import { describe, expect, it, vi } from "vitest";

import { createClock, createManualClock } from "../lib/clock";

describe("createClock", () => {
  it("suit la source fournie", () => {
    const clock = createClock(() => 1234);
    expect(clock.now()).toBe(1234);
  });

  it("utilise Date.now par defaut", () => {
    vi.spyOn(Date, "now").mockReturnValue(9999);
    expect(createClock().now()).toBe(9999);
    vi.restoreAllMocks();
  });
});

describe("createManualClock", () => {
  it("ne bouge pas sans advance", () => {
    const clock = createManualClock(100);
    expect(clock.now()).toBe(100);
    expect(clock.now()).toBe(100);
  });

  it("avance uniquement sur advance", () => {
    const clock = createManualClock(0);
    clock.advance(250);
    clock.advance(50);
    expect(clock.now()).toBe(300);
  });

  it("set fixe une valeur absolue", () => {
    const clock = createManualClock(1000);
    clock.set(42);
    expect(clock.now()).toBe(42);
  });

  it("deux horloges manuelles sont independantes", () => {
    const a = createManualClock(0);
    const b = createManualClock(0);
    a.advance(100);
    expect(a.now()).toBe(100);
    expect(b.now()).toBe(0);
  });
});
