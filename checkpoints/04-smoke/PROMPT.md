# Checkpoint 04 — Smoke Tests

## Prompt

Copy and paste the following prompt into Claude:

---

I have a Playwright E2E testing project with authentication infrastructure already set up. Now I need smoke tests covering the critical user journeys of the issue tracker app.

### Context

Read these files to understand the app and existing test infrastructure:
- `docs/APP_SPEC.md` — Full app specification with `data-testid` selectors
- `docs/TEST_PLAN.md` — Test plan with critical paths identified (see section "Critical Paths")
- `tests/helpers/constants.ts` — Test account credentials
- `tests/helpers/api.ts` — API helpers for creating projects, tasks, comments
- `tests/helpers/fixtures.ts` — Custom fixtures (`testProject`, `aliceApi`)
- `playwright.config.ts` — Current Playwright configuration

### Important: Test isolation

Every test must be fully idempotent. Tests must:
- **Create all data they need** — never rely on pre-existing projects, tasks, or comments
- **Clean up after themselves** — delete any projects created during the test
- **Use unique names** — include timestamps or random values to avoid collisions
- **Use the API helpers** for setup/teardown — only use the UI when testing the UI flow itself

The `testProject` fixture in `fixtures.ts` already handles project creation and cleanup. Use it whenever a test needs a project.

### What I need

Create smoke tests based on the critical paths from the test plan. Each smoke test should verify a complete user journey end-to-end.

**File: `tests/smoke.spec.ts`** — A single test file with these smoke tests:

1. **Login and view projects** — Log out first (to test unauthenticated flow), navigate to `/login`, enter Alice's credentials, submit, verify redirect to `/projects` and that the projects page is visible.

2. **Create a project and verify it appears** — Click "Create Project", fill in project name (unique) and key, submit, verify the new project card appears in the list. Clean up: delete the project via API after verification.

3. **Create a task on the Kanban board** — Use the `testProject` fixture. Navigate to the project's board. Click the "+" button on the "To Do" column. Fill in a task title, submit. Verify the task card appears in the correct column.

4. **View and edit a task** — Use the `testProject` fixture. Create a task via API. Navigate to the task detail page. Edit the title inline (click title, change text, press Enter). Change the status via the sidebar dropdown. Verify changes are reflected.

5. **Add a comment to a task** — Use the `testProject` fixture. Create a task via API. Navigate to task detail. Type a comment, submit. Verify the comment appears in the thread with the correct text.

6. **Search for a task and navigate to it** — Use the `testProject` fixture. Create a task via API with a distinctive title. Open global search (click the search button). Type part of the task title. Verify a matching result appears. Click it. Verify navigation to the correct task detail page.

### Guidelines

- Import `test` and `expect` from `./helpers/fixtures` (not from `@playwright/test`)
- Use `data-testid` selectors from the APP_SPEC.md — prefer `getByTestId()` over CSS selectors or text content
- For the login test, you'll need to clear the stored auth session first. You can do this by calling `page.context().clearCookies()` at the start of the test.
- Keep each test focused on one journey — don't combine multiple unrelated assertions
- If a test creates data outside the `testProject` fixture (like the "create project" test), handle cleanup in the test itself using `test.afterAll` or a try/finally pattern
- Use `await expect(...).toBeVisible()` for asserting element presence — it auto-waits

After writing the tests, run them to verify they all pass.

---

## What to expect

After running this prompt, Claude should create `tests/smoke.spec.ts` with 6 smoke tests that cover the most critical user journeys. All tests should pass and properly clean up after themselves.

## How to verify

```bash
npm test
```

You should see the auth setup pass, followed by all 6 smoke tests passing. No test data should be left behind in the app.
