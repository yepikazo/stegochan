# StegoChan

**C**overt **H**iding of **A**ssets in **N**oise

Aplikasi web untuk menyembunyikan dan mengenkripsi pesan di dalam gambar
menggunakan teknik steganografi LSB (Least Significant Bit). Seluruh proses
—enkripsi, penyisipan, dan ekstraksi—berjalan sepenuhnya di sisi klien
(browser). Tidak ada gambar atau pesan yang dikirim ke server mana pun.

## Daftar Isi

- [Fitur](#fitur)
- [Cara Kerja](#cara-kerja)
- [Tech Stack](#tech-stack)
- [Instalasi](#instalasi)
- [Penggunaan](#penggunaan)
- [Format Paket Data](#format-paket-data)
- [Batasan](#batasan)
- [Roadmap](#roadmap)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

## Fitur

- **Enkripsi end-to-end** — pesan dienkripsi dengan AES-256-GCM sebelum
  disisipkan; kunci diturunkan dari password lewat PBKDF2 (600.000 iterasi).
- **Deteksi password salah otomatis** — autentikasi bawaan AES-GCM membuat
  password yang keliru langsung terdeteksi, bukan menghasilkan pesan acak.
- **Validasi kapasitas** — aplikasi menghitung kapasitas gambar dan menolak
  pesan yang terlalu besar sebelum proses penyisipan dimulai.
- **Header terstruktur** — setiap paket memiliki magic bytes, versi, salt,
  IV, dan panjang payload, sehingga proses ekstraksi dapat memvalidasi data
  dan memberi pesan error yang jelas.
- **Zero server-side processing** — memakai Web Crypto API dan Canvas API
  bawaan browser; tidak ada API route, tidak ada database.
- **Ekspor lossless** — hasil selalu diunduh sebagai PNG agar setiap bit yang
  disisipkan tetap utuh.

## Cara Kerja

```
Sisipkan:  Pesan → Enkripsi (AES-256-GCM) → Bangun Header → Sisipkan ke LSB → Unduh PNG
Ungkap:    Gambar PNG → Baca Header → Ekstrak Ciphertext → Dekripsi → Pesan
```

1. **Enkripsi.** Pesan dienkripsi dengan AES-256-GCM. Kunci diturunkan dari
   password pengguna menggunakan PBKDF2-SHA256.
2. **Pembungkusan.** Ciphertext dibungkus bersama metadata (salt, IV,
   panjang data) menjadi satu paket biner.
3. **Penyisipan.** Setiap bit paket ditulis ke bit terakhir (LSB) kanal
   merah, hijau, dan biru pada tiap piksel secara berurutan. Kanal alfa
   tidak disentuh.
4. **Ekspor.** Gambar hasil diekspor sebagai PNG—format lossless—agar
   perubahan pada bit tidak hilang akibat kompresi.
5. **Ekstraksi.** Proses dibalik: baca header untuk mengetahui panjang data,
   ambil ciphertext dari LSB, lalu dekripsi dengan password yang sama.

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | CSS custom (design tokens) |
| Kriptografi | Web Crypto API — AES-256-GCM, PBKDF2 |
| Pengolahan gambar | Canvas API (`getImageData` / `putImageData`) |
| Font | `next/font/google` — Space Grotesk, Inter, IBM Plex Mono |

Tidak ada dependency eksternal untuk fungsi inti; semua kriptografi dan
pengolahan gambar memakai API bawaan browser.

## Instalasi

**Prasyarat:** Node.js 20.9 atau lebih baru.

```bash
git clone <url-repo-anda>
cd stegochan
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Penggunaan

### Menyisipkan pesan

1. Buka halaman **Sembunyikan**.
2. Unggah gambar sampul (cover image).
3. Tulis pesan yang ingin disembunyikan.
4. Masukkan password.
5. Unduh gambar PNG hasil.

### Mengungkap pesan

1. Buka halaman **Ungkap**.
2. Unggah gambar stego.
3. Masukkan password yang sama dengan saat penyisipan.
4. Pesan akan ditampilkan jika password benar dan data tidak rusak.

## Format Paket Data

Data yang disisipkan mengikuti struktur biner berikut:

| Field | Panjang | Keterangan |
|---|---|---|
| Magic bytes | 4 byte | Penanda `"STG1"` |
| Versi | 1 byte | Versi format paket |
| Salt | 16 byte | Untuk derivasi kunci PBKDF2 |
| IV | 12 byte | Nonce untuk AES-GCM |
| Panjang ciphertext | 4 byte | Unsigned 32-bit, big-endian |
| Ciphertext | variabel | Pesan terenkripsi + auth tag GCM (16 byte) |

## Batasan

- **Hanya PNG yang aman digunakan sebagai output.** Data akan rusak jika
  gambar hasil dikompresi ulang secara lossy (mis. diunggah ke WhatsApp,
  Instagram, atau platform lain yang memampatkan gambar).
- **Kapasitas terbatas oleh resolusi gambar.** Kapasitas maksimum kira-kira
  `(lebar × tinggi × 3) / 8` byte, dikurangi overhead header.
- **Belum tahan terhadap steganalisis lanjutan.** Urutan penyisipan saat ini
  masih sekuensial (belum diacak berdasarkan password), sehingga secara
  teoretis lebih mudah dianalisis dibanding skema LSB adaptif.
- **Dimensi gambar dibatasi** hingga 4000×4000 piksel untuk menjaga performa
  di sisi browser.

## Roadmap

- [ ] Penyebaran posisi piksel acak (PRNG yang di-seed dari password)
- [ ] Pemrosesan di Web Worker untuk gambar berukuran besar
- [ ] Dukungan penyisipan file (bukan hanya teks), dengan kompresi payload
- [ ] Unit test dan property test (Vitest + fast-check)
- [ ] Metrik kualitas visual (PSNR/SSIM) antara gambar asli dan gambar stego
- [ ] Dukungan domain JPEG (DCT) sebagai alternatif LSB

## Kontribusi

1. Fork repositori ini dan buat branch baru: `feat/nama-fitur`.
2. Pastikan `npm run lint` dan `npm run build` berjalan tanpa error.
3. Ajukan Pull Request dengan deskripsi perubahan yang jelas.

Perubahan pada kontrak antarmuka di `lib/stego/types.ts` sebaiknya
didiskusikan terlebih dahulu sebelum diimplementasikan, karena berdampak
pada seluruh lapisan yang bergantung padanya.

## Lisensi

Belum ditentukan — tambahkan lisensi pilihan Anda (mis. MIT) sebelum
proyek ini dipublikasikan.
