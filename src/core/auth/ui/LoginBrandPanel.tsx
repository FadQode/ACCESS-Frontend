import { Route, ShieldCheck } from "lucide-react";
import { loginBrandContent } from "../service/login.mock";

export function LoginBrandPanel() {
  return (
    <aside className="relative flex min-h-[280px] flex-col overflow-hidden bg-[var(--rail-ink)] px-7 py-8 text-white md:min-h-full">
      <div className="absolute -right-16 top-10 h-36 w-36 rounded-full border border-white/10" />
      <div className="absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-[rgba(217,154,24,0.13)] blur-2xl" />
      <div className="relative z-10">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--signal-amber)] text-[var(--rail-ink)] shadow-[0_12px_28px_rgba(217,154,24,0.28)]">
          <Route aria-hidden="true" size={24} />
        </div>

        <p className="text-2xl font-bold leading-none tracking-[0.02em]">
          {loginBrandContent.productName}
        </p>
        <p className="mt-2 text-sm font-medium text-[var(--signal-blue-soft)]">
          {loginBrandContent.portalLabel}
        </p>

        <div className="my-8 h-px w-16 bg-[var(--signal-amber)]" />

        <h1 className="max-w-[220px] text-2xl font-semibold leading-tight">
          {loginBrandContent.tagline}
        </h1>
        <p className="mt-4 max-w-[230px] text-sm leading-6 text-[var(--text-on-dark)]">
          {loginBrandContent.description}
        </p>
      </div>

      <div className="relative z-10 mt-auto flex items-center justify-between gap-4 pt-8 text-xs text-[var(--text-on-dark)]">
        <span>{loginBrandContent.copyright}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[var(--signal-amber)]">
          <ShieldCheck aria-hidden="true" size={16} />
        </span>
      </div>
    </aside>
  );
}
