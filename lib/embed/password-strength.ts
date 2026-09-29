export interface PasswordStrength {
  label: string;
  width: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { label: "Belum diisi", width: "w-0" };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Lemah", width: "w-[25%]" };
  if (score === 2) return { label: "Sedang", width: "w-1/2" };
  if (score === 3) return { label: "Kuat", width: "w-3/4" };
  return { label: "Sangat kuat", width: "w-full" };
}
