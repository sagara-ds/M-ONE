# Memakai hasil penyempurnaan

ZIP proyek berisi source terbaru, dokumen, bukti pemeriksaan, bundle history asli, serta `dist/` siap hosting. ZIP hosting terpisah berisi isi `dist/` langsung.

1. Simpan ZIP original dan salinan checkout asli sebagai cadangan.
2. Ekstrak ZIP hasil **ke folder baru**, lalu salin file source/dokumen yang diperbarui ke repository asli peserta. Pertahankan `.git` asli; ZIP hasil tidak menyertakan `.git` cloud.
3. Jalankan `npm run test:missions`, `npm run build`, lalu `npm run preview`. Aktifkan Suara efek melalui tombol untuk mencoba; suara tidak mulai otomatis.
4. Dengarkan bunyi langsung dan coba narasi pada perangkat peserta. Gunakan `TEST_GUIDE.md` untuk uji anak/guru.
5. Periksa `git diff`, lalu commit perubahan dengan waktu sebenarnya. Jangan menulis ulang empat commit awal.
6. Ikuti `DEPLOYMENT.md` untuk hosting dan verifikasi URL. ZIP hosting dapat diunggah ke static hosting yang menerima folder berisi `index.html`.

Draft cloud sudah menyimpan `install_script` dan `start_skill`. Untuk memakainya pada task berikutnya, tinjau dan simpan perubahan di pengaturan environment, lalu publish environment. Publish environment berbeda dari deployment website ke hosting.

Sebelum submit, lengkapi ekspor chat GPT sebelumnya, pastikan repo public dan URL hosting dapat dibuka, serta klarifikasi “maksimal 5” vs “5” prompt terkurasi. Batas submit 15 Oktober 2026 pukul 15.30 WIB.
