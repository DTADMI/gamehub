import { expect, test } from "@playwright/test";

/**
 * Responsive layout guard — validates no horizontal overflow at 320px
 * across key pages. NF-GATE requirement: all UI must remain usable
 * at 320px width minimum (AGENTS.md UI rule).
 */

const KEY_PAGES = [
  { path: "/", name: "Home" },
  { path: "/games", name: "Games index" },
  { path: "/games/snake", name: "Snake (arcade)" },
  { path: "/games/chess", name: "Chess (board)" },
  { path: "/games/knitzy", name: "Knitzy (React puzzle)" },
  { path: "/games/systems-discovery", name: "Systems Discovery (pointclick)" },
];

test.describe("Responsive — 320px guardrail", () => {
  for (const { path, name } of KEY_PAGES) {
    test(`${name} page has no horizontal overflow at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);

      // Wait for hydration
      await page.waitForLoadState("networkidle");

      // Check no horizontal scrollbar
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      const viewportWidth = await page.evaluate(
        () => window.innerWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);

      // Check body doesn't overflow
      const bodyWidth = await page.evaluate(
        () => document.body.scrollWidth,
      );
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
    });

    test(`${name} page has visible navigation at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      // At least one nav element should be visible
      const nav = page.locator("nav, [role='navigation']").first();
      await expect(nav).toBeVisible({ timeout: 5000 });
    });
  }
});

test.describe("Responsive — game canvas containment", () => {
  test("canvas games do not overflow viewport at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto("/games/snake");
    await page.waitForLoadState("networkidle");

    const canvas = page.locator("canvas").first();
    if (await canvas.isVisible()) {
      const box = await canvas.boundingBox();
      if (box) {
        expect(box.x + box.width).toBeLessThanOrEqual(325);
      }
    }
  });

  test("React games do not clip buttons at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/games/knitzy");
    await page.waitForLoadState("networkidle");

    // All buttons should be visible (not clipped)
    const buttons = page.locator("button");
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const box = await btn.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThan(0);
          expect(box.x + box.width).toBeLessThanOrEqual(330);
        }
      }
    }
  });

  test("pointclick game UI stays within viewport at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/games/systems-discovery");
    await page.waitForLoadState("networkidle");

    // Wait for the game to render
    await page.waitForTimeout(2000);

    // The game area should be visible
    const main = page.locator("main, [role='main'], .game-container").first();
    if (await main.isVisible()) {
      const box = await main.boundingBox();
      if (box) {
        expect(box.x + box.width).toBeLessThanOrEqual(325);
      }
    }
  });
});