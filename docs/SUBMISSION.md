# Paket pengumpulan Detektif Bug

Kategori: **Umum — Web Education for Kids (anak SD)**. Tema: **Innovating Education Through Technology**. Versi proyek: **0.2.0**, 12 misi dalam tiga stage.

Batas pengumpulan: **15 Oktober 2026, 15.30 WIB**. Pukul 21.00 WIB adalah penutupan penyisihan, bukan batas submit. Ikuti formulir atau kanal yang diinformasikan panitia saat Technical Meeting; pengiriman belum dilakukan oleh dokumen ini.

## Tautan dan berkas yang dikumpulkan

| Isian/lampiran | Tautan atau berkas | Pemeriksaan sebelum submit |
| --- | --- | --- |
| Repository GitHub public | https://github.com/sagara-ds/M-ONE/tree/main | Halaman public sudah diperiksa tanpa token: HTTP 200, `repository_public=true`. Pastikan tetap public sampai penjurian selesai. |
| Docs acuan AI | [AI_GUIDE.md](AI_GUIDE.md), [PRD.md](PRD.md), [aturan desain](../design-system/detektif-bug/MASTER.md) | Dokumen acuan dan desain tersedia; bukti urutan awal docs sebelum kode memerlukan chat asli. |
| Jurnal prompt terkurasi | [PROMPT_LOG.md](PROMPT_LOG.md) | Sudah berisi tepat lima prompt nyata dalam kategori ide/PRD, debugging, audit & optimasi, finishing, dan bebas. Periksa salinan lengkapnya; log mentah tetap dilampirkan terpisah. |
| Log prompt mentah awal–akhir | [SESSION_PROMPTS.md](SESSION_PROMPTS.md), [tautan sumber chat GPT-5.6 Luna](raw-prompts/GPT56_LUNA_SOURCE.md), dan [petunjuk lampiran](raw-prompts/README.md) | **Tautan sudah diberikan, isi belum terbaca.** Akses cloud CONNECT 403; transcript lengkap dan urutan docs sebelum kode belum diverifikasi. Simpan salinan asli setelah akses tersedia, atau lampirkan ekspor asli sebelum submit. |
| URL website hosting | https://sagara-ds.github.io/M-ONE/ | Run [37872773713](https://github.com/sagara-ds/M-ONE/actions/runs/37872773713) berhasil; verifier runner memeriksa sepuluh aset HTTP 200 dan hash cocok. Rincian serta batas bukti di [DEPLOYMENT.md](DEPLOYMENT.md). |
| Bukti asal dan waktu karya | [PROVENANCE.md](PROVENANCE.md), history `main`, [bundle commit awal](provenance/original-history.bundle), [metadata repository GitHub](provenance/repository-metadata.json) | Repository dibuat **8 Oktober 2026, 18.50.40 WIB**, terverifikasi dari metadata first-party GitHub, setelah garis start. Commit pertama **8 Oktober 2026, 18.38.20 WIB**. Log awal–akhir dan urutan docs sebelum kode masih perlu dilengkapi. Jangan mengubah tanggal atau history. |
| Hasil pemeriksaan dan panduan uji | [VALIDATION.md](VALIDATION.md), [browser-results.json](browser-results.json), [TEST_GUIDE.md](TEST_GUIDE.md), [screenshot](screenshots/) | Hasil yang tersimpan berasal dari tes lokal, bukan uji pengguna anak/guru. Hasil hosting perlu dicatat terpisah. |
| Aset pihak ketiga | [THIRD_PARTY.md](THIRD_PARTY.md), lisensi font di `public/fonts/` | Framework/library diperbolehkan PPT; atribusi dan lisensi tetap disertakan. |

Slide 12 meminta empat isian utama: repository public, docs acuan AI, jurnal terkurasi, dan URL hosting. Slide 5 juga mewajibkan log mentah awal–akhir untuk verifikasi keaslian. [COMPETITION_AUDIT.md](COMPETITION_AUDIT.md) memetakan setiap ketentuan dan bukti yang masih kurang.

## Deskripsi singkat untuk formulir

> Detektif Bug membantu anak kelas 3–5 SD berlatih urutan perintah dan pengulangan. Anak menjalankan kartu yang mengandung kesalahan, mengamati robot mengantar buku, lalu memperbaikinya dengan petunjuk bertahap. Tersedia 12 misi dalam tiga stage, pertanyaan konsep, lencana, serta rangkuman belajar. Website berjalan tanpa login atau backend; kemajuan disimpan pada perangkat. Efek suara dan bacaan opsional disertai teks dan pilihan gerak tenang. Manfaat belajar merupakan hipotesis yang perlu diuji; proyek belum mengklaim hasil uji anak atau peningkatan kemampuan coding.

## Pemeriksaan akhir pada website hosting

1. Buka URL website tanpa login. Periksa bahwa versi terbit berisi 12 misi, tiga stage, dan kontrol suara; cocokkan dengan commit yang di-deploy.
2. Jalankan program awal misi 1; robot harus mengikuti kartu dan memberikan alasan belum berhasil.
3. Gunakan petunjuk, ubah kartu, jalankan solusi, lalu jawab pertanyaan konsep salah dan benar. Pastikan penjelasan tampil serta misi berikutnya terbuka.
4. Coba **Satu langkah**, **Jeda**, dan **Ulangi** saat bergerak; percobaan lama tidak boleh melanjutkan gerakan setelah reset.
5. Reload; progres tetap ada. Periksa ponsel dan desktop, termasuk peta 6×5 pada misi akhir.
6. Suara awalnya mati. Nyalakan lalu matikan; dengarkan kenyamanan bunyinya. Bacaan Indonesia boleh tidak tersedia, tetapi seluruh informasi harus tetap berupa teks.

## Bukti yang disimpan saat mengirim

- URL repo dan URL hosting yang benar-benar dimasukkan ke formulir.
- SHA commit yang dikumpulkan serta tautan run deployment berhasil.
- Salinan docs, lima prompt terkurasi, dan log mentah lengkap yang dilampirkan.
- Metadata tanggal repository yang sudah terverifikasi, bukti asal karya, dan ekspor chat yang mendukung riwayat commit.
- Tanggal/jam pengiriman nyata dalam WIB serta tanda terima dari kanal resmi.

Identitas peserta, pembayaran, dan dokumen pendaftaran dikirim melalui kanal resmi yang diminta panitia. Jangan memasukkan KTP/KTM, kredensial, atau nilai rahasia ke repository public. Dokumen ini belum menyatakan pendaftaran atau pengumpulan sudah selesai.

## Catatan jumlah prompt

Slide 5 mengatakan **maksimal lima**, sedangkan slide 12 mengatakan **lima**. Menyusun tepat lima prompt nyata memenuhi kedua jumlah itu. Perbedaan tetap dicatat agar dapat diklarifikasi; tidak ada jawaban panitia yang direka. Log mentah lengkap tetap dilampirkan dan tidak dipotong menjadi lima prompt.
