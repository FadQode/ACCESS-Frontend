import type { ComplaintCategoryBreakdown } from "../../model/types/dashboard.types";

interface ComplaintCategoryItemProps {
  category: ComplaintCategoryBreakdown;
}

const TONE_MAP: Record<string, string> = {
  delay: "primary",
  refund: "warning",
  cancellation: "purple",
  lost_item: "success",
  facility: "muted",
  payment: "primary",
  account: "warning",
  app_error: "purple",
  other: "muted",
};

export function ComplaintCategoryItem({
  category,
}: ComplaintCategoryItemProps) {
  const tone = TONE_MAP[category.category] || "muted";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-[var(--rail-ink)]">
          {category.label}
        </span>
        <div className="flex gap-2">
          <span className="font-medium text-[var(--text-muted)]">
            {category.count}
          </span>
          <span className="font-semibold text-[var(--signal-blue)]">
            {category.percentage}%
          </span>
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--background)]">
        <div
          className={`h-full rounded-full ${toneClass(tone)}`}
          style={{ width: `${category.percentage}%` }}
        />
      </div>
    </div>
  );
}

function toneClass(tone: string) {
  const classes: Record<string, string> = {
    muted: "bg-[var(--text-tertiary)]",
    primary: "bg-[var(--signal-blue)]",
    purple: "bg-[#7d6bd6]",
    success: "bg-[var(--signal-green)]",
    warning: "bg-[var(--signal-amber)]",
  };

  return classes[tone] || classes.muted;
}
