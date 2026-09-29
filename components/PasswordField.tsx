"use client";

import type { ReactNode } from "react";
import { EyeIcon } from "./icons";

interface PasswordFieldProps {
  label?: string;
  badge?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder: string;
  autoComplete?: string;
}

export default function PasswordField({
  label = "Password / stego-key",
  badge,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
  autoComplete = "new-password",
}: PasswordFieldProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[#6e6f74]">
          {label}
        </label>
        {badge}
      </div>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-[54px] w-full rounded-2xl border border-[#303238] bg-[#1d1f24] px-4 pr-14 text-[0.9rem] text-[#efeee9] outline-none transition placeholder:text-[#4a4c53] focus:border-[#f3b83f]"
        />

        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-[#6e6f74] hover:bg-[#2a2c32] hover:text-[#efeee9]"
        >
          <EyeIcon hidden={!show} />
        </button>
      </div>
    </div>
  );
}
