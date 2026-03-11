# Checkpoint 01 — Project Setup

## Prompt

Copy and paste the following prompt into Claude:

---

I need you to set up a Playwright end-to-end testing project from scratch. This project will contain E2E tests for a web application that is already deployed and running.

### About the application under test

- **URL**: https://issues-demo.devplant.academy
- **What it is**: A Jira-like issue tracker with projects, Kanban boards, task management, comments, and an admin panel
- **Auth**: Email/password login with cookie-based sessions
- **Tech**: It's a Next.js app, but that doesn't matter for our tests — we're testing it as a black box through the browser

### What I need you to set up

**Package & dependencies:**
- Initialize a new Node.js project with `package.json`
- Install Playwright with `@playwright/test` and install browsers
- Use TypeScript for all test files
- Add a `tsconfig.json` appropriate for a Playwright project

**Playwright configuration (`playwright.config.ts`):**
- Base URL: `https://issues-demo.devplant.academy`
- Only use Chromium (we don't need cross-browser testing for this course)
- Reasonable timeouts: 30s for tests, 10s for actions/navigation
- Take a screenshot on failure
- HTML reporter for viewing results locally
- Retain test traces on failure (for debugging)
- Run tests sequentially for now (workers: 1) — we'll deal with parallelism later

**Folder structure:**
- `tests/` — where test files will go
- `tests/helpers/` — for shared utilities and helpers
- Create a placeholder test file `tests/example.spec.ts` with a single simple test that verifies the app's login page loads (navigate to `/login` and check that the page contains a sign-in form). This confirms the setup works.

**Scripts in package.json:**
- `test` — run all tests
- `test:ui` — run tests with Playwright UI mode
- `test:headed` — run tests in headed mode (visible browser)
- `test:report` — open the HTML report

**Other:**
- Add a `.gitignore` if one doesn't exist (or update the existing one) to exclude `node_modules/`, `test-results/`, `playwright-report/`, `.env` files, and any Playwright state directories
- Do NOT set up authentication helpers yet — that comes in a later checkpoint

After setup, run the placeholder test to verify everything works.

---

## What to expect

After running this prompt, Claude should:
1. Create `package.json` with Playwright and TypeScript dependencies
2. Create `playwright.config.ts` with the specified settings
3. Create `tsconfig.json`
4. Create the folder structure with a working placeholder test
5. Install dependencies and run the test to verify it passes

## How to verify

```bash
npm test
```

You should see Playwright run one test that navigates to the login page and confirms the form is present.
