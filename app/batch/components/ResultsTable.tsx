"use client";

import { Fragment, useState } from "react";
import HistogramChart from "@/components/HistogramChart";
import type { BatchHistogram, BatchResult } from "@/lib/batch/types";

const HEADERS = ["No", "Citra", "Mode", "Pesan", "Byte", "MSE", "PSNR", "≥30dB", "Δ-hist", "Waktu", "Status", "RGB"];

function statusClass(status: BatchResult["status"]) {
  if (status === "OK") return "bg-[#1e3324] text-[#5aab6e]";
  if (status === "SKIP") return "bg-[#33291e] text-[#c99a3f]";
  return "bg-[#3b1f1f] text-[#f08080]";
}

function downloadHistogramCsv(result: BatchResult) {
  if (!result.histCover || !result.histStego) return;
  const header = "bin,cover_R,cover_G,cover_B,stego_R,stego_G,stego_B";
  const lines: string[] = [header];
  for (let i = 0; i < 256; i++) {
    lines.push(
      [
        i,
        result.histCover.r[i],
        result.histCover.g[i],
        result.histCover.b[i],
        result.histStego.r[i],
        result.histStego.g[i],
        result.histStego.b[i],
      ].join(",")
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `histogram_${result.imageName}-${result.msgLabel}-m${result.mode}.csv`.replace(/[^A-Za-z0-9._-]+/g, "_");
  anchor.click();
  URL.revokeObjectURL(url);
}

function HistogramDetail({ cover, stego }: { cover: BatchHistogram; stego: BatchHistogram }) {
  const channels = [
    { title: "R cover vs stego", coverData: cover.r, stegoData: stego.r, color: "red" },
    { title: "G cover vs stego", coverData: cover.g, stegoData: stego.g, color: "green" },
    { title: "B cover vs stego", coverData: cover.b, stegoData: stego.b, color: "blue" },
  ] as const;

  return (
    <div className="grid gap-3 px-3 py-3 md:grid-cols-3">
      {channels.map(({ title, coverData, stegoData, color }) => (
        <div key={title} className="rounded-xl border border-[#303238] bg-[#25272d] p-3">
          <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-[#98999e]">{title}</p>
          <HistogramChart title="cover" data={coverData} color={color} />
          <div className="mt-2">
            <HistogramChart title="stego" data={stegoData} color={color} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ResultsTable({ results }: { results: BatchResult[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!results.length) return null;

  return (
    <section className="overflow-x-auto rounded-2xl border border-[#303238]">
      <table className="w-full min-w-[980px] border-collapse bg-[#1d1f24] text-left font-mono text-[0.72rem]">
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
            <Fragment key={r.key}>
              <tr className="border-b border-[#25272d] text-[#cfd0d3]">
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
                <td className="px-3 py-2">
                  {r.status === "OK" && r.histCover && r.histStego ? (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setExpanded((prev) => (prev === r.key ? null : r.key))}
                        className="rounded-lg border border-[#303238] px-2 py-1 text-[0.65rem] text-[#98999e] hover:border-[#f3b83f] hover:text-[#f3b83f]"
                      >
                        {expanded === r.key ? "Tutup" : "Lihat"}
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadHistogramCsv(r)}
                        className="rounded-lg border border-[#303238] px-2 py-1 text-[0.65rem] text-[#98999e] hover:border-[#f3b83f] hover:text-[#f3b83f]"
                      >
                        CSV
                      </button>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
              {expanded === r.key && r.histCover && r.histStego && (
                <tr className="border-b border-[#25272d] bg-[#191b1f]">
                  <td colSpan={12}>
                    <HistogramDetail cover={r.histCover} stego={r.histStego} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </section>
  );
}
