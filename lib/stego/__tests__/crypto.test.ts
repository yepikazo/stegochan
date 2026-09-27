/**
 * Validates the password-based encryption flow: the same password must decrypt to the original
 * plaintext, while a wrong password must fail with the expected StegoError code.
 */

import { webcrypto } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";

import { decryptMessage, encryptMessage } from "../crypto";
import { StegoError } from "../types";

beforeAll(() => {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
  });
});

describe("crypto helpers", () => {
  it("encryptMessage then decryptMessage with the same password returns the original plaintext", async () => {
    const plaintext = new TextEncoder().encode("secret message");
    const { salt, iv, ciphertext } = await encryptMessage("hunter2", plaintext);
    const result = await decryptMessage("hunter2", salt, iv, ciphertext);

    expect(result).toEqual(plaintext);
  });

  it("decryptMessage with the wrong password throws WRONG_PASSWORD", async () => {
    const plaintext = new TextEncoder().encode("top secret");
    const { salt, iv, ciphertext } = await encryptMessage("correct-password", plaintext);

    await expect(decryptMessage("wrong-password", salt, iv, ciphertext)).rejects.toMatchObject({
      code: "WRONG_PASSWORD",
    });
    await expect(decryptMessage("wrong-password", salt, iv, ciphertext)).rejects.toBeInstanceOf(StegoError);
  });
});
