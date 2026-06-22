import type { ReactNode } from "react";
import { EmptyState } from "@/core/components/feedback/empty-state";
import { InlineError } from "@/core/components/feedback/inline-error";

export type ApiStateBoundaryProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  errorMessage?: string;
  loadingFallback?: ReactNode;
  emptyFallback?: ReactNode;
  errorFallback?: ReactNode;
  onRetry?: () => void;
  children: ReactNode;
};

export function ApiStateBoundary({
  children,
  emptyFallback,
  errorFallback,
  errorMessage = "Please check your connection and try again.",
  isEmpty = false,
  isError,
  isLoading,
  loadingFallback,
  onRetry,
}: ApiStateBoundaryProps) {
  if (isLoading) {
    return (
      loadingFallback ?? (
        <output
          aria-live="polite"
          className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 text-sm text-[var(--text-muted)]"
        >
          Loading...
        </output>
      )
    );
  }

  if (isError) {
    return (
      errorFallback ?? <InlineError message={errorMessage} onRetry={onRetry} />
    );
  }

  if (isEmpty) {
    return (
      emptyFallback ?? (
        <EmptyState
          description="Try changing the filter or search keyword."
          title="No data found"
        />
      )
    );
  }

  return children;
}
