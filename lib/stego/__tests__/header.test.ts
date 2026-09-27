/**
 * Validates packet serialization and parsing: the fixed header must round-trip with the same
 * salt, IV, and cipher length, and invalid data should be rejected with a StegoError.
 */

import { describe, expect, it } from "vitest";

import { buildPacket, MAGIC, parseFixedHeader } from "../header";
import { StegoError } from "../types";

describe("header serialization", () => {
  it("buildPacket and parseFixedHeader round-trip the same metadata", () => {
    const packet = {
      salt: Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
      iv: Uint8Array.from([21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]),
      ciphertext: Uint8Array.from([0xaa, 0xbb, 0xcc, 0xdd, 0xee]),
    };

    const serialized = buildPacket(packet);
    const parsed = parseFixedHeader(serialized);

    expect(parsed.salt).toEqual(packet.salt);
    expect(parsed.iv).toEqual(packet.iv);
    expect(parsed.cipherLength).toBe(packet.ciphertext.length);
  });

  it("throws a NO_DATA_FOUND error for invalid magic or short payloads", () => {
    const short = new Uint8Array([0x00, 0x01, 0x02]);
    expect(() => parseFixedHeader(short)).toThrowError(StegoError);

    const badMagic = Uint8Array.from([...MAGIC].map((b) => b ^ 0xff));
    expect(() => parseFixedHeader(badMagic)).toThrowError(StegoError);
  });
});
