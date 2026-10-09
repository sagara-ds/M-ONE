# ZIP di GitHub

## Versi 12 misi — branch main

Untuk kode terbaru versi 0.2.0, gunakan [ZIP branch main](https://github.com/sagara-ds/M-ONE/archive/refs/heads/main.zip). Ekstrak ZIP, buka terminal pada folder hasil ekstrak, lalu jalankan `npm run build` dan `npm run preview`. ZIP GitHub source tidak memuat `dist/`; build membuat folder hosting tersebut. Arsip branch `downloads` di bawah tetap snapshot enam misi, bukan versi 12 misi.

Verifikasi 9 Oktober 2026 pada commit aplikasi `5b477196bdb16d46ccedfd7208960eceb303ea64`: push main berhasil, SHA remote cocok, unduhan ZIP HTTP 200 (1.388.013 byte), ZIP valid, dan `src/missions.js`, `src/progress.js`, `src/app.js`, `src/style.css`, serta laporan browser identik dengan berkas lokal yang diuji. Commit dokumentasi sesudahnya menambahkan catatan verifikasi; source aplikasi tetap sama.

## Riwayat arsip enam misi

Pengunggahan dilakukan atas permintaan pengguna pada 8 Oktober 2026.

- Folder: https://github.com/sagara-ds/M-ONE/tree/downloads/downloads
- Proyek lengkap: https://github.com/sagara-ds/M-ONE/raw/refs/heads/downloads/downloads/Detektif-Bug-suara-animasi.zip
- Paket hosting: https://github.com/sagara-ds/M-ONE/raw/refs/heads/downloads/downloads/Detektif-Bug-hosting.zip

Branch `downloads`, commit `74253e655b3034f3a331685d27506f0caac8ba59`, mempertahankan empat commit asli dan menambahkan dua ZIP, README unduhan, serta SHA256SUMS. Source pada root branch ini adalah snapshot original; source penyempurnaan terdapat dalam ZIP lengkap.

Verifikasi nyata: `git push` berhasil, `git ls-remote` mengembalikan SHA yang sama, kedua URL unduhan merespons HTTP 200 dan SHA-256 cocok byte-for-byte dengan ZIP lokal. Halaman folder dapat diakses tanpa login dan metadata GitHub menyatakan repository public.

Arsip tetap snapshot saat dibuat; doc status di dalam ZIP mendahului pengunggahan ini. Website belum di-deploy ke hosting. Pengunggahan ZIP dan hosting website merupakan tindakan berbeda.

## Pembaruan preview

Commit `61caa1d3b7c9d8fc18513a92de2612d548d4d85f` memperbarui ZIP proyek serta `scripts/preview.mjs` untuk menangani port sibuk. Push berhasil secara fast-forward; unduhan ZIP dan skrip dari URL commit ini masing-masing HTTP 200 dengan SHA-256 identik berkas lokal. Sembilan pemeriksaan preview lulus pada cloud Linux. ZIP hosting tidak berubah karena source aplikasi tidak diubah.
