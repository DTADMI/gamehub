import { expect, test } from "@playwright/test";

test.describe("Admin flags controls", () => {
  test("admin can access flags page and toggle non-sensitive flag", async ({ page }) => {
    await page.goto("/admin/flags?e2e_admin=1");
    await expect(page.getByRole("heading", { name: "Feature Flags" })).toBeVisible();
    await expect(page.getByText("Role: owner")).toBeVisible();

    const target = page.getByLabel("Enhanced game cards");
    await expect(target).toBeVisible();
    await expect(target).toBeEnabled();
    const initial = await target.getAttribute("aria-checked");
    await target.click();
    await expect(target).toHaveAttribute("aria-checked", initial === "true" ? "false" : "true");
  });
});
