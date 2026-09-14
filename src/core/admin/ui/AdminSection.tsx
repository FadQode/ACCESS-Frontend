import type { ReactNode } from "react";

export type AdminSectionProps = {
  children: ReactNode;
  subtitle: string;
  title: string;
};

export function AdminSection({ children, subtitle, title }: AdminSectionProps) {
  return (
    <section className="rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] shadow-[var(--shadow-soft)]">
      <header className="border-b border-[var(--rail-border)] p-4">
        <h2 className="text-sm font-semibold text-[var(--rail-ink)]">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
          {subtitle}
        </p>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
