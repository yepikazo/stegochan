"use client";

import { formatBytes } from "@/lib/stego";
import { msgBytes } from "@/lib/batch/utils";
import type { BatchCombo, BatchMessage } from "@/lib/batch/types";

interface MessageSectionProps {
  messages: BatchMessage[];
  modes: number[];
  password: string;
  combos: BatchCombo[];
  onMessageChange: (index: number, text: string) => void;
  onToggleMode: (mode: number) => void;
  onPasswordChange: (value: string) => void;
}

export default function MessageSection({
  messages,
  modes,
  password,
  combos,
  onMessageChange,
  onToggleMode,
  onPasswordChange,
}: MessageSectionProps) {
  const ready = combos.filter((c) => c.ok).length;
  const skipped = combos.length - ready;

  return (
    <section className="mb-8 rounded-2xl border border-[#303238] bg-[#1d1f24] p-5">
      <h2 className="mb-3 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[#6e6f74]">
        2. Pesan uji (3 ukuran)
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        {messages.map((m, idx) => (
          <div key={m.id}>
            <label className="mb-1.5 flex justify-between font-mono text-[0.68rem] text-[#98999e]">
              <span>{m.label}</span>
              <span>{formatBytes(msgBytes(m.text))}</span>
            </label>
            <textarea
              value={m.text}
              onChange={(e) => onMessageChange(idx, e.target.value)}
              rows={4}
              className="w-full resize-y rounded-xl border border-[#303238] bg-[#25272d] px-3 py-2.5 font-mono text-[0.78rem] leading-5 text-[#efeee9] outline-none focus:border-[#f3b83f]"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-[#6e6f74]">Mode m-bit:</span>
          {[1, 2, 3].map((mode) => (
            <label
              key={mode}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[0.8rem] font-semibold ${
                modes.includes(mode) ? "border-[#f3b83f] bg-[#f3b83f] text-[#19150b]" : "border-[#303238] text-[#98999e]"
              }`}
            >
              <input type="checkbox" checked={modes.includes(mode)} onChange={() => onToggleMode(mode)} className="sr-only" />
              {mode}-bit
            </label>
          ))}
        </div>
        <div className="flex min-w-[240px] flex-1 items-center gap-2">
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-[#6e6f74]">Password:</span>
          <input
            type="text"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="h-10 flex-1 rounded-xl border border-[#303238] bg-[#25272d] px-3 text-[0.85rem] outline-none focus:border-[#f3b83f]"
          />
        </div>
      </div>
      <p className="mt-3 font-mono text-[0.68rem] text-[#55565b]">
        Matriks: {combos.length} kombinasi · {ready} siap · {skipped} over-kapasitas (auto-SKIP)
      </p>
    </section>
  );
}
