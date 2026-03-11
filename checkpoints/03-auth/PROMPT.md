# Checkpoint 03 — Auth & Reusable Helpers

## Prompt

Copy and paste the following prompt into Claude:

---

I have a Playwright E2E testing project set up for an issue tracker app. Now I need to scaffold the authentication infrastructure and reusable test helpers.

### Context

- **App URL**: https://issues-demo.devplant.academy
- **Auth mechanism**: Email/password login with cookie-based sessions (cookie: `better-auth.session_token`)
- **Test accounts** (all use password `password123`):
  - `admin@example.com` (admin role)
  - `alice@example.com` (regular user)
  - `bob@example.com` (regular user)
- **API base**: `/api/v1` — supports REST endpoints for projects, tasks, comments (see `docs/openapi.json`)
- **Test selectors**: The app uses `data-testid` attributes — see `docs/APP_SPEC.md` for the full reference

### What I need

#### 1. Auth storage state setup

Create a Playwright global setup that:
- Logs in as each test account (admin, alice, bob) via the UI
- Saves each session's storage state to separate files (e.g., `.auth/admin.json`, `.auth/alice.json`, `.auth/bob.json`)
- Add the `.auth/` directory to `.gitignore`

Update `playwright.config.ts` to:
- Run the auth setup as a dependency project (Playwright's `setup` project pattern)
- Create test projects that depend on the setup (e.g., a default project using Alice's session)
- Keep Chromium-only, sequential execution

#### 2. Test constants

Create `tests/helpers/constants.ts` with:
- Test account credentials (email, password, role, display name) as a typed object
- Base URL (from env or default)
- Any other commonly-needed constants

#### 3. API helpers

Create `tests/helpers/api.ts` with helper functions for test data setup via the REST API. These helpers should use Playwright's `APIRequestContext` and handle authentication.

Required helpers:
- `createProject(request, { name, key, description })` — creates a project, returns the created project object
- `deleteProject(request, projectId)` — deletes a project (and all its tasks/comments)
- `addProjectMember(request, projectId, email)` — adds a member to a project
- `createTask(request, projectId, { title, status?, priority?, assigneeId?, description?, dueDate? })` — creates a task, returns the created task object
- `deleteTask(request, taskId)` — deletes a task
- `addComment(request, taskId, body)` — adds a comment, returns the created comment

Each helper should:
- Accept a Playwright `APIRequestContext` as the first argument
- Use the `/api/v1/` base path
- Throw a descriptive error if the API call fails (include status code and response body)
- Return the parsed JSON response

#### 4. Test fixtures

Create `tests/helpers/fixtures.ts` that extends Playwright's `test` with custom fixtures:
- A fixture that provides an authenticated `APIRequestContext` for Alice (for API-based setup/teardown)
- A fixture that creates a test project (with a unique timestamped name) and cleans it up after the test
- Export the extended `test` and `expect` from this file so tests can use `import { test, expect } from '../helpers/fixtures'`

#### 5. Update the example test

Update `tests/example.spec.ts` to use the new auth infrastructure:
- Import from `../helpers/fixtures` instead of `@playwright/test`
- The test should now run as an authenticated user (Alice) using the storage state
- Verify it navigates to `/projects` (since authenticated users get redirected there)
- Keep it simple — this is just to verify the auth setup works

### Guidelines

- Use TypeScript throughout
- Keep helpers focused — each function does one thing
- Use descriptive error messages in API helpers (debugging failed test setup is painful)
- Follow Playwright best practices for the storage state / setup project pattern
- Don't over-abstract — we don't need a full page object model yet. Just the auth infra and API helpers.

After making all changes, run the tests to verify the auth setup works and the example test passes.

---

## What to expect

After running this prompt, Claude should:
1. Create a global setup file that authenticates all three test accounts
2. Update Playwright config with setup/dependency projects
3. Create API helper functions for test data management
4. Create custom test fixtures with project creation/cleanup
5. Update the example test to use authenticated sessions
6. Verify everything works by running the tests

## How to verify

```bash
npm test
```

You should see:
- A "setup" project that logs in as admin, alice, and bob
- The example test running as an authenticated user (Alice)
- All tests passing
