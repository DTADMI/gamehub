import { expect, test } from "@playwright/test";

test.describe("Leaderboard auth gating", () => {
  test("guest sees auth CTA on leaderboard", async ({ page }) => {
    await page.goto("/leaderboard");

    const ctaCard = page.locator("section, main, body").getByText("Unlock Leaderboards").first();
    await expect(ctaCard).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Create account", exact: true }).first()).toBeVisible();
  });
});
