type DashboardSkeletonVariant = "overview" | "queue" | "workflow" | "workspace";

interface DashboardPageSkeletonProps {
  variant?: DashboardSkeletonVariant;
}

const overviewCards = ["kpi-1", "kpi-2", "kpi-3", "kpi-4"];
const queueItems = ["queue-1", "queue-2", "queue-3", "queue-4"];
const detailBlocks = ["detail-1", "detail-2", "detail-3"];
const workflowSteps = ["step-1", "step-2", "step-3", "step-4"];

export function DashboardPageSkeleton({
  variant = "overview",
}: DashboardPageSkeletonProps) {
  return (
    <main
      aria-busy="true"
      className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5"
    >
      <span className="sr-only">Loading dashboard</span>
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <aside className="hidden h-[calc(100vh-40px)] w-[248px] shrink-0 flex-col rounded-[20px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-3 lg:flex">
          <div className="flex items-center gap-3 border-b border-[var(--rail-border)] pb-4">
            <SkeletonBlock className="h-10 w-10 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-3 w-28 rounded-full" />
              <SkeletonBlock className="h-2.5 w-20 rounded-full" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {queueItems.map((item) => (
              <SkeletonBlock className="h-11 rounded-xl" key={item} />
            ))}
          </div>
          <div className="mt-6 space-y-2">
            {detailBlocks.map((item) => (
              <SkeletonBlock className="h-20 rounded-2xl" key={item} />
            ))}
          </div>
        </aside>

        <section className="min-w-0 flex-1 rounded-[22px] bg-[var(--surface-muted)] p-3 sm:p-5">
          <SkeletonBlock className="mb-4 h-[72px] rounded-[18px]" />
          {variant === "workspace" ? <WorkspaceSkeleton /> : null}
          {variant === "queue" ? <QueueSkeleton /> : null}
          {variant === "workflow" ? <WorkflowSkeleton /> : null}
          {variant === "overview" ? <OverviewSkeleton /> : null}
        </section>
      </div>
    </main>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((item) => (
          <SkeletonBlock className="h-32 rounded-lg" key={item} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <SkeletonBlock className="h-[360px] rounded-lg" />
        <SkeletonBlock className="h-[360px] rounded-lg" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <SkeletonBlock className="h-[360px] rounded-lg" />
        <SkeletonBlock className="h-[360px] rounded-lg" />
      </div>
    </div>
  );
}

function WorkflowSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
      <div className="border-b border-[var(--rail-border)] p-4 sm:p-5">
        <SkeletonBlock className="h-8 max-w-[520px] rounded-lg" />
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {detailBlocks.map((item) => (
            <SkeletonBlock className="h-20 rounded-lg" key={item} />
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-[920px] flex-col gap-3 p-4 sm:p-5 lg:p-6">
        <SkeletonBlock className="h-10 rounded-lg" />
        {workflowSteps.map((item) => (
          <SkeletonBlock className="h-44 rounded-xl" key={item} />
        ))}
      </div>
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="grid min-h-[700px] overflow-hidden rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] xl:grid-cols-[320px_minmax(0,1fr)_300px]">
      <div className="border-b border-[var(--rail-border)] p-4 xl:border-b-0 xl:border-r">
        <SkeletonBlock className="h-10 rounded-lg" />
        <div className="mt-4 space-y-3">
          {queueItems.map((item) => (
            <SkeletonBlock className="h-32 rounded-lg" key={item} />
          ))}
        </div>
      </div>
      <div className="space-y-4 bg-[var(--background)] p-4">
        {workflowSteps.map((item) => (
          <SkeletonBlock className="h-44 rounded-xl" key={item} />
        ))}
      </div>
      <div className="space-y-3 border-t border-[var(--rail-border)] p-4 xl:border-l xl:border-t-0">
        {detailBlocks.map((item) => (
          <SkeletonBlock className="h-36 rounded-lg" key={item} />
        ))}
      </div>
    </div>
  );
}

function QueueSkeleton() {
  return (
    <div className="grid min-h-[720px] gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
      <div className="rounded-lg border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4">
        <SkeletonBlock className="h-11 rounded-lg" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {overviewCards.map((item) => (
            <SkeletonBlock className="h-9 rounded-lg" key={item} />
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {queueItems.map((item) => (
            <SkeletonBlock className="h-32 rounded-lg" key={item} />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <SkeletonBlock className="h-44 rounded-lg" />
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {workflowSteps.map((item) => (
              <SkeletonBlock className="h-44 rounded-lg" key={item} />
            ))}
          </div>
          <div className="space-y-4">
            <SkeletonBlock className="h-56 rounded-lg" />
            <SkeletonBlock className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`skeleton-sheen ${className}`} />;
}
