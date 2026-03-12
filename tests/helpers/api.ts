// ABOUTME: REST API helper functions for test data setup and teardown.
// ABOUTME: Each function uses Playwright's APIRequestContext and targets /api/v1 endpoints.

import { APIRequestContext, APIResponse } from "@playwright/test";
import { API_BASE } from "./constants";

interface CreateProjectParams {
  name: string;
  key: string;
  description?: string;
}

interface CreateTaskParams {
  title: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  description?: string;
  dueDate?: string;
}

async function assertOk(response: APIResponse, context: string) {
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(
      `${context} failed with status ${response.status()}: ${body}`
    );
  }
}

export async function createProject(
  request: APIRequestContext,
  params: CreateProjectParams
) {
  const response = await request.post(`${API_BASE}/projects`, {
    data: params,
  });
  await assertOk(response, `createProject(${params.key})`);
  return response.json();
}

export async function deleteProject(
  request: APIRequestContext,
  projectId: string
) {
  const response = await request.delete(`${API_BASE}/projects/${projectId}`);
  await assertOk(response, `deleteProject(${projectId})`);
}

export async function addProjectMember(
  request: APIRequestContext,
  projectId: string,
  email: string
) {
  const response = await request.post(
    `${API_BASE}/projects/${projectId}/members`,
    { data: { email } }
  );
  await assertOk(response, `addProjectMember(${projectId}, ${email})`);
  return response.json();
}

export async function createTask(
  request: APIRequestContext,
  projectId: string,
  params: CreateTaskParams
) {
  const data = {
    title: params.title,
    status: params.status ?? "todo",
    priority: params.priority ?? "medium",
    ...(params.assigneeId !== undefined && { assigneeId: params.assigneeId }),
    ...(params.description !== undefined && { description: params.description }),
    ...(params.dueDate !== undefined && { dueDate: params.dueDate }),
  };
  const response = await request.post(
    `${API_BASE}/projects/${projectId}/tasks`,
    { data }
  );
  await assertOk(
    response,
    `createTask(${projectId}, "${params.title}")`
  );
  return response.json();
}

export async function updateTask(
  request: APIRequestContext,
  taskId: string,
  params: Partial<CreateTaskParams>
) {
  const response = await request.patch(`${API_BASE}/tasks/${taskId}`, {
    data: params,
  });
  await assertOk(response, `updateTask(${taskId})`);
  return response.json();
}

export async function deleteTask(
  request: APIRequestContext,
  taskId: string
) {
  const response = await request.delete(`${API_BASE}/tasks/${taskId}`);
  await assertOk(response, `deleteTask(${taskId})`);
}

export async function addComment(
  request: APIRequestContext,
  taskId: string,
  body: string
) {
  const response = await request.post(
    `${API_BASE}/tasks/${taskId}/comments`,
    { data: { body } }
  );
  await assertOk(response, `addComment(${taskId})`);
  return response.json();
}
