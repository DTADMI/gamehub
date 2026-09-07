"use client";
import React, { useEffect, useRef } from "react";

import { GlyphWeaverShell } from "../packages/ui/src/components/Shell";
/**
 * GlyphWeaverGame — Full spell-crafting studio, natively integrated into GameHub.
 *
 * Uses the local GW packages copied into packages/games/glyph-weaver/packages/.
 * This is the canonical version — the standalone glyph-weaver monorepo is a PoC.
 */
// Local package imports
import { I18nProvider } from "../packages/ui/src/i18n/provider";
import { useStore } from "../packages/ui/src/state/store";
import { ThemeProvider } from "../packages/ui/src/theme/ThemeProvider";

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
    if (this.state.hasError) {return <>{this.props.fallback}</>;}
    return <>{this.props.children}</>;
  }
}

/** Dispatches game:complete when a spell transitions to active. */
function useGameCompleteEvent() {
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      const currentStatus = state.spellState?.status ?? null;
      if (currentStatus === "active" && prevStatusRef.current !== "active") {
        window.dispatchEvent(
          new CustomEvent("game:complete", {
            detail: {
              score: Math.round((state.spellState?.quality ?? 0) * 100),
              element: state.spellState?.element,
            },
          })
        );
      }
      prevStatusRef.current = currentStatus;
    });
    return unsub;
  }, []);
}

export function GlyphWeaverGame() {
  useGameCompleteEvent();

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* GW CSS custom properties — normally from apps/web/app/globals.css in standalone */}
      <style>{`
        .gw-root {
          --gw-bg-primary: #1a1423;
          --gw-bg-secondary: #241e30;
          --gw-bg-tertiary: #2e2640;
          --gw-text-primary: #f0e6d3;
          --gw-text-secondary: #c4b8a6;
          --gw-text-muted: #8a7e6e;
          --gw-accent-gold: #d4a853;
          --gw-accent-gold-hover: #e6c06a;
          --gw-accent-purple: #7b5ea7;
          --gw-accent-purple-hover: #9275c0;
          --gw-accent-ink: #3a4f7a;
          --gw-accent-parchment: #f0e6d3;
          --gw-border: #3a3346;
          --gw-border-active: #7b5ea7;
          --gw-success: #4e9a5c;
          --gw-warning: #c99a2e;
          --gw-error: #c44e4e;
          --gw-canvas-bg: #f5f0e6;
          --gw-sidebar-width: 280px;
          --gw-header-height: 56px;
        }
        [data-theme='light'] .gw-root {
          --gw-bg-primary: #faf7f0;
          --gw-bg-secondary: #f0ead6;
          --gw-bg-tertiary: #e8dfc8;
          --gw-text-primary: #2e1a3a;
          --gw-text-secondary: #5a3e6b;
          --gw-text-muted: #8a7a95;
          --gw-accent-gold: #b89030;
          --gw-accent-gold-hover: #d4a853;
          --gw-accent-purple: #6b4e8d;
          --gw-accent-purple-hover: #7b5ea7;
          --gw-accent-ink: #2e4a6b;
          --gw-accent-parchment: #f5f0e6;
          --gw-border: #d4c8b0;
          --gw-border-active: #7b5ea7;
          --gw-success: #3d7a4a;
          --gw-warning: #b08520;
          --gw-error: #b33a3a;
          --gw-canvas-bg: #f5f0e6;
        }
      `}</style>
      <div className="gw-root">
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
    </div>
  );
}

export default GlyphWeaverGame;