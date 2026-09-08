import type { CreateTask, Task, TaskQuery, UpdateTask } from "./types.ts";
import { SAMPLE_TASKS } from "./sample.ts";

/* -------------------------------------------------------------------------
   THE ONLY FILE THAT SHOULD TALK TO THE BACKEND.

   Every function below returns sample data today. Each one carries the exact
   request to write in its place — swap the body, the UI needs no other change.

   TODO: set VITE_API_URL in frontend/.env.local, or leave it unset and
   add the dev proxy in vite.config.ts:
       server: { proxy: { "/api": { target: "http://127.0.0.1:8080",
                 changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, "") } } }
   ------------------------------------------------------------------------- */

export const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

/** Thrown on any non-2xx. `code` is the `error` field of src/error.rs. */
export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** GET /tasks?status=&limit=&offset= — serialises TaskQuery. */
export function taskQueryString(query: TaskQuery): string {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.offset !== undefined) params.set("offset", String(query.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/* TODO: write one shared helper and call it from all five functions:

     async function request<T>(path: string, init?: RequestInit): Promise<T>

   - fetch(`${BASE_URL}${path}`, { headers: { "content-type": "application/json" }, ...init })
   - on !res.ok: parse the body as ApiErrorBody and throw
     new ApiError(res.status, body.error, body.message)
   - 204/empty body (DELETE) must not hit res.json()
*/

const FAKE_LATENCY_MS = 350;

const pretend = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), FAKE_LATENCY_MS));

/** GET /tasks — 200 with Task[]. */
export async function listTasks(query: TaskQuery = {}): Promise<Task[]> {
  // TODO: return request<Task[]>(`/tasks${taskQueryString(query)}`);
  const filtered = query.status
    ? SAMPLE_TASKS.filter((t) => t.status === query.status)
    : SAMPLE_TASKS;
  const offset = query.offset ?? 0;
  const limit = query.limit ?? 20;
  return pretend(filtered.slice(offset, offset + limit));
}

/** GET /tasks/{id} — 200 with Task, or 404 not_found. */
export async function getTask(id: string): Promise<Task> {
  // TODO: return request<Task>(`/tasks/${id}`);
  const found = SAMPLE_TASKS.find((t) => t.id === id);
  if (!found) throw new ApiError(404, "not_found", "task not found");
  return pretend(found);
}

/** POST /tasks — 201 with the created Task, or 422 required on a bad title. */
export async function createTask(input: CreateTask): Promise<Task> {
  // TODO: return request<Task>("/tasks", { method: "POST", body: JSON.stringify(input) });
  if (input.title.trim().length < 1 || input.title.length > 200) {
    throw new ApiError(422, "required", "title must be 1-200 chars");
  }
  return pretend<Task>({
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description ?? null,
    status: "todo",
    created_at: new Date().toISOString(),
  });
}

/** PATCH /tasks/{id} — 200 with the updated Task, or 404 not_found. */
export async function updateTask(id: string, input: UpdateTask): Promise<Task> {
  // TODO: return request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  const found = SAMPLE_TASKS.find((t) => t.id === id);
  if (!found) throw new ApiError(404, "not_found", "task not found");
  return pretend<Task>({ ...found, ...input });
}

/** DELETE /tasks/{id} — 404 not_found if it is already gone. */
export async function deleteTask(id: string): Promise<void> {
  // TODO: await request<void>(`/tasks/${id}`, { method: "DELETE" });
  void id; // the sample client keeps no store, so there is nothing to remove
  await pretend(undefined);
}

/** GET /health — plain text "OK". Handy as a connection check on boot. */
export async function health(): Promise<string> {
  // TODO: const res = await fetch(`${BASE_URL}/health`); return res.text();
  return pretend("OK");
}
