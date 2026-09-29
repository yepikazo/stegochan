"use client";

import { CheckIcon } from "@/components/icons";

export function LsbPreviewSection({ previewUrl }: { previewUrl: string }) {
  return (
    <section className="mt-14 border-t border-[#303238] pt-10">
      <div className="mb-6">
        <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#6e6f74]">
          Analisis visual
        </p>

        <h2 className="mt-2 font-[var(--font-space-grotesk)] text-[1.35rem] font-semibold tracking-[-0.025em] text-[#efeee9]">
          Bidang LSB gambar
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#98999e]">
          Visualisasi bidang bit paling rendah dari gambar stego yang dipilih.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#303238] bg-[#25272d] p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Bidang LSB gambar terpilih"
          className="max-h-[360px] w-full rounded-xl bg-[#151515] object-contain"
        />
      </div>
    </section>
  );
}

export function ExtractResultSection({ message }: { message: string }) {
  return (
    <section className="mt-10 border-t border-[#303238] pt-10">
      <div className="mb-6 flex items-center gap-2 text-[#5aab6e]">
        <CheckIcon size={18} />

        <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.12em]">
          Pesan berhasil diungkap
        </span>
      </div>

      <div className="rounded-2xl border border-[#303238] bg-[#1d1f24] p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-[#303238] pb-4">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[#6e6f74]">Isi pesan</p>

            <p className="mt-1 text-xs text-[#55565b]">Payload berhasil didekripsi secara lokal.</p>
          </div>

          <span className="rounded-full border border-[#2a3d2e] bg-[#1e3324] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-[#5aab6e]">
            Decrypted
          </span>
        </div>

        <div className="min-h-[120px] rounded-xl border border-[#303238] bg-[#25272d] p-4">
          <p className="whitespace-pre-wrap break-words font-mono text-[0.9rem] leading-7 text-[#efeee9]">
            {message}
          </p>
        </div>

        <p className="mt-4 text-[0.7rem] leading-5 text-[#55565b]">
          Pesan hanya diproses di browser. Tidak ada payload yang dikirim ke server.
        </p>
      </div>
    </section>
  );
}
