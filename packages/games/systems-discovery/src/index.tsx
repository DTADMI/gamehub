"use client";
import { Scene, SceneController } from "@games/pointclick-engine";
import { type SceneBgType, SceneBackground } from "@games/pointclick-engine";
import { useSceneAudio, useSoundEffects } from "@games/pointclick-engine";
import React from "react";

import { t, useI18n, getLocale } from "@/lib/i18n";

import { buildMainScenes } from "./scenes/scenes-main";
import { buildSpaceScenes } from "./scenes/scenes-space";
import { buildBodyBreathScenes } from "./scenes/scenes-body-breath";
import { buildBodyFuelScenes } from "./scenes/scenes-body-fuel";
import { buildBodyMoveScenes } from "./scenes/scenes-body-move";
import { buildBodySignalScenes } from "./scenes/scenes-body-signal";
import { buildBodyGrowScenes } from "./scenes/scenes-body-grow";
import { buildOceanScenes } from "./scenes/scenes-ocean";

// Scene definitions — extracted to per-chapter files in ./scenes/
// See scripts/split-systems-discovery.mjs for chapter grouping rules
const buildScenes = (): Scene[] => [
  ...buildMainScenes(),
  ...buildSpaceScenes(),
  ...buildBodyBreathScenes(),
  ...buildBodyFuelScenes(),
  ...buildBodyMoveScenes(),
  ...buildBodySignalScenes(),
  ...buildBodyGrowScenes(),
  ...buildOceanScenes(),
];


export function SystemsDiscoveryGame() {
  const sfx = useSoundEffects();
  const { locale } = useI18n();

  // Re-evaluate scenes when locale changes (avoids stale t() at module scope)
  const scenes = React.useMemo(() => buildScenes(), [locale]);

  // Scene ID to ambient audio mapping
  const ambientMap: Record<string, "body" | "space" | "ocean" | "thinking"> = {
    B: "body",
    BB: "body",
    BF: "body",
    BM: "body",
    BSD: "body",
    BG: "body",
    BOD: "body",
    SD_BOD: "body",
    S: "space",
    SD_SPACE: "space",
    SPACE: "space",
    O: "ocean",
    SD_OCEAN: "ocean",
    OCEAN: "ocean",
    WRAP: "thinking",
    SD_INTRO: "thinking",
    SD_OUTRO: "thinking",
  };

  let initialScene: string = "SD_INTRO";
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const pack = params.get("pack");
    switch (pack) {
      case "breath":
        initialScene = "SD_BOD_BREATH_INTRO";
        break;
      case "fuel":
        initialScene = "SD_BOD_FUEL_INTRO";
        break;
      case "move":
        initialScene = "SD_BOD_MOVE_INTRO";
        break;
      case "signal":
        initialScene = "SD_BOD_SIGNAL_INTRO";
        break;
      case "grow":
        initialScene = "SD_BOD_GROW_INTRO";
        break;
      case "space":
        initialScene = "SD_SPACE_INTRO";
        break;
      case "ocean":
        initialScene = "SD_OCEAN_INTRO";
        break;
    }
  }

  // Determine background type from initial scene
  const bgType: SceneBgType = initialScene.startsWith("SD_SPACE") || initialScene.startsWith("S")
    ? "space"
    : initialScene.startsWith("SD_OCEAN") || initialScene.startsWith("O")
      ? "ocean"
      : initialScene.startsWith("SD_BOD") || initialScene.startsWith("B")
        ? "body"
        : "default";

  const initial = {
    scene: initialScene,
    flags: {
      "bod.meter": 60,
      "bod.toggles.deeper": false,
    },
    inventory: [] as string[],
  };
  return (
    <SceneBackground type={bgType} animate>
      <SceneController scenes={scenes} initial={initial} saveKey="sysdisc:save:v1" />
    </SceneBackground>
  );
}

export default SystemsDiscoveryGame;
