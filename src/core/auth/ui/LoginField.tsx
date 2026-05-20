import { Mail } from "lucide-react";

interface LoginFieldProps {
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: "email" | "text";
  value: string;
}

export function LoginField({
  id,
  label,
  onChange,
  placeholder,
  type,
  value,
}: LoginFieldProps) {
  return (
    <div>
      <label
        className="mb-2 block text-sm font-semibold text-[var(--rail-ink)]"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex h-12 items-center gap-3 rounded-xl border border-[var(--rail-border)] bg-white px-3 transition-within focus-within:border-[var(--signal-blue)] focus-within:ring-4 focus-within:ring-[rgba(23,95,138,0.12)]">
        <Mail
          aria-hidden="true"
          className="shrink-0 text-[var(--text-tertiary)]"
          size={18}
        />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--rail-ink)] outline-none placeholder:text-[var(--text-tertiary)]"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </div>
    </div>
  );
}
