"use client";

import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  Gauge,
  Inbox,
  LineChart,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type ComponentType, useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useHolidayReport } from "@/core/holiday-report/hooks/use-holiday-report";
import { useSyncSocialComplaints } from "@/core/social-complaints/hooks/use-social-complaints";
import type { SocialComplaintSource } from "@/core/social-complaints/model/social-complaints.types";
import { AdminSection } from "./AdminSection";

type AdminLink = {
  description: string;
  href: string;
  icon: ComponentType<{
    "aria-hidden": true;
    className?: string;
    size: number;
  }>;
  label: string;
  scope: string;
};

const ADMIN_LINKS: AdminLink[] = [
  {
    description: "Ringkasan operasional, kategori, dan tren keluhan.",
    href: "/manager",
    icon: LineChart,
    label: "Manager Overview",
    scope: "Manager",
  },
  {
    description: "Antrean aksi manager dan tindak lanjut tiket.",
    href: "/manager/action-queue",
    icon: ClipboardCheck,
    label: "Action Queue",
    scope: "Manager",
  },
  {
    description: "Pantau performa dan aktivitas tiap agent.",
    href: "/manager/agents",
    icon: Users,
    label: "Agents",
    scope: "Manager",
  },
  {
    description: "Kelola referensi, tag, dan lampiran.",
    href: "/manager/references",
    icon: BookOpen,
    label: "References",
    scope: "Manager",
  },
  {
    description: "Daftar keluhan dengan sudut pandang manager.",
    href: "/manager/complaints",
    icon: ClipboardCheck,
    label: "Manager Complaints",
    scope: "Manager",
  },
  {
    description: "Dashboard personal agent dan ringkasan harian.",
    href: "/agent",
    icon: Gauge,
    label: "Agent Dashboard",
    scope: "Agent",
  },
  {
    description: "Susun balasan HEAT dan simpan quick response.",
    href: "/agent/quick-response",
    icon: MessageSquareText,
    label: "Quick Response",
    scope: "Agent",
  },
  {
    description: "Tiket eskalasi dan konteks penutupan.",
    href: "/agent/tickets",
    icon: Inbox,
    label: "Escalated Tickets",
    scope: "Agent",
  },
  {
    description: "Laporan performa dan riwayat penanganan.",
    href: "/agent/reports",
    icon: BarChart3,
    label: "Reports",
    scope: "Agent",
  },
  {
    description: "Monitoring libur panjang dan manajemen hari libur.",
    href: "/manager/holiday-report",
    icon: CalendarDays,
    label: "Holiday Report",
    scope: "Admin",
  },
];

const SOCIAL_SOURCES: { label: string; value: SocialComplaintSource }[] = [
  { label: "Google Play", value: "google_play" },
  { label: "Facebook", value: "facebook" },
  { label: "X", value: "x" },
];

export function AdminDashboard() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const holiday = useHolidayReport();
  const socialSync = useSyncSocialComplaints();
  const [activeSource, setActiveSource] =
    useState<SocialComplaintSource | null>(null);
  const [socialFeedback, setSocialFeedback] = useState<{
    message: string;
    variant: "error" | "success";
  } | null>(null);

  const handleSocialSync = async (source: SocialComplaintSource) => {
    setActiveSource(source);
    setSocialFeedback(null);

    try {
      const result = await socialSync.mutateAsync(source);
      setSocialFeedback({
        message: `${source} · ${result.created} baru, ${result.unchanged} tetap, ${result.failed} gagal dari ${result.fetched} diambil.`,
        variant: "success",
      });
    } catch (error) {
      setSocialFeedback({
        message:
          error instanceof Error && error.message
            ? error.message
            : "Sinkronisasi keluhan media sosial gagal.",
        variant: "error",
      });
    } finally {
      setActiveSource(null);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="admin"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={[
            { label: "Akses", value: "Semua portal" },
            {
              label: "Holiday",
              value: holiday.isLoading
                ? "..."
                : (holiday.data?.nextHoliday?.name ?? "-"),
            },
          ]}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            controls={
              <span className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)]">
                <ShieldCheck
                  aria-hidden="true"
                  className="text-[var(--signal-blue)]"
                  size={15}
                />
                Admin access
              </span>
            }
            dashboardRole="admin"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel="Administrator"
          />

          <div className="grid gap-4">
            <header className="overflow-hidden rounded-xl border border-[var(--rail-border)] bg-[linear-gradient(135deg,#fbfcf7_0%,#eaf4ef_50%,#edf4fa_100%)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
                Administrator
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)] sm:text-3xl">
                Admin Console
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                Akses penuh ke portal agent dan manager, plus operasi khusus
                admin seperti sinkronisasi data. Pilih area kerja di bawah ini.
              </p>
            </header>

            <section className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
              <header className="border-b border-[var(--rail-border)] p-4">
                <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
                  Area Kerja
                </h2>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                  Semua sasaran yang dapat diakses oleh peran admin.
                </p>
              </header>
              <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {ADMIN_LINKS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      className="group flex flex-col rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3 transition hover:border-[var(--signal-blue)] hover:shadow-[var(--shadow-soft)]"
                      href={item.href}
                      key={item.href}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--signal-blue-soft)] text-[var(--signal-blue)] transition group-hover:scale-105">
                          <Icon aria-hidden={true} size={16} />
                        </span>
                        <span className="rounded-full border border-[var(--rail-border)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
                          {item.scope}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-[var(--rail-ink)]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                        {item.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>

            <AdminSection
              title="Sinkronisasi Keluhan Media Sosial"
              subtitle="Tarik keluhan terbaru dari Apify per sumber. Operasi khusus admin."
            >
              <div className="flex flex-wrap gap-2">
                {SOCIAL_SOURCES.map((source) => {
                  const isActive =
                    activeSource === source.value && socialSync.isPending;

                  return (
                    <button
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--signal-blue)] transition hover:border-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={socialSync.isPending}
                      key={source.value}
                      onClick={() => void handleSocialSync(source.value)}
                      type="button"
                    >
                      <RefreshCw
                        aria-hidden="true"
                        className={isActive ? "animate-spin" : ""}
                        size={13}
                      />
                      Sync {source.label}
                    </button>
                  );
                })}
              </div>

              {socialFeedback ? (
                <div
                  className={`mt-3 flex items-start gap-2 rounded-lg border p-3 text-xs leading-5 ${
                    socialFeedback.variant === "error"
                      ? "border-[var(--signal-red-soft)] bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]"
                      : "border-[var(--signal-green-soft)] bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]"
                  }`}
                >
                  {socialFeedback.variant === "error" ? (
                    <AlertCircle
                      aria-hidden="true"
                      className="mt-0.5"
                      size={14}
                    />
                  ) : (
                    <Check aria-hidden="true" className="mt-0.5" size={14} />
                  )}
                  <span>{socialFeedback.message}</span>
                </div>
              ) : null}
            </AdminSection>
          </div>
        </section>
      </div>
    </main>
  );
}
