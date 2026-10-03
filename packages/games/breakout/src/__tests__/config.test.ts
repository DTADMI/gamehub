import { describe, expect, it } from "vitest";

import {
  BALL_RADIUS,
  BASE_BALL_SPEED,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MAX_BALL_SPEED,
  MAX_BOUNCE_ANGLE,
  MAX_INFLUENCE_ANGLE,
  MIN_BALL_SPEED,
  MIN_BOUNCE_ANGLE,
  MIN_HORIZ_COMPONENT,
  NUDGE_AMOUNT,
  NUDGE_COOLDOWN_MS,
  NUDGE_EPS,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  clamp,
} from "../config";

describe("config Breakout (caracterisation)", () => {
  it("la toile a des dimensions positives", () => {
    expect(CANVAS_WIDTH).toBeGreaterThan(0);
    expect(CANVAS_HEIGHT).toBeGreaterThan(0);
  });

  it("la raquette tient dans la toile", () => {
    expect(PADDLE_WIDTH).toBeGreaterThan(0);
    expect(PADDLE_WIDTH).toBeLessThanOrEqual(CANVAS_WIDTH);
    expect(PADDLE_HEIGHT).toBeGreaterThan(0);
    expect(PADDLE_HEIGHT).toBeLessThan(CANVAS_HEIGHT);
  });

  it("la balle tient dans la toile", () => {
    expect(BALL_RADIUS).toBeGreaterThan(0);
    expect(BALL_RADIUS * 2).toBeLessThan(CANVAS_HEIGHT);
  });

  it("les bornes de vitesse encadrent la vitesse de base", () => {
    expect(MIN_BALL_SPEED).toBeLessThanOrEqual(BASE_BALL_SPEED);
    expect(BASE_BALL_SPEED).toBeLessThanOrEqual(MAX_BALL_SPEED);
  });

  it("les angles de rebond sont ordonnes et sous 90 degres", () => {
    expect(MIN_BOUNCE_ANGLE).toBeGreaterThan(0);
    expect(MIN_BOUNCE_ANGLE).toBeLessThan(MAX_BOUNCE_ANGLE);
    expect(MAX_BOUNCE_ANGLE).toBeLessThan(Math.PI / 2);
    expect(MAX_INFLUENCE_ANGLE).toBeGreaterThan(0);
    expect(MAX_INFLUENCE_ANGLE).toBeLessThan(Math.PI / 2);
  });

  it("les reglages anti-blocage sont coherents", () => {
    expect(MIN_HORIZ_COMPONENT).toBeGreaterThan(0);
    expect(NUDGE_EPS).toBeGreaterThan(0);
    expect(NUDGE_AMOUNT).toBeGreaterThan(NUDGE_EPS);
    expect(NUDGE_COOLDOWN_MS).toBeGreaterThan(0);
  });

  it("clamp borne dans l'intervalle", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});
