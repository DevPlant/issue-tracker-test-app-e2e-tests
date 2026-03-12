# Checkpoint 07 — Project Settings Tests

## Prompt

Copy and paste the following prompt into Claude:

---

I have a Playwright E2E testing project with auth, smoke, task, and comment tests. Now I need tests for project settings: editing project details, managing members, and deleting a project.

### Context

Read these files first:
- `docs/APP_SPEC.md` — Project Settings section and its `data-testid` selectors
- `tests/helpers/api.ts` — API helpers (especially `createProject`, `deleteProject`, `addProjectMember`)
- `tests/helpers/fixtures.ts` — Custom fixtures (`testProject`, `aliceApi`)
- `tests/tasks.spec.ts` — Follow the same patterns

### Important: Test isolation

Every test must be idempotent:
- Create all data via API helpers or the `testProject` fixture
- The `testProject` fixture auto-cleans up
- For the delete project test, create a **separate** project via API (not `testProject`) since the test itself deletes it

### What I need

Create `tests/project-settings.spec.ts` with these tests. Use `testProject` fixture except where noted.

1. **Settings page shows current project details** — Navigate to `/projects/{key}/settings`. Verify `settings-name-input` contains the project name. Verify `settings-key-input` contains the project key.

2. **Edit project name and description** — Navigate to settings. Change the name in `settings-name-input` and add a description in `settings-description-input`. Click `settings-save-button`. Reload the page. Verify the new values persisted.

3. **Project key is read-only** — Navigate to settings. Verify `settings-key-input` is disabled.

4. **Add member to project** — Navigate to settings. Enter Bob's email in `settings-member-email-input`, click `settings-add-member-button`. Verify a new row appears in the members table with Bob's name or email.

5. **Remove member from project** — First add Bob as a member via API (`addProjectMember`). Navigate to settings. Find Bob's row in the members table and click his remove button. Verify Bob's row is gone from the table.

6. **Delete project** — Do NOT use the `testProject` fixture for this test. Instead, create a project via API using `aliceApi` directly. Navigate to its settings page. Click `settings-delete-button`. Confirm in the dialog by clicking `confirm-delete-button`. Verify redirect to `/projects`. Verify the project card is no longer on the projects page.

### Guidelines

- Import `test` and `expect` from `./helpers/fixtures`
- Use `data-testid` selectors from APP_SPEC.md
- For the delete test, use `aliceApi` fixture to create and later verify the project is gone — no cleanup needed since the test itself deletes the project
- Member rows use `member-row-{userId}` and remove buttons use `remove-member-{userId}` — but you won't know the userId. Find members by text content or use a broader locator within the members table.
- All code files MUST start with 2 lines of "ABOUTME: " comments

After writing the tests, run the full suite to verify everything passes.

---

## What to expect

Claude should create `tests/project-settings.spec.ts` with 6 tests covering project details editing, member management, and project deletion.

## How to verify

```bash
npm test
```

All tests should pass, including all existing tests.
