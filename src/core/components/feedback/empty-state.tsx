export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  actionLabel,
  description,
  onAction,
  title,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--rail-border)] bg-[var(--surface-panel)] p-6 text-center">
      <p className="text-sm font-semibold text-[var(--rail-ink)]">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          className="mt-4 h-10 rounded-lg bg-[var(--rail-ink)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--signal-blue)]"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
