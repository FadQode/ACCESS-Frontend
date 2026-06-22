"use client";

import Link from "next/link";
import { ApiStateBoundary } from "@/core/components/feedback";
import { DashboardNavbar } from "@/core/components/navbar";
import { DashboardSidebar } from "@/core/components/sidebar";
import { useDashboardSidebar } from "@/core/components/useDashboardSidebar";
import { useComplaintDetail } from "@/core/dashboard/hooks/use-complaint-detail";
import { ApiClientError } from "@/core/dashboard/model/api/client";
import { ComplaintStatusBadge } from "./complaint-status-badge";

export type ComplaintDetailProps = {
  complaintId: string;
};

export function ComplaintDetail({ complaintId }: ComplaintDetailProps) {
  const { closeSidebar, sidebarOpen, toggleSidebar } = useDashboardSidebar();
  const complaintQuery = useComplaintDetail(complaintId);
  const complaint = complaintQuery.data;

  return (
    <main className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <DashboardSidebar
          dashboardRole="agent"
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <DashboardNavbar
            dashboardRole="agent"
            isSidebarOpen={sidebarOpen}
            onSidebarToggle={toggleSidebar}
            roleLabel="Agen layanan"
            userName="User"
          />

          <ApiStateBoundary
            errorMessage={getErrorMessage(complaintQuery.error)}
            isEmpty={!complaint}
            isError={complaintQuery.isError}
            isLoading={complaintQuery.isLoading}
            loadingFallback={
              <div className="h-[420px] animate-pulse rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)]" />
            }
            onRetry={() => {
              void complaintQuery.refetch();
            }}
          >
            {complaint ? (
              <article className="overflow-hidden rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
                <header className="border-b border-[var(--rail-border)] bg-white p-4 sm:p-5">
                  <Link
                    className="text-xs font-semibold text-[var(--signal-blue)] hover:text-[var(--rail-ink)]"
                    href="/agent/complaints"
                  >
                    Back to complaints
                  </Link>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--signal-blue)]">
                        {complaint.referenceNo}
                      </p>
                      <h1 className="mt-2 text-2xl font-semibold text-[var(--rail-ink)]">
                        Complaint Detail
                      </h1>
                    </div>
                    <ComplaintStatusBadge status={complaint.status} />
                  </div>
                </header>

                <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <section className="rounded-lg border border-[var(--rail-border)] bg-[var(--background)] p-4">
                    <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
                      Complaint text
                    </h2>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--rail-ink)]">
                      {complaint.complaintText}
                    </p>
                  </section>

                  <aside className="space-y-3">
                    <DetailItem label="Category" value={complaint.category} />
                    <DetailItem label="Source" value={complaint.source} />
                    <DetailItem
                      label="Complainer"
                      value={complaint.complainerName ?? "-"}
                    />
                    <DetailItem
                      label="Contact"
                      value={complaint.complainerContact ?? "-"}
                    />
                    <DetailItem
                      label="Submitted"
                      value={
                        complaint.submittedAt ?? complaint.createdAt ?? "-"
                      }
                    />
                  </aside>
                </div>
              </article>
            ) : null}
          </ApiStateBoundary>
        </section>
      </div>
    </main>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-[var(--rail-ink)]">
        {value}
      </p>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Failed to load complaint detail.";
}
