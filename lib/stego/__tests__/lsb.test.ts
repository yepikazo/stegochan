/**
 * Validates that the LSB write/read order is deterministic for a given seed and that a
 * different seed produces a different channel order, which should fail extraction.
 */

import { describe, expect, it } from "vitest";

import { embedBytes, extractBytes } from "../lsb";

describe("LSB channel embedding", () => {
  it("embedBytes followed by extractBytes with the same seed returns the original payload", () => {
    const payload = new Uint8Array([0x00, 0x12, 0x34, 0x56, 0xff, 0xab, 0xcd, 0xef]);
    const pixels = new Uint8ClampedArray(64 * 4);

    const embedded = embedBytes(new Uint8ClampedArray(pixels), payload, { seed: "demo-seed" });
    const restored = extractBytes(embedded, payload.length, { seed: "demo-seed" });

    expect(restored).toEqual(payload);
  });

  it("different seed changes the channel order and extraction fails with the wrong order", () => {
    const payload = Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const pixels = new Uint8ClampedArray(128 * 4);

    const embedded = embedBytes(new Uint8ClampedArray(pixels), payload, { seed: "first" });
    const wrongOrder = extractBytes(embedded, payload.length, { seed: "second" });

    expect(wrongOrder).not.toEqual(payload);
  });
});
