# PRD — Detektif Bug

## Pengembangan suara dan animasi — 8 Oktober 2026

Tujuan perubahan: memperjelas hubungan kartu dengan gerak robot sekaligus membuat percobaan terasa menyenangkan. Manfaat belajar tetap hipotesis, belum hasil uji pengguna.

- Bunyi berbeda untuk maju, belok, ambil buku, antar buku, petunjuk, dan coba ulang. Kesalahan mendapat bunyi lembut, tanpa hukuman.
- Suara efek dan bacaan langkah dapat dinyalakan terpisah; awalnya mati. Volume efek dan preferensi disimpan pada perangkat.
- Robot berpindah mulus antarp petak; kartu yang sedang berjalan diberi tanda dan kartu ulang menampilkan hitungan nyata, misalnya 2 dari 3.
- Buku tampak dibawa lalu diantar; perayaan singkat muncul hanya setelah simulasi menyatakan berhasil.
- Tombol “Satu langkah” terpisah dari petunjuk untuk mengamati satu perintah atomik; tombol Jeda memberi waktu mengamati.
- Gerak tenang menghentikan animasi dekoratif serta perayaan bergerak, tanpa menghilangkan penjelasan langkah.
- Tetap berjalan tanpa audio atau suara Indonesia. Seluruh hasil memiliki teks.

Kriteria pemeriksaan: keenam solusi benar dan program awal salah, hitungan ulang sesuai simulasi, reset/ubah misi tidak meninggalkan timer aktif, preferensi bertahan setelah reload, tidak ada scroll mendatar pada 375/768/1024/1440px, dan build statis memuat modul tambahan.

## Ringkasan satu kalimat

Detektif Bug adalah website belajar coding untuk anak kelas 3–5 SD: anak membantu robot mengantar buku ke perpustakaan dengan menemukan dan memperbaiki kesalahan pada kartu perintah.

## 1. Masalah, manfaat, pembeda, dan risiko

### Masalah yang ingin diuji

Hipotesis awal: anak pemula lebih mudah memahami urutan perintah dan pengulangan jika mereka dapat menjalankan program, melihat akibatnya, lalu memperbaiki satu kesalahan dengan petunjuk bertahap.

Hipotesis ini belum dianggap sebagai fakta. Versi pertama perlu diamati melalui uji singkat dengan anak atau guru:

- Apakah anak mengerti hubungan kartu perintah dengan gerakan robot?
- Apakah anak dapat menjelaskan letak kesalahan setelah menjalankan program?
- Apakah petunjuk bertahap membantu tanpa membuat anak hanya menyalin jawaban?
- Apakah soal lanjutan yang berbeda tetap dapat diselesaikan?

### Manfaat yang dituju

- Anak melihat sebab-akibat program dalam bentuk gerak yang konkret.
- Anak belajar mencoba, mengamati, memperbaiki, dan mencoba lagi.
- Guru atau pendamping dapat menguji pemahaman dari jawaban pada soal lanjutan.
- Tidak perlu akun, server, atau data pribadi untuk mencoba.

### Pembeda yang ingin diuji

Petunjuk dibuka bertahap sesuai jenis kesalahan, misalnya jarak belum cukup, arah salah, atau blok pengulangan kurang. Setelah satu misi selesai, misi berikutnya menguji konsep serupa dengan susunan posisi yang berbeda.

Ini adalah pembeda yang ingin diuji, bukan klaim bahwa pendekatan tersebut belum pernah ada.

### Risiko terbesar

Anak mungkin menebak kartu sampai berhasil tanpa memahami alasan perbaikannya. Mitigasinya: tombol “Lihat langkah berikutnya” membuka petunjuk satu per satu, simulasi dijalankan langkah demi langkah, dan misi lanjutan memakai susunan berbeda dengan konsep yang sama.

## 2. Sasaran dan batasan

- Sasaran utama: anak kelas 3–5 SD, digunakan di ponsel atau komputer.
- Pendamping: guru/orang tua yang ingin melihat aktivitas sederhana tanpa login.
- Bahasa: Indonesia sederhana, kalimat pendek, istilah coding dijelaskan melalui gerakan.
- Batas versi pertama: tanpa login, backend, API berbayar, drag-and-drop wajib, atau penyimpanan cloud.
- Penyimpanan: kemajuan disimpan di `localStorage` perangkat pengguna.

## 3. Alur pengguna

1. Anak membuka halaman dan melihat misi yang terbuka serta kemajuan bintang.
2. Anak membaca contoh singkat: kartu perintah dibaca dari atas ke bawah.
3. Anak memilih misi.
4. Anak melihat peta, posisi robot, buku, perpustakaan, dan kartu program yang mengandung bug.
5. Anak menekan “Jalankan program”. Robot bergerak mengikuti kartu dan hasilnya diumumkan.
6. Jika belum berhasil, anak dapat menjalankan lagi, memindahkan/menghapus/menambah kartu, atau meminta petunjuk bertahap.
7. Jika berhasil, anak mendapat umpan balik dan dapat membuka misi berikutnya.
8. Kemajuan tersimpan di perangkat dan tetap terlihat saat halaman dibuka lagi.

## 4. Fitur versi pertama

### F1 — Panduan singkat

Panel contoh menjelaskan tiga hal: baca dari atas ke bawah, jalankan untuk mengamati, dan perbaiki satu kartu lalu coba lagi.

### F2 — Enam misi bertahap

| Misi | Konsep | Kesalahan latihan |
| --- | --- | --- |
| 1. Jejak lurus | Urutan dasar | Langkah belum cukup sebelum mengambil buku |
| 2. Belok ke rak | Urutan + arah | Belok ke arah yang salah |
| 3. Ulangi langkah | Pengulangan 3 kali | Pengulangan kurang satu kali |
| 4. Naik lalu melaju | Pengulangan + arah | Belok setelah mengambil buku salah |
| 5. Naik ke lantai atas | Urutan + pengulangan | Mengambil buku terlalu cepat |
| 6. Rute campuran | Pengulangan + belokan | Pengulangan pertama terlalu jauh |

### F3 — Penyusunan kartu

Semua kartu menyediakan tombol naik, turun, dan hapus yang bisa diklik atau disentuh. Palet kartu menyediakan tombol “Tambah” untuk memasukkan perintah. Tombol juga dapat digunakan dengan keyboard sehingga penyusunan tidak hanya bergantung pada drag.

### F4 — Simulasi

Mesin simulasi membaca program berurutan. Robot memiliki posisi, arah, status membawa buku, dan status sampai di perpustakaan. Gerakan ditampilkan pada peta dan status langkah dibacakan melalui `aria-live`.

### F5 — Pemeriksaan keberhasilan

Misi berhasil hanya jika robot mengambil buku dan mengantarnya ke petak perpustakaan. Program yang terkena batas peta, mengambil sebelum berada di petak buku, atau mengantar di tempat salah belum berhasil.

### F6 — Petunjuk bertahap

Petunjuk pertama meminta anak mengamati. Petunjuk kedua mengarahkan ke jenis kesalahan. Petunjuk ketiga memberi target perbaikan tanpa menuliskan seluruh program.

### F7 — Ulangi dan kemajuan lokal

“Ulangi misi” mengembalikan program ke susunan awal misi dan posisi robot ke awal. Misi yang selesai dan skor petunjuk disimpan di `localStorage`.

## 5. Kriteria keberhasilan versi pertama

### Fungsional

- Anak dapat membuka dan memahami contoh tanpa login.
- Keenam misi dapat dipilih dan misi terkunci terlihat alasannya.
- Program salah dapat dijalankan dan menampilkan gerak robot serta alasan belum berhasil.
- Anak dapat mengubah kartu dengan tombol tambah, naik, turun, dan hapus.
- Petunjuk terbuka satu per satu dan berbeda sesuai misi.
- Program benar menampilkan status berhasil, menyimpan progres, dan membuka misi berikutnya.
- Tombol ulangi mengembalikan keadaan ke awal.

### UX dan aksesibilitas

- Tombol utama memiliki area sentuh minimal sekitar 44px.
- Kontras teks utama dipertahankan dan fokus keyboard terlihat.
- Informasi keberhasilan/kesalahan tidak hanya dibedakan dengan warna.
- Layout nyaman diuji pada lebar 375px dan layar desktop.
- Animasi berhenti atau diperlambat saat `prefers-reduced-motion: reduce` aktif.

### Bukti yang perlu dikumpulkan

- Screenshot atau catatan uji manual untuk misi pertama.
- Hasil `npm run build`.
- Riwayat commit sejak garis start lomba.
- Tautan repo public dan tautan deployment yang benar-benar dapat dibuka.

## 6. Hal yang belum boleh diklaim

- Belum ada bukti bahwa hipotesis pembelajaran terbukti sebelum uji dengan anak/guru.
- Belum ada bukti produk meningkatkan kemampuan coding jika belum dilakukan evaluasi.
- Belum ada klaim bahwa mekanisme petunjuk ini belum pernah ada di produk lain.
- Deployment dan akses repo hanya boleh dicantumkan setelah diverifikasi nyata.

## 7. Keputusan teknis

- **HTML/CSS/JavaScript modular:** cukup untuk interaksi lokal dan tidak menambah dependensi.
- **Static hosting:** dapat dipasang di GitHub Pages, Netlify, atau hosting sejenis.
- **SVG inline:** robot, buku, dan status tetap tajam tanpa aset raster besar.
- **localStorage:** sesuai kebutuhan kemajuan pada perangkat tanpa mengumpulkan data pribadi.

