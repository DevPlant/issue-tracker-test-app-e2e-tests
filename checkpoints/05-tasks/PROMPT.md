# Checkpoint 05 — Task Lifecycle Tests

## Prompt

Copy and paste the following prompt into Claude:

---

I have a Playwright E2E testing project with auth infrastructure and smoke tests. Now I need detailed tests for the task lifecycle in the issue tracker app.

### Context

Read these files first:
- `docs/APP_SPEC.md` — Full app spec with `data-testid` selectors (especially Task Detail, Kanban Board, Task List sections)
- `tests/helpers/constants.ts` — Test account credentials
- `tests/helpers/api.ts` — API helpers for creating projects, tasks, etc.
- `tests/helpers/fixtures.ts` — Custom fixtures (`testProject`, `aliceApi`)
- `tests/smoke.spec.ts` — Follow the same patterns

### Important: Test isolation

Every test must be idempotent:
- Create all data via API helpers or the `testProject` fixture
- Never rely on pre-existing data
- The `testProject` fixture auto-cleans up (deleting a project removes all its tasks)
- Use unique names with timestamps

### What I need

Create `tests/tasks.spec.ts` with the following tests. Use the `testProject` fixture for all of them. Use the API to create tasks when the test isn't specifically about task creation through the UI.

1. **Create task from board** — Navigate to the project board. Click the "+" button on the "To Do" column. Fill in a task title, submit. Verify the task card appears in the correct column. (Note: you may need to reload the board after creation to see the task.)

2. **Edit task title inline** — Create a task via API. Navigate to the task detail page. Click the title to enter edit mode, change the text, press Enter. Reload the page and verify the new title persisted.

3. **Edit task description with save and cancel** — Create a task via API. Navigate to detail. Click the description area, type some text, click Save. Verify the description shows. Then click description again, change the text, click Cancel. Verify the original saved text is still there.

4. **Change task status from detail page** — Create a task via API with status "todo". Navigate to detail. Change status to "In Progress" via the sidebar dropdown. Verify the dropdown shows the new status. Navigate to the board and verify the task card is in the "In Progress" column.

5. **Change task priority from detail page** — Create a task via API. Navigate to detail. Change priority to "high" via the dropdown. Verify the change is reflected.

6. **Change task assignee** — Create a task via API. Add Bob as a project member via API (`addProjectMember`). Navigate to task detail. Change the assignee to Bob via the sidebar. Verify the assignee updates.

7. **Set and clear due date** — Create a task via API. Navigate to detail. Set a due date using the date picker. Verify the date shows. Then clear the due date (click the X/clear button). Verify the date is removed.

8. **Delete task from board context menu** — Create a task via API. Navigate to the board. Open the context menu (three-dot button) on the task card. Click Delete. Verify the task card disappears from the board.

9. **Task list view shows tasks and sorting works** — Create 2-3 tasks via API with different statuses and priorities. Navigate to the list view (`/projects/{key}/list`). Verify all tasks appear in the table. Click a sortable column header (e.g., priority). Verify the sort order changes.

### Guidelines

- Import `test` and `expect` from `./helpers/fixtures`
- Use `data-testid` selectors — prefer `getByTestId()`
- The API returns task keys as `taskKey` (e.g., "ABCD-1"), not `key`
- If you need to add new API helpers (like `updateTask`), add them to `tests/helpers/api.ts`
- For dropdowns/selects, after clicking the trigger, use `getByRole('option', { name: /.../ })` to select values

After writing the tests, run the full suite to verify everything passes.

---

## What to expect

Claude should create `tests/tasks.spec.ts` with 9 tests covering the full task lifecycle. It may also add helper functions to `api.ts` if needed.

## How to verify

```bash
npm test
```

All tests should pass, including existing smoke tests.
