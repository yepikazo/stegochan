export type StegoErrorCode =
  | "CAPACITY_EXCEEDED"
  | "NO_DATA_FOUND"
  | "WRONG_PASSWORD"
  | "CORRUPTED"
  | "UNSUPPORTED_IMAGE";

export class StegoError extends Error {
  code: StegoErrorCode;
  constructor(code: StegoErrorCode, message: string) {
    super(message);
    this.name = "StegoError";
    this.code = code;
  }
}

export type BitsPerChannel = 1 | 2 | 3;

export interface HideOptions {
  password: string;
  stegoKey?: string;
  bitsPerChannel?: BitsPerChannel;
}

export interface RevealOptions {
  password: string;
  stegoKey?: string;
  bitsPerChannel?: BitsPerChannel;
}
