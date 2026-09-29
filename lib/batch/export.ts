import { computeHistogram, getUsableCapacityBytes } from "@/lib/stego";
import { channelStats, msgBytes } from "./utils";
import type { BatchCombo, BatchImage, BatchMessage, BatchResult } from "./types";

function round2(v: number) {
  return Math.round(v * 100) / 100;
}

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

/** Workbook 4 sheet: Cover, PSNR_MSE (agregat 6 baris per citra), Uji_JPEG, Metadata. */
export async function exportBatchXlsx({ images, messages, combos, results }: BatchExportContext) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const stamp = timestamp();

  // Sheet 1: daftar cover + rata-rata RGB cover per citra (1 baris per citra).
  const coverHeader = ["ID", "Citra", "Dimensi", "Kap 1-bit (B)", "Kap 2-bit (B)", "Kap 3-bit (B)", "Mean_R", "Mean_G", "Mean_B"];
  const coverRows = images.map((img, i) => {
    const hist = computeHistogram(img.imageData);
    return [
      `C${i + 1}`,
      img.name,
      `${img.width}x${img.height}`,
      getUsableCapacityBytes(img.width, img.height, 1),
      getUsableCapacityBytes(img.width, img.height, 2),
      getUsableCapacityBytes(img.width, img.height, 3),
      round2(channelStats(hist.r).mean),
      round2(channelStats(hist.g).mean),
      round2(channelStats(hist.b).mean),
    ];
  });

  // Sheet 2: per kombinasi + mean RGB stego (bahan grafik histogram laporan).
  const mainHeader = ["No", "Citra", "Dimensi", "Mode_m", "Pesan", "Byte_pesan", "MSE", "PSNR (dB)", "Lolos 30dB", "Status", "mean_R", "mean_G", "mean_B"];
  const mainRows = results.map((r, i) => {
    const means =
      r.histStego !== null
        ? [round2(channelStats(r.histStego.r).mean), round2(channelStats(r.histStego.g).mean), round2(channelStats(r.histStego.b).mean)]
        : ["", "", ""];
    return [
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
      ...means,
    ];
  });

  const jpeg = [
    ["No", "Sumber stego (citra-pesan-mode)", "Disimpan ulang sebagai", "Hasil ekstraksi", "Keterangan"],
    ...results
      .filter((r) => r.status === "OK")
      .slice(0, 15)
      .map((r) => [`${r.imageName}-${r.msgLabel}-m${r.mode}`, "JPG kualitas bawaan aplikasi (isi manual via Paint/GIMP)", "coba di halaman Extract", ""]),
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
    ["Catatan", "Rata-rata PSNR aritmetik deskriptif; SKIP = over-kapasitas dikecualikan. Histogram + bidang LSB berupa screenshot di laporan."],
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([coverHeader, ...coverRows]), "Cover");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([mainHeader, ...mainRows]), "PSNR_MSE");
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
