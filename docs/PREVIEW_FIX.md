# Perbaikan EADDRINUSE pada preview

Laporan pengguna: Node.js v24.18.1 di Windows gagal membuka port 4173 karena port tersebut sudah dipakai. Ini tidak menunjukkan kerusakan simulasi robot.

Perubahan `scripts/preview.mjs`:

- Pilihan bawaan mencoba 4173, lalu 4174 sampai 4183 apabila sibuk. Alamat hanya dicetak setelah server berhasil berjalan.
- PORT eksplisit dihormati. Bila port itu sibuk, proses berhenti dengan exit 1 dan pesan singkat, tanpa stack error tidak tertangani.
- PORT harus angka 1–65535; konfigurasi kosong atau tidak valid ditolak sebelum membuka server.
- Tidak ada proses lama atau proses pihak lain yang dimatikan.

## Solusi langsung di komputer pengguna

Command Prompt:

```bat
set "PORT=4174"
npm run preview
```

PowerShell:

```powershell
$env:PORT = "4174"
npm run preview
```

Buka alamat yang dicetak setelah berhasil. Jika port 4174 juga sibuk, pilih 4175. Alternatif: tekan Ctrl+C pada terminal preview lama milikmu, lalu jalankan ulang. Jangan mematikan proses yang tidak dikenali.

Untuk mencoba fallback otomatis setelah memakai ZIP terbaru, hapus PORT dari sesi terminal. Command Prompt: `set "PORT="`. PowerShell: `Remove-Item Env:PORT`.

## Pemeriksaan nyata

Sembilan pemeriksaan integrasi Node v24.19.0 pada cloud Linux lulus: fallback saat port bawaan sibuk dan HTTP 200 untuk halaman/modul suara; startup pada port eksplisit tersedia; port eksplisit sibuk; lima input port tidak valid; serta semua 4173–4183 sibuk sehingga fallback berhenti pada batasnya. Listener uji dan proses anak yang dimulai pengujian dibersihkan; proses lain tetap berjalan.

Windows tidak tersedia di mesin pengujian. Kode memakai API HTTP/Node standar tanpa paket tambahan atau perintah khusus OS. Tidak ada perubahan pada source simulasi, audio, atau CSS; hasil 27 pemeriksaan mesin dan 30 pemeriksaan browser sebelumnya tetap dicatat sesuai run aslinya, bukan diklaim dijalankan ulang.
