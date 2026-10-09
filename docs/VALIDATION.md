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
- Pada sesi 8 Oktober, deployment/public repo belum diverifikasi. Repository public kemudian diverifikasi pada sesi upload; status hosting terbaru ada di `DEPLOYMENT.md`.
- Log chat GPT-5.6 Luna yang tidak diberikan belum dapat dinyatakan lengkap. Jangan mengarang bagian yang hilang.
- Draft lingkungan menyimpan `install_script` dan `start_skill`; penyimpanan tidak berarti environment sudah dipublikasikan atau snapshot telah diuji di task baru.


## Perluasan 12 misi — 9 Oktober 2026

Run browser final pada laporan `browser-results.json`: **2026-10-09T01:38:29.047Z / 08.38.29 WIB**, Chromium headless pada build 0.2.0 lokal. Laporan menggantikan JSON run 8 Oktober; hasil lama tetap dicatat di bagian atas sebagai riwayat.

| Pemeriksaan | Hasil aktual | Bukti |
| --- | --- | --- |
| `npm test` / mesin simulasi | **65 kasus lulus**, 12 misi | `scripts/verify-missions.mjs` |
| `npm test` / progres | Lulus: migrasi enam misi, flag ketat, storage gagal, unlock, refleksi, lencana, rangkuman | `scripts/verify-progress.mjs` |
| `npm run build` | Berhasil, termasuk `missions.js` dan `progress.js` | `scripts/build.mjs`, `dist/` lokal |
| Browser | **69 lulus, 0 gagal** | `docs/browser-results.json` |
| Exception/console error | **0** | Laporan browser |
| Request browser gagal | **0** | Laporan browser |

Runner mencoba **program awal salah dan solusi melalui klik pada seluruh 12 misi**. Pada setiap langkah, posisi, arah, buku yang dibawa, dan kartu aktif dibandingkan dengan mesin simulasi. Pertanyaan konsep dijawab salah lalu benar memakai Enter; penjelasan, kesempatan mencoba lagi, penyimpanan jawaban, dan fokus keyboard diperiksa. Lencana muncul tepat setelah misi 4/8/12; stage terkunci dan tombol misi sesuai progres.

Pemeriksaan tambahan: rangkuman membedakan misi selesai dan jawaban tepat; reload mempertahankan progres dan lencana; data lama enam misi membuka misi 7 tanpa kehilangan status; data rusak atau storage diblokir tetap memungkinkan bermain; rak penghalang menahan posisi robot; peta enam kolom bergerak sesuai posisi cell; panduan yang dibuka ketika robot berjalan menjeda playback dan dapat ditutup dengan Escape. Tombol ulangi, Jeda/Lanjutkan, pembatalan timer lama, petunjuk, opt-in audio, preferensi, dan reduced-motion tetap lulus.

Layout diperiksa pada **375, 768, 1024, dan 1440px**, untuk peta awal serta misi akhir; tidak ada scroll mendatar. Screenshot dari run otomatis tersimpan di `docs/screenshots/`, termasuk peta stage desktop dan ponsel. Semua progres di screenshot berasal dari runner, bukan uji anak.

Review integrasi menemukan dua masalah yang diperbaiki sebelum run final: dialog panduan terhapus saat playback selesai dan fokus keyboard hilang ketika jawaban benar dinonaktifkan. Kini panduan menjeda robot dan jawaban benar memindahkan fokus ke penjelasannya.

Isi `install_script` cloud yang diperbarui (`node --version`, `npm test`, `npm run build`) juga dijalankan utuh dengan hasil lulus pada Node **v24.19.0**. Draft `install_script` serta `start_skill` berhasil disimpan; penyimpanan ini belum berarti snapshot cloud dipublikasikan atau diuji pada task baru. Source aplikasi yang diuji dicatat dalam `source-manifest.sha256`.

Batas bukti tetap berlaku: belum ada uji anak/guru; bunyi belum didengarkan manusia; pengucapan suara Indonesia asli bergantung perangkat; belum ada pengujian Windows langsung; manfaat belajar masih hipotesis. Repository public terverifikasi, tetapi Pages sebelumnya gagal karena belum diaktifkan dan domain hosting ditolak proxy cloud. Push kode serta keberhasilan deployment adalah pemeriksaan terpisah; lihat `DEPLOYMENT.md`.

Setelah pengujian, commit aplikasi `5b477196bdb16d46ccedfd7208960eceb303ea64` berhasil di-push ke `main`; SHA remote cocok. ZIP GitHub HTTP 200 dan source serta laporan browser cocok byte-for-byte. Run deployment `37871002740` tetap gagal pada Configure Pages karena Pages belum diaktifkan. Catatan hasil upload ditambahkan lewat commit dokumentasi tanpa perubahan source aplikasi.


## Audit dan verifier deployment — 9 Oktober 2026

Source aplikasi tetap identik dengan run 69 kasus browser; `source-manifest.sha256` kembali lulus. Setelah perubahan dokumentasi dan workflow, `npm test` kembali lulus 65 kasus simulasi serta tes progres, dan `npm run build` berhasil. Workflow YAML diperiksa dengan parser; verifier menerima URL dari output action deploy dan menggunakan environment github-pages yang dilindungi.

Verifier `scripts/verify-deployment.mjs` diuji pada preview lokal: **10 aset HTTP 200**, hash cocok checkout, 12 misi/3 stage. Ini bukti kesiapan lokal, bukan pemeriksaan website publik. Harness sementara terpisah di cloud menjalankan **12 pemeriksaan** yang lulus: input URL/attempt invalid, normalisasi basepath, JSON dan summary append, source berubah, HTTP 404, MIME keliru, redirect, decoded gzip, retry, serta timeout body 10 detik. Kasus negatif menghasilkan exit 1 sebagaimana diharapkan; harness tidak dimasukkan sebagai dependensi aplikasi.

Repository terverifikasi public dan dibuat 8 Oktober 2026, 18.50.40 WIB. Default server main dan hanya branch main terverifikasi melalui Git setelah penghapusan downloads. Sebelumnya semua commit unik downloads sudah dipush sebagai leluhur main; kedua ZIP tetap HTTP 200, valid, dan hash cocok melalui permalink commit.

Run hosting setelah pengaturan environment peserta ditangani terpisah pada `DEPLOYMENT.md`. Chat awal GPT-5.6 Luna masih belum tersedia; jurnal tepat lima prompt nyata dan paket pengumpulan tidak menggantikan log mentah awal–akhir.


### Hasil hosting publik

Run [37872773713](https://github.com/sagara-ds/M-ONE/actions/runs/37872773713) berstatus **Success** pada commit34493d863be1c2eef300be82c28771b23611dd66. Metadata job menunjukkan **Deploy to GitHub Pages**, **Verify published website and assets**, dan upload artifact sukses. Verifier dilaksanakan di runner GitHub pada 9 Oktober 2026, **09.04.24 WIB**; sepuluh aset dari https://sagara-ds.github.io/M-ONE/ lolos HTTP200, MIME, dan hash checkout. Expected manifest: `5b97e9f469aa443a0085ed8a8cf4373e2bbe3678da75137514eba45094795202`.

Bukti yang disimpan adalah metadata run/job teramati pada `provenance/deployment-evidence.json`, bukan salinan laporan HTTP asli. Laporan asli dibuat dan diunggah workflow sebagai artifact `website-verification` (30 hari). Akses langsung domain Pages dari cloud masih diblokir; tidak dibuat klaim 69 browserchecks dijalankan pada hosting. Tidak ada source aplikasi yang berubah sejak run browser lokal.
