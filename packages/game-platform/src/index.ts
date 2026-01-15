// Shared utilities and components exports

// Core contexts
export * from "./contexts/AuthContext";
export * from "./contexts/FlagsContext";
export * from "./contexts/GameContext";
export * from "./contexts/GameSettingsContext";
export * from "./contexts/ProfileContext";
export * from "./contexts/SoundContext";
export * from "./contexts/SubscriptionContext";

// Hooks (UI-related hooks moved to @gamehub/ui)

// Components - App-level
export { Carousel } from "./components/Carousel";
export { default as Footer } from "./components/Footer";
export { default as GameCard } from "./components/GameCard";
export { default as Header } from "./components/Header";
export { default as I18nInitializer } from "./components/I18nInitializer";
export { Icons } from "./components/icons";
export { default as LanguageToggle } from "./components/LanguageToggle";
export { default as LogoutButton } from "./components/LogoutButton";
export { ModeToggle } from "./components/ModeToggle";
export { default as Navbar } from "./components/Navbar";
export { PresenceBadge } from "./components/PresenceBadge";
export { default as ProtectedRoute } from "./components/ProtectedRoute";
export { default as Providers } from "./components/Providers";
export { default as SettingsPanel } from "./components/SettingsPanel";
export { default as SoundControls } from "./components/SoundControls";
export { default as SoundRootProvider } from "./components/SoundRootProvider";
export { ThemeProvider } from "./components/ThemeProvider";

// Game infrastructure components
export type { GameContainerProps } from "./components/GameContainer";
export { default as GameContainer } from "./components/GameContainer";
export { GameHUD } from "./components/GameHUD";
export { GameShell } from "./components/GameShell";

// Note: UI components have been moved to @gamehub/ui package
// Import from '@gamehub/ui' instead of '@games/shared' for UI components
export * from "./lib/env";
export * from "./lib/firebase";
export * from "./lib/flags";
export * from "./lib/gameProgress";
export * from "./lib/graphql/queries";
export { getLocale, i18n, initI18n, setLocale, t } from "./lib/i18n";
export * from "./lib/input";
export * from "./lib/particles";
export * from "./lib/sound";
// lib/utils (cn function) moved to @gamehub/ui
export * from "./metadata/games";
export * from "./metadata/projects";
// Pointclick engine exports moved to @games/pointclick-engine
export * from "./projects";
