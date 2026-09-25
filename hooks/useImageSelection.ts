"use client";

import { useCallback, useEffect, useState } from "react";

import { loadImageFromFile } from "@/lib/image";

export function useImageSelection() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearPreview = useCallback(() => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }, []);

  const reset = useCallback(() => {
    clearPreview();
    setImageData(null);
    setError(null);
  }, [clearPreview]);

  const loadFile = useCallback(async (file: File) => {
    setError(null);

    try {
      const loaded = await loadImageFromFile(file);
      setImageData(loaded.imageData);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return loaded.previewUrl;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat gambar.");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return {
    imageData,
    previewUrl,
    error,
    setError,
    loadFile,
    reset,
  };
}
