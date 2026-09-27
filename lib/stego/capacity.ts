import { getHeaderLengthForVersion, LEGACY_VERSION, VERSION } from "./header";
import { BitsPerChannel } from "./types";

/** We use 1/2/3 bits per R/G/B channel and skip alpha entirely. */
const CHANNELS_PER_PIXEL = 3;
const BITS_PER_BYTE = 8;

function normalizeBitsPerChannel(bitsPerChannel: number | undefined): BitsPerChannel {
  const value = bitsPerChannel ?? 1;
  if (value === 1 || value === 2 || value === 3) {
    return value;
  }
  throw new Error(`bitsPerChannel tidak didukung: ${value}.`);
}

function getEffectiveHeaderLength(bitsPerChannel: BitsPerChannel): number {
  return bitsPerChannel === 1
    ? getHeaderLengthForVersion(LEGACY_VERSION)
    : getHeaderLengthForVersion(VERSION);
}

/** Raw bytes we can hide in an image this size, before subtracting the header. */
export function getRawCapacityBytes(
  width: number,
  height: number,
  bitsPerChannel: BitsPerChannel | number = 1
): number {
  const value = normalizeBitsPerChannel(bitsPerChannel);
  return Math.floor((width * height * CHANNELS_PER_PIXEL * value) / BITS_PER_BYTE);
}

/** Bytes actually available to the caller's message, after the header overhead. */
export function getUsableCapacityBytes(
  width: number,
  height: number,
  bitsPerChannel: BitsPerChannel | number = 1
): number {
  const mode = normalizeBitsPerChannel(bitsPerChannel);
  return Math.max(0, getRawCapacityBytes(width, height, mode) - getEffectiveHeaderLength(mode));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
