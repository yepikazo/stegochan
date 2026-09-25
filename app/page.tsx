import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container" style={{ paddingTop: 64, paddingBottom: 80 }}>
      <p className="eyebrow">Covert Hiding of Assets in Noise</p>
      <h1 style={{ fontSize: "2.4rem", marginTop: 14, maxWidth: 560 }}>
        Sembunyikan sebuah pesan di dalam gambar biasa.
      </h1>
      <p className="muted" style={{ maxWidth: 520, marginTop: 16, fontSize: "1.02rem" }}>
        StegoChan mengenkripsi pesan Anda lalu menyembunyikannya di bit-bit
        terkecil warna piksel &mdash; noise yang tidak kasat mata. Semua proses
        berjalan di browser Anda; gambar dan pesan tidak pernah dikirim ke
        server mana pun.
      </p>

      <div className="row" style={{ marginTop: 32 }}>
        <Link href="/embed" className="btn btn-primary">
          Sembunyikan pesan
        </Link>
        <Link href="/extract" className="btn btn-secondary">
          Ungkap pesan
        </Link>
      </div>

      <section style={{ marginTop: 72 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 24 }}>Cara kerjanya</h2>
        <ol className="stack" style={{ paddingLeft: 20, fontSize: "0.95rem" }}>
          <li>
            <strong>Enkripsi.</strong> Pesan dikunci dengan AES-256-GCM,
            memakai kunci yang diturunkan dari password Anda lewat PBKDF2.
          </li>
          <li>
            <strong>Penyisipan.</strong> Hasil terenkripsi ditulis ke bit
            terakhir setiap kanal merah, hijau, dan biru &mdash; perubahan yang
            tidak terlihat mata.
          </li>
          <li>
            <strong>Ekspor.</strong> Gambar hasil diunduh sebagai PNG, format
            lossless yang menjaga setiap bit tetap utuh.
          </li>
        </ol>
      </section>

      <section style={{ marginTop: 56 }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Yang perlu diketahui</h2>
        <p className="muted" style={{ fontSize: "0.92rem", maxWidth: 560 }}>
          Data akan rusak jika gambar dikompres ulang &mdash; termasuk saat
          diunggah ke WhatsApp, Instagram, atau platform lain yang memampatkan
          gambar. Selalu bagikan file PNG asli yang diunduh dari sini.
        </p>
      </section>
    </main>
  );
}
