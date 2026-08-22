/**
 * useSceneAudio — React hook that plays procedural ambient audio based on the current scene.
 * Maps scene IDs to ambient types automatically.
 */

"use client";
import { useEffect } from "react";
import { proceduralAudio, type ProceduralAudio } from "../audio/ProceduralAudio";

type AmbientMap = Record<string, "workshop" | "office" | "apartment" | "space" | "ocean" | "body" | "home" | "thinking">;

/**
 * Hook: automatically starts/stops ambient audio based on the active sceneId.
 *
 * @param sceneId - The current scene identifier
 * @param ambientMap - Mapping of scene prefix/ID → ambient audio type
 * @param enabled - Whether audio is enabled (default: true)
 *
 * Example:
 *   useSceneAudio(sceneId, {
 *     "E1": "workshop",
 *     "E2": "office",
 *     "E3": "apartment",
 *   });
 */
export function useSceneAudio(
  sceneId: string,
  ambientMap: AmbientMap,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    // Find matching ambient type (check prefixes first, then exact match)
    let ambientType: AmbientMap[string] | null = null;

    // Check sorted keys by length (longest match first)
    const keys = Object.keys(ambientMap).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (sceneId.startsWith(key) || sceneId === key) {
        ambientType = ambientMap[key];
        break;
      }
    }

    if (ambientType) {
      proceduralAudio.setEnabled(true);
      proceduralAudio.startAmbient(ambientType);
    }

    return () => {
      proceduralAudio.stopAmbient();
    };
  }, [sceneId, enabled, ambientMap]);
}

/**
 * Hook for one-shot sound effects. Returns a play function.
 */
export function useSoundEffects() {
  return {
    playClick: () => proceduralAudio.play("click"),
    playSolve: () => proceduralAudio.play("solve"),
    playReveal: () => proceduralAudio.play("reveal"),
    playError: () => proceduralAudio.play("error"),
    playCollect: () => proceduralAudio.play("collect"),
    setVolume: (v: number) => proceduralAudio.setVolume(v),
    setEnabled: (on: boolean) => proceduralAudio.setEnabled(on),
  };
}