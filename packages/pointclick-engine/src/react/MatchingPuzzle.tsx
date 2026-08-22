"use client";
import React, { useState } from "react";

export type MatchPair = {
  left: string;
  right: string;
  leftLabel: string;
  rightLabel: string;
};

export type MatchingPuzzleProps = {
  pairs: MatchPair[];
  /** Called when the user successfully matches all pairs */
  onSolved: () => void;
  /** Optional labels for the two columns */
  leftTitle?: string;
  rightTitle?: string;
  /** Optional message shown when all pairs are solved */
  solvedMessage?: string;
  /** Optional reset button text */
  resetLabel?: string;
};

/**
 * A reusable matching puzzle where the user clicks an item from the left
 * column and then its corresponding item from the right column.
 *
 * Used across point-and-click games: systems-discovery (food→nutrient,
 * creature→zone, creature→signal), toymaker-escape (toys→pieces,
 * photos→matches, filing→cabinets), and rite-of-discovery (letters→glyphs).
 */
export function MatchingPuzzle({
  pairs,
  onSolved,
  leftTitle = "Items",
  rightTitle = "Targets",
  solvedMessage = "All matched!",
  resetLabel = "Reset",
}: MatchingPuzzleProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});

  const leftItems = pairs.map((p) => ({
    key: p.left,
    label: p.leftLabel,
    target: p.right,
  }));
  const rightItems = pairs.map((p) => ({
    key: p.right,
    label: p.rightLabel,
  }));

  const allDone =
    Object.keys(matched).length === pairs.length &&
    pairs.every((p) => matched[p.left] === p.right);

  const handleLeftClick = (key: string) => {
    if (matched[key]) {return;}
    setSelected(selected === key ? null : key);
  };

  const handleRightClick = (rightKey: string) => {
    if (!selected || matched[selected]) {return;}

    const pair = pairs.find((p) => p.left === selected);
    if (pair && pair.right === rightKey) {
      const next = { ...matched, [selected]: rightKey };
      setMatched(next);
      setSelected(null);

      if (
        Object.keys(next).length === pairs.length &&
        pairs.every((p) => next[p.left] === p.right)
      ) {
        onSolved();
      }
    } else {
      setSelected(null);
    }
  };

  const handleReset = () => {
    setMatched({});
    setSelected(null);
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Left column */}
        <div>
          <p className="mb-2 text-xs font-medium opacity-70">{leftTitle}</p>
          <div className="flex flex-col gap-2">
            {leftItems.map((item) => (
              <button
                key={item.key}
                className={`min-h-[44px] rounded border-2 px-3 py-2 text-left transition-colors ${
                  matched[item.key]
                    ? "border-green-400 bg-green-100 dark:bg-green-900/30"
                    : selected === item.key
                      ? "border-blue-400 bg-blue-100 dark:bg-blue-900/30"
                      : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 hover:border-blue-400"
                }`}
                disabled={!!matched[item.key]}
                onClick={() => handleLeftClick(item.key)}
              >
                {item.label}
                {matched[item.key] && (
                  <span className="ml-2 text-green-600 dark:text-green-400">
                    → {rightItems.find((r) => r.key === matched[item.key])?.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div>
          <p className="mb-2 text-xs font-medium opacity-70">{rightTitle}</p>
          <div className="flex flex-col gap-2">
            {rightItems.map((item) => (
              <button
                key={item.key}
                className={`min-h-[44px] rounded border-2 px-3 py-2 text-left transition-colors ${
                  Object.values(matched).includes(item.key)
                    ? "border-green-400 bg-green-100 dark:bg-green-900/30"
                    : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 hover:border-blue-400"
                }`}
                disabled={!selected || Object.values(matched).includes(item.key)}
                onClick={() => handleRightClick(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress & results */}
      <div className="text-sm">
        <span className="opacity-70">Matched: </span>
        <span className="font-mono">
          {Object.keys(matched).length} / {pairs.length}
        </span>
      </div>

      {allDone && (
        <p className="font-bold text-green-600 dark:text-green-400">{solvedMessage}</p>
      )}

      <button
        className="min-h-[32px] rounded border px-3 py-1 text-sm hover:bg-muted"
        onClick={handleReset}
      >
        {resetLabel}
      </button>
    </div>
  );
}