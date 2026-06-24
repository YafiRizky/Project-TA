# BUSINESS STORY & FEATURES DOCUMENTATION
## POS ML System - Point of Sale dengan Machine Learning Demand Forecasting

**Date:** 7 Februari 2026  
**Target Market:** UMKM Indonesia (Warung, Toko Fotocopy, Minimarket Kecil)

---

## Cerita Bisnis: Pak Budi dan Toko Fotocopy-nya

### Latar Belakang

Pak Budi adalah pemilik toko fotocopy "Budi Copy Center" di dekat kampus. Sudah 5 tahun dia menjalankan bisnis ini. Selain jasa fotocopy dan print, Pak Budi juga menjual alat tulis, minuman, dan snack untuk mahasiswa.

Setiap hari, Pak Budi menghadapi rutinitas yang sama: melayani pelanggan dari pagi sampai malam, mencatat transaksi manual di buku kas, dan menghitung uang di akhir hari. Terkadang, hasil hitungan tidak cocok dengan catatan. "Kemana hilangnya Rp 50.000 tadi?" - pertanyaan yang sering muncul.

### Problem yang Dihadapi

**Masalah 1: Pencatatan Transaksi Manual**

Setiap kali ada pelanggan beli pulpen atau minum, Pak Budi tulis di buku:
```
Tanggal 5 Feb 2026
- Pulpen Pilot Rp 5.000
- Aqua botol Rp 3.000
- Fotocopy 10 lembar Rp 1.000
Total: Rp 9.000
```

Kalau sepi, tidak masalah. Tapi kalau ramai (ujian semester tiba), Pak Budi sering lupa mencatat. Akhir bulan bingung, "Kok untungnya cuma segini? Padahal ramai terus."

**Masalah 2: Stok Barang Tidak Terkontrol**

Pak Budi sering mengalami situasi ini:
- **Kehabisan stok mendadak**: "Maaf mbak, kertas A4 habis. Besok ya." Pelanggan pergi ke toko sebelah.
- **Barang menumpuk**: Beli tinta printer 50 botol karena dapat diskon. Ternyata 6 bulan kemudian masih sisa 30 botol, beberapa sudah kering.
- **Barang kadaluarsa**: Snack yang sudah expired terpaksa dibuang. Rugi Rp 200.000.

Setiap minggu, Pak Budi harus cek stok manual:
1. Buka lemari
2. Hitung satu-satu
3. Tulis di buku stok
4. Bandingkan dengan minggu lalu
5. Putuskan mau beli apa

Proses ini makan waktu 3-4 jam setiap minggu.

**Masalah 3: Tidak Tahu Barang Apa yang Laris**

Pak Budi sering bingung:
- "Pulpen warna apa yang paling laku ya? Hitam atau biru?"
- "Snack apa yang paling sering dibeli mahasiswa?"
- "Jam berapa biasanya paling ramai?"

Dia cuma bisa mengandalkan "feeling" untuk order barang. Kadang benar, kadang salah.

**Masalah 4: Kasir yang Tidak Dipercaya Penuh**

Pak Budi punya 2 karyawan part-time (Sari dan Dedi) untuk jaga shift siang. Kadang Pak Budi tidak bisa monitor:
- Apakah mereka catat semua transaksi?
- Apakah uangnya cocok dengan laporan?
- Apakah ada barang yang hilang?

Pak Budi ingin percaya, tapi juga ingin ada sistem yang transparan.

**Masalah 5: Keputusan Bisnis Berdasarkan Feeling**

Ketika mau order barang ke supplier:
- "Kayaknya minggu depan ujian, beli kertas A4 banyakan ya. Berapa kotak ya? 20 kotak aja deh."
- Ternyata ujian online, kertas tidak laku. Rugi modal.

Atau sebaliknya:
- "Bulan ini order pulpen 50 batang aja, cukup lah."
- Ternyata ada proyek mahasiswa, minggu kedua sudah habis. Pelanggan beli di toko sebelah.

### Mimpi Pak Budi

Pak Budi ingin:
1. **Otomatis**: Setiap transaksi tercatat otomatis, tidak perlu tulis manual.
2. **Terkontrol**: Tahu stok real-time tanpa harus buka lemari dan hitung manual.
3. **Cerdas**: Sistem kasih tau "Pak, minggu depan perlu order pulpen 100 batang nih" berdasarkan data penjualan.
4. **Transparan**: Bisa lihat laporan penjualan harian, siapa kasir yang jaga, berapa transaksi.
5. **Hemat waktu**: Yang tadinya cek stok 4 jam, sekarang tinggal buka laptop 5 menit.

### Solusi: POS ML System

Sistem Point of Sale (POS) dengan Machine Learning yang kami buat untuk Pak Budi dan UMKM seperti dia.

**Cara Kerja Sederhana:**
1. Kasir (Sari/Dedi) scan barcode produk atau input manual
2. Sistem otomatis catat transaksi, kurangi stok, hitung total
3. Setiap malam, sistem Machine Learning analisis data penjualan
4. Esok pagi, Pak Budi buka dashboard, sudah ada rekomendasi: "Order pulpen hitam 50 batang, aqua 3 dus, kertas A4 10 rim"
5. Pak Budi cuma perlu approve, kirim PO ke supplier. Selesai.

**Hasil Setelah 6 Bulan Pakai:**
- **Profit naik 51%**: Tidak ada lagi barang expired terbuang, tidak ada lagi kehabisan stok
- **Waktu cek stok: 4 jam → 5 menit**: Tinggal buka laptop, semua data sudah ada
- **Keputusan berdasarkan data**: Tidak perlu "feeling" lagi, ML sudah prediksi demand


---

## User Roles & Access

System ini punya 2 role utama:

### 1. KASIR (Sari & Dedi)
**Akses:**
- Login dengan username dan password sendiri
- Melayani transaksi di mesin kasir (scan barcode, input manual, hitung total, terima pembayaran)
- Cek stok produk (lihat saja, tidak bisa edit)
- Lihat riwayat transaksi yang mereka buat
- Ubah password sendiri

**Tidak Bisa:**
- Lihat laporan keuangan
- Edit/hapus produk
- Lihat prediksi ML
- Atur user lain
- Export data

**Kenapa Dibatasi?**
Pak Budi ingin Sari dan Dedi fokus melayani pelanggan. Urusan strategis (laporan, prediksi, order barang) adalah tanggung jawab owner.

### 2. ADMIN (Pak Budi - Owner)
**Akses:**
- Semua yang bisa dilakukan Kasir
- **PLUS** akses strategis:
  - Dashboard bisnis (total penjualan, profit, tren)
  - Prediksi ML demand forecasting
  - Manajemen produk (tambah, edit, hapus, atur harga)
  - Manajemen inventori (transfer stok antar cabang, adjustment, cek batch/expired)
  - Laporan lengkap (penjualan, inventori, waste analysis)
  - Purchase Order (order dari supplier)
  - Manajemen user (tambah kasir baru, nonaktifkan, ubah role)
  - Pengaturan sistem

**Kenapa Perlu Semua Akses?**
Pak Budi adalah owner. Dia perlu lihat "big picture" dan ambil keputusan bisnis. ML predictions adalah fitur kunci untuk bantu dia putuskan order apa, kapan, berapa banyak.

---

## Fitur-Fitur System (Detailed)

### LOGIN PAGE

**Tampilan:**
- Halaman selamat datang dengan ilustrasi kasir modern
- **TAB SELECTOR**: Pilih antara "Admin" atau "Kasir" sebelum login
- Form input: Username, Password
- Checkbox "Ingat saya di perangkat ini" (optional)
- Link "Lupa password?"
- Button "Login" (biru, full width)

**Behavior:**
- User pilih role (Admin/Kasir) via tab → Input username/password → Klik Login
- Sistem validasi ke backend: POST /api/auth/login/
- Jika benar → Simpan token JWT + user data di localStorage → Redirect:
  - Jika pilih Admin → /admin/dashboard
  - Jika pilih Kasir → /kasir/transaksi
- Jika salah → Tampilkan error message: "Username atau password salah"

**Kenapa Design Ini?**
- **1 gate untuk 2 role**: Lebih simple untuk maintenance (1 login page saja)
- **Tab selector visible**: User tahu role apa yang mereka pilih sebelum login
- **Security**: Password tidak terlihat (password input type), session timeout otomatis

---

## FITUR KASIR (Sari & Dedi)

### 1. TRANSAKSI POS (Halaman Paling Penting!)

**Deskripsi:**
Halaman utama untuk melayani pelanggan. Kasir scan barcode atau cari produk manual, masukkan ke keranjang, hitung total, terima pembayaran.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [60% Kiri]                │ [40% Kanan]                  │
│ Search Bar (barcode/nama) │ Keranjang                    │
│ [Product Grid]            │ - Produk A  x2  Rp 10.000    │
│  [Card][Card][Card]       │ - Produk B  x1  Rp 5.000     │
│  [Card][Card][Card]       │ ──────────────────────────   │
│  [Card][Card][Card]       │ Subtotal: Rp 15.000          │
│                           │ Diskon: [___] %              │
│                           │ Total: Rp 15.000 (BESAR)     │
│                           │ [BAYAR SEKARANG] (hijau)     │
└─────────────────────────────────────────────────────────┘
```

**Flow Transaksi:**

1. **Cari Produk**
   - Kasir ketik nama produk di search bar: "pulpen pilot"
   - Atau scan barcode dengan barcode scanner USB
   - Sistem tampilkan hasil search dalam bentuk grid cards

2. **Tambah ke Keranjang**
   - Klik card produk → Otomatis masuk keranjang qty 1
   - Atau klik tombol "+" di card → Langsung tambah qty

3. **Atur Quantity**
   - Di keranjang, ada tombol [-] dan [+]
   - Klik [+] → Qty naik (maksimal sesuai stok tersedia)
   - Klik [-] → Qty turun (minimal 1, kalau mau hapus klik icon sampah)

4. **Hapus Item**
   - Klik icon sampah di sebelah kanan item → Konfirmasi "Hapus item ini?" → Ya/Tidak

5. **Diskon (Optional)**
   - Input persentase diskon (misal: 10 untuk 10%)
   - Sistem otomatis hitung: Total = Subtotal - (Subtotal × Diskon%)
   - Jika diskon >50%, tampilkan warning: "Diskon terlalu besar, konfirm ke owner dulu"

6. **Bayar**
   - Klik "BAYAR SEKARANG" → Muncul modal payment
   - Modal isi:
     * Total tagihan: Rp 15.000 (bold, besar)
     * Uang diterima: [Input, auto focus]
     * Kembalian: Rp 5.000 (hijau kalau pas/lebih, merah kalau kurang)
     * Metode pembayaran: Radio button (Cash / Debit / QRIS)
     * Button: Cancel (abu) | Konfirm (hijau, disabled kalau uang kurang)

7. **Selesai**
   - Sistem POST ke API: /api/transactions/
   - Backend simpan transaksi, kurangi stok otomatis
   - Tampilkan notifikasi: "Transaksi berhasil! Invoice: #INV-2026-001"
   - Keranjang otomatis kosong, siap untuk transaksi baru
   - Optional: Print struk (kirim ke thermal printer atau simpan PDF)

**Keyboard Shortcuts:**
- `Alt+S`: Fokus ke search bar
- `Alt+C`: Clear keranjang (dengan konfirmasi)
- `Alt+P`: Buka modal payment
- `Esc`: Tutup modal/dialog

**Validasi:**
- Tidak bisa tambah qty melebihi stok tersedia
- Tidak bisa checkout kalau keranjang kosong
- Tidak bisa konfirm payment kalau uang diterima kurang dari total

**Edge Cases:**
- Kalau stok produk habis saat di keranjang → Tampilkan alert: "Stok [Produk A] habis, item dihapus dari keranjang"
- Kalau koneksi internet putus → Tampilkan "Mode offline aktif, transaksi akan tersimpan lokal dan sync otomatis nanti"

---

### 2. CEK STOK CEPAT

**Deskripsi:**
Kasir kadang ditanya pelanggan: "Mbak, stok kertas A4 masih ada berapa?" Daripada buka lemari cek manual, langsung buka halaman ini.

**Fitur:**
- Search bar: Ketik nama produk atau SKU
- Hasil search tampil sebagai tabel atau card list
- Kolom: Nama Produk | SKU | Kategori | Stok Saat Ini | Status
- Status indicator:
  - **Hijau "Stok Aman"**: Qty >20
  - **Kuning "Stok Sedikit"**: Qty 5-20
  - **Merah "Stok Habis"**: Qty <5

**Filter:**
- Kategori: Dropdown (Semua / Alat Tulis / Minuman / Snack / Fotocopy)
- Status: Button group (Semua / Aman / Sedikit / Habis)
- Sort: Nama A-Z | Stok terendah dulu

**Klik Produk:**
- Muncul modal detail:
  - Foto produk
  - Nama, SKU, kategori
  - Stok di cabang ini
  - Batch info (jika ada): "Batch #001 exp: 15 Maret 2026"
  - Lokasi rak (jika diisi): "Rak A-3"

**Use Case:**
> Pelanggan: "Mbak, pulpen hitam ada berapa?"  
> Sari: (Buka Cek Stok, search "pulpen hitam") "Ada 45 batang pak, aman."  
> Pelanggan: "Oke saya ambil 10 ya"

---

### 3. RIWAYAT TRANSAKSI (Kasir View)

**Deskripsi:**
Kasir bisa lihat transaksi yang mereka buat hari ini atau minggu ini. Berguna kalau ada pelanggan komplain: "Tadi saya kan beli 3 pulpen, kok cuma dapat 2?"

**Fitur:**
- Filter tanggal: Hari Ini | Minggu Ini | Custom (date range picker)
- Total sales badge: "Total: Rp 1.500.000" (untuk boost motivasi kasir)
- Card list transaksi (stack vertical):
  - Invoice number: #INV-2026-001
  - Timestamp: 7 Feb 2026, 14:30
  - Item count: "3 items"
  - Total: Rp 150.000
  - Payment method badge: Cash (hijau) | Debit (biru) | QRIS (ungu)
  - Button "Lihat Detail"

**Klik "Lihat Detail":**
- Modal muncul dengan:
  - Invoice number (header)
  - Timestamp lengkap
  - Tabel items: Produk | Qty | Harga Satuan | Subtotal
  - Subtotal, Diskon (jika ada), Total
  - Payment info: Method, Uang Diterima, Kembalian
  - Button "Print Ulang"

**Use Case:**
> Pelanggan pulang 5 menit lalu, balik lagi: "Mbak, struk saya ketinggalan"  
> Sari: (Buka Riwayat, cari transaksi terakhir) → Print ulang → Selesai

---

### 4. PROFIL KASIR

**Deskripsi:**
Halaman simple untuk kasir lihat info diri sendiri dan ubah password.

**Isi:**
- Avatar (inisial nama, misal: "S" untuk Sari)
- Nama lengkap: Sari Wulandari
- Username: sari.kasir
- Role: **Kasir** (badge biru)
- Cabang: Budi Copy Center - Kampus A

**Actions:**
- Button "Ubah Password" → Muncul modal:
  - Password lama (input)
  - Password baru (input, min 8 karakter)
  - Konfirmasi password baru (input, harus sama)
  - Validasi: Show error kalau tidak match atau kurang dari 8 karakter
  - Button: Batal | Simpan
- Button "Logout" (merah) → Konfirmasi: "Yakin mau logout?" → Ya/Tidak

**Security:**
- Session timeout: Jika 30 menit tidak ada aktivitas, otomatis logout
- Password harus min 8 karakter, kombinasi huruf+angka
- Password lama wajib diisi (untuk validasi identitas)

---

## FITUR ADMIN (Pak Budi - Owner)

### 1. DASHBOARD BISNIS (Overview)

**Deskripsi:**
Halaman pertama yang Pak Budi lihat setiap pagi. Semacam "health check" bisnis.

**Layout:**

**Section 1: Metric Cards (4 Cards, Horizontal)**

1. **Total Penjualan**
   - Value: Rp 15.000.000
   - Trend: +12% vs periode sebelumnya (panah hijau naik)
   - Icon: Currency icon
   - Klik → Navigasi ke Laporan Penjualan

2. **Transaksi Hari Ini**
   - Value: 45 transaksi
   - Trend: +5 vs kemarin
   - Icon: Chart icon
   - Klik → Navigasi ke detail transaksi

3. **Produk Hampir Habis**
   - Value: 12 produk
   - Status: Warning (kuning)
   - Icon: Alert icon
   - Klik → Navigasi ke Inventori filter "Stok Sedikit"

4. **Produk Kadaluarsa**
   - Value: 3 produk
   - Status: Critical (merah)
   - Icon: Calendar icon
   - Klik → Navigasi ke Inventori filter "Expired"

**Section 2: Charts (2 Columns)**

**Left Chart: Penjualan 7 Hari Terakhir (Line Chart)**
- X-axis: Tanggal (1 Feb - 7 Feb)
- Y-axis: Total penjualan (Rupiah)
- Tooltip: Hover tanggal → Show total + jumlah transaksi
- Color: Blue line
- Purpose: Lihat tren naik/turun penjualan

**Right Chart: Produk Terlaris (Horizontal Bar Chart)**
- Y-axis: Nama produk (top 5)
- X-axis: Quantity terjual
- Color: Blue bars
- Purpose: Tahu produk mana yang paling laku

**Section 3: Transaksi Terbaru (Table)**
- Kolom: Invoice | Waktu | Items | Total | Kasir
- Tampilkan 10 terakhir
- Button "Lihat Semua" → Navigasi ke Laporan Penjualan lengkap

**Filter:**
- Date range: Hari Ini | Minggu Ini | Bulan Ini | Custom
- Cabang (jika multi-branch): Dropdown pilih cabang

**Use Case:**
> **Pagi pukul 07:00**  
> Pak Budi buka laptop → Login → Dashboard muncul  
> Card "Produk Hampir Habis" → 12 produk (kuning)  
> Klik card → Lihat list: Pulpen hitam, Kertas A4, Aqua botol  
> Mental note: "Nanti siang order ke supplier"

---

### 2. PREDIKSI ML (FITUR BINTANG!)

**Deskripsi:**
Ini fitur yang bikin system ini **BERBEDA** dari POS biasa. Machine Learning Engine menganalisis data penjualan historis (30 hari, 60 hari, 90 hari) dan prediksi demand 7 hari ke depan.

**Cara Kerja Backend:**
1. Setiap malam pukul 01:00, ML engine running
2. Ambil data penjualan per produk dari database
3. Train model (Prophet, ARIMA, atau LSTM)
4. Generate predictions untuk 7 hari ke depan
5. Hitung confidence score (akurasi)
6. Simpan hasil ke tabel predictions

**Layout Halaman:**

**Header:**
- Title: "Prediksi Permintaan (AI)"
- Subtitle: "Prediksi otomatis untuk 7 hari ke depan"
- Info badge: "Data diupdate setiap hari pukul 01:00"
- Button "Refresh Model" (manual trigger retrain)

**Summary Cards (3 Cards):**

1. **Akurasi Model**
   - Value: 92% (gauge chart atau progress bar)
   - Status: "Sangat Baik" (hijau >90%, kuning 70-90%, merah <70%)
   - Tooltip: "Akurasi dihitung berdasarkan prediksi vs aktual 30 hari terakhir"

2. **Produk Perlu Diorder**
   - Value: 15 produk
   - Icon: Package icon
   - Klik → Auto scroll ke tabel filter "Need Order"

3. **Potensi Penghematan**
   - Value: Rp 500.000/bulan
   - Info: "Dari pengurangan waste + stockout"
   - Tooltip: "Estimasi kerugian yang bisa dihindari dengan order tepat waktu"

**Main Table: Product Predictions**

Kolom:
1. **Produk** (Nama + Thumbnail image)
2. **Stok Saat Ini** (dengan color badge: hijau/kuning/merah)
3. **Prediksi 7 Hari** (contoh: 50 unit)
4. **Rekomendasi Order** (bold, hijau, contoh: 60 unit)
5. **Confidence Score** (92%, progress bar)
6. **Action** (Button "Order" hijau)

**Filter & Sort:**
- Filter Kategori: Dropdown (Semua / Alat Tulis / Minuman / Snack)
- Filter Confidence: Slider (Tampilkan hanya >80%)
- Sort: By Demand (tinggi→rendah) | By Confidence | By Nama A-Z

**Chart: Tren Permintaan vs Aktual**
- Title: "Validasi Model: Prediksi vs Realita"
- Multi-line chart:
  - **Blue solid line**: Actual historical demand (30 hari terakhir)
  - **Orange dashed line**: ML predicted demand (30 hari terakhir, untuk validasi akurasi)
  - **Green dashed line**: Future prediction (7 hari ke depan)
- Legend dengan keterangan
- Tooltip: Hover tanggal → Show actual vs predicted vs future value

**Click Row (Detail):**
- Modal muncul dengan:
  - Product info (nama, foto, SKU)
  - Chart khusus produk ini (historical sales 60 hari)
  - Statistik: Avg sales per day, Min, Max, Std Deviation
  - Seasonality pattern (jika ada): "Penjualan naik setiap Senin-Rabu (mahasiswa tugas)"

**Click Button "Order":**
- Modal "Buat Purchase Order dari Rekomendasi ML"
- Form isi:
  - Produk: [Nama produk] (read-only)
  - Stok saat ini: 12 unit (read-only)
  - Prediksi demand 7 hari: 50 unit (read-only)
  - **Rekomendasi order: 60 unit** (editable, default dari ML)
  - Penjelasan: "+10 unit safety stock untuk antisipasi spike demand"
  - Supplier: [Dropdown, pilih supplier]
  - Estimasi tanggal kirim: [Date picker]
  - Notes: [Textarea, optional]
  - Button: Batal | **Buat PO** (hijau)

**Alerts/Warnings:**

1. **Low Confidence Warning:**
   ```
   ⚠️ Prediksi untuk produk [Nama] kurang akurat (confidence: 65%). 
   Disarankan cek manual stok dan trend penjualan sebelum order.
   ```

2. **High Demand Alert:**
   ```
   🔥 Produk [Nama] diprediksi laris minggu depan! 
   Demand naik 45% dari biasanya. Order segera untuk hindari kehabisan stok.
   ```

3. **Restock Urgent:**
   ```
   🚨 Stok [Nama] tinggal 5 unit, diprediksi habis dalam 2 hari. 
   Hubungi supplier sekarang!
   ```

**Use Case:**
> **Pak Budi, Selasa pagi**  
> Buka halaman Prediksi ML → Lihat tabel  
> Card "Produk Perlu Diorder": 15 produk  
> 
> Scroll ke tabel:
> - Pulpen Pilot: Stok 12 | Prediksi 50 | Rekomendasi Order: **60 unit** (confidence: 92%)
> - Kertas A4: Stok 5 rim | Prediksi 25 | Rekomendasi Order: **30 rim** (confidence: 88%)
> - Aqua Botol: Stok 8 dus | Prediksi 20 | Rekomendasi Order: **25 dus** (confidence: 90%)
>
> Pak Budi klik "Order" untuk 3 produk itu → Otomatis buat PO → Kirim ke supplier via WhatsApp/Email → Selesai!
>
> **Minggu depan:**  
> Stok tiba pas waktu yang dibutuhkan. Tidak ada stockout, tidak ada over-stock.

---

### 3. MANAJEMEN PRODUK

**Deskripsi:**
Halaman untuk Pak Budi tambah produk baru, edit harga, atau nonaktifkan produk yang sudah tidak dijual.

**Header:**
- Title: "Manajemen Produk"
- Button "Tambah Produk" (biru, kanan atas, icon +)
- Search bar (kiri: cari nama atau SKU)

**Filter & Sort:**
- Filter Kategori: Dropdown (Semua / Alat Tulis / Minuman / ...)
- Filter Status: All | Active | Inactive
- Sort: Nama A-Z | Harga rendah→tinggi | Stok rendah→tinggi | Terbaru

**Toggle View:**
- Icon button: Table view ☰ | Grid view ⊞
- Default: Table (lebih informatif)

**Table View:**

Kolom:
1. **Image** (Thumbnail 40×40px)
2. **Nama Produk** (baris 1) + SKU (baris 2, smaller, gray)
3. **Kategori** (badge)
4. **Harga Jual** (Rp format, bold)
5. **Margin** (percentage, hijau, contoh: 25%)
6. **Stok Total** (color badge: hijau/kuning/merah)
7. **Status** (Toggle switch: Active/Inactive)
8. **Actions** (Icon: Edit ✏️ | Delete 🗑️)

**Grid View (4 Columns):**

Card:
- Product image (square, cover fit)
- Product name (truncate max 2 lines)
- Price (bold, besar)
- Stock badge (bottom left)
- Edit icon (overlay saat hover, top right)

**Pagination:**
- Previous | 1 2 3 ... 10 | Next
- Show items per page: 25 | 50 | 100

---

**ADD/EDIT PRODUCT MODAL (Slide-over Panel dari Kanan):**

**Section 1: Informasi Dasar**
- Nama Produk (required, text input)
- SKU (optional, text input, atau auto-generate dengan format: PROD-YYYY-XXXX)
- Kategori (dropdown, dengan option "Tambah Kategori Baru")
- Deskripsi (textarea, max 500 karakter)

**Section 2: Harga & Margin**
- Harga Modal/Beli (required, number input, Rp format)
- Harga Jual (required, number input, Rp format)
- Margin (calculated auto, show %):
  ```
  Margin = ((Harga Jual - Harga Modal) / Harga Modal) × 100%
  Contoh: ((10.000 - 8.000) / 8.000) × 100% = 25%
  ```
- Tampilkan warning kalau margin <10% (merah): "Margin terlalu kecil, cek harga supplier"
- Tampilkan warning kalau margin >100% (kuning): "Margin terlalu tinggi, produk mungkin tidak laku"

**Section 3: Foto Produk**
- Upload image:
  - Drag & drop area atau click to browse
  - Max size: 2MB
  - Format: JPG, PNG, WebP
- Preview thumbnail (after upload)
- Button "Hapus Foto"

**Section 4: Manajemen Stok**
- Toggle: **Aktifkan batch tracking?**
  - Jika ON: System akan track batch number + purchase date untuk produk ini
  - Use case: Minuman, snack (ada tanggal kadaluarsa)
- Toggle: **Aktifkan expiry tracking?**
  - Jika ON: System akan kasih alert kalau produk mendekati expired
  - Use case: Makanan, minuman, tinta printer
- Min Stock Level (number input):
  - Alert threshold: Jika stok turun di bawah angka ini, tampilkan warning
  - Default: 5 unit

**Section 5: Supplier (Optional)**
- Dropdown: Pilih supplier default untuk produk ini
- Use case: Saat auto-generate PO dari ML prediction, system pilih supplier ini

**Actions:**
- Button "Batal" (gray, outline)
- Button "Simpan" (blue, solid)

---

**DELETE CONFIRMATION MODAL:**

```
⚠️ Hapus Produk?

Produk: [Nama Produk]
SKU: [SKU-001]

Perhatian:
• Stok dan riwayat transaksi akan tetap tersimpan
• Produk hanya dinonaktifkan, tidak benar-benar dihapus
• Anda bisa mengaktifkan kembali kapan saja

[Batal]  [Hapus Produk]
         (merah)
```

---

**Use Case:**

> **Pak Budi mau tambah produk baru: "Tipp-Ex Kenko"**
> 
> 1. Klik "Tambah Produk" → Modal muncul
> 2. Isi form:
>    - Nama: Tipp-Ex Kenko
>    - SKU: (auto generate) PROD-2026-0156
>    - Kategori: Alat Tulis
>    - Deskripsi: Correction fluid 20ml, kering cepat
>    - Harga Modal: Rp 8.000
>    - Harga Jual: Rp 12.000
>    - Margin: **50%** (otomatis hitung)
>    - Upload foto (drag & drop)
>    - Batch tracking: OFF (tidak perlu, produk tahan lama)
>    - Expiry tracking: OFF
>    - Min stock: 10 unit
>    - Supplier: PT Alat Tulis Jaya
> 3. Klik "Simpan" → Produk muncul di list → Selesai!

---

### 4. MANAJEMEN INVENTORI

**Deskripsi:**
Halaman untuk kontrol stok di semua cabang (jika multi-branch). Track batch, expiry date, transfer stok antar cabang, adjustment stok.

**Header:**
- Title: "Manajemen Inventori"
- Dropdown: Pilih cabang (Semua Cabang | Cabang A | Cabang B)
- Actions:
  - Button "Transfer Stok" (biru)
  - Button "Penyesuaian Stok" (kuning)
  - Button "Stock Opname" (hijau)

**Overview Cards (3 Cards):**

1. **Total Items**
   - Value: 250 produk
   - Info: Semua SKU aktif di system

2. **Total Stock Value**
   - Value: Rp 15.000.000
   - Info: Nilai stok (qty × harga modal)

3. **Low Stock Items**
   - Value: 12 produk
   - Status: Warning (kuning)
   - Klik → Auto filter "Low Stock"

---

**Main Table:**

Kolom:
1. **Produk** (Nama + SKU)
2. **Kategori** (badge)
3. **Cabang** (jika "Semua Cabang" dipilih)
4. **Quantity** (dengan color badge)
5. **Batch Info** (jika tracked):
   - "3 batches, oldest expires 15 Feb" (merah kalau <30 hari)
6. **Last Updated** (timestamp)
7. **Actions** (Dropdown: View Detail | Adjust | Transfer)

**Filter:**
- Stock Status:
  - Semua
  - Normal (stok >20)
  - Low Stock (5-20)
  - Out of Stock (<5)
- Expiry Status:
  - Semua
  - Expiring Soon (<30 hari)
  - Expired (sudah lewat tanggal)
- Kategori: Dropdown

---

**DETAIL MODAL (Klik "View Detail"):**

**Tab 1: Stock by Branch**
- Table: Branch | Qty | Last Updated
- Use case: Multi-branch, lihat distribusi stok di setiap cabang

**Tab 2: Batch Details** (jika batch tracking enabled)
- Table: Batch Code | Qty | Purchase Date | Expiry Date | Status
- Expired batches highlighted merah
- Button "Hapus Batch Expired" (hapus dari stok, otomatis buat stock movement record)

**Tab 3: Stock Movement History**
- Table: Date | Type (In/Out/Transfer/Adjust) | Qty Change | User | Notes
- Pagination: Last 50 movements
- Use case: Audit trail, siapa yang adjust stok kapan

---

**TRANSFER STOCK MODAL:**

```
Transfer Stok Antar Cabang

Produk: [Autocomplete search]
Dari Cabang: [Dropdown]
Ke Cabang: [Dropdown]

Stok tersedia: 50 unit

Jumlah Transfer: [____] unit (max: 50)
Notes: [Textarea, optional]

[Batal]  [Konfirm Transfer]
```

**Validasi:**
- Tidak bisa transfer melebihi stok tersedia
- Tidak bisa transfer ke cabang yang sama
- Wajib isi quantity dan pilih cabang tujuan

**Backend:**
- POST /api/inventory/transfer/
- System akan:
  1. Kurangi stok di cabang asal
  2. Tambah stok di cabang tujuan
  3. Buat 2 stock movement records (OUT di asal, IN di tujuan)
  4. Log user + timestamp

---

**ADJUST STOCK MODAL:**

```
Penyesuaian Stok (Manual Adjustment)

Produk: [Autocomplete search]
Cabang: [Dropdown]

Stok Saat Ini: 50 unit (read-only)

Tipe Adjustment:
( ) Tambah (IN)
( ) Kurangi (OUT)
( ) Set ke jumlah tertentu

Jumlah: [____] unit

Alasan:
[Dropdown: Rusak | Expired | Hilang | Kesalahan Hitung | Lainnya]

Notes: [Textarea, wajib diisi]

⚠️ Perhatian: Adjustment akan tercatat di audit log

[Batal]  [Konfirm Adjustment]
         (kuning, butuh konfirmasi lagi)
```

**Confirmation Dialog:**
```
🔔 Konfirmasi Adjustment

Produk: [Nama]
Stok Lama: 50 unit
Stok Baru: 45 unit (-5 unit)
Alasan: Rusak

Yakin ingin menyimpan perubahan ini?

[Tidak]  [Ya, Simpan]
```

**Use Case:**
> **Pak Budi cek stok fisik, ternyata Aqua Botol di rak cuma 18 dus, tapi di system 20 dus**
> 
> 1. Buka Inventori → Klik "Penyesuaian Stok"
> 2. Pilih produk: Aqua Botol
> 3. Cabang: Budi Copy Center
> 4. Stok saat ini: 20 dus (dari system)
> 5. Tipe: "Set ke jumlah tertentu"
> 6. Jumlah: 18 (sesuai fisik)
> 7. Alasan: Kesalahan Hitung
> 8. Notes: "Stock opname tanggal 7 Feb 2026, selisih 2 dus hilang"
> 9. Konfirm → Stok updated → Stock movement tercatat

---

### 5. LAPORAN PENJUALAN (Sales Report)

**Deskripsi:**
Laporan lengkap penjualan dengan charts, filters, export CSV/PDF.

**Header:**
- Title: "Laporan Penjualan"
- Date Range Picker: From [___] - To [___]
- Presets: Hari Ini | Minggu Ini | Bulan Ini | Custom
- Button "Export":
  - Dropdown: Download CSV | Download PDF

---

**Summary Cards (4 Cards):**

1. **Total Penjualan**
   - Value: Rp 15.000.000
   - Trend: +12% vs periode sebelumnya (panah hijau ↑)

2. **Total Transaksi**
   - Value: 450 transaksi
   - Trend: +5% vs periode sebelumnya

3. **Avg Transaction Value**
   - Value: Rp 33.333
   - Calculation: Total Penjualan / Total Transaksi

4. **Top Product**
   - Value: "Pulpen Pilot" (dengan thumbnail)
   - Info: "420 unit terjual"

---

**Charts Section:**

**Row 1 (2 Charts Side by Side):**

**Chart 1: Daily Sales (Line Chart)**
- X-axis: Tanggal
- Y-axis: Total penjualan (Rupiah)
- Color: Blue line
- Tooltip: Hover tanggal → Show: "7 Feb 2026: Rp 2.500.000 (45 transaksi)"

**Chart 2: Sales by Category (Pie Chart)**
- Segments: Alat Tulis (40%), Minuman (30%), Snack (20%), Fotocopy (10%)
- Colors: Different color per category
- Tooltip: Hover segment → Show percentage + total sales

**Row 2 (1 Full-Width Chart):**

**Chart 3: Sales by Hour (Bar Chart)**
- X-axis: Hours (00:00 - 23:00)
- Y-axis: Number of transactions
- Color: Blue bars
- Highlight peak hours (misal: 12:00-14:00 paling ramai)
- Insight: "Jam tersibuk: 12:00-13:00 (75 transaksi)"

---

**Detailed Transaction Table:**

Header:
- Title: "Detail Transaksi"
- Search: "Cari invoice..." (search by invoice number)

Kolom:
1. **Invoice Number** (#INV-2026-001)
2. **Timestamp** (7 Feb 2026, 14:30)
3. **Kasir** (Nama kasir)
4. **Items** (contoh: "3 items")
5. **Total** (Rp 150.000)
6. **Payment Method** (badge: Cash/Debit/QRIS)
7. **Actions** (Button "Lihat Detail")

Pagination: 50 rows per page

---

**Filter Sidebar (or Top Bar):**
- Cabang: [Dropdown]
- Kasir: [Dropdown, show all users]
- Payment Method: All | Cash | Debit | QRIS
- Amount Range:
  - Min: [____] (optional)
  - Max: [____] (optional)
- Button "Apply Filter"

---

**DETAIL MODAL (Klik "Lihat Detail"):**

```
Invoice: #INV-2026-001
──────────────────────────────────────
Tanggal: 7 Feb 2026, 14:30
Kasir: Sari Wulandari
Cabang: Budi Copy Center

Items:
┌────────────────────────┬─────┬─────────┬──────────┐
│ Produk                 │ Qty │ Harga   │ Subtotal │
├────────────────────────┼─────┼─────────┼──────────┤
│ Pulpen Pilot Hitam     │  5  │ 5.000   │ 25.000   │
│ Kertas A4 Sinar Dunia  │  2  │ 50.000  │ 100.000  │
│ Aqua Botol 600ml       │  1  │ 3.000   │ 3.000    │
└────────────────────────┴─────┴─────────┴──────────┘

Subtotal: Rp 128.000
Diskon:   Rp 3.000 (2%)
Total:    Rp 125.000

Pembayaran: Cash
Uang Diterima: Rp 130.000
Kembalian:     Rp 5.000

[Tutup]  [Print Ulang]
```

---

**Export:**

**CSV Format:**
```
Invoice,Tanggal,Waktu,Kasir,Items,Total,Payment,Status
#INV-2026-001,2026-02-07,14:30,Sari Wulandari,3,125000,Cash,Selesai
#INV-2026-002,2026-02-07,14:45,Dedi Kurniawan,1,50000,Debit,Selesai
...
```

**PDF Format:**
- Header: Logo + Nama Bisnis
- Summary: Date range, Total sales, Total transactions
- Charts (embedded as images)
- Transaction table (top 100 rows)
- Footer: Generated on [timestamp]

---

### 6. LAPORAN INVENTORI (Inventory Report)

**Deskripsi:**
Fokus ke stock movements (masuk/keluar), waste analysis (barang rusak/expired), valuation (nilai stok).

**Header:**
- Title: "Laporan Inventori"
- Date Range Picker
- Button "Export CSV"

---

**Summary Cards (5 Cards):**

1. **Stock In**
   - Value: 500 units (hijau)
   - Info: Barang masuk (PO received + transfer in + adjustment in)

2. **Stock Out**
   - Value: 450 units (biru)
   - Info: Barang keluar (transaksi + transfer out)

3. **Transferred**
   - Value: 30 units (orange)
   - Info: Transfer antar cabang

4. **Damaged/Lost**
   - Value: 15 units (merah)
   - Info: Adjustment stok karena rusak/hilang

5. **Expired Products**
   - Value: 5 units (dark red)
   - Info: Barang kadaluarsa (waste paling costly)

---

**Stock Movement Chart (Line Chart):**
- Title: "Pergerakan Stok"
- Multi-line:
  - Green line: Stock In
  - Blue line: Stock Out
  - Orange line: Transfers
  - Red line: Waste (damaged + expired + lost)
- X-axis: Dates
- Y-axis: Units

---

**Waste Analysis Table:**

Header:
- Title: "Analisis Kerugian (Waste)"
- Sort by: Value Lost (highest first)

Kolom:
1. **Produk** (Nama)
2. **Kategori**
3. **Quantity Lost** (contoh: 5 unit)
4. **Value Lost** (Rp, calculated: Qty × Harga Modal)
5. **Reason** (badge: Expired | Damaged | Lost)
6. **Date** (timestamp)

Footer:
- **Total Kerugian: Rp 500.000** (sum of all value lost)

**Use Case:**
> **Pak Budi review laporan inventori bulan lalu**
> 
> Waste Analysis Table:
> - Snack ChocoBall: 10 pcs × Rp 5.000 = **Rp 50.000** (Expired)
> - Tinta Printer Canon: 2 botol × Rp 80.000 = **Rp 160.000** (Kering/Damaged)
> - Kertas Foto Glossy: 3 pack × Rp 30.000 = **Rp 90.000** (Rusak karena basah)
>
> Total waste: **Rp 300.000**
>
> Pak Budi decision: "Bulan depan pakai ML prediction untuk order, jangan over-stock lagi!"

---

**Stock Valuation:**
- Current total stock value: Rp 15.000.000
- Breakdown by category:
  - Alat Tulis: Rp 6.000.000 (40%)
  - Minuman: Rp 4.500.000 (30%)
  - Snack: Rp 3.000.000 (20%)
  - Fotocopy: Rp 1.500.000 (10%)

---

### 7. MANAJEMEN USER (Kasir Accounts)

**Deskripsi:**
Pak Budi tambah akun untuk kasir baru (misal: rekrut part-timer baru), edit info, atau nonaktifkan akun kasir yang sudah resign.

**Header:**
- Title: "Manajemen Pengguna"
- Button "Tambah Pengguna" (biru, kanan atas)

**Active Users Badge:**
- "5 pengguna aktif"

---

**User Table:**

Kolom:
1. **Avatar** (circle, initials, misal: "S" untuk Sari)
2. **Full Name** (contoh: Sari Wulandari)
3. **Username** (sari.kasir)
4. **Role** (badge: Admin (merah) | Kasir (biru))
5. **Branch Assignment** (contoh: Cabang A)
6. **Status** (Toggle switch: Active/Inactive)
7. **Last Login** (timestamp, relative: "2 jam lalu")
8. **Actions** (Icon: Edit ✏️ | Delete 🗑️)

---

**ADD/EDIT USER MODAL:**

```
Tambah Pengguna Baru

Nama Lengkap: [____________________] *required
Username:     [____________________] *required, unique

Password:     [____________________] *required (min 8 char)
Konfirmasi:   [____________________] *must match

Role:
( ) Admin   (akses penuh ke semua fitur)
(•) Kasir   (akses terbatas: transaksi + cek stok saja)

Branch Assignment: [Dropdown: Pilih Cabang] *required untuk Kasir

Status:
[✓] Aktif (user bisa login)

[Batal]  [Simpan]
```

**Validation:**
- Username tidak boleh duplikat
- Password min 8 karakter, kombinasi huruf + angka
- Konfirmasi password harus sama
- Branch wajib diisi untuk role Kasir

**Edit Mode:**
- Password optional (kalau kosong, password lama tidak berubah)
- Username tidak bisa diedit (read-only, untuk identitas)

---

**DELETE CONFIRMATION:**

```
⚠️ Hapus Pengguna?

Nama: Sari Wulandari
Username: sari.kasir
Role: Kasir

Perhatian:
• Riwayat transaksi yang dibuat user ini tetap tersimpan
• User tidak bisa login lagi setelah dihapus
• Data tidak bisa dikembalikan

[Batal]  [Hapus Pengguna]
         (merah)
```

---

### 8. MANAJEMEN CABANG (Multi-Location)

**Deskripsi:**
Untuk bisnis yang punya beberapa outlet/cabang. Pak Budi bisa manage info cabang, assign manager, lihat stok per cabang.

**Header:**
- Title: "Manajemen Cabang"
- Button "Tambah Cabang"

---

**Branch Cards (Grid Layout, 2-3 Columns):**

Card:
```
┌────────────────────────────────┐
│ Budi Copy Center - Kampus A    │ <- Branch Name
│ Jl. Sudirman No. 123           │ <- Address
│ Telp: 0812-3456-7890           │
│                                │
│ Manager: Sari Wulandari        │ <- Assigned manager
│ Total Produk: 150 items        │
│ Nilai Stok: Rp 5.000.000       │
│                                │
│ Status: [Aktif] (hijau)        │
│                                │
│ [Edit] [Hapus] [Lihat Stok]   │
└────────────────────────────────┘
```

---

**ADD/EDIT BRANCH MODAL:**

```
Tambah Cabang Baru

Nama Cabang:  [_________________________]
Alamat:       [_________________________]
              [_________________________] (textarea)
Telepon:      [_________________________]

Manager:      [Dropdown: Pilih User Kasir]

Status:       [✓] Aktif

[Batal]  [Simpan]
```

---

### 9. MANAJEMEN SUPPLIER

**Deskripsi:**
Pak Budi manage kontak supplier. Saat buat PO, tinggal pilih dari list supplier.

**Header:**
- Title: "Manajemen Supplier"
- Button "Tambah Supplier"

---

**Supplier Table:**

Kolom:
1. **Supplier Name** (PT Alat Tulis Jaya)
2. **Contact Person** (Bapak Ahmad)
3. **Phone** (0812-1234-5678)
4. **Email** (ahmad@alattulis.com)
5. **Address** (truncate, full di tooltip)
6. **Total Orders** (count, contoh: 45 PO)
7. **Last Order Date** (7 Feb 2026)
8. **Status** (Toggle: Active/Inactive)
9. **Actions** (Edit | Delete | View Orders)

---

**ADD/EDIT SUPPLIER MODAL:**

```
Tambah Supplier

Nama Supplier:     [_____________________]
Contact Person:    [_____________________]
Telepon:           [_____________________]
Email:             [_____________________]
Alamat:            [_____________________]
                   [_____________________] (textarea)

Status: [✓] Aktif

[Batal]  [Simpan]
```

---

**VIEW ORDERS (Detail Modal):**

```
Supplier: PT Alat Tulis Jaya
Contact: Bapak Ahmad (0812-1234-5678)

Purchase Orders:
┌────────────┬────────────┬─────────┬─────────────┬─────────┐
│ PO Number  │ Date       │ Items   │ Total Value │ Status  │
├────────────┼────────────┼─────────┼─────────────┼─────────┤
│ PO-2026-01 │ 5 Feb 2026 │ 5 items │ Rp 500.000  │ Diterima│
│ PO-2026-02 │ 1 Feb 2026 │ 3 items │ Rp 300.000  │ Pending │
└────────────┴────────────┴─────────┴─────────────┴─────────┘

[Tutup]
```

---

### 10. PURCHASE ORDERS (PO)

**Deskripsi:**
Pak Budi order barang dari supplier. Bisa manual atau otomatis via ML prediction.

**Header:**
- Title: "Purchase Order"
- Button "Buat PO Baru"

---

**Status Tabs:**
- All (badge: 50)
- Pending (badge: 12)
- Received (badge: 35)
- Cancelled (badge: 3)

---

**PO Table:**

Kolom:
1. **PO Number** (PO-2026-001)
2. **Date Created** (7 Feb 2026)
3. **Supplier** (PT Alat Tulis Jaya)
4. **Products** (contoh: "5 items")
5. **Total Value** (Rp 500.000)
6. **Expected Delivery** (10 Feb 2026)
7. **Status** (badge: Pending (kuning) | Received (hijau) | Cancelled (merah))
8. **Actions** (Dropdown: View | Mark Received | Cancel)

---

**CREATE PO MODAL:**

```
Buat Purchase Order Baru

Supplier: [Dropdown: Pilih Supplier] *required

Expected Delivery Date: [Date Picker]

Product Line Items:
┌─────────────────────┬─────┬────────────┬──────────┬────┐
│ Produk              │ Qty │ Harga/Unit │ Subtotal │ -  │
├─────────────────────┼─────┼────────────┼──────────┼────┤
│ [Autocomplete]      │ [_] │ [_______]  │ Rp 0     │ 🗑  │
└─────────────────────┴─────┴────────────┴──────────┴────┘

[+ Tambah Produk]

Total: Rp 0

Notes (Optional):
[Textarea]

[Batal]  [Buat PO]
```

**Add Product Flow:**
1. Click "+ Tambah Produk" → Baris baru muncul
2. Autocomplete search produk
3. Input qty + harga beli per unit
4. Subtotal otomatis calculated: Qty × Harga
5. Total otomatis sum semua subtotal

---

**RECEIVE PO MODAL:**

```
Terima Barang - PO-2026-001

Supplier: PT Alat Tulis Jaya
Expected Delivery: 10 Feb 2026

Produk yang Dipesan:
┌────────────────────┬──────────┬─────────────┬──────┐
│ Produk             │ Expected │ Diterima    │ Note │
├────────────────────┼──────────┼─────────────┼──────┤
│ Pulpen Pilot       │ 50 pcs   │ [50]        │      │
│ Kertas A4          │ 10 rim   │ [10]        │      │
│ Aqua Botol         │ 3 dus    │ [2]         │ (*)  │
└────────────────────┴──────────┴─────────────┴──────┘

(*) Partial receive: 1 dus kurang, supplier kirim besok

Batch Tracking (jika enabled):
• Aqua Botol:
  - Batch Code: [AQUA-2026-02]
  - Expiry Date: [Date Picker: 7 Agu 2027]

[Batal]  [Konfirm Terima]
```

**Backend Action:**
- Update PO status: Pending → Received
- Add stock ke inventory (qty sesuai yang diterima)
- Buat stock movement records (type: IN, source: PO)
- Jika batch tracking, simpan batch info + expiry date

---

### 11. PENGATURAN (Settings)

**Deskripsi:**
Konfigurasi system-wide. Pak Budi atur nama bisnis, logo struk, notifikasi, ML config.

**Layout: Tabs atau Sections (Vertical Stack)**

---

**Section 1: Pengaturan Umum**

```
Nama Bisnis:         [Budi Copy Center        ]
Currency:            [IDR - Rupiah            ] (dropdown)
Tax Rate (%):        [0                       ] (PPN, kalau ada)
Low Stock Threshold: [5                       ] (alert kalau stok < ini)

[Simpan Pengaturan Umum]
```

---

**Section 2: Pengaturan Struk**

```
Logo Struk:
[Drag & drop image or click to upload]
[Preview thumbnail]

Footer Text (Struk):
┌────────────────────────────────────────┐
│ Terima kasih telah berbelanja!         │
│ Follow IG: @budicopy                   │
│ WA: 0812-3456-7890                     │
└────────────────────────────────────────┘

Tampilkan nama kasir di struk: [✓]

[Simpan Pengaturan Struk]
```

---

**Section 3: Notifikasi & Lansiran**

```
Email Alerts:

[✓] Kirim email saat stok menipis
[✓] Kirim email saat produk expired/hampir expired
[ ] Kirim email laporan penjualan harian

Email Tujuan: [budi@budicopy.com           ]

[Simpan Pengaturan Notifikasi]
```

---

**Section 4: Konfigurasi Machine Learning**

```
Status ML:
[✓] Aktifkan ML Predictions

Auto-Retrain Frequency:
(•) Setiap Hari (01:00 pagi)
( ) Setiap Minggu (Senin 01:00)
( ) Manual (retrain via button di halaman Prediksi ML)

Confidence Threshold:
[============●========] 80%
(Hanya tampilkan prediksi dengan akurasi >80%)

Catatan:
• Model membutuhkan minimal 30 hari data penjualan
• Training memakan waktu sekitar 5-15 menit
• Akurasi model ditampilkan di halaman Prediksi ML

[Simpan Konfigurasi ML]
```

---

**Section 5: Keamanan**

```
Paksa ganti password setiap: [90] hari

Session Timeout: [30] menit
(User otomatis logout jika tidak ada aktivitas)

[Simpan Pengaturan Keamanan]
```

---

### 12. NOTIFIKASI & ALERTS

**Deskripsi:**
Notification center. Pak Budi lihat semua alert dari system (stok menipis, expired, ML prediction ready, transaksi besar).

**Header:**
- Title: "Notifikasi"
- Button "Tandai Semua Sudah Dibaca"

---

**Notification List (Grouped by Date):**

```
═══════════════════════════════════════════
HARI INI
═══════════════════════════════════════════

┌─ [•] Low Stock Alert ──────────────────┐
│ ⚠️  15 produk stok menipis             │
│     Segera order untuk hindari stockout│
│     2 jam lalu                          │
└────────────────────────────────────────┘

┌─ [•] ML Prediction Ready ─────────────┐
│ 🤖  Prediksi demand 7 hari updated     │
│     20 produk perlu diorder minggu ini │
│     Pagi ini, 01:15                    │
└────────────────────────────────────────┘

┌─ Transaksi Besar ─────────────────────┐
│ 💰  Transaksi Rp 850.000               │
│     Kasir: Sari, 3 items               │
│     1 jam lalu                          │
└────────────────────────────────────────┘

═══════════════════════════════════════════
KEMARIN
═══════════════════════════════════════════

┌─ Expired Product Alert ───────────────┐
│ 🗓️  3 produk sudah kadaluarsa          │
│     Segera keluarkan dari stok         │
│     Kemarin, 08:00                     │
└────────────────────────────────────────┘

═══════════════════════════════════════════
MINGGU INI
═══════════════════════════════════════════

┌─ User Activity ───────────────────────┐
│ 👤  User baru: Dedi Kurniawan          │
│     Login pertama kali sebagai Kasir   │
│     3 hari lalu                        │
└────────────────────────────────────────┘
```

**Notification Types:**

1. **Low Stock** (Warning icon, kuning)
2. **Expired Products** (Calendar icon, merah)
3. **ML Prediction Ready** (AI icon, biru)
4. **Transaksi Besar** (Currency icon, hijau, threshold: >Rp 500.000)
5. **User Activity** (User icon, gray)
6. **PO Received** (Package icon, hijau)

**Filter:**
- All
- Unread Only
- Low Stock
- Expired
- ML Predictions

**Click Notification:**
- Navigate ke halaman terkait (misal: click "Low Stock" → ke Inventori filter stok sedikit)
- Auto mark as read

---

## Summary: Bagaimana System Membantu Pak Budi?

### Sebelum Pakai POS ML System:

**Pagi:**
- Buka toko 07:00
- Cek stok manual (buka lemari, hitung satu-satu): **2 jam**
- Tulis di buku stok

**Siang:**
- Melayani pelanggan
- Tulis transaksi manual di buku kas (kadang lupa)

**Sore:**
- Pelanggan: "Kertas A4 ada?" → Pak Budi: "Coba saya cek dulu" (buka lemari)
- Ternyata habis → Pelanggan pergi ke toko sebelah

**Malam:**
- Hitung uang kasir
- Cocokan dengan catatan di buku
- Sering tidak cocok (hilang Rp 50.000, kemana ya?)

**Minggu:**
- Stock opname: **4 jam**
- Putuskan order apa: **"Feeling" aja, kadang benar kadang salah**

**Akhir Bulan:**
- Hitung profit manual: **3 jam**
- Temukan 10 snack expired: **Rugi Rp 200.000**

**Total Waktu/Bulan:** ~50 jam untuk admin + sering salah keputusan

---

### Setelah Pakai POS ML System:

**Pagi:**
- Buka laptop → Login → Dashboard muncul
- Lihat card "Produk Hampir Habis": 12 produk
- Buka Prediksi ML → Lihat rekomendasi order: **5 menit**
- Klik "Order" untuk 5 produk → Buat PO → Kirim ke supplier via WA: **10 menit**

**Siang:**
- Kasir Sari scan barcode produk → Otomatis tercatat

**Sore:**
- Pelanggan: "Kertas A4 ada?"
- Sari: (Buka Cek Stok, search "kertas A4") "Ada 15 rim pak" **10 detik**

**Malam:**
- Pak Budi buka laptop → Dashboard → Lihat total sales: Rp 1.200.000 (45 transaksi)
- Tidak perlu hitung uang manual, sudah otomatis match

**Minggu:**
- Stock opname: Buka Inventori → Sort by "Last Updated" → Cek fisik untuk produk yang baru diganggu saja: **30 menit**

**Akhir Bulan:**
- Buka Laporan Penjualan → Lihat charts, profit, top products: **5 menit**
- Export PDF → Kirim ke akuntan

**Total Waktu/Bulan:** ~5 jam (turun 90%!)

**Bonus:**
- Tidak ada lagi barang expired terbuang (ML kasih alert 30 hari sebelum expired)
- Tidak ada lagi stockout (ML prediksi demand, order tepat waktu)
- Keputusan berdasarkan data, bukan feeling

---

## Kesimpulan

POS ML System adalah solusi **all-in-one** untuk UMKM Indonesia:

- **Otomatis**: Transaksi tercatat, stok terkontrol, laporan tersedia real-time
- **Cerdas**: Machine Learning prediksi demand, kasih rekomendasi order
- **Hemat waktu**: Yang tadinya 50 jam/bulan jadi 5 jam/bulan
- **Hemat uang**: Tidak ada waste (expired/over-stock), tidak ada stockout
- **Transparan**: Owner tahu semua yang terjadi (siapa kasir, transaksi apa, stok berapa)

**Target Impact (6 Bulan):**
- Profit naik 40-60%
- Waste turun 70-80%
- Stockout turun 85-90%
- Waktu admin turun 90%

**Harga Jual (Estimasi):**
- Subscription: Rp 300.000/bulan (termasuk hosting, maintenance, ML training)
- Atau one-time: Rp 5.000.000 (self-hosted, bayar sekali pakai selamanya)

---

**File ini adalah cerita lengkap dari sisi bisnis + penjelasan fitur detail untuk development reference.**
