import { bitsToBytes, bytesToBits } from "./bits";
import { StegoError } from "./types";

function createSeededOrder(length: number, seed: string): Uint32Array {
  const order = new Uint32Array(length);
  for (let i = 0; i < length; i++) order[i] = i;

  if (!seed || length <= 1) {
    return order;
  }

  let state = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    state ^= seed.charCodeAt(i);
    state = Math.imul(state, 16777619);
  }

  const random = () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = order[i];
    order[i] = order[j];
    order[j] = temp;
  }

  return order;
}

interface LsbOptions {
  seed?: string;
}

/**
 * Writes `data` into the least-significant bit of the R, G, B channels of
 * `pixels` (a Uint8ClampedArray in RGBA order, e.g. from ImageData.data).
 * Alpha is left untouched. Mutates and returns the same array.
 */
export function embedBytes(
  pixels: Uint8ClampedArray,
  data: Uint8Array,
  options: LsbOptions = {}
): Uint8ClampedArray {
  const bits = bytesToBits(data);
  const availableChannels = Math.floor(pixels.length / 4) * 3;

  if (bits.length > availableChannels) {
    throw new StegoError(
      "CAPACITY_EXCEEDED",
      "Pesan terlalu besar untuk kapasitas gambar ini."
    );
  }

  const order = createSeededOrder(availableChannels, options.seed ?? "");

  for (let bitIndex = 0; bitIndex < bits.length; bitIndex++) {
    const channelIndex = order[bitIndex];
    const pixelIndex = Math.floor(channelIndex / 3);
    const channelOffset = channelIndex % 3;
    const idx = pixelIndex * 4 + channelOffset;
    pixels[idx] = (pixels[idx] & 0xfe) | bits[bitIndex];
  }
  return pixels;
}

/** Reads `byteCount` bytes back out of the LSBs of `pixels`, in the same order they were written. */
export function extractBytes(
  pixels: Uint8ClampedArray,
  byteCount: number,
  options: LsbOptions = {}
): Uint8Array {
  const bitCount = byteCount * 8;
  const availableChannels = Math.floor(pixels.length / 4) * 3;
  if (bitCount > availableChannels) {
    throw new StegoError("NO_DATA_FOUND", "Gambar tidak cukup besar untuk memuat data ini.");
  }

  const bits = new Uint8Array(bitCount);
  const order = createSeededOrder(availableChannels, options.seed ?? "");

  for (let bitIndex = 0; bitIndex < bitCount; bitIndex++) {
    const channelIndex = order[bitIndex];
    const pixelIndex = Math.floor(channelIndex / 3);
    const channelOffset = channelIndex % 3;
    bits[bitIndex] = pixels[pixelIndex * 4 + channelOffset] & 1;
  }
  return bitsToBytes(bits);
}
