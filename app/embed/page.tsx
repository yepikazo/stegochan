"use client";

import { useMemo, useState } from "react";

import Alert from "@/components/Alert";
import Dropzone from "@/components/Dropzone";
import HistogramChart from "@/components/HistogramChart";
import { useImageSelection } from "@/hooks/useImageSelection";
import { imageDataToPngBlob, imageDataToPreviewUrl } from "@/lib/image";
import {
  calculateMse,
  calculatePsnr,
  computeHistogram,
  extractLsbPlane,
  formatBytes,
  getUsableCapacityBytes,
  hideMessage,
} from "@/lib/stego";
import type { BitsPerChannel } from "@/lib/stego/types";

export default function EmbedPage() {
  const { imageData, previewUrl, error, setError, loadFile } = useImageSelection();
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lsbMode, setLsbMode] = useState<BitsPerChannel>(1);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [metrics, setMetrics] = useState<{ mse: number; psnr: number } | null>(null);
  const [lsbUrls, setLsbUrls] = useState<{ cover: string; stego: string } | null>(null);
  const [histograms, setHistograms] = useState<{ cover: { r: number[]; g: number[]; b: number[] }; stego: { r: number[]; g: number[]; b: number[] } } | null>(null);
  const [tradeoff, setTradeoff] = useState<{
    capacity1bit: number;
    capacitySelected: number;
    psnr1bit: number;
    psnrSelected: number;
  } | null>(null);

  const capacity = useMemo(
    () => (imageData ? getUsableCapacityBytes(imageData.width, imageData.height, lsbMode) : 0),
    [imageData, lsbMode]
  );
  const messageBytes = useMemo(() => new TextEncoder().encode(message).length, [message]);
  const overLimit = imageData ? messageBytes > capacity : false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageData) return setError("Pilih gambar terlebih dahulu.");
    if (!message) return setError("Pesan tidak boleh kosong.");
    if (!password) return setError("Password / stego-key tidak boleh kosong.");

    setLoading(true);
    setError(null);
    setResultUrl(null);
    setMetrics(null);
    setLsbUrls(null);
    setHistograms(null);

    try {
      const stego = await hideMessage(imageData, message, {
        password,
        stegoKey: password,
        bitsPerChannel: lsbMode,
      });
      const baseline = await hideMessage(imageData, message, {
        password,
        stegoKey: password,
        bitsPerChannel: 1,
      });
      const mse = calculateMse(imageData, stego);
      const psnr = calculatePsnr(imageData, stego);
      const baselinePsnr = calculatePsnr(imageData, baseline);
      const coverPlane = extractLsbPlane(imageData.data, imageData.width, imageData.height);
      const stegoPlane = extractLsbPlane(stego.data, stego.width, stego.height);
      setMetrics({ mse, psnr });
      setTradeoff({
        capacity1bit: getUsableCapacityBytes(imageData.width, imageData.height, 1),
        capacitySelected: getUsableCapacityBytes(imageData.width, imageData.height, lsbMode),
        psnr1bit: baselinePsnr,
        psnrSelected: psnr,
      });
      setResultUrl(imageDataToPreviewUrl(stego));
      setLsbUrls({
        cover: imageDataToPreviewUrl(coverPlane),
        stego: imageDataToPreviewUrl(stegoPlane),
      });
      setHistograms({
        cover: computeHistogram(imageData),
        stego: computeHistogram(stego),
      });
      setResultBlob(await imageDataToPngBlob(stego));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyembunyikan pesan.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "stegochan-output.png";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-20 pt-12 md:px-8">
      <p className="font-mono text-[0.8rem] uppercase tracking-[0.12em] text-[#e8a33d]">Sembunyikan</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.03em] text-white">
        Embed pesan pada cover image
      </h1>
      <p className="mt-3 mb-8 text-[0.98rem] leading-7 text-[#93969f]">
        Metode LSB digunakan untuk menyisipkan payload pada citra cover, lalu pesan dienkripsi dengan
        password / stego-key sebelum disisipkan.
      </p>

      {error && <Alert>{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-[0.85rem] text-[#93969f]">Cover image</label>
          <Dropzone previewUrl={previewUrl} onFile={loadFile} />
          {imageData && (
            <p className="mt-2 text-[0.8rem] text-[#93969f]">
              {imageData.width}&times;{imageData.height}px &middot; kapasitas {formatBytes(capacity)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[0.85rem] text-[#93969f]">Mode LSB</label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((mode) => (
              <label
                key={mode}
                className={`flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm transition ${
                  lsbMode === mode
                    ? "border-[#e8a33d] bg-[#2e2415] text-[#f4c46d]"
                    : "border-[#33363f] bg-[#1d1f26] text-[#ecedf1]"
                }`}
              >
                <input
                  type="radio"
                  name="lsbMode"
                  value={mode}
                  checked={lsbMode === mode}
                  onChange={() => setLsbMode(mode as BitsPerChannel)}
                  className="sr-only"
                />
                {mode}-bit
              </label>
            ))}
          </div>
          <p className="mt-2 text-[0.75rem] leading-5 text-[#93969f]">
            1-bit paling aman secara visual, 2-bit memberi kapasitas 2×, 3-bit memberi kapasitas 3×
            namun kualitas visual lebih menurun.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-[0.85rem] text-[#93969f]">Payload / pesan rahasia</label>
          <textarea
            className="min-h-[110px] w-full resize-y rounded-md border border-[#33363f] bg-[#1d1f26] px-3 py-3 font-mono text-[0.88rem] text-[#ecedf1] placeholder:text-[#93969f] focus:border-[#e8a33d] focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis pesan yang ingin disembunyikan..."
          />
          {imageData && (
            <p className={`mt-2 text-[0.8rem] ${overLimit ? "text-[#e5586b]" : "text-[#93969f]"}`}>
              {formatBytes(messageBytes)} / {formatBytes(capacity)}
              {overLimit && " — melebihi kapasitas gambar ini"}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[0.85rem] text-[#93969f]">Password / stego-key</label>
          <div className="relative">
            <input
              className="w-full rounded-md border border-[#33363f] bg-[#1d1f26] px-3 py-3 pr-12 text-[0.95rem] text-[#ecedf1] placeholder:text-[#93969f] focus:border-[#e8a33d] focus:outline-none"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password untuk enkripsi dan urutan penyisipan"
              autoComplete="new-password"
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
          disabled={loading || overLimit}
        >
          {loading ? "Memproses..." : "Embed pesan"}
        </button>
      </form>

      {resultUrl && (
        <div className="mt-8 rounded-xl border border-[#33363f] bg-[#1d1f26] p-7">
          <Alert variant="success">Payload berhasil disisipkan ke dalam cover image.</Alert>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-[0.85rem] text-[#93969f]">Cover image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl ?? resultUrl} alt="Cover image" className="max-h-[220px] w-full rounded-md border border-[#33363f] object-contain" />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[0.85rem] text-[#93969f]">Stego image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt="Stego image" className="max-h-[220px] w-full rounded-md border border-[#33363f] object-contain" />
            </div>
          </div>

          {metrics && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 rounded-md border border-[#33363f] bg-[#262933] p-4">
                <span className="text-[0.78rem] uppercase tracking-[0.08em] text-[#93969f]">MSE</span>
                <strong className="text-[1.1rem] text-white">{metrics.mse.toFixed(4)}</strong>
              </div>
              <div className="flex flex-col gap-2 rounded-md border border-[#33363f] bg-[#262933] p-4">
                <span className="text-[0.78rem] uppercase tracking-[0.08em] text-[#93969f]">PSNR</span>
                <strong className="text-[1.1rem] text-white">{metrics.psnr.toFixed(2)} dB</strong>
              </div>
            </div>
          )}

          {tradeoff && (
            <div className="mt-8 border-t border-[#33363f] pt-6">
              <h2 className="mb-2 text-[1.05rem] font-semibold text-white">Analisis Trade-off</h2>
              <p className="mb-4 text-sm leading-6 text-[#93969f]">
                Mode yang lebih tinggi meningkatkan kapasitas payload, tetapi menurunkan kualitas visual,
                yang terlihat dari penurunan PSNR dibanding mode 1-bit.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-[#33363f] bg-[#262933] p-4">
                  <p className="text-[0.75rem] uppercase tracking-[0.08em] text-[#93969f]">Kapasitas</p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {formatBytes(tradeoff.capacitySelected)}
                  </p>
                  <p className="mt-1 text-sm text-[#93969f]">
                    1-bit: {formatBytes(tradeoff.capacity1bit)}
                  </p>
                </div>
                <div className="rounded-md border border-[#33363f] bg-[#262933] p-4">
                  <p className="text-[0.75rem] uppercase tracking-[0.08em] text-[#93969f]">PSNR</p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {tradeoff.psnrSelected.toFixed(2)} dB
                  </p>
                  <p className="mt-1 text-sm text-[#93969f]">
                    1-bit: {tradeoff.psnr1bit.toFixed(2)} dB
                  </p>
                </div>
              </div>
            </div>
          )}

          {lsbUrls && (
            <div className="mt-8 border-t border-[#33363f] pt-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-[1.05rem] font-semibold text-white">Steganalisis Visual</h2>
              </div>
              <p className="mb-4 text-sm leading-6 text-[#93969f]">
                Bidang LSB cover biasanya masih menampilkan pola/tekstur yang lebih halus, sedangkan
                bidang LSB stego cenderung terlihat lebih acak karena bit data tersembunyi telah
                mengubah pola bit paling tidak signifikan.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <p className="text-[0.85rem] text-[#93969f]">LSB cover</p>
                  <img
                    src={lsbUrls.cover}
                    alt="Bidang LSB cover"
                    className="max-h-[220px] w-full rounded-md border border-[#33363f] bg-[#111318] object-contain"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[0.85rem] text-[#93969f]">LSB stego</p>
                  <img
                    src={lsbUrls.stego}
                    alt="Bidang LSB stego"
                    className="max-h-[220px] w-full rounded-md border border-[#33363f] bg-[#111318] object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          {histograms && (
            <div className="mt-8 border-t border-[#33363f] pt-6">
              <h2 className="mb-2 text-[1.05rem] font-semibold text-white">Perbandingan Histogram</h2>
              <p className="mb-5 text-sm leading-6 text-[#93969f]">
                Histogram cover dan stego yang nyaris identik menandakan penyisipan LSB tidak
                meninggalkan jejak statistik yang mencolok.
              </p>

              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-[0.85rem] text-[#93969f]">Cover image</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <HistogramChart title="R" data={histograms.cover.r} color="red" />
                    <HistogramChart title="G" data={histograms.cover.g} color="green" />
                    <HistogramChart title="B" data={histograms.cover.b} color="blue" />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[0.85rem] text-[#93969f]">Stego image</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <HistogramChart title="R" data={histograms.stego.r} color="red" />
                    <HistogramChart title="G" data={histograms.stego.g} color="green" />
                    <HistogramChart title="B" data={histograms.stego.b} color="blue" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            className="mt-5 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-[#e8a33d] px-5 py-3 text-sm font-semibold text-[#1a1408] transition hover:bg-[#f0af52] active:translate-y-px"
            onClick={handleDownload}
          >
            Unduh PNG
          </button>
          <p className="mt-3 text-[0.8rem] text-[#93969f]">
            File output tetap dalam format PNG untuk menjaga integritas bit LSB. Jika disimpan ulang ke
            JPEG, payload dapat rusak atau tidak bisa diekstraksi.
          </p>
        </div>
      )}
    </main>
  );
}
