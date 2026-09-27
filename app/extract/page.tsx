"use client";

import { useMemo, useState } from "react";

import Alert from "@/components/Alert";
import Dropzone from "@/components/Dropzone";
import { useImageSelection } from "@/hooks/useImageSelection";
import { imageDataToPreviewUrl } from "@/lib/image";
import { extractLsbPlane, revealMessage } from "@/lib/stego";

export default function ExtractPage() {
  const { imageData, previewUrl, error, setError, loadFile } = useImageSelection();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const lsbPreviewUrl = useMemo(() => {
    if (!imageData) return null;
    const plane = extractLsbPlane(imageData.data, imageData.width, imageData.height);
    return imageDataToPreviewUrl(plane);
  }, [imageData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageData) return setError("Pilih gambar stego terlebih dahulu.");
    if (!password) return setError("Masukkan stego-key / password.");

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const revealed = await revealMessage(imageData, {
        password,
        stegoKey: password,
      });
      setMessage(revealed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengungkap pesan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-20 pt-12 md:px-8">
      <p className="font-mono text-[0.8rem] uppercase tracking-[0.12em] text-[#e8a33d]">Ungkap</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.03em] text-white">
        Baca pesan tersembunyi
      </h1>
      <p className="mt-3 mb-8 text-[0.98rem] leading-7 text-[#93969f]">
        Unggah stego image dan masukkan stego-key yang sama saat embed untuk mengekstrak payload.
        Header paket menyimpan mode LSB yang dipakai saat embed, jadi proses extract otomatis
        mengikuti mode yang benar dan akan rusak bila mode tidak sesuai dengan data asli.
      </p>

      {error && <Alert>{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-[0.85rem] text-[#93969f]">Gambar stego</label>
          <Dropzone previewUrl={previewUrl} onFile={loadFile} label="Klik atau seret gambar stego" />
        </div>

        <div>
          <label className="mb-2 block text-[0.85rem] text-[#93969f]">Password / stego-key</label>
          <div className="relative">
            <input
              className="w-full rounded-md border border-[#33363f] bg-[#1d1f26] px-3 py-3 pr-12 text-[0.95rem] text-[#ecedf1] placeholder:text-[#93969f] focus:border-[#e8a33d] focus:outline-none"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kunci yang dipakai saat embed"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded px-2 py-1 text-[0.72rem] text-[#ecedf1] transition hover:text-white"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-[#e8a33d] px-5 py-3 text-sm font-semibold text-[#1a1408] transition hover:bg-[#f0af52] disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px"
          disabled={loading}
        >
          {loading ? "Membongkar..." : "Ungkap pesan"}
        </button>
      </form>

      {lsbPreviewUrl && (
        <div className="mt-8 rounded-xl border border-[#33363f] bg-[#1d1f26] p-7">
          <p className="mb-4 text-[0.85rem] text-[#93969f]">Bidang LSB gambar terpilih</p>
          <img
            src={lsbPreviewUrl}
            alt="Bidang LSB gambar terpilih"
            className="max-h-[220px] w-full rounded-md border border-[#33363f] bg-[#111318] object-contain"
          />
        </div>
      )}

      {message !== null && (
        <div className="mt-8 rounded-xl border border-[#33363f] bg-[#1d1f26] p-7">
          <Alert variant="success">Pesan berhasil diungkap.</Alert>
          <p className="mb-3 text-[0.85rem] text-[#93969f]">Isi pesan</p>
          <p className="whitespace-pre-wrap break-words font-mono text-[0.95rem] leading-7 text-[#ecedf1]">
            {message}
          </p>
        </div>
      )}
    </main>
  );
}
