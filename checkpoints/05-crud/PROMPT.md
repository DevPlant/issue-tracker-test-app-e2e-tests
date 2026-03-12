# Checkpoint 05 — CRUD Tests

## Prompt

Copy and paste the following prompt into Claude:

---

I have a Playwright E2E testing project with auth infrastructure and smoke tests already passing. Now I need detailed CRUD tests for the issue tracker app's core features: tasks, comments, and project settings.

### Context

Read these files to understand the app and existing test infrastructure:
- `docs/APP_SPEC.md` — Full app specification with `data-testid` selectors
- `docs/TEST_PLAN.md` — Test plan with detailed test cases per feature area
- `tests/helpers/constants.ts` — Test account credentials
- `tests/helpers/api.ts` — API helpers for creating projects, tasks, comments, members
- `tests/helpers/fixtures.ts` — Custom fixtures (`testProject`, `aliceApi`)
- `tests/smoke.spec.ts` — Existing smoke tests (follow the same patterns)

### Important: Test isolation

Every test must be fully idempotent:
- **Create all data it needs** via API helpers or the `testProject` fixture — never rely on pre-existing data
- **Clean up after itself** — the `testProject` fixture handles project cleanup automatically (deleting a project removes all its tasks and comments)
- **Use unique names** with timestamps or random values
- **Use the API for setup, the UI for what's being tested**

### What I need

Create three separate test files:

#### File 1: `tests/tasks.spec.ts` — Task lifecycle tests

Test the full task lifecycle through the UI. Use `testProject` fixture for all tests. Use the API to create prerequisite tasks where the test isn't about creation.

Tests to include:
- **Create task from board with all fields** — Click "+" on a column, fill title, set status, set priority, submit. Verify task appears on board with correct priority badge.
- **Edit task title inline** — Create task via API, navigate to detail, click title, change it, press Enter. Verify the new title persists (reload and check).
- **Edit task description** — Create task via API, navigate to detail, click description area, type markdown text, click Save. Verify description renders. Also test Cancel discards changes.
- **Change task status from detail page** — Create task via API, navigate to detail, change status via dropdown. Verify status updates. Navigate to board and verify task moved to correct column.
- **Change task priority from detail page** — Create task via API, navigate to detail, change priority via dropdown. Verify priority updates.
- **Change task assignee** — Create task via API, add Bob as project member via API. Navigate to detail, change assignee to Bob. Verify assignee updates.
- **Set and clear due date** — Create task via API, navigate to detail, set a due date, verify it shows. Clear the due date, verify it's gone.
- **Delete task from board context menu** — Create task via API, navigate to board, open context menu on the task card, click delete. Verify the task card is removed from the board.
- **Task list view shows tasks and supports sorting** — Create 2-3 tasks via API with different priorities/statuses. Navigate to list view. Verify tasks appear in the table. Click a sortable column header, verify order changes.

#### File 2: `tests/comments.spec.ts` — Comment tests

Test comment CRUD. Use `testProject` fixture. Create a task via API for each test.

Tests to include:
- **Add a comment** — Navigate to task detail, type comment text, submit. Verify comment appears with correct text and author name.
- **Edit own comment** — Add a comment via API, navigate to task detail, click edit on the comment, change text, save. Verify updated text appears.
- **Cancel comment edit** — Add a comment via API, navigate to task detail, start editing, change text, click cancel. Verify original text is preserved.
- **Delete own comment** — Add a comment via API, navigate to task detail, click delete. Verify comment is removed from the thread.
- **Cannot edit/delete another user's comment** — Log in as Alice, add a comment via API. Switch browser context: create a new page with Bob's storage state, navigate to the same task. Verify Bob can see the comment but has no edit/delete buttons on Alice's comment.

For the cross-user test, you can create a new browser context with Bob's storage state:
```typescript
const bobContext = await browser.newContext({
  storageState: TEST_ACCOUNTS.bob.storageStatePath,
});
const bobPage = await bobContext.newPage();
// ... use bobPage ...
await bobContext.close();
```

#### File 3: `tests/project-settings.spec.ts` — Project settings tests

Test project settings management. Use `testProject` fixture where appropriate. Some tests may need to create their own project for destructive operations.

Tests to include:
- **Settings page shows current project details** — Navigate to settings, verify name and key fields match the project.
- **Edit project name and description** — Change name and description, click save. Reload the page. Verify changes persisted.
- **Project key is read-only** — Verify the key input field is disabled.
- **Add member to project** — Enter Bob's email, click add. Verify Bob appears in the members table.
- **Remove member from project** — Add Bob via API first. Navigate to settings, click remove on Bob's row. Verify Bob is no longer in the table.
- **Delete project** — Create a separate project via API (not the `testProject` fixture — you need to control cleanup yourself). Navigate to its settings, click Delete Project, confirm in the dialog. Verify redirect to `/projects`. Verify the deleted project is no longer in the project list.

### Guidelines

- Import `test` and `expect` from `./helpers/fixtures`
- Use `data-testid` selectors from APP_SPEC.md — prefer `getByTestId()`
- For the cross-user comment test, use `browser` fixture to create Bob's context
- Keep tests focused — one behavior per test
- If you need to extend the fixtures (e.g., add a `bobApi` or `adminApi`), do so in `fixtures.ts`
- If you need new API helpers, add them to `api.ts`

After writing all tests, run the full suite to verify everything passes.

---

## What to expect

After running this prompt, Claude should create three test files with approximately 15-20 tests total covering task CRUD, comments, and project settings. All tests should be idempotent and pass.

## How to verify

```bash
npm test
```

All tests should pass, including the existing smoke tests and example test.
