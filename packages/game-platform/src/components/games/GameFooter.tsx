// frontend/components/games/GameFooter.tsx
"use client";

import { Button } from "@gamehub/ui";
import { useRouter } from "next/navigation";

import { useGame } from "../../contexts/GameContext";

export function GameFooter() {
  const { game, stats, saveProgress } = useGame();
  const router = useRouter();

  if (!game) {
    return null;
  }

  const handleSaveAndQuit = async () => {
    try {
      await saveProgress();
      router.push("/games");
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {game.title} • {stats?.totalPlays || 0} plays
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Restart
            </Button>

            <Button variant="outline" size="sm" onClick={handleSaveAndQuit}>
              Save & Quit
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
