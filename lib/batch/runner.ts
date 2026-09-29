import { calculateMse, calculatePsnr, computeHistogram, hideMessage } from "@/lib/stego";
import type { BitsPerChannel } from "@/lib/stego/types";
import { histogramDistanceFromHist } from "./utils";
import type { BatchCombo, BatchResult } from "./types";

export interface RunBatchOptions {
  combos: BatchCombo[];
  password: string;
  shouldCancel: () => boolean;
  onProgress: (done: number, total: number, partial: BatchResult[]) => void;
}

const yieldToUI = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Menjalankan seluruh kombinasi berurutan; over-kapasitas dicatat SKIP tanpa embed. */
export async function runBatchCombos({ combos, password, shouldCancel, onProgress }: RunBatchOptions): Promise<BatchResult[]> {
  const out: BatchResult[] = [];

  for (const combo of combos) {
    if (shouldCancel()) break;
    const key = `${combo.img.id}|${combo.msg.id}|${combo.mode}`;

    if (!combo.ok) {
      out.push({
        key,
        imageName: combo.img.name,
        dimensions: `${combo.img.width}×${combo.img.height}`,
        mode: combo.mode,
        msgLabel: combo.msg.label,
        msgBytes: combo.bytes,
        capacity: combo.capacity,
        mse: null,
        psnr: null,
        pass30: null,
        histDist: null,
        histCover: null,
        histStego: null,
        timeMs: null,
        status: "SKIP",
        note: "Melebihi kapasitas",
      });
    } else {
      const startedAt = performance.now();
      try {
        const stego = await hideMessage(combo.img.imageData, combo.msg.text, {
          password,
          stegoKey: password,
          bitsPerChannel: combo.mode as BitsPerChannel,
        });
        const mse = calculateMse(combo.img.imageData, stego);
        const psnr = calculatePsnr(combo.img.imageData, stego);
        const histCover = computeHistogram(combo.img.imageData);
        const histStego = computeHistogram(stego);
        out.push({
          key,
          imageName: combo.img.name,
          dimensions: `${combo.img.width}×${combo.img.height}`,
          mode: combo.mode,
          msgLabel: combo.msg.label,
          msgBytes: combo.bytes,
          capacity: combo.capacity,
          mse,
          psnr,
          pass30: psnr >= 30,
          histDist: histogramDistanceFromHist(histCover, histStego, combo.img.width * combo.img.height),
          histCover,
          histStego,
          timeMs: performance.now() - startedAt,
          status: "OK",
          note: "",
        });
      } catch (err) {
        out.push({
          key,
          imageName: combo.img.name,
          dimensions: `${combo.img.width}×${combo.img.height}`,
          mode: combo.mode,
          msgLabel: combo.msg.label,
          msgBytes: combo.bytes,
          capacity: combo.capacity,
          mse: null,
          psnr: null,
          pass30: null,
          histDist: null,
          histCover: null,
          histStego: null,
          timeMs: performance.now() - startedAt,
          status: "FAIL",
          note: err instanceof Error ? err.message : "Gagal embed",
        });
      }
    }

    onProgress(out.length, combos.length, [...out]);
    await yieldToUI();
  }

  return out;
}
