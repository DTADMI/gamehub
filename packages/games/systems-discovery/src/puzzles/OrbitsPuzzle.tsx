"use client";
import {
  createPipesState,
  evaluatePipes,
  type PipesState,
  setTileRotation,
  toggleValve,
} from "@games/pointclick-engine/puzzles/pipes";
import React from "react";

const BODY_LABELS = ["Sun", "Mercury", "Venus", "Earth", "Mars"];
const BODY_ICONS = ["\u2600\uFE0F", "\uD83E\uDE90", "\uD83C\uDF10", "\uD83C\uDF0D", "\uD83D\uDD34"];

export const OrbitsPuzzle: React.FC<{ onSolved: () => void; gentle?: boolean }> = ({
  onSolved,
  gentle,
}) => {
  const [orbits, setOrbits] = React.useState<PipesState>(() =>
    createPipesState(5, 1, [
      { type: "straight", rotation: 0, source: true },
      { type: "valve", rotation: 0, open: false },
      { type: "straight", rotation: 0 },
      { type: "valve", rotation: 0, open: false },
      { type: "straight", rotation: 0, sink: true },
    ]),
  );

  const rotateTile = (x: number) => {
    const nextRotation = ((orbits.grid[x].rotation + 90) % 360) as 0 | 90 | 180 | 270;
    const next = evaluatePipes(setTileRotation(orbits, x, 0, nextRotation));
    setOrbits(next);
    if (next.solved) {onSolved();}
  };

  const toggleValveTile = (x: number) => {
    const tile = orbits.grid[x];
    if (tile.type !== "valve") {return;}
    const next = evaluatePipes(toggleValve(orbits, x, 0, !tile.open));
    setOrbits(next);
    if (next.solved) {onSolved();}
  };

  return (
    <div className="mb-4 rounded-lg bg-slate-900 p-4">
      {gentle && <p className="mb-2 text-sm text-gray-400">Align the orbital paths to create a clear route between planets.</p>}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {orbits.grid.map((tile, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-xs text-gray-300">{BODY_LABELS[i]}</span>
            <span className="text-lg">{BODY_ICONS[i]}</span>
            <div className="flex gap-1">
              <button
                className="min-h-[36px] min-w-[36px] rounded border border-gray-600 bg-slate-800 text-xs text-white"
                onClick={() => rotateTile(i)}
                aria-label={`Rotate ${BODY_LABELS[i]} tile`}
              >
                ↻
              </button>
              {tile.type === "valve" && (
                <button
                  className={`min-h-[36px] min-w-[36px] rounded border text-xs text-white ${
                    tile.open
                      ? "bg-emerald-600 border-emerald-400"
                      : "bg-red-700 border-red-400"
                  }`}
                  onClick={() => toggleValveTile(i)}
                >
                  {tile.open ? "ON" : "OFF"}
                </button>
              )}
            </div>
            <span className="text-xs text-gray-500">{tile.rotation * 90}°</span>
          </div>
        ))}
      </div>
      {orbits.solved && (
        <p className="mb-2 text-center font-bold text-green-400">Orbital paths aligned!</p>
      )}
      {orbits.errors && orbits.errors.length > 0 && (
        <ul className="mb-2 list-disc pl-5 text-sm text-amber-400">
          {orbits.errors.map((e, i2) => (
            <li key={i2}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
};