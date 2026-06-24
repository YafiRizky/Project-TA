# 📋 Daftar Lengkap Fitur & Alur Sistem POS ML (Status: Juni 2026)

Dokumen ini membedah secara mendalam seluruh fitur di dalam Sistem Point of Sales (POS) yang sedang kita bangun. Setiap fitur dijelaskan dari dua sudut pandang: **Alur Bisnis** (bagaimana fitur ini memberi nilai/manfaat nyata bagi UMKM) dan **Alur Teknis** (bagaimana kode/sistem bekerja di belakang layar). Dokumen ini juga mencakup fitur-fitur lanjutan yang masuk dalam *roadmap* selanjutnya.

---

## 1. Keamanan & Autentikasi Induk (Auth & Security)

### 1.1. Registrasi Akun & Setup Bisnis Otomatis (✅ Implemented)
- **Alur Bisnis:** Pemilik usaha yang baru mendaftar cukup mengisi form sekali. Sistem secara ajaib akan langsung membuatkan profil admin (Owner) sekaligus membuatkan "Toko Pertama" untuknya. Pemilik tidak perlu repot melakukan setup awal yang rumit. Pemilik diberikan `Owner Code` (Kode unik Admin) sebagai kunci masternya.
- **Alur Teknis:** Frontend mengirim payload registrasi (`/api/auth/register/`). Di backend, view akan: (1) Membuat `BusinessUser` dengan role `admin` dan men-*generate* 6 karakter `owner_code`, (2) Membuat entitas `Business` baru dan men-*generate* 6 karakter `business_code`, (3) Menautkan Admin ke Bisnis tersebut via field `owned_businesses`.

### 1.2. Login Lapis Ganda dengan JWT (✅ Implemented)
- **Alur Bisnis:** Login dibagi menjadi dua gerbang:
  - **Gerbang Admin:** Menggunakan **Kode Admin** + Username + Password. Admin langsung masuk ke Lobi/Portal untuk melihat seluruh cabangnya.
  - **Gerbang Kasir:** Menggunakan **Kode Bisnis** + Username + Password. Pegawai hanya bisa mengakses cabang spesifik tempat dia ditugaskan, tidak bisa melihat data cabang lain atau data *owner*.
- **Alur Teknis:** Backend menggunakan custom `Backend Authentication` Django. Sistem memeriksa kombinasi `owner_code` (jika admin) atau `business_code` (jika kasir). Setelah valid, sistem mengeluarkan token **JWT (JSON Web Token)** (`access_token` dan `refresh_token`). Di dalam JWT *payload* ini, disematkan `role` dan `business_code` yang menjadi "KTP" digital selama user menggunakan aplikasi.

### 1.3. Multi-Branch / Manajemen Multi-Cabang (✅ Implemented)
- **Alur Bisnis:** Satu Pemilik Usaha dapat memiliki, memantau, dan mengontrol banyak cabang hanya dari 1 akun. Pemilik bisa berpindah antar cabang tanpa perlu *log out*.
- **Alur Teknis:** Di halaman `/businesses`, frontend memanggil API `/auth/me/businesses/`. Ketika Admin memilih cabang, frontend memanggil `/auth/switch-branch/`. Backend kemudian membuatkan JWT Token *baru* yang `business_code`-nya diubah sesuai cabang yang dipilih. Otomatis, semua panggilan API selanjutnya hanya akan mengembalikan data milik cabang tersebut (100% isolasi data).

### 1.4. Role-Based Access Control (RBAC) (✅ Implemented)
- **Alur Bisnis:** Mencegah pegawai biasa (Kasir) mengakses menu sensitif seperti Laporan Keuangan, Pengaturan Diskon, dan Manajemen Pengguna.
- **Alur Teknis:** Frontend menggunakan file `Sidebar.jsx` dan *Protected Routes* untuk menyembunyikan menu berdasarkan `role` di *local storage*. Backend memvalidasi setiap *request API* dengan *decorator/permission class* (`IsAdminOrReadOnly` dll) untuk memastikan kasir yang iseng menembak API langsung ditolak (HTTP 403 Forbidden).

---

## 2. Manajemen Data Induk (Master Data)

### 2.1. Manajemen Kategori & Supplier (✅ Implemented)
- **Alur Bisnis:** Membantu mengelompokkan barang dagangan agar mudah dicari di mesin kasir (Kategori), dan melacak dari pabrik/agen mana barang tersebut dibeli beserta kontaknya (Supplier).
- **Alur Teknis:** Endpoint CRUD standar (`/api/products/categories/` dan `/api/products/suppliers/`). Semua model diikat kuat dengan *Foreign Key* `business`, sehingga data Toko A tidak akan pernah tercampur dengan Toko B.

### 2.2. Manajemen Produk (✅ Implemented)
- **Alur Bisnis:** Tempat mendaftarkan barang jualan. Mengelola Harga Modal (HPP), Harga Jual, Satuan (Pcs, Box), dan Batas Stok Minimum. Admin bisa melihat margin keuntungannya (direncanakan).
- **Alur Teknis:** Model `Product` menyimpan data master. Terdapat *property* terhitung (`current_stock`) di *Serializer* yang melakukan query `Sum` (penjumlahan) dari seluruh *batch* aktif di inventori. Mendukung *barcode/SKU* untuk persiapan integrasi *scanner* fisik.

---

## 3. Inventori & Manajemen Stok (Inventory Core)

### 3.1. Pelacakan Stok Berbasis Batch / FIFO (✅ Implemented) - *Keunggulan Sistem*
- **Alur Bisnis:** Ini adalah fitur premium. Jika Anda membeli Indomie di bulan Januari (harga modal Rp 2.500, Exp: Des 2026) lalu beli lagi di Februari (harga modal Rp 2.600, Exp: Jan 2027), sistem tidak menggabungkannya begitu saja. Sistem mencatatnya sebagai 2 *batch* berbeda. Saat barang dijual, sistem otomatis memotong stok dari barang yang masuk lebih dulu (First-In-First-Out) agar tidak ada barang kedaluwarsa di gudang.
- **Alur Teknis:** Stok tidak disimpan sebagai angka mati di tabel `Product`. Melainkan direlasikan ke model `ProductBatch`. Saat transaksi POS terjadi, sistem (`transaction_views.py`) akan melakukan *looping* ke batch-batch tertua (`order_by('purchase_date')`), memotong stoknya, lalu pindah ke batch berikutnya jika batch pertama habis.

### 3.2. Penyesuaian Stok Fisik / Stock Opname (✅ Implemented)
- **Alur Bisnis:** Rutinitas akhir bulan. Kasir/Gudang menghitung fisik barang. Jika di komputer tercatat 10 tapi di rak ada 8 (mungkin dicuri/rusak), kasir membuat laporan *Stock Opname*. Laporan ini butuh persetujuan (Approve) dari Admin agar stok sistem berubah menjadi 8.
- **Alur Teknis:** Menggunakan model `StockOpname` (Header) dan `StockOpnameItem` (Detail). Sistem merekam `system_qty`, `actual_qty`, dan selisihnya (`difference`). Saat Admin menekan tombol "Approve", backend memanggil fungsi pengurang stok otomatis. (*Perlu perbaikan flow penambahan stok jika fisik > sistem*).

### 3.3. Riwayat Pergerakan Stok / Audit Trail (✅ Implemented)
- **Alur Bisnis:** Menjawab pertanyaan "Ke mana hilangnya 5 botol kecap?". Mencatat secara detail histori masuk-keluarnya barang: Penjualan, Restock, atau Penyesuaian (Opname).
- **Alur Teknis:** Model `InventoryMovement` mencatat setiap aksi (`IN`, `OUT`, `ADJ`) lengkap dengan *reference_id* (contoh: nomor struk transaksi) dan tanggal. Selalu *read-only*.

---

## 4. Sistem Transaksi (POS Core)

### 4.1. Point of Sales & Kalkulasi Dinamis (✅ Implemented)
- **Alur Bisnis:** Antarmuka mesin kasir untuk melayani pelanggan. Kasir klik barang -> masuk keranjang -> hitung total bayar -> hitung kembalian. Harus cepat dan tahan *lag*.
- **Alur Teknis:** UI React menangani pengelolaan *state* keranjang (*Cart*) di memori. Hanya menembak API `/api/transactions/` saat tombol "Proses Pembayaran" ditekan (mengurangi beban server). Database membungkus proses ini dalam `transaction.atomic()` — jika saat menyimpan struk listrik mati, seluruh proses dibatalkan otomatis (tidak ada stok yang terpotong setengah).

### 4.2. Manajemen Diskon Cerdas (✅ Implemented)
- **Alur Bisnis:** Admin dapat membuat promo seperti "Beli 3 Kopi, Diskon 10%". Kasir tidak perlu menghitung manual, komputer yang otomatis mengenali aturan promo saat barang di keranjang mencapai syarat minimum.
- **Alur Teknis:** Model `DiscountRule` menyimpan tipe (Persentase/Nominal), nilai, `min_quantity`, dan produk yang diikat (`ManyToMany`). Di frontend KasirPOS, ada logika yang melooping *cart* mencocokkan produk dengan *rules* aktif untuk menghitung `discount_amount` per baris item.

### 4.3. Metode Pembayaran & Cetak Struk (✅ Implemented)
- **Alur Bisnis:** Menyediakan opsi bayar Tunai, Transfer, E-Wallet, atau QRIS. Setelah lunas, pelanggan mendapat struk (bisa dicetak atau simpan gambar).
- **Alur Teknis:** *Hardcoded Enum* di transaksi saat ini. Struk dihasilkan di frontend menggunakan library `html2canvas` yang me-render div *hidden* berisi format HTML struk menjadi gambar/PDF untuk di-print.

---

## 5. Laporan & Keamanan Tingkat Lanjut

### 5.1. Laporan Penjualan (CSV/PDF) (✅ Implemented)
- **Alur Bisnis:** Admin bisa melihat total omzet, laba kotor, dan grafik tren per bulan. Data ini bisa di-download ke Excel (untuk pembukuan lanjutan) atau PDF (laporan rapat).
- **Alur Teknis:** ViewSet merangkum agregasi (`Sum`, `Count`) dari tabel `Transaction`. Fungsi ekspor di frontend mengubah data array JS menjadi format `.csv` atau `.pdf` (*menggunakan jsPDF*).

### 5.2. Audit Log Terpusat (✅ Implemented)
- **Alur Bisnis:** Keamanan ekstra untuk pemilik usaha. Setiap aksi penting (contoh: "Kasir A mengubah harga barang", "Admin B menghapus supplier") dicatat. Fitur anti-maling digital.
- **Alur Teknis:** Aplikasi Django `auditlog` mendengarkan setiap aksi lewat model *Signals* atau pemanggilan manual `log_action()`. Mencatat `user`, `action_type`, `model_name`, `target_id`, dan IP Address.

---

## 6. Rencana Peningkatan & Fitur Tahap Selanjutnya (Roadmap)

Sesuai dengan audit profesional (13 Juni 2026), berikut fitur yang belum terimplementasi sempurna atau belum ada, yang menjadi target kita selanjutnya:

### 🌊 Wave 2: Konsistensi & Polish (Tahap 1 Selanjutnya)
1. **Penyempurnaan Form Cabang (🔄 Belum):** Menyamakan detail form "Buat Cabang" di portal dengan form registrasi awal.
2. **Server-Side Pagination Transaksi (🔄 Belum):** Membatasi load data riwayat transaksi (misal 50 data per halaman) dari backend agar frontend tidak macet/crash saat ada ribuan data transaksi.
3. **Kalkulasi Profit Akurat (🔄 Belum):** Memperbaiki perhitungan Laporan Laba-Rugi agar dihitung berdasarkan harga asli saat transaksi terjadi (di `TransactionItem`), bukan harga yang sedang dipasang di master `Product`.

### 🌊 Wave 3: Quality of Life & Business Intelligence (Tahap 2 Selanjutnya)
1. **Onboarding Dashboard (🔄 Belum):** Petunjuk awal/panduan (*empty state*) bagi pengguna yang baru mendaftar (belum punya produk/transaksi).
2. **Margin Visibility (🔄 Belum):** Menampilkan kolom persentase Keuntungan (Profit Margin) di halaman manajemen produk. Sangat penting bagi keputusan bisnis.
3. **Perbaikan Flow Stock Opname (🔄 Belum):** Membuat mekanisme untuk MENAMBAH stok fisik ke sistem melalui pembuatan *batch* khusus, jika stok fisik lebih besar daripada stok di komputer.
4. **Validasi Keranjang Kasir (🔄 Belum):** Mencegah Kasir menekan "Bayar" jika kuantitas barang di keranjang melebihi stok aslinya.
5. **Ringkasan Shift Kasir (🔄 Belum):** Fitur sederhana untuk Kasir melakukan rekap tutup kasir (Z-Report) untuk serah terima *cash*.

### 🚀 Wave 4: Persiapan Fase 3 (Integrasi Canggih)
1. **Persiapan Model OTP & WA (🔄 Belum):** Membuat tabel untuk memverifikasi validitas Email dan Nomor Telepon/WA pemilik bisnis.
2. **Persiapan Payment Gateway (🔄 Belum):** Menambahkan field *Callback/Webhook URL* dan *Payment Reference* pada tabel transaksi untuk menerima status otomatis dari Midtrans/Xendit (QRIS Dinamis).
3. **Persiapan Endpoint Machine Learning (🔄 Belum):** Membuka rute API khusus (*read-only*) untuk mengirim data keranjang pelanggan yang aman (*anonymized data*) ke *engine* Python ML (Flask/FastAPI) untuk mendapatkan rekomendasi "Barang yang sering dibeli bersamaan".
4. **Cetak ESC/POS Struk Thermal (🔄 Belum):** Mengubah sistem cetak dari gambar/PDF menjadi format raw teks ESC/POS agar bisa di-print langsung dari printer thermal bluetooth/USB.
