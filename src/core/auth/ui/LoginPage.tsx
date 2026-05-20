import { LoginBrandPanel } from "./LoginBrandPanel";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(23,95,138,0.13),transparent_34%),linear-gradient(135deg,#eef1ee_0%,#f8faf5_47%,#e8eee9_100%)] px-4 py-8 text-[var(--rail-ink)]">
      <section className="grid w-full max-w-[880px] overflow-hidden rounded-3xl border border-[rgba(19,35,31,0.12)] bg-[var(--surface-panel)] shadow-[0_24px_60px_rgba(19,35,31,0.16)] md:min-h-[520px] md:grid-cols-[280px_minmax(0,1fr)]">
        <LoginBrandPanel />
        <LoginForm />
      </section>
    </main>
  );
}
