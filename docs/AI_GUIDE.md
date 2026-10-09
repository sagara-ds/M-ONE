# AI Guide — Detektif Bug

Dokumen ini menjadi acuan AI Agent untuk mengembangkan project setelah garis start lomba. Isinya adalah aturan kerja project, bukan bukti bahwa kode atau desain pernah dibuat sebelum garis start.

## Acuan audit lomba, deployment, dan pengelolaan branch (9 Oktober 2026)

- Pengguna sudah memilih GitHub Actions pada pengaturan Pages dan meminta workflow dijalankan kembali; gunakan workflow yang ada pada `main` dan verifikasi run beserta hasil hosting.
- Pengguna menginginkan hanya branch `main`, sebagai default. Pertahankan semua commit unik `downloads` sebagai leluhur `main` sebelum menghapus branch. Verifikasi `main` menjadi default di server; jangan menganggap perubahan `origin/HEAD` lokal sebagai perubahan default GitHub.
- Arsip enam misi tetap snapshot historis. Tautkan ke commit `61caa1d3b7c9d8fc18513a92de2612d548d4d85f`, bukan branch yang akan dihapus. ZIP source terbaru berasal dari `main`.
- Patuhi slide 5/6/10/12 guidebook: public repository, docs acuan, lima prompt terkurasi yang benar-benar digunakan, log mentah awal–akhir, dan website hosting yang bisa dibuka. Bedakan dokumen yang tersedia dari bukti asli yang masih harus disediakan peserta.
- Jangan menghapus history, melakukan force push, mengubah tanggal, mengarang prompt/hasil pengguna, atau menyebut proyek pasti lolos bila bukti belum lengkap. Satu prompt awal GPT-5.6 Luna telah dilampirkan apa adanya; peserta mengonfirmasi hanya prompt itu pada sesi awal. Catat cakupan sebagai pernyataan peserta. Bukti waktu pesan dan urutan tindakan docs sebelum kode harus berasal dari sumber asli, tidak direkonstruksi.
- Catat keberhasilan Git, workflow, dan hosting secara terpisah. Network CONNECT 403 dari cloud bukan bukti website publik mati.
- Setelah action deploy berhasil, jalankan pemeriksaan HTTP dari runner GitHub terhadap halaman dan sembilan aset aplikasi. Bandingkan SHA-256 dengan checkout commit yang diterbitkan agar versi lama atau halaman 404 tidak dihitung sebagai sukses. Simpan hasil faktual sebagai artifact dan ringkasan run; pemeriksaan lokal tidak disebut pemeriksaan hosting.
- Verifikasi tanggal pembuatan repository melalui metadata GitHub bila akses tersedia. Metadata tanggal commit saja bukan bukti tanggal pembuatan repo.

## Acuan tambahan sebelum perluasan stage (9 Oktober 2026)

- Permintaan dan pilihan peserta: total 12 misi; prioritaskan peta stage, lencana, dan rangkuman belajar. Push langsung ke `main` sudah diizinkan.
- Gunakan commit `main` terbaru sebagai parent; pertahankan perubahan peserta serta riwayat lama. Tidak melakukan force push atau mengganti tanggal commit.
- Enam misi awal tetap cocok dengan progres lokal lama. Tambahkan enam misi yang menggabungkan urutan dan pengulangan, dengan rute baru, ukuran peta yang tetap terbaca di ponsel, dan petak rak yang tidak bisa dilalui bila relevan.
- Kelompokkan menjadi tiga stage berisi empat misi. Peta perkembangan, label terkunci, dan lencana harus mengikuti progres nyata; petunjuk tidak mengurangi penghargaan.
- Setelah berhasil, tanyakan satu pertanyaan konsep sederhana dengan beberapa pilihan. Jawaban salah mendapat penjelasan dan boleh dicoba lagi; pertanyaan tidak menghalangi melanjutkan misi.
- Simpan jawaban konsep dan progres per misi pada perangkat tanpa identitas pribadi. Bedakan keberhasilan simulasi dari jawaban konsep; jangan menyebutnya bukti peningkatan kemampuan anak.
- Lencana diberikan setelah empat misi stage selesai. Jawaban konsep dicatat terpisah dan tidak menjadi syarat membuka misi atau lencana. Jangan membuat skor palsu, leaderboard, atau login.
- Uji dua belas solusi dan program awal salah, rute terhalang, metadata pengulangan, migrasi progres enam misi lama, pertanyaan benar/salah, lencana, stage terkunci, ukuran peta, serta regresi playback/audio.

## Acuan tambahan sebelum perubahan suara dan animasi (8 Oktober 2026)

- Lanjutkan kode yang diberikan peserta dalam `Innovating-M-ONE.zip`; jangan membuat ulang produk atau mengubah riwayat Git arsip.
- Gunakan Web Audio API untuk bunyi pendek buatan kode, tanpa unduhan audio atau API berbayar. Suara hanya diaktifkan melalui pilihan pengguna, dengan kontrol volume.
- Bacaan suara memakai Web Speech API bila suara bahasa Indonesia tersedia pada perangkat. Teks langkah tetap menjadi sumber informasi utama; jangan menganggap suara selalu tersedia.
- Animasi harus menunjukkan gerak dari petak lama ke petak baru, arah robot, kartu aktif, serta hitungan pengulangan. Perayaan singkat tidak menghalangi tombol atau peta.
- Hormati `prefers-reduced-motion` dan sediakan pilihan gerak tenang. Jangan memakai efek berkedip atau musik latar otomatis.
- Batalkan timer dan bacaan suara saat ulangi, berganti misi, atau mengubah program. Cegah callback simulasi lama memengaruhi percobaan baru.
- Verifikasi program benar/salah, petunjuk, reset saat berjalan, suara aktif/mati, simpan preferensi, dan ukuran layar yang tercantum di bawah.
- Log lengkap hanya mencatat prompt yang tersedia dalam sesi ini. Riwayat GPT sebelumnya adalah materi dari peserta dan tidak dinyatakan sudah diverifikasi.

## 1. Konteks project

### Perbaikan preview lokal setelah laporan EADDRINUSE

- Port 4173 yang sibuk merupakan konflik proses lokal, bukan kesalahan program belajar anak.
- Skrip preview boleh mencoba port berikutnya untuk pilihan bawaan, maksimal 4173–4183. Jangan menghentikan proses lain.
- PORT yang dipilih eksplisit harus dihormati: bila sibuk, tampilkan pesan singkat dengan exit bukan nol. Validasi nomor port sebelum membuka server.
- Pertahankan kompatibilitas Node.js 18+ dan Windows; gunakan API bawaan tanpa paket tambahan. Periksa HTTP setelah startup, konflik port eksplisit, konfigurasi tidak valid, serta batas fallback.
- Perbarui ZIP di branch downloads melalui commit baru; pertahankan hash dan riwayat upload sebelumnya.

- Produk: website pembelajaran coding anak kelas 3–5 SD.
- Tema lomba: Innovating Education Through Technology — Web Education for Kids.
- Aktivitas inti: robot mengantar buku ke perpustakaan melalui kartu perintah.
- Hipotesis yang diuji: simulasi gerak dan petunjuk bertahap dapat membantu anak memahami mengapa programnya salah.
- Versi pertama: enam misi, urutan, pengulangan, simulasi, petunjuk, ulangi, dan progres lokal.

## 2. Aturan teknis

- Gunakan HTML, CSS, dan JavaScript browser tanpa backend atau API berbayar.
- Pertahankan struktur sederhana: `index.html`, `src/app.js`, `src/style.css`, `scripts/build.mjs`, dan `docs/`.
- Jangan menambahkan login, tracking, data pribadi, atau dependensi yang tidak diperlukan.
- Utamakan semantic HTML, keyboard access, focus-visible, `aria-live`, dan `prefers-reduced-motion`.
- Jangan menggunakan emoji sebagai ikon struktural. Gunakan SVG inline dengan `aria-hidden` jika dekoratif.
- Jangan menyembunyikan hasil simulasi di balik warna saja; tulis status dengan kalimat.
- Pertahankan teks dalam bahasa Indonesia sederhana untuk anak.

## 3. Aturan pembelajaran

- Jangan langsung memperlihatkan jawaban lengkap ketika anak meminta petunjuk.
- Mulai petunjuk dari observasi, lalu arahkan ke jenis kesalahan, lalu beri target perubahan yang terbatas.
- Setelah misi selesai, misi berikutnya harus memakai posisi atau urutan berbeda namun konsep yang sama.
- Keberhasilan dinilai dari hasil simulasi, bukan hanya mencocokkan array jawaban.
- Hindari menghukum percobaan; tampilkan kesalahan sebagai bagian dari penyelidikan.

## 4. Aturan perubahan kode

1. Baca `docs/PRD.md` dan `design-system/detektif-bug/MASTER.md` sebelum mengubah UI.
2. Jelaskan asumsi singkat sebelum perubahan besar.
3. Ubah satu alur kecil pada satu waktu.
4. Jalankan pemeriksaan sintaks/build setelah perubahan.
5. Catat bug nyata, penyebab, perubahan, dan pemeriksaan di jurnal prompt.
6. Jangan mengarang hasil uji pengguna, hasil deployment, atau tautan.

## 5. Kriteria selesai

- `npm run build` berhasil dan `dist/` berisi file siap hosting.
- Misi salah dapat dijalankan tanpa error JavaScript.
- Kartu dapat ditambah, dinaikkan, diturunkan, dan dihapus melalui klik/touch.
- Tombol petunjuk, ulangi, dan jalankan memberi respons yang terlihat.
- Program benar membuka progres berikutnya dan tersimpan pada perangkat.
- Tampilan diperiksa pada lebar 375px, 768px, 1024px, dan layar besar.
- Dokumen README, PRD, AI Guide, log prompt mentah, dan jurnal terkurasi tersedia.

## 6. Batas bukti

AI Agent wajib membedakan:

- **Diverifikasi:** hasil perintah build, pemeriksaan file, atau uji browser yang benar-benar dijalankan.
- **Rencana:** deployment, uji dengan anak/guru, atau akses repo yang belum dilakukan.
- **Hipotesis:** asumsi dampak belajar yang belum diuji.

## 7. Ketentuan prompt lomba yang perlu diklarifikasi

Slide 5 PPT menyebut jurnal terkurasi “maks 5 prompt”, sedangkan slide 12 menyebut “Jurnal prompt terkurasi (5 prompt)”. Ini adalah perbedaan maksimal lima vs tepat lima yang perlu diklarifikasi ke panitia. Log mentah awal–akhir adalah lampiran terpisah untuk verifikasi, bukan dibatasi menjadi lima. Project menyimpan:

- `docs/PROMPT_LOG.md` untuk log mentah yang hanya berisi prompt yang benar-benar digunakan.
- `docs/SESSION_PROMPTS.md` untuk teks lengkap prompt dalam sesi penyempurnaan yang tersedia, termasuk prompt delegasi yang ditandai jelas.
- Bagian jurnal terkurasi berisi paling banyak lima prompt penting: ide/PRD, debugging, audit/optimasi, finishing, dan satu bebas.

Jika panitia memakai istilah “jumlah prompt” secara berbeda, peserta perlu meminta klarifikasi sebelum submit.

