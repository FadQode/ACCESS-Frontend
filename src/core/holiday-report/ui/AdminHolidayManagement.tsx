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
import { type ReactNode, useState } from "react";
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
    name: "",
    source: "manual",
    sourceReference: "",
  };
}

function formFromHoliday(holiday: HolidayApiEntity): FormState {
  return {
    category: holiday.category,
    date: holiday.date,
    isJointLeave: holiday.isJointLeave,
    name: holiday.name,
    source: holiday.source,
    sourceReference: holiday.sourceReference ?? "",
  };
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

    const payload = {
      category: form.category,
      date: form.date,
      isJointLeave: form.isJointLeave,
      name: form.name.trim(),
      source: form.source,
      sourceReference: form.sourceReference.trim() || null,
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

  const isValid =
    form.name.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(form.date);

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
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(19,35,31,0.42)] p-4 backdrop-blur-[2px]"
      role="presentation"
    >
      <section className="mx-auto my-8 max-w-lg rounded-xl border border-[var(--rail-border)] bg-white shadow-[var(--shadow-soft)]">
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
    </div>
  );
}
