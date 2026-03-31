import { describe, expect, it } from "vitest";

import { nextScene, type Scene } from "@games/pointclick-engine/engine";

describe("pointclick engine transitions", () => {
  const scenes: Record<string, Scene> = {
    intro: {
      id: "intro",
      title: { en: "Intro", fr: "Introduction" },
      choices: [{ id: "go", text: { en: "Go", fr: "Aller" }, target: "end" }],
    },
    end: { id: "end", title: { en: "End", fr: "Fin" } },
  };

  it("moves to target scene for a valid choice", () => {
    const result = nextScene("intro", scenes, "go");
    expect(result.sceneId).toBe("end");
  });

  it("keeps current scene when choice is unknown", () => {
    const result = nextScene("intro", scenes, "missing");
    expect(result.sceneId).toBe("intro");
  });
});
