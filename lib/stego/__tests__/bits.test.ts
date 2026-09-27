/**
 * Validates low-level bit packing helpers: the conversion routines must be lossless,
 * and 32-bit integer serialization must round-trip exactly for normal and edge values.
 */

import { describe, expect, it } from "vitest";

import {
  bitsToBytes,
  bytesToBits,
  bytesToUint32,
  uint32ToBytes,
} from "../bits";

describe("bits helpers", () => {
  it("round-trips bytes through bits without losing information", () => {
    const samples = [
      new Uint8Array([]),
      new Uint8Array([0]),
      new Uint8Array([1, 2, 3, 4]),
      new Uint8Array([0x00, 0x7f, 0x80, 0xff]),
      new Uint8Array([0x12, 0x34, 0x56, 0x78, 0xab, 0xcd, 0xef, 0xff]),
    ];

    for (const sample of samples) {
      expect(bitsToBytes(bytesToBits(sample))).toEqual(sample);
    }
  });

  it("round-trips uint32 values through byte serialization", () => {
    const values = [0, 1, 0x7fffffff, 0x80000000, 0x12345678, 0xffffffff];

    for (const value of values) {
      const bytes = uint32ToBytes(value);
      expect(bytesToUint32(bytes)).toBe(value);
      expect(bytes).toHaveLength(4);
    }
  });
});
