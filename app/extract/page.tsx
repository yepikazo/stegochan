"use client";

import { useMemo, useRef, useState } from "react";

import { useImageSelection } from "@/hooks/useImageSelection";
import { imageDataToPreviewUrl } from "@/lib/image";
import { extractLsbPlane, revealMessage } from "@/lib/stego";

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
      width="18"
      height="18"
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

export default function ExtractPage() {
  const {
    imageData,
    previewUrl,
    error,
    setError,
    loadFile,
    reset,
  } = useImageSelection();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const lsbPreviewUrl = useMemo(() => {
    if (!imageData) return null;

    const plane = extractLsbPlane(
      imageData.data,
      imageData.width,
      imageData.height
    );

    return imageDataToPreviewUrl(plane);
  }, [imageData]);

  async function handleFile(file: File) {
    const validType =
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
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
    setMessage(null);
    setSelectedFile(file);

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
    setMessage(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!imageData) {
      return setError("Pilih gambar stego terlebih dahulu.");
    }

    if (!password) {
      return setError("Masukkan stego-key / password.");
    }

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
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengungkap pesan."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#ebe4d1] text-[#17181b]">
      <div className="mx-auto max-w-[920px] px-6 pb-24 pt-12 md:px-10 md:pt-16">

        {/* HEADER */}
        <header className="mb-11">
          <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[#c28722]">
            Ungkap
          </p>

          <h1 className="mt-2 font-[var(--font-space-grotesk)] text-[2rem] font-semibold tracking-[-0.045em] text-[#17181b] md:text-[2.35rem]">
            Baca pesan tersembunyi
          </h1>

          <p className="mt-4 max-w-[760px] text-[0.96rem] leading-7 text-[#69665d]">
            Unggah stego image dan masukkan stego-key yang sama
            saat embed untuk mengekstrak pesan tersembunyi.
          </p>
        </header>

        {/* ERROR */}
        {error && (
          <div className="mb-7 rounded-xl border border-[#d98d8d] bg-[#f8e3df] px-4 py-3 text-sm text-[#873f3f]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* STEGO IMAGE */}
          <section className="mb-10">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[#6d695f]">
                Gambar stego
              </label>

              {imageData && (
                <span className="font-mono text-[0.68rem] text-[#918c80]">
                  {imageData.width} × {imageData.height}px
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
                className={`group flex min-h-[245px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition ${
                  dragActive
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
                      alt="Preview stego image"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[0.94rem] font-semibold text-[#252421]">
                          {selectedFile?.name ?? "Stego image"}
                        </p>

                        {selectedFile && (
                          <p className="mt-1 font-mono text-[0.7rem] text-[#817b6e]">
                            {imageData?.width} × {imageData?.height}px
                            {" · "}
                            {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
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

          {/* PASSWORD */}
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[#6d695f]">
                Password / stego-key
              </label>

              <span className="font-mono text-[0.63rem] uppercase tracking-[0.08em] text-[#918c80]">
                AES-256-GCM
              </span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kunci yang dipakai saat embed"
                autoComplete="current-password"
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

            <p className="mt-2 text-[0.72rem] leading-5 text-[#898274]">
              Gunakan password yang sama dengan saat pesan
              disisipkan. Mode LSB akan dibaca otomatis dari header
              paket.
            </p>
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

          {/* EXTRACT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#dca52e] px-5 text-[0.88rem] font-bold text-[#211805] transition hover:bg-[#e7b341] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#211805]/30 border-t-[#211805]" />
                Mengungkap...
              </>
            ) : (
              "Ungkap pesan"
            )}
          </button>
        </form>

        {/* LSB PREVIEW */}
        {lsbPreviewUrl && (
          <section className="mt-14 border-t border-[#c9c0ae] pt-10">
            <div className="mb-6">
              <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#7d776b]">
                Analisis visual
              </p>

              <h2 className="mt-2 font-[var(--font-space-grotesk)] text-[1.35rem] font-semibold tracking-[-0.025em] text-[#292722]">
                Bidang LSB gambar
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#777267]">
                Visualisasi bidang bit paling rendah dari gambar
                stego yang dipilih.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#c7bfad] bg-[#e1dacc] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lsbPreviewUrl}
                alt="Bidang LSB gambar terpilih"
                className="max-h-[360px] w-full rounded-xl bg-[#151515] object-contain"
              />
            </div>
          </section>
        )}

        {/* RESULT */}
        {message !== null && (
          <section className="mt-10 border-t border-[#c9c0ae] pt-10">
            <div className="mb-6 flex items-center gap-2 text-[#3f774b]">
              <CheckIcon />

              <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.12em]">
                Pesan berhasil diungkap
              </span>
            </div>

            <div className="rounded-2xl border border-[#c7bfad] bg-[#f0eadc] p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between border-b border-[#d4ccbb] pb-4">
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[#817b6e]">
                    Isi pesan
                  </p>

                  <p className="mt-1 text-xs text-[#999285]">
                    Payload berhasil didekripsi secara lokal.
                  </p>
                </div>

                <span className="rounded-full border border-[#b9d0bd] bg-[#e2eee3] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-[#4b7552]">
                  Decrypted
                </span>
              </div>

              <div className="min-h-[120px] rounded-xl border border-[#d4ccbb] bg-[#e8e1d2] p-4">
                <p className="whitespace-pre-wrap break-words font-mono text-[0.9rem] leading-7 text-[#302e29]">
                  {message}
                </p>
              </div>

              <p className="mt-4 text-[0.7rem] leading-5 text-[#898274]">
                Pesan hanya diproses di browser. Tidak ada payload
                yang dikirim ke server.
              </p>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}