/**
 * E2E smoke tests for point-and-click games
 * Verifies: page load, title, scene navigation
 */
import { expect, test } from "@playwright/test";

test.describe("Mystery Manor — smoke", () => {
  test("page loads and navigates", async ({ page }) => {
    await page.goto("/games/mystery-manor");
    await expect(page.getByText(/Blackwood Manor|Manoir Blackwood/i)).toBeVisible({ timeout: 5000 });
    // Navigate to Kitchen
    await page.getByText(/Search the Kitchen|Fouiller la Cuisine/i).click();
    await expect(page.getByText(/The Kitchen|La Cuisine/i)).toBeVisible();
    // Back to Hall
    await page.getByText(/Back to Hall|Retour au Hall/i).click();
    await expect(page.getByText(/Blackwood Manor|Manoir Blackwood/i)).toBeVisible();
  });
});

test.describe("Artifact Hunter — smoke", () => {
  test("page loads and navigates", async ({ page }) => {
    await page.goto("/games/artifact-hunter");
    await expect(page.getByText(/Temple of Amun-Ra|Temple d'Amon-Rê/i)).toBeVisible({ timeout: 5000 });
    // Navigate to Hieroglyph Chamber
    await page.getByText(/Hieroglyph Chamber|Chambre des Hiéroglyphes/i).click();
    await expect(page.getByText(/ANKH|ÂNKH/i)).toBeVisible();
    // Back
    await page.getByText(/Back|Retour/i).click();
    await expect(page.getByText(/Temple of Amun-Ra|Temple d'Amon-Rê/i)).toBeVisible();
  });
});

test.describe("Clockwork Conspiracy — smoke", () => {
  test("page loads and navigates", async ({ page }) => {
    await page.goto("/games/clockwork-conspiracy");
    await expect(page.getByText(/Clockwork Tower|La Tour Mécanique/i)).toBeVisible({ timeout: 5000 });
    // Navigate to Gear Room
    await page.getByText(/Gear Room|Salle des Engrenages/i).click();
    await expect(page.getByText(/Input gear|L'engrenage A/i)).toBeVisible();
    // Back
    await page.getByText(/Back|Retour/i).click();
    await expect(page.getByText(/Clockwork Tower|La Tour Mécanique/i)).toBeVisible();
  });
});