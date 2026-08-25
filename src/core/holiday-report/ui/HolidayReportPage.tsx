"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Check,
  Clock3,
  Info,
  RotateCcw,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useHolidayReport } from "../hooks/use-holiday-report";
import {
  formatRelativeDay,
  getMonitoringPeriod,
  getRelativeDay,
  getRuleByType,
  parseDate,
} from "../model/holiday-monitoring";
import type {
  HolidayReportModel,
  LongHoliday,
  MonitoringPeriod,
  MonitoringRule,
} from "../model/holiday-report.types";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
});

const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});
const weekdayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function HolidayReportPage() {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const { data, isEmpty, isError, isLoading } = useHolidayReport();

  const sidebarStats = [
    {
      label: "Status",
      value:
        data.status.kind === "active"
          ? "Aktif"
          : data.status.kind === "empty"
            ? "Kosong"
            : "Normal",
    },
    {
      label: "Berikutnya",
      value: data.nextHoliday?.name ?? "-",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          stats={sidebarStats}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            controls={
              <span className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--rail-border)] bg-[var(--surface-panel)] px-3 text-xs font-semibold text-[var(--text-muted)]">
                <Clock3 aria-hidden="true" size={15} />
                Updated {formatDateTime(data.updatedAt)}
              </span>
            }
            dashboardRole="agent"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel="Holiday monitor"
          />

          {isError ? (
            <HolidayErrorState />
          ) : isLoading ? (
            <HolidayLoadingState />
          ) : isEmpty ? (
            <HolidayEmptyState />
          ) : (
            <HolidayReportContent model={data} />
          )}
        </section>
      </div>
    </main>
  );
}

function HolidayReportContent({ model }: { model: HolidayReportModel }) {
  const calendarHoliday = model.nextHoliday;
  const calendarPeriod = model.nextPeriod;
  const [calendarMonth, setCalendarMonth] = useState(
    calendarPeriod?.holidayDate ?? model.currentDate,
  );

  return (
    <div className="grid gap-4">
      <PageHero model={model} />
      <CurrentHolidayStatus model={model} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <MonitoringRules
          currentDate={model.currentDate}
          holidays={model.holidays}
          rules={model.rules}
        />
        <NextHolidaySummary holiday={model.nextHoliday} period={model.nextPeriod} />
      </section>

      <MonitoringCalendar
        currentDate={model.currentDate}
        holiday={calendarHoliday}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
        period={calendarPeriod}
      />
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
              model.nextPeriod ? dateFormatter.format(model.nextPeriod.holidayDate) : "-"
            }
          />
        </div>
      </div>
    </header>
  );
}

function CurrentHolidayStatus({ model }: { model: HolidayReportModel }) {
  const isActive = model.status.kind === "active";
  const period = model.status.activeHoliday
    ? getMonitoringPeriod(
        model.status.activeHoliday,
        getRuleByType(model.rules, model.status.activeHoliday.ruleType),
      )
    : model.nextPeriod;
  const progress = period ? getMonitoringProgress(model.currentDate, period) : 0;

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
          value={model.status.activeHoliday?.name ?? model.nextHoliday?.name ?? "-"}
        />
        <DateFact
          label="Mulai monitoring"
          value={period ? dateFormatter.format(period.start) : "-"}
          helper={model.nextHoliday ? `H-${getRuleByType(model.rules, model.nextHoliday.ruleType).before}` : undefined}
        />
        <DateFact
          label="Berakhir"
          value={period ? dateFormatter.format(period.end) : "-"}
          helper={model.nextHoliday ? `H+${getRuleByType(model.rules, model.nextHoliday.ruleType).after}` : undefined}
        />
      </div>
    </section>
  );
}

function MonitoringRules({
  currentDate,
  holidays,
  rules,
}: {
  currentDate: Date;
  holidays: LongHoliday[];
  rules: MonitoringRule[];
}) {
  return (
    <Panel
      badge={`${rules.length} kategori`}
      subtitle="Window dihitung dari tanggal Hari H."
      title="Periode Libur & Aturan Monitoring"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {rules.map((rule) => {
          const sampleHoliday =
            holidays.find((holiday) => holiday.ruleType === rule.type) ??
            holidays[0];
          const period = sampleHoliday
            ? getMonitoringPeriod(sampleHoliday, rule)
            : undefined;
          const isActive = period
            ? getMonitoringProgress(currentDate, period) > 0 &&
              currentDate.getTime() <= period.end.getTime()
            : false;

          return (
            <HolidayRuleCard
              holiday={sampleHoliday}
              isActive={isActive}
              key={rule.type}
              period={period}
              rule={rule}
            />
          );
        })}
      </div>
    </Panel>
  );
}

function HolidayRuleCard({
  holiday,
  isActive,
  period,
  rule,
}: {
  holiday?: LongHoliday;
  isActive: boolean;
  period?: MonitoringPeriod;
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
        {period
          ? `${dateFormatter.format(period.start)} - ${dateFormatter.format(period.end)}`
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
        <span>
          Hari H: {holiday ? dateFormatter.format(parseDate(holiday.date)) : "-"}
        </span>
        <span>{isActive ? "Aktif" : "Configured"}</span>
      </div>
    </article>
  );
}

function NextHolidaySummary({
  holiday,
  period,
}: {
  holiday?: LongHoliday;
  period?: MonitoringPeriod;
}) {
  return (
    <Panel
      badge="Read only"
      subtitle="Periode libur panjang yang akan dipantau berikutnya."
      title="Detail Periode Berikutnya"
    >
      {holiday && period ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-[var(--rail-ink)]">
              {holiday.name}
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Hari H · {dateFormatter.format(period.holidayDate)}
            </p>
          </div>

          <div className="space-y-3">
            <SummaryRow
              helper={`H${getRelativeDay(period.start, period.holidayDate)}`}
              label="Mulai monitoring"
              value={dateFormatter.format(period.start)}
            />
            <SummaryRow
              helper="Hari H"
              label="Hari H"
              value={dateFormatter.format(period.holidayDate)}
            />
            <SummaryRow
              helper={`H+${getRelativeDay(period.end, period.holidayDate)}`}
              label="Akhir monitoring"
              value={dateFormatter.format(period.end)}
            />
          </div>

          <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--rail-ink)]">
                  Penyesuaian Sabtu & Minggu
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                  Akhir pekan ikut diperhitungkan dalam window monitoring.
                </p>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]">
                <Check aria-hidden="true" size={16} />
              </span>
            </div>
          </div>

          <p className="rounded-lg bg-[var(--signal-blue-soft)] p-3 text-xs leading-5 text-[var(--signal-blue)]">
            Source: {holiday.sourceLabel}. Data ini masih mock dan siap diganti
            melalui data layer saat backend tersedia.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-6 text-sm leading-6 text-[var(--text-muted)]">
          Belum tersedia informasi mengenai libur panjang mendatang.
        </div>
      )}
    </Panel>
  );
}

function MonitoringCalendar({
  currentDate,
  holiday,
  month,
  onMonthChange,
  period,
}: {
  currentDate: Date;
  holiday?: LongHoliday;
  month: Date;
  onMonthChange: (month: Date) => void;
  period?: MonitoringPeriod;
}) {
  const monthEntries = buildCalendarEntries({ currentDate, month, period });
  const holidayLabel = holiday?.name;

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

        <div className="grid grid-cols-7 gap-2">
          {weekdayLabels.map((label) => (
            <div
              className="pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]"
              key={label}
            >
              {label}
            </div>
          ))}

          {monthEntries.map((entry) => (
            <CalendarDateCell entry={entry} holidayLabel={holidayLabel} key={entry.key} />
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

      {holiday ? (
        <p className="mt-3 text-xs leading-5 text-[var(--text-tertiary)]">
          Kalender mengikuti {holiday.name}. Tanggal bersifat informatif dan
          tidak dapat dipilih.
        </p>
      ) : null}
    </Panel>
  );
}

function CalendarDateCell({
  entry,
  holidayLabel,
}: {
  entry: CalendarEntry;
  holidayLabel?: string;
}) {
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
              {holidayLabel ?? entry.holidayName}
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

function HolidayErrorState() {
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
        onClick={() => window.location.reload()}
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

function SummaryRow({
  helper,
  label,
  value,
}: {
  helper: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--rail-border)] pb-3 last:border-b-0 last:pb-0">
      <div>
        <p className="text-xs font-semibold text-[var(--rail-ink)]">{label}</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{helper}</p>
      </div>
      <p className="text-right text-sm font-semibold text-[var(--rail-ink)]">
        {value}
      </p>
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
  month,
  period,
}: {
  currentDate: Date;
  month: Date;
  period?: MonitoringPeriod;
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
    const relativeDay = period
      ? getRelativeDay(cursor, period.holidayDate)
      : undefined;
    const isHoliday = period ? isSameDate(cursor, period.holidayDate) : false;
    const isMonitoring = period ? isDateWithinRange(cursor, period) : false;

    entries.push({
      condition: isHoliday ? "holiday" : isMonitoring ? "monitoring" : "normal",
      dayNumber: cursor.getDate(),
      holidayName: isHoliday ? "Hari libur" : undefined,
      isOutsideMonth: cursor.getMonth() !== month.getMonth(),
      isToday: isSameDate(cursor, currentDate),
      key: cursor.toISOString(),
      relativeLabel:
        isHoliday || isMonitoring
          ? relativeDay === 0
            ? "H"
            : formatRelativeDay(relativeDay ?? 0)
          : undefined,
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

function isDateWithinRange(date: Date, period: MonitoringPeriod) {
  return (
    date.getTime() >= stripTime(period.start).getTime() &&
    date.getTime() <= stripTime(period.end).getTime()
  );
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
