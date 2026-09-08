import type { Task } from "../lib/types.ts";
import { Icon } from "./Icon.tsx";
import { TaskRow } from "./TaskRow.tsx";

type TaskListProps = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onCycleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onNewTask: () => void;
  onRetry: () => void;
};

function Skeleton() {
  return (
    <div className="flex flex-col">
      {[85, 70, 92, 60].map((width) => (
        <div key={width} className="flex items-center gap-3.5 border-b border-border px-4.5 py-4 last:border-b-0">
          <span className="size-4.5 shrink-0 rounded-full bg-subtle" />
          <span className="flex grow flex-col gap-1.5">
            <span className="block h-2.5 rounded bg-subtle" style={{ width: `${width}%` }} />
            <span className="block h-2 rounded bg-subtle" style={{ width: `${width - 25}%` }} />
          </span>
        </div>
      ))}
    </div>
  );
}

function Empty({ onNewTask }: { onNewTask: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <Icon name="calendar" size={40} strokeWidth={1.2} className="text-border" />
      <span className="text-[15px] font-medium text-head">No tasks yet</span>
      <span className="max-w-64 text-xs text-muted">
        Everything you add shows up here and on the calendar.
      </span>
      <button
        type="button"
        onClick={onNewTask}
        className="mt-1 inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3.5 text-sm text-on-accent"
      >
        <Icon name="plus" size={16} strokeWidth={2} />
        New task
      </button>
    </div>
  );
}

function Failed({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="text-[15px] font-medium text-head">Could not load tasks</span>
      <span className="max-w-72 text-xs text-muted">{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 inline-flex h-9 items-center rounded-lg border border-border px-3.5 text-sm text-text hover:bg-subtle"
      >
        Try again
      </button>
    </div>
  );
}

export function TaskList({
  tasks,
  loading,
  error,
  onCycleStatus,
  onEdit,
  onDelete,
  onNewTask,
  onRetry,
}: TaskListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-panel">
      {loading ? (
        <Skeleton />
      ) : error ? (
        <Failed message={error} onRetry={onRetry} />
      ) : tasks.length === 0 ? (
        <Empty onNewTask={onNewTask} />
      ) : (
        tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onCycleStatus={onCycleStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}
