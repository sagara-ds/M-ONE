# Aset pihak ketiga

Font yang sudah dipilih dalam desain awal kini dilayani dari `public/fonts/` supaya tampilan tidak bergantung pada koneksi Google Fonts.

| Font | Sumber paket | Versi | Berkas yang dipakai |
| --- | --- | --- | --- |
| Baloo 2 | `@fontsource/baloo-2` di registry.npmjs.org | 5.3.0 | Latin, normal, 700 |
| Comic Neue | `@fontsource/comic-neue` di registry.npmjs.org | 5.3.0 | Latin, normal, 400 dan 700 |

Berkas lisensi masing-masing font disimpan berdampingan dengan font di `public/fonts/`. Paket diambil melalui npm dengan verifikasi integritas bawaan; bukan dependensi runtime website.

Robot, ikon SVG, favicon, efek partikel, dan bunyi oscillator dibuat melalui kode proyek. Narasi menggunakan suara yang disediakan browser/perangkat, bukan rekaman atau API berbayar. Ketersediaan narasi dan pemrosesan suara mengikuti browser/perangkat pengguna.
