# DompetQu — PWA Keuangan Pribadi

Aplikasi pencatatan keuangan pribadi berbasis HTML, CSS, dan JavaScript. Bisa dipasang sebagai aplikasi PWA dan di-deploy langsung ke Vercel.

## Fitur
- Ringkasan saldo, pemasukan, pengeluaran, dan total tabungan.
- Tambah, edit, hapus, cari, dan filter transaksi.
- Anggaran bulanan per kategori dengan indikator penggunaan.
- Target tabungan, progres, dan penambahan dana.
- Laporan pengeluaran per kategori.
- Ekspor transaksi ke CSV.
- Backup dan restore data melalui JSON.
- Penyimpanan lokal browser (`localStorage`).
- PWA: installable dan cache offline dasar.

## Menjalankan di VS Code
1. Ekstrak ZIP ini.
2. Buka folder `dompetqu` di VS Code.
3. Jalankan dengan ekstensi **Live Server** (klik kanan `index.html` → Open with Live Server).
4. Jangan membuka `index.html` langsung dengan `file://` jika ingin menguji PWA/service worker.

## Deploy ke GitHub dan Vercel
1. Buat repository baru di GitHub.
2. Upload/push seluruh isi folder ini ke root repository (pastikan `index.html` berada di root).
3. Di Vercel pilih **Add New → Project**, lalu import repository GitHub tersebut.
4. Framework Preset: **Other**.
5. Build Command: kosongkan / None.
6. Output Directory: `.` (root).
7. Klik Deploy. Setiap push berikutnya akan memicu deployment otomatis.

## Catatan penting privasi
- Data transaksi disimpan di browser/perangkat yang sedang digunakan, bukan di akun online.
- Data tidak otomatis tersinkron ke HP/laptop lain. Gunakan Backup JSON untuk memindahkan data.
- Hapus data browser/site data dapat menghapus catatan lokal. Buat backup secara berkala.
- Jangan memasukkan PIN, password bank, nomor kartu, atau informasi rahasia.
- Untuk penggunaan nyata, pertimbangkan keamanan tambahan dan backend terautentikasi sebelum menyimpan data sensitif.

## Struktur folder
```text
dompetqu/
├── index.html
├── style.css
├── app.js
├── manifest.webmanifest
├── sw.js
├── vercel.json
├── README.md
└── icons/
    ├── icon-192.png
    └── icon-512.png
```
