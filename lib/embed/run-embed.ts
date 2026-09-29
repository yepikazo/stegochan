import { imageDataToPngBlob, imageDataToPreviewUrl } from "@/lib/image";
import {
  calculateMse,
  calculatePsnr,
  computeHistogram,
  extractLsbPlane,
  getUsableCapacityBytes,
  hideMessage,
} from "@/lib/stego";
import type { BitsPerChannel } from "@/lib/stego/types";

export interface EmbedJobInput {
  imageData: ImageData;
  message: string;
  password: string;
  lsbMode: BitsPerChannel;
  messageBytes: number;
}

export interface EmbedJobResult {
  mse: number;
  psnr: number;
  capacity1bit: number;
  capacitySelected: number;
  psnr1bit: number | null;
  psnrSelected: number;
  resultUrl: string;
  lsbCoverUrl: string;
  lsbStegoUrl: string;
  histograms: {
    cover: { r: number[]; g: number[]; b: number[] };
    stego: { r: number[]; g: number[]; b: number[] };
  };
  blob: Blob;
}

/** Seluruh pipeline embed + metrik + baseline 1-bit + visual. Murni fungsi, tanpa state React. */
export async function runEmbedJob({
  imageData,
  message,
  password,
  lsbMode,
  messageBytes,
}: EmbedJobInput): Promise<EmbedJobResult> {
  const stego = await hideMessage(imageData, message, {
    password,
    stegoKey: password,
    bitsPerChannel: lsbMode,
  });

  const mse = calculateMse(imageData, stego);
  const psnr = calculatePsnr(imageData, stego);
  const capacity1bit = getUsableCapacityBytes(imageData.width, imageData.height, 1);

  let baselinePsnr: number | null = null;
  if (lsbMode === 1) {
    baselinePsnr = psnr;
  } else if (messageBytes <= capacity1bit) {
    const baseline = await hideMessage(imageData, message, {
      password,
      stegoKey: password,
      bitsPerChannel: 1,
    });
    baselinePsnr = calculatePsnr(imageData, baseline);
  }

  const coverPlane = extractLsbPlane(imageData.data, imageData.width, imageData.height);
  const stegoPlane = extractLsbPlane(stego.data, stego.width, stego.height);

  return {
    mse,
    psnr,
    capacity1bit,
    capacitySelected: getUsableCapacityBytes(imageData.width, imageData.height, lsbMode),
    psnr1bit: baselinePsnr,
    psnrSelected: psnr,
    resultUrl: imageDataToPreviewUrl(stego),
    lsbCoverUrl: imageDataToPreviewUrl(coverPlane),
    lsbStegoUrl: imageDataToPreviewUrl(stegoPlane),
    histograms: {
      cover: computeHistogram(imageData),
      stego: computeHistogram(stego),
    },
    blob: await imageDataToPngBlob(stego),
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
