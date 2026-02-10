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

// UI components (also available via @gamehub/ui)
export * from "./components/ui/alert";
export * from "./components/ui/badge";
export * from "./components/ui/button";
export * from "./components/ui/card";
export * from "./components/ui/input";
export * from "./components/ui/label";
export * from "./components/ui/progress";
export * from "./components/ui/select";
export * from "./components/ui/separator";
export * from "./components/ui/skeleton";
export * from "./components/ui/switch";
export * from "./components/ui/table";
export * from "./components/ui/tabs";

// Utilities
export { cn } from "./lib/utils";

export * from "./lib/env";
export * from "./lib/firebase";
export * from "./lib/flags";
export * from "./lib/gameProgress";
export * from "./lib/graphql/queries";
export * from "./lib/input";
export * from "./lib/particles";
export * from "./lib/sound";
// lib/utils (cn function) moved to @gamehub/ui
export * from "./metadata/games";
export * from "./metadata/projects";
// Pointclick engine exports moved to @games/pointclick-engine
export * from "./projects";
