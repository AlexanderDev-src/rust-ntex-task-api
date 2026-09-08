import type { TaskStatus } from "../lib/types.ts";
import { STATUS_LABEL, STATUS_ORDER } from "../lib/types.ts";

type FilterBarProps = {
  status: TaskStatus | null;
  onChange: (status: TaskStatus | null) => void;
  /** Rendered as-is next to the chips, so the request stays visible while wiring. */
  requestLine: string;
};

export function FilterBar({ status, onChange, requestLine }: FilterBarProps) {
  const chip = (active: boolean) =>
    `inline-flex h-9 items-center rounded-lg border px-3 text-sm transition-colors ${
      active
        ? "border-accent-border bg-accent-bg text-accent"
        : "border-border text-text hover:bg-subtle"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => onChange(null)} className={chip(status === null)}>
        All
      </button>
      {STATUS_ORDER.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={chip(status === value)}
        >
          {STATUS_LABEL[value]}
        </button>
      ))}
      <div className="grow" />
      <span className="font-mono text-xs text-muted">{requestLine}</span>
    </div>
  );
}
