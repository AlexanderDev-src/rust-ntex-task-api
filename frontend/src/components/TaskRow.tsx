import type { Task } from "../lib/types.ts";
import { formatDayShort } from "../lib/date.ts";
import { Icon } from "./Icon.tsx";
import { StatusMark } from "./StatusMark.tsx";

type TaskRowProps = {
  task: Task;
  onCycleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export function TaskRow({ task, onCycleStatus, onEdit, onDelete }: TaskRowProps) {
  const done = task.status === "done";

  return (
    <div className="group flex min-h-14 items-center gap-3 border-b border-border px-3 py-3 last:border-b-0 sm:gap-3.5 sm:px-4.5">
      <button
        type="button"
        onClick={() => onCycleStatus(task)}
        aria-label={`Change status of ${task.title}`}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-subtle"
      >
        <StatusMark status={task.status} />
      </button>

      <div className="flex min-w-0 grow flex-col gap-0.5">
        <span
          className={`truncate text-sm font-medium ${
            done ? "text-muted line-through" : "text-head"
          }`}
        >
          {task.title}
        </span>
        {task.description ? (
          <span className="truncate text-xs text-muted">{task.description}</span>
        ) : null}
      </div>

      <span className="hidden font-mono text-xs text-muted sm:inline">
        {formatDayShort(task.created_at)}
      </span>

      <div className="flex items-center gap-1 text-muted">
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
          className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-subtle hover:text-head"
        >
          <Icon name="pencil" size={16} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Delete ${task.title}`}
          className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-subtle hover:text-head"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    </div>
  );
}
