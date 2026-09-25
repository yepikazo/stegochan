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

  const { salt, iv, ciphertext } = await encryptMessage(options.password, plaintext);
  const packet = buildPacket({ salt, iv, ciphertext });

  const output = cloneImageData(image);
  embedBytes(output.data, packet);
  return output;
}

/**
 * Reverses `hideMessage`: reads the header, decrypts the payload, and
 * returns the original plaintext message.
 */
export async function revealMessage(image: ImageData, options: RevealOptions): Promise<string> {
  const headerBytes = extractBytes(image.data, FIXED_HEADER_BYTES);
  const { salt, iv, cipherLength } = parseFixedHeader(headerBytes);

  const totalLength = FIXED_HEADER_BYTES + cipherLength;
  const fullPacket = extractBytes(image.data, totalLength);
  const ciphertext = fullPacket.slice(FIXED_HEADER_BYTES);

  const plaintext = await decryptMessage(options.password, salt, iv, ciphertext);
  return decoder.decode(plaintext);
}
