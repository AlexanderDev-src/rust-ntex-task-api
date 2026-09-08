type ToastProps = {
  code: string | null;
  message: string | null;
  onDismiss: () => void;
};

export function Toast({ code, message, onDismiss }: ToastProps) {
  if (!message) return null;

  return (
    <button
      type="button"
      onClick={onDismiss}
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-xl border border-accent-border bg-accent-bg px-3.5 py-3 text-left backdrop-blur"
    >
      {code ? <span className="font-mono text-[11px] text-accent">{code}</span> : null}
      <span className="text-xs text-head">{message}</span>
    </button>
  );
}
