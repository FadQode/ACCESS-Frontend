import type { ComplaintCategorySummary } from "../../model/manager-dashboard.types";

interface ComplaintCategoryItemProps {
  category: ComplaintCategorySummary;
}

export function ComplaintCategoryItem({
  category,
}: ComplaintCategoryItemProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-[var(--rail-ink)]">
          {category.label}
        </span>
        <span className="font-semibold text-[var(--text-muted)]">
          {category.percentage}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--background)]">
        <div
          className={`h-full rounded-full ${toneClass(category.tone)}`}
          style={{ width: `${category.percentage}%` }}
        />
      </div>
    </div>
  );
}

function toneClass(tone: ComplaintCategorySummary["tone"]) {
  const classes: Record<ComplaintCategorySummary["tone"], string> = {
    muted: "bg-[var(--text-tertiary)]",
    primary: "bg-[var(--signal-blue)]",
    purple: "bg-[#7d6bd6]",
    success: "bg-[var(--signal-green)]",
    warning: "bg-[var(--signal-amber)]",
  };

  return classes[tone];
}
