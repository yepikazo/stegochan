"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function LockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="16" height="12" x="4" y="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ExtractIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4V2" />
      <path d="M12 22v-2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
    </svg>
  );
}

const linkClassName =
  "inline-flex min-h-11 items-center justify-center gap-2.5 rounded-lg border px-5 text-[0.82rem] font-semibold no-underline transition hover:-translate-y-px max-[700px]:min-h-10 max-[700px]:px-[13px]";

export default function NavActions() {
  const pathname = usePathname();
  const embedActive = pathname === "/embed";
  const extractActive = pathname === "/extract";

  return (
    <div className="flex items-center gap-3 max-[700px]:gap-2">
      <Link
        href="/embed"
        aria-current={embedActive ? "page" : undefined}
        className={`${linkClassName} ${
          embedActive
            ? "border-[#f3b83f] bg-[#f3b83f] text-[#19150b] hover:border-[#ffc95a] hover:bg-[#ffc95a]"
            : "border-[#303238] bg-transparent text-[#efeee9] hover:border-[#4a4c53] hover:bg-[#1d1f24]"
        }`}
      >
        <span className="max-[700px]:hidden">Embed</span>
        <LockIcon />
      </Link>

      <Link
        href="/extract"
        aria-current={extractActive ? "page" : undefined}
        className={`${linkClassName} ${
          extractActive
            ? "border-[#f3b83f] bg-[#f3b83f] text-[#19150b] hover:border-[#ffc95a] hover:bg-[#ffc95a]"
            : "border-[#303238] bg-transparent text-[#efeee9] hover:border-[#4a4c53] hover:bg-[#1d1f24]"
        }`}
      >
        <span className="max-[700px]:hidden">Extract</span>
        <ExtractIcon />
      </Link>
    </div>
  );
}