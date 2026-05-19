import { beforeEach, describe, expect, it } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { RiteOfDiscoveryGame } from "@games/rite-of-discovery";

describe("RiteOfDiscovery gentle mode & save", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders initial scene and persists to localStorage", async () => {
    render(<RiteOfDiscoveryGame />);
    const raw = localStorage.getItem("rod:save:v1");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.v).toBe(1);
    expect(parsed.data.sceneId).toBe("INTRO");
    expect(parsed.data.ctx).toBeDefined();
  });

  it("loads saved scene on next mount", async () => {
    localStorage.setItem(
      "rod:save:v1",
      JSON.stringify({
        v: 1,
        data: { sceneId: "HALLWAY", ctx: { flags: {}, inventory: [] } },
      }),
    );
    render(<RiteOfDiscoveryGame />);
  });
});
