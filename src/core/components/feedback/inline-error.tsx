export type InlineErrorProps = {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function InlineError({
  message,
  onRetry,
  retryLabel = "Try again",
  title = "Something went wrong",
}: InlineErrorProps) {
  return (
    <div className="rounded-xl border border-[var(--signal-red-soft)] bg-[var(--surface-panel)] p-4">
      <p className="text-sm font-semibold text-[var(--signal-red-dark)]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
        {message}
      </p>
      {onRetry ? (
        <button
          className="mt-3 h-9 rounded-lg border border-[var(--signal-red-soft)] px-3 text-xs font-semibold text-[var(--signal-red-dark)] transition hover:bg-[var(--signal-red-soft)]"
          onClick={onRetry}
          type="button"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
