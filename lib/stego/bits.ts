/**
 * Low-level bit <-> byte conversion.
 * Every byte becomes 8 entries of 0/1, most significant bit first.
 */

export function bytesToBits(bytes: Uint8Array): Uint8Array {
  const bits = new Uint8Array(bytes.length * 8);
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];
    for (let b = 0; b < 8; b++) {
      bits[i * 8 + b] = (byte >> (7 - b)) & 1;
    }
  }
  return bits;
}

export function bitsToBytes(bits: Uint8Array): Uint8Array {
  const byteLength = Math.floor(bits.length / 8);
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    let value = 0;
    for (let b = 0; b < 8; b++) {
      value = (value << 1) | bits[i * 8 + b];
    }
    bytes[i] = value;
  }
  return bytes;
}

export function uint32ToBytes(value: number): Uint8Array {
  const out = new Uint8Array(4);
  out[0] = (value >>> 24) & 0xff;
  out[1] = (value >>> 16) & 0xff;
  out[2] = (value >>> 8) & 0xff;
  out[3] = value & 0xff;
  return out;
}

export function bytesToUint32(bytes: Uint8Array, offset = 0): number {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

export function concatBytes(...chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}
