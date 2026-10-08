# Unduh Detektif Bug

Paket hasil penyempurnaan 8 Oktober 2026: suara opsional, animasi robot, kartu aktif, hitungan pengulangan, Satu langkah, Jeda, dan Gerak tenang.

- [Unduh proyek lengkap](https://github.com/sagara-ds/M-ONE/raw/refs/heads/downloads/downloads/Detektif-Bug-suara-animasi.zip)
- [Unduh paket hosting](https://github.com/sagara-ds/M-ONE/raw/refs/heads/downloads/downloads/Detektif-Bug-hosting.zip)

Proyek lengkap berisi source terbaru, dokumen, bukti pemeriksaan, history bundle asli, serta dist/. Paket hosting berisi isi dist/ langsung. Source aplikasi pada root branch ini adalah snapshot arsip original; source suara/animasi terbaru ada di ZIP proyek. Skrip preview pada root branch sudah menerima perbaikan konflik port.

Build berhasil, 27 kasus mesin simulasi dan 30 kasus browser lulus pada sesi penyempurnaan. Suara belum didengarkan manusia, uji anak/guru dan deployment publik website belum dilakukan.

Ekstrak ZIP ke folder baru, lalu ikuti docs/UPGRADE.md di dalam ZIP untuk menerapkan perubahan pada repository asli sambil mempertahankan .git dan riwayat commit. Jangan mengganti history original. Empat commit asli dipertahankan sebagai parent branch downloads.

ZIP proyek kini juga memuat perbaikan EADDRINUSE: port bawaan sibuk otomatis mencoba 4174–4183. Sembilan pemeriksaan integrasi preview pada cloud Linux lulus; belum diuji langsung di Windows. Paket hosting tetap sama karena hanya skrip development yang berubah. Catatan status terdahulu dalam dokumen arsip mengikuti waktu masing-masing sesi. SHA-256 masing-masing ZIP tersedia dalam SHA256SUMS.
