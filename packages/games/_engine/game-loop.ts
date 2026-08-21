// Game Engine — Reusable game loop hook
// Extracted from BreakoutGame.tsx / SystemsDiscovery / ToymakerEscape patterns.
// All current and future gamehub games should use this instead of inline game loops.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface GameLoopOptions {
  /** FPS target (default: 60). 0 = uncapped. */
  fps?: number;
  /** Pause when tab is hidden (default: true) */
  pauseOnHidden?: boolean;
  /** Auto-start on mount (default: true) */
  autoStart?: boolean;
}

export interface GameLoopState {
  /** Frames elapsed since start */
  frame: number;
  /** Time since start in ms */
  elapsed: number;
  /** Delta time since last frame in ms */
  delta: number;
  /** Current FPS (smoothed) */
  fps: number;
  /** Whether the loop is paused */
  paused: boolean;
}

/**
 * Reusable game loop hook.
 * 
 * Pattern: all gamehub games (Breakout, SystemsDiscovery, ToymakerEscape)
 * had their own requestAnimationFrame loops inlined. This extracts the
 * common pattern into a single hook.
 * 
 * Usage:
 *   const { state, start, stop, toggle } = useGameLoop((delta) => {
 *     updatePhysics(delta);
 *     render();
 *   });
 */
export function useGameLoop(
  tick: (state: GameLoopState) => void,
  options: GameLoopOptions = {},
) {
  const { fps = 60, pauseOnHidden = true, autoStart = true } = options;
  const frameInterval = fps > 0 ? 1000 / fps : 0;

  const [paused, setPaused] = useState(false);
  const tickRef = useRef(tick);
  tickRef.current = tick;

  const frameRef = useRef(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef(0);
  const fpsAccumRef = useRef(0);
  const fpsCountRef = useRef(0);
  const fpsLastRef = useRef(0);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);

  const loop = useCallback((timestamp: number) => {
    if (!runningRef.current) return;

    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const rawDelta = timestamp - lastTimeRef.current;

    // Frame capping
    if (frameInterval > 0 && rawDelta < frameInterval) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    const delta = Math.min(rawDelta, 100); // cap at 100ms to avoid spiral
    lastTimeRef.current = timestamp;
    frameRef.current++;
    elapsedRef.current += delta;

    // FPS calculation (every 500ms)
    fpsAccumRef.current += delta;
    fpsCountRef.current++;
    if (fpsAccumRef.current >= 500) {
      fpsLastRef.current = Math.round((fpsCountRef.current / fpsAccumRef.current) * 1000);
      fpsAccumRef.current = 0;
      fpsCountRef.current = 0;
    }

    if (!paused) {
      tickRef.current({
        frame: frameRef.current,
        elapsed: elapsedRef.current,
        delta,
        fps: fpsLastRef.current,
        paused: false,
      });
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [frameInterval, paused]);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
  }, []);

  const toggle = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  // Handle tab visibility
  useEffect(() => {
    if (!pauseOnHidden) return;
    const onVisibility = () => {
      if (document.hidden) { setPaused(true); }
      else { setPaused(false); lastTimeRef.current = 0; }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pauseOnHidden]);

  // Auto-start
  useEffect(() => {
    if (autoStart) { start(); return stop; }
  }, [autoStart, start, stop]);

  return {
    state: {
      frame: frameRef.current,
      elapsed: elapsedRef.current,
      delta: 0,
      fps: fpsLastRef.current,
      paused,
    } as GameLoopState,
    paused,
    start,
    stop,
    toggle,
    setPaused,
  };
}

/**
 * Debounced resize observer that tracks canvas/container dimensions.
 * Use in combination with useGameLoop for responsive canvas games.
 */
export function useCanvasSize(containerRef: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0, dpr: 1 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      setSize({ width: rect.width, height: rect.height, dpr });
    };

    update();
    const observer = new ResizeObserver(() => update());
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  return size;
}

/**
 * Keyboard input hook — tracks currently pressed keys.
 * Use for gamepad-less keyboard control in gamehub games.
 */
export function useKeyboardInput() {
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { keysRef.current.add(e.key); };
    const onUp = (e: KeyboardEvent) => { keysRef.current.delete(e.key); };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  const isPressed = useCallback((key: string) => keysRef.current.has(key), []);
  const isAnyPressed = useCallback((...keys: string[]) => keys.some((k) => keysRef.current.has(k)), []);

  return { isPressed, isAnyPressed, keys: keysRef };
}

/**
 * Simple 2D vector math used across all gamehub games.
 */
export const Vec2 = {
  add: (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: a.x + b.x, y: a.y + b.y }),
  sub: (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: a.x - b.x, y: a.y - b.y }),
  scale: (v: { x: number; y: number }, s: number) => ({ x: v.x * s, y: v.y * s }),
  length: (v: { x: number; y: number }) => Math.sqrt(v.x * v.x + v.y * v.y),
  normalize: (v: { x: number; y: number }) => {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
  },
  dot: (a: { x: number; y: number }, b: { x: number; y: number }) => a.x * b.x + a.y * b.y,
  clamp: (v: number, min: number, max: number) => Math.max(min, Math.min(max, v)),
  lerp: (a: number, b: number, t: number) => a + (b - a) * t,
};