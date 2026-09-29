import { loadImageFromFile } from "@/lib/image";
import { uid } from "./utils";
import type { BatchImage } from "./types";

const MAX_FILE_BYTES = 20 * 1024 * 1024;

function isSupportedImage(file: File) {
  return (
    file.type === "image/png" ||
    file.type === "image/jpeg" ||
    file.name.toLowerCase().endsWith(".png") ||
    file.name.toLowerCase().endsWith(".jpg") ||
    file.name.toLowerCase().endsWith(".jpeg")
  );
}

export interface LoadedBatchImages {
  loaded: BatchImage[];
  errors: string[];
}

/** Validasi + decode banyak file menjadi BatchImage. Tidak menyentuh state React. */
export async function validateAndLoadImages(files: FileList | File[]): Promise<LoadedBatchImages> {
  const loaded: BatchImage[] = [];
  const errors: string[] = [];

  for (const file of Array.from(files)) {
    if (!isSupportedImage(file)) {
      errors.push(`Format ${file.name} harus PNG/JPG.`);
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      errors.push(`Ukuran ${file.name} maksimal 20 MB.`);
      continue;
    }
    try {
      const decoded = await loadImageFromFile(file);
      loaded.push({
        id: uid(),
        name: file.name,
        size: file.size,
        width: decoded.width,
        height: decoded.height,
        imageData: decoded.imageData,
        previewUrl: decoded.previewUrl,
      });
    } catch (err) {
      errors.push(err instanceof Error ? err.message : `Gagal memuat ${file.name}.`);
    }
  }

  return { loaded, errors };
}

export function revokeBatchImage(image: BatchImage) {
  URL.revokeObjectURL(image.previewUrl);
}
