import type { Theme } from "../hooks/useTheme.ts";
import { Icon } from "./Icon.tsx";

type HeaderProps = {
  theme: Theme;
  onToggleTheme: () => void;
  onNewTask: () => void;
};

export function Header({ theme, onToggleTheme, onNewTask }: HeaderProps) {
  const segment = (active: boolean) =>
    `inline-flex h-7 w-9 items-center justify-center rounded-md transition-colors ${
      active ? "bg-accent-bg text-accent" : "text-muted"
    }`;

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-4 sm:px-6">
      <div className="flex items-center gap-2.5 text-accent">
        <Icon name="logo" size={22} />
        <span className="text-base font-semibold tracking-tight text-head">Tasks</span>
      </div>
      <span className="hidden font-mono text-xs text-muted sm:inline">
        restapi · :8080
      </span>

      <div className="grow" />

      <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Light mode"
          aria-pressed={theme === "light"}
          className={segment(theme === "light")}
        >
          <Icon name="sun" size={16} />
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Dark mode"
          aria-pressed={theme === "dark"}
          className={segment(theme === "dark")}
        >
          <Icon name="moon" size={16} />
        </button>
      </div>

      <button
        type="button"
        onClick={onNewTask}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3.5 text-sm font-medium text-on-accent"
      >
        <Icon name="plus" size={16} strokeWidth={2} />
        <span className="hidden sm:inline">New task</span>
      </button>
    </header>
  );
}
