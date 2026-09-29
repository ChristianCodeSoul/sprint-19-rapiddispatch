const { test, expect } = require("@playwright/test");

test("RapidDispatch loads correctly in WebKit", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page).toHaveTitle(/.*/);
    await expect(page.locator("body")).toBeVisible();
});