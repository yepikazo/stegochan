export interface BatchImage {
  id: string;
  name: string;
  size: number;
  width: number;
  height: number;
  imageData: ImageData;
  previewUrl: string;
}

export interface BatchMessage {
  id: string;
  label: string;
  text: string;
}

export type BatchStatus = "OK" | "SKIP" | "FAIL";

export interface BatchResult {
  key: string;
  imageName: string;
  dimensions: string;
  mode: number;
  msgLabel: string;
  msgBytes: number;
  capacity: number;
  mse: number | null;
  psnr: number | null;
  pass30: boolean | null;
  histDist: number | null;
  timeMs: number | null;
  status: BatchStatus;
  note: string;
}

export interface BatchCombo {
  img: BatchImage;
  msg: BatchMessage;
  mode: number;
  bytes: number;
  capacity: number;
  ok: boolean;
}

export interface BatchSummary {
  mode: number;
  count: number;
  avgPsnr: number | null;
}
