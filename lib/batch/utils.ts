import { computeHistogram, getUsableCapacityBytes } from "@/lib/stego";
import type { BitsPerChannel } from "@/lib/stego/types";
import type { BatchCombo, BatchHistogram, BatchImage, BatchMessage, BatchResult, BatchSummary } from "./types";

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function msgBytes(text: string) {
  return new TextEncoder().encode(text).length;
}

export const MESSAGE_PRESETS: BatchMessage[] = [
  { id: "P1", label: "P1-pendek (100 B)", text: "A".repeat(100) },
  { id: "P2", label: "P2-sedang (1 KB)", text: "StegoChan uji batch. ".repeat(52).slice(0, 1024) },
  { id: "P3", label: "P3-panjang (5 KB)", text: "Pesan rahasia untuk uji kapasitas dan PSNR. ".repeat(120).slice(0, 5120) },
];

/** Statistik ringkas satu kanal: mean, std, min, max dari 256 bin. */
export interface ChannelStats {
  mean: number;
  std: number;
  min: number;
  max: number;
}

export function channelStats(bins: number[]): ChannelStats {
  const total = bins.reduce((s, v) => s + v, 0);
  const weighted = bins.reduce((s, v, i) => s + v * i, 0);
  const mean = total ? weighted / total : 0;
  const variance = total
    ? bins.reduce((s, v, i) => s + v * (i - mean) * (i - mean), 0) / total
    : 0;
  return { mean, std: Math.sqrt(variance), min: Math.min(...bins), max: Math.max(...bins) };
}

/** Chi-square cover vs stego per kanal: kecil = histogram nyaris identik. */
export function chiSquareChannel(cover: number[], stego: number[]): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    const expected = cover[i] + 1;
    const diff = stego[i] - cover[i];
    sum += (diff * diff) / expected;
  }
  return sum;
}

/** Korelasi Pearson cover vs stego per kanal: mendekati 1 = nyaris identik. */
export function correlationChannel(cover: number[], stego: number[]): number {
  const n = 256;
  const meanC = cover.reduce((s, v) => s + v, 0) / n;
  const meanS = stego.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let denC = 0;
  let denS = 0;
  for (let i = 0; i < n; i++) {
    const dc = cover[i] - meanC;
    const ds = stego[i] - meanS;
    num += dc * ds;
    denC += dc * dc;
    denS += ds * ds;
  }
  if (!denC || !denS) return 1;
  return num / Math.sqrt(denC * denS);
}
export function histogramDistanceFromHist(ha: BatchHistogram, hb: BatchHistogram, pixelCount: number) {
  const n = pixelCount || 1;
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += Math.abs(ha.r[i] - hb.r[i]) + Math.abs(ha.g[i] - hb.g[i]) + Math.abs(ha.b[i] - hb.b[i]);
  }
  return sum / (3 * n);
}

/** Jarak histogram cover vs stego langsung dari dua ImageData. */
export function histogramDistance(a: ImageData, b: ImageData) {
  return histogramDistanceFromHist(
    computeHistogram(a),
    computeHistogram(b),
    a.width * a.height
  );
}

/** Kartesius citra × pesan × mode beserta cek kapasitas tiap kombinasi. */
export function buildCombos(images: BatchImage[], messages: BatchMessage[], modes: number[]): BatchCombo[] {
  const list: BatchCombo[] = [];
  for (const img of images) {
    for (const msg of messages) {
      const bytes = msgBytes(msg.text);
      for (const mode of modes) {
        const capacity = getUsableCapacityBytes(img.width, img.height, mode as BitsPerChannel);
        list.push({ img, msg, mode, bytes, capacity, ok: bytes <= capacity });
      }
    }
  }
  return list;
}

export function summarizeResults(results: BatchResult[]): BatchSummary[] {
  const ok = results.filter((r) => r.status === "OK" && r.psnr !== null);
  return [1, 2, 3].map((m) => {
    const rows = ok.filter((r) => r.mode === m);
    const avg = rows.length ? rows.reduce((s, r) => s + (r.psnr ?? 0), 0) / rows.length : null;
    return { mode: m, count: rows.length, avgPsnr: avg };
  });
}
