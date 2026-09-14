"use client";

import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  RotateCcw,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { useSessionUser } from "@/core/auth/hooks/useSessionUser";
import { DashboardNavbar, type DashboardRole } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import {
  type HolidayDaysByDate,
  useHolidayCalendar,
} from "../hooks/use-holiday-calendar";
import { useHolidayReport } from "../hooks/use-holiday-report";
import { toDateString } from "../mapper/holiday-report.mapper";
import { formatRelativeDay, parseDate } from "../model/holiday-monitoring";
import type {
  HolidayReportModel,
  HolidayStatus,
  LongHoliday,
  MonitoringPeriod,
  MonitoringRule,
} from "../model/holiday-report.types";
import { AdminHolidayManagement } from "./AdminHolidayManagement";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
});

const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});
const weekdayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function HolidayReportPage({
  dashboardRole,
}: {
  dashboardRole: DashboardRole;
}) {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const sessionUser = useSessionUser();
  const { data, isEmpty, isError, isLoading, refetch } = useHolidayReport();

  const isAdmin = sessionUser?.role === "admin";

  const sidebarStats = [
    {
      label: "Status",
      value:
        data?.status.kind === "active"
          ? "Aktif"
          : data?.status.kind === "empty"
            ? "Kosong"
            : "Normal",
    },
    {
      label: "Berikutnya",
      value: data?.nextHoliday?.name ?? "-",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole={dashboardRole}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={sidebarStats}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            controls={
              data ? (
                <span className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)]">
                  <Clock3 aria-hidden="true" size={15} />
                  Updated {formatDateTime(data.updatedAt)}
                </span>
              ) : null
            }
            dashboardRole={dashboardRole}
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel={isAdmin ? "Administrator" : "Holiday monitor"}
          />

          {isError ? (
            <HolidayErrorState onRetry={() => void refetch()} />
          ) : isLoading ? (
            <HolidayLoadingState />
          ) : isEmpty ? (
            <HolidayEmptyState />
          ) : data ? (
            <HolidayReportContent isAdmin={isAdmin} model={data} />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function HolidayReportContent({
  isAdmin,
  model,
}: {
  isAdmin: boolean;
  model: HolidayReportModel;
}) {
  const [calendarMonth, setCalendarMonth] = useState(model.currentDate);
  const calendar = useHolidayCalendar(calendarMonth);

  return (
    <div className="grid gap-4">
      <PageHero model={model} />
      <CurrentHolidayStatus model={model} />

      <MonitoringRules
        holidays={model.holidays}
        rules={model.rules}
        status={model.status}
      />

      <MonitoringCalendar
        currentDate={model.currentDate}
        daysByDate={calendar.data}
        isFetching={calendar.isFetching}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
      />

      {isAdmin ? <AdminHolidayManagement /> : null}
    </div>
  );
}

function PageHero({ model }: { model: HolidayReportModel }) {
  return (
    <header className="overflow-hidden rounded-xl border border-[var(--rail-border)] bg-[linear-gradient(135deg,#fbfcf7_0%,#eaf4ef_50%,#edf4fa_100%)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
            Monitoring operasional
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)] sm:text-3xl">
            Informasi Libur Panjang
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            Ringkasan status libur panjang, aturan pemantauan, dan kalender
            monitoring untuk membantu agent membaca konteks volume layanan.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[320px]">
          <MetricPill
            label="Periode berikutnya"
            value={model.nextHoliday?.name ?? "Belum tersedia"}
          />
          <MetricPill
            label="Tanggal hari H"
            value={
              model.nextPeriod?.holidayDate
                ? dateFormatter.format(model.nextPeriod.holidayDate)
                : "-"
            }
          />
        </div>
      </div>
    </header>
  );
}

function CurrentHolidayStatus({ model }: { model: HolidayReportModel }) {
  const isActive = model.status.kind === "active";
  const period = model.currentPeriod ?? model.nextPeriod;
  const progress = period
    ? getMonitoringProgress(model.currentDate, period)
    : 0;

  return (
    <section className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
            Status saat ini
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)]">
            {isActive
              ? "Periode libur panjang aktif"
              : "Tidak dalam periode libur panjang"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            {isActive && model.status.activeHoliday
              ? `${model.status.activeHoliday.name} sedang berada pada ${formatRelativeDay(model.status.relativeDay ?? 0)}.`
              : isActive
                ? "Sedang berada dalam window monitoring libur panjang."
                : "Saat ini tidak ada periode monitoring khusus yang sedang aktif."}
          </p>
        </div>
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
            isActive
              ? "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]"
              : "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]"
          }`}
        >
          {isActive ? (
            <Info aria-hidden="true" size={24} />
          ) : (
            <Check aria-hidden="true" size={24} />
          )}
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className="h-full rounded-full bg-[var(--signal-green)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <DateFact
          label={isActive ? "Periode aktif" : "Periode berikutnya"}
          value={
            model.status.activeHoliday?.name ?? model.nextHoliday?.name ?? "-"
          }
        />
        <DateFact
          helper={period ? `H-${period.before}` : undefined}
          label="Mulai monitoring"
          value={period ? dateFormatter.format(period.start) : "-"}
        />
        <DateFact
          helper={period ? `H+${period.after}` : undefined}
          label="Berakhir"
          value={period ? dateFormatter.format(period.end) : "-"}
        />
      </div>
    </section>
  );
}

function MonitoringRules({
  holidays,
  rules,
  status,
}: {
  holidays: LongHoliday[];
  rules: MonitoringRule[];
  status: HolidayStatus;
}) {
  return (
    <Panel
      badge={`${rules.length} kategori`}
      subtitle="Window dihitung dari tanggal Hari H."
      title="Periode Libur & Aturan Monitoring"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {rules.map((rule) => (
          <HolidayRuleCard
            isActive={
              status.kind === "active" &&
              status.activeHoliday?.category === rule.category
            }
            key={rule.category}
            knownHoliday={holidays.find(
              (holiday) => holiday.category === rule.category,
            )}
            rule={rule}
          />
        ))}
      </div>
    </Panel>
  );
}

function HolidayRuleCard({
  isActive,
  knownHoliday,
  rule,
}: {
  isActive: boolean;
  knownHoliday?: LongHoliday;
  rule: MonitoringRule;
}) {
  return (
    <article className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--rail-ink)]">
            {rule.label}
          </h3>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            {rule.description}
          </p>
        </div>
        <StatusBadge>{`H-${rule.before} -> H+${rule.after}`}</StatusBadge>
      </div>
      <p className="mt-4 text-lg font-semibold text-[var(--signal-green)]">
        H-{rule.before} sampai H+{rule.after}
      </p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        {knownHoliday
          ? `${knownHoliday.name} · ${dateFormatter.format(parseDate(knownHoliday.date))}`
          : "Belum ada contoh periode."}
      </p>
      <div className="mt-4 flex items-center gap-2">
        <TimelineDot />
        <TimelineLine />
        <TimelineDot active />
        <TimelineLine />
        <TimelineDot />
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-[var(--rail-border)] pt-3 text-[11px] text-[var(--text-muted)]">
        <span>Sumber aturan: ACCESS Backend</span>
        <span>{isActive ? "Aktif" : "Configured"}</span>
      </div>
    </article>
  );
}

function MonitoringCalendar({
  currentDate,
  daysByDate,
  isFetching,
  month,
  onMonthChange,
}: {
  currentDate: Date;
  daysByDate?: HolidayDaysByDate;
  isFetching: boolean;
  month: Date;
  onMonthChange: (month: Date) => void;
}) {
  const monthEntries = buildCalendarEntries({ currentDate, daysByDate, month });

  return (
    <Panel
      badge="Preview"
      subtitle="Visualisasi periode monitoring. Tanggal tidak dapat dipilih."
      title="Kalender Monitoring"
    >
      <div className="rounded-xl border border-[var(--rail-border)] bg-[var(--background)] p-3 sm:p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-[var(--rail-ink)]">
              {monthFormatter.format(month)}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Kondisi tiap tanggal ditampilkan berdasarkan periode monitoring
              dan hari libur utama.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CalendarNavButton
              label="Bulan sebelumnya"
              onClick={() => onMonthChange(addMonths(month, -1))}
            >
              <ChevronLeft aria-hidden="true" size={15} />
            </CalendarNavButton>
            <CalendarNavButton
              label="Bulan berikutnya"
              onClick={() => onMonthChange(addMonths(month, 1))}
            >
              <ChevronRight aria-hidden="true" size={15} />
            </CalendarNavButton>
          </div>
        </div>

        <div
          className={`grid grid-cols-7 gap-2 transition-opacity ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {weekdayLabels.map((label) => (
            <div
              className="pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]"
              key={label}
            >
              {label}
            </div>
          ))}

          {monthEntries.map((entry) => (
            <CalendarDateCell entry={entry} key={entry.key} />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--text-muted)]">
        <LegendSwatch
          className="bg-[var(--signal-green-soft)]"
          label="Monitoring period"
        />
        <LegendSwatch
          className="bg-[var(--signal-amber-soft)]"
          label="Hari H"
        />
        <LegendSwatch
          className="ring-2 ring-[var(--signal-blue)]"
          label="Today"
        />
      </div>
    </Panel>
  );
}

function CalendarDateCell({ entry }: { entry: CalendarEntry }) {
  return (
    <article
      className={`min-h-[110px] rounded-lg border p-2.5 transition sm:min-h-[124px] ${
        entry.isOutsideMonth
          ? "border-[var(--rail-border)] bg-[rgba(251,252,247,0.44)] text-[var(--text-tertiary)] opacity-55"
          : entry.condition === "holiday"
            ? "border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)] shadow-[inset_0_0_0_1px_rgba(217,154,24,0.14)]"
            : entry.condition === "monitoring"
              ? "border-[rgba(21,115,79,0.18)] bg-[var(--signal-green-soft)] text-[var(--rail-ink)]"
              : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--rail-ink)]"
      } ${entry.isToday ? "ring-2 ring-[var(--signal-blue)] ring-offset-1 ring-offset-[var(--background)]" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold">{entry.dayNumber}</span>
        {entry.relativeLabel ? (
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
              entry.condition === "holiday"
                ? "bg-[rgba(255,255,255,0.62)] text-[var(--signal-amber-dark)]"
                : entry.condition === "monitoring"
                  ? "bg-[rgba(255,255,255,0.72)] text-[var(--signal-green-dark)]"
                  : "bg-[var(--background)] text-[var(--text-muted)]"
            }`}
          >
            {entry.relativeLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-2 space-y-1.5">
        {entry.condition === "holiday" ? (
          <>
            <span className="inline-flex rounded-md bg-[rgba(255,255,255,0.68)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]">
              Hari H
            </span>
            <p className="text-xs font-semibold leading-5">
              {entry.holidayName}
            </p>
          </>
        ) : entry.condition === "monitoring" ? (
          <>
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--signal-green)]" />
            <p className="text-[11px] font-medium leading-5 text-[var(--signal-green-dark)]">
              Monitoring
            </p>
          </>
        ) : (
          <p className="text-[11px] leading-5 text-[var(--text-tertiary)]">
            Tidak ada indikator khusus.
          </p>
        )}
      </div>
    </article>
  );
}

function CalendarNavButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function HolidayLoadingState() {
  return (
    <div className="grid gap-4">
      <div className="skeleton-sheen h-36 rounded-xl" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <div className="skeleton-sheen h-72 rounded-xl" />
        <div className="skeleton-sheen h-72 rounded-xl" />
      </div>
      <div className="skeleton-sheen h-96 rounded-xl" />
    </div>
  );
}

function HolidayEmptyState() {
  return (
    <section className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-8 text-center shadow-[var(--shadow-soft)]">
      <CalendarDays
        aria-hidden="true"
        className="mx-auto text-[var(--signal-blue)]"
        size={30}
      />
      <h1 className="mt-4 text-2xl font-semibold text-[var(--rail-ink)]">
        Tidak ada periode libur panjang berikutnya
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
        Belum tersedia informasi mengenai libur panjang mendatang.
      </p>
    </section>
  );
}

function HolidayErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="rounded-xl border border-[var(--signal-red-soft)] bg-[var(--surface-panel)] p-8 text-center shadow-[var(--shadow-soft)]">
      <AlertCircle
        aria-hidden="true"
        className="mx-auto text-[var(--signal-red-dark)]"
        size={30}
      />
      <h1 className="mt-4 text-2xl font-semibold text-[var(--rail-ink)]">
        Informasi libur panjang tidak dapat dimuat
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
        Terjadi kendala saat mengambil data. Silakan coba kembali.
      </p>
      <button
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--rail-ink)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--signal-blue)]"
        onClick={onRetry}
        type="button"
      >
        <RotateCcw aria-hidden="true" size={15} />
        Coba lagi
      </button>
    </section>
  );
}

function Panel({
  badge,
  children,
  subtitle,
  title,
}: {
  badge: string;
  children: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 border-b border-[var(--rail-border)] p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            {subtitle}
          </p>
        </div>
        <StatusBadge>{badge}</StatusBadge>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--rail-border)] bg-[rgba(251,252,247,0.72)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-semibold text-[var(--rail-ink)]">
        {value}
      </p>
    </div>
  );
}

function DateFact({
  helper,
  label,
  value,
}: {
  helper?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-[var(--rail-ink)]">
        {value}
      </p>
      {helper ? (
        <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 w-fit items-center rounded-full border border-[var(--signal-blue-soft)] bg-[var(--signal-blue-soft)] px-3 text-[10px] font-semibold text-[var(--signal-blue)]">
      {children}
    </span>
  );
}

function TimelineDot({ active = false }: { active?: boolean }) {
  return (
    <span
      className={`h-2.5 w-2.5 rounded-full ${
        active
          ? "bg-[var(--signal-green)] shadow-[0_0_0_5px_var(--signal-green-soft)]"
          : "bg-[var(--rail-border)]"
      }`}
    />
  );
}

function TimelineLine() {
  return <span className="h-0.5 flex-1 bg-[var(--rail-border)]" />;
}

function LegendSwatch({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded-sm border border-[var(--rail-border)] ${className}`}
      />
      {label}
    </span>
  );
}

type CalendarEntry = {
  condition: "holiday" | "monitoring" | "normal";
  dayNumber: number;
  holidayName?: string;
  isOutsideMonth: boolean;
  isToday: boolean;
  key: string;
  relativeLabel?: string;
};

function buildCalendarEntries({
  currentDate,
  daysByDate,
  month,
}: {
  currentDate: Date;
  daysByDate?: HolidayDaysByDate;
  month: Date;
}): CalendarEntry[] {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const leadingDays = (monthStart.getDay() + 6) % 7;
  const trailingDays = 6 - ((monthEnd.getDay() + 6) % 7);
  const start = addDays(monthStart, -leadingDays);
  const end = addDays(monthEnd, trailingDays);
  const entries: CalendarEntry[] = [];

  for (
    let cursor = new Date(start);
    cursor.getTime() <= end.getTime();
    cursor = addDays(cursor, 1)
  ) {
    const day = daysByDate?.get(toDateString(cursor));
    const condition = day?.holiday
      ? ("holiday" as const)
      : day?.isMonitoring
        ? ("monitoring" as const)
        : ("normal" as const);
    const relativeDay = day?.relativeDay ?? null;

    entries.push({
      condition,
      dayNumber: cursor.getDate(),
      holidayName: day?.holiday?.name,
      isOutsideMonth: cursor.getMonth() !== month.getMonth(),
      isToday: isSameDate(cursor, currentDate),
      key: toDateString(cursor),
      relativeLabel:
        relativeDay === null
          ? undefined
          : relativeDay === 0
            ? "H"
            : formatRelativeDay(relativeDay),
    });
  }

  return entries;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);

  return nextDate;
}

function isSameDate(left: Date, right: Date) {
  return stripTime(left).getTime() === stripTime(right).getTime();
}

function stripTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getMonitoringProgress(currentDate: Date, period: MonitoringPeriod) {
  const total = period.end.getTime() - period.start.getTime();
  const elapsed = currentDate.getTime() - period.start.getTime();

  if (elapsed <= 0) {
    return 0;
  }

  if (elapsed >= total) {
    return 100;
  }

  return Math.round((elapsed / total) * 100);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
