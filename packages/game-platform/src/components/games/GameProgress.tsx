// frontendfile:///components/games/GameProgress.tsx
"use client";

import { Progress } from "@gamehub/ui";
import type { GameStats } from "../../contexts/GameContext";

interface GameProgressProps {
  stats: GameStats;
}

export function GameProgress({ stats }: GameProgressProps) {
  // Calculate progress based on achievements or other metrics
  const progress = Math.min(100, (stats.achievements.length / 10) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">{stats.achievements.length} / 10</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{stats.totalPlays} games played</span>
        <span>{stats.highScore} pts</span>
      </div>
    </div>
  );
}