// frontend/components/games/GameProgress.tsx
"use client";

import { Progress } from "@games/shared/components/ui/progress";
import { GameStats } from "../../lib/gameProgress";

interface GameProgressProps {
  stats: GameStats;
}

export function GameProgress({ stats }: GameProgressProps) {
  // Calculate progress based on achievements or other metrics
  const progress = Math.min(100, (stats.achievements.length / 10) * 100);

  return (
    <div className="mt-1">
      <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
