# StegoCHAN

**Steganography Covert Hiding of Assets in Noise** — aplikasi web steganografi citra LSB dengan enkripsi AES-256-GCM, pengacakan posisi berbasis stego-key, varian m-bit (1/2/3), dan pengujian massal otomatis ke Excel.

Tugas Proyek Aplikasi Kriptografi · **Topik B. Steganografi** + pengayaan **varian m-bit LSB beserta analisis trade-off kapasitas–PSNR** · Mata kuliah Keamanan Informasi, Program Studi Informatika, Fakultas Teknik, Universitas Siliwangi.

> Seluruh proses embed, ekstrak, dan uji berjalan **100% di browser** (Web Crypto API + Canvas API). Tidak ada backend, database, atau upload ke server.

---

## Daftar Isi

- [Fitur](#fitur)
- [Arsitektur & Cara Kerja](#arsitektur--cara-kerja)
- [Teknologi](#teknologi)
- [Instalasi & Menjalankan](#instalasi--menjalankan)
- [Penggunaan](#penggunaan)
- [Format Paket Data](#format-paket-data)
- [Kapasitas & Kualitas](#kapasitas--kualitas)
- [Pengujian & Excel](#pengujian--excel)
- [Keamanan & Batasan](#keamanan--batasan)
- [Struktur Proyek](#struktur-proyek)
- [Tim](#tim)

---

## Fitur

**Steganografi inti**

- Embed dan ekstrak pesan teks pada citra **PNG/JPG** (output selalu **PNG lossless** agar bit LSB utuh).
- Varian **m-bit LSB (1, 2, 3 bit per kanal R/G/B)** — 2-bit memberi ±2× kapasitas, 3-bit ±3× kapasitas dibanding 1-bit.
- Header biner berisi magic, versi, mode, salt, IV, dan panjang ciphertext — ekstraksi berhenti tepat tanpa menebak.
- Posisi penyisipan **diacak dengan PRNG + Fisher–Yates** dari stego-key, bukan traversal linear.
- Validasi kapasitas otomatis — pesan yang melebihi daya tampung ditolak sebelum embed.

**Kriptografi**

- **AES-256-GCM** (ciphertext + tag autentikasi 16 byte): password salah atau 1 bit diubah → dekripsi ditolak.
- Kunci diturunkan via **PBKDF2-HMAC-SHA256, 600.000 iterasi**, salt acak 16 byte; IV/nonce acak 12 byte setiap embed (Web Crypto API).

**Evaluasi & steganalisis**

- Tampilan **cover vs stego berdampingan**, metrik **MSE & PSNR** (ambang layak ≥ 30 dB), panel **trade-off 1-bit vs mode terpilih**.
- **Histogram R/G/B** cover vs stego dan **visualisasi bidang LSB**.
- Halaman **Uji Massal (`/batch`)**: multi-cover × 3 pesan × 3 mode → tabel MSE/PSNR + ekspor **XLSX** (`PSNR_MSE`, `Uji_JPEG`, `Metadata`) dan CSV.

---

## Arsitektur & Cara Kerja

Aplikasi Next.js App Router tanpa backend. Alur inti berada di `lib/stego/index.ts:hideMessage` dan `lib/stego/index.ts:revealMessage`.

```text
Embed:   Teks → AES-GCM → paket [header + ciphertext] → bit stream
         → sebar ke LSB channel sesuai urutan PRNG(seed) → ImageData stego → PNG
Extract: Stego → urutan PRNG(seed) → baca header (auto-deteksi 1/2/3-bit)
         → baca ciphertext → verifikasi + dekripsi AES-GCM → teks asli
Batch:   N cover × 3 pesan × mode terpilih → MSE/PSNR per kombinasi → XLSX
```

Detail penting yang perlu dipahami:

1. **Satu fase, satu mode.** Seluruh paket (header + ciphertext) ditanam dengan `bitsPerChannel` yang sama. Ekstraksi mencoba kandidat `1, 2, 3` dan memakai yang header-nya valid (magic `STG1`, versi, dan mode cocok).
2. **Setiap embed unik.** Salt dan IV acak membuat ciphertext dan urutan bit berbeda walau pesan dan password sama.
3. **Alpha tidak disentuh** dan dipaksa `255` saat decode agar premultiplikasi kanvas tidak merusak LSB RGB.

---

## Teknologi

| Lapisan             | Teknologi                                                     |
| ------------------- | ------------------------------------------------------------- |
| Framework / bahasa  | Next.js 16 (App Router), React 19, TypeScript                 |
| UI                  | CSS kustom, navigasi sinematik, grafik histogram mandiri      |
| Kriptografi         | Web Crypto API: AES-256-GCM, PBKDF2-HMAC-SHA256               |
| Citra               | Canvas API + `ImageData`                                      |
| Steganografi        | LSB m-bit tulisan sendiri + PRNG/Fisher–Yates tulisan sendiri |
| Uji massal & ekspor | `xlsx` (SheetJS) via dynamic import, CSV manual               |
| Uji unit            | Vitest (12 test: bits, capacity, crypto, header, lsb)         |

---

## Instalasi & Menjalankan

Prasyarat: **Node.js 20+** dan npm.

```bash
git clone https://github.com/<username>/stegochan.git
cd stegochan
npm install
npm run dev
```

Buka `http://localhost:3000`. Perintah lain:

```bash
npm test        # vitest, 12 unit test fungsi inti
npm run lint    # eslint
npm run build && npm start  # build produksi
```

> Jalankan lewat `localhost` atau HTTPS agar Web Crypto API tersedia.

---

## Penggunaan

### 1. Embed — `/embed`

1. Unggah cover PNG/JPG (maks 20 MB).
2. Pilih mode **1/2/3-bit**, tulis pesan, isi password/stego-key.
3. Tekan **Embed pesan**. Jika pesan melebihi kapasitas, pesan error kapasitas muncul beserta angka byte.
4. Bandingkan cover vs stego, catat **MSE/PSNR**, histogram, dan bidang LSB. Unduh hasil via **Unduh PNG**.

### 2. Extract — `/extract`

1. Unggah stego PNG + password yang sama.
2. Tekan **Ungkap pesan**. Mode m-bit terdeteksi otomatis dari header.
3. Kunci salah atau citra rusak → error `NO_DATA_FOUND` / `WRONG_PASSWORD` (lihat [Keamanan & Batasan](#keamanan--batasan)).

### 3. Uji massal — `/batch`

1. **Blok 1:** tambah beberapa cover (disarankan 5).
2. **Blok 2:** siapkan 3 pesan (`100 B / 1 KB / 5 KB`, bisa diedit), centang mode, isi satu password untuk semua run.
3. Tekan **Jalankan N kombinasi** (over-kapasitas otomatis `SKIP`), pantau progres dan rata-rata PSNR per mode.
4. **Unduh XLSX/CSV** untuk bahan BAB V laporan.

---

## Format Paket Data

Byte stream yang benar-benar ditanam (`lib/stego/header.ts:buildPacket`):

| Field              | Panjang            | Keterangan                            |
| ------------------ | ------------------ | ------------------------------------- |
| Magic              | 4 byte             | ASCII `STG1` (`53 54 47 31`)          |
| Versi              | 1 byte             | `1` (legacy, khusus 1-bit) atau `2`   |
| Mode LSB           | 1 byte\*           | `1/2/3`, hanya ada pada versi 2       |
| Salt               | 16 byte            | Derivasi kunci PBKDF2                 |
| IV                 | 12 byte            | Nonce AES-GCM                         |
| Panjang ciphertext | 4 byte             | `uint32` big-endian                   |
| Ciphertext + tag   | variabel + 16 byte | Hasil AES-GCM beserta tag autentikasi |

Header tetap: **37 byte** (1-bit) atau **38 byte** (2/3-bit). Kapasitas usable = kapasitas mentah − header − tag GCM.

---

## Kapasitas & Kualitas

```text
Kapasitas_mentah  = floor(W × H × 3 × m / 8)   byte
Kapasitas_usable  = Kapasitas_mentah − header(m) − 16   byte
MSE  = (1/n) × Σ (cover_i − stego_i)²,  n = W × H × 4 (RGBA)
PSNR = 10 × log10(255² / MSE)   dB
```

Contoh citra 512×512 mode 1-bit: mentah 98.304 B, usable ±98.251 B. Menaikkan `m` melipatgandakan kapasitas tetapi menurunkan PSNR karena 2–3 bit terbawah diubah, bukan 1 bit. Ambang visual mengikuti materi kuliah: **PSNR ≥ 30 dB**.

---

## Pengujian & Excel

Halaman `/batch` menghasilkan workbook `StegoChan_Uji_<waktu>.xlsx`:

| Sheet      | Isi relevan                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `PSNR_MSE` | Tabel utama: No, Citra, Dimensi, Mode m, Pesan, Byte, MSE, PSNR, Lolos 30dB, Status                                                    |
| `Uji_JPEG` | Template kerapuhan: kontrol PNG (berhasil) + baris JPG Q70 untuk diisi manual (stego → save JPG → extract di `/extract` → catat gagal) |
| `Metadata` | Waktu uji, daftar citra/pesan, total OK/SKIP/FAIL                                                                                      |

Protokol yang disarankan untuk laporan: **5 citra × 3 pesan × 3 mode**, 1 password tetap, lalu buat grafik kapasitas vs PSNR dari sheet `PSNR_MSE`. Histogram dan bidang LSB tidak diangkakan di Excel — sertakan sebagai screenshot berdampingan di laporan dengan verdict (`nyaris identik` / `geser ringan`).

---

## Keamanan & Batasan

- **Kunci salah bermakna ganda.** Karena password sekaligus menjadi seed PRNG, kunci yang salah mengacak ulang urutan baca → umum muncul `NO_DATA_FOUND`. Error `WRONG_PASSWORD` murni hanya terlihat bila seed benar tetapi password dekripsi salah (mis. stego-key dipisah).
- **Jangan simpan ulang stego sebagai JPEG.** Kompresi DCT-kuantisasi menghancurkan LSB; ekstraksi dipastikan gagal. Ini justru bahan uji kerapuhan.
- **Bukan skema adaptif/robust.** Proteksi mengandalkan enkripsi + pengacakan posisi; tidak tahan steganalisis statistik lanjut (chi-square) atau kompresi.
- Tidak ada kunci, password, atau kunci privat di dalam kode maupun repo.

---

## Struktur Proyek

```text
app/
  page.tsx                 # landing
  embed/page.tsx           # embed + metrik + histogram + LSB
  extract/page.tsx         # ekstrak + preview bidang LSB
  batch/page.tsx           # orkestrator uji massal (tipis)
  batch/components/        # CoverSection, MessageSection, BatchActions, SummaryCards, ResultsTable
lib/
  image.ts                 # decode PNG/JPG → ImageData, ekspor PNG
  stego/                   # bits, capacity, crypto, header, lsb, histogram, lsb-plane, index
  batch/                   # types, utils, image-loader, runner, export (logika /batch)
hooks/useImageSelection.ts # state gambar + preview sekali pakai
components/                # navigasi, histogram chart, dropzone, alert
```

---

## Tim

| Nama                        | NPM          |
| --------------------------- | ------------ |
| Muhammad Rifki Yusria Hatta | 247006111065 |
| Yasraf Syifa Maulana        | 247006111070 |
| Fadhel Mohammad Syarushiam  | 247006111074 |
