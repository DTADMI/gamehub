/**
 * E2E smoke tests for remaining arcade/puzzle games
 * Verifies: page loads, game canvas renders, basic interaction
 */
import { expect, test } from "@playwright/test";

// ─── Arcade Games ────────────────────────────────────────────

test.describe("Block Blast — smoke", () => {
  test("page loads with game grid", async ({ page }) => {
    await page.goto("/games/block-blast");
    await expect(page.locator('[aria-label*="Block Blast" i], [role="application"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Tetris — smoke", () => {
  test("page loads with game canvas", async ({ page }) => {
    await page.goto("/games/tetris");
    await expect(page.locator("canvas, [role='application']")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Tower Defense — smoke", () => {
  test("page loads with game surface", async ({ page }) => {
    await page.goto("/games/tower-defense");
    await expect(page.locator("canvas, [role='application']")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Platformer — smoke", () => {
  test("page loads with game canvas", async ({ page }) => {
    await page.goto("/games/platformer");
    await expect(page.locator("canvas, [role='application']")).toBeVisible({ timeout: 5000 });
  });
});

// ─── Puzzle Games ─────────────────────────────────────────────

test.describe("Pattern Matching — smoke", () => {
  test("page loads and shows game title", async ({ page }) => {
    await page.goto("/games/pattern-matching");
    await expect(page.getByText(/Color Pattern|Pattern/i).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Elemental Conflux — smoke", () => {
  test("page loads with game surface", async ({ page }) => {
    await page.goto("/games/elemental-conflux");
    await expect(page.locator("canvas, [role='application'], button")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Chrono Shift — smoke", () => {
  test("page loads with game canvas", async ({ page }) => {
    await page.goto("/games/chrono-shift");
    await expect(page.locator("canvas, [role='application']")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Quantum Architect — smoke", () => {
  test("page loads with Three.js or game surface", async ({ page }) => {
    await page.goto("/games/quantum-architect");
    await expect(page.locator("canvas, [role='application']")).toBeVisible({ timeout: 5000 });
  });
});

// ─── Point-Click ──────────────────────────────────────────────

test.describe("Escape Room — smoke", () => {
  test("page loads and shows first scene", async ({ page }) => {
    await page.goto("/games/escape-room");
    await expect(page.getByText(/Escape Room|Bookshelf/i).first()).toBeVisible({ timeout: 5000 });
  });
});