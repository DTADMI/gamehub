/**
 * T-3: Smoke test — Glyph Weaver launchpad.
 *
 * Verifies:
 *  - Game route renders without errors
 *  - Launchpad UI is visible (heading, loading state clears)
 *  - Feature list / description is present
 */
import { expect, test } from "@playwright/test";

test.describe("Glyph Weaver — smoke", () => {
  test("launchpad renders with heading and feature list", async ({ page }) => {
    await page.goto("/games/glyph-weaver");

    // Should show heading
    await expect(
      page.getByRole("heading", { name: /Glyph Weaver/i })
    ).toBeVisible({ timeout: 20000 });

    // GameShell container should be present
    await expect(page.getByLabel("Glyph Weaver — Spell Crafting Studio")).toBeVisible();

    // Tips text should be visible
    await expect(
      page.getByText(/Draw a glyph ring, then sigils inside it/i)
    ).toBeVisible();
  });
});