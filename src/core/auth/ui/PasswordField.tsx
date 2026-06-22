import { Eye, EyeOff, LockKeyhole } from "lucide-react";

export interface PasswordFieldProps {
  autoComplete?: string;
  disabled?: boolean;
  id: string;
  isVisible: boolean;
  label: string;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
  placeholder: string;
  required?: boolean;
  value: string;
}

export function PasswordField({
  autoComplete,
  disabled = false,
  id,
  isVisible,
  label,
  onChange,
  onToggleVisibility,
  placeholder,
  required = false,
  value,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        className="mb-2 block text-sm font-semibold text-[var(--rail-ink)]"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex h-12 items-center gap-3 rounded-xl border border-[var(--rail-border)] bg-white px-3 transition-within focus-within:border-[var(--signal-blue)] focus-within:ring-4 focus-within:ring-[rgba(23,95,138,0.12)]">
        <LockKeyhole
          aria-hidden="true"
          className="shrink-0 text-[var(--text-tertiary)]"
          size={18}
        />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--rail-ink)] outline-none placeholder:text-[var(--text-tertiary)]"
          autoComplete={autoComplete}
          disabled={disabled}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          type={isVisible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={
            isVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
          }
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--signal-blue-soft)] hover:text-[var(--signal-blue)]"
          disabled={disabled}
          onClick={onToggleVisibility}
          type="button"
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" size={17} />
          ) : (
            <Eye aria-hidden="true" size={17} />
          )}
        </button>
      </div>
    </div>
  );
}
