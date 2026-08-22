/**
 * SceneBackground — CSS gradient/pattern backgrounds for point-and-click scenes.
 *
 * Each scene type gets a unique atmospheric background generated purely with CSS.
 * No external image assets required. Animations are subtle and GPU-composited.
 *
 * Usage:
 *   <SceneBackground type="workshop" animate />
 */

"use client";
import React from "react";

export type SceneBgType =
  | "workshop"
  | "office"
  | "apartment"
  | "space"
  | "ocean"
  | "body"
  | "home"
  | "thinking"
  | "intro"
  | "outro"
  | "default";

const SCENE_STYLES: Record<SceneBgType, React.CSSProperties & { "--anim-name"?: string }> = {
  workshop: {
    background: "linear-gradient(135deg, #1a120b 0%, #2d1f12 30%, #1a120b 60%, #3d2a18 100%)",
    "--anim-name": "workshopShimmer",
  } as any,
  office: {
    background: "linear-gradient(160deg, #0f0c18 0%, #1a1530 40%, #0d0a1a 70%, #252040 100%)",
    "--anim-name": "officeFlicker",
  } as any,
  apartment: {
    background: "linear-gradient(150deg, #1a1018 0%, #2d1b2a 35%, #1a1018 65%, #3d2b3a 100%)",
    "--anim-name": "apartmentWarm",
  } as any,
  space: {
    background: "radial-gradient(ellipse at 30% 50%, #0a0a2e 0%, #050510 40%, #000005 100%)",
    "--anim-name": "spaceDrift",
  } as any,
  ocean: {
    background: "linear-gradient(180deg, #001a33 0%, #003366 30%, #001a44 60%, #004477 100%)",
    "--anim-name": "oceanWaves",
  } as any,
  body: {
    background: "linear-gradient(180deg, #1a0a0a 0%, #2d1010 30%, #1a0808 60%, #3d1515 100%)",
    "--anim-name": "bodyPulse",
  } as any,
  home: {
    background: "linear-gradient(160deg, #1a1410 0%, #2d2218 40%, #1a1410 70%, #3d3020 100%)",
    "--anim-name": "homeWarm",
  } as any,
  thinking: {
    background: "linear-gradient(135deg, #0a0a1a 0%, #101030 30%, #0a0a1a 70%, #151540 100%)",
    "--anim-name": "thinkingGlow",
  } as any,
  intro: {
    background: "linear-gradient(180deg, #0d0d1a 0%, #1a1a3a 50%, #0d0d1a 100%)",
    "--anim-name": "introFade",
  } as any,
  outro: {
    background: "linear-gradient(180deg, #1a1a0d 0%, #3a3a1a 50%, #1a1a0d 100%)",
    "--anim-name": "outroFade",
  } as any,
  default: {
    background: "linear-gradient(135deg, #111 0%, #1a1a2e 50%, #111 100%)",
  } as any,
};

// CSS keyframes injected once
let STYLES_INJECTED = false;
function injectStyles() {
  if (typeof document === "undefined" || STYLES_INJECTED) return;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes workshopShimmer {
      0%, 100% { background-position: 0% 0%; }
      50% { background-position: 100% 100%; }
    }
    @keyframes officeFlicker {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.95; }
    }
    @keyframes apartmentWarm {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.05); }
    }
    @keyframes spaceDrift {
      0% { background-position: 0% 0%; }
      50% { background-position: 100% 0%; }
      100% { background-position: 0% 0%; }
    }
    @keyframes oceanWaves {
      0% { background-position: 0% 0%; }
      33% { background-position: 0% 3%; }
      66% { background-position: 0% -2%; }
      100% { background-position: 0% 0%; }
    }
    @keyframes bodyPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.002); }
    }
    @keyframes homeWarm {
      0%, 100% { filter: brightness(1) saturate(1); }
      50% { filter: brightness(1.03) saturate(1.02); }
    }
    @keyframes thinkingGlow {
      0%, 100% { box-shadow: inset 0 0 60px rgba(100,100,255,0.05); }
      50% { box-shadow: inset 0 0 100px rgba(100,100,255,0.1); }
    }
    @keyframes introFade {
      0% { opacity: 0.7; }
      100% { opacity: 1; }
    }
    @keyframes outroFade {
      0% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  STYLES_INJECTED = true;
}

export type SceneBackgroundProps = {
  type: SceneBgType;
  animate?: boolean;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Full-viewport atmospheric CSS background for point-and-click scenes.
 *
 * Wraps children in a container with the appropriate gradient, optional
 * subtle CSS animation, and a semi-transparent content area overlay.
 */
export function SceneBackground({ type, animate = true, children, className = "" }: SceneBackgroundProps) {
  React.useEffect(() => { injectStyles(); }, []);

  const style = SCENE_STYLES[type] || SCENE_STYLES.default;
  const animName = (style as any)["--anim-name"];

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
      style={{
        background: style.background,
        backgroundSize: "200% 200%" as any,
        ...(animate && animName
          ? {
              animation: `${animName} 20s ease-in-out infinite`,
            }
          : {}),
      }}
    >
      {/* Subtle radial vignette overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Smaller inline scene card — used inside GameContainer for per-scene atmosphere
 * when the full viewport background is already set.
 */
export function SceneCard({
  type,
  animate = false,
  children,
  className = "",
}: SceneBackgroundProps) {
  React.useEffect(() => { injectStyles(); }, []);

  const style = SCENE_STYLES[type] || SCENE_STYLES.default;
  const animName = (style as any)["--anim-name"];

  return (
    <div
      className={`relative rounded-xl border border-white/10 ${className}`}
      style={{
        background: style.background,
        backgroundSize: "200% 200%" as any,
        ...(animate && animName
          ? { animation: `${animName} 15s ease-in-out infinite` }
          : {}),
      }}
    >
      <div className="relative z-10 p-4">{children}</div>
    </div>
  );
}