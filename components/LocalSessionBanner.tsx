"use client";

export default function LocalSessionBanner() {
  return (
    <div className="mb-5 flex items-center justify-between rounded-xl border border-[#303238] bg-[#1d1f24] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4e9b63] opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4e9b63]" />
        </span>

        <span className="font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-[#98999e]">
          Sesi lokal aktif
        </span>
      </div>

      <span className="font-mono text-[0.62rem] text-[#55565b]">TANPA LOG</span>
    </div>
  );
}
