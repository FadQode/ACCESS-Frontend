import type { ComplaintCategoryBreakdown } from "../../model/types/dashboard.types";
import { ComplaintCategoryItem } from "./ComplaintCategoryItem";

interface ComplaintCategoryCardProps {
  categories: ComplaintCategoryBreakdown[];
}

export function ComplaintCategoryCard({
  categories,
}: ComplaintCategoryCardProps) {
  return (
    <section className="rounded-[18px] border border-[var(--rail-border)] bg-[var(--surface-panel)] p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
          Complaints by category
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Distribusi keluhan pada periode yang dipilih.
        </p>
      </div>
      <div className="grid gap-4">
        {categories.map((category) => (
          <ComplaintCategoryItem category={category} key={category.category} />
        ))}
      </div>
    </section>
  );
}
