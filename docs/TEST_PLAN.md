<!-- ABOUTME: Structured E2E test plan for the Issue Tracker application. -->
<!-- ABOUTME: Covers all feature areas, test data strategy, and critical user journeys. -->

# E2E Test Plan — Issue Tracker

**Application:** https://issues-demo.devplant.academy
**API Base:** `/api/v1`

---

## Table of Contents

- [1. Test Areas](#1-test-areas)
  - [Authentication](#authentication)
  - [Projects](#projects)
  - [Kanban Board](#kanban-board)
  - [Task List View](#task-list-view)
  - [Task Detail](#task-detail)
  - [Comments](#comments)
  - [Project Settings](#project-settings)
  - [User Profile](#user-profile)
  - [Admin Panel](#admin-panel)
  - [Global Search](#global-search)
- [2. Test Data Strategy](#2-test-data-strategy)
- [3. Critical Paths (Smoke Tests)](#3-critical-paths-smoke-tests)
- [4. API Helpers for Test Setup](#4-api-helpers-for-test-setup)

---

## 1. Test Areas

### Authentication

| # | Test Name | Priority | Selectors | Setup Notes |
|---|-----------|----------|-----------|-------------|
| A1 | Login with valid credentials redirects to projects page | P0 | `login-email-input`, `login-password-input`, `login-submit-button`, `projects-page` | Use `alice@example.com` |
| A2 | Login with invalid credentials shows error message | P0 | `login-error`, `login-submit-button` | Use wrong password |
| A3 | Login form shows field validation errors for empty fields | P1 | `login-email-error`, `login-password-error` | Submit empty form |
| A4 | Login form validates email format | P2 | `login-email-error` | Enter invalid email string |
| A5 | Register a new account and redirect to projects | P0 | `register-name-input`, `register-email-input`, `register-password-input`, `register-confirm-password-input`, `register-submit-button`, `projects-page` | Use unique email with timestamp |
| A6 | Registration validates password minimum length | P1 | `register-password-error` | Enter < 8 char password |
| A7 | Registration validates password confirmation match | P1 | `register-confirm-password-error` | Enter mismatched passwords |
| A8 | Registration rejects duplicate email | P1 | `register-error` | Use existing `alice@example.com` |
| A9 | Registration validates required fields | P2 | `register-name-error`, `register-email-error`, `register-password-error` | Submit empty form |
| A10 | Unauthenticated user is redirected to login | P0 | `login-card` | Visit `/projects` without session |
| A11 | Sign out redirects to login page | P0 | `user-menu-trigger`, `user-menu-signout`, `login-card` | Must be logged in first |
| A12 | Navigate between login and register pages via links | P2 | `login-register-link`, `register-login-link` | None |

### Projects

| # | Test Name | Priority | Selectors | Setup Notes |
|---|-----------|----------|-----------|-------------|
| P1 | Projects page shows list of user's projects | P0 | `projects-page`, `project-card-{key}` | User must be member of at least one project |
| P2 | Create project via simple form | P0 | `create-project-button`, `project-form-dialog`, `project-form-name-input`, `project-form-key-input`, `project-form-description-input`, `project-form-submit-button` | Use unique name with timestamp |
| P3 | Project key auto-generates from name | P1 | `project-form-name-input`, `project-form-key-input` | Type name, verify key field |
| P4 | Create project via multi-step wizard | P1 | `project-wizard-dialog`, `wizard-name-input`, `wizard-key-input`, `wizard-description-input`, `wizard-next-button`, `wizard-member-email-input`, `wizard-add-member-button`, `wizard-create-button` | Use unique name; add existing user email as member |
| P5 | Wizard step 2 validates member email and rejects duplicates | P2 | `wizard-member-error`, `wizard-member-email-input` | Add same email twice |
| P6 | Wizard step 3 shows review summary | P1 | `wizard-review`, `wizard-review-name`, `wizard-review-key`, `wizard-review-description`, `wizard-review-members` | Fill steps 1+2, advance to step 3 |
| P7 | Wizard back button navigates to previous step | P2 | `wizard-back-button` | Navigate forward then back |
| P8 | Click project card navigates to board | P0 | `project-card-{key}`, `board-page` | Needs existing project |
| P9 | Project sub-navigation tabs work (board, list, settings) | P1 | `project-nav-board`, `project-nav-list`, `project-nav-settings`, `board-page`, `list-page`, `settings-page` | Needs existing project |
| P10 | Breadcrumb links back to projects list | P1 | `breadcrumb-projects`, `projects-page` | Must be inside a project |
| P11 | Empty state shown when user has no projects | P2 | `projects-empty-state` | Needs a user with no projects (use freshly registered account) |
| P12 | Simple form cancel button closes dialog without creating | P2 | `project-form-cancel-button` | None |

### Kanban Board

| # | Test Name | Priority | Selectors | Setup Notes |
|---|-----------|----------|-----------|-------------|
| K1 | Board displays all 5 status columns | P0 | `kanban-board`, `board-column-backlog`, `board-column-todo`, `board-column-in_progress`, `board-column-in_review`, `board-column-done` | Needs project with tasks |
| K2 | Task cards appear in correct columns by status | P0 | `task-card-{taskKey}`, `board-column-{status}` | Needs tasks in different statuses |
| K3 | Column headers show correct task count | P1 | `column-count-{status}` | Needs known number of tasks per column |
| K4 | Click task card navigates to task detail | P0 | `task-link-{taskKey}`, `task-page` | Needs existing task |
| K5 | Create task from column "+" button | P0 | `column-add-task-{status}`, `task-form-dialog`, `task-form-title-input`, `task-form-submit-button` | Status should be pre-selected |
| K6 | Task card shows priority badge | P1 | `task-priority-badge-{taskKey}` | Needs task with known priority |
| K7 | Task card shows overdue date in red | P1 | `task-due-date-{taskKey}` | Needs task with past due date, not in "done" status |
| K8 | Context menu: change task status | P1 | `task-menu-{taskKey}`, `task-menu-content-{taskKey}`, `task-status-{status}` | Needs existing task |
| K9 | Context menu: change task priority | P1 | `task-menu-{taskKey}`, `task-priority-{priority}` | Needs existing task |
| K10 | Context menu: change task assignee | P1 | `task-menu-{taskKey}`, `task-assignee-{userId}`, `task-assignee-unassigned` | Needs project with multiple members |
| K11 | Context menu: delete task | P1 | `task-menu-{taskKey}`, `task-delete-{taskKey}` | Needs existing task; verify card removed |
| K12 | Filter tasks by search text | P1 | `filter-search`, `task-card-{taskKey}` | Needs multiple tasks with distinct titles |
| K13 | Filter tasks by assignee | P1 | `filter-assignee` | Needs tasks with different assignees |
| K14 | Filter tasks by priority | P1 | `filter-priority` | Needs tasks with different priorities |
| K15 | Clear filters button resets all filters | P2 | `filter-clear` | Apply at least one filter first |
| K16 | Drag and drop task between columns changes status | P1 | `task-card-{taskKey}`, `board-column-{status}` | Needs existing task. **Note: Playwright drag-and-drop is complex; may need `page.locator().dragTo()` or manual mouse event sequences. Flag as potentially flaky.** |
| K17 | Filters persist in URL query parameters | P2 | `filter-search`, `filter-assignee`, `filter-priority` | Apply filters, check URL, reload page, verify filters restored |

### Task List View

| # | Test Name | Priority | Selectors | Setup Notes |
|---|-----------|----------|-----------|-------------|
| L1 | List page shows tasks in a table | P0 | `list-page`, `task-list-table`, `task-row-{taskKey}` | Needs project with tasks |
| L2 | Click task key link navigates to task detail | P0 | `task-list-link-{taskKey}`, `task-page` | Needs existing task |
| L3 | Sort by key column | P1 | `sort-key` | Needs multiple tasks |
| L4 | Sort by title column | P2 | `sort-title` | Needs multiple tasks |
| L5 | Sort by status column | P1 | `sort-status` | Needs tasks in different statuses |
| L6 | Sort by priority column | P1 | `sort-priority` | Needs tasks with different priorities |
| L7 | Sort by due date column | P2 | `sort-due` | Needs tasks with due dates |
| L8 | Toggle sort direction by clicking column header twice | P1 | `sort-key` | Click same header twice, verify order reverses |
| L9 | Overdue tasks show due date in red | P1 | `task-due-date-{taskKey}` | Needs task with past due date |
| L10 | Filter bar works same as board (search, assignee, priority) | P1 | `filter-search`, `filter-assignee`, `filter-priority` | Needs diverse tasks |

### Task Detail

| # | Test Name | Priority | Selectors | Setup Notes |
|---|-----------|----------|-----------|-------------|
| T1 | Task detail page displays task key, title, and description | P0 | `task-page`, `task-detail`, `task-detail-key`, `task-detail-title`, `task-detail-description` | Needs existing task with description |
| T2 | Edit task title inline | P0 | `task-detail-title`, `task-detail-title-input` | Click title, type new text, press Enter or blur |
| T3 | Edit task description with save/cancel | P1 | `task-detail-description`, `task-detail-description-input`, `task-detail-description-save`, `task-detail-description-cancel` | Click description to enter edit mode |
| T4 | Cancel description edit discards changes | P2 | `task-detail-description-cancel`, `task-detail-description` | Edit, then cancel, verify original text |
| T5 | Change task status from sidebar dropdown | P0 | `task-detail-status-select` | Needs existing task |
| T6 | Change task priority from sidebar dropdown | P0 | `task-detail-priority-select` | Needs existing task |
| T7 | Change task assignee from sidebar combobox | P1 | `task-detail-sidebar` | Needs project with multiple members |
| T8 | Set and clear due date | P1 | `task-detail-sidebar` | Set date via date picker, then clear with X button |
| T9 | Sidebar shows reporter, created, and updated timestamps | P2 | `task-detail-sidebar` | Needs existing task |
| T10 | Description renders Markdown correctly | P2 | `task-detail-description` | Create task with markdown description via API |

### Comments

| # | Test Name | Priority | Selectors | Setup Notes |
|---|-----------|----------|-----------|-------------|
| C1 | Add a comment to a task | P0 | `comment-form`, `comment-input`, `comment-submit-button`, `comment-thread` | Needs existing task |
| C2 | Comment appears in thread with author and timestamp | P1 | `comment-thread`, `comment-{id}` | Add comment first |
| C3 | Edit own comment | P1 | `comment-edit-{id}`, `comment-edit-input-{id}`, `comment-edit-save-{id}` | Needs own existing comment |
| C4 | Cancel comment edit discards changes | P2 | `comment-edit-cancel-{id}` | Start editing, cancel |
| C5 | Delete own comment | P1 | `comment-delete-{id}` | Needs own existing comment |
| C6 | Cannot edit or delete another user's comment | P1 | `comment-thread` | Log in as different user, verify no edit/delete buttons on other's comment |
| C7 | Submit button disabled when comment input is empty | P2 | `comment-submit-button`, `comment-input` | Check button state with empty textarea |

### Project Settings

| # | Test Name | Priority | Selectors | Setup Notes |
|---|-----------|----------|-----------|-------------|
| S1 | Settings page displays current project details | P1 | `settings-page`, `settings-name-input`, `settings-key-input`, `settings-description-input` | Needs existing project |
| S2 | Edit project name and description | P1 | `settings-name-input`, `settings-description-input`, `settings-save-button` | Change values and save |
| S3 | Project key field is read-only | P2 | `settings-key-input` | Verify input is disabled |
| S4 | Add member to project by email | P1 | `settings-member-email-input`, `settings-add-member-button`, `member-row-{userId}` | Use email of existing user not in project |
| S5 | Add member shows error for non-existent user | P2 | `settings-member-error` | Use email that doesn't exist |
| S6 | Add member shows error for duplicate member | P2 | `settings-member-error` | Use email of existing member |
| S7 | Remove member from project | P1 | `remove-member-{userId}`, `member-row-{userId}` | Needs project with at least 2 members |
| S8 | Delete project with confirmation dialog | P1 | `settings-delete-button`, `delete-project-dialog`, `confirm-delete-button`, `projects-page` | Creates project via API first; verify redirect to projects after deletion |

### User Profile

| # | Test Name | Priority | Selectors | Setup Notes |
|---|-----------|----------|-----------|-------------|
| U1 | Profile page displays user info | P1 | `profile-page`, `profile-email`, `profile-name-input` | None |
| U2 | Edit display name and save | P1 | `profile-name-input`, `profile-save-button` | Change name, save, verify |
| U3 | Email field is read-only | P2 | `profile-email` | Verify disabled |
| U4 | Profile shows user's projects list | P1 | `profile-projects`, `profile-project-{key}` | User must be member of at least one project |
| U5 | Click project in profile navigates to board | P2 | `profile-project-{key}`, `board-page` | Needs project membership |
| U6 | Toggle notification master switch disables sub-options | P1 | `notifications-tab-trigger`, `notification-email-switch`, `notification-options` | Navigate to notifications tab |
| U7 | Save notification preferences | P2 | `notification-assignment-checkbox`, `notification-comment-checkbox`, `notification-status-checkbox`, `notification-membership-checkbox`, `notification-save-button` | Toggle checkboxes and save |
| U8 | Change password with valid current password | P1 | `security-tab-trigger`, `current-password-input`, `new-password-input`, `confirm-password-input`, `change-password-button` | Use a test account; **caution: changes password for the account — use a disposable registered account or reset after** |
| U9 | Change password fails with wrong current password | P1 | `password-form-error`, `change-password-button` | Enter wrong current password |
| U10 | Change password validates confirmation match | P2 | `confirm-password-input` | Enter mismatched passwords |
| U11 | Profile tabs navigation works | P1 | `profile-tabs-list`, `profile-tab-trigger`, `notifications-tab-trigger`, `security-tab-trigger`, `profile-tab-content`, `notifications-tab-content`, `security-tab-content` | Click each tab, verify content shown |

### Admin Panel

| # | Test Name | Priority | Selectors | Setup Notes |
|---|-----------|----------|-----------|-------------|
| AD1 | Admin page shows user list (admin only) | P0 | `admin-users-page`, `admin-user-list` | Log in as `admin@example.com` |
| AD2 | Non-admin cannot access admin page | P0 | `sidebar` | Log in as `alice@example.com`, verify no "Users" nav link; navigate directly to `/admin/users`, verify redirect or 403 |
| AD3 | Change individual user role via dropdown | P1 | `admin-role-select-{userId}` | Use admin account; change role of a non-admin user |
| AD4 | Select multiple users with checkboxes | P1 | `bulk-select-{userId}`, `bulk-action-bar`, `bulk-selection-count` | Select 2+ users |
| AD5 | Select-all checkbox selects all non-self users | P1 | `bulk-select-all`, `bulk-selection-count` | Verify admin's own row is not selectable |
| AD6 | Cannot select yourself in user list | P1 | `bulk-select-{userId}` | Verify own checkbox is absent or disabled |
| AD7 | Bulk role change with confirmation dialog | P1 | `bulk-role-select`, `bulk-confirm-dialog`, `bulk-confirm-action` | Select users, trigger bulk change, confirm |
| AD8 | Clear selection button clears all checkboxes | P2 | `bulk-clear-button`, `bulk-selection-count` | Select users, then clear |
| AD9 | Admin sidebar link visible only to admins | P1 | `sidebar-nav-users` | Compare sidebar as admin vs regular user |

### Global Search

| # | Test Name | Priority | Selectors | Setup Notes |
|---|-----------|----------|-----------|-------------|
| GS1 | Open search dialog with Cmd+K | P1 | `global-search-trigger`, `global-search-input` | Press keyboard shortcut |
| GS2 | Open search dialog by clicking search button | P1 | `global-search-trigger`, `global-search-input` | Click trigger button |
| GS3 | Search returns matching tasks | P0 | `global-search-input`, `search-result-{taskKey}` | Needs existing tasks; search by title or key |
| GS4 | Select search result navigates to task detail | P0 | `search-result-{taskKey}`, `task-page` | Click a result |
| GS5 | Search shows no results for non-matching query | P2 | `global-search-input` | Search for gibberish string |
| GS6 | Search is debounced (results appear after typing stops) | P2 | `global-search-input` | Type quickly, verify single request after 300ms pause |

---

## 2. Test Data Strategy

### Test Accounts

| Account | Role | Purpose |
|---------|------|---------|
| `admin@example.com` / `password123` | admin | Admin panel tests, role management, verifying admin-only UI |
| `alice@example.com` / `password123` | user | Primary test user for most flows (projects, tasks, comments) |
| `bob@example.com` / `password123` | user | Secondary user for multi-user scenarios (comments by another user, member management, assignee changes) |

### Data Creation Approach

**Tests should create their own data.** Do not rely on pre-seeded data beyond the three test accounts.

- **Before each test (or test group):** Use the REST API to create the required projects, tasks, and comments. This is faster and more reliable than creating through the UI.
- **UI-based creation:** Only create data through the UI when the creation flow itself is being tested (e.g., "Create project via simple form").
- **Unique naming:** All test-created resources should include a timestamp or random suffix to avoid collisions between parallel test runs. Pattern: `Test Project ${Date.now()}` or `Test Task ${randomId}`.

### API Setup Helpers

Use authenticated API calls (with session cookie from login) for fast test data setup:

- `POST /api/v1/projects` — Create a project
- `POST /api/v1/projects/{id}/tasks` — Create tasks with specific status/priority/assignee
- `POST /api/v1/projects/{id}/members` — Add members to a project
- `POST /api/v1/tasks/{id}/comments` — Seed comments on tasks
- `PATCH /api/v1/tasks/{id}` — Set specific task fields (due date, assignee, etc.)

### Cleanup

- **Prefer project deletion for cleanup:** Deleting a project (`DELETE /api/v1/projects/{id}`) removes all associated tasks and comments. Use `afterAll` or `afterEach` hooks to delete test projects.
- **Registered users cannot be deleted via API.** Tests that register new accounts should use unique emails and accept that these accumulate. Use a pattern like `test-{timestamp}@e2e.test`.
- **Password change tests** should either use a freshly registered disposable account, or change the password back in cleanup.
- **Admin role changes** should be reverted in cleanup to avoid test interference.

### Test Isolation

- Each test file should set up its own projects and tasks in a `beforeAll` or `beforeEach` block.
- Tests within a file can share a project if they don't modify it destructively, but tests that delete data (project deletion, task deletion) must use their own dedicated resources.
- Use Playwright's `storageState` to cache login sessions and avoid logging in at the start of every test.

---

## 3. Critical Paths (Smoke Tests)

These are the most important user journeys. If any of these break, the application is fundamentally unusable.

### Smoke 1: Login and view projects
1. Navigate to `/login`
2. Enter valid credentials
3. Submit login form
4. Verify redirect to `/projects`
5. Verify project list is visible

### Smoke 2: Create a project and verify it appears
1. Log in
2. Click "Create Project" on the projects page
3. Fill in project name and key
4. Submit the form
5. Verify the new project card appears in the list

### Smoke 3: Create a task on the Kanban board
1. Log in and navigate to a project's board
2. Click the "+" button on a column
3. Fill in task title
4. Submit the task form
5. Verify the task card appears in the correct column

### Smoke 4: View and edit a task
1. Log in and navigate to a project's board
2. Click a task card to open task detail
3. Edit the task title inline
4. Change the task status via the sidebar dropdown
5. Verify changes are reflected on the page

### Smoke 5: Add a comment to a task
1. Log in and navigate to a task detail page
2. Type a comment in the comment input
3. Submit the comment
4. Verify the comment appears in the thread

### Smoke 6: Search for a task and navigate to it
1. Log in
2. Open global search (Cmd+K or click search button)
3. Type a search query matching an existing task
4. Click a search result
5. Verify navigation to the correct task detail page

### Smoke 7: Admin views and manages users
1. Log in as admin
2. Navigate to `/admin/users`
3. Verify user list is displayed
4. Change a user's role via the role dropdown
5. Verify the role change is reflected

### Smoke 8: Project settings — manage members
1. Log in and navigate to a project's settings page
2. Add a member by email
3. Verify the member appears in the members table
4. Remove the member
5. Verify the member is removed from the table

---

## 4. API Helpers for Test Setup

The following API operations are recommended for building reusable test fixtures. All require an authenticated session cookie (obtained by logging in via the auth endpoint or through Playwright's browser context).

| Operation | Method | Endpoint | Key Fields |
|-----------|--------|----------|------------|
| Create project | POST | `/api/v1/projects` | `name`, `key` (2-5 uppercase letters), `description` |
| Delete project | DELETE | `/api/v1/projects/{id}` | Removes project + all tasks/comments |
| Add project member | POST | `/api/v1/projects/{id}/members` | `email` of existing user |
| Create task | POST | `/api/v1/projects/{id}/tasks` | `title`, `status`, `priority`, optional: `assigneeId`, `dueDate`, `description` |
| Update task | PATCH | `/api/v1/tasks/{id}` | Any subset of task fields |
| Delete task | DELETE | `/api/v1/tasks/{id}` | |
| Add comment | POST | `/api/v1/tasks/{id}/comments` | `body` |

**Authentication note:** The app uses cookie-based sessions via a cookie named `better-auth.session_token`. Playwright's `request` context can handle cookie management automatically when using the same browser context as the UI tests.
