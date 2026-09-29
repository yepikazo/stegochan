"use client";

import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/CinematicNavigation";
import { ExtractIcon, LockIcon } from "@/components/icons";

const linkClassName =
  "inline-flex min-h-11 items-center justify-center gap-2.5 rounded-lg border px-5 text-[0.82rem] font-semibold no-underline transition hover:-translate-y-px max-[700px]:min-h-10 max-[700px]:px-[13px]";

export default function NavActions() {
  const pathname = usePathname();
  const embedActive = pathname === "/embed";
  const extractActive = pathname === "/extract";
  const batchActive = pathname === "/batch";

  return (
    <div className="flex items-center gap-3 max-[700px]:gap-2">
      <TransitionLink
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
      </TransitionLink>

      <TransitionLink
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
      </TransitionLink>

      <TransitionLink
        href="/batch"
        aria-current={batchActive ? "page" : undefined}
        className={`${linkClassName} ${
          batchActive
            ? "border-[#f3b83f] bg-[#f3b83f] text-[#19150b] hover:border-[#ffc95a] hover:bg-[#ffc95a]"
            : "border-[#303238] bg-transparent text-[#efeee9] hover:border-[#4a4c53] hover:bg-[#1d1f24]"
        }`}
      >
        <span className="max-[700px]:hidden">Uji Massal</span>
        <span aria-hidden="true" className="font-mono text-[0.8rem]">∑</span>
      </TransitionLink>
    </div>
  );
}
