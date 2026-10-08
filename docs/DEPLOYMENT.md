# Deployment

## Status nyata

Build static sudah dapat dibuat dengan `npm run build` dan menghasilkan `dist/`. Repository GitHub public dan URL hosting belum dibuat atau diverifikasi dari lingkungan kerja ini.

## Pilihan GitHub Pages

1. Buat repository GitHub baru dan jadikan **public**.
2. Push project ini tanpa memasukkan `dist/` karena folder tersebut dibuat oleh workflow.
3. Pada repository, pilih **Settings → Pages → GitHub Actions**.
4. Push ke branch `main` untuk menjalankan workflow `.github/workflows/deploy-pages.yml`.
5. Buka URL Pages yang diberikan GitHub dan uji jalur utama menggunakan `docs/TEST_GUIDE.md`.

## Pilihan static hosting lain

- Build command: `npm run build`
- Publish directory: `dist`
- Tidak ada environment variable yang dibutuhkan.

## Checklist sebelum menaruh URL di formulir lomba

- Repo dapat dibuka tanpa login dan benar-benar public.
- URL website dapat dibuka di mode incognito.
- Misi salah, petunjuk, jawaban benar, tombol ulangi, dan reload progres sudah dicoba dari URL deploy.
- URL yang dikumpulkan adalah hasil verifikasi, bukan URL contoh.
