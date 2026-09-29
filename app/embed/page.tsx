"use client";

import ErrorBanner from "@/components/ErrorBanner";
import LocalSessionBanner from "@/components/LocalSessionBanner";
import { formatBytes } from "@/lib/stego";
import { useEmbedJob } from "@/hooks/useEmbedJob";
import CoverUploadSection, { capacityLabelFor } from "./components/CoverUploadSection";
import EmbedResultSection from "./components/EmbedResultSection";
import MessageSection from "./components/MessageSection";
import PasswordSection from "./components/PasswordSection";

export default function EmbedPage() {
  const job = useEmbedJob();

  return (
    <main className="min-h-screen bg-[#151619] text-[#efeee9]">
      <div className="mx-auto max-w-[920px] px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <header className="mb-11">
          <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[#f3b83f]">
            Sembunyikan
          </p>

          <h1 className="mt-2 font-[var(--font-space-grotesk)] text-[2rem] font-semibold tracking-[-0.045em] text-[#efeee9] md:text-[2.35rem]">
            Embed pesan pada cover image
          </h1>

          <p className="mt-4 max-w-[760px] text-[0.96rem] leading-7 text-[#98999e]">
            Metode LSB digunakan untuk menyisipkan payload pada citra cover, lalu pesan dienkripsi dengan password /
            stego-key sebelum disisipkan.
          </p>
        </header>

        {job.error && <ErrorBanner message={job.error} />}

        <form onSubmit={job.handleSubmit}>
          <CoverUploadSection
            previewUrl={job.previewUrl}
            imageWidth={job.imageData?.width ?? null}
            imageHeight={job.imageData?.height ?? null}
            fileName={job.selectedFile?.name ?? null}
            fileSize={job.selectedFile?.size ?? null}
            capacityLabel={
              job.imageData ? capacityLabelFor(job.imageData.width, job.imageData.height, job.lsbMode) : null
            }
            onFile={job.handleFile}
            onReset={job.handleResetImage}
          />

          <MessageSection
            message={job.message}
            messageBytes={job.messageBytes}
            capacityLabel={formatBytes(job.capacity)}
            hasImage={job.imageData !== null}
            overLimit={job.overLimit}
            lsbMode={job.lsbMode}
            onMessageChange={job.handleMessageChange}
            onModeChange={job.setLsbMode}
          />

          <PasswordSection
            password={job.password}
            showPassword={job.showPassword}
            strength={job.passwordStrength}
            onPasswordChange={job.setPassword}
            onToggleShow={() => job.setShowPassword((prev) => !prev)}
          />

          <LocalSessionBanner />

          <button
            type="submit"
            disabled={job.loading || job.overLimit}
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#dca52e] px-5 text-[0.88rem] font-bold text-[#19150b] transition hover:bg-[#e7b341] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            {job.loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#211805]/30 border-t-[#211805]" />
                Memproses...
              </>
            ) : (
              "Embed pesan"
            )}
          </button>
        </form>

        {job.resultUrl && (
          <EmbedResultSection
            resultUrl={job.resultUrl}
            coverUrl={job.previewUrl ?? job.resultUrl}
            metrics={job.metrics}
            tradeoff={job.tradeoff}
            lsbUrls={job.lsbUrls}
            histograms={job.histograms}
            onDownload={job.handleDownload}
          />
        )}
      </div>
    </main>
  );
}
