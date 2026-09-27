/**
 * Exercises the capacity model: raw capacity is the number of RGB bits that fit,
 * and the usable payload excludes the fixed packet overhead from the header.
 */

import { describe, expect, it } from "vitest";

import { getRawCapacityBytes, getUsableCapacityBytes } from "../capacity";
import { getHeaderLengthForVersion, LEGACY_VERSION } from "../header";

describe("capacity calculations", () => {
  it("returns the correct raw and usable capacity for common dimensions", () => {
    expect(getRawCapacityBytes(10, 10)).toBe(37);
    expect(getUsableCapacityBytes(10, 10)).toBe(0);

    expect(getRawCapacityBytes(32, 32)).toBe(384);
    expect(getUsableCapacityBytes(32, 32)).toBe(384 - getHeaderLengthForVersion(LEGACY_VERSION));

    expect(getRawCapacityBytes(1, 1)).toBe(0);
    expect(getUsableCapacityBytes(1, 1)).toBe(0);
  });

  it("keeps the usable capacity consistent with the raw capacity minus header overhead", () => {
    const width = 90;
    const height = 90;
    const raw = getRawCapacityBytes(width, height);
    const usable = getUsableCapacityBytes(width, height);

    expect(usable).toBe(raw - getHeaderLengthForVersion(LEGACY_VERSION));
    expect(usable).toBeGreaterThanOrEqual(0);
  });
});
