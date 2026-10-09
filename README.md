# Detektif Bug

Website belajar coding untuk anak kelas 3–5 SD. Anak membantu robot mengantar buku ke perpustakaan dengan menemukan dan memperbaiki kesalahan pada kartu perintah.

**Website:** [sagara-ds.github.io/M-ONE](https://sagara-ds.github.io/M-ONE/). [Run deployment dan pemeriksaan hosting berhasil](https://github.com/sagara-ds/M-ONE/actions/runs/37872773713).

## Status

Versi 0.2.0 berisi **12 misi dalam tiga stage**, peta perkembangan, tiga lencana, dan rangkuman belajar. Misi 7–12 menambahkan rute baru dan rak penghalang untuk berlatih belokan serta pengulangan. Enam misi awal tetap tersedia; progres lama dibaca tanpa dihapus.

Setelah misi selesai, anak mendapat pertanyaan konsep dengan penjelasan dan kesempatan mencoba lagi. Pertanyaan tidak mengunci misi berikutnya. Lencana diberikan setelah empat misi dalam stage berhasil; memakai petunjuk tidak mengurangi penghargaan. Rangkuman membedakan jumlah misi selesai dan pertanyaan dijawab tepat. Jawaban tepat belum membuktikan manfaat belajar.

Robot bergerak antarpetak, kartu aktif dan hitungan ulang terlihat, buku ikut dibawa, serta ada perayaan singkat ketika berhasil. Tombol **Satu langkah** dan **Jeda** membantu mengamati. Efek suara, bacaan bahasa Indonesia, volume, kecepatan, dan gerak tenang dapat diatur; pilihan tersimpan di perangkat. Tombol **Cara bermain** menyediakan panduan dan contoh kartu ulang.

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
- `src/app.js` — mesin simulasi dan interaksi.
- `src/missions.js` — 12 misi, tiga stage, pertanyaan konsep, dan penjelasan.
- `src/progress.js` — penyimpanan, migrasi progres, penguncian misi, dan lencana.
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
npm test
npm run build
npm run preview
```

`npm test` memeriksa simulasi dan aturan progres. `npm run build` membuat folder `dist/` yang siap diunggah ke static hosting. Repository: [sagara-ds/M-ONE](https://github.com/sagara-ds/M-ONE/tree/main). [Unduh kode branch main](https://github.com/sagara-ds/M-ONE/archive/refs/heads/main.zip), ekstrak ZIP, lalu jalankan perintah lokal di atas. `main` adalah satu-satunya branch dan default. Arsip enam misi tetap tersedia melalui [tautan commit historis](docs/GITHUB_DOWNLOADS.md), setelah seluruh history `downloads` digabungkan ke `main`.

Workflow GitHub Pages menjalankan tes dan build setiap push ke `main`, kemudian memeriksa URL hasil deploy dan SHA-256 sepuluh aset terhadap commit yang diterbitkan. Laporan HTTP disimpan sebagai artifact `website-verification` dan ringkasan run. Status hosting dicatat di [DEPLOYMENT.md](docs/DEPLOYMENT.md).

Untuk memeriksa URL hosting yang sudah terbit, jalankan `npm run test:deployment -- https://sagara-ds.github.io/M-ONE/`. Ini adalah pemeriksaan teknis; lihat status deployment untuk hasil run nyata. Pemeriksaan browser 69 kasus dijalankan pada preview lokal dan tidak disebut sebagai uji pengguna anak/guru.

Uji browser otomatis bersifat opsional dan memakai Playwright terpisah dari aplikasi. Contoh di cloud Linux, setelah preview berjalan (Chromium tersedia di `/usr/bin/chromium`):

```bash
npm install --prefix /tmp/detektif-tools --cache /tmp/detektif-npm-cache --no-audit --no-fund --ignore-scripts playwright
PLAYWRIGHT_MODULE=/tmp/detektif-tools/node_modules/playwright/index.mjs node scripts/verify-browser.mjs
```

Runner menyimpan hasil run baru ke `docs/browser-results.json` dan screenshot ke `docs/screenshots/`. Ia menguji lewat klik UI, tidak memasukkan jawaban langsung ke state aplikasi. Gunakan `CHROMIUM_PATH` jika lokasi browser berbeda.

## Aturan lomba yang dijadikan acuan

Panduan PPT menyebut repo harus public, website harus dapat diakses melalui hosting, docs acuan AI dan jurnal prompt harus dilampirkan, serta hasil dibuat dari nol setelah 5 Oktober 2026 pukul 09.30 WIB. Slide 5 menyebut **maksimal 5 prompt**, slide 12 menyebut **5 prompt**; perbedaan jumlah dicatat untuk klarifikasi. Log mentah awal–akhir dilampirkan terpisah. Batas submit: **15 Oktober 2026, 15.30 WIB**.

[Audit per ketentuan](docs/COMPETITION_AUDIT.md) dan [paket pengumpulan](docs/SUBMISSION.md) mencatat bukti yang tersedia serta kekurangannya. Jurnal kini memuat tepat lima prompt nyata. Tanggal repository terverifikasi **8 Oktober 2026, 18.50.40 WIB**; riwayat commit tetap utuh. Peserta telah memberikan [jurnal lama dan satu prompt awal Luna lengkap](docs/raw-prompts/USER_SUPPLIED_LUNA_JOURNAL_REVIEW.md); teksnya cocok dengan history proyek. Peserta mengonfirmasi sesi Luna hanya memakai prompt itu, sehingga seluruh prompt sesi awal tersedia berdasarkan pernyataannya. Bukti urutan docs sebelum kode belum tersedia. [Tautan sumber chat](docs/raw-prompts/GPT56_LUNA_SOURCE.md) tetap belum terbaca dari cloud karena CONNECT 403.

