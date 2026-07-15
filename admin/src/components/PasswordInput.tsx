"use client";

import { useId, useState } from "react";

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
}

// Reused on every password field across the app (login, setup, self change,
// admin-assisted reset) — className stays constant, id/name vary per instance
// so each field is individually addressable.
export default function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete = "current-password",
  required = true,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const toggleId = useId();

  return (
    <div className="password-input flex flex-col gap-1">
      <label htmlFor={id} className="password-input__label text-sm font-medium text-primary-900">
        {label}
      </label>
      <div className="password-input__field relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          required={required}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-primary-200 px-3 py-2 pr-10 text-sm text-primary-900 outline-none focus:border-primary-500"
        />
        <button
          type="button"
          id={toggleId}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="password-input__toggle absolute inset-y-0 right-0 flex w-10 items-center justify-center text-primary-400 hover:text-primary-900"
        >
          {visible ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 4.24A9.94 9.94 0 0112 4c5.5 0 9 5 10 8-.32 1-.87 2.1-1.62 3.15M6.1 6.1C3.86 7.6 2.3 9.9 2 12c1 3 4.5 8 10 8 1.2 0 2.32-.24 3.32-.66" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}