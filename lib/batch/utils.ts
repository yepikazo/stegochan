import { computeHistogram, getUsableCapacityBytes } from "@/lib/stego";
import type { BitsPerChannel } from "@/lib/stego/types";
import type { BatchCombo, BatchImage, BatchMessage, BatchResult, BatchSummary } from "./types";

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

/** Jarak histogram cover vs stego: rerata selisih absolut bin per kanal per piksel. */
export function histogramDistance(a: ImageData, b: ImageData) {
  const ha = computeHistogram(a);
  const hb = computeHistogram(b);
  const n = a.width * a.height || 1;
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += Math.abs(ha.r[i] - hb.r[i]) + Math.abs(ha.g[i] - hb.g[i]) + Math.abs(ha.b[i] - hb.b[i]);
  }
  return sum / (3 * n);
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
