import { bitsToBytes, bytesToBits } from "./bits";
import { StegoError } from "./types";

/**
 * Writes `data` into the least-significant bit of the R, G, B channels of
 * `pixels` (a Uint8ClampedArray in RGBA order, e.g. from ImageData.data).
 * Alpha is left untouched. Mutates and returns the same array.
 */
export function embedBytes(pixels: Uint8ClampedArray, data: Uint8Array): Uint8ClampedArray {
  const bits = bytesToBits(data);
  const availableChannels = Math.floor(pixels.length / 4) * 3;

  if (bits.length > availableChannels) {
    throw new StegoError(
      "CAPACITY_EXCEEDED",
      "Pesan terlalu besar untuk kapasitas gambar ini."
    );
  }

  let bitIndex = 0;
  for (let pixel = 0; bitIndex < bits.length; pixel++) {
    const base = pixel * 4; // RGBA stride
    for (let channel = 0; channel < 3 && bitIndex < bits.length; channel++) {
      const idx = base + channel;
      pixels[idx] = (pixels[idx] & 0xfe) | bits[bitIndex];
      bitIndex++;
    }
  }
  return pixels;
}

/** Reads `byteCount` bytes back out of the LSBs of `pixels`, in the same order they were written. */
export function extractBytes(pixels: Uint8ClampedArray, byteCount: number): Uint8Array {
  const bitCount = byteCount * 8;
  const availableChannels = Math.floor(pixels.length / 4) * 3;
  if (bitCount > availableChannels) {
    throw new StegoError("NO_DATA_FOUND", "Gambar tidak cukup besar untuk memuat data ini.");
  }

  const bits = new Uint8Array(bitCount);
  let bitIndex = 0;
  for (let pixel = 0; bitIndex < bitCount; pixel++) {
    const base = pixel * 4;
    for (let channel = 0; channel < 3 && bitIndex < bitCount; channel++) {
      bits[bitIndex] = pixels[base + channel] & 1;
      bitIndex++;
    }
  }
  return bitsToBytes(bits);
}
