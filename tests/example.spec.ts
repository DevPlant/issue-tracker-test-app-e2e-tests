// ABOUTME: Smoke test that verifies the auth setup works correctly.
// ABOUTME: Confirms an authenticated user (Alice) is redirected to the projects page.

import { test, expect } from "./helpers/fixtures";

test("authenticated user sees the projects page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/projects/);
  await expect(page.getByTestId("projects-page")).toBeVisible();
});
