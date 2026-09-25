import { HEADER_LENGTH } from "./header";

/** We use 1 bit per R/G/B channel and skip alpha entirely. */
const CHANNELS_PER_PIXEL = 3;
const BITS_PER_BYTE = 8;

/** Raw bytes we can hide in an image this size, before subtracting the header. */
export function getRawCapacityBytes(width: number, height: number): number {
  return Math.floor((width * height * CHANNELS_PER_PIXEL) / BITS_PER_BYTE);
}

/** Bytes actually available to the caller's message, after the header overhead. */
export function getUsableCapacityBytes(width: number, height: number): number {
  return Math.max(0, getRawCapacityBytes(width, height) - HEADER_LENGTH);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
