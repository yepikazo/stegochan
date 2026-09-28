"use client";

import { useCallback, useRef, useState } from "react";

interface DropzoneProps {
  previewUrl: string | null;
  onFile: (file: File) => void;
  onClear?: () => void;
  label?: string;
  imageWidth?: number;
  imageHeight?: number;
}

function ImageIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

export default function Dropzone({
  previewUrl,
  onFile,
  onClear,
  label,
  imageWidth,
  imageHeight,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [active, setActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];

      if (!file) return;

      setSelectedFile(file);
      onFile(file);
    },
    [onFile]
  );

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();

    setSelectedFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onClear?.();
  };

  const handleChangeImage = (event: React.MouseEvent) => {
    event.stopPropagation();
    inputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`relative min-h-[178px] w-full cursor-pointer rounded-xl border border-dashed border-[#d1c7aa] bg-[rgba(222,213,189,0.34)] p-4 text-[#1c1e22] transition-[border-color,background-color,box-shadow] duration-150 hover:border-[rgba(243,184,63,0.75)] hover:bg-[rgba(222,213,189,0.55)] ${
        active
          ? "border-[#f3b83f] bg-[rgba(243,184,63,0.1)] shadow-[inset_0_0_0_1px_rgba(243,184,63,0.18)]"
          : ""
      } ${previewUrl ? "cursor-default" : ""}`}
      onClick={() => {
        if (!previewUrl) {
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setActive(false);
        handleFiles(event.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          (event.key === "Enter" || event.key === " ") &&
          !previewUrl
        ) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        hidden
        onChange={(event) => handleFiles(event.target.files)}
      />

      {previewUrl ? (
        <div className="flex min-h-36 items-center gap-[18px] max-[650px]:items-start max-[480px]:flex-col">
          <div className="h-36 w-[190px] shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-[#f3b83f] bg-[#151c28] max-[650px]:h-[110px] max-[650px]:w-[135px] max-[480px]:h-[170px] max-[480px]:w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Pratinjau gambar penyamaran"
              className="block h-full w-full object-cover"
            />
          </div>

          <div className="relative min-w-0 pr-[38px] max-[480px]:w-full">
            <button
              type="button"
              className="absolute -top-[5px] right-0 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#d1c7aa] bg-transparent text-[#1c1e22] transition hover:border-[#d87979] hover:bg-[rgba(216,121,121,0.08)] hover:text-[#d87979]"
              onClick={handleClear}
              aria-label="Hapus gambar"
            >
              <CloseIcon />
            </button>

            <p className="overflow-hidden text-ellipsis whitespace-nowrap font-[var(--font-space-grotesk)] text-[0.95rem] font-medium text-[#1c1e22]">
              {selectedFile?.name ?? "Gambar penyamaran"}
            </p>

            <p className="mt-[5px] font-mono text-[0.58rem] text-[#66645e]">
              {imageWidth && imageHeight
                ? `${imageWidth} × ${imageHeight}`
                : "Ukuran gambar"}{" "}
              ·{" "}
              {selectedFile
                ? formatFileSize(selectedFile.size)
                : "Ukuran file"}
            </p>

            <button
              type="button"
              className="mt-[11px] cursor-pointer border-0 bg-transparent p-0 font-[var(--font-space-grotesk)] text-[0.72rem] font-semibold text-[#9a731f] hover:text-[#705314] hover:underline"
              onClick={handleChangeImage}
            >
              Ganti gambar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-36 items-center justify-center gap-4 text-left max-[650px]:min-h-[120px]">
          <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[9px] border border-[#d1c7aa] bg-[rgba(205,192,156,0.45)] text-[#1c1e22]">
            <ImageIcon />
          </div>

          <div>
            <strong className="block font-[var(--font-space-grotesk)] text-[0.95rem] font-medium text-[#1c1e22]">
              {label ?? "Pilih atau seret gambar ke sini"}
            </strong>

            <p className="mt-[5px] font-mono text-[0.58rem] text-[#66645e]">
              PNG & JPG · Maks. 20 MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}