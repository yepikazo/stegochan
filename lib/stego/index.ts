import { decryptMessage, encryptMessage } from "./crypto";
import { embedBytes, extractBytes } from "./lsb";
import {
  buildPacket,
  FIXED_HEADER_BYTES,
  getFixedHeaderLength,
  GCM_TAG_LENGTH,
  parseFixedHeader,
} from "./header";
import { getUsableCapacityBytes } from "./capacity";
import { BitsPerChannel, HideOptions, RevealOptions, StegoError } from "./types";

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
 *
 * The header itself is embedded with the same bitsPerChannel as the payload,
 * so the mode cannot be probed with a fixed 1-bit read (the old code did
 * exactly that, which broke extraction for 2-bit and 3-bit images).
 * Instead we try each candidate mode and keep the one whose header parses
 * with a matching magic, version, and mode plus a sane cipher length.
 */
export async function revealMessage(image: ImageData, options: RevealOptions): Promise<string> {
  const seed = options.stegoKey ?? options.password;

  const explicit = options.bitsPerChannel;
  if (explicit !== undefined && explicit !== 1 && explicit !== 2 && explicit !== 3) {
    throw new StegoError("CORRUPTED", `Mode LSB tidak didukung: ${explicit}.`);
  }
  const candidates: BitsPerChannel[] = explicit !== undefined ? [explicit] : [1, 2, 3];

  const availableChannels = Math.floor(image.data.length / 4) * 3;
  let selected: {
    bitsPerChannel: BitsPerChannel;
    fixedHeaderLength: number;
    totalLength: number;
    salt: Uint8Array;
    iv: Uint8Array;
    cipherLength: number;
  } | null = null;
  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const headerBytes = extractBytes(image.data, FIXED_HEADER_BYTES, {
        seed,
        bitsPerChannel: candidate,
      });
      const parsed = parseFixedHeader(headerBytes);
      if (parsed.bitsPerChannel !== candidate) {
        continue;
      }
      const fixedHeaderLength = getFixedHeaderLength(parsed.version);
      if (!Number.isInteger(parsed.cipherLength) || parsed.cipherLength < GCM_TAG_LENGTH) {
        continue;
      }
      const totalLength = fixedHeaderLength + parsed.cipherLength;
      if (totalLength * 8 > availableChannels * candidate) {
        continue;
      }
      selected = {
        bitsPerChannel: candidate,
        fixedHeaderLength,
        totalLength,
        salt: parsed.salt,
        iv: parsed.iv,
        cipherLength: parsed.cipherLength,
      };
      break;
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  if (!selected) {
    if (explicit !== undefined && lastError instanceof StegoError) {
      throw lastError;
    }
    throw new StegoError("NO_DATA_FOUND", "Tidak ditemukan data StegoChan pada gambar ini.");
  }

  const { bitsPerChannel, fixedHeaderLength, totalLength, salt, iv } = selected;

  const fullPacket = extractBytes(image.data, totalLength, {
    seed,
    bitsPerChannel,
  });

  const ciphertext = fullPacket.slice(fixedHeaderLength);

  const plaintext = await decryptMessage(
    options.password,
    salt,
    iv,
    ciphertext
  );

  return decoder.decode(plaintext);
}
