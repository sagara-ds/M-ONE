# Audit kepatuhan M-ONE

Pemeriksaan: **9 Oktober 2026 (WIB)**. Acuan utama: lampiran peserta `Guidebook_MONE_Coding_Competition_REVISI(1).pptx`, 16 slide. Teks pada slide 5, 10, dan 12 diperiksa kembali langsung dari XML PPT; SHA-256 PPT: `c1b43f3d3e1a712b37af63663b91dc0759b15b1f3c515af560be4073f911cbc0`.

Audit ini mencatat bukti yang tersedia dan kekurangannya. Audit bukan pernyataan kelulusan dari panitia dan bukan bukti uji belajar anak.

## Panduan lomba dan permintaan peserta

**Ketentuan dari PPT:** karya individu berupa website edukasi coding anak SD; docs acuan AI; repository public; jurnal terkurasi dan log mentah awal–akhir; website terbit di hosting; karya dibuat setelah garis start; pengumpulan melalui kanal panitia sebelum batas waktu. Ketentuan ini dirujuk per slide di bawah.

**Permintaan peserta pada sesi ini:** setelah memilih GitHub Actions sebagai sumber Pages, jalankan ulang workflow; hapus branch `downloads` sehingga `main` menjadi satu-satunya branch dan default; periksa serta lengkapi kepatuhan terhadap PPT. Jumlah branch dan nama branch default bukan syarat lomba dalam PPT. Penghapusan branch merupakan permintaan pengelolaan repository, sehingga bukti commit/arsipnya perlu dipertahankan sebelum penghapusan. Rerun workflow baru menjadi bukti hosting setelah job deploy berhasil dan URL website diperiksa.

## Gerbang kelayakan

Slide 5 dan 6 menyatakan karya yang gagal salah satu syarat, atau tidak dapat membuktikannya, tidak dinilai lebih lanjut.

| Ketentuan | Acuan PPT | Bukti konkret | Status dan tindak lanjut |
| --- | --- | --- | --- |
| Docs sebagai acuan AI untuk seluruh task | 5 poin 1; 6 | [AI_GUIDE.md](AI_GUIDE.md), [PRD.md](PRD.md), aturan desain. `AI_GUIDE.md` sudah ada pada commit awal `7e9328d`. Acuan tambahan untuk suara dan perluasan stage tersedia. | **Dokumen tersedia.** Docs dan kode pertama berada dalam commit sama; Git tidak membuktikan urutan penulisan docs sebelum kode. Urutan awal perlu ditunjukkan oleh chat asli. |
| Repository GitHub public | 5 poin 2; 6; 11 | `https://github.com/sagara-ds/M-ONE` diperiksa tanpa token: HTTP 200; metadata `repository_public=true` dan `repository_is_fork=false`. [Metadata repository](provenance/repository-metadata.json) juga mencatat default branch `main`. | **Terbukti public pada pemeriksaan ini.** Jangan ubah menjadi private. |
| Jurnal terkurasi dan log mentah awal–akhir | 5 poin 3; 6; 12 poin 3 | [PROMPT_LOG.md](PROMPT_LOG.md) memuat jurnal; [SESSION_PROMPTS.md](SESSION_PROMPTS.md) memuat prompt lengkap yang tersedia dan menandai delegasi. Peserta telah memberikan [tautan chat awal GPT-5.6 Luna](raw-prompts/GPT56_LUNA_SOURCE.md) dan [salinan jurnal lama](raw-prompts/USER_SUPPLIED_LUNA_JOURNAL.txt). [Satu prompt awal lengkap](raw-prompts/LUNA_INITIAL_PROMPT_FROM_JOURNAL.txt) tersedia dan cocok dengan history proyek. | **Prompt sesi awal tersedia sesuai konfirmasi peserta: “Hanya prompt pembangunan awal”.** Berkas identik dengan jurnal pada commit392e25d. Kecocokan teks diperiksa; cakupan sesi berdasarkan pernyataan peserta, bukan ekspor chat yang dibaca independen. PPT meminta log prompt, tidak eksplisit seluruh jawaban AI. Jurnal terkurasi tetap lima prompt nyata. |
| Stack bebas, framework/library diizinkan | 5 poin 4; 6 | HTML, CSS, JavaScript browser; build Node tanpa dependensi aplikasi. Font dan lisensi dicatat di [THIRD_PARTY.md](THIRD_PARTY.md). | **Sesuai batas stack.** Tidak perlu mengganti stack atau menambahkan AI berbayar ke aplikasi. |
| Tema pendidikan dan coding untuk anak SD | 2; 3 poin 2; 5 poin 5; 6 | Robot mengantar buku; 12 misi urutan dan pengulangan; petunjuk; pertanyaan konsep; panduan anak/guru. Tujuan serta hipotesis dijelaskan di PRD. | **Fitur dan dokumen sesuai tema.** Manfaat belajar belum terbukti oleh uji anak/guru. |
| Deploy ke hosting dan dapat diakses juri | 5 poin 6; 6; 12 poin 4 | Website https://sagara-ds.github.io/M-ONE/; run37872773713 berstatus Success, step verifikasi hosting sukses, sepuluh aset HTTP 200 dan SHA-256 cocok checkout. Bukti metadata [deployment-evidence.json](provenance/deployment-evidence.json). | **Terbit dan diperiksa dari runner GitHub.** Akses langsung cloud diblokir; 69 uji browser berasal dari preview lokal. Lakukan pemeriksaan langsung pada perangkat sebelum submit. |

## Lima prompt terkurasi dan log asli

Slide 5 berbunyi: **“jurnal prompt terkurasi (maks 5 prompt: ide/PRD, debugging, audit & optimasi, finishing, dan 1 bebas)”**. Slide 12 berbunyi: **“Jurnal prompt terkurasi (5 prompt)”**. Perbedaan ini adalah maksimal lima versus tepat lima; log mentah awal–akhir adalah lampiran terpisah dan tidak dibatasi menjadi lima.

Rekomendasi praktis: jurnal telah memilih **tepat lima prompt yang benar-benar digunakan**, masing-masing cocok dengan kategori yang disebut slide 5. Ini memenuhi kedua rumusan jumlah tanpa menciptakan prompt. Pilihan berdasarkan catatan yang tersedia:

| Kategori | Prompt nyata yang dapat dipilih | Sumber teks asli |
| --- | --- | --- |
| Ide/PRD | Permintaan awal merancang dan membangun Detektif Bug | Prompt awal di `PROMPT_LOG.md` cocok dengan salinan jurnal yang peserta unggah dan prompt pada commite3b6eae. Teks mentah hasil ekstraksi ada di `raw-prompts/LUNA_INITIAL_PROMPT_FROM_JOURNAL.txt`; peserta mengonfirmasi hanya satu prompt pada sesi Luna. |
| Debugging | Laporan `EADDRINUSE` ketika `npm run preview` dijalankan di Windows | Bagian “Pengguna — laporan error preview Windows” di `SESSION_PROMPTS.md`; hasil di `PREVIEW_FIX.md`. |
| Audit & optimasi | Permintaan sesi ini untuk memeriksa dan memperbaiki kepatuhan terhadap PPT | Teks pengguna telah disalin persis pada `SESSION_PROMPTS.md` dan prompt5 `PROMPT_LOG.md`; ringkasan audit ini tidak menggantikannya. |
| Finishing | Penyempurnaan suara, efek, dan animasi pada kode lampiran | Bagian “Pengguna — penyempurnaan kode yang dilampirkan” di `SESSION_PROMPTS.md`; hasil di `VALIDATION.md`. |
| Bebas | Permintaan menambah stage dan push `main`, beserta pilihan 12 misi | Bagian “Pengguna — tambah stage dan push main” di `SESSION_PROMPTS.md`. |

Jurnal perlu menjelaskan keputusan, masalah yang benar-benar ditemukan, perubahan, dan hasil pemeriksaan. Jangan menambah jam kirim yang tidak tercatat, mengubah teks prompt, atau menyebut prompt delegasi sebagai prompt langsung peserta. Satu prompt awal telah tersedia lengkap; peserta menyatakan tidak ada prompt lanjutan sesi Luna. Jawaban AI dapat menjadi bukti urutan pengerjaan, tetapi PPT tidak menyatakan semua respons AI wajib dilampirkan. Jika panitia meminta format lain atau membatasi penggunaan delegasi, klarifikasikan melalui kanal lomba; jangan mengarang jawaban panitia.

## Waktu, asal karya, dan riwayat

| Ketentuan | Acuan PPT | Bukti dan batasnya |
| --- | --- | --- |
| Repository, kode, desain, docs AI, dan prompt disusun setelah **5 Oktober 2026, 09.30 WIB** | 3 poin 4; 9; 10 | Commit pertama `7e9328d1cc95accd70c0db5b2f7a19d6be139e28` memiliki waktu author/committer **8 Oktober 2026, 18.38.20 WIB**. Commit ini sudah berisi source, PRD, AI Guide, dan desain. Repository GitHub dibuat **8 Oktober 2026, 18.50.40 WIB**, sesuai metadata first-party. Kedua waktu setelah garis start; semua commit `main` yang diperiksa juga setelahnya. Waktu commit dan repository belum membuktikan asal seluruh isi atau urutan penulisan docs sebelum kode; bukti urutan tindakan dari chat atau sumber asli masih diperlukan. |
| Tanggal repository dan commit pertama dapat dicocokkan dengan log prompt | 9; 10 | **Tanggal penciptaan repository terverifikasi:** field `createdAt` pada JSON `codeViewLayoutRoute.repo` halaman GitHub adalah `2026-10-08T11:50:40.000Z`, yaitu **8 Oktober 2026, 18.50.40 WIB**. Identitas metadata: repository ID `1410241377`, owner `sagara-ds`, nama `M-ONE`, bukan fork, default `main`. Bukti disimpan di [repository-metadata.json](provenance/repository-metadata.json), diperiksa **9 Oktober 2026, 08.53.40 WIB**. REST API diblokir CONNECT 403, tetapi metadata first-party halaman public dapat dibaca. Prompt awal dalam unggahan telah cocok dengan history; peserta mengonfirmasi hanya satu prompt sesi Luna. Timestamp pesan awal belum tersedia untuk dicocokkan dengan commit. Isi tautan chat belum terbaca dari cloud. |
| Tidak memakai proyek lama, menyalin komponen lama, atau mengikuti lomba lain | 3 poin 4; 10; 11 | Asal ZIP, hash, empat commit awal, dan bundle dicatat di [PROVENANCE.md](PROVENANCE.md). Tidak ada bukti independen tentang semua sumber kode atau publikasi/keikutsertaan sebelumnya. Pernyataan peserta dan chat asli diperlukan untuk bagian yang tidak dapat diperiksa lewat Git. Framework/library dan font pihak ketiga diperbolehkan; lisensinya tetap dicatat. |
| Tidak menghapus/menulis ulang history, melakukan force push, atau memalsukan tanggal | 10 | Empat commit ZIP tetap menjadi leluhur `main`; bundle asli valid dan berisi history lengkap. Kedua commit unik downloads telah dipertahankan sebagai leluhur main melalui merge42ef26f sebelum branch dihapus; seluruh ZIP tetap dapat diunduh melalui SHA asli. Audit tidak mengubah tanggal atau commit lama. |
| Pengumpulan paling lambat **15 Oktober 2026, 15.30 WIB** | 4; 11; 12 | Paket pengumpulan disiapkan di [SUBMISSION.md](SUBMISSION.md). Belum ada bukti pengiriman formulir atau tanda terima. Pukul **21.00 WIB** pada slide 4 adalah penutupan penyisihan, bukan batas submit. |

Slide 10/11 menyebut pengurangan **35%** untuk proyek yang terbukti dibuat sebelum garis start, serta diskualifikasi bila asal dari nol tidak dapat dibuktikan. Dokumen ini tidak menyatakan proyek melanggar atau lolos ketentuan itu tanpa bukti lengkap.

## Peserta dan mekanisme pengumpulan

- Slide 3: kategori umum untuk pelajar SMA/SMK, mahasiswa, atau masyarakat umum; lomba individu; identitas sah dilampirkan saat pendaftaran. Status pendaftaran, pembayaran, identitas, dan kepesertaan individu belum diperiksa dalam repository. Simpan bukti identitas melalui kanal resmi, bukan repository public.
- Slide 12: kirim tautan repo public, docs acuan AI, jurnal terkurasi, dan tautan hosting melalui formulir/kanal Technical Meeting. Slide 5 menambahkan log mentah lengkap sebagai lampiran verifikasi. Kanal submit dan tanda terima belum tersedia di berkas proyek.
- Slide 11: plagiarisme dan manipulasi dokumentasi prompt menyebabkan diskualifikasi; terlambat tanpa konfirmasi juga menyebabkan diskualifikasi. Tidak ada klaim bahwa submit atau konfirmasi panitia sudah dilakukan.

## Bukti kualitas untuk penilaian

Slide 7/8 menetapkan lima komponen berbobot. Bukti berikut membantu penilaian setelah gerbang kelayakan; audit tidak memperkirakan skor juri.

| Komponen | Bobot | Bukti yang tersedia | Batas bukti |
| --- | --- | --- | --- |
| Proses Vibe Coding | 25 | PRD, AI Guide, jurnal, prompt sesi, catatan debugging nyata; metadata tanggal repository terverifikasi; satu prompt awal sesuai konfirmasi peserta | Timestamp pesan awal dan bukti urutan docs sebelum kode belum tersedia. Cakupan sesi awal berdasarkan pernyataan peserta. |
| Fungsionalitas dan relevansi | 25 | Hasil lokal: 65 kasus simulasi lulus, tes progres lulus, 69 pemeriksaan browser lulus, 0 error console/request; 12 misi | 65/69 kasus merupakan run lokal terdokumentasi di `VALIDATION.md`; sepuluh aset hosting kini juga diperiksa runner. Tidak ada uji manfaat belajar anak. |
| UI/UX dan responsivitas | 20 | Screenshot; pemeriksaan 375/768/1024/1440px; animasi langkah, kartu aktif, pengulangan, reduced motion, kontrol suara | Kenyamanan suara dan pengucapan Indonesia belum didengarkan manusia; uji perangkat anak/guru belum dilakukan. |
| Kualitas teknis | 15 | Modul misi/progres/audio; build statis; font WOFF2 lokal; SVG; metadata bahasa/viewport/description; commit dengan pesan jelas | Performa di perangkat nyata dan semua kondisi hosting belum diukur. Lazy loading tidak ditambahkan tanpa kebutuhan aset nyata. |
| Inovasi dan kreativitas | 15 | Petunjuk menurut kesalahan, pengamatan satu langkah, pertanyaan konsep, stage/lencana/rangkuman | Tidak diklaim sebagai konsep yang belum pernah ada. Nilai guna dan manfaat belajar masih perlu diuji. |

## Pekerjaan yang masih bergantung pada peserta

1. Lengkapi bukti asal karya, timestamp pesan awal, dan urutan docs sebelum kode melalui sumber asli bila tersedia. Satu prompt Luna sudah dilampirkan sesuai konfirmasi peserta; tanggal penciptaan repository sudah tersimpan. Jangan membuat log, mengubah tanggal, atau membuat repo baru untuk menyamarkan riwayat.
2. Pastikan identitas/registrasi dan kanal submit resmi; kirim paket lengkap sebelum batas waktu lalu simpan tanda terima.
3. Dengarkan suara pada perangkat nyata dan lakukan uji singkat anak/guru bila memungkinkan. Ini membantu kualitas, tetapi bukan syarat wajib eksplisit pada PPT.

Perbaikan file dokumentasi, kurasi lima prompt nyata, preservasi history, rerun workflow, dan pemeriksaan hosting dapat dikerjakan dengan akses proyek. Bukti tindakan/waktu sesi awal, administrasi peserta, serta tanda terima pengumpulan tidak boleh digantikan dengan klaim AI.
