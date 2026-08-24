/**
 * T-3: Smoke test — Spell Craft drawing game.
 *
 * Verifies:
 *  - Game route renders without errors
 *  - Canvas element is present and interactive
 *  - Clear Canvas button works
 *  - Drawing produces spell result UI
 */
import { expect, test } from "@playwright/test";

test.describe("Spell Craft — smoke", () => {
  test("page renders with canvas and interactive drawing", async ({ page }) => {
    await page.goto("/games/spell-craft");

    // Heading should be visible
    await expect(
      page.getByRole("heading", { name: /Spell Craft/i })
    ).toBeVisible({ timeout: 20000 });

    // Canvas element should be present
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();

    // Clear Canvas button should be present
    const clearButton = page.getByRole("button", { name: /Clear Canvas/i });
    await expect(clearButton).toBeVisible();

    // Tips text should be visible
    await expect(
      page.getByText(/Draw a ring, then a sigil inside it/i)
    ).toBeVisible();
  });

  test("drawing on canvas triggers spell analysis message", async ({ page }) => {
    await page.goto("/games/spell-craft");

    const canvas = page.locator("canvas").last();
    await expect(canvas).toBeVisible();

    // Simulate a simple drawing gesture on the canvas
    const box = await canvas.boundingBox();
    if (!box) {
      throw new Error("Canvas bounding box not found");
    }

    // Draw a rough ring shape to trigger spell analysis
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const r = 80;

    // Pointer events: draw a circle
    await page.mouse.move(cx + r, cy);
    await page.mouse.down();
    // Draw arc segments around the circle
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.3) {
      await page.mouse.move(
        cx + r * Math.cos(angle),
        cy + r * Math.sin(angle),
        { steps: 3 }
      );
    }
    // Close near the starting point
    await page.mouse.move(cx + r, cy, { steps: 5 });
    await page.mouse.up();

    // After drawing, a spell result message should appear
    // (message changes from the default "Draw a ring" to element-specific text)
    await expect(
      page.getByText(/(?:fire|water|wind|earth|light|magic flows|magic surges|magic swirls|magic solidifies|magic shines)/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("Clear Canvas resets the drawing", async ({ page }) => {
    await page.goto("/games/spell-craft");

    // Draw something first
    const canvas = page.locator("canvas").last();
    const box = await canvas.boundingBox();
    if (!box) {
      throw new Error("Canvas bounding box not found");
    }
    await page.mouse.move(box.x + 100, box.y + 200);
    await page.mouse.down();
    await page.mouse.move(box.x + 300, box.y + 200, { steps: 10 });
    await page.mouse.up();

    // Click Clear Canvas
    await page.getByRole("button", { name: /Clear Canvas/i }).click();

    // The default message should reappear
    await expect(
      page.getByText("Draw a ring, then a sigil inside it")
    ).toBeVisible();
  });
});