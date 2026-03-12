// ABOUTME: Tests for admin panel, board filters, and user profile functionality.
// ABOUTME: Covers admin user management, bulk role changes, board filtering, profile editing, and password changes.

import { test, expect } from "./helpers/fixtures";
import { TEST_ACCOUNTS, API_BASE } from "./helpers/constants";
import { createTask, addProjectMember } from "./helpers/api";

test.describe("Admin Panel", () => {
  test("admin sees user list, non-admin is blocked", async ({
    page,
    browser,
  }) => {
    const adminContext = await browser.newContext({
      storageState: TEST_ACCOUNTS.admin.storageStatePath,
    });
    const adminPage = await adminContext.newPage();

    await adminPage.goto("/admin/users");
    await expect(adminPage.getByTestId("admin-users-page")).toBeVisible();
    await expect(adminPage.getByTestId("admin-user-list")).toBeVisible();

    // Admin should see the Users nav link in sidebar
    await expect(adminPage.getByTestId("sidebar-nav-users")).toBeVisible();

    // Alice (default auth, non-admin) should not see admin page
    await page.goto("/admin/users");
    await expect(page.getByTestId("admin-users-page")).toBeHidden();

    // Alice should not have the Users nav link
    await expect(page.getByTestId("sidebar-nav-users")).toBeHidden();

    await adminContext.close();
  });

  test("admin changes a user's role", async ({ browser }) => {
    const adminContext = await browser.newContext({
      storageState: TEST_ACCOUNTS.admin.storageStatePath,
    });
    const adminPage = await adminContext.newPage();

    await adminPage.goto("/admin/users");
    await expect(adminPage.getByTestId("admin-users-page")).toBeVisible();

    // Find Alice's row by her email
    const aliceRow = adminPage
      .getByTestId("admin-user-list")
      .locator("tr")
      .filter({ hasText: TEST_ACCOUNTS.alice.email });

    await expect(aliceRow).toBeVisible();

    // Find the role dropdown within Alice's row
    const roleSelect = aliceRow.locator("[data-testid^='admin-role-select-']");
    await expect(roleSelect).toBeVisible();

    // Read current role text to know what we're changing from
    const currentRoleText = await roleSelect.textContent();
    const isCurrentlyUser = /user/i.test(currentRoleText ?? "");

    // Change role: if currently user -> admin, if admin -> user
    await roleSelect.click();
    if (isCurrentlyUser) {
      await adminPage.getByRole("option", { name: /admin/i }).click();
    } else {
      await adminPage.getByRole("option", { name: /user/i }).click();
    }

    // Verify the role changed
    if (isCurrentlyUser) {
      await expect(roleSelect).toHaveText(/admin/i);
    } else {
      await expect(roleSelect).toHaveText(/user/i);
    }

    // Revert the role back
    await roleSelect.click();
    if (isCurrentlyUser) {
      await adminPage.getByRole("option", { name: /user/i }).click();
      await expect(roleSelect).toHaveText(/user/i);
    } else {
      await adminPage.getByRole("option", { name: /admin/i }).click();
      await expect(roleSelect).toHaveText(/admin/i);
    }

    await adminContext.close();
  });

  test("bulk role change with confirmation", async ({ browser }) => {
    const adminContext = await browser.newContext({
      storageState: TEST_ACCOUNTS.admin.storageStatePath,
    });
    const adminPage = await adminContext.newPage();

    await adminPage.goto("/admin/users");
    await expect(adminPage.getByTestId("admin-users-page")).toBeVisible();

    const userList = adminPage.getByTestId("admin-user-list");

    // Find Alice's and Bob's rows and their checkboxes
    const aliceRow = userList
      .locator("tr")
      .filter({ hasText: TEST_ACCOUNTS.alice.email });
    const bobRow = userList
      .locator("tr")
      .filter({ hasText: TEST_ACCOUNTS.bob.email });

    const aliceCheckbox = aliceRow.locator("[data-testid^='bulk-select-']");
    const bobCheckbox = bobRow.locator("[data-testid^='bulk-select-']");

    // Select both users
    await aliceCheckbox.click();
    await bobCheckbox.click();

    // Verify bulk action bar appears with selection count
    await expect(adminPage.getByTestId("bulk-action-bar")).toBeVisible();
    await expect(adminPage.getByTestId("bulk-selection-count")).toContainText(
      "2"
    );

    // Use bulk role select to change role to admin
    await adminPage.getByTestId("bulk-role-select").click();
    await adminPage.getByRole("option", { name: /admin/i }).click();

    // Confirm the bulk action
    await adminPage.getByTestId("bulk-confirm-action").click();

    // Verify roles changed - both should now show admin
    const aliceRoleSelect = aliceRow.locator(
      "[data-testid^='admin-role-select-']"
    );
    const bobRoleSelect = bobRow.locator(
      "[data-testid^='admin-role-select-']"
    );
    await expect(aliceRoleSelect).toHaveText(/admin/i);
    await expect(bobRoleSelect).toHaveText(/admin/i);

    // Revert: select both again and set back to user
    await aliceCheckbox.click();
    await bobCheckbox.click();
    await expect(adminPage.getByTestId("bulk-action-bar")).toBeVisible();

    await adminPage.getByTestId("bulk-role-select").click();
    await adminPage.getByRole("option", { name: /user/i }).click();
    await adminPage.getByTestId("bulk-confirm-action").click();

    // Verify reverted
    await expect(aliceRoleSelect).toHaveText(/user/i);
    await expect(bobRoleSelect).toHaveText(/user/i);

    await adminContext.close();
  });
});

test.describe("Board Filters", () => {
  test("filter tasks by search, assignee, and priority", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    // Add Bob as a project member
    await addProjectMember(
      aliceApi,
      testProject.id,
      TEST_ACCOUNTS.bob.email
    );

    // Get member list to find user IDs for assignee
    const membersResponse = await aliceApi.get(
      `${API_BASE}/projects/${testProject.id}/members`
    );
    const members = await membersResponse.json();
    const alice = members.find(
      (m: { email: string }) => m.email === TEST_ACCOUNTS.alice.email
    );
    const bob = members.find(
      (m: { email: string }) => m.email === TEST_ACCOUNTS.bob.email
    );

    // Create 3 tasks with different properties
    const taskAlpha = await createTask(aliceApi, testProject.id, {
      title: `Alpha ${Date.now()}`,
      priority: "high",
      assigneeId: alice.userId ?? alice.id,
    });
    const taskBeta = await createTask(aliceApi, testProject.id, {
      title: `Beta ${Date.now()}`,
      priority: "low",
      assigneeId: bob.userId ?? bob.id,
    });
    const taskGamma = await createTask(aliceApi, testProject.id, {
      title: `Gamma ${Date.now()}`,
      priority: "medium",
    });

    await page.goto(`/projects/${testProject.key}/board`);
    await expect(page.getByTestId("kanban-board")).toBeVisible();

    // Verify all 3 tasks visible
    await expect(
      page.getByTestId(`task-card-${taskAlpha.taskKey}`)
    ).toBeVisible();
    await expect(
      page.getByTestId(`task-card-${taskBeta.taskKey}`)
    ).toBeVisible();
    await expect(
      page.getByTestId(`task-card-${taskGamma.taskKey}`)
    ).toBeVisible();

    // Filter by search: type "Alpha"
    await page.getByTestId("filter-search").fill("Alpha");
    await expect(
      page.getByTestId(`task-card-${taskAlpha.taskKey}`)
    ).toBeVisible();
    await expect(
      page.getByTestId(`task-card-${taskBeta.taskKey}`)
    ).toBeHidden();
    await expect(
      page.getByTestId(`task-card-${taskGamma.taskKey}`)
    ).toBeHidden();

    // Clear search
    await page.getByTestId("filter-search").clear();

    // Filter by assignee: select Bob
    await page.getByTestId("filter-assignee").click();
    await page.getByRole("option", { name: /bob/i }).click();
    await expect(
      page.getByTestId(`task-card-${taskBeta.taskKey}`)
    ).toBeVisible();
    await expect(
      page.getByTestId(`task-card-${taskAlpha.taskKey}`)
    ).toBeHidden();
    await expect(
      page.getByTestId(`task-card-${taskGamma.taskKey}`)
    ).toBeHidden();

    // Clear filters
    await page.getByTestId("filter-clear").click();

    // Filter by priority: select High
    await page.getByTestId("filter-priority").click();
    await page.getByRole("option", { name: /high/i }).click();
    await expect(
      page.getByTestId(`task-card-${taskAlpha.taskKey}`)
    ).toBeVisible();
    await expect(
      page.getByTestId(`task-card-${taskBeta.taskKey}`)
    ).toBeHidden();
    await expect(
      page.getByTestId(`task-card-${taskGamma.taskKey}`)
    ).toBeHidden();

    // Clear all filters
    await page.getByTestId("filter-clear").click();

    // Verify all 3 tasks visible again
    await expect(
      page.getByTestId(`task-card-${taskAlpha.taskKey}`)
    ).toBeVisible();
    await expect(
      page.getByTestId(`task-card-${taskBeta.taskKey}`)
    ).toBeVisible();
    await expect(
      page.getByTestId(`task-card-${taskGamma.taskKey}`)
    ).toBeVisible();
  });
});

test.describe("Profile", () => {
  test("edit profile display name", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByTestId("profile-page")).toBeVisible();

    const nameInput = page.getByTestId("profile-name-input");
    const originalName = await nameInput.inputValue();
    const newName = `Test Name ${Date.now()}`;

    await nameInput.clear();
    await nameInput.fill(newName);
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/api/")),
      page.getByTestId("profile-save-button").click(),
    ]);

    // Reload and verify persistence
    await page.reload();
    await expect(page.getByTestId("profile-page")).toBeVisible();
    await expect(nameInput).toHaveValue(newName);

    // Revert name back to original
    await nameInput.clear();
    await nameInput.fill(originalName);
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/api/")),
      page.getByTestId("profile-save-button").click(),
    ]);

    // Verify revert
    await page.reload();
    await expect(page.getByTestId("profile-page")).toBeVisible();
    await expect(nameInput).toHaveValue(originalName);
  });

  test("change password with throwaway account", async ({ page }) => {
    // Clear cookies to start unauthenticated
    await page.context().clearCookies();

    const timestamp = Date.now();
    const email = `test-${timestamp}@e2e.test`;
    const name = `E2E User ${timestamp}`;
    const originalPassword = "testpass123";
    const newPassword = "newpass12345";

    // Register a new account
    await page.goto("/register");
    await expect(page.getByTestId("register-card")).toBeVisible();

    await page.getByTestId("register-name-input").fill(name);
    await page.getByTestId("register-email-input").fill(email);
    await page.getByTestId("register-password-input").fill(originalPassword);
    await page
      .getByTestId("register-confirm-password-input")
      .fill(originalPassword);
    await page.getByTestId("register-submit-button").click();

    // Verify redirect to /projects
    await page.waitForURL("**/projects", { timeout: 15_000 });

    // Navigate to profile security tab
    await page.goto("/profile");
    await expect(page.getByTestId("profile-page")).toBeVisible();

    await page.getByTestId("security-tab-trigger").click();
    await expect(page.getByTestId("security-tab-content")).toBeVisible();

    // Fill password change form
    await page.getByTestId("current-password-input").fill(originalPassword);
    await page.getByTestId("new-password-input").fill(newPassword);
    await page.getByTestId("confirm-password-input").fill(newPassword);
    await page.getByTestId("change-password-button").click();

    // Verify no error appears
    await expect(page.getByTestId("password-form-error")).toBeHidden();
  });
});
