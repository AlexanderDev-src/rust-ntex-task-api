import type { TaskStatus } from "../lib/types.ts";
import { Icon } from "./Icon.tsx";

type StatusMarkProps = {
  status: TaskStatus;
  size?: number;
};

/** Todo = empty ring, in progress = half-filled ring, done = check. */
export function StatusMark({ status, size = 18 }: StatusMarkProps) {
  if (status === "done") {
    return <Icon name="check" size={size} strokeWidth={2} className="text-muted" />;
  }

  if (status === "in_progress") {
    return (
      <span
        style={{ width: size, height: size }}
        className="block shrink-0 rounded-full border-2 border-accent bg-[linear-gradient(90deg,var(--accent)_50%,transparent_50%)]"
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      className="block shrink-0 rounded-full border-2 border-border"
    />
  );
}
