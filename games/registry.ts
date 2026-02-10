// games/registry.ts
// Central game registry. To add a new game:
//   1. Create a folder at games/<slug>/ with your game component
//   2. Export a default component from games/<slug>/index.ts
//   3. Add one entry below mapping slug -> dynamic import
//   4. Add metadata to lib/games.ts

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Each entry maps a game slug to a lazy-loaded component.
// Using next/dynamic ensures games are code-split and only loaded when visited.
const registry: Record<string, ComponentType> = {
  snake: dynamic(() => import("@/games/snake"), { ssr: false }),
  breakout: dynamic(() => import("@/games/breakout"), { ssr: false }),
  memory: dynamic(() => import("@/games/memory"), { ssr: false }),
  "bubble-pop": dynamic(() => import("@/games/bubble-pop"), { ssr: false }),
  checkers: dynamic(() => import("@/games/checkers"), { ssr: false }),
  chess: dynamic(() => import("@/games/chess"), { ssr: false }),
};

export function getGameComponent(slug: string): ComponentType | null {
  return registry[slug] ?? null;
}

export function hasGameComponent(slug: string): boolean {
  return slug in registry;
}
