"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLogout } from "@/core/auth/hooks/useLogout";
import { ProfileCard } from "@/core/auth/profile-card";
import { UserAvatar } from "@/core/auth/user-avatar";
import type { AuthUser } from "@/core/dashboard/model/types/auth.types";

export type ProfileMenuProps = {
  fallbackRoleLabel?: string;
  fallbackUserName?: string;
  isError?: boolean;
  isLoading?: boolean;
  roleLabel?: string;
  user?: AuthUser | null;
};

export function ProfileMenu({
  fallbackRoleLabel = "unknown",
  fallbackUserName = "User",
  isError = false,
  isLoading = false,
  roleLabel,
  user,
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const logout = useLogout();
  const displayName = user?.name || fallbackUserName || "User";
  const displayRole = roleLabel || fallbackRoleLabel || user?.role || "unknown";
  const fallbackUser = { name: displayName };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex h-10 min-w-0 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-2.5 text-xs font-medium text-[var(--rail-ink)] transition hover:border-[var(--signal-blue)]"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <UserAvatar user={user ?? fallbackUser} />
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[112px] truncate">
            {isLoading ? "Loading..." : displayName}
          </span>
          <span className="block max-w-[112px] truncate text-[10px] text-[var(--text-muted)]">
            {displayRole}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`shrink-0 text-[var(--text-muted)] transition ${
            isOpen ? "rotate-180" : ""
          }`}
          size={14}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-3 shadow-[var(--shadow-ops)]"
          role="menu"
        >
          <ProfileCard
            fallbackName={displayName}
            isError={isError}
            isLoading={isLoading}
            roleLabel={displayRole}
            user={user}
          />
          <button
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-transparent text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-red-soft)] hover:bg-[var(--signal-red-soft)] hover:text-[var(--signal-red-dark)]"
            onClick={logout}
            role="menuitem"
            type="button"
          >
            <LogOut aria-hidden="true" size={15} />
            Keluar
          </button>
        </div>
      ) : null}
    </div>
  );
}
