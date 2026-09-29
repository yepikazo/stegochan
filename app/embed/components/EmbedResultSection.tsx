"use client";

import HistogramChart from "@/components/HistogramChart";
import { CheckIcon, DownloadIcon } from "@/components/icons";
import { formatBytes } from "@/lib/stego";
import type { EmbedHistograms, EmbedLsbUrls, EmbedMetrics, EmbedTradeoff } from "@/hooks/useEmbedJob";
import ComparisonImage from "./ComparisonImage";

const HISTOGRAM_CHANNELS = [
  { title: "R", key: "r", color: "red" },
  { title: "G", key: "g", color: "green" },
  { title: "B", key: "b", color: "blue" },
] as const;

interface EmbedResultSectionProps {
  resultUrl: string;
  coverUrl: string;
  metrics: EmbedMetrics | null;
  tradeoff: EmbedTradeoff | null;
  lsbUrls: EmbedLsbUrls | null;
  histograms: EmbedHistograms | null;
  onDownload: () => void;
}

export default function EmbedResultSection({
  resultUrl,
  coverUrl,
  metrics,
  tradeoff,
  lsbUrls,
  histograms,
  onDownload,
}: EmbedResultSectionProps) {
  return (
    <section className="mt-14 border-t border-[#303238] pt-10">
      <div className="mb-7">
        <div className="mb-2 flex items-center gap-2 text-[#5aab6e]">
          <CheckIcon />

          <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.12em]">Berhasil</span>
        </div>

        <h2 className="font-[var(--font-space-grotesk)] text-[1.55rem] font-semibold tracking-[-0.035em] text-[#efeee9]">
          Pesan berhasil disisipkan
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#98999e]">
          Payload telah dienkripsi dan disisipkan ke dalam cover image menggunakan metode LSB.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ComparisonImage src={coverUrl} alt="Cover image" label="Cover image" />
        <ComparisonImage src={resultUrl} alt="Stego image" label="Stego image" />
      </div>

      {metrics && (
        <div className="mt-7 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#303238] bg-[#1d1f24] p-4">
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[#6e6f74]">MSE</p>

            <p className="mt-2 text-xl font-semibold text-[#efeee9]">{metrics.mse.toFixed(4)}</p>
          </div>

          <div className="rounded-xl border border-[#303238] bg-[#1d1f24] p-4">
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[#6e6f74]">PSNR</p>

            <p className="mt-2 text-xl font-semibold text-[#efeee9]">{metrics.psnr.toFixed(2)} dB</p>
          </div>
        </div>
      )}

      {tradeoff && (
        <div className="mt-10 border-t border-[#303238] pt-8">
          <h2 className="font-[var(--font-space-grotesk)] text-lg font-semibold tracking-[-0.02em] text-[#efeee9]">
            Analisis Trade-off
          </h2>

          <p className="mt-2 max-w-[720px] text-sm leading-6 text-[#98999e]">
            Mode yang lebih tinggi meningkatkan kapasitas payload, tetapi menurunkan kualitas visual yang terlihat
            dari perubahan PSNR dibanding mode 1-bit.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#303238] bg-[#1d1f24] p-5">
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[#6e6f74]">Kapasitas</p>

              <p className="mt-2 text-xl font-semibold text-[#efeee9]">
                {formatBytes(tradeoff.capacitySelected)}
              </p>

              <p className="mt-1 text-xs text-[#888174]">1-bit: {formatBytes(tradeoff.capacity1bit)}</p>
            </div>

            <div className="rounded-xl border border-[#303238] bg-[#1d1f24] p-5">
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[#6e6f74]">PSNR</p>

              <p className="mt-2 text-xl font-semibold text-[#efeee9]">
                {tradeoff.psnrSelected.toFixed(2)} dB
              </p>

              <p className="mt-1 text-xs text-[#888174]">
                1-bit:{" "}
                {tradeoff.psnr1bit === null ? "Tidak tersedia" : `${tradeoff.psnr1bit.toFixed(2)} dB`}
              </p>
            </div>
          </div>
        </div>
      )}

      {lsbUrls && (
        <div className="mt-10 border-t border-[#303238] pt-8">
          <h2 className="font-[var(--font-space-grotesk)] text-lg font-semibold tracking-[-0.02em] text-[#efeee9]">
            Steganalisis Visual
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#98999e]">
            Bidang LSB cover biasanya masih menampilkan pola yang lebih halus, sedangkan bidang LSB stego cenderung
            terlihat lebih acak karena perubahan bit data tersembunyi.
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[0.67rem] uppercase tracking-[0.1em] text-[#6e6f74]">
                LSB cover
              </p>

              <img
                src={lsbUrls.cover}
                alt="Bidang LSB cover"
                className="w-full rounded-xl border border-[#303238] bg-[#191919] object-contain"
              />
            </div>

            <div>
              <p className="mb-2 font-mono text-[0.67rem] uppercase tracking-[0.1em] text-[#6e6f74]">
                LSB stego
              </p>

              <img
                src={lsbUrls.stego}
                alt="Bidang LSB stego"
                className="w-full rounded-xl border border-[#303238] bg-[#191919] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {histograms && (
        <div className="mt-10 border-t border-[#303238] pt-8">
          <h2 className="font-[var(--font-space-grotesk)] text-lg font-semibold tracking-[-0.02em] text-[#efeee9]">
            Perbandingan Histogram
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#98999e]">
            Histogram cover dan stego yang nyaris identik menunjukkan bahwa penyisipan LSB tidak meninggalkan
            perubahan statistik yang mencolok.
          </p>

          <div className="mt-5 space-y-6">
            {[
              { label: "Cover image", data: histograms.cover },
              { label: "Stego image", data: histograms.stego },
            ].map(({ label, data }) => (
              <div key={label}>
                <p className="mb-3 font-mono text-[0.67rem] uppercase tracking-[0.1em] text-[#6e6f74]">
                  {label}
                </p>

                <div className="grid gap-3 md:grid-cols-3">
                  {HISTOGRAM_CHANNELS.map(({ title, key, color }) => (
                    <HistogramChart key={key} title={title} data={data[key]} color={color as "red" | "green" | "blue"} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <button
          type="button"
          onClick={onDownload}
          className="flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#dca52e] text-sm font-bold text-[#19150b] transition hover:bg-[#e7b341]"
        >
          <DownloadIcon />
          Unduh PNG
        </button>

        <p className="mt-3 text-center text-[0.72rem] leading-5 text-[#55565b]">
          File output tetap dalam format PNG untuk menjaga integritas bit LSB. Jika disimpan ulang ke JPEG, payload
          dapat rusak atau tidak bisa diekstraksi.
        </p>
      </div>
    </section>
  );
}
