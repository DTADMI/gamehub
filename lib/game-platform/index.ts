// lib/game-platform/index.ts
// Barrel export for shared game utilities.
// Games import from "@/lib/game-platform" instead of the old "@gamehub/game-platform".

export { default as GameContainer } from "./game-container";
export type { GameContainerProps } from "./game-container";
export { soundManager, SoundManager } from "./sound";
export { ParticlePool } from "./particles";
export type { Particle, ParticlePoolOptions } from "./particles";
export { useGameSettings, GameSettingsProvider } from "./game-settings-context";
export type { GameSettings } from "./game-settings-context";
export { ErrorBoundary, withErrorBoundary } from "./error-boundary";
export { submitScore, fetchLeaderboard, fetchLeaderboardPaged } from "./queries";
export type { GameType, LeaderboardEntry, SubmitScoreResult } from "./queries";
