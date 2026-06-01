"use client";

import {
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

export type DashboardRole = "agent" | "manager";

export interface DashboardNavbarProps {
  controls?: ReactNode;
  dashboardRole: DashboardRole;
  isSidebarOpen?: boolean;
  onSidebarToggle?: () => void;
  roleLabel: string;
  userName: string;
}

const ROLE_COPY: Record<DashboardRole, { title: string; subtitle: string }> = {
  agent: {
    title: "Dashboard",
    subtitle: "KAI Support · agent portal",
  },
  manager: {
    title: "Operations",
    subtitle: "KAI Support · manager portal",
  },
};

export function DashboardNavbar({
  controls,
  dashboardRole,
  isSidebarOpen = true,
  onSidebarToggle,
  roleLabel,
  userName,
}: DashboardNavbarProps) {
  const copy = ROLE_COPY[dashboardRole];
  const avatarInitials = initialsFromName(userName);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        // Scrolling up or at the top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <header
      className={`sticky top-3 z-50 mb-4 flex min-h-14 flex-col gap-3 rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] px-4 py-3 shadow-lg backdrop-blur-sm transition-transform duration-300 lg:flex-row lg:items-center lg:justify-between ${isVisible ? "translate-y-0" : "-translate-y-[calc(100%+1rem)]"}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <IconButton
          label={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          onClick={onSidebarToggle}
        >
          {isSidebarOpen ? (
            <PanelLeftClose aria-hidden="true" size={17} />
          ) : (
            <PanelLeftOpen aria-hidden="true" size={17} />
          )}
        </IconButton>
        <div className="min-w-0">
          <h1 className="text-base font-semibold leading-tight text-[var(--rail-ink)]">
            {copy.title}
          </h1>
          <p className="mt-1 truncate text-[11px] text-[var(--text-muted)]">
            {copy.subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {controls}
        <IconButton label="Buka pengaturan">
          <Settings aria-hidden="true" size={16} />
        </IconButton>
        <IconButton label="Lihat notifikasi" notification>
          <Bell aria-hidden="true" size={16} />
        </IconButton>
        <button
          className="flex h-10 min-w-0 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-2.5 text-xs font-medium text-[var(--rail-ink)] transition hover:border-[var(--signal-blue)]"
          type="button"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--signal-blue)] text-[10px] font-semibold text-white">
            {avatarInitials}
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block max-w-[112px] truncate">{userName}</span>
            <span className="block max-w-[112px] truncate text-[10px] text-[var(--text-muted)]">
              {roleLabel}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="shrink-0 text-[var(--text-muted)]"
            size={14}
          />
        </button>
      </div>
    </header>
  );
}

function IconButton({
  children,
  label,
  notification = false,
  onClick,
}: {
  children: ReactNode;
  label: string;
  notification?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
      onClick={onClick}
      type="button"
    >
      {children}
      {notification ? (
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[var(--signal-red)]" />
      ) : null}
    </button>
  );
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
