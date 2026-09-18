"use client";

import {
  AlertCircle,
  CalendarDays,
  Check,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ApiClientError } from "@/core/dashboard/model/api/client";
import {
  useCreateHoliday,
  useDeleteHoliday,
  useHolidays,
  useSyncHolidays,
  useUpdateHoliday,
} from "../hooks/use-holiday-management";
import type {
  HolidayApiCategory,
  HolidayApiEntity,
  HolidayApiSource,
} from "../model/holiday-api.types";

const CATEGORY_LABELS: Record<HolidayApiCategory, string> = {
  imlek: "Imlek",
  lebaran: "Lebaran",
  nataru: "Nataru",
  other_long_holiday: "Libur Panjang Lain",
  regular_holiday: "Hari Libur Reguler",
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as HolidayApiCategory[];

const SOURCE_LABELS: Record<HolidayApiSource, string> = {
  manual: "Manual",
  skb_3_menteri: "SKB 3 Menteri",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

type FormState = {
  category: HolidayApiCategory;
  date: string;
  isJointLeave: boolean;
  name: string;
  source: HolidayApiSource;
  sourceReference: string;
  /** "auto" follows the backend rule; "custom" sends an explicit window. */
  monitoringMode: "auto" | "custom";
  monitoringBefore: string;
  monitoringAfter: string;
};

type EditorState =
  | { mode: "create" }
  | { mode: "edit"; holiday: HolidayApiEntity }
  | null;

function emptyForm(currentYear: number): FormState {
  return {
    category: "regular_holiday",
    date: `${currentYear}-01-01`,
    isJointLeave: false,
    monitoringAfter: "",
    monitoringBefore: "",
    monitoringMode: "auto",
    name: "",
    source: "manual",
    sourceReference: "",
  };
}

function formFromHoliday(holiday: HolidayApiEntity): FormState {
  const hasOverride =
    holiday.monitoringBefore !== null && holiday.monitoringAfter !== null;

  return {
    category: holiday.category,
    date: holiday.date,
    isJointLeave: holiday.isJointLeave,
    monitoringAfter: hasOverride ? String(holiday.monitoringAfter) : "",
    monitoringBefore: hasOverride ? String(holiday.monitoringBefore) : "",
    monitoringMode: hasOverride ? "custom" : "auto",
    name: holiday.name,
    source: holiday.source,
    sourceReference: holiday.sourceReference ?? "",
  };
}

const MONITORING_MAX_DAYS = 180;

function parseMonitoringDays(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > MONITORING_MAX_DAYS) {
    return null;
  }

  return parsed;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Terjadi kendala. Coba lagi.";
}

export function AdminHolidayManagement() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [editor, setEditor] = useState<EditorState>(null);
  const [deleteTarget, setDeleteTarget] = useState<HolidayApiEntity | null>(
    null,
  );
  const [feedback, setFeedback] = useState<{
    message: string;
    variant: "error" | "success";
  } | null>(null);

  const parsedYear = Number(year);
  const validYear =
    Number.isInteger(parsedYear) && parsedYear >= 1900 && parsedYear <= 2999
      ? parsedYear
      : undefined;

  const holidaysQuery = useHolidays(
    validYear ? { year: validYear } : undefined,
  );
  const createMutation = useCreateHoliday();
  const updateMutation = useUpdateHoliday();
  const deleteMutation = useDeleteHoliday();
  const syncMutation = useSyncHolidays();

  const holidays = holidaysQuery.data?.holidays ?? [];
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const handleSync = async () => {
    if (!validYear) {
      setFeedback({ message: "Tahun tidak valid.", variant: "error" });
      return;
    }

    setFeedback(null);

    try {
      const result = await syncMutation.mutateAsync(validYear);
      setFeedback({
        message: `Sinkronisasi ${result.year} selesai · ${result.created} baru, ${result.updated} diperbarui, ${result.unchanged} tetap, ${result.failed} gagal.`,
        variant: "success",
      });
    } catch (error) {
      setFeedback({ message: getErrorMessage(error), variant: "error" });
    }
  };

  const handleSubmit = async (form: FormState) => {
    setFeedback(null);

    // "auto" sends nulls, which clears any override and restores the
    // backend's computed window. "custom" always sends both sides together.
    const monitoring =
      form.monitoringMode === "custom"
        ? {
            monitoringAfter: parseMonitoringDays(form.monitoringAfter),
            monitoringBefore: parseMonitoringDays(form.monitoringBefore),
          }
        : { monitoringAfter: null, monitoringBefore: null };

    const payload = {
      category: form.category,
      date: form.date,
      isJointLeave: form.isJointLeave,
      name: form.name.trim(),
      source: form.source,
      sourceReference: form.sourceReference.trim() || null,
      ...monitoring,
    };

    try {
      if (editor?.mode === "edit") {
        await updateMutation.mutateAsync({
          id: editor.holiday.id,
          input: payload,
        });
        setFeedback({ message: "Hari libur diperbarui.", variant: "success" });
      } else {
        await createMutation.mutateAsync(payload);
        setFeedback({ message: "Hari libur ditambahkan.", variant: "success" });
      }

      setEditor(null);
    } catch (error) {
      setFeedback({ message: getErrorMessage(error), variant: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setFeedback(null);

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      setFeedback({ message: "Hari libur dihapus.", variant: "success" });
    } catch (error) {
      setFeedback({ message: getErrorMessage(error), variant: "error" });
    }
  };

  return (
    <section className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
      <header className="flex flex-col gap-3 border-b border-[var(--rail-border)] p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--signal-blue)]">
            Admin only
          </p>
          <h2 className="mt-1 text-sm font-semibold text-[var(--rail-ink)]">
            Manajemen Hari Libur
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            Kelola data hari libur dan jalankan sinkronisasi dari penyedia
            eksternal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="holiday-admin-year">
            Tahun
          </label>
          <input
            className="h-9 w-24 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-2.5 text-xs font-semibold text-[var(--rail-ink)] outline-none focus:border-[var(--signal-blue)]"
            id="holiday-admin-year"
            inputMode="numeric"
            max={2999}
            min={1900}
            onChange={(event) => setYear(event.target.value)}
            type="number"
            value={year}
          />
          <button
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--signal-blue)] transition hover:border-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!validYear || syncMutation.isPending}
            onClick={() => void handleSync()}
            type="button"
          >
            <RefreshCw
              aria-hidden="true"
              className={syncMutation.isPending ? "animate-spin" : ""}
              size={13}
            />
            {syncMutation.isPending ? "Sinkronisasi…" : "Sync"}
          </button>
          <button
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--rail-ink)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--signal-blue)]"
            onClick={() => setEditor({ mode: "create" })}
            type="button"
          >
            <Plus aria-hidden="true" size={13} />
            Tambah
          </button>
        </div>
      </header>

      <div className="p-4">
        {feedback ? (
          <div
            className={`mb-3 flex items-start gap-2 rounded-lg border p-3 text-xs leading-5 ${
              feedback.variant === "error"
                ? "border-[var(--signal-red-soft)] bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]"
                : "border-[var(--signal-green-soft)] bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]"
            }`}
          >
            {feedback.variant === "error" ? (
              <AlertCircle aria-hidden="true" className="mt-0.5" size={14} />
            ) : (
              <Check aria-hidden="true" className="mt-0.5" size={14} />
            )}
            <span>{feedback.message}</span>
          </div>
        ) : null}

        {holidaysQuery.isError ? (
          <div className="rounded-lg border border-dashed border-[var(--signal-red-soft)] bg-[var(--background)] p-6 text-center">
            <p className="text-xs leading-5 text-[var(--text-muted)]">
              Data hari libur gagal dimuat.
            </p>
            <button
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[var(--rail-border)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--signal-blue)] transition hover:border-[var(--signal-blue)]"
              onClick={() => void holidaysQuery.refetch()}
              type="button"
            >
              <RefreshCw aria-hidden="true" size={12} />
              Coba lagi
            </button>
          </div>
        ) : holidaysQuery.isLoading ? (
          <div className="space-y-2">
            <div className="skeleton-sheen h-12 rounded-lg" />
            <div className="skeleton-sheen h-12 rounded-lg" />
            <div className="skeleton-sheen h-12 rounded-lg" />
          </div>
        ) : holidays.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--rail-border)] bg-[var(--background)] p-6 text-center">
            <CalendarDays
              aria-hidden="true"
              className="mx-auto text-[var(--signal-blue)]"
              size={22}
            />
            <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
              Belum ada data hari libur untuk {validYear ?? "tahun ini"}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--rail-border)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">Tanggal</th>
                  <th className="px-3 py-2">Kategori</th>
                  <th className="px-3 py-2">Monitoring</th>
                  <th className="px-3 py-2">Cuti Bersama</th>
                  <th className="px-3 py-2">Sumber</th>
                  <th className="px-3 py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday) => (
                  <tr
                    className="border-b border-[var(--rail-border)] last:border-b-0"
                    key={holiday.id}
                  >
                    <td className="px-3 py-2.5 font-semibold text-[var(--rail-ink)]">
                      {holiday.name}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">
                      {dateFormatter.format(new Date(holiday.date))}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">
                      {CATEGORY_LABELS[holiday.category] ?? holiday.category}
                    </td>
                    <td className="px-3 py-2.5">
                      <MonitoringCell holiday={holiday} />
                    </td>
                    <td className="px-3 py-2.5">
                      {holiday.isJointLeave ? (
                        <span className="inline-flex items-center gap-1 text-[var(--signal-green-dark)]">
                          <Check aria-hidden="true" size={12} />
                          Ya
                        </span>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">
                          Tidak
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">
                      {SOURCE_LABELS[holiday.source] ?? holiday.source}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          aria-label={`Ubah ${holiday.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--rail-border)] text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
                          onClick={() => setEditor({ holiday, mode: "edit" })}
                          type="button"
                        >
                          <Pencil aria-hidden="true" size={13} />
                        </button>
                        <button
                          aria-label={`Hapus ${holiday.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--rail-border)] text-[var(--text-muted)] transition hover:border-[var(--signal-red)] hover:text-[var(--signal-red-dark)]"
                          onClick={() => setDeleteTarget(holiday)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editor ? (
        <HolidayEditorModal
          initial={
            editor.mode === "edit"
              ? formFromHoliday(editor.holiday)
              : emptyForm(validYear ?? currentYear)
          }
          isSaving={isMutating}
          mode={editor.mode}
          onClose={() => setEditor(null)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmDeleteModal
          holiday={deleteTarget}
          isDeleting={deleteMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void handleDelete()}
        />
      ) : null}
    </section>
  );
}

/**
 * Shows the window actually in force. `holiday.monitoring` is resolved by the
 * backend, so the UI never recomputes category or weekend-adjacency rules.
 */
function MonitoringCell({ holiday }: { holiday: HolidayApiEntity }) {
  const { before, after, isOverride } = holiday.monitoring;

  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold text-[var(--rail-ink)]">
        {`H-${before} → H+${after}`}
      </span>
      <span
        className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${
          isOverride
            ? "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]"
            : "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]"
        }`}
      >
        {isOverride ? "Kustom" : "Otomatis"}
      </span>
    </div>
  );
}

function MonitoringFieldset({
  form,
  setForm,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  const isCustom = form.monitoringMode === "custom";
  const beforeValue = parseMonitoringDays(form.monitoringBefore);
  const afterValue = parseMonitoringDays(form.monitoringAfter);
  const isInvalid =
    isCustom &&
    (beforeValue === null ||
      afterValue === null ||
      form.monitoringBefore.trim() === "" ||
      form.monitoringAfter.trim() === "");

  return (
    <fieldset className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-3">
      <legend className="px-1 text-xs font-semibold text-[var(--rail-ink)]">
        Window Monitoring
      </legend>

      <div className="flex gap-1.5">
        {(["auto", "custom"] as const).map((mode) => {
          const isActive = form.monitoringMode === mode;

          return (
            <button
              aria-pressed={isActive}
              className={`inline-flex h-8 flex-1 items-center justify-center rounded-lg border px-2.5 text-[11px] font-semibold transition ${
                isActive
                  ? "border-[var(--signal-blue)] bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]"
                  : "border-[var(--rail-border)] bg-[var(--surface-panel)] text-[var(--text-muted)] hover:border-[var(--signal-blue)]"
              }`}
              key={mode}
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  monitoringMode: mode,
                }))
              }
              type="button"
            >
              {mode === "auto" ? "Otomatis" : "Kustom"}
            </button>
          );
        })}
      </div>

      {isCustom ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-[var(--rail-ink)]">
            H- sebelum (hari)
            <input
              className={inputClass}
              inputMode="numeric"
              max={MONITORING_MAX_DAYS}
              min={0}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  monitoringBefore: event.target.value,
                }))
              }
              type="number"
              value={form.monitoringBefore}
            />
          </label>
          <label className="text-xs font-semibold text-[var(--rail-ink)]">
            H+ sesudah (hari)
            <input
              className={inputClass}
              inputMode="numeric"
              max={MONITORING_MAX_DAYS}
              min={0}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  monitoringAfter: event.target.value,
                }))
              }
              type="number"
              value={form.monitoringAfter}
            />
          </label>
        </div>
      ) : (
        <p className="mt-3 text-[11px] leading-5 text-[var(--text-muted)]">
          Mengikuti aturan backend: kategori hari libur, diperlebar menjadi H-7
          sampai H+7 bila tanggalnya berdekatan dengan akhir pekan.
        </p>
      )}

      {isInvalid ? (
        <p className="mt-2 text-[11px] leading-5 text-[var(--signal-red-dark)]">
          Isi kedua sisi dengan angka bulat 0–{MONITORING_MAX_DAYS}. Keduanya
          harus diisi bersama.
        </p>
      ) : null}
    </fieldset>
  );
}

function HolidayEditorModal({
  initial,
  isSaving,
  mode,
  onClose,
  onSubmit,
}: {
  initial: FormState;
  isSaving: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (form: FormState) => void | Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(initial);

  const hasValidWindow =
    form.monitoringMode === "auto" ||
    (form.monitoringBefore.trim() !== "" &&
      form.monitoringAfter.trim() !== "" &&
      parseMonitoringDays(form.monitoringBefore) !== null &&
      parseMonitoringDays(form.monitoringAfter) !== null);

  const isValid =
    form.name.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(form.date) &&
    hasValidWindow;

  return (
    <ModalShell
      onClose={onClose}
      title={mode === "edit" ? "Ubah hari libur" : "Tambah hari libur"}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (isValid && !isSaving) {
            void onSubmit(form);
          }
        }}
      >
        <Field label="Nama" required>
          <input
            className={inputClass}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Contoh: Hari Raya Idul Fitri"
            value={form.name}
          />
        </Field>

        <Field label="Tanggal" required>
          <input
            className={inputClass}
            onChange={(event) =>
              setForm((current) => ({ ...current, date: event.target.value }))
            }
            type="date"
            value={form.date}
          />
        </Field>

        <Field label="Kategori" required>
          <select
            className={inputClass}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value as HolidayApiCategory,
              }))
            }
            value={form.category}
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </Field>

        <MonitoringFieldset form={form} setForm={setForm} />

        <Field label="Sumber" required>
          <select
            className={inputClass}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                source: event.target.value as HolidayApiSource,
              }))
            }
            value={form.source}
          >
            {(Object.keys(SOURCE_LABELS) as HolidayApiSource[]).map(
              (source) => (
                <option key={source} value={source}>
                  {SOURCE_LABELS[source]}
                </option>
              ),
            )}
          </select>
        </Field>

        <Field label="Referensi sumber">
          <input
            className={inputClass}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                sourceReference: event.target.value,
              }))
            }
            placeholder="Opsional"
            value={form.sourceReference}
          />
        </Field>

        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--rail-ink)]">
          <input
            checked={form.isJointLeave}
            className="h-4 w-4 rounded border-[var(--rail-border)]"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                isJointLeave: event.target.checked,
              }))
            }
            type="checkbox"
          />
          Cuti bersama
        </label>

        <div className="flex justify-end gap-2 border-t border-[var(--rail-border)] pt-4">
          <button
            className="inline-flex h-9 items-center rounded-lg border border-[var(--rail-border)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)]"
            onClick={onClose}
            type="button"
          >
            Batal
          </button>
          <button
            className="inline-flex h-9 items-center rounded-lg bg-[var(--rail-ink)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isValid || isSaving}
            type="submit"
          >
            {isSaving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ConfirmDeleteModal({
  holiday,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  holiday: HolidayApiEntity;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell onClose={onCancel} title="Hapus hari libur?">
      <p className="text-xs leading-5 text-[var(--text-muted)]">
        <span className="font-semibold text-[var(--rail-ink)]">
          {holiday.name}
        </span>{" "}
        pada {dateFormatter.format(new Date(holiday.date))} akan dihapus
        permanen.
      </p>
      <div className="mt-4 flex justify-end gap-2 border-t border-[var(--rail-border)] pt-4">
        <button
          className="inline-flex h-9 items-center rounded-lg border border-[var(--rail-border)] px-3 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)]"
          onClick={onCancel}
          type="button"
        >
          Batal
        </button>
        <button
          className="inline-flex h-9 items-center rounded-lg bg-[var(--signal-red)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--signal-red-dark)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isDeleting}
          onClick={onConfirm}
          type="button"
        >
          {isDeleting ? "Menghapus…" : "Hapus"}
        </button>
      </div>
    </ModalShell>
  );
}

const inputClass =
  "mt-1 w-full rounded-lg border border-[var(--rail-border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--rail-ink)] outline-none focus:border-[var(--signal-blue)]";

function Field({
  children,
  label,
  required = false,
}: {
  children: ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the wrapped control is passed as children.
    <label className="block text-xs font-semibold text-[var(--rail-ink)]">
      {label}
      {required ? <span className="text-[var(--signal-red)]"> *</span> : null}
      {children}
    </label>
  );
}

function ModalShell({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // The page behind the modal must not scroll while it is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    // A portal keeps the overlay viewport-anchored: page wrappers such as
    // `template.tsx` apply a transform, which would otherwise become the
    // containing block for a fixed child and pin the modal to the page top.
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(19,35,31,0.42)] p-4 backdrop-blur-[2px]">
      {/* The backdrop is its own labelled control so pointer dismissal stays
          keyboard- and screen-reader-visible without wrapping the dialog. */}
      <button
        aria-label="Tutup modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <section
        aria-label={title}
        aria-modal="true"
        className="relative my-auto max-h-[calc(100dvh-32px)] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--rail-border)] bg-white shadow-[var(--shadow-soft)]"
        role="dialog"
      >
        <header className="flex items-center justify-between gap-3 border-b border-[var(--rail-border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
            {title}
          </h2>
          <button
            aria-label="Tutup modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--rail-border)] text-[var(--text-muted)] transition hover:border-[var(--signal-blue)]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={14} />
          </button>
        </header>
        <div className="p-4">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
