"use client";

interface BatchActionsProps {
  running: boolean;
  comboCount: number;
  canExport: boolean;
  progress: { done: number; total: number };
  onRun: () => void;
  onCancel: () => void;
  onExportXlsx: () => void;
  onExportCsv: () => void;
}

export default function BatchActions({
  running,
  comboCount,
  canExport,
  progress,
  onRun,
  onCancel,
  onExportXlsx,
  onExportCsv,
}: BatchActionsProps) {
  return (
    <>
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRun}
          disabled={running || !comboCount}
          className="flex h-[52px] items-center gap-2 rounded-2xl bg-[#dca52e] px-6 text-[0.88rem] font-bold text-[#19150b] hover:bg-[#e7b341] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? `Menjalankan ${progress.done}/${progress.total}…` : `Jalankan ${comboCount} kombinasi`}
        </button>
        {running && (
          <button
            type="button"
            onClick={onCancel}
            className="h-[52px] rounded-2xl border border-[#303238] px-6 text-[0.85rem] font-semibold text-[#98999e] hover:bg-[#25272d]"
          >
            Batal
          </button>
        )}
        <button
          type="button"
          onClick={onExportXlsx}
          disabled={!canExport || running}
          className="h-[52px] rounded-2xl border border-[#f3b83f] px-6 text-[0.85rem] font-bold text-[#f3b83f] hover:bg-[#f3b83f] hover:text-[#19150b] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Unduh XLSX
        </button>
        <button
          type="button"
          onClick={onExportCsv}
          disabled={!canExport || running}
          className="h-[52px] rounded-2xl border border-[#303238] px-6 text-[0.85rem] font-semibold text-[#98999e] hover:bg-[#25272d] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Unduh CSV
        </button>
      </div>

      {running && (
        <div className="mb-8 h-2 overflow-hidden rounded-full bg-[#303238]">
          <div
            className="h-full rounded-full bg-[#f3b83f] transition-all"
            style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
          />
        </div>
      )}
    </>
  );
}
