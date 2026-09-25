# StegoChan

StegoChan adalah aplikasi steganografi modern yang memungkinkan Anda menyembunyikan pesan rahasia di dalam gambar tanpa mengirim data ke server. Seluruh proses enkripsi, penyisipan, dan pengungkapan pesan dilakukan langsung di browser pengguna.

Dengan pendekatan keamanan berbasis browser, StegoChan menempatkan kontrol penuh kepada pengguna: tidak ada upload ke backend, tidak ada penyimpanan server, dan tidak ada data yang dikirim ke pihak ketiga.

## Fitur utama

- Enkripsi pesan menggunakan password personal
- Penyisipan pesan ke bit paling rendah (LSB) pada gambar
- Ekstraksi pesan dari gambar stego dengan password yang sama
- Proses berjalan sepenuhnya di sisi klien
- Mendukung ekspor hasil gambar dalam format PNG untuk menjaga integritas data
- Antarmuka yang sederhana, modern, dan fokus pada keamanan

## Cara kerja aplikasi

StegoChan bekerja dengan prinsip steganografi:

1. Pesan Anda dienkripsi terlebih dahulu.
2. Data hasil enkripsi disisipkan ke dalam piksel gambar dengan teknik LSB.
3. Gambar hasil penyisipan tetap terlihat normal secara visual.
4. Untuk membuka pesan, pengguna cukup mengunggah gambar stego dan memasukkan password yang sama.

> penting: file gambar yang sudah dikompres ulang oleh aplikasi lain seperti WhatsApp, Instagram, atau platform media sosial bisa merusak data tersembunyi di dalamnya. Gunakan file PNG asli yang dihasilkan oleh aplikasi ini.

## Persyaratan

- Node.js 18+
- npm atau package manager lain yang kompatibel
- Browser modern (Chrome, Edge, Firefox, Safari)

## Instalasi

Clone repositori ini:

```bash
git clone https://github.com/your-username/stegochan.git
cd stegochan
```

Install dependency:

```bash
npm install
```

Jalankan aplikasi dalam mode pengembangan:

```bash
npm run dev
```

Buka browser dan akses:

```text
http://localhost:3000
```

## Tutorial penggunaan aplikasi

### 1. Menyembunyikan pesan ke dalam gambar

1. Buka halaman utama aplikasi.
2. Klik menu "Sembunyikan".
3. Pilih file gambar cover yang ingin digunakan sebagai media penyembunyian.
4. Tulis pesan rahasia yang ingin disembunyikan pada kolom teks.
5. Masukkan password untuk mengenkripsi pesan.
6. Tekan tombol "Sembunyikan pesan".
7. Tunggu proses embedding selesai.
8. Lihat pratinjau hasil stego dan klik "Unduh PNG" untuk menyimpan file gambar yang berisi pesan tersembunyi.

### 2. Mengungkap pesan dari gambar stego

1. Buka menu "Ungkap".
2. Unggah gambar hasil stego yang sudah dibuat sebelumnya.
3. Masukkan password yang sama dengan saat proses penyisipan.
4. Klik tombol "Ungkap pesan".
5. Pesan rahasia akan muncul di layar setelah proses dekripsi selesai.

### 3. Tips penggunaan yang aman

- Gunakan password yang kuat dan unik.
- Simpan password di tempat yang aman.
- Hindari mengunggah gambar yang sudah dikompres ulang ke media sosial sebelum proses ekstraksi.
- Selalu gunakan file PNG hasil ekspor dari aplikasi ini.
- Jangan membagikan password sekaligus dengan file gambar stego.

## Struktur proyek

```text
stegochan/
├── app/
│   ├── embed/
│   ├── extract/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── hooks/
├── lib/
├── public/
├── package.json
├── next.config.ts
├── tsconfig.json
├── README.md
└── eslint.config.mjs
```

## Catatan keamanan

StegoChan dirancang untuk kebutuhan penyembunyian pesan yang sederhana, aman secara lokal, dan tidak bergantung pada server. Namun, penggunaan terbaik tetap pada tanggung jawab pengguna. Pastikan:

- password tidak mudah ditebak
- file gambar tidak dipindahkan ke layanan yang melakukan kompresi
- pesan sensitif tidak dibagikan dalam bentuk plaintext di luar saluran aman

## Lisensi

Proyek ini dibuat untuk kebutuhan demonstrasi dan penggunaan pribadi. Silakan sesuaikan lisensi sesuai kebutuhan pengembangan Anda.

## Tentang proyek

StegoChan menghadirkan kombinasi antara keamanan, privasi, dan kemudahan dalam satu aplikasi browser. Dirancang untuk pengguna yang menginginkan cara modern dalam menyembunyikan pesan tanpa meninggalkan jejak di server.
