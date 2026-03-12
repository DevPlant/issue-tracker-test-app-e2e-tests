// ABOUTME: Smoke tests covering the six critical user journeys of the issue tracker app.
// ABOUTME: Each test is self-contained with its own data setup and cleanup.

import { test, expect } from "./helpers/fixtures";
import { TEST_ACCOUNTS } from "./helpers/constants";
import { createProject, createTask, deleteProject } from "./helpers/api";

test.describe("Smoke Tests", () => {
  test("login and view projects", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");

    await expect(page.getByTestId("login-card")).toBeVisible();

    await page
      .getByTestId("login-email-input")
      .fill(TEST_ACCOUNTS.alice.email);
    await page
      .getByTestId("login-password-input")
      .fill(TEST_ACCOUNTS.alice.password);
    await page.getByTestId("login-submit-button").click();

    await expect(page).toHaveURL(/\/projects/);
    await expect(page.getByTestId("projects-page")).toBeVisible();
  });

  test("create a project and verify it appears", async ({
    page,
    aliceApi,
  }) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const suffix = Array.from({ length: 3 }, () =>
      letters[Math.floor(Math.random() * letters.length)]
    ).join("");
    const projectName = `Smoke Project ${Date.now()}`;
    const projectKey = `S${suffix}`;
    let projectId: string | undefined;

    try {
      await page.goto("/projects");
      await expect(page.getByTestId("projects-page")).toBeVisible();

      await page.getByTestId("create-project-button").click();

      // The app opens a multi-step wizard dialog
      await expect(page.getByTestId("project-wizard-dialog")).toBeVisible();

      await page.getByTestId("wizard-name-input").fill(projectName);
      await page.getByTestId("wizard-key-input").clear();
      await page.getByTestId("wizard-key-input").fill(projectKey);

      // Step 1 -> Step 2 (Members)
      await page.getByTestId("wizard-next-button").click();

      // Step 2 -> Step 3 (Review)
      await page.getByTestId("wizard-next-button").click();

      // Submit from review step
      await page.getByTestId("wizard-create-button").click();

      // Verify the project card appears
      const projectCard = page.getByTestId(`project-card-${projectKey}`);
      await expect(projectCard).toBeVisible();

      // Get the project ID for cleanup
      const response = await aliceApi.get(`/api/v1/projects/${projectKey}`);
      const project = await response.json();
      projectId = project.id;
    } finally {
      if (projectId) {
        await deleteProject(aliceApi, projectId);
      }
    }
  });

  test("create a task on the Kanban board", async ({
    page,
    testProject,
  }) => {
    const taskTitle = `Smoke Task ${Date.now()}`;

    await page.goto(`/projects/${testProject.key}/board`);
    await expect(page.getByTestId("kanban-board")).toBeVisible();

    await page.getByTestId("column-add-task-todo").click();
    await expect(page.getByTestId("task-form-dialog")).toBeVisible();

    const titleInput = page.getByTestId("task-form-title-input");
    await titleInput.click();
    await titleInput.fill(taskTitle);
    await expect(titleInput).toHaveValue(taskTitle);

    await page.getByTestId("task-form-submit-button").click();

    // Wait for the dialog to close, confirming submission completed
    await expect(page.getByTestId("task-form-dialog")).toBeHidden();

    // The board may need a moment to refresh after task creation — reload to ensure
    await page.reload();
    await expect(page.getByTestId("kanban-board")).toBeVisible();

    // Verify the task card appears in the To Do column
    const todoColumn = page.getByTestId("board-column-todo");
    await expect(todoColumn.getByText(taskTitle)).toBeVisible();
  });

  test("view and edit a task", async ({ page, testProject, aliceApi }) => {
    const originalTitle = `Edit Me ${Date.now()}`;
    const updatedTitle = `Edited Title ${Date.now()}`;
    const task = await createTask(aliceApi, testProject.id, {
      title: originalTitle,
      status: "todo",
    });

    await page.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(page.getByTestId("task-page")).toBeVisible();

    // Edit title inline: click title, clear and type new text, press Enter
    await page.getByTestId("task-detail-title").click();
    const titleInput = page.getByTestId("task-detail-title-input");
    await expect(titleInput).toBeVisible();
    await titleInput.clear();
    await titleInput.fill(updatedTitle);
    await titleInput.press("Enter");

    // Verify title updated
    await expect(page.getByTestId("task-detail-title")).toHaveText(
      updatedTitle
    );

    // Change status via sidebar dropdown
    await page.getByTestId("task-detail-status-select").click();
    await page.getByRole("option", { name: /in progress/i }).click();

    // Verify status reflects the change
    await expect(page.getByTestId("task-detail-status-select")).toHaveText(
      /in progress/i
    );
  });

  test("add a comment to a task", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    const task = await createTask(aliceApi, testProject.id, {
      title: `Comment Test ${Date.now()}`,
      status: "todo",
    });
    const commentText = `Test comment ${Date.now()}`;

    await page.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(page.getByTestId("task-page")).toBeVisible();

    await page.getByTestId("comment-input").fill(commentText);
    await page.getByTestId("comment-submit-button").click();

    // Verify the comment appears in the thread
    const commentThread = page.getByTestId("comment-thread");
    await expect(commentThread.getByText(commentText)).toBeVisible();
  });

  test("search for a task and navigate to it", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    const distinctTitle = `UniqueSmoke ${Date.now()}`;
    const task = await createTask(aliceApi, testProject.id, {
      title: distinctTitle,
      status: "todo",
    });

    await page.goto("/projects");
    await expect(page.getByTestId("projects-page")).toBeVisible();

    // Open global search
    await page.getByTestId("global-search-trigger").click();
    await expect(page.getByTestId("global-search-input")).toBeVisible();

    // Type part of the task title
    await page.getByTestId("global-search-input").fill("UniqueSmoke");

    // Wait for the search result to appear (debounce is 300ms)
    const searchResult = page.getByTestId(`search-result-${task.taskKey}`);
    await expect(searchResult).toBeVisible();

    // Click the result
    await searchResult.click();

    // Verify navigation to the task detail page
    await expect(page).toHaveURL(
      new RegExp(`/projects/${testProject.key}/task/${task.taskKey}`)
    );
    await expect(page.getByTestId("task-page")).toBeVisible();
    await expect(page.getByTestId("task-detail-title")).toHaveText(
      distinctTitle
    );
  });
});
