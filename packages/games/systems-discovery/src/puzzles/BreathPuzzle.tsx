"use client";
import {
  createPipesState,
  evaluatePipes,
  type PipesState,
  setTileRotation,
  toggleValve,
} from "@games/pointclick-engine/puzzles/pipes";
import React, { useState } from "react";

/**
 * Simple pipes-flow puzzle: player must rotate tiles and toggle valves
 * so that flow runs from source → sink. A 3-tile horizontal line.
 */
export const BreathPuzzle: React.FC<{ onSolved: () => void }> = ({ onSolved }) => {
  const [state, setState] = useState<PipesState>(() =>
    createPipesState(3, 1, [
      { type: "straight", rotation: 0, source: true },
      { type: "valve", rotation: 0, open: false },
      { type: "straight", rotation: 0, sink: true },
    ]),
  );

  const rotate = (x: number, y: number) => {
    const nextRotation = ((state.grid[y * state.width + x].rotation + 90) % 360) as
      | 0
      | 90
      | 180
      | 270;
    const next = evaluatePipes(setTileRotation(state, x, y, nextRotation));
    setState(next);
    if (next.solved) {
      onSolved();
    }
  };

  const toggle = (x: number, y: number) => {
    const next = evaluatePipes(toggleValve(state, x, y, !state.grid[y * state.width + x].open));
    setState(next);
    if (next.solved) {
      onSolved();
    }
  };

  return (
    <div className="mb-4 rounded-lg bg-blue-50 p-4">
      <p className="mb-2 text-sm font-medium text-blue-800">Oxygen Flow Simulation</p>
      <div className="flex items-center justify-center gap-4">
        <button
          className="flex h-16 w-16 items-center justify-center rounded border-2 border-blue-300 bg-white"
          onClick={() => rotate(0, 0)}
        >
          {state.grid[0].rotation * 90}°
        </button>
        <button
          className={`flex h-16 w-16 items-center justify-center rounded border-2 border-blue-300 ${state.grid[1].open ? "bg-blue-200" : "bg-white"}`}
          onClick={() => toggle(1, 0)}
        >
          {state.grid[1].open ? "OPEN" : "CLOSED"}
        </button>
        <button
          className="flex h-16 w-16 items-center justify-center rounded border-2 border-blue-300 bg-white"
          onClick={() => rotate(2, 0)}
        >
          {state.grid[2].rotation * 90}°
        </button>
      </div>
      {state.solved && (
        <p className="mt-2 text-center font-bold text-green-600">Oxygen Flow Restored!</p>
      )}
    </div>
  );
};