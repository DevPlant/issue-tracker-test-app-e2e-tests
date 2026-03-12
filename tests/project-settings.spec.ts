// ABOUTME: Tests for the project settings page: viewing, editing, members, and deletion.
// ABOUTME: Covers project details display, name/description editing, member management, and project deletion.

import { test, expect } from "./helpers/fixtures";
import { TEST_ACCOUNTS } from "./helpers/constants";
import { addProjectMember, createProject, deleteProject } from "./helpers/api";

test.describe("Project Settings", () => {
  test("settings page shows current project details", async ({
    page,
    testProject,
  }) => {
    await page.goto(`/projects/${testProject.key}/settings`);
    await expect(page.getByTestId("settings-page")).toBeVisible();

    await expect(page.getByTestId("settings-name-input")).toHaveValue(
      testProject.name
    );
    await expect(page.getByTestId("settings-key-input")).toHaveValue(
      testProject.key
    );
  });

  test("edit project name and description", async ({
    page,
    testProject,
  }) => {
    const newName = `Renamed Project ${Date.now()}`;
    const newDescription = `A fresh description ${Date.now()}`;

    await page.goto(`/projects/${testProject.key}/settings`);
    await expect(page.getByTestId("settings-page")).toBeVisible();

    await page.getByTestId("settings-name-input").clear();
    await page.getByTestId("settings-name-input").fill(newName);
    await page.getByTestId("settings-description-input").fill(newDescription);
    await page.getByTestId("settings-save-button").click();

    // Wait for save to reflect in the breadcrumb before reloading
    await expect(page.getByTestId("breadcrumb-project-name")).toHaveText(newName);

    await page.reload();
    await expect(page.getByTestId("settings-page")).toBeVisible();

    await expect(page.getByTestId("settings-name-input")).toHaveValue(newName);
    await expect(page.getByTestId("settings-description-input")).toHaveValue(
      newDescription
    );
  });

  test("project key is read-only", async ({ page, testProject }) => {
    await page.goto(`/projects/${testProject.key}/settings`);
    await expect(page.getByTestId("settings-page")).toBeVisible();

    await expect(page.getByTestId("settings-key-input")).toBeDisabled();
  });

  test("add member to project", async ({ page, testProject }) => {
    await page.goto(`/projects/${testProject.key}/settings`);
    await expect(page.getByTestId("settings-page")).toBeVisible();

    await page
      .getByTestId("settings-member-email-input")
      .fill(TEST_ACCOUNTS.bob.email);
    await page.getByTestId("settings-add-member-button").click();

    await expect(
      page.getByTestId("settings-page").getByText(TEST_ACCOUNTS.bob.email)
    ).toBeVisible();
  });

  test("remove member from project", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    await addProjectMember(
      aliceApi,
      testProject.id,
      TEST_ACCOUNTS.bob.email
    );

    await page.goto(`/projects/${testProject.key}/settings`);
    await expect(page.getByTestId("settings-page")).toBeVisible();

    // Find the row containing Bob and click its remove button
    const bobRow = page
      .locator("[data-testid^='member-row-']")
      .filter({ hasText: TEST_ACCOUNTS.bob.displayName });
    await expect(bobRow).toBeVisible();

    const removeButton = bobRow.locator("[data-testid^='remove-member-']");
    await removeButton.click();

    await expect(bobRow).toBeHidden();
  });

  test("delete project", async ({ page, aliceApi }) => {
    const key =
      "DL" +
      Array.from({ length: 2 }, () =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]
      ).join("");
    const name = `Delete Me ${Date.now()}`;

    const project = await createProject(aliceApi, { name, key });

    await page.goto(`/projects/${project.key}/settings`);
    await expect(page.getByTestId("settings-page")).toBeVisible();

    await page.getByTestId("settings-delete-button").click();
    await page.getByTestId("confirm-delete-button").click();

    await page.waitForURL("**/projects");
    await expect(page.getByTestId("projects-page")).toBeVisible();
    await expect(page.getByTestId(`project-card-${key}`)).toBeHidden();
  });
});
