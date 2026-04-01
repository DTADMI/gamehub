import { expect, test } from "@playwright/test";

test("theme toggle flips html class between dark and light", async ({ page }) => {
  await page.goto("/");

  const html = page.locator("html");
  const toggle = page.getByRole("banner").getByRole("button", { name: "Toggle theme" });

  const beforeDark = await html.evaluate((el) => el.classList.contains("dark"));
  const beforeLight = await html.evaluate((el) => el.classList.contains("light"));

  await toggle.click();

  await expect
    .poll(async () => {
      const afterDark = await html.evaluate((el) => el.classList.contains("dark"));
      const afterLight = await html.evaluate((el) => el.classList.contains("light"));
      return { afterDark, afterLight };
    })
    .toEqual({
      afterDark: !beforeDark,
      afterLight: !beforeLight,
    });
});
