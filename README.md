# Detektif Bug

Website belajar coding untuk anak kelas 3–5 SD. Anak membantu robot mengantar buku ke perpustakaan dengan menemukan dan memperbaiki kesalahan pada kartu perintah.

## Status

Versi pertama berisi enam misi tentang urutan dan pengulangan, simulasi robot, petunjuk bertahap, kontrol susunan kartu, tombol ulangi, dan penyimpanan progres di perangkat.

Penyempurnaan: robot bergerak antarp petak, kartu aktif dan hitungan ulang terlihat, buku ikut dibawa, serta ada perayaan singkat ketika berhasil. Tombol **Satu langkah** dan **Jeda** membantu mengamati. Efek suara, bacaan bahasa Indonesia, volume, kecepatan, dan gerak tenang dapat diatur; pilihan tersimpan di perangkat.

Suara awalnya mati. Aktifkan **Suara efek** melalui tombol untuk mendengar bunyi pendek. **Bacakan** memakai suara bahasa Indonesia dari browser/perangkat bila tersedia; seluruh informasi tetap tertulis. Tidak ada musik latar, API berbayar, atau akun. Font disimpan lokal beserta lisensinya.

Hipotesis manfaat belajar belum dianggap terbukti sebelum ada uji dengan anak atau guru.

## Menjalankan lokal

Prasyarat: Node.js 18+.

```powershell
npm run build
npm run preview
```

Lalu buka alamat yang ditampilkan oleh server preview. Tanpa Node.js, file `index.html` juga dapat dilayani oleh static server sederhana.

Jika port 4173 sedang dipakai, versi preview terbaru mencoba port berikutnya sampai 4183 dan menampilkan alamat yang berhasil. Proses lain tetap berjalan. Untuk memilih port sendiri di **Command Prompt Windows**:

```bat
set "PORT=4174"
npm run preview
```

Di **PowerShell** gunakan `$env:PORT = "4174"`, lalu `npm run preview`. Jika port pilihanmu juga sibuk, ganti angkanya. Untuk menghapus pilihan port di Command Prompt, jalankan `set "PORT="`; di PowerShell, gunakan `Remove-Item Env:PORT`.

## Struktur

- `index.html` — shell halaman.
- `src/app.js` — data misi, mesin simulasi, dan interaksi.
- `src/feedback.js` — efek Web Audio dan narasi Web Speech opsional.
- `src/style.css` — token visual dan layout responsif.
- `public/fonts/` — font WOFF2 lokal dan lisensi.
- `scripts/build.mjs` — build statis tanpa bundler eksternal.
- `docs/PRD.md` — kebutuhan produk dan kriteria sukses.
- `docs/AI_GUIDE.md` — acuan AI Agent.
- `docs/PROMPT_LOG.md` — jurnal terkurasi dan log mentah.
- `docs/SESSION_PROMPTS.md` — prompt lengkap sesi penyempurnaan yang tersedia.
- `docs/VALIDATION.md` — hasil pemeriksaan aktual dan batas buktinya.
- `docs/PROVENANCE.md` — asal ZIP serta preservasi riwayat Git.
- `docs/TEST_GUIDE.md` — panduan uji anak/guru dan smoke test.
- `design-system/detektif-bug/MASTER.md` — keputusan visual hasil pencarian UI/UX.

## Perintah

```powershell
npm run test:missions
npm run build
npm run preview
```

`npm run build` membuat folder `dist/` yang siap diunggah ke static hosting. Deployment nyata, tautan repo public, dan URL hosting belum dicantumkan sampai benar-benar dilakukan dan diverifikasi.

Uji browser otomatis bersifat opsional dan memakai Playwright terpisah dari aplikasi. Contoh di cloud Linux, setelah preview berjalan (Chromium tersedia di `/usr/bin/chromium`):

```bash
npm install --prefix /tmp/detektif-tools --cache /tmp/detektif-npm-cache --no-audit --no-fund --ignore-scripts playwright
PLAYWRIGHT_MODULE=/tmp/detektif-tools/node_modules/playwright/index.mjs node scripts/verify-browser.mjs
```

Runner menyimpan hasil run baru ke `docs/browser-results.json` dan screenshot ke `docs/screenshots/`. Ia menguji lewat klik UI, tidak memasukkan jawaban langsung ke state aplikasi. Gunakan `CHROMIUM_PATH` jika lokasi browser berbeda.

## Aturan lomba yang dijadikan acuan

Panduan PPT menyebut repo harus public, website harus dapat diakses melalui hosting, docs acuan AI dan jurnal prompt harus dilampirkan, serta hasil dibuat dari nol setelah 5 Oktober 2026 pukul 09.30 WIB. Slide 5 menyebut **maksimal 5 prompt**, slide 12 menyebut **5 prompt**; klarifikasi jumlah terkurasi ke panitia. Log mentah awal–akhir tetap diperlukan. Sesi GPT sebelumnya belum tersedia lengkap. Batas submit: **15 Oktober 2026, 15.30 WIB**.

