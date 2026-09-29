"use client";

import { useState } from "react";

const ZOOM_LEVELS = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3] as const;
const ZOOM_SIZE_CLASSES = [
  "w-full h-full",
  "w-[125%] h-[125%]",
  "w-[150%] h-[150%]",
  "w-[175%] h-[175%]",
  "w-[200%] h-[200%]",
  "w-[225%] h-[225%]",
  "w-[250%] h-[250%]",
  "w-[275%] h-[275%]",
  "w-[300%] h-[300%]",
] as const;

interface ComparisonImageProps {
  src: string;
  alt: string;
  label: string;
}

export default function ComparisonImage({ src, alt, label }: ComparisonImageProps) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = ZOOM_LEVELS[zoomIndex];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-mono text-[0.67rem] uppercase tracking-[0.1em] text-[#6e6f74]">{label}</p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoomIndex((current) => Math.max(0, current - 1))}
            disabled={zoomIndex === 0}
            aria-label={`Perkecil ${label}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#303238] bg-[#1d1f24] font-mono text-base text-[#efeee9] transition hover:border-[#6e6f74] hover:bg-[#25272d] disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>

          <button
            type="button"
            onClick={() => setZoomIndex(0)}
            aria-label={`Atur ulang zoom ${label}`}
            title="Atur ulang zoom"
            className="min-w-[54px] rounded-lg px-1 py-2 font-mono text-[0.65rem] text-[#98999e] hover:text-[#f3b83f]"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={() => setZoomIndex((current) => Math.min(ZOOM_LEVELS.length - 1, current + 1))}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            aria-label={`Perbesar ${label}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#303238] bg-[#1d1f24] font-mono text-base text-[#efeee9] transition hover:border-[#6e6f74] hover:bg-[#25272d] disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div className="h-[260px] overflow-auto rounded-2xl border border-[#303238] bg-[#25272d] p-3 sm:h-[300px]">
        <div className={`flex min-h-full min-w-full items-center justify-center ${ZOOM_SIZE_CLASSES[zoomIndex]}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="h-full w-full object-contain" />
        </div>
      </div>
    </div>
  );
}
