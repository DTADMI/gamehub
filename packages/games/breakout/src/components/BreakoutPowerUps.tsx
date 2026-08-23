/**
 * BreakoutPowerUps — Power-up types, spawn logic, and UI cards.
 * Extracted from BreakoutGame.tsx (M-3 refactor).
 */

import { useGameSettings } from "@gamehub/game-platform";
import React from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export type PowerUpType =
  | "slow"
  | "fast"
  | "sticky"
  | "thru"
  | "bomb"
  | "fireball"
  | "laser"
  | "extraLife"
  | "expand"
  | "shrink"
  | "multiball";

export type FallingPowerUp = {
  x: number;
  y: number;
  dy: number;
  type: PowerUpType;
  size: number;
};

export type ActiveModifier = { type: PowerUpType; endTime: number } | null;

// ── Constants ──────────────────────────────────────────────────────────────

export const POWERUP_DROP_CHANCE = 0.1; // 10% per brick break (desktop baseline)
export const POWERUP_MAX_FALLING = 2;
export const POWERUP_DURATION_MS = 7000; // 7s timed effect (default)
export const POWERUP_DURATION_LONG_MS = 9500; // for premium ones
export const FAST_FACTOR = 1.25;
export const SLOW_FACTOR_DESKTOP = 0.75;
export const SLOW_FACTOR_MOBILE = 0.9;
export const PADDLE_EXPAND_FACTOR = 1.5;
export const PADDLE_SHRINK_FACTOR = 0.7;

const BASE_BALL_SPEED = 4.32;
const MIN_BALL_SPEED = 3.6;
const MAX_BALL_SPEED = 7.2;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// ── Spawn Logic ────────────────────────────────────────────────────────────

/**
 * Weighted-random power-up selection based on user entitlement tier.
 */
export function pickWeightedPowerUp(
  current: ActiveModifier,
  entitled: { auth: boolean; sub: boolean },
): PowerUpType {
  const available: Array<{ t: PowerUpType; w: number }> = [];

  // Public
  if (!(current && current.type === "fast")) {
    available.push({ t: "fast", w: 0.32 });
  }
  if (!(current && current.type === "slow")) {
    available.push({ t: "slow", w: 0.18 });
  }
  available.push({ t: "expand", w: 0.18 });
  available.push({ t: "shrink", w: 0.12 });
  available.push({ t: "multiball", w: 0.12 });

  // Auth-only
  if (entitled.auth && !(current && current.type === "sticky")) {
    available.push({ t: "sticky", w: 0.15 });
  }

  // Subscriber-only (heavier features)
  if (entitled.sub) {
    available.push({ t: "thru", w: 0.1 });
    available.push({ t: "bomb", w: 0.06 });
    available.push({ t: "fireball", w: 0.06 });
    available.push({ t: "laser", w: 0.05 });
    available.push({ t: "extraLife", w: 0.06 });
  }

  const sum = available.reduce((a, b) => a + b.w, 0) || 1;
  let r = Math.random() * sum;
  for (const item of available) {
    if (r < item.w) {
      return item.t;
    }
    r -= item.w;
  }
  return available[0]?.t ?? "fast";
}

/**
 * Compute the desired ball speed based on active modifier, level, and mode.
 */
export function desiredSpeedFromModifier(
  mod: ActiveModifier,
  level: number,
  slowFactor: number,
): number {
  const levelRamp = 1 + Math.min(Math.max(0, level - 1) * 0.05, 0.3);
  const base = BASE_BALL_SPEED * levelRamp;
  const factor = mod?.type === "fast" ? FAST_FACTOR : mod?.type === "slow" ? slowFactor : 1;
  const mode =
    (typeof window !== "undefined" && (window as any).__gh_mode) as
      | "classic"
      | "hard"
      | "chaos"
      | undefined;
  const modeScale = mode === "hard" ? 1.1 : mode === "chaos" ? 1.25 : 1;
  return clamp(base * factor * modeScale, MIN_BALL_SPEED, MAX_BALL_SPEED);
}

// ── UI Cards ───────────────────────────────────────────────────────────────

type PowerUpCardProps = {
  title: string;
  desc: string;
  className: string;
  gated?: "auth" | "sub";
};

export function PowerUpCard({ title, desc, className, gated }: PowerUpCardProps) {
  const { isAuthenticated, isSubscriber } = useGameSettings();
  const locked =
    (gated === "auth" && !isAuthenticated) || (gated === "sub" && !isSubscriber);
  return (
    <div className={`relative rounded-md px-3 py-2 ${className}`}>
      <div className="flex items-center gap-2 font-semibold">
        {title}
        {locked && (
          <span className="rounded bg-gray-900/70 px-1.5 py-0.5 text-[10px] text-white">
            🔒 {gated === "auth" ? "Sign in" : "Subscriber"}
          </span>
        )}
      </div>
      <div className="opacity-80">{desc}</div>
    </div>
  );
}

export function PowerUpCardMobile(props: PowerUpCardProps) {
  return <PowerUpCard {...props} />;
}