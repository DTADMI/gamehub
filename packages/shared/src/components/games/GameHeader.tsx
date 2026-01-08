// frontend/components/games/GameHeader.tsx
"use client";

import { useSound } from "@games/shared";
import { Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

import { LanguageToggle } from "../LanguageToggle";
import { Button } from "@games/shared/components/ui/button";
import { useGame } from "../../contexts/GameContext";

import { GameProgress } from "./GameProgress";

export function GameHeader() {
  const { game, stats } = useGame();
  const { isMuted, toggleMute, volume, setVolume } = useSound();

  if (!game) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/games">
              <Button variant="ghost" className="font-bold">
                ← Back to Games
              </Button>
            </Link>
          </div>

          <div className="flex-1 px-4">
            <h1 className="text-center text-xl font-bold text-gray-900 dark:text-white">
              {game.title}
            </h1>
            {stats && <GameProgress stats={stats} />}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24"
            />

            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
