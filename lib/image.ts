import { StegoError } from "./stego/types";

const MAX_DIMENSION = 4000;

export interface LoadedImage {
  imageData: ImageData;
  width: number;
  height: number;
  previewUrl: string;
}

function ensureCanvasContext(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new StegoError("UNSUPPORTED_IMAGE", "Canvas 2D tidak didukung di browser ini.");
  }

  return context;
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** Decodes a File into raw pixel data via an off-DOM canvas. */
export async function loadImageFromFile(file: File): Promise<LoadedImage> {
  if (!file.type.startsWith("image/")) {
    throw new StegoError("UNSUPPORTED_IMAGE", "File yang dipilih bukan gambar.");
  }

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new StegoError("UNSUPPORTED_IMAGE", "Gagal membaca gambar. Coba format lain.");
  });

  if (bitmap.width > MAX_DIMENSION || bitmap.height > MAX_DIMENSION) {
    throw new StegoError(
      "UNSUPPORTED_IMAGE",
      `Gambar terlalu besar. Maksimum ${MAX_DIMENSION}x${MAX_DIMENSION} piksel.`
    );
  }

  const canvas = createCanvas(bitmap.width, bitmap.height);
  const context = ensureCanvasContext(canvas);
  context.drawImage(bitmap, 0, 0);

  // Force full opacity so alpha premultiplication never touches our RGB LSBs.
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < imageData.data.length; i += 4) {
    imageData.data[i] = 255;
  }

  return {
    imageData,
    width: canvas.width,
    height: canvas.height,
    previewUrl: URL.createObjectURL(file),
  };
}

/** Renders ImageData back to a canvas and exports it as a lossless PNG blob. */
export function imageDataToPngBlob(imageData: ImageData): Promise<Blob> {
  const canvas = createCanvas(imageData.width, imageData.height);
  const context = ensureCanvasContext(canvas);
  context.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new StegoError("UNSUPPORTED_IMAGE", "Gagal mengekspor PNG."));
    }, "image/png");
  });
}

export function imageDataToPreviewUrl(imageData: ImageData): string {
  const canvas = createCanvas(imageData.width, imageData.height);
  const context = ensureCanvasContext(canvas);
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}
