"use client";

import type { BatchResult } from "@/lib/batch/types";

const HEADERS = ["No", "Citra", "Mode", "Pesan", "Byte", "MSE", "PSNR", "≥30dB", "Δ-hist", "Waktu", "Status"];

function statusClass(status: BatchResult["status"]) {
  if (status === "OK") return "bg-[#1e3324] text-[#5aab6e]";
  if (status === "SKIP") return "bg-[#33291e] text-[#c99a3f]";
  return "bg-[#3b1f1f] text-[#f08080]";
}

export default function ResultsTable({ results }: { results: BatchResult[] }) {
  if (!results.length) return null;

  return (
    <section className="overflow-x-auto rounded-2xl border border-[#303238]">
      <table className="w-full min-w-[900px] border-collapse bg-[#1d1f24] text-left font-mono text-[0.72rem]">
        <thead>
          <tr className="border-b border-[#303238] text-[#6e6f74]">
            {HEADERS.map((h) => (
              <th key={h} className="px-3 py-2.5 font-medium uppercase tracking-[0.08em]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={r.key} className="border-b border-[#25272d] text-[#cfd0d3]">
              <td className="px-3 py-2">{i + 1}</td>
              <td className="max-w-[180px] truncate px-3 py-2" title={r.imageName}>
                {r.imageName}
              </td>
              <td className="px-3 py-2">{r.mode}-bit</td>
              <td className="px-3 py-2">{r.msgLabel.split(" ")[0]}</td>
              <td className="px-3 py-2">{r.msgBytes}</td>
              <td className="px-3 py-2">{r.mse === null ? "—" : r.mse.toFixed(4)}</td>
              <td className="px-3 py-2">{r.psnr === null ? "—" : r.psnr.toFixed(2)}</td>
              <td className="px-3 py-2">{r.pass30 === null ? "—" : r.pass30 ? "Ya" : "Tidak"}</td>
              <td className="px-3 py-2">{r.histDist === null ? "—" : r.histDist.toFixed(4)}</td>
              <td className="px-3 py-2">{r.timeMs === null ? "—" : `${Math.round(r.timeMs)}ms`}</td>
              <td className="px-3 py-2">
                <span className={`rounded-full px-2 py-0.5 text-[0.65rem] ${statusClass(r.status)}`}>{r.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
