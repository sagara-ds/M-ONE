# Asal proyek dan riwayat

## Kelanjutan pada main — 9 Oktober 2026

Peserta sudah membuat `main` pada commit `392e25df916d9b2f3b2630dfeae5810c06c6061b`, dengan commit asli `e3b6eae` sebagai parent. Perluasan 12 misi memakai `main` ini sebagai dasar; checkout cloud kini juga berada pada branch `main` dengan empat commit asli tetap sebagai leluhur. Catatan tentang checkout `work` tanpa commit di bawah menjelaskan kondisi pada sesi sebelumnya. Source peserta tidak di-reset atau ditimpa dari bundle; riwayat tetap tersambung.

Repository public telah diverifikasi dari metadata halaman GitHub pada sesi upload dan 9 Oktober. Tanggal pembuatan repository belum diverifikasi secara independen. Hosting belum terverifikasi berhasil; status dan penyebab kegagalan Pages dicatat di `DEPLOYMENT.md`.

## Riwayat impor dan penyempurnaan — 8 Oktober 2026

Kode dasar berasal dari `Innovating-M-ONE.zip` yang diunggah peserta dalam sesi 8 Oktober 2026. Penyempurnaan suara/animasi dilakukan pada kode itu setelah membaca panduan PPT serta memperbarui PRD dan AI Guide. Tidak ada klaim bahwa kode dasar dibuat oleh sesi ini.

SHA-256 ZIP asli: `7adadd08480612cb43cd3920ba84ccbfba632d27c3f72e8fbc7040d9d96d5454`.

Metadata Git asli diperiksa baca-saja; empat commit tersimpan dalam `docs/provenance/original-history.bundle`. Perintah `git bundle verify` berhasil dan menyatakan bundle memiliki history lengkap. Bundle tidak memuat perubahan baru sesi ini.

| Commit asli | Waktu author/committer (WIB) | Pesan |
| --- | --- | --- |
| `7e9328d1cc95accd70c0db5b2f7a19d6be139e28` | 8 Oktober 2026 18.38.20 | feat: build Detektif Bug learning experience |
| `b810cd041af7d84084bafe0781ffafdc3b7f0b7c` | 8 Oktober 2026 18.39.02 | fix: support subpath hosting assets |
| `01b9da5251a5b789af0ec846b912d0913560158f` | 8 Oktober 2026 18.40.44 | docs: keep prompt journal auditable |
| `e3b6eae61037455379a2cb644e79ed6b030cc014` | 8 Oktober 2026 18.41.10 | docs: record complete initial prompt |

Ini membuktikan metadata yang tersimpan dalam arsip, bukan verifikasi independen atas tanggal pembuatan repository GitHub atau keaslian seluruh proses. Simpan ZIP asli dan ekspor chat sebelumnya sebagai bukti tambahan.

Checkout cloud `/workspace/M-ONE` sebelumnya memiliki branch `work` tanpa commit. Source diimpor tanpa menimpa `.git` cloud. Riwayat original bundle dan checkout cloud tetap terpisah. Untuk melanjutkan di komputer peserta, terapkan source hasil penyempurnaan pada checkout asli yang masih memiliki keempat commit tersebut, lalu commit perubahan dengan tanggal sebenarnya. Jangan menyalin `.git` cloud ke checkout asli.

Jika hanya bundle yang tersedia, pulihkan **ke direktori baru** (bukan menimpa pekerjaan yang ada), lalu terapkan file source baru:

```bash
git clone docs/provenance/original-history.bundle /tmp/detektif-history-restored
git -C /tmp/detektif-history-restored log --oneline
```

Saat penyempurnaan awal 8 Oktober, belum ada push/deployment. Pengunggahan ZIP berikutnya tercatat di `GITHUB_DOWNLOADS.md`; kelanjutan 12 misi memakai main seperti dijelaskan di atas. Tidak ada riwayat yang ditulis ulang atau tanggal commit yang dimanipulasi. URL hosting tetap harus dibuktikan sebelum submit. Ketentuan jumlah prompt terkurasi perlu klarifikasi: slide 5 maksimal lima, slide 12 lima. Batas pengumpulan 15 Oktober 2026 pukul 15.30 WIB.
