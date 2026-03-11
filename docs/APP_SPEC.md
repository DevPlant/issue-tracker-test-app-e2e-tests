# Issue Tracker — Application Specification

A Jira-like issue tracking application with project management, Kanban boards, task management, and team collaboration features.

**Live URL:** https://issues-demo.devplant.academy

---

## Table of Contents

- [Authentication](#authentication)
- [Navigation & Layout](#navigation--layout)
- [Projects](#projects)
- [Kanban Board](#kanban-board)
- [Task List View](#task-list-view)
- [Task Detail](#task-detail)
- [Comments](#comments)
- [Project Settings](#project-settings)
- [User Profile](#user-profile)
- [Admin Panel](#admin-panel)
- [Global Search](#global-search)
- [REST API](#rest-api)
- [Data Model Reference](#data-model-reference)
- [Test Accounts](#test-accounts)
- [Test Selectors](#test-selectors)

---

## Authentication

### Login Page — `/login`

- Email and password fields with client-side validation
- Email must be a valid email format
- Password is required
- Field-level error messages displayed below each input
- General error message displayed above the form (e.g., "Invalid credentials")
- "Sign In" submit button
- Link to registration page ("Don't have an account? Register")
- On successful login, redirects to `/projects`

### Registration Page — `/register`

- Fields: Name, Email, Password, Confirm Password
- Validation:
  - Name: required
  - Email: valid email format, must be unique
  - Password: required (minimum 8 characters)
  - Confirm Password: must match Password
- Field-level error messages below each input
- General error message above the form
- "Create Account" submit button
- Link to login page ("Already have an account? Login")
- On successful registration, redirects to `/projects`

### Session Management

- Cookie-based authentication
- Unauthenticated users are redirected to `/login` when accessing any app page
- API routes return 401 Unauthorized for unauthenticated requests

---

## Navigation & Layout

### Sidebar (left side, persistent)

- **Logo:** Bug icon with text "Issue Tracker" — links to `/projects`
- **Nav items:**
  - "Projects" (FolderKanban icon) — links to `/projects`
- **Admin section** (visible only to admin users):
  - "Admin" section label
  - "Users" (ShieldCheck icon) — links to `/admin/users`
- **Collapse/expand toggle:** Sidebar collapses to icon-only mode (persists in state)
  - Collapsed: shows icon-only with tooltips on hover
  - Expanded: shows icon + label (width ~240px)

### Top Bar (top, persistent)

- Mobile hamburger menu (visible on small screens) — opens sidebar as a sheet overlay
- Global search component (right side)
- User menu (far right)

### User Menu

- Trigger: Avatar button showing user initials or profile image
- Dropdown contents:
  - User's display name
  - User's email
  - "Profile" link → `/profile`
  - "Sign Out" — signs out and redirects to `/login`

---

## Projects

### Projects List Page — `/projects`

- Displays all projects the current user is a member of
- "Create Project" button in the top-right area
- Each project is a card showing:
  - Project name
  - Project key (as a badge, e.g., "DEV")
  - Description (truncated to 2 lines)
  - Avatar stack of project members (max 3 visible, "+N more" indicator)
- Clicking a project card navigates to `/projects/{key}/board`
- Empty state when user has no projects

### Create Project — Simple Form (Dialog)

- Triggered by "Create Project" button
- Fields:
  - **Name** (required, 2–100 characters)
  - **Key** (required, 2–5 uppercase letters) — auto-generated from name, editable
  - **Description** (optional, max 500 characters)
- Key auto-generation: strips non-alpha characters, uppercases, takes first 4 characters
- Key field only accepts uppercase letters
- Cancel and "Create Project" buttons
- On success: closes dialog, refreshes project list

### Create Project — Multi-Step Wizard (Dialog)

A 3-step wizard with progress bar:

**Step 1 — Details (1/3):**
- Name, Key (with auto-generation), Description fields
- Same validation as simple form
- "Cancel" and "Next" buttons

**Step 2 — Members (2/3):**
- Email input + "Add" button
- Enter key submits the email
- Validation: valid email format, no duplicates
- Added members shown as a list with remove (X) buttons
- "Back" and "Next" buttons

**Step 3 — Review (3/3):**
- Read-only summary of all entered values
- Project name, key (as badge), description
- Members list (as badges) or "No additional members"
- "Back" and "Create Project" buttons

### Project Sub-Navigation — `/projects/{key}/*`

When inside a project, a breadcrumb and tab navigation appear:

- **Breadcrumb:** "Projects" (link) > "{Project Name}"
- **Tabs:** Board | List | Settings
  - Board → `/projects/{key}/board`
  - List → `/projects/{key}/list`
  - Settings → `/projects/{key}/settings`

---

## Kanban Board

### Board Page — `/projects/{key}/board`

A drag-and-drop Kanban board with 5 columns representing task statuses:

| Column | Status Value |
|--------|-------------|
| Backlog | `backlog` |
| To Do | `todo` |
| In Progress | `in_progress` |
| In Review | `in_review` |
| Done | `done` |

**Column features:**
- Column header with status name and task count badge
- "+" button to create a new task with that status pre-selected
- Tasks are vertically sortable within and across columns

**Drag and drop:**
- Drag a task card to reorder within the same column
- Drag a task card to a different column to change its status
- Drop position determines sort order
- Changes are applied optimistically (UI updates immediately)

### Board Filters

Filter bar above the board with:
- **Search input** — filters by task title or key
- **Assignee dropdown** — filter by assignee (includes "All Assignees" and specific members)
- **Priority dropdown** — filter by priority level
- **Clear button** — appears when any filter is active, resets all filters
- Filters are stored in URL query parameters (`?search=...&assignee=...&priority=...`)

### Task Card (on the board)

Each card displays:
- Task key (e.g., "DEV-1") — clickable, navigates to task detail
- Task title — clickable, navigates to task detail
- Priority badge (color-coded)
- Due date (if set) — shows in red with alert icon if overdue and not done
- Assignee avatar (if assigned)

**Context menu** (three-dot "more" button):
- **Status submenu:** Change to any of the 5 statuses
- **Priority submenu:** Change to any of the 5 priorities (lowest, low, medium, high, critical)
- **Assignee submenu:** "Unassigned" + list of all project members
- **Delete:** Removes the task (red text)

---

## Task List View

### List Page — `/projects/{key}/list`

A sortable table view of all project tasks.

**Columns:**
| Column | Sortable | Notes |
|--------|----------|-------|
| Key | Yes | Alphabetical, links to task detail |
| Title | Yes | Alphabetical |
| Status | Yes | Custom order: backlog → todo → in_progress → in_review → done |
| Priority | Yes | Custom order: lowest → low → medium → high → critical |
| Assignee | No | Avatar + name, or "Unassigned" |
| Due | Yes | Chronological; overdue shown in red with alert icon |
| Created | Yes | Chronological |
| Updated | Yes | Chronological |

- Click a column header to sort; click again to toggle ascending/descending
- Same filter bar as the board view (search, assignee, priority)

---

## Task Detail

### Task Detail Page — `/projects/{key}/task/{taskKey}`

**Main content area (left):**
- **Task key** (read-only, e.g., "DEV-1")
- **Title** — click to edit inline; press Enter or blur to save
- **Description** — rendered as Markdown; click to edit in a textarea; Save/Cancel buttons
- **Comment thread** (see [Comments](#comments) section)

**Sidebar (right):**
- **Status** — dropdown select (5 options)
- **Priority** — dropdown select (5 options)
- **Assignee** — searchable combobox with project members + "Unassigned" option
- **Due Date** — date picker with calendar popup; clear (X) button to remove
- **Reporter** — read-only, shows avatar + name
- **Created** — read-only timestamp
- **Updated** — read-only timestamp

All field changes save immediately on selection.

---

## Comments

### Comment Thread (on task detail page)

**Existing comments** displayed chronologically, each showing:
- Author avatar (initials)
- Author name
- Timestamp
- Comment body (plain text)

**Author-only actions** (edit/delete buttons visible only on own comments):
- **Edit** (pencil icon): replaces body with textarea + Save/Cancel buttons
- **Delete** (trash icon, red)

**Add comment form:**
- Textarea placeholder: "Add a comment..."
- "Comment" submit button (disabled when empty or submitting)

---

## Project Settings

### Settings Page — `/projects/{key}/settings`

**Project Details section:**
- Name input (editable)
- Key input (read-only/disabled)
- Description textarea (editable)
- "Save Changes" button

**Members section:**
- Add member: email input + "Add Member" button
  - Validates: user must exist, must not already be a member
  - Error message displayed below input
- Members table:
  - Columns: User (avatar + name), Email, Role (badge), Actions
  - Remove button (X) per member row

**Danger Zone section:**
- "Delete Project" button (destructive styling)
- Confirmation dialog: requires explicit confirmation before deletion
- Deletes the project and all associated data

---

## User Profile

### Profile Page — `/profile`

Tabbed interface with 3 tabs:

#### Profile Tab
- **Your Information:**
  - Avatar display (large)
  - Email (read-only/disabled)
  - Display Name (editable input)
  - Avatar URL (editable input)
  - "Save Changes" button
- **Your Projects:**
  - List of projects the user belongs to
  - Each shows: project icon, name, key badge, role badge (admin/member)
  - Each links to `/projects/{key}/board`
  - Empty state message if no projects

#### Notifications Tab
- **Master toggle:** "Email notifications" switch
  - When off, all sub-options are disabled/faded
- **Notification types** (checkboxes, only active when master toggle is on):
  - "Assigned to me"
  - "Comment on my task"
  - "Status changed on my task"
  - "Added to or removed from a project"
- "Save Preferences" button

#### Security Tab
- **Change Password form:**
  - Current Password input
  - New Password input (8–128 characters)
  - Confirm Password input (must match New Password)
  - "Change Password" button
  - Error message display above form
  - Toast notification on success, form resets

---

## Admin Panel

### Admin Users Page — `/admin/users`

Only accessible to users with the `admin` role. Non-admin users do not see the Admin section in the sidebar.

**User table:**
- Columns: Checkbox, User (avatar + name), Email, Role, Joined
- **Select-all checkbox** in header (supports indeterminate state)
- Per-row checkbox to select users (cannot select yourself)
- Role column: dropdown to change individual user's role (`admin` / `user`)

**Bulk operations** (visible when users are selected):
- Selection count badge (e.g., "3 selected")
- "Change Role" dropdown: "Set as Admin" / "Set as User"
- "Clear Selection" button
- Confirmation dialog before applying bulk role change

---

## Global Search

- Trigger: Search icon button with "Search tasks..." label and `⌘K` / `Ctrl+K` keyboard shortcut
- Opens a command palette dialog
- Search input with debounced search (300ms delay)
- Results show: project key badge, task key, task title
- Up to 20 results returned
- Selecting a result navigates to `/projects/{projectKey}/task/{taskKey}`
- "Searching..." loading indicator while fetching

---

## REST API

Base URL: `/api/v1`

All endpoints require cookie-based session authentication. Interactive API documentation is available at `/api/docs` (Scalar UI).

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects the user is a member of |
| POST | `/projects` | Create a new project |
| GET | `/projects/{id}` | Get project by ID or key |
| PATCH | `/projects/{id}` | Update project name/description |
| DELETE | `/projects/{id}` | Delete project |

### Project Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/{id}/members` | List project members |
| POST | `/projects/{id}/members` | Add member by email |
| DELETE | `/projects/{id}/members/{userId}` | Remove member |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks?q={query}` | Search tasks globally (max 20 results) |
| GET | `/projects/{id}/tasks` | List project tasks (filterable) |
| POST | `/projects/{id}/tasks` | Create task |
| GET | `/tasks/{id}` | Get task with comments |
| PATCH | `/tasks/{id}` | Update task fields |
| DELETE | `/tasks/{id}` | Delete task |
| POST | `/tasks/{id}/move` | Move task (status + sort order) |

**Task list query parameters:** `status`, `priority`, `assigneeId` (or `__unassigned__`), `q` (search)

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/{id}/comments` | List task comments |
| POST | `/tasks/{id}/comments` | Add comment |
| PATCH | `/comments/{id}` | Update comment (author only) |
| DELETE | `/comments/{id}` | Delete comment (author only) |

---

## Data Model Reference

### Task Statuses

| Value | Display Label |
|-------|--------------|
| `backlog` | Backlog |
| `todo` | To Do |
| `in_progress` | In Progress |
| `in_review` | In Review |
| `done` | Done |

### Task Priorities

| Value | Display Label |
|-------|--------------|
| `lowest` | Lowest |
| `low` | Low |
| `medium` | Medium |
| `high` | High |
| `critical` | Critical |

### User Roles (system-level)

| Value | Description |
|-------|-------------|
| `admin` | Can access admin panel, manage all users |
| `user` | Standard user |

### Project Member Roles

| Value | Description |
|-------|-------------|
| `admin` | Project admin (creator gets this by default) |
| `member` | Regular project member |

### Task Keys

Tasks are assigned auto-incrementing keys per project: `{PROJECT_KEY}-{N}` (e.g., `DEV-1`, `DEV-2`, `QA-1`).

---

## Test Accounts

All accounts use the password: `password123`

| Name | Email | Role |
|------|-------|------|
| Admin User | admin@example.com | admin |
| Alice | alice@example.com | user |
| Bob | bob@example.com | user |

---

## Test Selectors

The application includes `data-testid` attributes on interactive elements throughout the UI to support automated testing. Below is a reference of the available selectors organized by area.

### Authentication

| Selector | Element | Page |
|----------|---------|------|
| `login-card` | Login form card | /login |
| `login-error` | Error message | /login |
| `login-email-input` | Email input | /login |
| `login-email-error` | Email validation error | /login |
| `login-password-input` | Password input | /login |
| `login-password-error` | Password validation error | /login |
| `login-submit-button` | Sign in button | /login |
| `login-register-link` | Link to register | /login |
| `register-card` | Registration form card | /register |
| `register-error` | Error message | /register |
| `register-name-input` | Name input | /register |
| `register-name-error` | Name validation error | /register |
| `register-email-input` | Email input | /register |
| `register-email-error` | Email validation error | /register |
| `register-password-input` | Password input | /register |
| `register-password-error` | Password validation error | /register |
| `register-confirm-password-input` | Confirm password input | /register |
| `register-confirm-password-error` | Confirm password validation error | /register |
| `register-submit-button` | Create account button | /register |
| `register-login-link` | Link to login | /register |

### Layout & Navigation

| Selector | Element |
|----------|---------|
| `app-shell` | Main app layout wrapper |
| `sidebar` | Sidebar navigation |
| `sidebar-logo` | Logo link (expanded) |
| `sidebar-logo-icon` | Logo link (collapsed) |
| `sidebar-toggle` | Collapse/expand button |
| `sidebar-nav-projects` | Projects nav link |
| `sidebar-nav-users` | Admin Users nav link |
| `top-bar` | Top bar |
| `mobile-menu-toggle` | Mobile hamburger button |
| `user-menu-trigger` | User avatar button |
| `user-menu-dropdown` | User menu content |
| `user-menu-name` | User name in menu |
| `user-menu-email` | User email in menu |
| `user-menu-profile` | Profile link |
| `user-menu-signout` | Sign out button |
| `global-search-trigger` | Search button |
| `global-search-input` | Search input in dialog |
| `search-result-{taskKey}` | Search result item |

### Projects

| Selector | Element |
|----------|---------|
| `projects-page` | Projects page wrapper |
| `create-project-button` | Create project button |
| `projects-empty-state` | Empty state when no projects |
| `project-card-{key}` | Project card (e.g., `project-card-DEV`) |
| `project-key-{key}` | Project key badge |
| `avatar-stack` | Member avatar stack |
| `project-nav` | Project sub-navigation tabs |
| `project-nav-board` | Board tab link |
| `project-nav-list` | List tab link |
| `project-nav-settings` | Settings tab link |
| `project-detail` | Project detail layout wrapper |
| `breadcrumb-projects` | Breadcrumb "Projects" link |
| `breadcrumb-project-name` | Breadcrumb project name |

### Project Form (Simple)

| Selector | Element |
|----------|---------|
| `project-form-dialog` | Dialog wrapper |
| `project-form-error` | Error message |
| `project-form-name-input` | Name input |
| `project-form-key-input` | Key input |
| `project-form-description-input` | Description textarea |
| `project-form-cancel-button` | Cancel button |
| `project-form-submit-button` | Submit button |

### Project Wizard (Multi-Step)

| Selector | Element |
|----------|---------|
| `project-wizard-dialog` | Dialog wrapper |
| `wizard-progress` | Progress bar |
| `wizard-error` | Error message |
| `wizard-back-button` | Back button |
| `wizard-next-button` | Next button |
| `wizard-create-button` | Create button (final step) |
| `wizard-name-input` | Name input (step 1) |
| `wizard-key-input` | Key input (step 1) |
| `wizard-description-input` | Description textarea (step 1) |
| `wizard-member-email-input` | Email input (step 2) |
| `wizard-add-member-button` | Add member button (step 2) |
| `wizard-member-error` | Member error message (step 2) |
| `wizard-member-list` | Members list (step 2) |
| `wizard-member-{email}` | Member item (step 2) |
| `wizard-remove-member-{email}` | Remove member button (step 2) |
| `wizard-no-members` | No members message (step 2) |
| `wizard-review` | Review section (step 3) |
| `wizard-review-name` | Review name value |
| `wizard-review-key` | Review key value |
| `wizard-review-description` | Review description value |
| `wizard-review-members` | Review members list |
| `wizard-review-no-members` | Review no-members message |

### Kanban Board

| Selector | Element |
|----------|---------|
| `board-page` | Board page wrapper |
| `kanban-board` | Board container |
| `board-column-{status}` | Column (e.g., `board-column-todo`) |
| `column-count-{status}` | Task count badge per column |
| `column-add-task-{status}` | "+" add task button per column |
| `board-filters` | Filter bar |
| `filter-search` | Search input |
| `filter-assignee` | Assignee dropdown trigger |
| `filter-priority` | Priority dropdown trigger |
| `filter-clear` | Clear filters button |

### Task Cards (Board)

| Selector | Element |
|----------|---------|
| `task-card-{taskKey}` | Card container (e.g., `task-card-DEV-1`) |
| `task-link-{taskKey}` | Clickable link on card |
| `task-menu-{taskKey}` | Three-dot menu button |
| `task-menu-content-{taskKey}` | Menu dropdown content |
| `task-status-{status}` | Status menu option |
| `task-priority-{priority}` | Priority menu option |
| `task-assignee-unassigned` | Unassigned option |
| `task-assignee-{userId}` | Assignee option |
| `task-delete-{taskKey}` | Delete option |
| `task-priority-badge-{taskKey}` | Priority badge on card |
| `task-due-date-{taskKey}` | Due date on card |

### Task List (Table)

| Selector | Element |
|----------|---------|
| `list-page` | List page wrapper |
| `task-list-table` | Table container |
| `sort-{field}` | Sortable column header (e.g., `sort-key`, `sort-title`, `sort-status`) |
| `task-row-{taskKey}` | Table row |
| `task-list-link-{taskKey}` | Task key link in row |
| `task-due-date-{taskKey}` | Due date cell |

### Task Form (Create)

| Selector | Element |
|----------|---------|
| `task-form-dialog` | Dialog wrapper |
| `task-form-error` | Error message |
| `task-form-title-input` | Title input |
| `task-form-description-input` | Description textarea |
| `task-form-status-select` | Status dropdown trigger |
| `task-form-status-{status}` | Status option |
| `task-form-priority-select` | Priority dropdown trigger |
| `task-form-priority-{priority}` | Priority option |
| `task-form-cancel-button` | Cancel button |
| `task-form-submit-button` | Create button |

### Task Detail

| Selector | Element |
|----------|---------|
| `task-page` | Task page wrapper |
| `task-detail` | Detail container |
| `task-detail-key` | Task key display |
| `task-detail-title` | Title display |
| `task-detail-title-input` | Title edit input |
| `task-detail-description` | Description display (Markdown) |
| `task-detail-description-input` | Description edit textarea |
| `task-detail-description-save` | Description save button |
| `task-detail-description-cancel` | Description cancel button |
| `task-detail-sidebar` | Right sidebar |
| `task-detail-status-select` | Status dropdown |
| `task-detail-priority-select` | Priority dropdown |

### Comments

| Selector | Element |
|----------|---------|
| `comment-thread` | Comment section wrapper |
| `comment-{id}` | Individual comment |
| `comment-edit-{id}` | Edit button |
| `comment-delete-{id}` | Delete button |
| `comment-edit-input-{id}` | Edit textarea |
| `comment-edit-save-{id}` | Save edit button |
| `comment-edit-cancel-{id}` | Cancel edit button |
| `comment-form` | Add comment form |
| `comment-input` | Comment textarea |
| `comment-submit-button` | Submit button |

### Project Settings

| Selector | Element |
|----------|---------|
| `settings-page` | Settings page wrapper |
| `settings-name-input` | Project name input |
| `settings-key-input` | Project key input (disabled) |
| `settings-description-input` | Description textarea |
| `settings-save-button` | Save changes button |
| `settings-member-email-input` | Add member email input |
| `settings-add-member-button` | Add member button |
| `settings-member-error` | Member error message |
| `member-row-{userId}` | Member table row |
| `remove-member-{userId}` | Remove member button |
| `settings-delete-button` | Delete project button |
| `delete-project-dialog` | Delete confirmation dialog |
| `confirm-delete-button` | Confirm delete button |

### Profile

| Selector | Element |
|----------|---------|
| `profile-page` | Profile page wrapper |
| `profile-tabs` | Tabs container |
| `profile-tabs-list` | Tab button list |
| `profile-tab-trigger` | Profile tab button |
| `notifications-tab-trigger` | Notifications tab button |
| `security-tab-trigger` | Security tab button |
| `profile-tab-content` | Profile tab content |
| `notifications-tab-content` | Notifications tab content |
| `security-tab-content` | Security tab content |
| `profile-avatar` | User avatar |
| `profile-email` | Email input (disabled) |
| `profile-name-input` | Display name input |
| `profile-image-input` | Avatar URL input |
| `profile-save-button` | Save changes button |
| `profile-projects` | Projects list section |
| `profile-project-{key}` | Project link |

### Notifications Settings

| Selector | Element |
|----------|---------|
| `notification-master-toggle` | Master toggle container |
| `notification-email-switch` | Email notifications switch |
| `notification-options` | Options container |
| `notification-assignment-checkbox` | Assignment notification checkbox |
| `notification-comment-checkbox` | Comment notification checkbox |
| `notification-status-checkbox` | Status change notification checkbox |
| `notification-membership-checkbox` | Membership notification checkbox |
| `notification-save-button` | Save preferences button |

### Security

| Selector | Element |
|----------|---------|
| `change-password-form` | Password change form |
| `password-form-error` | Error message |
| `current-password-input` | Current password input |
| `new-password-input` | New password input |
| `confirm-password-input` | Confirm password input |
| `change-password-button` | Submit button |

### Admin

| Selector | Element |
|----------|---------|
| `admin-users-page` | Admin page wrapper |
| `admin-user-list` | User table container |
| `bulk-select-all` | Select-all checkbox |
| `admin-user-row-{userId}` | User table row |
| `bulk-select-{userId}` | Per-user checkbox |
| `admin-role-select-{userId}` | Role dropdown per user |
| `bulk-action-bar` | Bulk action bar (visible when selected) |
| `bulk-selection-count` | Selection count badge |
| `bulk-role-select` | Bulk role change dropdown |
| `bulk-clear-button` | Clear selection button |
| `bulk-confirm-dialog` | Bulk action confirmation dialog |
| `bulk-confirm-cancel` | Cancel bulk action |
| `bulk-confirm-action` | Confirm bulk action |
