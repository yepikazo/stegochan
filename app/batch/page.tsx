"use client";

import { useMemo, useRef, useState } from "react";
import BatchActions from "./components/BatchActions";
import CoverSection from "./components/CoverSection";
import MessageSection from "./components/MessageSection";
import ResultsTable from "./components/ResultsTable";
import SummaryCards from "./components/SummaryCards";
import { exportBatchCsv, exportBatchXlsx } from "@/lib/batch/export";
import { revokeBatchImage, validateAndLoadImages } from "@/lib/batch/image-loader";
import { runBatchCombos } from "@/lib/batch/runner";
import type { BatchImage, BatchResult } from "@/lib/batch/types";
import { MESSAGE_PRESETS, buildCombos, summarizeResults } from "@/lib/batch/utils";

export default function BatchPage() {
  const [images, setImages] = useState<BatchImage[]>([]);
  const [messages, setMessages] = useState(MESSAGE_PRESETS);
  const [modes, setModes] = useState<number[]>([1, 2, 3]);
  const [password, setPassword] = useState("uji-batch-123");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState<BatchResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cancelRef = useRef(false);

  const combos = useMemo(() => buildCombos(images, messages, modes), [images, messages, modes]);
  const summary = useMemo(() => summarizeResults(results), [results]);

  async function handleFiles(files: FileList) {
    const { loaded, errors } = await validateAndLoadImages(files);
    if (loaded.length) setImages((prev) => [...prev, ...loaded]);
    setError(errors.length ? errors[0] : null);
  }

  function handleRemoveImage(id: string) {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) revokeBatchImage(target);
      return prev.filter((i) => i.id !== id);
    });
  }

  function handleMessageChange(index: number, text: string) {
    setMessages((prev) => prev.map((p, i) => (i === index ? { ...p, text } : p)));
  }

  function handleToggleMode(mode: number) {
    setModes((prev) => (prev.includes(mode) ? prev.filter((m) => m !== mode).sort() : [...prev, mode].sort()));
  }

  async function handleRun() {
    if (!images.length) return setError("Unggah minimal 1 citra cover.");
    if (!messages.some((m) => m.text)) return setError("Minimal 1 pesan tidak boleh kosong.");
    if (!modes.length) return setError("Pilih minimal 1 mode m-bit.");
    if (!password) return setError("Password tidak boleh kosong (agar komparabel).");

    setError(null);
    setResults([]);
    setRunning(true);
    cancelRef.current = false;
    setProgress({ done: 0, total: combos.length });

    await runBatchCombos({
      combos,
      password,
      shouldCancel: () => cancelRef.current,
      onProgress: (done, total, partial) => {
        setProgress({ done, total });
        setResults(partial);
      },
    });
    setRunning(false);
  }

  async function handleExportXlsx() {
    if (!results.length) return setError("Belum ada hasil untuk diekspor.");
    try {
      await exportBatchXlsx({ images, messages, combos, results });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengekspor XLSX.");
    }
  }

  function handleExportCsv() {
    if (!results.length) return setError("Belum ada hasil untuk diekspor.");
    exportBatchCsv(results);
  }

  return (
    <main className="min-h-screen text-[#efeee9]">
      <div className="mx-auto max-w-[1080px] px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <header className="mb-8">
          <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[#f3b83f]">Pengujian</p>
          <h1 className="mt-2 font-[var(--font-space-grotesk)] text-[2rem] font-semibold tracking-[-0.045em] md:text-[2.35rem]">
            Uji massal untuk Excel
          </h1>
          <p className="mt-4 max-w-[820px] text-[0.96rem] leading-7 text-[#98999e]">
            Unggah beberapa cover, siapkan 3 pesan, pilih mode m-bit, jalankan sekali lalu unduh workbook
            XLSX berisi sheet <span className="font-mono text-[0.8rem] text-[#efeee9]">PSNR_MSE, Uji_JPEG, Metadata</span>.
            Semua proses lokal di browser.
          </p>
        </header>

        {error && (
          <div className="mb-7 rounded-xl border border-[#8b3a3a] bg-[#3b1f1f] px-4 py-3 text-sm text-[#f08080]">{error}</div>
        )}

        <CoverSection images={images} inputRef={fileInputRef} onFiles={handleFiles} onRemove={handleRemoveImage} />

        <MessageSection
          messages={messages}
          modes={modes}
          password={password}
          combos={combos}
          onMessageChange={handleMessageChange}
          onToggleMode={handleToggleMode}
          onPasswordChange={setPassword}
        />

        <BatchActions
          running={running}
          comboCount={combos.length}
          canExport={results.length > 0}
          progress={progress}
          onRun={handleRun}
          onCancel={() => {
            cancelRef.current = true;
          }}
          onExportXlsx={handleExportXlsx}
          onExportCsv={handleExportCsv}
        />

        <SummaryCards summary={summary} />
        <ResultsTable results={results} />
      </div>
    </main>
  );
}
