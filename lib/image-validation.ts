export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
export const IMAGE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(",");
export const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;

export function isSupportedImage(file: File) {
  const fileName = file.name.toLowerCase();

  return (
    ACCEPTED_IMAGE_TYPES.includes(file.type) ||
    fileName.endsWith(".png") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg")
  );
}

/** Mengembalikan pesan error atau null bila file valid. */
export function validateImageFile(file: File): string | null {
  if (!isSupportedImage(file)) {
    return "Format gambar harus PNG atau JPG.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Ukuran gambar maksimal 20 MB.";
  }
  return null;
}
