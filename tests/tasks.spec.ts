// ABOUTME: Tests for task CRUD operations, status/priority/assignee changes, and list view sorting.
// ABOUTME: Covers board creation, inline editing, detail page fields, context menu delete, and table sorting.

import { test, expect } from "./helpers/fixtures";
import { TEST_ACCOUNTS } from "./helpers/constants";
import { createTask, addProjectMember } from "./helpers/api";

test.describe("Tasks", () => {
  test("create task from board", async ({ page, testProject }) => {
    const taskTitle = `Board Task ${Date.now()}`;

    await page.goto(`/projects/${testProject.key}/board`);
    await expect(page.getByTestId("kanban-board")).toBeVisible();

    await page.getByTestId("column-add-task-todo").click();
    await expect(page.getByTestId("task-form-dialog")).toBeVisible();

    await page.getByTestId("task-form-title-input").fill(taskTitle);
    await page.getByTestId("task-form-submit-button").click();

    await expect(page.getByTestId("task-form-dialog")).toBeHidden();

    await page.reload();
    await expect(page.getByTestId("kanban-board")).toBeVisible();

    const todoColumn = page.getByTestId("board-column-todo");
    await expect(todoColumn.getByText(taskTitle)).toBeVisible();
  });

  test("edit task title inline", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    const originalTitle = `Original Title ${Date.now()}`;
    const newTitle = `Updated Title ${Date.now()}`;
    const task = await createTask(aliceApi, testProject.id, {
      title: originalTitle,
    });

    await page.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(page.getByTestId("task-page")).toBeVisible();

    await page.getByTestId("task-detail-title").click();
    const titleInput = page.getByTestId("task-detail-title-input");
    await expect(titleInput).toBeVisible();
    await titleInput.clear();
    await titleInput.fill(newTitle);
    await titleInput.press("Enter");

    await expect(page.getByTestId("task-detail-title")).toHaveText(newTitle);

    await page.reload();
    await expect(page.getByTestId("task-page")).toBeVisible();
    await expect(page.getByTestId("task-detail-title")).toHaveText(newTitle);
  });

  test("edit task description with save and cancel", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    const task = await createTask(aliceApi, testProject.id, {
      title: `Desc Test ${Date.now()}`,
    });
    const savedDescription = `Saved description ${Date.now()}`;
    const cancelledDescription = `Cancelled description ${Date.now()}`;

    await page.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(page.getByTestId("task-page")).toBeVisible();

    // Click description area to edit, fill and save
    await page.getByTestId("task-detail-description").click();
    await page
      .getByTestId("task-detail-description-input")
      .fill(savedDescription);
    await page.getByTestId("task-detail-description-save").click();

    // Verify saved text shows
    await expect(
      page.getByTestId("task-detail-description")
    ).toContainText(savedDescription);

    // Click description again, change text, then cancel
    await page.getByTestId("task-detail-description").click();
    await page
      .getByTestId("task-detail-description-input")
      .fill(cancelledDescription);
    await page.getByTestId("task-detail-description-cancel").click();

    // Verify original saved text remains
    await expect(
      page.getByTestId("task-detail-description")
    ).toContainText(savedDescription);
    await expect(
      page.getByTestId("task-detail-description")
    ).not.toContainText(cancelledDescription);
  });

  test("change task status from detail page", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    const task = await createTask(aliceApi, testProject.id, {
      title: `Status Test ${Date.now()}`,
      status: "todo",
    });

    await page.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(page.getByTestId("task-page")).toBeVisible();

    await page.getByTestId("task-detail-status-select").click();
    await page.getByRole("option", { name: /in progress/i }).click();

    await expect(
      page.getByTestId("task-detail-status-select")
    ).toHaveText(/in progress/i);

    // Navigate to board and verify task is in the In Progress column
    await page.goto(`/projects/${testProject.key}/board`);
    await expect(page.getByTestId("kanban-board")).toBeVisible();

    const inProgressColumn = page.getByTestId("board-column-in_progress");
    await expect(
      inProgressColumn.getByTestId(`task-card-${task.taskKey}`)
    ).toBeVisible();
  });

  test("change task priority", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    const task = await createTask(aliceApi, testProject.id, {
      title: `Priority Test ${Date.now()}`,
      priority: "medium",
    });

    await page.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(page.getByTestId("task-page")).toBeVisible();

    await page.getByTestId("task-detail-priority-select").click();
    await page.getByRole("option", { name: /high/i }).click();

    await expect(
      page.getByTestId("task-detail-priority-select")
    ).toHaveText(/high/i);
  });

  test("change task assignee", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    const task = await createTask(aliceApi, testProject.id, {
      title: `Assignee Test ${Date.now()}`,
    });

    await addProjectMember(
      aliceApi,
      testProject.id,
      TEST_ACCOUNTS.bob.email
    );

    await page.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(page.getByTestId("task-page")).toBeVisible();

    // Change assignee to Bob via the sidebar
    await page.getByTestId("task-detail-assignee-select").click();
    await page.getByRole("option", { name: /bob/i }).click();

    // Verify the assignee updated
    await expect(
      page.getByTestId("task-detail-assignee-select")
    ).toHaveText(/bob/i);
  });

  test("set and clear due date", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    const task = await createTask(aliceApi, testProject.id, {
      title: `Due Date Test ${Date.now()}`,
    });

    await page.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(page.getByTestId("task-page")).toBeVisible();

    const sidebar = page.getByTestId("task-detail-sidebar");

    // Click the due date area to open the date picker
    const dueDateButton = sidebar.getByRole("button", { name: /due date|pick a date|no date/i });
    await dueDateButton.click();

    // Select a date from the calendar — pick the 15th of the visible month
    await page.getByRole("gridcell", { name: "15" }).first().click();

    // Verify a date is now showing
    await expect(sidebar).toContainText("15");

    // Clear the due date using the clear (X) button
    const clearButton = sidebar.getByRole("button", { name: /clear|remove/i }).or(
      sidebar.locator("button").filter({ has: page.locator("svg") }).filter({ hasText: "" }).last()
    );
    await clearButton.click();

    // Verify due date is gone — should show placeholder or no date text
    await expect(sidebar).not.toContainText("15");
  });

  test("delete task from board context menu", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    const task = await createTask(aliceApi, testProject.id, {
      title: `Delete Me ${Date.now()}`,
      status: "todo",
    });

    await page.goto(`/projects/${testProject.key}/board`);
    await expect(page.getByTestId("kanban-board")).toBeVisible();

    // Verify task card is visible
    await expect(
      page.getByTestId(`task-card-${task.taskKey}`)
    ).toBeVisible();

    // Click the three-dot menu
    await page.getByTestId(`task-menu-${task.taskKey}`).click();

    // Click delete
    await page.getByTestId(`task-delete-${task.taskKey}`).click();

    // Verify task card disappears
    await expect(
      page.getByTestId(`task-card-${task.taskKey}`)
    ).toBeHidden();
  });

  test("task list view and sorting", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    // Create tasks with different priorities
    const taskLow = await createTask(aliceApi, testProject.id, {
      title: `Low Prio ${Date.now()}`,
      priority: "low",
    });
    const taskHigh = await createTask(aliceApi, testProject.id, {
      title: `High Prio ${Date.now()}`,
      priority: "high",
    });
    const taskCritical = await createTask(aliceApi, testProject.id, {
      title: `Critical Prio ${Date.now()}`,
      priority: "critical",
    });

    await page.goto(`/projects/${testProject.key}/list`);
    await expect(page.getByTestId("task-list-table")).toBeVisible();

    // Verify all tasks are in the table
    await expect(
      page.getByTestId(`task-row-${taskLow.taskKey}`)
    ).toBeVisible();
    await expect(
      page.getByTestId(`task-row-${taskHigh.taskKey}`)
    ).toBeVisible();
    await expect(
      page.getByTestId(`task-row-${taskCritical.taskKey}`)
    ).toBeVisible();

    // Get initial order of rows
    const getRowOrder = async () => {
      const rows = page.getByTestId("task-list-table").locator("tbody tr");
      const count = await rows.count();
      const keys: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = await rows.nth(i).textContent();
        keys.push(text ?? "");
      }
      return keys;
    };

    const orderBefore = await getRowOrder();

    // Click sort-priority header to sort by priority
    await page.getByTestId("sort-priority").click();
    const orderAfterFirst = await getRowOrder();

    // Click again to toggle sort direction
    await page.getByTestId("sort-priority").click();
    const orderAfterSecond = await getRowOrder();

    // At least one of the sort clicks should change the order
    const orderChanged =
      JSON.stringify(orderBefore) !== JSON.stringify(orderAfterFirst) ||
      JSON.stringify(orderAfterFirst) !== JSON.stringify(orderAfterSecond);
    expect(orderChanged).toBe(true);
  });
});
