"use client";

import { useCallback, useRef, useState } from "react";

interface DropzoneProps {
  previewUrl: string | null;
  onFile: (file: File) => void;
  label?: string;
}

export default function Dropzone({ previewUrl, onFile, label }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      className={`cursor-pointer rounded-md border border-dashed border-[#33363f] bg-[#1d1f26] p-8 text-center transition ${
        active ? "border-[#e8a33d] bg-[#262933]" : "hover:border-[#93969f]"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Pratinjau gambar" className="mx-auto max-h-[220px] max-w-full rounded-md border border-[#33363f]" />
      ) : (
        <div className="space-y-1">
          <strong className="text-base font-semibold text-white">
            {label ?? "Klik atau seret gambar ke sini"}
          </strong>
          <p className="text-sm text-[#93969f]">PNG direkomendasikan &middot; JPEG akan diekspor ulang sebagai PNG</p>
        </div>
      )}
    </div>
  );
}
