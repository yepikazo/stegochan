import { msgBytes } from "./utils";
import type { BatchCombo, BatchImage, BatchMessage, BatchResult } from "./types";

export interface BatchExportContext {
  images: BatchImage[];
  messages: BatchMessage[];
  combos: BatchCombo[];
  results: BatchResult[];
}

function timestamp() {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Workbook 3 sheet: PSNR_MSE, Uji_JPEG, Metadata. */
export async function exportBatchXlsx({ images, messages, combos, results }: BatchExportContext) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const stamp = timestamp();

  const main = [
    ["No", "Citra", "Dimensi", "Mode m", "Pesan", "Byte pesan", "MSE", "PSNR (dB)", "Lolos 30dB", "Status"],
    ...results.map((r, i) => [
      i + 1,
      r.imageName,
      r.dimensions,
      r.mode,
      r.msgLabel,
      r.msgBytes,
      r.mse ?? "",
      r.psnr ?? "",
      r.pass30 === null ? "" : r.pass30 ? "Ya" : "Tidak",
      r.status === "OK" ? (r.pass30 ? "OK" : "OK (di bawah ambang)") : r.status,
    ]),
  ];

  const jpeg = [
    ["No", "Sumber stego (citra-pesan-mode)", "Disimpan ulang sebagai", "Hasil ekstraksi", "Keterangan"],
    ...results
      .filter((r) => r.status === "OK")
      .slice(0, 15)
      .map((r) => [`${r.imageName}-${r.msgLabel}-m${r.mode}`, "JPG Q70 (isi manual via Paint/GIMP)", "coba di halaman Extract", ""]),
    ["", "Kontrol: file PNG asli", "PNG (tanpa kompresi)", "berhasil, pesan utuh", "pembanding"],
  ];

  const meta = [
    ["Field", "Nilai"],
    ["Waktu uji", stamp],
    ["Password", "sama untuk semua run (tulis di laporan, jangan tulis nilainya di repo publik)"],
    ["Pesan uji", ...messages.map((m) => `${m.label} = ${msgBytes(m.text)} B`)],
    ["Citra", ...images.map((img, i) => `C${i + 1} = ${img.name} ${img.width}x${img.height}`)],
    ["Total kombinasi", combos.length],
    [
      "OK / SKIP / FAIL",
      `${results.filter((r) => r.status === "OK").length} / ${results.filter((r) => r.status === "SKIP").length} / ${results.filter((r) => r.status === "FAIL").length}`,
    ],
    ["Catatan", "Histogram + bidang LSB berupa screenshot di laporan (tidak diangkakan di Excel)"],
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(main), "PSNR_MSE");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(jpeg), "Uji_JPEG");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(meta), "Metadata");
  XLSX.writeFile(wb, `StegoChan_Uji_${stamp}.xlsx`);
}

export function exportBatchCsv(results: BatchResult[]) {
  const header = "No,Citra,Dimensi,Mode,Pesan,Byte,MSE,PSNR,Status";
  const lines = results.map((r, i) =>
    [i + 1, `"${r.imageName}"`, `"${r.dimensions}"`, r.mode, `"${r.msgLabel}"`, r.msgBytes, r.mse ?? "", r.psnr ?? "", r.status].join(",")
  );
  downloadBlob(new Blob([[header, ...lines].join("\n")], { type: "text/csv" }), "StegoChan_Uji.csv");
}
