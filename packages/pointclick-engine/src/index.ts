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
export { DialogueBox } from "./react/DialogueBox";
export { InventoryBar } from "./react/InventoryBar";
export { SceneController } from "./react/SceneController";

// UI components
export * from "./ui/InputSequenceDetector";

// Types
export * from "./types";

// Internationalization
export * from "./lib/i18n";
