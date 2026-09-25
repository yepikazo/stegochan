import { decryptMessage, encryptMessage } from "./crypto";
import { embedBytes, extractBytes } from "./lsb";
import { buildPacket, FIXED_HEADER_BYTES, parseFixedHeader } from "./header";
import { getUsableCapacityBytes } from "./capacity";
import { HideOptions, RevealOptions, StegoError } from "./types";

export { getRawCapacityBytes, getUsableCapacityBytes, formatBytes } from "./capacity";
export { StegoError } from "./types";
export type { StegoErrorCode, HideOptions, RevealOptions } from "./types";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function cloneImageData(source: ImageData): ImageData {
  return new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
}

export function calculateMse(source: ImageData, target: ImageData): number {
  const length = Math.min(source.data.length, target.data.length);
  let sum = 0;

  for (let i = 0; i < length; i++) {
    const diff = source.data[i] - target.data[i];
    sum += diff * diff;
  }

  return sum / length;
}

export function calculatePsnr(source: ImageData, target: ImageData): number {
  const mse = calculateMse(source, target);
  if (mse === 0) {
    return Number.POSITIVE_INFINITY;
  }
  return 10 * Math.log10((255 * 255) / mse);
}

/**
 * Encrypts `message` with `password` and hides it in the least-significant
 * bits of `image`. Returns a new ImageData; the input is left untouched.
 */
export async function hideMessage(
  image: ImageData,
  message: string,
  options: HideOptions
): Promise<ImageData> {
  const plaintext = encoder.encode(message);
  const usable = getUsableCapacityBytes(image.width, image.height);
  if (plaintext.length > usable) {
    throw new StegoError(
      "CAPACITY_EXCEEDED",
      `Pesan (${plaintext.length} byte) melebihi kapasitas gambar ini (${usable} byte).`
    );
  }

  const seed = options.stegoKey ?? options.password;
  const { salt, iv, ciphertext } = await encryptMessage(options.password, plaintext);
  const packet = buildPacket({ salt, iv, ciphertext });

  const output = cloneImageData(image);
  embedBytes(output.data, packet, { seed });
  return output;
}

/**
 * Reverses `hideMessage`: reads the header, decrypts the payload, and
 * returns the original plaintext message.
 */
export async function revealMessage(image: ImageData, options: RevealOptions): Promise<string> {
  const seed = options.stegoKey ?? options.password;
  const headerBytes = extractBytes(image.data, FIXED_HEADER_BYTES, { seed });
  const { salt, iv, cipherLength } = parseFixedHeader(headerBytes);

  const totalLength = FIXED_HEADER_BYTES + cipherLength;
  const fullPacket = extractBytes(image.data, totalLength, { seed });
  const ciphertext = fullPacket.slice(FIXED_HEADER_BYTES);

  const plaintext = await decryptMessage(options.password, salt, iv, ciphertext);
  return decoder.decode(plaintext);
}
