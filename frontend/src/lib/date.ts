import type { Task } from "./types.ts";

export const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** Local-time day key, "2026-09-08". Also the shape of an <input type="date">. */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** The day a task belongs to on the calendar.
    TODO: switch to `due_at` here once the backend has it — this one line
    is the whole difference between "created on" and "due on". */
export function taskDayKey(task: Task): string {
  return dayKey(new Date(task.created_at));
}

export function sameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

/** Six-row Monday-first grid; days outside the month come back as null. */
export function monthMatrix(month: Date): (Date | null)[] {
  const first = startOfMonth(month);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let d = 1; d <= days; d += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function countByDay(tasks: Task[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const task of tasks) {
    const key = taskDayKey(task);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function formatMonth(month: Date): string {
  return month.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function formatDayLong(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDayShort(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
