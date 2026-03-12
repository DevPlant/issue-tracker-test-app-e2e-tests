// ABOUTME: Playwright global setup that logs in as each test account and saves session state.
// ABOUTME: Runs as a dependency project so all tests start with authenticated sessions.

import { test as setup } from "@playwright/test";
import { TEST_ACCOUNTS, TestAccountKey } from "./helpers/constants";

for (const [key, account] of Object.entries(TEST_ACCOUNTS)) {
  setup(`authenticate as ${key}`, async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.getByTestId("login-email-input").fill(account.email);
    await page.getByTestId("login-password-input").fill(account.password);

    await page.getByTestId("login-submit-button").click();

    await page.waitForURL("**/projects", { timeout: 15_000 });

    await page.context().storageState({ path: account.storageStatePath });
  });
}
