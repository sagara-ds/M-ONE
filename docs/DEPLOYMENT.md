# Deployment

## Status terverifikasi — 9 Oktober 2026

Repository [sagara-ds/M-ONE](https://github.com/sagara-ds/M-ONE/tree/main) merespons HTTP 200 tanpa token pada halaman public. Metadata GitHub menyatakan `repository_public=true`. Branch `main` yang dipakai sebagai dasar adalah `392e25df916d9b2f3b2630dfeae5810c06c6061b`; riwayat asli dari ZIP tetap menjadi leluhurnya. Perluasan 0.2.0 mengikuti branch ini dan menggunakan push biasa, tanpa force push.

Build statis menghasilkan `dist/`, termasuk 12 misi, modul progres dan suara, font lokal, serta favicon. Aplikasi diuji melalui server lokal; bukti tersimpan di `VALIDATION.md`. GitHub Pages belum berhasil diverifikasi sebagai website publik.

Run [37801683837](https://github.com/sagara-ds/M-ONE/actions/runs/37801683837) untuk commit dasar gagal pada Configure Pages: **“Get Pages site failed… Pages enabled and configured to build using GitHub Actions… Not Found”**. Halaman run ini berhasil dibaca pada 9 Oktober. Pemeriksaan langsung calon domain Pages dari cloud ditolak proxy dengan CONNECT 403, sehingga itu bukan bukti website aktif atau mati.

## Mengaktifkan GitHub Pages

1. Pada repository, buka **Settings → Pages → Build and deployment → Source: GitHub Actions**. Langkah ini memerlukan akses pengaturan repository; akses Git untuk push tidak otomatis menyediakan akses admin Pages.
2. Buka [Actions](https://github.com/sagara-ds/M-ONE/actions/workflows/deploy-pages.yml), pilih workflow **Deploy Detektif Bug**, lalu **Run workflow** pada `main`, atau jalankan ulang run setelah Pages aktif.
3. Workflow menjalankan `npm test`, build statis, unggah artifact `dist/`, lalu deploy. Periksa kedua job sampai berhasil.
4. Gunakan URL website yang benar-benar diberikan oleh GitHub Pages. Buka tanpa login dan jalankan smoke test pada `TEST_GUIDE.md`.

Opsi `enablement` milik `actions/configure-pages@v5` membutuhkan token selain `GITHUB_TOKEN` dengan izin pengaturan Pages. Proyek ini tidak menambahkan token baru; pilih konfigurasi melalui Settings agar tidak menyimpan kredensial dalam kode. Acuan resmi: [action.yml](https://github.com/actions/configure-pages/blob/v5/action.yml).

## Menjalankan atau memakai hosting statis lain

- `npm test` lalu `npm run build`.
- Publish directory: `dist`.
- Tidak diperlukan environment variable, login, backend, atau API berbayar.
- Untuk preview lokal, `npm run preview`; port bawaan sibuk akan mencoba port berikutnya sampai 4183.

## Sebelum mengumpulkan URL lomba

- Repository dapat dibuka tanpa login dan benar-benar public. Tanggal pembuatan repository masih perlu diperiksa terhadap aturan lomba; waktu commit tidak membuktikan tanggal pembuatan repo.
- URL website sudah dibuka dalam mode incognito; jangan memakai URL contoh sebagai bukti deployment.
- Coba program salah, petunjuk, solusi benar, pertanyaan konsep, ulangi, dan reload progres dari URL hosting.
- Pastikan misi 12, tiga lencana, serta layout ponsel bekerja pada build yang terbit.
- Jangan mengubah tanggal commit atau riwayat demi memenuhi ketentuan waktu lomba. Bundle asli tersimpan di `docs/provenance/original-history.bundle`.
