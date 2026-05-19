import { beforeEach, describe, expect, it } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { SystemsDiscoveryGame } from "@games/systems-discovery";

describe("Systems Discovery — BOD defaults persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes bod.meter=60 and bod.toggles.deeper=false and persists", async () => {
    render(<SystemsDiscoveryGame />);
    const raw = localStorage.getItem("sysdisc:save:v1");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.ctx.flags["bod.meter"]).toBe(60);
    expect(parsed.ctx.flags["bod.toggles.deeper"]).toBe(false);
  });

  it("loads the same defaults on remount", async () => {
    localStorage.setItem(
      "sysdisc:save:v1",
      JSON.stringify({
        sceneId: "SD_INTRO",
        ctx: { flags: { "bod.meter": 60, "bod.toggles.deeper": false }, inventory: [] },
        v: 1,
      }),
    );
    render(<SystemsDiscoveryGame />);
    const raw = localStorage.getItem("sysdisc:save:v1");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.ctx.flags["bod.meter"]).toBe(60);
    expect(parsed.ctx.flags["bod.toggles.deeper"]).toBe(false);
  });
});
