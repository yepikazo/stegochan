import { decryptMessage, encryptMessage } from "./crypto";
import { embedBytes, extractBytes } from "./lsb";
import {
  buildPacket,
  FIXED_HEADER_BYTES,
  getFixedHeaderLength,
  LEGACY_VERSION,
  MAGIC,
  parseFixedHeader,
  VERSION,
} from "./header";
import { getUsableCapacityBytes } from "./capacity";
import { HideOptions, RevealOptions, StegoError } from "./types";

export { getRawCapacityBytes, getUsableCapacityBytes, formatBytes } from "./capacity";
export { computeHistogram } from "./histogram";
export { StegoError } from "./types";
export { extractLsbPlane } from "./lsb-plane";
export type { BitsPerChannel, StegoErrorCode, HideOptions, RevealOptions } from "./types";

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
  const bitsPerChannel = options.bitsPerChannel ?? 1;
  const plaintext = encoder.encode(message);
  const usable = getUsableCapacityBytes(image.width, image.height, bitsPerChannel);
  if (plaintext.length > usable) {
    throw new StegoError(
      "CAPACITY_EXCEEDED",
      `Pesan (${plaintext.length} byte) melebihi kapasitas gambar ini (${usable} byte).`
    );
  }

  const seed = options.stegoKey ?? options.password;
  const { salt, iv, ciphertext } = await encryptMessage(options.password, plaintext);
  const packet = buildPacket({ salt, iv, ciphertext }, bitsPerChannel);

  const output = cloneImageData(image);
  embedBytes(output.data, packet, { seed, bitsPerChannel });
  return output;
}

/**
 * Reverses `hideMessage`: reads the header, decrypts the payload, and
 * returns the original plaintext message.
 */
export async function revealMessage(image: ImageData, options: RevealOptions): Promise<string> {
  const seed = options.stegoKey ?? options.password;
  const magicProbe = extractBytes(image.data, MAGIC.length + 2, { seed, bitsPerChannel: 1 });
  const version = magicProbe[MAGIC.length];

  let bitsPerChannel: 1 | 2 | 3 = 1;
  if (version === LEGACY_VERSION) {
    bitsPerChannel = 1;
  } else if (version === VERSION) {
    const rawMode = magicProbe[MAGIC.length + 1];
    if (rawMode === 1 || rawMode === 2 || rawMode === 3) {
      bitsPerChannel = rawMode;
    } else {
      throw new StegoError("CORRUPTED", `Mode LSB tidak didukung: ${rawMode}.`);
    }
  } else {
    throw new StegoError("CORRUPTED", `Versi paket (${version}) tidak didukung.`);
  }

  const fixedHeaderLength = getFixedHeaderLength(version);
  const headerBytes = extractBytes(image.data, fixedHeaderLength, { seed, bitsPerChannel });
  const { salt, iv, cipherLength, bitsPerChannel: packetBitsPerChannel } = parseFixedHeader(headerBytes);

  const effectiveBitsPerChannel = packetBitsPerChannel ?? bitsPerChannel;
  const totalLength = fixedHeaderLength + cipherLength;
  const fullPacket = extractBytes(image.data, totalLength, {
    seed,
    bitsPerChannel: effectiveBitsPerChannel,
  });
  const ciphertext = fullPacket.slice(fixedHeaderLength);

  const plaintext = await decryptMessage(options.password, salt, iv, ciphertext);
  return decoder.decode(plaintext);
}
