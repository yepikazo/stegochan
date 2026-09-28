"use client";

import { useMemo, useRef, useState } from "react";
import HistogramChart from "@/components/HistogramChart";
import { useImageSelection } from "@/hooks/useImageSelection";
import {
  imageDataToPngBlob,
  imageDataToPreviewUrl,
} from "@/lib/image";
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

function ImageIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m3 17 5-5 4 4 2.5-2.5L21 17.5" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  if (hidden) {
    return (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.2 0 9 4 10 8a11.8 11.8 0 0 1-3.1 5.1" />
        <path d="M6.2 6.2C4.5 7.4 3.4 9.2 2 12c1 4 4.8 8 10 8 1.2 0 2.3-.2 3.3-.6" />
      </svg>
    );
  }

  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 4v11" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EmbedPage() {
  const {
    imageData,
    previewUrl,
    error,
    setError,
    loadFile,
    reset,
  } = useImageSelection();

  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lsbMode, setLsbMode] = useState<BitsPerChannel>(1);
  const [loading, setLoading] = useState(false);

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const [metrics, setMetrics] = useState<{
    mse: number;
    psnr: number;
  } | null>(null);

  const [lsbUrls, setLsbUrls] = useState<{
    cover: string;
    stego: string;
  } | null>(null);

  const [histograms, setHistograms] = useState<{
    cover: { r: number[]; g: number[]; b: number[] };
    stego: { r: number[]; g: number[]; b: number[] };
  } | null>(null);

  const [tradeoff, setTradeoff] = useState<{
    capacity1bit: number;
    capacitySelected: number;
    psnr1bit: number | null;
    psnrSelected: number;
  } | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const capacity = useMemo(
    () =>
      imageData
        ? getUsableCapacityBytes(
          imageData.width,
          imageData.height,
          lsbMode
        )
        : 0,
    [imageData, lsbMode]
  );

  const messageBytes = useMemo(
    () => new TextEncoder().encode(message).length,
    [message]
  );

  const overLimit = imageData ? messageBytes > capacity : false;

  const passwordStrength = useMemo(() => {
    if (!password) {
      return {
        label: "Belum diisi",
        width: "w-0",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        label: "Lemah",
        width: "w-[25%]",
      };
    }

    if (score === 2) {
      return {
        label: "Sedang",
        width: "w-1/2",
      };
    }

    if (score === 3) {
      return {
        label: "Kuat",
        width: "w-3/4",
      };
    }

    return {
      label: "Sangat kuat",
      width: "w-full",
    };
  }, [password]);

  async function handleFile(file: File) {
    const validType =
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.name.toLowerCase().endsWith(".png") ||
      file.name.toLowerCase().endsWith(".jpg") ||
      file.name.toLowerCase().endsWith(".jpeg");

    if (!validType) {
      setError("Format gambar harus PNG atau JPG.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 20 MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);

    setResultUrl(null);
    setResultBlob(null);
    setMetrics(null);
    setTradeoff(null);
    setLsbUrls(null);
    setHistograms(null);

    await loadFile(file);
  }

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (file) {
      void handleFile(file);
    }

    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      void handleFile(file);
    }
  }

  function handleResetImage() {
    reset();
    setSelectedFile(null);
    setResultUrl(null);
    setResultBlob(null);
    setMetrics(null);
    setTradeoff(null);
    setLsbUrls(null);
    setHistograms(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!imageData) {
      return setError("Pilih gambar terlebih dahulu.");
    }

    if (!message) {
      return setError("Pesan tidak boleh kosong.");
    }

    if (!password) {
      return setError("Password / stego-key tidak boleh kosong.");
    }

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

      const mse = calculateMse(imageData, stego);
      const psnr = calculatePsnr(imageData, stego);

      const capacity1bit = getUsableCapacityBytes(
        imageData.width,
        imageData.height,
        1
      );

      let baselinePsnr: number | null = null;

      if (lsbMode === 1) {
        baselinePsnr = psnr;
      } else if (messageBytes <= capacity1bit) {
        const baseline = await hideMessage(imageData, message, {
          password,
          stegoKey: password,
          bitsPerChannel: 1,
        });

        baselinePsnr = calculatePsnr(imageData, baseline);
      }

      const coverPlane = extractLsbPlane(
        imageData.data,
        imageData.width,
        imageData.height
      );

      const stegoPlane = extractLsbPlane(
        stego.data,
        stego.width,
        stego.height
      );

      setMetrics({ mse, psnr });

      setTradeoff({
        capacity1bit,
        capacitySelected: getUsableCapacityBytes(
          imageData.width,
          imageData.height,
          lsbMode
        ),
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
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyembunyikan pesan."
      );
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
    <main className="min-h-screen bg-[#ebe4d1] text-[#17181b]">
      <div className="mx-auto max-w-[920px] px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* HEADER */}
        <header className="mb-11">
          <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[#c28722]">
            Sembunyikan
          </p>

          <h1 className="mt-2 font-[var(--font-space-grotesk)] text-[2rem] font-semibold tracking-[-0.045em] text-[#17181b] md:text-[2.35rem]">
            Embed pesan pada cover image
          </h1>

          <p className="mt-4 max-w-[760px] text-[0.96rem] leading-7 text-[#69665d]">
            Metode LSB digunakan untuk menyisipkan payload pada citra
            cover, lalu pesan dienkripsi dengan password / stego-key
            sebelum disisipkan.
          </p>
        </header>

        {/* ERROR */}
        {error && (
          <div className="mb-7 rounded-xl border border-[#d98d8d] bg-[#f8e3df] px-4 py-3 text-sm text-[#873f3f]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* COVER IMAGE */}
          <section className="mb-10">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[#6d695f]">
                Gambar penyamaran
              </label>

              {imageData && (
                <span className="font-mono text-[0.68rem] text-[#918c80]">
                  Kapasitas {formatBytes(capacity)}
                </span>
              )}
            </div>

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={handleDrop}
                className={`group flex min-h-[245px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition ${dragActive
                  ? "border-[#c28722] bg-[#e4d9bd]"
                  : "border-[#bcb4a2] bg-[#eee8d9] hover:border-[#968d79] hover:bg-[#e8e0ce]"
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleInputChange}
                  className="hidden"
                />

                <div className="mb-4 text-[#8b8679] transition group-hover:text-[#c28722]">
                  {dragActive ? <UploadIcon /> : <ImageIcon />}
                </div>

                <p className="text-[0.95rem] font-medium text-[#302f2c]">
                  {dragActive
                    ? "Lepaskan gambar di sini"
                    : "Pilih atau seret gambar ke sini"}
                </p>

                <p className="mt-2 font-mono text-[0.67rem] uppercase tracking-[0.08em] text-[#999285]">
                  PNG & JPG · Maks. 20 MB
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#c7bfad] bg-[#f0eadc] p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                  <div className="flex h-[120px] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#d2c9b7] bg-[#e2dccd] sm:w-[180px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview gambar penyamaran"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[0.94rem] font-semibold text-[#252421]">
                          {selectedFile?.name ?? "Cover image"}
                        </p>

                        {imageData && (
                          <p className="mt-1 font-mono text-[0.7rem] text-[#817b6e]">
                            {imageData.width} × {imageData.height}px
                            {" · "}
                            {selectedFile
                              ? formatFileSize(selectedFile.size)
                              : formatBytes(capacity)}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleResetImage}
                        className="shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-[#817b6e] transition hover:bg-[#e1d9c8] hover:text-[#292824]"
                        aria-label="Hapus gambar"
                      >
                        ×
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-5 text-[0.78rem] font-semibold text-[#a66e15] underline decoration-[#c99a48] underline-offset-4 hover:text-[#7f5410]"
                    >
                      Ganti gambar
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* MESSAGE */}
          <section className="mb-10">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[#6d695f]">
                Pesan rahasia
              </label>

              {imageData && (
                <span
                  className={`font-mono text-[0.68rem] ${overLimit ? "text-[#b44d4d]" : "text-[#918c80]"
                    }`}
                >
                  {formatBytes(messageBytes)} / {formatBytes(capacity)}
                </span>
              )}
            </div>

            {/* LSB TABS */}
            <div className="mb-3 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((mode) => {
                const active = lsbMode === mode;

                return (
                  <label
                    key={mode}
                    className={`flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition ${active
                      ? "border-[#c28722] bg-[#e4c47e] text-[#30230e]"
                      : "border-[#c7bfad] bg-[#f0eadc] text-[#656056] hover:bg-[#e8e0ce]"
                      }`}
                  >
                    <input
                      type="radio"
                      name="lsbMode"
                      value={mode}
                      checked={active}
                      onChange={() =>
                        setLsbMode(mode as BitsPerChannel)
                      }
                      className="sr-only"
                    />

                    {mode}-bit
                  </label>
                );
              })}
            </div>

            <p className="mb-4 text-[0.77rem] leading-6 text-[#777267]">
              1-bit paling aman secara visual, 2-bit memberi kapasitas
              2×, 3-bit memberi kapasitas 3× namun kualitas visual lebih
              menurun.
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan yang ingin disembunyikan..."
              className={`min-h-[150px] w-full resize-y rounded-2xl border bg-[#f0eadc] px-4 py-4 text-[0.9rem] leading-6 text-[#272622] outline-none transition placeholder:text-[#a29b8d] ${overLimit
                ? "border-[#c66a6a] focus:border-[#b54f4f]"
                : "border-[#c7bfad] focus:border-[#b78326]"
                }`}
            />

            {overLimit && (
              <p className="mt-2 text-[0.75rem] text-[#b44d4d]">
                Pesan melebihi kapasitas gambar. Gunakan pesan yang
                lebih pendek atau mode LSB yang lebih tinggi.
              </p>
            )}
          </section>

          {/* PASSWORD */}
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[#6d695f]">
                Password / stego-key
              </label>

              {password && (
                <span className="font-mono text-[0.68rem] text-[#8c8679]">
                  {passwordStrength.label}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password untuk enkripsi dan urutan penyisipan"
                autoComplete="new-password"
                className="h-[54px] w-full rounded-2xl border border-[#c7bfad] bg-[#f0eadc] px-4 pr-14 text-[0.9rem] text-[#272622] outline-none transition placeholder:text-[#a29b8d] focus:border-[#b78326]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-[#7d776b] hover:bg-[#e3dccd] hover:text-[#37342e]"
              >
                <EyeIcon hidden={!showPassword} />
              </button>
            </div>

            {/* PASSWORD STRENGTH */}
            <div className="mt-3 flex items-center gap-3">
              <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#d2c9b7]">
                <div
                  className={`h-full rounded-full bg-[#b78326] transition-all ${passwordStrength.width}`}
                />
              </div>

              <span className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[#8d877a]">
                AES-256-GCM
              </span>
            </div>
          </section>

          {/* LOCAL SESSION */}
          <div className="mb-5 flex items-center justify-between rounded-xl border border-[#cfc6b4] bg-[#e7dfcd] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4e9b63] opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4e9b63]" />
              </span>

              <span className="font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-[#666156]">
                Sesi lokal aktif
              </span>
            </div>

            <span className="font-mono text-[0.62rem] text-[#969082]">
              TANPA LOG
            </span>
          </div>

          {/* EMBED BUTTON */}
          <button
            type="submit"
            disabled={loading || overLimit}
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#dca52e] px-5 text-[0.88rem] font-bold text-[#211805] transition hover:bg-[#e7b341] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#211805]/30 border-t-[#211805]" />
                Memproses...
              </>
            ) : (
              "Embed pesan"
            )}
          </button>
        </form>

        {/* RESULT */}
        {resultUrl && (
          <section className="mt-14 border-t border-[#c9c0ae] pt-10">

            <div className="mb-7">
              <div className="mb-2 flex items-center gap-2 text-[#3f774b]">
                <CheckIcon />

                <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.12em]">
                  Berhasil
                </span>
              </div>

              <h2 className="font-[var(--font-space-grotesk)] text-[1.55rem] font-semibold tracking-[-0.035em] text-[#252421]">
                Pesan berhasil disisipkan
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#777267]">
                Payload telah dienkripsi dan disisipkan ke dalam
                cover image menggunakan metode LSB.
              </p>
            </div>

            {/* IMAGE COMPARISON */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="mb-2 font-mono text-[0.67rem] uppercase tracking-[0.1em] text-[#7d776b]">
                  Cover image
                </p>

                <div className="flex min-h-[250px] items-center justify-center overflow-hidden rounded-2xl border border-[#c7bfad] bg-[#e1dacc] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl ?? resultUrl}
                    alt="Cover image"
                    className="max-h-[300px] w-full object-contain"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 font-mono text-[0.67rem] uppercase tracking-[0.1em] text-[#7d776b]">
                  Stego image
                </p>

                <div className="flex min-h-[250px] items-center justify-center overflow-hidden rounded-2xl border border-[#c7bfad] bg-[#e1dacc] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultUrl}
                    alt="Stego image"
                    className="max-h-[300px] w-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* METRICS */}
            {metrics && (
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#c7bfad] bg-[#f0eadc] p-4">
                  <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[#817b6e]">
                    MSE
                  </p>

                  <p className="mt-2 text-xl font-semibold text-[#292722]">
                    {metrics.mse.toFixed(4)}
                  </p>
                </div>

                <div className="rounded-xl border border-[#c7bfad] bg-[#f0eadc] p-4">
                  <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[#817b6e]">
                    PSNR
                  </p>

                  <p className="mt-2 text-xl font-semibold text-[#292722]">
                    {metrics.psnr.toFixed(2)} dB
                  </p>
                </div>
              </div>
            )}

            {/* TRADEOFF */}
            {tradeoff && (
              <div className="mt-10 border-t border-[#c9c0ae] pt-8">
                <h2 className="font-[var(--font-space-grotesk)] text-lg font-semibold tracking-[-0.02em] text-[#292722]">
                  Analisis Trade-off
                </h2>

                <p className="mt-2 max-w-[720px] text-sm leading-6 text-[#777267]">
                  Mode yang lebih tinggi meningkatkan kapasitas
                  payload, tetapi menurunkan kualitas visual yang
                  terlihat dari perubahan PSNR dibanding mode 1-bit.
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-[#c7bfad] bg-[#f0eadc] p-5">
                    <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[#817b6e]">
                      Kapasitas
                    </p>

                    <p className="mt-2 text-xl font-semibold text-[#292722]">
                      {formatBytes(tradeoff.capacitySelected)}
                    </p>

                    <p className="mt-1 text-xs text-[#888174]">
                      1-bit:{" "}
                      {tradeoff.psnr1bit !== null
                        ? tradeoff.psnr1bit.toFixed(2) + " dB"
                        : "Tidak tersedia untuk payload ini"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#c7bfad] bg-[#f0eadc] p-5">
                    <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[#817b6e]">
                      PSNR
                    </p>

                    <p className="mt-2 text-xl font-semibold text-[#292722]">
                      {tradeoff.psnrSelected.toFixed(2)} dB
                    </p>

                    <p className="mt-1 text-xs text-[#888174]">
                      1-bit:{" "}
                      {tradeoff.psnr1bit !== null
                        ? tradeoff.psnr1bit.toFixed(2) + " dB"
                        : "Tidak tersedia untuk payload ini"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* LSB ANALYSIS */}
            {lsbUrls && (
              <div className="mt-10 border-t border-[#c9c0ae] pt-8">
                <h2 className="font-[var(--font-space-grotesk)] text-lg font-semibold tracking-[-0.02em] text-[#292722]">
                  Steganalisis Visual
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#777267]">
                  Bidang LSB cover biasanya masih menampilkan pola
                  yang lebih halus, sedangkan bidang LSB stego
                  cenderung terlihat lebih acak karena perubahan bit
                  data tersembunyi.
                </p>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <p className="mb-2 font-mono text-[0.67rem] uppercase tracking-[0.1em] text-[#7d776b]">
                      LSB cover
                    </p>

                    <img
                      src={lsbUrls.cover}
                      alt="Bidang LSB cover"
                      className="w-full rounded-xl border border-[#c7bfad] bg-[#191919] object-contain"
                    />
                  </div>

                  <div>
                    <p className="mb-2 font-mono text-[0.67rem] uppercase tracking-[0.1em] text-[#7d776b]">
                      LSB stego
                    </p>

                    <img
                      src={lsbUrls.stego}
                      alt="Bidang LSB stego"
                      className="w-full rounded-xl border border-[#c7bfad] bg-[#191919] object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* HISTOGRAM */}
            {histograms && (
              <div className="mt-10 border-t border-[#c9c0ae] pt-8">
                <h2 className="font-[var(--font-space-grotesk)] text-lg font-semibold tracking-[-0.02em] text-[#292722]">
                  Perbandingan Histogram
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#777267]">
                  Histogram cover dan stego yang nyaris identik
                  menunjukkan bahwa penyisipan LSB tidak meninggalkan
                  perubahan statistik yang mencolok.
                </p>

                <div className="mt-5 space-y-6">
                  <div>
                    <p className="mb-3 font-mono text-[0.67rem] uppercase tracking-[0.1em] text-[#7d776b]">
                      Cover image
                    </p>

                    <div className="grid gap-3 md:grid-cols-3">
                      <HistogramChart
                        title="R"
                        data={histograms.cover.r}
                        color="red"
                      />

                      <HistogramChart
                        title="G"
                        data={histograms.cover.g}
                        color="green"
                      />

                      <HistogramChart
                        title="B"
                        data={histograms.cover.b}
                        color="blue"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 font-mono text-[0.67rem] uppercase tracking-[0.1em] text-[#7d776b]">
                      Stego image
                    </p>

                    <div className="grid gap-3 md:grid-cols-3">
                      <HistogramChart
                        title="R"
                        data={histograms.stego.r}
                        color="red"
                      />

                      <HistogramChart
                        title="G"
                        data={histograms.stego.g}
                        color="green"
                      />

                      <HistogramChart
                        title="B"
                        data={histograms.stego.b}
                        color="blue"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOWNLOAD */}
            <div className="mt-10">
              <button
                type="button"
                onClick={handleDownload}
                className="flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#dca52e] text-sm font-bold text-[#211805] transition hover:bg-[#e7b341]"
              >
                <DownloadIcon />
                Unduh PNG
              </button>

              <p className="mt-3 text-center text-[0.72rem] leading-5 text-[#898274]">
                File output tetap dalam format PNG untuk menjaga
                integritas bit LSB. Jika disimpan ulang ke JPEG,
                payload dapat rusak atau tidak bisa diekstraksi.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}