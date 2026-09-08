import type { Task } from "./types.ts";

/* Placeholder rows so the UI has something to lay out.
   TODO: delete this file once src/lib/api.ts really calls the backend. */

const iso = (day: number, hour: number) =>
  new Date(Date.UTC(2026, 8, day, hour, 0, 0)).toISOString();

export const SAMPLE_TASKS: Task[] = [
  {
    id: "0f1d6d1e-6f5a-4a2b-9d3c-11aa22bb33cc",
    title: "Migrate SQLite to PostgreSQL",
    description: "sqlx::Postgres pool, rewrite migrations",
    status: "in_progress",
    created_at: iso(8, 9),
  },
  {
    id: "1a2b3c4d-5e6f-4708-8192-aabbccddeeff",
    title: "Wire task list to GET /tasks",
    description: "Vite proxy /api to 127.0.0.1:8080",
    status: "todo",
    created_at: iso(8, 11),
  },
  {
    id: "2b3c4d5e-6f70-4819-92a3-bbccddeeff00",
    title: "Add due_at to Task model",
    description: "Calendar needs it — lands with the SQL change",
    status: "todo",
    created_at: iso(7, 15),
  },
  {
    id: "3c4d5e6f-7081-492a-b3c4-ccddeeff0011",
    title: "Phase 8: config from env + graceful shutdown",
    description: "PORT, WORKERS, DATABASE_URL",
    status: "done",
    created_at: iso(5, 18),
  },
  {
    id: "4d5e6f70-8192-4a3b-c4d5-ddeeff001122",
    title: "Phase 7: filtering, pagination, sorting",
    description: "status, limit, offset on GET /tasks",
    status: "done",
    created_at: iso(4, 13),
  },
];
