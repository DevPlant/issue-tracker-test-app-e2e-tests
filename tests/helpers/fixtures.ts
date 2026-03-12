// ABOUTME: Custom Playwright test fixtures for authenticated API access and test project lifecycle.
// ABOUTME: Extends base test with reusable fixtures; tests import { test, expect } from here.

import { test as base, expect, APIRequestContext } from "@playwright/test";
import { TEST_ACCOUNTS } from "./constants";
import { createProject, deleteProject } from "./api";

interface TestProject {
  id: string;
  name: string;
  key: string;
}

type TestFixtures = {
  aliceApi: APIRequestContext;
  testProject: TestProject;
};

export const test = base.extend<TestFixtures>({
  aliceApi: async ({ playwright, baseURL }, use) => {
    const context = await playwright.request.newContext({
      baseURL: baseURL!,
      storageState: TEST_ACCOUNTS.alice.storageStatePath,
    });
    await use(context);
    await context.dispose();
  },

  testProject: async ({ aliceApi }, use) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const suffix = Array.from({ length: 4 }, () =>
      letters[Math.floor(Math.random() * letters.length)]
    ).join("");
    const key = suffix;
    const project = await createProject(aliceApi, {
      name: `Test Project ${Date.now()}`,
      key,
    });

    await use(project);

    await deleteProject(aliceApi, project.id);
  },
});

export { expect };
