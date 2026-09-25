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

export interface HideOptions {
  password: string;
}

export interface RevealOptions {
  password: string;
}
