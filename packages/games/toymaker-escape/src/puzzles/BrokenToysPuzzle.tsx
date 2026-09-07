"use client";
import { MatchingPuzzle, type MatchPair } from "@games/pointclick-engine";
import { effects, type EngineCtx,ensureCtx } from "@games/pointclick-engine/engine";
import React from "react";

export type BrokenToysPuzzleProps = {
  lang: "en" | "fr";
  ctx: EngineCtx;
  setCtx: React.Dispatch<React.SetStateAction<EngineCtx>>;
};

const brokenToyPairs: MatchPair[] = [
  { left: "bear", right: "cog", leftLabel: "Gear Bear", rightLabel: "Brass Cog" },
  { left: "music", right: "cylinder", leftLabel: "Music Box", rightLabel: "Music Cylinder" },
  { left: "puppet", right: "strings", leftLabel: "Marionette", rightLabel: "Replacement Strings" },
];

/**
 * E2 — Broken Toy Workbench: match broken toys to their missing pieces.
 * Uses the shared MatchingPuzzle component.
 */
export function BrokenToysPuzzle({ lang, ctx, setCtx }: BrokenToysPuzzleProps) {
  const solved = !!ctx.flags?.["brokenToys.solved"];

  return (
    <div className="mb-4 rounded-md border p-3">
      <h3 className="mb-2 font-semibold">
        {lang === "fr" ? "\u00C9tabli des jouets cass\u00E9s" : "Broken Toy Workbench"}
      </h3>
      <p className="mb-2 text-sm">
        {lang === "fr"
          ? "Le travail du fabricant est encombr\u00E9 de jouets cass\u00E9s. Restaurez les pi\u00E8ces manquantes pour r\u00E9v\u00E9ler un indice."
          : "The toymaker's workbench is cluttered with broken toys. Restore the missing pieces to reveal a clue."}
      </p>

      <MatchingPuzzle
        pairs={brokenToyPairs}
        onSolved={() => {
          setCtx((c) => effects.setFlag("brokenToys.solved", true)(ensureCtx(c)));
        }}
        leftTitle={lang === "fr" ? "Jouets cass\u00E9s" : "Broken Toys"}
        rightTitle={lang === "fr" ? "Pi\u00E8ces de rechange" : "Spare Parts"}
        solvedMessage={
          lang === "fr"
            ? "Tous les jouets r\u00E9par\u00E9s ! Un tiroir cach\u00E9 coulisse."
            : "All toys repaired! A hidden drawer slides open."
        }
        resetLabel={lang === "fr" ? "R\u00E9initialiser" : "Reset"}
      />

      {solved && (
        <p className="mt-2 font-bold text-emerald-400">
          {lang === "fr"
            ? "Tous les jouets r\u00E9par\u00E9s ! Un tiroir cach\u00E9 coulisse."
            : "All toys repaired! A hidden drawer slides open."}
        </p>
      )}
    </div>
  );
}