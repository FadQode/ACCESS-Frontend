"use client";

import { LogIn } from "lucide-react";
import { useLoginForm } from "../hooks/useLoginForm";
import { loginFormContent } from "../service/login.mock";
import { LoginField } from "./LoginField";
import { PasswordField } from "./PasswordField";

export function LoginForm() {
  const {
    email,
    errorMessage,
    handleSubmit,
    isPasswordVisible,
    isSubmitting,
    password,
    rememberMe,
    setEmail,
    setPassword,
    setRememberMe,
    togglePasswordVisibility,
  } = useLoginForm();

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

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <label className="flex min-w-0 items-center gap-2 text-[var(--text-muted)]">
            <input
              checked={rememberMe}
              className="h-4 w-4 rounded border-[var(--rail-border)] accent-[var(--signal-blue)]"
              disabled={isSubmitting}
              onChange={(event) => setRememberMe(event.target.checked)}
              type="checkbox"
            />
            <span>{loginFormContent.rememberMeLabel}</span>
          </label>
          <button
            className="shrink-0 font-semibold text-[var(--signal-blue)] transition hover:text-[var(--rail-ink)]"
            disabled={isSubmitting}
            type="button"
          >
            {loginFormContent.forgotPasswordLabel}
          </button>
        </div>

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
