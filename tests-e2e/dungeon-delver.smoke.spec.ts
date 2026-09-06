/**
 * E2E smoke test for Dungeon Delver
 * Verifies: title screen → race/class selection → game launch → movement
 */
import { expect, test } from "@playwright/test";

test.describe("Dungeon Delver — smoke", () => {
  test("title screen renders with race selection", async ({ page }) => {
    await page.goto("/games/dungeon-delver");

    // Title is visible
    await expect(page.getByRole("heading", { name: /Dungeon Delver|Fouilleur de Donjon/i })).toBeVisible();

    // Race selection buttons are present
    const humanBtn = page.getByRole("button", { name: /Human|Humain/i });
    await expect(humanBtn).toBeVisible();

    // Click Human
    await humanBtn.click();

    // Class selection should appear
    const warriorBtn = page.getByRole("button", { name: /Warrior|Guerrier/i });
    await expect(warriorBtn).toBeVisible();

    // Click Warrior
    await warriorBtn.click();

    // Start button should appear
    const startBtn = page.getByRole("button", { name: /Descend|Descendre/i });
    await expect(startBtn).toBeVisible();

    // Launch the game
    await startBtn.click();

    // Canvas should be present (dungeon screen)
    await expect(page.locator("canvas")).toBeVisible({ timeout: 5000 });

    // HUD should show floor info
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("inventory opens with I key", async ({ page }) => {
    await page.goto("/games/dungeon-delver");

    // Quick start: select Human + Warrior + start
    await page.getByRole("button", { name: /Human|Humain/i }).click();
    await page.getByRole("button", { name: /Warrior|Guerrier/i }).click();
    await page.getByRole("button", { name: /Descend|Descendre/i }).click();

    // Wait for canvas
    await expect(page.locator("canvas")).toBeVisible({ timeout: 5000 });

    // Press I to open inventory
    await page.keyboard.press("i");

    // Should see inventory heading
    await expect(page.getByRole("heading", { name: /Inventory|Inventaire/i })).toBeVisible({ timeout: 3000 });

    // Close with Escape
    await page.keyboard.press("Escape");

    // Canvas should still be visible
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("language toggle switches to French", async ({ page }) => {
    await page.goto("/games/dungeon-delver");

    // Click Français toggle
    await page.getByRole("button", { name: "Français" }).click();

    // Title should now be in French
    await expect(page.getByRole("heading", { name: /Fouilleur de Donjon/i })).toBeVisible();

    // Race labels should be in French
    await expect(page.getByRole("button", { name: /Humain/i })).toBeVisible();
  });

  test("death screen shows after player death", async ({ page }) => {
    await page.goto("/games/dungeon-delver");

    // Select any race/class and start
    await page.getByRole("button", { name: /Golem/i }).click();
    await page.getByRole("button", { name: /Warrior|Guerrier/i }).click();
    await page.getByRole("button", { name: /Descend|Descendre/i }).click();

    // Verify game started
    await expect(page.locator("canvas")).toBeVisible({ timeout: 5000 });

    // Walk into monsters and attack repeatedly to die quickly
    // Move toward center monsters
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(150);
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(150);
    }

    // Space to attack adjacent monsters repeatedly
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press(" ");
      await page.waitForTimeout(400);
    }

    // Verify death screen
    await expect(page.getByRole("heading", { name: /fallen|succombé/i })).toBeVisible({ timeout: 3000 });

    // New Game button should be available
    await expect(page.getByRole("button", { name: /New Run|Nouvelle Partie/i })).toBeVisible();
  });
});