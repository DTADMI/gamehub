// Shared imports for all Systems Discovery scene files.
// Extracted from index.tsx during monolith split (scripts/split-systems-discovery.mjs).
//
// Scene files import from here to avoid repeating imports across 8 files.

import HomeostasisMeter from "@gamehub/game-platform/components/sysdisc/HomeostasisMeter";
import { PostGameCTA } from "@games/pointclick-engine";
import {
  createPipesState,
  evaluatePipes,
  type PipesState,
  setTileRotation,
  toggleValve,
} from "@games/pointclick-engine/puzzles/pipes";
import {
  createSequenceState,
  pressSeq as pressSequenceKey,
  type SequenceState,
} from "@games/pointclick-engine/puzzles/sequence";

export {
  createPipesState,
  createSequenceState,
  evaluatePipes,
  HomeostasisMeter,
  PostGameCTA,
  pressSequenceKey,
  setTileRotation,
  toggleValve,
};
export type { PipesState, SequenceState };