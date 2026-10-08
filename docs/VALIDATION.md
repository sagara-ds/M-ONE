# Hasil pemeriksaan nyata

Sesi penyempurnaan: **8 Oktober 2026**. Uji browser final selesai **19.15.53 WIB** (timestamp laporan `2026-10-08T12:15:53.719Z`). Target: build lokal dari `/workspace/M-ONE`, Chromium headless.

## Hasil

| Pemeriksaan | Hasil | Bukti |
| --- | --- | --- |
| `npm run test:missions` | **27 kasus lulus**, 6 misi | `scripts/verify-missions.mjs` |
| `npm run build` | **Berhasil**, source/audio/font/favicon tersalin ke `dist/` | `scripts/build.mjs` |
| Runner browser | **30 lulus, 0 gagal** | `docs/browser-results.json`, `scripts/verify-browser.mjs` |
| Exception/console error browser | **0** | Laporan browser |
| Request browser gagal | **0** | Laporan browser |
| History Git original | Bundle valid, history lengkap | `docs/provenance/original-history.bundle`, `docs/PROVENANCE.md` |

Uji mesin mencakup jawaban benar serta program awal salah pada keenam misi, posisi setiap langkah, pengulangan atomik dan indeks kartu, solusi alternatif, belokan, empat batas peta, ambil/antar di posisi salah, program kosong, serta input yang tidak termutasi.

Setelah uji browser, isi `install_script` yang disimpan juga dijalankan utuh: Node v24.19.0, 27 kasus lulus, build berhasil. Server yang dimulai sesi ini direstart dengan skrip preview terbaru. Halaman, app.js, feedback.js, style.css, favicon.svg, dan font WOFF2 masing-masing merespons HTTP 200 dengan MIME yang sesuai. Source aplikasi tidak diubah setelah uji browser final; hash source tersimpan di `source-manifest.sha256`.

Uji browser memakai klik UI nyata untuk menyusun dan menjalankan keenam solusi. Setiap langkah memeriksa posisi, arah, buku, dan kartu aktif terhadap hasil simulasi. Selain itu: tiga petunjuk, reset, pengulangan 1/3–3/3, Jeda/Lanjutkan, pembatalan timer percobaan lama, progres setelah reload, preferensi, gerak tenang/reduced-motion, serta lebar **375, 768, 1024, dan 1440px** tanpa scroll mendatar. Pada 375px, tombol Jalankan membuat peta terlihat dan fokus berada di panel simulasi.

Animasi perpindahan diperiksa dari perubahan posisi DOM antarp petak; token tetap node yang sama. Rotasi kiri dari timur bernilai −90°, kemudian kanan kembali 0°. Hasil ini membuktikan transisi yang mengikuti perintah, bukan sekadar adanya kelas CSS animasi.

Web Audio asli dibuat setelah klik opt-in, mencapai state `running`, dan menjadwalkan oscillator dengan frekuensi yang diharapkan. Ketika dimatikan, tidak ada oscillator baru. Volume, pilihan suara/bacaan, kecepatan, dan gerak tenang bertahan setelah reload; audio tidak otomatis mulai pada reload. Fallback narasi diperiksa dengan daftar suara English-only yang sengaja diinjeksikan: tidak membacakan bahasa lain dan menampilkan pesan bahasa Indonesia belum tersedia.

## Masalah yang ditemukan dan diperbaiki

- Timer percobaan lama masih dapat berjalan setelah reset: kini dibatalkan serta dilindungi token versi run, termasuk timer hasil akhir.
- Render seluruh halaman setiap langkah menghapus token robot: pembaruan playback sekarang mempertahankan node dan mengubah posisi saja.
- Rotasi arah yang dinormalisasi membuat kiri terlihat seperti kanan 270°: sudut kini mengikuti belokan kumulatif −90/+90°.
- Caption berhasil masih “membawa buku”: status diantar kini diutamakan.
- Petunjuk misi 6 menyebut jarak keliru: kini meminta menghitung jarak sebenarnya, tanpa jawaban lengkap. Petunjuk juga memilih kategori kesalahan pertama dari simulasi (ambil, antar, tepi peta).
- Ponsel 375px memiliki overflow sekitar 16px: minimum track grid kini nol dan sidebar dapat menyusut.
- Request font eksternal gagal di cloud: font resmi disimpan lokal beserta lisensinya; semua request browser final berhasil.
- Pesan narasi tidak tersedia hilang ketika gerak tenang dipilih: pesan kini tetap terlihat.
- Tombol Jalankan berada di bawah peta sehingga gerak dapat terlewat: viewport kini diarahkan ke peta, dan hasil dipindahkan ke panel peta.

Screenshot [ponsel](screenshots/mobile-375.png) dan [desktop](screenshots/desktop-board.png) diambil dalam run otomatis. Tampilan 6/6 berasal dari misi yang diselesaikan runner, bukan bukti uji anak.

## Batas bukti dan pekerjaan di luar sesi ini

- **Bunyi belum didengarkan manusia.** Headless memverifikasi penjadwalan API, bukan kualitas, kenyamanan volume, atau speaker perangkat. Coba langsung pada ponsel/komputer sebelum submit.
- Bacaan dengan suara Indonesia asli dan kualitas pengucapannya belum diuji pada perangkat peserta. Ini bergantung pada browser/OS; teks selalu tersedia.
- Belum ada uji anak/guru. Manfaat belajar tetap hipotesis; gunakan `TEST_GUIDE.md` untuk observasi nyata.
- Belum ada deployment publik atau verifikasi repository public. Workflow GitHub Pages dan `dist/` disiapkan; lihat `DEPLOYMENT.md`.
- Log chat GPT-5.6 Luna yang tidak diberikan belum dapat dinyatakan lengkap. Jangan mengarang bagian yang hilang.
- Draft lingkungan menyimpan `install_script` dan `start_skill`; penyimpanan tidak berarti environment sudah dipublikasikan atau snapshot telah diuji di task baru.
