"use client";

import { useMemo, useState } from "react";

import Alert from "@/components/Alert";
import Dropzone from "@/components/Dropzone";
import { useImageSelection } from "@/hooks/useImageSelection";
import { imageDataToPngBlob, imageDataToPreviewUrl } from "@/lib/image";
import { formatBytes, getUsableCapacityBytes, hideMessage } from "@/lib/stego";

export default function EmbedPage() {
  const { imageData, previewUrl, error, setError, loadFile } = useImageSelection();
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

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
    if (!password) return setError("Password tidak boleh kosong.");

    setLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      const stego = await hideMessage(imageData, message, { password });
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
      <h1 style={{ fontSize: "1.7rem", marginTop: 10 }}>Tanam pesan ke dalam gambar</h1>
      <p className="muted" style={{ marginTop: 10, marginBottom: 32 }}>
        Pesan akan dienkripsi dengan password Anda sebelum disisipkan.
      </p>

      {error && <Alert>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Gambar sampul (cover image)</label>
          <Dropzone previewUrl={previewUrl} onFile={loadFile} />
          {imageData && (
            <p className="hint">
              {imageData.width}&times;{imageData.height}px &middot; kapasitas {formatBytes(capacity)}
            </p>
          )}
        </div>

        <div className="field">
          <label className="label">Pesan rahasia</label>
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
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password untuk mengenkripsi pesan"
            autoComplete="new-password"
          />
        </div>

        <button className="btn btn-primary btn-block" disabled={loading || overLimit}>
          {loading ? "Memproses..." : "Sembunyikan pesan"}
        </button>
      </form>

      {resultUrl && (
        <div className="card" style={{ marginTop: 32 }}>
          <Alert variant="success">Pesan berhasil disisipkan.</Alert>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resultUrl} alt="Gambar hasil" className="result-image" />
          <button className="btn btn-primary btn-block" onClick={handleDownload}>
            Unduh PNG
          </button>
          <p className="hint" style={{ marginTop: 12 }}>
            Bagikan file PNG ini apa adanya. Mengunggahnya ke aplikasi yang mengompres ulang gambar
            (WhatsApp, Instagram, dll.) akan merusak data yang tersembunyi.
          </p>
        </div>
      )}
    </main>
  );
}
