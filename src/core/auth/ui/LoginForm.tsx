"use client";

import { Check, Copy, LogIn } from "lucide-react";
import { useState } from "react";
import { useLoginForm } from "../hooks/useLoginForm";
import { dummyLoginAccounts, loginFormContent } from "../service/login.mock";
import { LoginField } from "./LoginField";
import { PasswordField } from "./PasswordField";

export function LoginForm() {
  const [copiedValue, setCopiedValue] = useState("");
  const {
    email,
    errorMessage,
    handleSubmit,
    isPasswordVisible,
    isSubmitting,
    password,
    setEmail,
    setPassword,
    togglePasswordVisibility,
  } = useLoginForm();

  const copyCredential = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedValue(value);
    window.setTimeout(() => setCopiedValue(""), 1800);
  };

  return (
    <div className="flex items-center justify-center px-6 py-8 sm:px-10">
      <form className="w-full max-w-[360px]" onSubmit={handleSubmit}>
        <div className="mb-8">
          <p className="text-3xl font-semibold leading-tight text-[var(--rail-ink)]">
            {loginFormContent.title}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            {loginFormContent.subtitle}
          </p>
        </div>

        <div className="grid gap-4">
          <LoginField
            autoComplete="email"
            disabled={isSubmitting}
            id="email"
            label={loginFormContent.emailLabel}
            onChange={setEmail}
            placeholder={loginFormContent.emailPlaceholder}
            required
            type="email"
            value={email}
          />
          <PasswordField
            autoComplete="current-password"
            disabled={isSubmitting}
            id="password"
            isVisible={isPasswordVisible}
            label={loginFormContent.passwordLabel}
            onChange={setPassword}
            onToggleVisibility={togglePasswordVisibility}
            placeholder={loginFormContent.passwordPlaceholder}
            required
            value={password}
          />
        </div>

        <section
          aria-labelledby="demo-access-title"
          className="mt-6 rounded-2xl border border-[rgba(19,35,31,0.12)] bg-[rgba(238,241,238,0.72)] px-4 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <p
              className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--rail-ink)]"
              id="demo-access-title"
            >
              {loginFormContent.demoTitle}
            </p>
            <span className="text-[11px] text-[var(--text-muted)]">
              Demo only
            </span>
          </div>
          <div className="mt-3 grid gap-2">
            {dummyLoginAccounts.map((account) => (
              <div
                className="flex items-center justify-between gap-3 border-t border-[rgba(19,35,31,0.09)] pt-2 first:border-t-0 first:pt-0"
                key={account.role}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold capitalize text-[var(--rail-ink)]">
                    {account.role}
                  </p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {account.email}
                  </p>
                </div>
                <button
                  aria-label={`Salin email ${account.role}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--signal-blue)] transition hover:bg-white hover:text-[var(--rail-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-blue)]"
                  onClick={() => copyCredential(account.email)}
                  title={`Salin email ${account.role}`}
                  type="button"
                >
                  {copiedValue === account.email ? (
                    <Check aria-hidden="true" size={15} />
                  ) : (
                    <Copy aria-hidden="true" size={15} />
                  )}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-[rgba(19,35,31,0.09)] pt-2">
            <div>
              <p className="text-[11px] text-[var(--text-muted)]">
                {loginFormContent.demoPasswordLabel}
              </p>
              <p className="font-mono text-xs font-semibold text-[var(--rail-ink)]">
                password123
              </p>
            </div>
            <button
              aria-label="Salin kata sandi demo"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--signal-blue)] transition hover:bg-white hover:text-[var(--rail-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-blue)]"
              onClick={() => copyCredential("password123")}
              title="Salin kata sandi demo"
              type="button"
            >
              {copiedValue === "password123" ? (
                <Check aria-hidden="true" size={15} />
              ) : (
                <Copy aria-hidden="true" size={15} />
              )}
            </button>
          </div>
        </section>

        {errorMessage ? (
          <p
            className="mt-4 rounded-xl border border-[var(--signal-red-soft)] bg-[var(--signal-red-soft)] px-3 py-2 text-sm font-medium text-[var(--signal-red-dark)]"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <button
          className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--rail-ink)] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(19,35,31,0.18)] transition hover:bg-[var(--signal-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal-blue)] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          <LogIn aria-hidden="true" size={17} />
          {isSubmitting ? "Memproses..." : loginFormContent.submitLabel}
        </button>

        <p className="mt-7 text-center text-xs leading-5 text-[var(--text-muted)]">
          {loginFormContent.supportPrefix}
          <br />
          <a
            className="font-semibold text-[var(--signal-blue)] hover:text-[var(--rail-ink)]"
            href={`mailto:${loginFormContent.supportEmail}`}
          >
            {loginFormContent.supportEmail}
          </a>
        </p>
      </form>
    </div>
  );
}
