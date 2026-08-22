import { describe, expect, it, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { SubscriptionProvider, useSubscription } from "@gamehub/game-platform/contexts/SubscriptionContext";

vi.mock("@gamehub/game-platform/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "u1", email: "me@example.com" } }),
}));

function Probe() {
  const { loading, subscription, entitlements } = useSubscription();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="plan">{subscription?.plan || "NONE"}</div>
      <div data-testid="adv">{String(entitlements.advancedLeaderboards)}</div>
    </div>
  );
}

describe("SubscriptionContext", () => {
  it("defaults to FREE tier without premium entitlements", () => {
    render(
      <SubscriptionProvider>
        <Probe />
      </SubscriptionProvider>,
    );

    // Since we're not fetching from any backend, it defaults to FREE
    const planEl = document.querySelector("[data-testid='plan']");
    expect(planEl?.textContent).toBe("FREE");

    const advEl = document.querySelector("[data-testid='adv']");
    expect(advEl?.textContent).toBe("false");
  });
});