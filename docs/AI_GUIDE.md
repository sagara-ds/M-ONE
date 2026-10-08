# AI Guide — Detektif Bug

Dokumen ini menjadi acuan AI Agent untuk mengembangkan project setelah garis start lomba. Isinya adalah aturan kerja project, bukan bukti bahwa kode atau desain pernah dibuat sebelum garis start.

## 1. Konteks project

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

Panduan PPT menyebut jurnal prompt terkurasi “maks 5 prompt” dan pada saat yang sama meminta log prompt mentah awal–akhir untuk verifikasi. Project menyimpan:

- `docs/PROMPT_LOG.md` untuk log mentah yang hanya berisi prompt yang benar-benar digunakan.
- Bagian jurnal terkurasi berisi paling banyak lima prompt penting: ide/PRD, debugging, audit/optimasi, finishing, dan satu bebas.

Jika panitia memakai istilah “jumlah prompt” secara berbeda, peserta perlu meminta klarifikasi sebelum submit.

