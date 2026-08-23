"use client";
import React from "react";

/**
 * GlyphWeaverGame — Full spell-crafting studio, integrated directly into GameHub.
 *
 * Uses the local GW packages copied into packages/games/glyph-weaver/packages/.
 * The standalone glyph-weaver monorepo can still be maintained independently,
 * but this is the canonical playable version inside GameHub.
 */

// Local package imports (relative paths from src/ to packages/)
import { I18nProvider } from "../packages/ui/src/i18n/provider.js";
import { ThemeProvider } from "../packages/ui/src/theme/ThemeProvider.js";
import { GlyphWeaverShell } from "../packages/ui/src/components/Shell.js";

function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-24 w-24 rounded-full border-2 border-purple-500/30 animate-spin border-t-purple-400" />
      <p className="text-muted-foreground text-sm">Loading Glyph Weaver Studio...</p>
    </div>
  );
}

function ErrorFallback() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <p className="text-muted-foreground">
        Glyph Weaver studio failed to load. Please try refreshing.
      </p>
      <button
        className="rounded border px-4 py-2 text-sm"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <>{this.props.fallback}</>;
    return <>{this.props.children}</>;
  }
}

export function GlyphWeaverGame() {
  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <ErrorBoundary fallback={<ErrorFallback />}>
        <React.Suspense fallback={<LoadingScreen />}>
          <ThemeProvider>
            <I18nProvider>
              <GlyphWeaverShell />
            </I18nProvider>
          </ThemeProvider>
        </React.Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default GlyphWeaverGame;