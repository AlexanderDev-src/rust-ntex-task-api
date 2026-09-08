import { Icon } from "./Icon.tsx";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  requestLine: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  body,
  requestLine,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-border bg-panel p-5"
      >
        <span className="text-sm font-medium text-head">{title}</span>
        <span className="text-xs text-muted">{body}</span>
        <div className="flex items-center gap-2 pt-1">
          <span className="font-mono text-[11px] text-muted">{requestLine}</span>
          <div className="grow" />
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center rounded-lg border border-border px-3.5 text-sm text-text hover:bg-subtle"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-head px-3.5 text-sm text-bg"
          >
            <Icon name="trash" size={15} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
