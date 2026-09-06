import { afterAll, beforeAll, beforeEach, describe, it, vi } from "vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

// Stub canvas getContext so GameEngine can initialize in jsdom
let origGetContext: typeof HTMLCanvasElement.prototype.getContext;
const mockCtx = {
  fillStyle: "",
  fillRect: vi.fn(),
  strokeStyle: "",
  lineWidth: 0,
  strokeRect: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
} as any;

beforeAll(() => {
  origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx) as any;
  globalThis.requestAnimationFrame = vi.fn().mockReturnValue(1) as any;
  globalThis.cancelAnimationFrame = vi.fn() as any;
});

afterAll(() => {
  HTMLCanvasElement.prototype.getContext = origGetContext;
});

vi.mock("@gamehub/game-platform/lib/sound", () => ({
  soundManager: {
    preloadSound: vi.fn(),
    playSound: vi.fn(),
    playMusic: vi.fn(),
    stopMusic: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
  },
}));

import { ToymakerEscapeGame } from "@games/toymaker-escape";

describe("ToymakerEscape — medals & save", () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  it("gears route shows Confirm gears button for default ratio", async () => {
    render(<ToymakerEscapeGame />);
    // Wait for typewriter effect to finish and choices to appear
    const beginBtn = await screen.findByRole("button", { name: "Begin" }, { timeout: 5000 });
    fireEvent.click(beginBtn);
    expect(screen.getByRole("button", { name: /confirm gears/i })).toBeInTheDocument();
  });

  it("persists save under tme:save:v1", async () => {
    render(<ToymakerEscapeGame />);
    const beginBtn = await screen.findByRole("button", { name: /begin/i }, { timeout: 5000 });
    fireEvent.click(beginBtn);
    const raw = localStorage.getItem("tme:save:v1");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.v).toBe(1);
    expect(parsed.data.flags).toBeDefined();
  });
});