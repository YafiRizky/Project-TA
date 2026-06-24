# Flow Admin/Owner — POS ML System

## A. REGISTRASI & LOGIN

### A1. Registrasi Akun Baru [OK]
```
Buka halaman Register
  → Isi: Nama Lengkap, Username, Email, No. Telepon, Password
  → Isi: Nama Usaha, Tipe Usaha (dropdown), Provinsi → Kota → Kecamatan (cascading dropdown), Alamat Detail
  → Klik "Daftar"
  → Backend: Buat BusinessUser + Business pertama (generate business_code unik)
  → Otomatis login dan redirect ke Portal Cabang (/businesses)
```

### A2. Login Admin [OK]
```
Buka halaman Login → Pilih Tab "Admin"
  → Isi: Username + Password (Tanpa Kode Bisnis)
  → Backend: Validasi kredensial Admin, generate JWT (access + refresh token) tanpa business_code
  → Redirect ke Portal Cabang (/businesses) untuk memilih bisnis yang ingin dikelola
```

---

## B. DASHBOARD ADMIN [OK]

### B1. Portal Cabang (Masuk Pertama Kali) [OK]
```
Login sebagai Admin
  → Tampil Portal Cabang (/businesses)
  → Melihat semua kartu cabang/bisnis yang dimiliki
  → Bisa buat bisnis baru dengan tombol "Buat Bisnis Baru"
  → Klik salah satu kartu bisnis → Fetch API /switch-branch/ → Generate JWT baru khusus bisnis tsb
  → Redirect ke Dashboard Bisnis
```

### B2. Melihat Dashboard Bisnis [OK]
```
Masuk ke salah satu cabang
  → Dashboard menampilkan:
     - Greeting + tanggal hari ini
     - 4 card statistik: Total Produk Aktif, Stok Perlu Diisi, Transaksi Hari Ini, Revenue Hari Ini
     - Warning stok rendah/habis (klikable → navigasi ke Inventory auto-edit)
     - Quick Actions: Kelola Produk, Cek Inventori, Transaksi, Laporan
```

### B2. Bell Notifikasi [OK]
```
Di semua halaman (TopBar):
  → Bell icon dengan badge angka merah (jumlah produk stok rendah/habis)
  → Klik bell → dropdown panel muncul
  → Tampil daftar produk: nama, kode, stok saat ini, min stok, status (HABIS/RENDAH)
  → Admin klik item → navigasi ke /inventory?highlight={id}&autoEdit=true
  → Auto-open edit batch modal untuk produk tersebut
```

---

## C. KELOLA PRODUK [OK]

### C1. Tambah Produk
```
Menu Produk → Klik "Tambah Produk"
  → Modal form muncul:
     - Kode: Auto-generate dari nama (read-only, bisa refresh)
     - Nama Produk (wajib)
     - Kategori (dropdown dari master kategori)
     - Supplier (dropdown dari master supplier)
     - Harga Beli (format Rp otomatis)
     - Harga Jual (format Rp otomatis)
     - Satuan (dropdown: PCS, BOX, KG, LITER, dll)
     - Min. Stok (default 0, helper text: "Pengingat Jumlah Minimal Stok")
     - Status: Aktif/Nonaktif
  → Klik Simpan
  → Backend: POST /api/products/ → buat produk baru
  → Tabel produk ter-refresh
```

### C2. Edit Produk
```
Tabel produk → Klik icon edit pada baris produk
  → Modal form terisi data produk (harga sudah di-parse dengan benar)
  → Kode produk read-only (tombol refresh disembunyikan saat edit)
  → Ubah data → Simpan
  → Backend: PUT /api/products/{id}/
```

### C3. Hapus Produk
```
Tabel produk → Klik icon hapus
  → Dialog konfirmasi muncul
  → Klik "Ya, Hapus"
  → Backend: DELETE /api/products/{id}/
```

---

## D. KATEGORI & SUPPLIER [OK]

### D1. Kelola Kategori
```
Menu Kategori → Tampil tabel daftar kategori
  → Tambah: Klik "Tambah" → isi nama & deskripsi → Simpan
  → Edit: Klik icon edit → ubah data → Simpan
  → Hapus: Klik icon hapus → konfirmasi → hapus
  → Backend: CRUD /api/products/categories/
```

### D2. Kelola Supplier
```
Menu Supplier → Tampil tabel daftar supplier
  → Tambah: Nama, Kontak Person, Telepon, Email, Alamat
  → Edit / Hapus seperti kategori
  → Backend: CRUD /api/products/suppliers/
```

---

## E. INVENTORI / BATCH [OK]

### E1. Tambah Batch Stok
```
Menu Inventori → Klik "Tambah Batch"
  → Modal form:
     - Pilih Produk (dropdown dari master produk, dengan kode)
     - Kode Batch: Auto-generate BTH-XXXXXX (bisa refresh)
     - Kuantitas (wajib)
     - Tanggal Beli (default hari ini)
     - Tanggal Kadaluarsa (opsional)
     - Harga Beli (auto-fill dari harga beli produk, bisa diubah per batch)
     - Status: Active/Expired/Depleted
  → Klik Simpan
  → Backend: POST /api/inventory/batches/
  → Tabel batch + card statistik ter-refresh
```

### E2. Tabel Batch dengan Status Stok
```
Tabel menampilkan kolom:
  Kode Batch | Produk | Qty | Tgl Beli | Tgl Kadaluarsa | Status Batch | Status Stok | Aksi
  
Status Stok dihitung dari total stok semua batch aktif vs min_stock produk:
  - HABIS (merah): total stok = 0
  - RENDAH (amber): total stok <= min_stock
  - AMAN (hijau): total stok > min_stock
```

### E3. Auto-Edit dari Dashboard/Bell
```
Dashboard klik warning stok / Bell klik item
  → Navigasi ke /inventory?highlight={productId}&autoEdit=true
  → Row produk di-highlight kuning 3 detik
  → Auto-open edit modal untuk batch pertama aktif produk tersebut
  → Jika tidak ada batch aktif, buka form tambah batch pre-filled dengan produk
```

---

## F. TRANSAKSI [OK]

### F1. Lihat Riwayat Transaksi
```
Menu Transaksi → Tabel semua transaksi
  Kolom: ID, Tanggal, Kasir, Jumlah Item, Total, Metode Bayar, Status
  → Klik baris → Detail transaksi (item, pembayaran, kembalian)
```

### F2. Void Transaksi
```
Detail transaksi → Klik "Void"
  → Dialog konfirmasi muncul
  → Isi alasan void
  → Backend: PATCH /api/transactions/{id}/void/ → status = VOIDED, stok dikembalikan
```

---

## G. LAPORAN [OK PARTIAL]

### G1. Lihat Laporan
```
Menu Laporan → Dashboard laporan:
  - Card ringkasan: Revenue, Transaksi, Item Terjual, Rata-rata
  - Chart garis: trend penjualan 7 hari
  - Chart pie: pembayaran per metode
  - Tabel produk terlaris
```

### G2. Export Laporan [BELUM]
```
[BELUM] Klik "Export Excel" → Download file .csv/.xlsx
[BELUM] Klik "Export PDF" → Download file .pdf
[BELUM] Filter periode custom (date range picker)
```

---

## H. KELOLA KASIR [OK]

### H1. Tambah Kasir
```
Menu Users → Klik "Tambah Kasir"
  → Isi: Nama, Username, Email, Password
  → Backend: POST /api/auth/register-kasir/
  → Kasir baru muncul di tabel, bisa login dengan kode bisnis + username + password
```

### H2. Toggle Aktif/Nonaktif Kasir
```
Tabel kasir → Toggle switch per baris
  → Backend: PATCH → is_active = true/false
  → Kasir nonaktif tidak bisa login
```

---

## I. PENGATURAN PEMBAYARAN [OK]

### I1. Cash Permanen (Built-in)
```
Menu Pengaturan Pembayaran → Card "Tunai (Cash)" selalu muncul di posisi pertama
  - Badge "Bawaan"
  - Tidak bisa dihapus, disable, atau edit
  - Selalu tersedia untuk kasir
```

### I2. Tambah Metode Lain
```
Klik "Tambah Metode" → Modal form:
  - Pilih tipe: QRIS, Transfer Bank, E-Wallet, Kartu Debit/Kredit
  - Nama metode (contoh: "BCA", "GoPay", "QRIS Toko")
  - Untuk Transfer/E-Wallet/Card: No. Rekening + Nama Pemilik
  - Untuk QRIS: Upload gambar QR code
  - Instruksi tambahan (opsional)
  → Simpan → Muncul di kasir saat checkout
```

### I3. Toggle/Hapus Metode
```
Setiap card metode (kecuali Cash) punya tombol:
  - Edit: ubah detail
  - Toggle: aktif/nonaktif (nonaktif tidak muncul di kasir)
  - Hapus: hapus permanen
```

---

## J. PROFIL ADMIN [OK]

### J1. Edit Data Pribadi
```
Menu Profil → Tab Data Pribadi:
  - Nama Lengkap, Username (read-only), Email
  → Ubah → Simpan → AuthContext ter-update
```

### J2. Edit Data Bisnis
```
Menu Profil → Tab Data Bisnis:
  - Nama Usaha, Tipe Usaha (dropdown), Provinsi/Kota/Kecamatan (cascading dropdown), Alamat
  → Ubah → Simpan → Sidebar nama bisnis ter-update real-time (event dispatch)
```

### J3. Ganti Password
```
Menu Profil → Tab Password:
  - Password Lama, Password Baru, Konfirmasi Password Baru
  → Backend: POST /auth/change-password/ (endpoint terpisah dari profile)
```

---

## K. FITUR BELUM DIIMPLEMENTASI

### K1. Stock Opname [BELUM]
```
[BELUM] Menu Stock Opname → Verifikasi stok fisik vs sistem
  → Input jumlah fisik per produk
  → Sistem hitung selisih (lebih/kurang)
  → Adjustment otomatis
```

### K2. Barcode Generate & Print [BELUM]
```
[BELUM] Saat tambah batch → Generate barcode per batch
  → Preview barcode visual
  → Download PDF untuk print sticker
```

### K3. Diskon per Transaksi [BELUM]
```
[BELUM] Di kasir, sebelum checkout:
  → Input diskon (nominal/persentase)
  → Grand total dikurangi diskon
```

### K4. Expired Warning [BELUM]
```
[BELUM] Dashboard menampilkan batch yang expired dalam 7 hari
  → Action: Diskon, Promo Bundle, Buang Batch
```

---

## L. FASE 2: MULTIPLE BISNIS [OK]

### L1. Kelola Cabang
```
[OK] Admin bisa buat bisnis/cabang baru dari Portal Cabang
  → Setiap cabang punya data terpisah 100% (produk, stok, kasir, transaksi)
  → Admin bebas berpindah cabang via tombol "Ganti Cabang" di Sidebar bawah
```

---

## M. FASE 3: ML PREDICTIONS [BELUM]

### M1. Demand Forecasting [BELUM]
```
[BELUM] Prediksi produk mana yang akan habis dalam 7 hari
  → Model: ARIMA / Prophet
  → Display: Card HIGH/MEDIUM/LOW risk
```

### M2. Restock Recommendation [BELUM]
```
[BELUM] Rekomendasi jumlah beli untuk 7 hari ke depan
  → Tabel: Produk, Stok, Prediksi Butuh, Rekomendasi Beli, Priority
```

### M3. Expiry Risk [BELUM]
```
[BELUM] Batch mana yang akan expired sebelum laku
  → Velocity vs days until expired
  → Action: Diskon, Bundle, Buang
```

### M4. Revenue Forecast [BELUM]
```
[BELUM] Prediksi pendapatan 30 hari ke depan
  → Chart line revenue forecast
  → Stats: prediksi revenue, profit, transaksi
```

### M5. Product Classification [BELUM]
```
[BELUM] Klasifikasi: Fast Moving, Slow Moving, Dead Stock
  → ABC Analysis (K-Means Clustering)
  → Action: Fokus fast moving, discontinue dead stock
```
