"use client";

import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Gauge,
  Inbox,
  LineChart,
  LogOut,
  MessageSquareText,
  Route,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType, useEffect } from "react";
import { useLogout } from "@/core/auth/hooks/useLogout";
import type { DashboardRole } from "@/core/components/navbar";
import { useDashboardRole } from "@/core/components/use-dashboard-role";

export interface DashboardSidebarStat {
  label: string;
  value: string;
}

export interface DashboardSidebarProps {
  dashboardRole: DashboardRole;
  isOpen?: boolean;
  onClose?: () => void;
  stats?: DashboardSidebarStat[];
}

interface NavigationItem {
  href: string;
  icon: ComponentType<{
    "aria-hidden": true;
    className?: string;
    size: number;
  }>;
  label: string;
}

const NAVIGATION: Record<DashboardRole, NavigationItem[]> = {
  admin: [
    { href: "/admin", icon: ShieldCheck, label: "Admin Home" },
    { href: "/manager", icon: LineChart, label: "Overview" },
    {
      href: "/manager/action-queue",
      icon: ClipboardCheck,
      label: "Action Queue",
    },
    {
      href: "/manager/agents",
      icon: Users,
      label: "Agents",
    },
    {
      href: "/manager/holiday-report",
      icon: CalendarDays,
      label: "Holiday Report",
    },
    { href: "/manager/complaints", icon: ClipboardCheck, label: "Complaints" },
    { href: "/manager/references", icon: BookOpen, label: "References" },
    {
      href: "/agent/quick-response",
      icon: MessageSquareText,
      label: "Quick Response",
    },
    { href: "/agent/tickets", icon: Inbox, label: "Escalated" },
  ],
  agent: [
    { href: "/agent", icon: Gauge, label: "Dashboard" },
    {
      href: "/agent/quick-response",
      icon: MessageSquareText,
      label: "Quick Response",
    },
    {
      href: "/agent/holiday-report",
      icon: CalendarDays,
      label: "Holiday Report",
    },
    { href: "/agent/tickets", icon: Inbox, label: "Escalated" },
    { href: "/agent/complaints", icon: ClipboardCheck, label: "Complaints" },
    { href: "/agent/reports", icon: BarChart3, label: "Reports" },
    // { href: "/agent/knowledge", icon: BookOpen, label: "Knowledge" },
  ],
  manager: [
    { href: "/manager", icon: LineChart, label: "Overview" },
    {
      href: "/manager/action-queue",
      icon: ClipboardCheck,
      label: "Action Queue",
    },
    {
      href: "/manager/holiday-report",
      icon: CalendarDays,
      label: "Holiday Report",
    },
    { href: "/manager/references", icon: BookOpen, label: "References" },
    { href: "/manager/agents", icon: Users, label: "Agents" },
    { href: "/manager/complaints", icon: ClipboardCheck, label: "Complaints" },
    // { href: "/manager/analytics", icon: BarChart3, label: "Analytics" },
    // { href: "/manager/risk", icon: ShieldCheck, label: "Risk" },
  ],
};

const ROLE_TITLE: Record<DashboardRole, string> = {
  admin: "Admin console",
  agent: "Agent console",
  manager: "Manager console",
};

export function DashboardSidebar({
  dashboardRole,
  isOpen = false,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const logout = useLogout();
  const resolvedRole = useDashboardRole(dashboardRole);
  const navigationItems = NAVIGATION[resolvedRole];

  // Only the most specific matching link is active, so parent entries such as
  // "/manager" do not stay highlighted alongside "/manager/holiday-report".
  const activeHref = navigationItems.reduce<string | null>((best, item) => {
    const isMatch =
      pathname === item.href || pathname.startsWith(`${item.href}/`);

    if (!isMatch) {
      return best;
    }

    return !best || item.href.length > best.length ? item.href : best;
  }, null);

  useEffect(() => {
    if (!isOpen || !window.matchMedia("(max-width: 1023px)").matches) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const closeMobileSidebar = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      onClose?.();
    }
  };
  const handleSignOut = () => {
    logout();
  };

  return (
    <>
      <button
        aria-label="Tutup overlay sidebar"
        className={`fixed inset-0 z-40 bg-[rgba(19,35,31,0.34)] backdrop-blur-[2px] transition-opacity duration-300 ease-out lg:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        type="button"
      />
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex h-dvh w-[min(20rem,calc(100vw-16px))] flex-col overflow-hidden rounded-r-[20px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-3 shadow-[var(--shadow-soft)] transition-[transform,width,opacity,margin,padding,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform lg:sticky lg:top-5 lg:z-20 lg:h-[calc(100vh-40px)] lg:max-w-none lg:shrink-0 lg:rounded-[20px] ${
          isOpen
            ? "translate-x-0 lg:w-[248px] lg:opacity-100"
            : "-translate-x-full lg:-mr-4 lg:w-0 lg:border-0 lg:p-0 lg:opacity-0"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--rail-border)] pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--rail-ink)] text-white">
              <Route aria-hidden="true" size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--rail-ink)]">
                Rail Support
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                {ROLE_TITLE[resolvedRole]}
              </p>
            </div>
          </div>
          <button
            aria-label="Tutup sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--rail-border)] text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <nav aria-label={`${ROLE_TITLE[resolvedRole]} navigation`}>
            <ul className="flex flex-col gap-2 pb-0">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeHref === item.href;

                return (
                  <li className="shrink-0 lg:shrink" key={item.label}>
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex h-11 min-w-0 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition duration-200 ${
                        isActive
                          ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--signal-blue)] shadow-[inset_3px_0_0_var(--signal-blue)]"
                          : "border-transparent text-[var(--text-muted)] hover:border-[var(--rail-border)] hover:bg-[var(--background)] hover:text-[var(--rail-ink)]"
                      }`}
                      href={item.href}
                      onClick={closeMobileSidebar}
                    >
                      <Icon
                        aria-hidden={true}
                        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
                        size={16}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="mt-3 border-t border-[var(--rail-border)] pt-3">
          <button
            className="flex h-11 w-full items-center gap-2 rounded-xl border border-transparent px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-red-soft)] hover:bg-[var(--signal-red-soft)] hover:text-[var(--signal-red-dark)]"
            onClick={handleSignOut}
            type="button"
          >
            <LogOut aria-hidden="true" size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
