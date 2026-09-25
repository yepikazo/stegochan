"use client";

import { useMemo, useState } from "react";

import Alert from "@/components/Alert";
import Dropzone from "@/components/Dropzone";
import { useImageSelection } from "@/hooks/useImageSelection";
import { imageDataToPngBlob, imageDataToPreviewUrl } from "@/lib/image";
import { calculateMse, calculatePsnr, formatBytes, getUsableCapacityBytes, hideMessage } from "@/lib/stego";

export default function EmbedPage() {
  const { imageData, previewUrl, error, setError, loadFile } = useImageSelection();
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [metrics, setMetrics] = useState<{ mse: number; psnr: number } | null>(null);

  const capacity = useMemo(
    () => (imageData ? getUsableCapacityBytes(imageData.width, imageData.height) : 0),
    [imageData]
  );
  const messageBytes = useMemo(() => new TextEncoder().encode(message).length, [message]);
  const overLimit = imageData ? messageBytes > capacity : false;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageData) return setError("Pilih gambar terlebih dahulu.");
    if (!message) return setError("Pesan tidak boleh kosong.");
    if (!password) return setError("Password / stego-key tidak boleh kosong.");

    setLoading(true);
    setError(null);
    setResultUrl(null);
    setMetrics(null);

    try {
      const stego = await hideMessage(imageData, message, { password, stegoKey: password });
      const mse = calculateMse(imageData, stego);
      const psnr = calculatePsnr(imageData, stego);
      setMetrics({ mse, psnr });
      setResultUrl(imageDataToPreviewUrl(stego));
      setResultBlob(await imageDataToPngBlob(stego));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyembunyikan pesan.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "stegochan-output.png";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <p className="eyebrow">Sembunyikan</p>
      <h1 style={{ fontSize: "1.7rem", marginTop: 10 }}>Embed pesan pada cover image</h1>
      <p className="muted" style={{ marginTop: 10, marginBottom: 32 }}>
        Metode LSB digunakan untuk menyisipkan payload pada citra cover, lalu pesan dienkripsi dengan
        password / stego-key sebelum disisipkan.
      </p>

      {error && <Alert>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Cover image</label>
          <Dropzone previewUrl={previewUrl} onFile={loadFile} />
          {imageData && (
            <p className="hint">
              {imageData.width}&times;{imageData.height}px &middot; kapasitas {formatBytes(capacity)}
            </p>
          )}
        </div>

        <div className="field">
          <label className="label">Payload / pesan rahasia</label>
          <textarea
            className="textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis pesan yang ingin disembunyikan..."
          />
          {imageData && (
            <p className={`hint${overLimit ? " over-limit" : ""}`}>
              {formatBytes(messageBytes)} / {formatBytes(capacity)}
              {overLimit && " — melebihi kapasitas gambar ini"}
            </p>
          )}
        </div>

        <div className="field">
          <label className="label">Password / stego-key</label>
          <div style={{ position: "relative" }}>
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password untuk enkripsi dan urutan penyisipan"
              autoComplete="new-password"
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

        <button className="btn btn-primary btn-block" disabled={loading || overLimit}>
          {loading ? "Memproses..." : "Embed pesan"}
        </button>
      </form>

      {resultUrl && (
        <div className="card" style={{ marginTop: 32 }}>
          <Alert variant="success">Payload berhasil disisipkan ke dalam cover image.</Alert>
          <div className="image-grid">
            <div className="image-panel">
              <p className="label">Cover image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl ?? resultUrl} alt="Cover image" className="result-image" />
            </div>
            <div className="image-panel">
              <p className="label">Stego image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt="Stego image" className="result-image" />
            </div>
          </div>

          {metrics && (
            <div className="metric-grid">
              <div className="metric-box">
                <span className="metric-label">MSE</span>
                <strong>{metrics.mse.toFixed(4)}</strong>
              </div>
              <div className="metric-box">
                <span className="metric-label">PSNR</span>
                <strong>{metrics.psnr.toFixed(2)} dB</strong>
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-block" onClick={handleDownload}>
            Unduh PNG
          </button>
          <p className="hint" style={{ marginTop: 12 }}>
            File output tetap dalam format PNG untuk menjaga integritas bit LSB. Jika disimpan ulang ke
            JPEG, payload dapat rusak atau tidak bisa diekstraksi.
          </p>
        </div>
      )}
    </main>
  );
}
