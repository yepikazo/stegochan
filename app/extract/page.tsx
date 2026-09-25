"use client";

import { useState } from "react";

import Alert from "@/components/Alert";
import Dropzone from "@/components/Dropzone";
import { useImageSelection } from "@/hooks/useImageSelection";
import { revealMessage } from "@/lib/stego";

export default function ExtractPage() {
  const { imageData, previewUrl, error, setError, loadFile } = useImageSelection();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageData) return setError("Pilih gambar stego terlebih dahulu.");
    if (!password) return setError("Masukkan stego-key / password.");

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const revealed = await revealMessage(imageData, { password, stegoKey: password });
      setMessage(revealed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengungkap pesan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <p className="eyebrow">Ungkap</p>
      <h1 style={{ fontSize: "1.7rem", marginTop: 10 }}>Baca pesan tersembunyi</h1>
      <p className="muted" style={{ marginTop: 10, marginBottom: 32 }}>
        Unggah stego image dan masukkan stego-key yang sama saat embed untuk mengekstrak payload.
      </p>

      {error && <Alert>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Gambar stego</label>
          <Dropzone previewUrl={previewUrl} onFile={loadFile} label="Klik atau seret gambar stego" />
        </div>

        <div className="field">
          <label className="label">Password / stego-key</label>
          <div style={{ position: "relative" }}>
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kunci yang dipakai saat embed"
              autoComplete="current-password"
              style={{ paddingRight: 52 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                color: "#ecedf1",
                cursor: "pointer",
                fontSize: "0.72rem",
                padding: "6px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Membongkar..." : "Ungkap pesan"}
        </button>
      </form>

      {message !== null && (
        <div className="card" style={{ marginTop: 32 }}>
          <Alert variant="success">Pesan berhasil diungkap.</Alert>
          <p className="label">Isi pesan</p>
          <p className="mono" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {message}
          </p>
        </div>
      )}
    </main>
  );
}
