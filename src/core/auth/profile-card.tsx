import { UserAvatar } from "@/core/auth/user-avatar";
import type { AuthUser } from "@/core/dashboard/model/types/auth.types";

export type ProfileCardProps = {
  isError?: boolean;
  isLoading?: boolean;
  roleLabel?: string;
  user?: AuthUser | null;
};

export function ProfileCard({
  isError = false,
  isLoading = false,
  roleLabel = "unknown",
  user,
}: ProfileCardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-[var(--surface-muted)]" />
        <div className="min-w-0 flex-1">
          <div className="h-3 w-28 animate-pulse rounded-full bg-[var(--surface-muted)]" />
          <div className="mt-2 h-2.5 w-36 animate-pulse rounded-full bg-[var(--surface-muted)]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm">
        <p className="font-semibold text-[var(--rail-ink)]">
          Unable to load user
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          You can still logout and sign in again.
        </p>
      </div>
    );
  }

  const name = user?.name || "User";
  const email = user?.email || "-";

  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar size="md" user={user} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--rail-ink)]">
          {name}
        </p>
        <p className="truncate text-xs text-[var(--text-muted)]">{email}</p>
        <span className="mt-2 inline-flex rounded-full bg-[var(--signal-blue-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--signal-blue)]">
          {roleLabel}
        </span>
      </div>
    </div>
  );
}
