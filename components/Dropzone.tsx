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
      className={`dropzone${active ? " active" : ""}`}
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
        <img src={previewUrl} alt="Pratinjau gambar" className="dropzone-preview" />
      ) : (
        <>
          <strong>{label ?? "Klik atau seret gambar ke sini"}</strong>
          <p>PNG direkomendasikan &middot; JPEG akan diekspor ulang sebagai PNG</p>
        </>
      )}
    </div>
  );
}
