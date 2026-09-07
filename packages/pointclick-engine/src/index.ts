// Core engine exports
export { GameEngine } from "./core/Engine";
export * from "./core/Persistence";
export { SceneManager } from "./core/SceneManager";
export * from "./core/SceneServices";

// Engine types and utilities (selective to avoid conflicts)
export type { Choice, EngineCtx, Lang, Migrator, SaveState, Scene } from "./engine";
export { effects, ensureCtx, guards, load, migrate, nextScene, save } from "./engine";

// Convenience re-exports
export { versionedLoad, versionedSave } from "./core/Persistence";

// Puzzle systems
export * from "./puzzles/gears";
export * from "./puzzles/keypad";
export * from "./puzzles/pipes";
export * from "./puzzles/sequence";
export * from "./puzzles/wires";

// React components
export type { CharacterPortrait,DialogueBoxProps } from "./react/DialogueBox";
export { DialogueBox } from "./react/DialogueBox";
export { InventoryBar } from "./react/InventoryBar";
export type { MatchingPuzzleProps, MatchPair } from "./react/MatchingPuzzle";
export { MatchingPuzzle } from "./react/MatchingPuzzle";
export type { PostGameCTAProps } from "./react/PostGameCTA";
export { PostGameCTA } from "./react/PostGameCTA";
export type { SceneBackgroundProps, SceneBgType } from "./react/SceneBackground";
export { SceneBackground, SceneCard } from "./react/SceneBackground";
export { SceneController } from "./react/SceneController";

// Audio
export { ProceduralAudio, proceduralAudio } from "./audio/ProceduralAudio";
export { useSceneAudio, useSoundEffects } from "./audio/useSceneAudio";

// UI components
export * from "./ui/InputSequenceDetector";

// Types
export * from "./types";

// Internationalization
export * from "./lib/i18n";
