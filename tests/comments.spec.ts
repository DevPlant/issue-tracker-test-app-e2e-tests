// ABOUTME: Tests for the comment thread on task detail pages.
// ABOUTME: Covers adding, editing, cancelling edits, deleting comments, and cross-user permission checks.

import { test, expect } from "./helpers/fixtures";
import { TEST_ACCOUNTS } from "./helpers/constants";
import { createTask, addComment, addProjectMember } from "./helpers/api";

test.describe("Comments", () => {
  test("add a comment", async ({ page, testProject, aliceApi }) => {
    const task = await createTask(aliceApi, testProject.id, {
      title: `Comment Add ${Date.now()}`,
    });
    const commentText = `My comment ${Date.now()}`;

    await page.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(page.getByTestId("task-page")).toBeVisible();

    await page.getByTestId("comment-input").fill(commentText);
    await page.getByTestId("comment-submit-button").click();

    await expect(
      page.getByTestId("comment-thread").getByText(commentText)
    ).toBeVisible();
  });

  test("edit own comment", async ({ page, testProject, aliceApi }) => {
    const task = await createTask(aliceApi, testProject.id, {
      title: `Comment Edit ${Date.now()}`,
    });
    const originalText = `Original comment ${Date.now()}`;
    const updatedText = `Updated comment ${Date.now()}`;
    const comment = await addComment(aliceApi, task.id, originalText);

    await page.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(page.getByTestId("task-page")).toBeVisible();

    await expect(
      page.getByTestId("comment-thread").getByText(originalText)
    ).toBeVisible();

    await page.getByTestId(`comment-edit-${comment.id}`).click();
    await page.getByTestId(`comment-edit-input-${comment.id}`).clear();
    await page.getByTestId(`comment-edit-input-${comment.id}`).fill(updatedText);
    await page.getByTestId(`comment-edit-save-${comment.id}`).click();

    await expect(
      page.getByTestId("comment-thread").getByText(updatedText)
    ).toBeVisible();
    await expect(
      page.getByTestId("comment-thread").getByText(originalText)
    ).toBeHidden();
  });

  test("cancel comment edit preserves original text", async ({
    page,
    testProject,
    aliceApi,
  }) => {
    const task = await createTask(aliceApi, testProject.id, {
      title: `Comment Cancel ${Date.now()}`,
    });
    const originalText = `Keep this comment ${Date.now()}`;
    const comment = await addComment(aliceApi, task.id, originalText);

    await page.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(page.getByTestId("task-page")).toBeVisible();

    await expect(
      page.getByTestId("comment-thread").getByText(originalText)
    ).toBeVisible();

    await page.getByTestId(`comment-edit-${comment.id}`).click();
    await page
      .getByTestId(`comment-edit-input-${comment.id}`)
      .fill(`Changed text ${Date.now()}`);
    await page.getByTestId(`comment-edit-cancel-${comment.id}`).click();

    await expect(
      page.getByTestId("comment-thread").getByText(originalText)
    ).toBeVisible();
  });

  test("delete own comment", async ({ page, testProject, aliceApi }) => {
    const task = await createTask(aliceApi, testProject.id, {
      title: `Comment Delete ${Date.now()}`,
    });
    const commentText = `Delete me ${Date.now()}`;
    const comment = await addComment(aliceApi, task.id, commentText);

    await page.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(page.getByTestId("task-page")).toBeVisible();

    await expect(
      page.getByTestId("comment-thread").getByText(commentText)
    ).toBeVisible();

    await page.getByTestId(`comment-delete-${comment.id}`).click();

    await expect(
      page.getByTestId("comment-thread").getByText(commentText)
    ).toBeHidden();
  });

  test("cannot edit or delete another user's comment", async ({
    page,
    browser,
    testProject,
    aliceApi,
  }) => {
    await addProjectMember(
      aliceApi,
      testProject.id,
      TEST_ACCOUNTS.bob.email
    );

    const task = await createTask(aliceApi, testProject.id, {
      title: `Cross User Comment ${Date.now()}`,
    });
    const commentText = `Alice's comment ${Date.now()}`;
    const comment = await addComment(aliceApi, task.id, commentText);

    const bobContext = await browser.newContext({
      storageState: TEST_ACCOUNTS.bob.storageStatePath,
    });
    const bobPage = await bobContext.newPage();

    await bobPage.goto(
      `/projects/${testProject.key}/task/${task.taskKey}`
    );
    await expect(bobPage.getByTestId("task-page")).toBeVisible();

    await expect(
      bobPage.getByTestId("comment-thread").getByText(commentText)
    ).toBeVisible();

    await expect(
      bobPage.getByTestId(`comment-edit-${comment.id}`)
    ).toBeHidden();
    await expect(
      bobPage.getByTestId(`comment-delete-${comment.id}`)
    ).toBeHidden();

    await bobContext.close();
  });
});
