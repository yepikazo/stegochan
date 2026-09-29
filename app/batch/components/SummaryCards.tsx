"use client";

import type { BatchSummary } from "@/lib/batch/types";

export default function SummaryCards({ summary }: { summary: BatchSummary[] }) {
  if (!summary.some((s) => s.count > 0)) return null;

  return (
    <section className="mb-8 grid gap-3 md:grid-cols-3">
      {summary.map((s) => (
        <div key={s.mode} className="rounded-xl border border-[#303238] bg-[#1d1f24] p-4">
          <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[#6e6f74]">
            Rata-rata PSNR {s.mode}-bit
          </p>
          <p className="mt-2 text-xl font-semibold">{s.avgPsnr === null ? "—" : `${s.avgPsnr.toFixed(2)} dB`}</p>
          <p className="mt-1 text-xs text-[#888174]">
            {s.count} run OK · kapasitas {s.mode}×
          </p>
        </div>
      ))}
    </section>
  );
}
