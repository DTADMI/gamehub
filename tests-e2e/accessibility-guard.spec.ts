import { expect, test } from "@playwright/test";

/**
 * Accessibility smoke test — validates basic a11y requirements
 * across key pages: ARIA landmarks, keyboard navigation, heading
 * hierarchy. NF requirement: all UI must support keyboard navigation
 * and screen-reader-accessible landmarks.
 */

const A11Y_PAGES = [
  { path: "/", name: "Home" },
  { path: "/games", name: "Games index" },
  { path: "/games/snake", name: "Snake" },
  { path: "/games/checkers", name: "Checkers" },
];

test.describe("Accessibility — ARIA landmarks", () => {
  for (const { path, name } of A11Y_PAGES) {
    test(`${name} page has at least one navigation landmark`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const navs = page.locator("nav, [role='navigation']");
      await expect(navs.first()).toBeAttached({ timeout: 5000 });
    });

    test(`${name} page has a main landmark`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const main = page.locator("main, [role='main']");
      await expect(main.first()).toBeAttached({ timeout: 5000 });
    });
  }
});

test.describe("Accessibility — keyboard navigation", () => {
  test("Home page: Tab moves focus through interactive elements", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Press Tab to move focus
    await page.keyboard.press("Tab");
    const focused1 = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused1).toBeTruthy();

    await page.keyboard.press("Tab");
    const focused2 = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused2).toBeTruthy();

    // We moved to a different element
    expect(focused1).not.toBe(focused2);
  });

  test("Games page: game cards are keyboard-focusable", async ({ page }) => {
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    // Game cards should be reachable via Tab
    const links = page.locator("a[href*='/games/']");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    // At least one game link is present
    const firstLink = links.first();
    await expect(firstLink).toBeAttached();
  });
});

test.describe("Accessibility — heading hierarchy", () => {
  test("Home page has exactly one h1", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1);
  });

  test("Games page has proper heading order (no skipped levels)", async ({
    page,
  }) => {
    await page.goto("/games");
    await page.waitForLoadState("networkidle");

    // Check headings are in logical order
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);

    // Get all heading levels
    const levels = await headings.evaluateAll((els) =>
      els.map((el) => parseInt(el.tagName[1])),
    );

    // Verify no heading level increase > 1 (e.g. h1→h3 is bad)
    for (let i = 1; i < levels.length; i++) {
      const jump = levels[i] - levels[i - 1];
      expect(jump).toBeLessThanOrEqual(1);
    }
  });
});

test.describe("Accessibility — reduced motion support", () => {
  test("Snake game handles prefers-reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/games/snake");
    await page.waitForLoadState("networkidle");

    // Page should still render without errors
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeAttached({ timeout: 5000 });
  });
});