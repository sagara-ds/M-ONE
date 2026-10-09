# Panduan Uji Singkat

## Untuk anak

1. Buka “Cara bermain”, baca contoh kartu ulang, lalu pilih misi 1, “Jejak lurus”.
2. Tekan “Jalankan program” dan lihat ke mana robot bergerak.
3. Jika gagal, ubah satu kartu perintah lalu jalankan lagi.
4. Jika bingung, tekan “Minta petunjuk” satu kali saja dan baca petunjuknya.
5. Setelah berhasil, coba pertanyaan konsep dan ceritakan alasanmu. Jawaban boleh dicoba lagi.
6. Lanjutkan misi berikutnya melalui peta stage. Empat misi selesai memberi satu lencana.
7. Buka “Rangkuman belajarku” untuk melihat catatan penemuanmu.

Tanyakan dengan bahasa sederhana:

- “Kartu mana yang membuat robot bergerak ke arah yang tidak kamu mau?”
- “Mengapa robot belum bisa mengambil buku?”
- “Apa yang berubah setelah kamu mengubah satu kartu?”

## Untuk guru/orang tua

Catat observasi, bukan nilai yang menghakimi:

- Apakah anak membaca urutan kartu dari atas ke bawah?
- Apakah anak mengamati gerakan sebelum meminta petunjuk?
- Apakah anak dapat menjelaskan jenis kesalahan dengan kata-katanya?
- Apakah anak menyelesaikan misi lanjutan yang susunannya berbeda?
- Apakah penjelasan anak sesuai gerakan robot, atau ia memilih jawaban tanpa alasan?
- Pada misi 7–12, apakah anak membedakan petak tujuan dan rak penghalang?

Jangan menyimpulkan hipotesis terbukti dari satu sesi singkat. Gunakan catatan untuk iterasi berikutnya.

Untuk uji singkat 10–15 menit, mulai misi 1–3 dan satu misi baru yang sudah terbuka. Jangan mewajibkan seluruh 12 misi dalam satu sesi. Minta persetujuan pendamping dan kenyamanan anak; catat bantuan yang diberikan. Tidak perlu mengumpulkan nama atau data pribadi anak.

## Mengamati suara dan gerakan bersama anak

1. Mainkan tanpa suara terlebih dahulu. Minta anak menunjukkan kartu yang sedang ditandai.
2. Tanyakan apakah anak ingin bunyi robot; aktifkan “Suara efek” jika ia mau. Mulai dengan volume rendah dan biarkan anak memilih mati/nyala.
3. Coba “Bacakan” hanya bila perangkat memiliki suara bahasa Indonesia. Jika muncul pesan belum tersedia, gunakan teks atau pendamping membacakan; ini bukan kesalahan anak.
4. Gunakan “Satu langkah” pada kartu ulang. Tanyakan “Mengapa robot maju beberapa kali padahal kartunya cuma satu?”
5. Coba Jeda, kecepatan Pelan, dan Gerak tenang. Perhatikan apakah animasi membantu atau justru mengalihkan perhatian.
6. Setelah berhasil, minta anak menjelaskan perbaikannya dan mencoba misi berikutnya tanpa petunjuk tambahan.

Catat jawaban, bantuan pendamping, kesulitan mengendalikan kartu, serta pilihan suara anak. Jangan mengisi catatan dengan hasil dugaan. Belum ada uji anak/guru yang dilakukan dalam sesi pengembangan ini.

## Smoke test teknis

- Jalankan program awal pada setiap misi; tidak boleh ada error JavaScript.
- Ubah urutan kartu menggunakan tombol naik/turun.
- Tambah dan hapus kartu.
- Tampilkan petunjuk satu per satu.
- Tekan ulangi; pastikan robot, program, dan status kembali ke awal.
- Selesaikan misi; pastikan misi berikutnya terbuka dan progres tersimpan.
- Muat ulang halaman; progres tetap terbaca.
- Periksa total 12 misi dan tiga stage. Stage berikutnya terbuka setelah misi sebelumnya berhasil; lencana muncul pada misi 4, 8, dan 12.
- Jawab pertanyaan konsep salah lalu benar; penjelasan muncul, jawaban salah dapat dicoba lagi, dan misi berikutnya tetap bisa dibuka.
- Pada misi yang memiliki rak penghalang, maju ke rak tidak memindahkan robot dan hasil tetap gagal.
- Buka “Cara bermain” ketika program berjalan; robot harus berjeda dan panduan tetap terbuka.
- Gunakan keyboard untuk menjawab pertanyaan benar; fokus harus berpindah ke penjelasan.
- Untuk progres versi lama, pastikan enam status selesai tetap terbaca dan misi 7 terbuka. Jangan menghapus penyimpanan pengguna untuk menguji migrasi.
- Buka rangkuman dan muat ulang; jumlah misi, jawaban tepat, dan lencana tetap konsisten.
- Coba lebar 375px dan desktop; tidak boleh ada tombol utama yang terpotong.
- Aktifkan reduced motion; animasi tidak boleh menghalangi aktivitas.
- Tekan Jalankan; peta harus masuk ke layar dan hasil muncul di panel peta.
- Coba Satu langkah: setiap klik menjalankan satu aksi; kartu ulang menunjukkan 1/3, 2/3, 3/3.
- Tekan Jeda dan tunggu; robot tidak boleh terus bergerak. Lanjutkan meneruskan langkah berikutnya.
- Ulangi saat robot bergerak, lalu segera jalankan lagi; timer percobaan lama tidak boleh mengubah percobaan baru.
- Aktifkan/matikan Suara efek; ubah volume; tanpa suara fungsi simulasi tetap sama.
- Aktifkan Bacakan pada perangkat dengan/tanpa suara Indonesia; periksa narasi atau pesan fallback. Coba gerak tenang setelah fallback; pesan harus tetap terbaca.
- Muat ulang; suara tidak mulai sendiri walaupun preferensi nyala tersimpan.
- Periksa belok kiri dari timur: panah memutar ke kiri seperempat putaran, bukan ke kanan tiga putaran.
- Dengarkan langsung pada ponsel/komputer untuk memastikan volume nyaman. Uji browser headless hanya membuktikan pemanggilan audio, bukan kualitas bunyi yang terdengar.

