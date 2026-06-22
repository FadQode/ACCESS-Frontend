export type LoadingOverlayProps = {
  open: boolean;
  title?: string;
  description?: string;
};

export function LoadingOverlay({
  description = "Please wait while we complete your request.",
  open,
  title = "Processing...",
}: LoadingOverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(19,35,31,0.42)] px-4 backdrop-blur-sm">
      <output
        aria-live="polite"
        className="w-full max-w-sm rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-5 text-center shadow-[var(--shadow-ops)]"
      >
        <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-[var(--signal-blue-soft)] border-t-[var(--signal-blue)]" />
        <p className="mt-4 text-sm font-semibold text-[var(--rail-ink)]">
          {title}
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
          {description}
        </p>
      </output>
    </div>
  );
}
