"use client";

import { useMemo, useState } from "react";
import { validateImageFile } from "@/lib/image-validation";
import { imageDataToPreviewUrl } from "@/lib/image";
import { extractLsbPlane, revealMessage } from "@/lib/stego";
import { useImageSelection } from "./useImageSelection";

/** Seluruh state + alur halaman Extract. Page hanya komposisi JSX. */
export function useExtractJob() {
  const { imageData, previewUrl, error, setError, loadFile, reset } = useImageSelection();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const lsbPreviewUrl = useMemo(() => {
    if (!imageData) return null;
    const plane = extractLsbPlane(imageData.data, imageData.width, imageData.height);
    return imageDataToPreviewUrl(plane);
  }, [imageData]);

  async function handleFile(file: File) {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setMessage(null);
    setSelectedFile(file);
    await loadFile(file);
  }

  function handleResetImage() {
    reset();
    setSelectedFile(null);
    setMessage(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageData) return setError("Pilih gambar stego terlebih dahulu.");
    if (!password) return setError("Masukkan stego-key / password.");

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const revealed = await revealMessage(imageData, { password, stegoKey: password });
      setMessage(revealed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengungkap pesan.");
    } finally {
      setLoading(false);
    }
  }

  return {
    imageData,
    previewUrl,
    error,
    password,
    showPassword,
    loading,
    message,
    selectedFile,
    lsbPreviewUrl,
    setPassword,
    setShowPassword,
    handleFile,
    handleResetImage,
    handleSubmit,
  };
}
