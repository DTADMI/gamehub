import { describe, expect, it } from "vitest";

import { BASE_BALL_SPEED, MAX_BOUNCE_ANGLE, MIN_HORIZ_COMPONENT } from "../config";
import { computeAntiStallNudge, computePaddleBounce, type PaddleBounceInput } from "../physics";

const base: PaddleBounceInput = {
  ballX: 320,
  paddleX: 282,
  paddleWidth: 75,
  paddleVelocity: 0,
  paddleInfluence: 0.04,
  currentDx: 0,
  currentDy: -5,
};

describe("computePaddleBounce (caracterisation)", () => {
  it("un rebond pres du centre repart vers le HAUT (regression : signe de dy)", () => {
    // Balle au centre de la raquette : l'angle est force a MIN_BOUNCE_ANGLE et la
    // composante horizontale a MIN_HORIZ_COMPONENT. La balle doit remonter (dy < 0),
    // jamais plonger dans la raquette.
    const { dx, dy } = computePaddleBounce({ ...base, ballX: 320 });
    expect(dy).toBeLessThan(0);
    expect(Math.abs(dx)).toBeGreaterThanOrEqual(MIN_HORIZ_COMPONENT - 1e-9);
  });

  it("un rebond a droite part vers la droite, a gauche vers la gauche", () => {
    const right = computePaddleBounce({ ...base, ballX: base.paddleX + base.paddleWidth - 1 });
    const left = computePaddleBounce({ ...base, ballX: base.paddleX + 1 });
    expect(right.dx).toBeGreaterThan(0);
    expect(left.dx).toBeLessThan(0);
  });

  it("conserve la norme de la vitesse (approximativement)", () => {
    const speed = Math.sqrt(base.currentDx ** 2 + base.currentDy ** 2);
    const { dx, dy } = computePaddleBounce({ ...base, ballX: 300 });
    expect(Math.sqrt(dx * dx + dy * dy)).toBeCloseTo(speed, 4);
  });

  it("utilise la vitesse de base quand la balle est immobile", () => {
    const { dx, dy } = computePaddleBounce({ ...base, ballX: 340, currentDx: 0, currentDy: 0 });
    expect(Math.sqrt(dx * dx + dy * dy)).toBeCloseTo(BASE_BALL_SPEED, 4);
  });

  it("l'influence de la raquette decale l'angle mais reste bornee", () => {
    const neutral = computePaddleBounce({ ...base, ballX: 340, paddleVelocity: 0 });
    const moving = computePaddleBounce({ ...base, ballX: 340, paddleVelocity: 100 });
    expect(moving.angle).not.toBe(neutral.angle);
    expect(Math.abs(moving.angle)).toBeLessThanOrEqual(MAX_BOUNCE_ANGLE + 1e-9);
  });

  it("l'angle final ne depasse jamais MAX_BOUNCE_ANGLE", () => {
    const extreme = computePaddleBounce({
      ...base,
      ballX: base.paddleX + base.paddleWidth * 2,
      paddleVelocity: 1000,
    });
    expect(Math.abs(extreme.angle)).toBeLessThanOrEqual(MAX_BOUNCE_ANGLE + 1e-9);
  });
});

describe("computeAntiStallNudge (caracterisation)", () => {
  const base = { ballX: 100, canvasWidth: 640, now: 10_000, lastNudgeAt: 0 };

  it("ne pousse pas quand la composante horizontale est suffisante", () => {
    const result = computeAntiStallNudge({ ...base, dx: 3 });
    expect(result.nudged).toBe(false);
    expect(result.dx).toBe(3);
  });

  it("ne pousse pas deux fois dans la fenetre de cooldown", () => {
    const result = computeAntiStallNudge({ ...base, dx: 0.1, lastNudgeAt: 9_900 });
    expect(result.nudged).toBe(false);
  });

  it("pousse vers la droite quand la balle est a gauche du centre", () => {
    const result = computeAntiStallNudge({ ...base, dx: 0.1 });
    expect(result.nudged).toBe(true);
    expect(result.dx).toBeGreaterThan(0);
    expect(result.lastNudgeAt).toBe(base.now);
  });

  it("pousse vers la gauche quand la balle est a droite du centre", () => {
    const result = computeAntiStallNudge({ ...base, ballX: 600, dx: -0.1 });
    expect(result.nudged).toBe(true);
    expect(result.dx).toBeLessThan(0);
  });
});
