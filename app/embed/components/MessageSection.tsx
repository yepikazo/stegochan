"use client";

import { formatBytes } from "@/lib/stego";
import type { BitsPerChannel } from "@/lib/stego/types";

interface MessageSectionProps {
  message: string;
  messageBytes: number;
  capacityLabel: string;
  hasImage: boolean;
  overLimit: boolean;
  lsbMode: BitsPerChannel;
  onMessageChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onModeChange: (mode: BitsPerChannel) => void;
}

export default function MessageSection({
  message,
  messageBytes,
  capacityLabel,
  hasImage,
  overLimit,
  lsbMode,
  onMessageChange,
  onModeChange,
}: MessageSectionProps) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center justify-between">
        <label className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[#6e6f74]">
          Pesan rahasia
        </label>

        {hasImage && (
          <span className={`font-mono text-[0.68rem] ${overLimit ? "text-[#b44d4d]" : "text-[#918c80]"}`}>
            {formatBytes(messageBytes)} / {capacityLabel}
          </span>
        )}
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((mode) => {
          const active = lsbMode === mode;

          return (
            <label
              key={mode}
              className={`flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "border-[#f3b83f] bg-[#3a3020] text-[#f3b83f]"
                  : "border-[#303238] bg-[#1d1f24] text-[#98999e] hover:border-[#6e6f74] hover:bg-[#25272d]"
              }`}
            >
              <input
                type="radio"
                name="lsbMode"
                value={mode}
                checked={active}
                onChange={() => onModeChange(mode as BitsPerChannel)}
                className="sr-only"
              />
              {mode}-bit
            </label>
          );
        })}
      </div>

      <p className="mb-4 text-[0.77rem] leading-6 text-[#98999e]">
        1-bit paling aman secara visual, 2-bit memberi kapasitas 2×, 3-bit memberi kapasitas 3× namun kualitas
        visual lebih menurun.
      </p>

      <textarea
        value={message}
        onChange={onMessageChange}
        placeholder="Tulis pesan yang ingin disembunyikan..."
        className={`min-h-[150px] w-full resize-none overflow-hidden rounded-2xl border bg-[#1d1f24] px-4 py-4 text-[0.9rem] leading-6 text-[#efeee9] outline-none transition placeholder:text-[#55565b] ${
          overLimit ? "border-[#c66a6a] focus:border-[#b54f4f]" : "border-[#303238] focus:border-[#f3b83f]"
        }`}
      />

      {overLimit && (
        <p className="mt-2 text-[0.75rem] text-[#e07070]">
          Pesan melebihi kapasitas gambar. Gunakan pesan yang lebih pendek atau mode LSB yang lebih tinggi.
        </p>
      )}
    </section>
  );
}
