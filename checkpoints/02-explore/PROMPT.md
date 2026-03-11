# Checkpoint 02 — Explore the App & Create a Test Plan

## Prompt

Copy and paste the following prompt into Claude:

---

I'm setting up E2E tests for an issue tracker web application. Before writing any tests, I need you to study the application thoroughly and produce a structured test plan.

### Application docs

The following documents describe the application in detail:

- `docs/APP_SPEC.md` — Full feature specification with UI behavior, page routes, and `data-testid` selectors
- `docs/openapi.json` — OpenAPI spec for the REST API (base path: `/api/v1`)

Please read both files carefully.

### About the application

- **Live URL**: https://issues-demo.devplant.academy
- **API docs**: https://issues-demo.devplant.academy/api/docs
- **Test accounts** (all use password `password123`):
  - `admin@example.com` (admin role)
  - `alice@example.com` (regular user)
  - `bob@example.com` (regular user)

### What I need you to produce

Create a file `docs/TEST_PLAN.md` with a structured test plan. Organize it as follows:

**1. Test areas** — Group tests by feature area matching the app spec sections:
   - Authentication (login, registration, session)
   - Projects (list, create, navigation)
   - Kanban Board (columns, drag-and-drop, task cards, context menu)
   - Task List View (table, sorting, filtering)
   - Task Detail (view, inline editing, sidebar fields)
   - Comments (add, edit, delete)
   - Project Settings (edit details, manage members, delete project)
   - User Profile (profile info, notifications, password change)
   - Admin Panel (user list, role changes, bulk operations)
   - Global Search (Cmd+K, search results, navigation)

**2. For each test area**, list specific test cases with:
   - A short descriptive name (this will become the test title)
   - Priority: **P0** (critical path — must never break), **P1** (important functionality), or **P2** (edge cases and nice-to-haves)
   - Any relevant `data-testid` selectors from the spec
   - Notes on test data setup needed (e.g., "needs an existing project with tasks")

**3. Test data strategy** — Document what test data the tests will need:
   - Which test accounts to use and for what purpose
   - Whether tests should create their own data or rely on seeded data
   - How to handle cleanup between tests
   - Recommend using unique names with timestamps to avoid collisions between test runs

**4. Critical paths** — Identify the top 5-8 user journeys that are most important to test (these become our smoke tests in a later checkpoint).

### Guidelines

- Be thorough but practical. Focus on what's testable through the UI.
- Don't plan tests for things that are purely visual (animations, exact colors) unless they indicate state (e.g., overdue dates shown in red).
- Drag-and-drop testing with Playwright is tricky — note it as a test case but flag it as potentially complex.
- For the API, we won't write separate API tests. But note where API calls might be useful for test setup (e.g., creating projects/tasks via API before testing UI flows).
- The app uses `data-testid` attributes extensively — prefer these for selectors over CSS classes or text content.

---

## What to expect

Claude should produce a `docs/TEST_PLAN.md` with:
- 50-80+ test cases organized by feature area
- Clear priority labels (P0/P1/P2)
- A practical test data strategy
- Identified critical paths for smoke testing

## How to verify

Review the test plan and check that:
- All major features from APP_SPEC.md are covered
- Test cases are specific enough to implement (not vague like "test the board works")
- The data-testid selectors referenced actually exist in the spec
- The critical paths make sense as the most important user journeys
