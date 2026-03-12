// ABOUTME: Shared constants for test accounts, URLs, and commonly-needed values.
// ABOUTME: Provides typed test account credentials and app configuration.

export const API_BASE = "/api/v1";

export interface TestAccount {
  email: string;
  password: string;
  role: "admin" | "user";
  displayName: string;
  storageStatePath: string;
}

export const TEST_ACCOUNTS = {
  admin: {
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    displayName: "Admin User",
    storageStatePath: ".auth/admin.json",
  },
  alice: {
    email: "alice@example.com",
    password: "password123",
    role: "user",
    displayName: "Alice",
    storageStatePath: ".auth/alice.json",
  },
  bob: {
    email: "bob@example.com",
    password: "password123",
    role: "user",
    displayName: "Bob",
    storageStatePath: ".auth/bob.json",
  },
} as const satisfies Record<string, TestAccount>;

export type TestAccountKey = keyof typeof TEST_ACCOUNTS;
