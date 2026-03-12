# Checkpoint 08 — Advanced Scenarios

## Prompt

Copy and paste the following prompt into Claude:

---

I have a Playwright E2E testing project with auth, smoke, task, comment, and project settings tests. Now I need tests for advanced scenarios: admin panel, board filters, and user profile.

### Context

Read these files first:
- `docs/APP_SPEC.md` — Admin Panel, Kanban Board (filters), User Profile sections and their `data-testid` selectors
- `tests/helpers/constants.ts` — Test account credentials (admin, alice, bob and their `storageStatePath`)
- `tests/helpers/api.ts` — API helpers
- `tests/helpers/fixtures.ts` — Custom fixtures
- `tests/comments.spec.ts` — See the cross-user test pattern for creating separate browser contexts

### Important: Test isolation

Every test must be idempotent:
- Create all data via API helpers or fixtures
- Clean up after itself
- Use unique names with timestamps
- For admin role-change tests, **revert the role back** in cleanup so other tests aren't affected
- For password change tests, use a **freshly registered throwaway account** so you don't break shared test accounts

### What I need

Create `tests/advanced.spec.ts` with these 6 tests:

#### Admin Panel (3 tests)

These tests need an admin browser context. Create it using:
```typescript
const adminContext = await browser.newContext({
  storageState: TEST_ACCOUNTS.admin.storageStatePath,
});
const adminPage = await adminContext.newPage();
```

1. **Admin sees user list, non-admin is blocked** — Open `/admin/users` in an admin context. Verify `admin-users-page` and `admin-user-list` are visible. Then open `/admin/users` in Alice's regular page (already authenticated as Alice via the default storage state). Verify Alice is redirected away or doesn't see the admin page. Also verify `sidebar-nav-users` is visible in admin's sidebar but NOT in Alice's sidebar. Close admin context when done.

2. **Admin changes a user's role** — Open admin page in admin context. Find a non-admin user's row. Change their role via the role dropdown. Verify the change is reflected. **Important: revert the role back** before closing the context.

3. **Bulk role change with confirmation** — Open admin page in admin context. Select 2+ users via checkboxes (`bulk-select-{userId}`). Verify `bulk-action-bar` appears with `bulk-selection-count`. Click `bulk-role-select` and choose a role. Confirm in the `bulk-confirm-dialog` by clicking `bulk-confirm-action`. Verify the role changes applied. **Revert roles back** before cleanup. Note: admin cannot select themselves, so select other users.

#### Board Filters (1 test)

4. **Board filters: search, assignee, priority, and clear** — Use `testProject` fixture. Create 3 tasks via API with different titles, assignees, and priorities (add Bob as member first for assignee variety). Navigate to the board. Test each filter:
   - Type in `filter-search` — verify only matching tasks visible
   - Clear search. Select an assignee from `filter-assignee` — verify filtering works
   - Clear. Select a priority from `filter-priority` — verify filtering works
   - Click `filter-clear` — verify all tasks visible again

#### Profile (2 tests)

5. **Edit profile display name** — Navigate to `/profile`. Verify `profile-page` is visible. Change `profile-name-input` to a new name. Click `profile-save-button`. Reload. Verify the new name persisted. **Revert the name back** to the original value.

6. **Change password with throwaway account** — Register a brand new account via the UI: clear cookies, go to `/register`, fill in unique email/name/password, submit, verify redirect to `/projects`. Then navigate to `/profile`, click `security-tab-trigger`. Fill `current-password-input` with the original password, `new-password-input` and `confirm-password-input` with a new password. Click `change-password-button`. Verify success (no error shown, or a toast appears). No cleanup needed — the account is throwaway.

### Guidelines

- Import `test` and `expect` from `./helpers/fixtures`
- Use `data-testid` selectors from APP_SPEC.md
- For admin tests, you need the `browser` fixture to create new contexts
- For the bulk role change: you won't know user IDs upfront. Use the admin page's table rows to find checkboxes and role dropdowns. You can find non-admin user rows by looking for rows that contain known emails like `alice@example.com` or `bob@example.com`.
- All code files MUST start with 2 lines of "ABOUTME: " comments

After writing the tests, run the full suite to verify everything passes.

---

## What to expect

Claude should create `tests/advanced.spec.ts` with 6 tests covering admin, filters, and profile. The admin tests are the most complex due to separate browser contexts and role revert cleanup.

## How to verify

```bash
npm test
```

All tests should pass, including all existing tests.
