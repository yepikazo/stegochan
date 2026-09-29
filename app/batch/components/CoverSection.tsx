"use client";

import { formatBytes, getUsableCapacityBytes } from "@/lib/stego";
import type { BatchImage } from "@/lib/batch/types";

interface CoverSectionProps {
  images: BatchImage[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFiles: (files: FileList) => void;
  onRemove: (id: string) => void;
}

export default function CoverSection({ images, inputRef, onFiles, onRemove }: CoverSectionProps) {
  return (
    <section className="mb-8 rounded-2xl border border-[#303238] bg-[#1d1f24] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[#6e6f74]">
          1. Cover image (multi)
        </h2>
        <span className="font-mono text-[0.68rem] text-[#55565b]">{images.length} citra</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl bg-[#f3b83f] px-4 py-2.5 text-[0.82rem] font-bold text-[#19150b] hover:bg-[#e7b341]"
        >
          Tambah gambar
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          multiple
          onChange={(e) => {
            if (e.target.files?.length) onFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
        <p className="self-center font-mono text-[0.68rem] text-[#55565b]">PNG/JPG · maks 20 MB per file</p>
      </div>
      {images.length > 0 && (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {images.map((img) => (
            <div key={img.id} className="flex items-center gap-3 rounded-xl border border-[#303238] bg-[#25272d] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.previewUrl} alt={img.name} className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.85rem] font-semibold">{img.name}</p>
                <p className="font-mono text-[0.68rem] text-[#6e6f74]">
                  {img.width}×{img.height} · 1-bit {formatBytes(getUsableCapacityBytes(img.width, img.height, 1))}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="rounded-lg px-2 py-1 text-lg text-[#6e6f74] hover:bg-[#2a2c32] hover:text-[#efeee9]"
                aria-label={`Hapus ${img.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
