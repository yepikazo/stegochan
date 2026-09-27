# StegoChan

**C**overt **H**iding of **A**ssets in **N**oise

StegoChan adalah aplikasi web untuk menyembunyikan pesan di dalam citra menggunakan teknik steganografi LSB (Least Significant Bit) dengan tambahan lapisan keamanan dan validasi. Proses penyisipan, enkripsi, dan ekstraksi berjalan sepenuhnya di sisi klien dalam browser, tanpa mengirim data ke server apapun.

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Cara Kerja](#cara-kerja)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Instalasi](#instalasi)
- [Penggunaan](#penggunaan)
- [Format Paket Data](#format-paket-data)
- [Kapasitas dan Evaluasi Kualitas](#kapasitas-dan-evaluasi-kualitas)
- [Batasan](#batasan)
- [Roadmap](#roadmap)

## Fitur Utama

- **LSB steganography pada citra PNG/BMP** — pesan disisipkan ke bit paling tidak signifikan dari piksel gambar.
- **Enkripsi end-to-end** — pesan dienkripsi menggunakan AES-GCM sebelum disisipkan ke dalam cover image. Password digunakan untuk menghasilkan kunci dan juga seed urutan piksel.
- **Header penanda panjang pesan** — setiap payload memiliki informasi struktur yang memungkinkan proses ekstraksi membaca panjang data secara aman sebelum dekripsi.
- **Posisi piksel diacak menggunakan PRNG** — urutan embedding dan extraction berbasis seed dari stego-key, sehingga traversal piksel tidak lagi linear.
- **Validasi kapasitas otomatis** — aplikasi menghitung kapasitas gambar dan menolak payload yang melebihi batas sebelum proses penyisipan dimulai.
- **Tampilan cover dan stego berdampingan** — hasil penyisipan dapat dilihat langsung dalam satu tampilan agar pengguna bisa membandingkan perubahan.
- **Metrik kualitas visual** — aplikasi menampilkan MSE dan PSNR untuk membandingkan cover dan stego image.
- **Password toggle Show/Hide** — field password bisa ditampilkan atau disembunyikan dengan teks "Show" / "Hide" tanpa ikon visual.
- **Zero server-side processing** — seluruh proses memakai Web Crypto API dan Canvas API bawaan browser.

## Cara Kerja

```text
Sisipkan:  Pesan → Enkripsi AES-GCM → Header + Payload → PRNG order piksel → LSB embed → PNG output
Ungkap:    Gambar stego → PRNG order piksel → Baca header → Ekstrak payload → Dekripsi → Pesan asli
```

1. **Persiapan pesan** — teks diubah ke byte dan dienkripsi dengan password.
2. **Pembuatan paket** — data dienkripsi dikemas bersama metadata seperti salt, IV, dan panjang payload untuk keperluan ekstraksi yang aman.
3. **Urutan piksel teracak** — `stegoKey` dipakai sebagai seed untuk menciptakan urutan piksel yang berbeda-beda, bukan sekadar traversal linear.
4. **Penyisipan LSB** — bit payload ditulis ke bit paling tidak signifikan piksel yang sudah diacak.
5. **Ekstraksi** — proses dibalik: ambil bit dari posisi yang sama, baca header, ekstrak ciphertext, lalu dekripsi menggunakan password yang sama.
6. **Validasi** — aplikasi mengecek kapasitas, menampilkan hasil visual, serta mengukur kualitas stego image dengan MSE dan PSNR.

## Teknologi yang Digunakan

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Interface | React 19 + CSS custom |
| Kriptografi | Web Crypto API — AES-GCM, PBKDF2 |
| Manipulasi citra | Canvas API + ImageData |
| Steganografi | LSB dengan urutan piksel berbasis PRNG |
| Evaluasi kualitas | MSE dan PSNR |

Semua proses inti dilakukan di browser tanpa backend atau database.

## Instalasi

Prasyarat: Node.js 20 atau versi yang lebih baru.

```bash
git clone <url-repository>
cd stegochan
npm install
npm run dev
```

Buka alamat berikut di browser:

```text
http://localhost:3000
```

## Penggunaan

### 1. Menyisipkan pesan

1. Buka halaman **Embed**.
2. Unggah cover image.
3. Masukkan pesan yang ingin disembunyikan.
4. Masukkan password / stego-key.
5. Tekan **Embed pesan**.
6. Lihat hasil cover dan stego secara berdampingan.
7. Unduh output dalam format PNG.

### 2. Mengekstraksi pesan

1. Buka halaman **Extract**.
2. Unggah stego image.
3. Masukkan password yang sama saat proses embedding.
4. Tekan **Extract pesan**.
5. Aplikasi akan menampilkan pesan asli jika password dan data valid.

### 3. Password toggle

Pada kedua halaman, field password dapat diubah mode tampilannya dengan tombol **Show** dan **Hide**. Ini memudahkan pengguna untuk melihat atau menyembunyikan input password tanpa ikon mata.

## Format Paket Data

Payload yang disisipkan mengikuti struktur biner yang terdefinisi untuk menjaga integritas dan keandalan ekstraksi.

| Field | Panjang | Keterangan |
|---|---|---|
| Magic bytes | 4 byte | Penanda format paket |
| Versi | 1 byte | Format versi data |
| Salt | 16 byte | Digunakan untuk derivasi kunci PBKDF2 |
| IV | 12 byte | Nonce AES-GCM |
| Panjang ciphertext | 4 byte | Ukuran payload terenkripsi |
| Ciphertext | variabel | Data terenkripsi + autentikasi tag |

Dengan format ini, proses ekstraksi dapat membaca header terlebih dahulu, memastikan panjang data, lalu melakukan dekripsi jika password benar.

## Kapasitas dan Evaluasi Kualitas

- **Kapasitas maksimum** dihitung berdasarkan dimensi gambar dan jumlah bit yang dapat digunakan untuk menyisipkan payload.
- **Validasi otomatis** menolak pesan yang melebihi kapasitas gambar yang dipilih.
- **Analisis kualitas** dilakukan dengan dua metrik utama:
  - MSE (Mean Squared Error)
  - PSNR (Peak Signal-to-Noise Ratio)
- **Tampilan hasil** membandingkan cover image dan stego image secara langsung, sehingga pengguna dapat mengevaluasi perubahan visual dengan lebih mudah.

## Batasan

- **Output terbaik berupa PNG** karena format ini bersifat lossless dan menjaga integritas bit LSB.
- **Penggunaan JPEG tidak disarankan untuk hasil akhir** karena kompresi lossy dapat merusak bit yang disisipkan.
- **Kapasitas terbatas** oleh resolusi gambar. Semakin besar ukuran citra, semakin banyak data yang bisa disembunyikan.
- **Keamanan bergantung pada password** — password yang salah akan menghasilkan dekripsi yang gagal dan mencegah pembacaan payload asli.
- **Steganalisis lanjutan masih terbatas** — proteksi saat ini berfokus pada enkripsi dan urutan piksel acak, bukan pada skema adaptif yang lebih kompleks.

## Roadmap

- [x] LSB steganography dengan enkripsi payload
- [x] Header untuk panjang data dan validasi ekstraksi
- [x] Urutan piksel acak berbasis PRNG dan stego-key
- [x] Kapasitas dan validasi ukuran pesan
- [x] Tampilan cover dan stego berdampingan
- [x] Metrik MSE dan PSNR
- [x] Toggle password dengan teks Show/Hide
- [ ] Uji coba lebih lanjut pada beberapa citra dan ukuran payload
- [ ] Analisis histogram dan perbandingan visual lanjutan
- [ ] Uji ketahanan terhadap format lossy seperti JPEG
- [ ] Fitur tambahan seperti LSB adaptif atau analisis steganalisis lanjutan
