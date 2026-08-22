"use client";
import React, { Suspense, lazy, useEffect, useState } from "react";

/**
 * GlyphWeaverGame — GameHub integration for the full Glyph Weaver spell-crafting studio.
 *
 * Integration strategy:
 * - Attempts to dynamically load @glyph-weaver/ui's GlyphWeaverShell
 * - If loading fails (separate monorepo, not linked), renders a launchpad UI
 * - Production deployment: the glyph-weaver app should be deployed independently
 *   and accessed via the "Launch Studio" button
 *
 * See docs/games/glyph-weaver-integration.md for full integration documentation.
 */

type LoadState = "loading" | "loaded" | "unavailable";

// Attempt to load the glyph-weaver shell from the sibling monorepo
// Uses tsconfig path: glyph-weaver/* → ../glyph-weaver/*
const LoadableGlyphWeaverShell = lazy(async () => {
  try {
    // Dynamic import from sibling monorepo — resolved via tsconfig path mapping
    const modulePath = "glyph-weaver/packages/ui/dist/index.js";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await (import(/* @vite-ignore */ modulePath) as any);
    if (typeof mod?.GlyphWeaverShell === "function") {
      return { default: () => <mod.GlyphWeaverShell /> };
    }
    throw new Error("GlyphWeaverShell not found in dist");
  } catch {
    throw new Error("Glyph Weaver not available — using launchpad mode");
  }
});

function LaunchpadFallback() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8">
      {/* Glyph circle decoration */}
      <div className="relative">
        <div className="h-32 w-32 rounded-full border-2 border-purple-500/30 bg-purple-900/10 flex items-center justify-center">
          <span className="text-5xl">🔮</span>
        </div>
        <div className="absolute inset-0 -m-3 rounded-full border border-purple-500/10 animate-pulse" />
      </div>

      <div className="text-center space-y-2 max-w-md">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Glyph Weaver
        </h1>
        <p className="text-lg text-muted-foreground">
          Spell Crafting Studio
        </p>
        <p className="text-sm text-muted-foreground/70 leading-relaxed mt-4">
          Draw glyph rings, weave sigils, and cast spells in this interactive
          studio inspired by the Witch Hat Atelier magic system.
          Features: WebGL particle effects, WHA-DSL spell language,
          multi-ring compilation, and a full drawing canvas with pressure sensitivity.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <a
          href="/games/spell-craft"
          className="bg-primary/20 hover:bg-primary/30 border border-primary/30 min-h-[48px] rounded-xl flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>✨</span>
          <span>Try Spell Craft (Quick Version)</span>
        </a>

        <button
          className="min-h-[48px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground transition-all hover:border-white/20 hover:text-white"
          disabled
        >
          🚀 Launch Full Studio (Coming Soon)
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 max-w-md w-full">
        {[
          { icon: "🎨", label: "Draw & Cast", desc: "Free-form sigil drawing with real-time spell compilation" },
          { icon: "📜", label: "WHA-DSL", desc: "Text-based spell language for precise spell crafting" },
          { icon: "✨", label: "WebGL FX", desc: "10 element types with GPU particle effects" },
        ].map((f) => (
          <div key={f.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
            <div className="text-2xl mb-1">{f.icon}</div>
            <div className="text-xs font-medium">{f.label}</div>
            <div className="text-[10px] text-muted-foreground/50 mt-1 leading-tight">{f.desc}</div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground/30 mt-6">
        Glyph Weaver · v0.1.0 · Fan Project · Inspired by Witch Hat Atelier
      </p>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8">
      <div className="h-24 w-24 rounded-full border-2 border-purple-500/30 animate-spin border-t-purple-400" />
      <p className="text-muted-foreground text-sm">Loading Glyph Weaver Studio...</p>
    </div>
  );
}

export function GlyphWeaverGame() {
  const [loadState, setLoadState] = useState<LoadState>("loading");

  // Pre-load check
  useEffect(() => {
    const timeout = setTimeout(() => {
      // If the lazy component hasn't resolved by now, show launchpad
      setLoadState("unavailable");
    }, 3000);

    // Try to detect if linked
    try {
      // Quick check — if the dist file exists, lazy will handle it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      import("glyph-weaver/packages/ui/dist/index.js" as any)
        .then((m) => {
          clearTimeout(timeout);
          if (m.GlyphWeaverShell) {
            setLoadState("loaded");
          } else {
            setLoadState("unavailable");
          }
        })
        .catch(() => {
          clearTimeout(timeout);
          setLoadState("unavailable");
        });
    } catch {
      // Will timeout to unavailable
    }

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {loadState === "loading" && <LoadingFallback />}
      {loadState === "unavailable" && <LaunchpadFallback />}
      {loadState === "loaded" && (
        <ErrorBoundary fallback={<LaunchpadFallback />}>
          <Suspense fallback={<LoadingFallback />}>
            <LoadableGlyphWeaverShell />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}

function ErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handler = () => setHasError(true);
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  if (hasError) return <>{fallback}</>;
  return <>{children}</>;
}

export default GlyphWeaverGame;