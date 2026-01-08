// libs/shared/src/components/GameContainer.tsx
import React, { type ReactNode } from "react";

import { GameSettingsProvider, useGameSettings } from "../contexts/GameSettingsContext";
import { ErrorBoundary } from "../lib/ErrorBoundary";

export interface GameContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
  // When true, prevents page scroll/zoom and enables touch-action safety inside the game area (mobile-friendly)
  lockTouch?: boolean;
  // Optional background image url (e.g., /images/bg-neon-grid.jpg)
  backgroundImage?: string;
  // Show/hide particle controls selector (only relevant for games that implement particles)
  showParticleControls?: boolean;
}

// Prefer a standard function component that explicitly returns JSX.Element
// This avoids React.FC typing nuances (e.g., ReactNode | Promise<ReactNode> in some type versions)
function GameContainer({
  children,
  title,
  description,
  className = "",
  lockTouch = true,
  backgroundImage,
  showParticleControls = true,
}: GameContainerProps) {
  // Prevent scroll/zoom gestures while interacting with the game area on mobile
  // Avoid calling preventDefault in React synthetic handlers (which are passive by default
  // on some browsers) to prevent the warning. Instead, we rely on per‑canvas listeners in
  // each game (added with `{ passive: false }`) and only stop wheel scrolling here.
  const touchHandlers = lockTouch
    ? {
        onWheel: (e: React.WheelEvent) => e.preventDefault(),
      }
    : {};
  return (
    <GameSettingsProvider>
      <div
        className={`min-h-0 bg-gray-50 dark:bg-gray-900 ${className}`}
        style={
          backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="container mx-auto px-3 py-3 md:px-4 md:py-4">
          <header className="mb-3 text-center md:mb-4">
            <h1 className="mb-1 text-3xl font-bold text-gray-900 md:mb-2 md:text-4xl dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg dark:text-gray-300">
                {description}
              </p>
            )}
          </header>

          <ErrorBoundary>
            <div className="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
              <div
                className={`relative mx-auto aspect-video w-full max-w-[960px] ${lockTouch ? "touch-none select-none" : ""}`}
                {...touchHandlers}
              >
                {children}
              </div>
            </div>
          </ErrorBoundary>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 md:mt-4">
            <ModeSelector />
            {showParticleControls ? <ParticlesToggle /> : null}
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white transition-colors hover:bg-blue-700"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </GameSettingsProvider>
  );
}

// Export the component as default
export default GameContainer;

function ParticlesToggle() {
  const { enableParticles, setEnableParticles, particleEffect, setParticleEffect } =
    useGameSettings();
  return (
    <div className="flex items-center gap-3">
      <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <input
          type="checkbox"
          checked={enableParticles}
          onChange={(e) => setEnableParticles(e.currentTarget.checked)}
          className="h-4 w-4 accent-blue-600"
        />
        Particles
      </label>
      <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <span className="sr-only">Particle effect</span>
        <select
          aria-label="Particle effect"
          disabled={!enableParticles}
          value={particleEffect}
          onChange={(e) => setParticleEffect(e.currentTarget.value as any)}
          className="border-input bg-background h-8 rounded-md border px-2 text-sm disabled:opacity-50"
        >
          <option value="sparks">Sparks</option>
          <option value="puff">Puff</option>
        </select>
      </label>
    </div>
  );
}

function ModeSelector() {
  const { mode, setMode, isAuthenticated, isSubscriber, setAuthState } = useGameSettings();
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // Expose globally for game loops that read fast mode hints
      (window as any).__gh_mode = mode;
    }
  }, [mode]);
  return (
    <div className="flex items-center gap-3">
      <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <span className="sr-only">Game mode</span>
        <select
          aria-label="Game mode"
          value={mode}
          onChange={(e) => setMode(e.currentTarget.value as any)}
          className="border-input bg-background h-8 rounded-md border px-2 text-sm"
        >
          <option value="classic">Classic</option>
          <option value="hard" disabled={!isAuthenticated}>
            Hard {isAuthenticated ? "" : "(sign in)"}
          </option>
          <option value="chaos" disabled={!isSubscriber}>
            Chaos {isSubscriber ? "" : "(sub)"}
          </option>
        </select>
      </label>
      {/* Lightweight entitlement toggles for local testing (no external providers during dev/E2E) */}
      <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
        <input
          type="checkbox"
          className="h-4 w-4 accent-blue-600"
          checked={isAuthenticated}
          onChange={(e) => setAuthState(e.currentTarget.checked, isSubscriber)}
        />
        Signed in
      </label>
      <label className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
        <input
          type="checkbox"
          className="h-4 w-4 accent-blue-600"
          checked={isSubscriber}
          onChange={(e) => setAuthState(isAuthenticated, e.currentTarget.checked)}
        />
        Subscriber
      </label>
    </div>
  );
}
