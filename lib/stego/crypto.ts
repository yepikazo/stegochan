import { IV_LENGTH, SALT_LENGTH } from "./header";
import { StegoError } from "./types";

const PBKDF2_ITERATIONS = 600_000;

function assertSecureContext() {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new StegoError(
      "CORRUPTED",
      "Web Crypto API tidak tersedia. Jalankan aplikasi lewat HTTPS atau localhost."
    );
  }
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  assertSecureContext();
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedPayload {
  salt: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
}

export async function encryptMessage(
  password: string,
  plaintext: Uint8Array
): Promise<EncryptedPayload> {
  assertSecureContext();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    plaintext as BufferSource
  );
  return { salt, iv, ciphertext: new Uint8Array(encrypted) };
}

export async function decryptMessage(
  password: string,
  salt: Uint8Array,
  iv: Uint8Array,
  ciphertext: Uint8Array
): Promise<Uint8Array> {
  assertSecureContext();
  const key = await deriveKey(password, salt);
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      ciphertext as BufferSource
    );
    return new Uint8Array(decrypted);
  } catch {
    // AES-GCM authentication failing is by far the most common cause here,
    // which almost always means the password was wrong (or data is corrupted).
    throw new StegoError("WRONG_PASSWORD", "Password salah atau data telah rusak.");
  }
}
