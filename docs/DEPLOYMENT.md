# Deployment

## Status nyata

Build statis menghasilkan `dist/`, termasuk modul suara, font lokal, dan favicon. Aplikasi diverifikasi melalui server lokal; belum ada deployment publik yang diverifikasi dalam sesi ini. Remote `sagara-ds/M-ONE` dapat dibaca, tetapi belum mengembalikan commit/branch saat diperiksa. Status public dan tanggal pembuatan repository GitHub belum diperiksa secara independen.

## Pilihan GitHub Pages

1. Gunakan repository lomba yang dibuat setelah garis start dan jadikan **public**; periksa tanggal pembuatannya.
2. Pertahankan empat commit asli dari ZIP peserta sebelum menambahkan perubahan sesi ini. `docs/provenance/original-history.bundle` menyimpan history asli yang terverifikasi sebagai bundle. Jangan reset, force push, mengubah tanggal commit, atau mengganti history lama dengan satu commit baru. Checkout cloud dan history arsip saat ini terpisah; lihat `PROVENANCE.md`.
3. Commit perubahan dengan waktu nyata lalu push ke `main`, tanpa memasukkan `dist/` karena folder tersebut dibuat workflow. Tidak ada push yang dilakukan dalam sesi penyempurnaan ini.
4. Pada repository, pilih **Settings → Pages → GitHub Actions**.
5. Push ke branch `main` untuk menjalankan workflow `.github/workflows/deploy-pages.yml`.
6. Buka URL Pages yang diberikan GitHub dan uji jalur utama menggunakan `docs/TEST_GUIDE.md`.

## Pilihan static hosting lain

- Build command: `npm run build`
- Publish directory: `dist`
- Tidak ada environment variable yang dibutuhkan.

## Checklist sebelum menaruh URL di formulir lomba

- Repo dapat dibuka tanpa login dan benar-benar public.
- URL website dapat dibuka di mode incognito.
- Misi salah, petunjuk, jawaban benar, tombol ulangi, dan reload progres sudah dicoba dari URL deploy.
- URL yang dikumpulkan adalah hasil verifikasi, bukan URL contoh.
