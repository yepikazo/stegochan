import { bytesToUint32, concatBytes, uint32ToBytes } from "./bits";
import { StegoError } from "./types";

/** 4 ASCII bytes identifying a StegoChan payload: "S" "T" "G" "1" */
export const MAGIC = new Uint8Array([0x53, 0x54, 0x47, 0x31]);
export const VERSION = 1;

export const SALT_LENGTH = 16; // bytes, for PBKDF2
export const IV_LENGTH = 12; // bytes, required by AES-GCM
export const GCM_TAG_LENGTH = 16; // bytes, appended to ciphertext by Web Crypto

const FIXED_HEADER_LENGTH =
  MAGIC.length + 1 /* version */ + SALT_LENGTH + IV_LENGTH + 4; /* cipher length */

/** Total overhead subtracted from raw capacity: fixed header + GCM auth tag. */
export const HEADER_LENGTH = FIXED_HEADER_LENGTH + GCM_TAG_LENGTH;

export interface Packet {
  salt: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
}

/** Serializes salt + iv + ciphertext into the byte stream that gets embedded. */
export function buildPacket(packet: Packet): Uint8Array {
  return concatBytes(
    MAGIC,
    new Uint8Array([VERSION]),
    packet.salt,
    packet.iv,
    uint32ToBytes(packet.ciphertext.length),
    packet.ciphertext
  );
}

/** Reads the fixed-size part of a packet to learn how many more bytes to extract. */
export function parseFixedHeader(bytes: Uint8Array): {
  salt: Uint8Array;
  iv: Uint8Array;
  cipherLength: number;
} {
  if (bytes.length < FIXED_HEADER_LENGTH) {
    throw new StegoError("NO_DATA_FOUND", "Gambar terlalu kecil untuk berisi data StegoChan.");
  }
  for (let i = 0; i < MAGIC.length; i++) {
    if (bytes[i] !== MAGIC[i]) {
      throw new StegoError(
        "NO_DATA_FOUND",
        "Tidak ditemukan data StegoChan pada gambar ini."
      );
    }
  }
  let offset = MAGIC.length;
  const version = bytes[offset];
  offset += 1;
  if (version !== VERSION) {
    throw new StegoError("CORRUPTED", `Versi paket (${version}) tidak didukung.`);
  }
  const salt = bytes.slice(offset, offset + SALT_LENGTH);
  offset += SALT_LENGTH;
  const iv = bytes.slice(offset, offset + IV_LENGTH);
  offset += IV_LENGTH;
  const cipherLength = bytesToUint32(bytes, offset);
  return { salt, iv, cipherLength };
}

export const FIXED_HEADER_BYTES = FIXED_HEADER_LENGTH;
