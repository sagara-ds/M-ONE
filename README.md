# Detektif Bug

Website belajar coding untuk anak kelas 3–5 SD. Anak membantu robot mengantar buku ke perpustakaan dengan menemukan dan memperbaiki kesalahan pada kartu perintah.

## Status

Versi pertama berisi enam misi tentang urutan dan pengulangan, simulasi robot, petunjuk bertahap, kontrol susunan kartu, tombol ulangi, dan penyimpanan progres di perangkat.

Hipotesis manfaat belajar belum dianggap terbukti sebelum ada uji dengan anak atau guru.

## Menjalankan lokal

Prasyarat: Node.js 18+.

```powershell
npm run build
npm run preview
```

Lalu buka alamat yang ditampilkan oleh server preview. Tanpa Node.js, file `index.html` juga dapat dilayani oleh static server sederhana.

## Struktur

- `index.html` — shell halaman.
- `src/app.js` — data misi, mesin simulasi, dan interaksi.
- `src/style.css` — token visual dan layout responsif.
- `scripts/build.mjs` — build statis tanpa bundler eksternal.
- `docs/PRD.md` — kebutuhan produk dan kriteria sukses.
- `docs/AI_GUIDE.md` — acuan AI Agent.
- `docs/PROMPT_LOG.md` — jurnal terkurasi dan log mentah.
- `docs/TEST_GUIDE.md` — panduan uji anak/guru dan smoke test.
- `design-system/detektif-bug/MASTER.md` — keputusan visual hasil pencarian UI/UX.

## Perintah

```powershell
npm run build
npm run preview
```

`npm run build` membuat folder `dist/` yang siap diunggah ke static hosting. Deployment nyata, tautan repo public, dan URL hosting belum dicantumkan sampai benar-benar dilakukan dan diverifikasi.

## Aturan lomba yang dijadikan acuan

Panduan PPT menyebut repo harus public, website harus dapat diakses melalui hosting, docs acuan AI dan jurnal prompt harus dilampirkan, serta hasil dibuat dari nol setelah 5 Oktober 2026 pukul 09.30 WIB. Panduan juga membedakan jurnal terkurasi maksimal lima prompt dari log mentah awal–akhir. Lihat `docs/AI_GUIDE.md` dan `docs/PROMPT_LOG.md` untuk cara menjaganya tetap dapat diaudit.

