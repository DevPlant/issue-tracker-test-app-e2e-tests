// ABOUTME: Placeholder test that verifies the app's login page loads correctly.
// ABOUTME: Confirms the Playwright setup is working end-to-end.

import { test, expect } from "@playwright/test";

test("login page loads and shows sign-in form", async ({ page }) => {
  await page.goto("/login");

  const form = page.locator("form");
  await expect(form).toBeVisible();

  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});
