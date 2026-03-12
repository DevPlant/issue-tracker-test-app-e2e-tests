# Checkpoint 06 — Comment Tests

## Prompt

Copy and paste the following prompt into Claude:

---

I have a Playwright E2E testing project with auth, smoke tests, and task tests. Now I need tests for the comment system.

### Context

Read these files first:
- `docs/APP_SPEC.md` — Comments section and its `data-testid` selectors
- `tests/helpers/constants.ts` — Test account credentials (especially Bob's `storageStatePath`)
- `tests/helpers/api.ts` — API helpers including `addComment` and `addProjectMember`
- `tests/helpers/fixtures.ts` — Custom fixtures
- `tests/tasks.spec.ts` — Follow the same patterns

### Important: Test isolation

Every test must be idempotent:
- Create all data via API helpers or the `testProject` fixture
- The `testProject` fixture auto-cleans up
- Use unique text with timestamps

### What I need

Create `tests/comments.spec.ts` with these tests. Use `testProject` fixture for all. Create a task via API for each test.

1. **Add a comment** — Navigate to task detail. Type a comment in `comment-input`, click `comment-submit-button`. Verify the comment text appears in `comment-thread`.

2. **Edit own comment** — Add a comment via API (`addComment`). Navigate to task detail. The comment has a dynamic ID — find it by its text content within `comment-thread`. Click the edit button (pencil icon), change the text in the edit textarea, click save. Verify the updated text appears.

3. **Cancel comment edit** — Add a comment via API. Navigate to task detail. Start editing the comment, change the text, click cancel. Verify the original text is still there.

4. **Delete own comment** — Add a comment via API. Navigate to task detail. Click the delete button on the comment. Verify the comment is removed from the thread.

5. **Cannot edit or delete another user's comment** — This is a cross-user test:
   - Add Bob as a project member via API (`addProjectMember`)
   - Create a task via API (as Alice)
   - Add a comment via API (as Alice) with distinctive text
   - Create a new browser context with Bob's auth: `const bobContext = await browser.newContext({ storageState: TEST_ACCOUNTS.bob.storageStatePath })`
   - Open the task detail page in Bob's context
   - Verify Bob can see Alice's comment text
   - Verify there are NO edit or delete buttons visible on Alice's comment (Bob should not be able to modify it)
   - Close Bob's context when done

### Guidelines

- Import `test` and `expect` from `./helpers/fixtures`
- Use `data-testid` selectors from APP_SPEC.md
- The comment selectors use dynamic IDs: `comment-{id}`, `comment-edit-{id}`, `comment-delete-{id}`, etc. Since you won't know the ID upfront, find comments by their text content within the `comment-thread` container, then use relative locators for the edit/delete buttons.
- For the cross-user test, you need the `browser` fixture from Playwright to create Bob's context
- All code files MUST start with 2 lines of "ABOUTME: " comments

After writing the tests, run the full suite to verify everything passes.

---

## What to expect

Claude should create `tests/comments.spec.ts` with 5 tests. The cross-user test is the most complex, requiring a second browser context.

## How to verify

```bash
npm test
```

All tests should pass, including existing tests.
