# ZIP di GitHub

## Versi 12 misi — branch main

Untuk kode terbaru versi 0.2.0, gunakan [ZIP branch main](https://github.com/sagara-ds/M-ONE/archive/refs/heads/main.zip). Ekstrak ZIP, buka terminal pada folder hasil ekstrak, lalu jalankan `npm run build` dan `npm run preview`. ZIP GitHub source tidak memuat `dist/`; build membuat folder hosting tersebut. Arsip historis di bawah tetap snapshot enam misi, bukan versi 12 misi.

Verifikasi 9 Oktober 2026 pada commit aplikasi `5b477196bdb16d46ccedfd7208960eceb303ea64`: push main berhasil, SHA remote cocok, unduhan ZIP HTTP 200 (1.388.013 byte), ZIP valid, dan `src/missions.js`, `src/progress.js`, `src/app.js`, `src/style.css`, serta laporan browser identik dengan berkas lokal yang diuji. Commit dokumentasi sesudahnya menambahkan catatan verifikasi; source aplikasi tetap sama.

## Riwayat arsip enam misi

Pengunggahan dilakukan atas permintaan pengguna pada 8 Oktober 2026.

- [Folder arsip pada commit asli](https://github.com/sagara-ds/M-ONE/tree/61caa1d3b7c9d8fc18513a92de2612d548d4d85f/downloads).
- [ZIP proyek enam misi](https://github.com/sagara-ds/M-ONE/raw/61caa1d3b7c9d8fc18513a92de2612d548d4d85f/downloads/Detektif-Bug-suara-animasi.zip).
- [ZIP hosting enam misi](https://github.com/sagara-ds/M-ONE/raw/61caa1d3b7c9d8fc18513a92de2612d548d4d85f/downloads/Detektif-Bug-hosting.zip).

Branch `downloads`, commit `74253e655b3034f3a331685d27506f0caac8ba59`, mempertahankan empat commit asli dan menambahkan dua ZIP, README unduhan, serta SHA256SUMS. Source pada root branch ini adalah snapshot original; source penyempurnaan terdapat dalam ZIP lengkap.

Verifikasi nyata: `git push` berhasil, `git ls-remote` mengembalikan SHA yang sama, kedua URL unduhan merespons HTTP 200 dan SHA-256 cocok byte-for-byte dengan ZIP lokal. Halaman folder dapat diakses tanpa login dan metadata GitHub menyatakan repository public.

Arsip tetap snapshot saat dibuat; doc status di dalam ZIP mendahului pengunggahan ini. Website belum di-deploy ke hosting. Pengunggahan ZIP dan hosting website merupakan tindakan berbeda.

## Pembaruan preview

Commit `61caa1d3b7c9d8fc18513a92de2612d548d4d85f` memperbarui ZIP proyek serta `scripts/preview.mjs` untuk menangani port sibuk. Push berhasil secara fast-forward; unduhan ZIP dan skrip dari URL commit ini masing-masing HTTP 200 dengan SHA-256 identik berkas lokal. Sembilan pemeriksaan preview lulus pada cloud Linux. ZIP hosting tidak berubah karena source aplikasi tidak diubah.

## Penghapusan branch — 9 Oktober 2026

Commit merge `42ef26f3cd522a62e286e9b7a69eb98ad4f2c207` mempertahankan dua commit unik `downloads` (`74253e6`, `61caa1d`) sebagai leluhur `main`, tanpa mengganti tree aplikasi 12 misi. Setelah push dan verifikasi leluhur, default GitHub diubah peserta ke `main` dan diverifikasi melalui `git ls-remote --symref`. Push penghapusan `downloads` berhasil; hasil pemeriksaan remote hanya memuat branch `main`. Tautan arsip menggunakan SHA commit sehingga tidak bergantung pada branch yang dihapus. Tidak ada force push atau perubahan tanggal commit.

Setelah penghapusan, kedua URL commit historis diperiksa lagi: HTTP 200, ZIP valid, dan SHA-256 cocok manifest asli (`3d5eea8f…` proyek, `0dfc696e…` hosting). Ukuran masing-masing 721.559 dan 84.909 byte. Penghapusan branch tidak memutus unduhan historis ini.
