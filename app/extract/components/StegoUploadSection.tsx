"use client";

import { useRef, useState } from "react";
import { ImageIcon, UploadIcon } from "@/components/icons";
import { IMAGE_ACCEPT } from "@/lib/image-validation";

interface StegoUploadSectionProps {
  previewUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  fileName: string | null;
  fileSize: number | null;
  onFile: (file: File) => void;
  onReset: () => void;
}

export default function StegoUploadSection({
  previewUrl,
  imageWidth,
  imageHeight,
  fileName,
  fileSize,
  onFile,
  onReset,
}: StegoUploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void onFile(file);
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void onFile(file);
  }

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center justify-between">
        <label className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[#6e6f74]">
          Gambar stego
        </label>

        {imageWidth !== null && imageHeight !== null && (
          <span className="font-mono text-[0.68rem] text-[#55565b]">
            {imageWidth} × {imageHeight}px
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
              ? "border-[#f3b83f] bg-[#25272d]"
              : "border-[#303238] bg-[#1d1f24] hover:border-[#f3b83f] hover:bg-[#25272d]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="mb-4 text-[#55565b] transition group-hover:text-[#f3b83f]">
            {dragActive ? <UploadIcon /> : <ImageIcon />}
          </div>

          <p className="text-[0.95rem] font-medium text-[#efeee9]">
            {dragActive ? "Lepaskan gambar di sini" : "Pilih atau seret gambar ke sini"}
          </p>

          <p className="mt-2 font-mono text-[0.67rem] uppercase tracking-[0.08em] text-[#55565b]">
            PNG & JPG · Maks. 20 MB
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#303238] bg-[#1d1f24] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-[120px] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#303238] bg-[#25272d] sm:w-[180px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview stego image" className="h-full w-full object-contain" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[0.94rem] font-semibold text-[#efeee9]">
                    {fileName ?? "Stego image"}
                  </p>

                  {fileSize !== null && imageWidth !== null && imageHeight !== null && (
                    <p className="mt-1 font-mono text-[0.7rem] text-[#6e6f74]">
                      {imageWidth} × {imageHeight}px
                      {" · "}
                      {(fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onReset}
                  className="shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-[#6e6f74] transition hover:bg-[#2a2c32] hover:text-[#efeee9]"
                  aria-label="Hapus gambar"
                >
                  ×
                </button>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 text-[0.78rem] font-semibold text-[#f3b83f] underline decoration-[#f3b83f] underline-offset-4 hover:text-[#e0a83a]"
              >
                Ganti gambar
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept={IMAGE_ACCEPT}
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
