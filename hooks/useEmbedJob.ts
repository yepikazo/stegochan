"use client";

import { useMemo, useState } from "react";
import { getPasswordStrength } from "@/lib/embed/password-strength";
import { downloadBlob, runEmbedJob } from "@/lib/embed/run-embed";
import { validateImageFile } from "@/lib/image-validation";
import { getUsableCapacityBytes } from "@/lib/stego";
import type { BitsPerChannel } from "@/lib/stego/types";
import { useImageSelection } from "./useImageSelection";

export interface EmbedMetrics {
  mse: number;
  psnr: number;
}

export interface EmbedTradeoff {
  capacity1bit: number;
  capacitySelected: number;
  psnr1bit: number | null;
  psnrSelected: number;
}

export interface EmbedLsbUrls {
  cover: string;
  stego: string;
}

export interface EmbedHistograms {
  cover: { r: number[]; g: number[]; b: number[] };
  stego: { r: number[]; g: number[]; b: number[] };
}

/** Seluruh state + alur halaman Embed. Page hanya komposisi JSX. */
export function useEmbedJob() {
  const { imageData, previewUrl, error, setError, loadFile, reset } = useImageSelection();

  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lsbMode, setLsbMode] = useState<BitsPerChannel>(1);
  const [loading, setLoading] = useState(false);

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [metrics, setMetrics] = useState<EmbedMetrics | null>(null);
  const [lsbUrls, setLsbUrls] = useState<EmbedLsbUrls | null>(null);
  const [histograms, setHistograms] = useState<EmbedHistograms | null>(null);
  const [tradeoff, setTradeoff] = useState<EmbedTradeoff | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function clearResult() {
    setResultUrl(null);
    setResultBlob(null);
    setMetrics(null);
    setTradeoff(null);
    setLsbUrls(null);
    setHistograms(null);
  }

  const capacity = useMemo(
    () => (imageData ? getUsableCapacityBytes(imageData.width, imageData.height, lsbMode) : 0),
    [imageData, lsbMode]
  );

  const messageBytes = useMemo(() => new TextEncoder().encode(message).length, [message]);
  const overLimit = imageData ? messageBytes > capacity : false;
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  async function handleFile(file: File) {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSelectedFile(file);
    clearResult();
    await loadFile(file);
  }

  function handleResetImage() {
    reset();
    setSelectedFile(null);
    clearResult();
  }

  function handleMessageChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget;
    setMessage(textarea.value);
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageData) return setError("Pilih gambar terlebih dahulu.");
    if (!message) return setError("Pesan tidak boleh kosong.");
    if (!password) return setError("Password / stego-key tidak boleh kosong.");

    setLoading(true);
    setError(null);
    clearResult();

    try {
      const result = await runEmbedJob({ imageData, message, password, lsbMode, messageBytes });
      setMetrics({ mse: result.mse, psnr: result.psnr });
      setTradeoff({
        capacity1bit: result.capacity1bit,
        capacitySelected: result.capacitySelected,
        psnr1bit: result.psnr1bit,
        psnrSelected: result.psnrSelected,
      });
      setResultUrl(result.resultUrl);
      setLsbUrls({ cover: result.lsbCoverUrl, stego: result.lsbStegoUrl });
      setHistograms(result.histograms);
      setResultBlob(result.blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyembunyikan pesan.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (resultBlob) downloadBlob(resultBlob, "stegochan-output.png");
  }

  return {
    imageData,
    previewUrl,
    error,
    message,
    password,
    showPassword,
    lsbMode,
    loading,
    resultUrl,
    metrics,
    lsbUrls,
    histograms,
    tradeoff,
    selectedFile,
    capacity,
    messageBytes,
    overLimit,
    passwordStrength,
    setPassword,
    setShowPassword,
    setLsbMode,
    handleFile,
    handleMessageChange,
    handleResetImage,
    handleSubmit,
    handleDownload,
  };
}
