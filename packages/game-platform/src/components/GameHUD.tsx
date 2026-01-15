"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import React from "react";

export type GameHUDProps = {
  onPauseToggleAction?: () => void;
  onRestartAction?: () => void;
  tips?: string;
};

export function GameHUD({ onPauseToggleAction, onRestartAction, tips }: GameHUDProps) {
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40">
      <div className="bg-card text-card-foreground pointer-events-auto flex items-center gap-2 rounded-md border px-3 py-2 shadow-md">
        <button
          type="button"
          className="hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm"
          onClick={onPauseToggleAction}
          aria-label="Pause or resume"
          data-testid="hud-pause-toggle"
        >
          <Play className="h-4 w-4" />/<Pause className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm"
          onClick={onRestartAction}
          aria-label="Restart game"
        >
          <RotateCcw className="h-4 w-4" /> Restart
        </button>
        {tips ? <span className="text-muted-foreground ml-2 text-xs">{tips}</span> : null}
      </div>
    </div>
  );
}

export default GameHUD;
