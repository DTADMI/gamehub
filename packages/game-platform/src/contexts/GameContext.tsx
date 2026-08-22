// frontendfile:///contexts/GameContext.tsx
"use client";

import { useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { GameEntry, getGame as getGameById } from "../metadata/games";
import { useAuth } from "./AuthContext";
import { useSound } from "./SoundContext";

export interface GameStats {
  highScore: number;
  totalPlays: number;
  achievements: string[];
  lastPlayed: string;
}

const LOCAL_STORAGE_KEY = "gamehub:gameProgress";

interface GameContextType {
  game: GameEntry | null;
  stats: GameStats | null;
  updateStats: (updates: Partial<GameStats>) => void;
  saveProgress: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

function loadStatsFromStorage(userId: string, gameId: string): GameStats | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {return null;}
    const all = JSON.parse(raw) as Record<string, Record<string, GameStats>>;
    return all[userId]?.[gameId] ?? null;
  } catch {
    return null;
  }
}

function saveStatsToStorage(userId: string, gameId: string, stats: GameStats) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const all: Record<string, Record<string, GameStats>> = raw ? JSON.parse(raw) : {};
    if (!all[userId]) {all[userId] = {};}
    all[userId][gameId] = stats;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage may be full or unavailable
  }
}

function defaultStats(): GameStats {
  return {
    highScore: 0,
    totalPlays: 0,
    achievements: [],
    lastPlayed: new Date().toISOString(),
  };
}

export function GameProvider({ children, gameId }: { children: React.ReactNode; gameId: string }) {
  const [game, setGame] = useState<GameEntry | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { user } = useAuth();
  const { playSound } = useSound();
  const router = useRouter();

  useEffect(() => {
    try {
      setIsLoading(true);
      const gameData = getGameById(gameId);
      if (!gameData) {
        throw new Error(`Game with ID ${gameId} not found`);
      }
      setGame(gameData);

      if (user) {
        const userId = (user as any).uid ?? (user as any).id ?? "guest";
        const saved = loadStatsFromStorage(userId, gameId);
        setStats(saved ?? defaultStats());
      } else {
        setStats(defaultStats());
      }
    } catch (err) {
      console.error("Error loading game:", err);
      setError(err instanceof Error ? err : new Error("Failed to load game"));
      if (err instanceof Error && err.message.includes("not found")) {
        router.push("/games");
      }
    } finally {
      setIsLoading(false);
    }
  }, [gameId, user, router]);

  const updateStats = (updates: Partial<GameStats>) => {
    setStats((prev) => {
      if (!prev) {return null;}
      const newStats = { ...prev, ...updates, lastPlayed: new Date().toISOString() };
      if (updates.highScore !== undefined && updates.highScore > (prev.highScore || 0)) {
        playSound("achievement");
      }
      return newStats;
    });
  };

  const saveProgress = useCallback(async () => {
    if (!user || !stats) {return;}
    const userId = (user as any).uid ?? (user as any).id ?? "guest";
    saveStatsToStorage(userId, gameId, stats);
  }, [user, stats, gameId]);

  useEffect(() => {
    return () => {
      if (user && stats) {
        saveProgress().catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = { game, stats, updateStats, saveProgress, isLoading, error };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

export { GameContext };