"use client";

import ErrorBanner from "@/components/ErrorBanner";
import LocalSessionBanner from "@/components/LocalSessionBanner";
import PasswordField from "@/components/PasswordField";
import { useExtractJob } from "@/hooks/useExtractJob";
import { ExtractResultSection, LsbPreviewSection } from "./components/ExtractSections";
import StegoUploadSection from "./components/StegoUploadSection";

export default function ExtractPage() {
  const job = useExtractJob();

  return (
    <main className="min-h-screen bg-[#151619] text-[#efeee9]">
      <div className="mx-auto max-w-[920px] px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <header className="mb-11">
          <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[#f3b83f]">
            Ungkap
          </p>

          <h1 className="mt-2 font-[var(--font-space-grotesk)] text-[2rem] font-semibold tracking-[-0.045em] text-[#efeee9] md:text-[2.35rem]">
            Baca pesan tersembunyi
          </h1>

          <p className="mt-4 max-w-[760px] text-[0.96rem] leading-7 text-[#98999e]">
            Unggah stego image dan masukkan stego-key yang sama saat embed untuk mengekstrak pesan tersembunyi.
          </p>
        </header>

        {job.error && <ErrorBanner message={job.error} />}

        <form onSubmit={job.handleSubmit}>
          <StegoUploadSection
            previewUrl={job.previewUrl}
            imageWidth={job.imageData?.width ?? null}
            imageHeight={job.imageData?.height ?? null}
            fileName={job.selectedFile?.name ?? null}
            fileSize={job.selectedFile?.size ?? null}
            onFile={job.handleFile}
            onReset={job.handleResetImage}
          />

          <section className="mb-8">
            <PasswordField
              value={job.password}
              onChange={job.setPassword}
              show={job.showPassword}
              onToggleShow={() => job.setShowPassword((prev) => !prev)}
              placeholder="Kunci yang dipakai saat embed"
              autoComplete="current-password"
              badge={
                <span className="font-mono text-[0.63rem] uppercase tracking-[0.08em] text-[#55565b]">
                  AES-256-GCM
                </span>
              }
            />

            <p className="mt-2 text-[0.72rem] leading-5 text-[#55565b]">
              Gunakan password yang sama dengan saat pesan disisipkan. Mode LSB akan dibaca otomatis dari header
              paket.
            </p>
          </section>

          <LocalSessionBanner />

          <button
            type="submit"
            disabled={job.loading}
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#dca52e] px-5 text-[0.88rem] font-bold text-[#19150b] transition hover:bg-[#e7b341] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            {job.loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#211805]/30 border-t-[#211805]" />
                Mengungkap...
              </>
            ) : (
              "Ungkap pesan"
            )}
          </button>
        </form>

        {job.lsbPreviewUrl && <LsbPreviewSection previewUrl={job.lsbPreviewUrl} />}
        {job.message !== null && <ExtractResultSection message={job.message} />}
      </div>
    </main>
  );
}
