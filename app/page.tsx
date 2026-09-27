import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-20 pt-16 md:px-8">
      <p className="font-mono text-[0.8rem] uppercase tracking-[0.12em] text-[#e8a33d]">
        Covert Hiding of Assets in Noise
      </p>
      <h1 className="mt-3 max-w-[560px] text-[2.4rem] font-semibold leading-tight tracking-[-0.04em] text-white">
        Sembunyikan sebuah pesan di dalam gambar biasa.
      </h1>
      <p className="mt-4 max-w-[520px] text-[1.02rem] leading-7 text-[#93969f]">
        StegoChan mengenkripsi pesan Anda lalu menyembunyikannya di bit-bit
        terkecil warna piksel &mdash; noise yang tidak kasat mata. Semua proses
        berjalan di browser Anda; gambar dan pesan tidak pernah dikirim ke
        server mana pun.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/embed"
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#e8a33d] px-5 py-3 text-sm font-semibold text-[#1a1408] transition hover:bg-[#f0af52] active:translate-y-px"
        >
          Sembunyikan pesan
        </Link>
        <Link
          href="/extract"
          className="inline-flex items-center justify-center rounded-md border border-[#33363f] bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:border-[#93969f] active:translate-y-px"
        >
          Ungkap pesan
        </Link>
      </div>

      <section className="mt-18">
        <h2 className="mb-6 text-[1.1rem] font-semibold text-white">
          Cara kerjanya
        </h2>
        <ol className="flex list-decimal flex-col gap-3 pl-5 text-[0.95rem] leading-7 text-[#ecedf1] marker:text-[#e8a33d]">
          <li>
            <strong className="font-semibold text-white">Enkripsi.</strong>{" "}
            Pesan dikunci dengan AES-256-GCM, memakai kunci yang diturunkan dari
            password Anda lewat PBKDF2.
          </li>
          <li>
            <strong className="font-semibold text-white">Penyisipan.</strong>{" "}
            Hasil terenkripsi ditulis ke bit terakhir setiap kanal merah, hijau,
            dan biru &mdash; perubahan yang tidak terlihat mata.
          </li>
          <li>
            <strong className="font-semibold text-white">Ekspor.</strong> Gambar
            hasil diunduh sebagai PNG, format lossless yang menjaga setiap bit
            tetap utuh.
          </li>
        </ol>
      </section>

      <section className="mt-14">
        <h2 className="mb-3 text-[1.1rem] font-semibold text-white">
          Yang perlu diketahui
        </h2>
        <p className="max-w-[560px] text-[0.92rem] leading-7 text-[#93969f]">
          Data akan rusak jika gambar dikompres ulang &mdash; termasuk saat
          diunggah ke WhatsApp, Instagram, atau platform lain yang memampatkan
          gambar. Selalu bagikan file PNG asli yang diunduh dari sini.
        </p>
      </section>
    </main>
  );
}
