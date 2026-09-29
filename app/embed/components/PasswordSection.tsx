"use client";

import PasswordField from "@/components/PasswordField";
import type { PasswordStrength } from "@/lib/embed/password-strength";

interface PasswordSectionProps {
  password: string;
  showPassword: boolean;
  strength: PasswordStrength;
  onPasswordChange: (value: string) => void;
  onToggleShow: () => void;
}

export default function PasswordSection({
  password,
  showPassword,
  strength,
  onPasswordChange,
  onToggleShow,
}: PasswordSectionProps) {
  return (
    <section className="mb-8">
      <PasswordField
        value={password}
        onChange={onPasswordChange}
        show={showPassword}
        onToggleShow={onToggleShow}
        placeholder="Password untuk enkripsi dan urutan penyisipan"
        autoComplete="new-password"
        badge={
          password ? (
            <span className="font-mono text-[0.68rem] text-[#55565b]">{strength.label}</span>
          ) : undefined
        }
      />

      <div className="mt-3 flex items-center gap-3">
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#303238]">
          <div className={`h-full rounded-full bg-[#f3b83f] transition-all ${strength.width}`} />
        </div>

        <span className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[#55565b]">AES-256-GCM</span>
      </div>
    </section>
  );
}
