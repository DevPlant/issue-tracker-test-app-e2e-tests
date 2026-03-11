# Issue Tracker — E2E Testing with AI

A hands-on course for QA engineers learning to write Playwright end-to-end tests using AI coding assistants (Claude).

## What is this?

This repository is a guided, checkpoint-based tutorial. Each checkpoint contains a **prompt** you feed to Claude and a **reference result** showing what Claude produces. You practice by running the prompts yourself, then compare your output against the reference.

**Application under test:** [Issue Tracker](https://issues-demo.devplant.academy) — a Jira-like project management app with Kanban boards, task management, and team collaboration.

## Test Accounts

All accounts use the password: `password123`

| Name | Email | Role |
|------|-------|------|
| Admin User | admin@example.com | admin |
| Alice | alice@example.com | user |
| Bob | bob@example.com | user |

## Checkpoints

Each checkpoint has a tag pair: `cpNN-*-prompt` (before) and `cpNN-*-done` (after).

| # | Checkpoint | What you'll learn |
|---|------------|-------------------|
| 01 | **Project Setup** | Setting up a Playwright E2E testing project from scratch |
| 02 | **Explore the App** | Using AI to analyze an app spec and create a test plan |
| 03 | **Auth & Reusable Helpers** | Scaffolding auth fixtures, storage state, and shared utilities |
| 04 | **Smoke Tests** | Writing quick happy-path tests for core flows |
| 05 | **CRUD Tests** | Detailed tests for tasks, comments, and project settings |
| 06 | **Advanced Scenarios** | Admin panel, filters, search, and cross-user interactions |

## How to use

### Starting from scratch
```bash
git clone <this-repo>
```
Then open `checkpoints/01-setup/PROMPT.md` and feed it to Claude.

### Starting from a specific checkpoint
```bash
git checkout cp03-auth-prompt   # start from checkpoint 3
```
This gives you the codebase as it should look before that checkpoint's prompt is executed.

### Comparing your work
```bash
git diff cp04-smoke-prompt..cp04-smoke-done   # see what the reference implementation changed
```

## Prompts

Each checkpoint's `PROMPT.md` is a detailed, high-quality prompt designed to produce consistent results with Claude. They are not one-liners — they include context, constraints, and specific instructions that guide the AI toward a good solution.

You're encouraged to:
- Read the prompt carefully before running it
- Try it as-is first, then experiment with modifications
- Compare your results to the reference — differences are expected and fine
