import { bitsToBytes, bytesToBits } from "./bits";
import { BitsPerChannel, StegoError } from "./types";

export function createSeededOrder(length: number, seed: string): Uint32Array {
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

export interface LsbOptions {
  seed?: string;
  bitsPerChannel?: BitsPerChannel;
}

function normalizeBitsPerChannel(bitsPerChannel: number | undefined): BitsPerChannel {
  const value = bitsPerChannel ?? 1;
  if (value === 1 || value === 2 || value === 3) {
    return value;
  }
  throw new StegoError("CORRUPTED", `bitsPerChannel tidak didukung: ${value}.`);
}

function getChannelMask(bitsPerChannel: BitsPerChannel): number {
  return (1 << bitsPerChannel) - 1;
}

/**
 * Writes the low-order `bitsPerChannel` bits of each R/G/B channel.
 * Alpha is left untouched. Mutates and returns the same array.
 */
export function embedBytes(
  pixels: Uint8ClampedArray,
  data: Uint8Array,
  options: LsbOptions = {}
): Uint8ClampedArray {
  const bitsPerChannel = normalizeBitsPerChannel(options.bitsPerChannel);
  const bits = bytesToBits(data);
  const availableChannels = Math.floor(pixels.length / 4) * 3;
  const totalCapacity = availableChannels * bitsPerChannel;

  if (bits.length > totalCapacity) {
    throw new StegoError(
      "CAPACITY_EXCEEDED",
      "Pesan terlalu besar untuk kapasitas gambar ini."
    );
  }

  const order = createSeededOrder(availableChannels, options.seed ?? "");
  const mask = getChannelMask(bitsPerChannel);

  for (let bitIndex = 0; bitIndex < bits.length; bitIndex += bitsPerChannel) {
    const channelGroupIndex = Math.floor(bitIndex / bitsPerChannel);
    const channelIndex = order[channelGroupIndex];
    const pixelIndex = Math.floor(channelIndex / 3);
    const channelOffset = channelIndex % 3;
    const idx = pixelIndex * 4 + channelOffset;

    let value = 0;
    for (let offset = 0; offset < bitsPerChannel; offset++) {
      const bit = bits[bitIndex + offset];
      if (bit !== undefined) {
        value = (value << 1) | bit;
      }
    }

    pixels[idx] = (pixels[idx] & ~mask) | (value & mask);
  }

  return pixels;
}

/** Reads `byteCount` bytes back out of the low-order bits of `pixels`, in the same order they were written. */
export function extractBytes(
  pixels: Uint8ClampedArray,
  byteCount: number,
  options: LsbOptions = {}
): Uint8Array {
  const bitsPerChannel = normalizeBitsPerChannel(options.bitsPerChannel);
  const bitCount = byteCount * 8;
  const availableChannels = Math.floor(pixels.length / 4) * 3;
  const totalCapacity = availableChannels * bitsPerChannel;
  if (bitCount > totalCapacity) {
    throw new StegoError("NO_DATA_FOUND", "Gambar tidak cukup besar untuk memuat data ini.");
  }

  const bits = new Uint8Array(bitCount);
  const order = createSeededOrder(availableChannels, options.seed ?? "");
  const mask = getChannelMask(bitsPerChannel);

  for (let bitIndex = 0; bitIndex < bitCount; bitIndex += bitsPerChannel) {
    const channelGroupIndex = Math.floor(bitIndex / bitsPerChannel);
    const channelIndex = order[channelGroupIndex];
    const pixelIndex = Math.floor(channelIndex / 3);
    const channelOffset = channelIndex % 3;
    const idx = pixelIndex * 4 + channelOffset;
    const value = pixels[idx] & mask;

    for (let offset = 0; offset < bitsPerChannel; offset++) {
      bits[bitIndex + offset] = (value >> (bitsPerChannel - 1 - offset)) & 1;
    }
  }

  return bitsToBytes(bits);
}
