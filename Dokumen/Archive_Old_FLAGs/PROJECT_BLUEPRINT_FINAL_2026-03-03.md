# PROJECT BLUEPRINT - POS + ML SYSTEM
**Tanggal:** 3 Maret 2026  
**Status:** Final Design - Ready for Session 5  
**Priority:** Fitur POS Esensi → ML/AI di Akhir

---

# 1. PROJECT OVERVIEW

## Tujuan Project
Sistem Point of Sale (POS) dengan Machine Learning untuk UMKM Indonesia yang fokus pada:
1. **Manajemen Stok** dengan prediksi ML
2. **Keuangan** dengan forecasting ML

## Target User
- **Admin/Owner:** Pemilik usaha yang mengelola bisnis
- **Kasir:** Karyawan yang melakukan transaksi penjualan

## Scope
- **Single Outlet** (1 toko/cabang)
- **2 User Roles:** Admin/Owner + Kasir
- **6 Bulan Development** (24 Sessions)

---

# 2. USER ROLES & FITUR

## 2.1 ADMIN/OWNER - FITUR LENGKAP

### A. AUTHENTICATION
1. **Registrasi** (6 Steps)
   - Input email → Kirim kode verifikasi
   - Cek email → Klik link (expired 10 menit)
   - Set password
   - Input data usaha (nama, no HP, alamat, jenis usaha)
   - Auto login → Dashboard
   - Onboarding modal muncul (bisa skip)

2. **Login**
   - Input email + password
   - Klik "Login" → Dashboard

3. **Lupa Password**
   - Input email → Kirim link reset
   - Cek email → Klik link (expired 10 menit)
   - Set password baru → Login

4. **Edit Password**
   - Menu Profil → Ubah Password
   - Input password lama (validasi)
   - Jika benar → Input password baru + konfirmasi
   - Simpan

### B. DASHBOARD (Halaman Utama)
**Tampilan:**
- Ringkasan transaksi hari ini (total penjualan, jumlah transaksi)
- Grafik penjualan minggu/bulan ini
- Produk terlaris (top 5)
- Stok menipis (warning produk < minimum stok)
- Notifikasi penting

**Flow:**
- Login → Dashboard muncul otomatis
- Dashboard realtime update saat ada transaksi

### C. MANAJEMEN PRODUK
**Fitur:**
1. **Lihat Daftar Produk**
   - Tabel: Nama, Kategori, Harga, Stok, Status (Aktif/Tidak Aktif)
   - Search produk (nama/SKU/barcode)
   - Filter kategori
   - Pagination

2. **Tambah Produk Baru**
   - Form: Nama, SKU (auto-generate?), Barcode, Kategori, Supplier, Harga Beli, Harga Jual, Satuan (pcs/kg/liter), Stok Awal, Minimum Stok, Foto Produk
   - Upload foto (optional)
   - Simpan

3. **Edit Produk**
   - Klik produk → Edit
   - Update data → Simpan

4. **Hapus/Nonaktifkan Produk**
   - Soft delete (status jadi tidak aktif)
   - Produk tetap ada di database, tidak muncul di kasir

5. **Barcode Generator**
   - Auto generate barcode untuk produk baru
   - Print barcode

**Flow:**
- Dashboard → Menu "Produk" → Lihat daftar
- Klik "Tambah Produk" → Form → Simpan
- Klik produk → Detail → Edit/Hapus

### D. MANAJEMEN STOK
**Fitur:**
1. **Lihat Stok Saat Ini**
   - Tabel: Produk, Stok Tersedia, Minimum Stok, Status (Aman/Warning/Habis)
   - Search produk
   - Filter status stok

2. **Tambah Stok (Stock In)**
   - Pilih produk
   - Input jumlah masuk
   - Pilih supplier (dari purchase order atau manual)
   - Tanggal masuk
   - Keterangan
   - Simpan → Stok bertambah

3. **Kurangi Stok (Stock Out)**
   - Pilih produk
   - Input jumlah keluar
   - Alasan (rusak, expired, kadaluarsa, return, dll)
   - Keterangan
   - Simpan → Stok berkurang

4. **Riwayat Stok Movement**
   - Tabel: Tanggal, Produk, Tipe (In/Out/Sale), Jumlah, Saldo Akhir, Keterangan
   - Filter tanggal
   - Export Excel

**Flow:**
- Dashboard → Menu "Stok" → Lihat stok
- Klik "Tambah Stok" → Form → Simpan
- Klik "Kurangi Stok" → Form → Simpan
- Klik "Riwayat" → Lihat history

### E. TRANSAKSI PENJUALAN (KASIR FUNCTION)
Admin bisa juga melakukan transaksi seperti kasir.

**Flow sama dengan Kasir (lihat section 2.2.B)**

### F. LAPORAN PENJUALAN
**Fitur:**
1. **Laporan Harian**
   - Total penjualan hari ini
   - Jumlah transaksi
   - Produk terlaris
   - Metode pembayaran
   - Export PDF/Excel

2. **Laporan Periode**
   - Pilih tanggal mulai s/d selesai
   - Total penjualan
   - Total transaksi
   - Grafik tren penjualan
   - Breakdown per produk
   - Export PDF/Excel

3. **Laporan Profit**
   - Revenue (total penjualan)
   - COGS (Cost of Goods Sold - total harga beli)
   - Profit (Revenue - COGS)
   - Margin profit %

**Flow:**
- Dashboard → Menu "Laporan" → Pilih tipe laporan
- Set filter (tanggal/produk) → Generate
- Lihat/Download

### G. MANAJEMEN SUPPLIER
**Fitur:**
1. **Lihat Daftar Supplier**
   - Tabel: Nama, Kontak, Alamat, Email, Status
   - Search supplier

2. **Tambah Supplier**
   - Form: Nama, Kontak, Email, Alamat, Keterangan
   - Simpan

3. **Edit Supplier**
   - Klik supplier → Edit → Simpan

4. **Hapus Supplier**
   - Soft delete (status tidak aktif)

**Flow:**
- Dashboard → Menu "Supplier" → Lihat daftar
- Klik "Tambah Supplier" → Form → Simpan

### H. PURCHASE ORDER (OPTIONAL - Tier 2)
**Fitur:**
1. **Buat PO**
   - Pilih supplier
   - Tambah produk + jumlah order
   - Set tanggal PO
   - Status: Draft/Pending/Received
   - Simpan

2. **Lihat Daftar PO**
   - Tabel: Nomor PO, Supplier, Tanggal, Total, Status
   - Filter status

3. **Terima PO**
   - Klik PO → "Terima Barang"
   - Konfirmasi jumlah diterima
   - Status jadi "Received"
   - Stok produk bertambah otomatis

**Flow:**
- Dashboard → Menu "Purchase Order" → Klik "Buat PO"
- Pilih supplier → Tambah produk → Simpan
- Saat barang datang → Klik PO → "Terima Barang"

### I. KELOLA USER (KASIR)
**Fitur:**
1. **Lihat Daftar Kasir**
   - Tabel: Nama, Email, Jabatan (Kasir), Status (Aktif/Tidak Aktif)

2. **Tambah Kasir**
   - Form: Email, Nama, Jabatan (fixed: Kasir)
   - Admin set password pertama kali
   - Simpan → Akun kasir created

3. **Edit Kasir**
   - Update nama/email
   - Simpan

4. **Reset Password Kasir**
   - Klik kasir → "Reset Password"
   - Konfirmasi
   - Password direset ke: **"kasir12345"**
   - Admin kasih tahu kasir secara manual

5. **Nonaktifkan Kasir**
   - Klik kasir → "Nonaktifkan"
   - Status jadi tidak aktif
   - Kasir tidak bisa login

**Flow:**
- Dashboard → Menu "Kelola User" → Lihat daftar kasir
- Klik "Tambah Kasir" → Form → Simpan
- Klik kasir → Edit/Reset Password/Nonaktifkan

### J. KATEGORI PRODUK
**Fitur:**
1. **Lihat Kategori**
   - Daftar kategori produk (Makanan, Minuman, Snack, dll)

2. **Tambah Kategori**
   - Form: Nama Kategori, Deskripsi
   - Simpan

3. **Edit/Hapus Kategori**

**Flow:**
- Dashboard → Menu "Kategori" → Lihat/Tambah/Edit

### K. PROFIL USAHA
**Fitur:**
1. **Lihat Profil**
   - Nama usaha, No HP, Alamat, Jenis usaha
   - Email admin (tidak bisa diubah)

2. **Edit Profil Usaha**
   - Update nama/alamat/no HP
   - Simpan

3. **Edit Password Admin**
   - (Flow sama dengan Edit Password di Authentication)

**Flow:**
- Dashboard → Menu "Profil" → Lihat/Edit

### L. PANDUAN/TUTORIAL (ONBOARDING)
**Fitur:**
- Icon di sidebar (bawah)
- Klik → Modal/Popup muncul
- Isi: Gambar + penjelasan tiap fitur step by step
- User bisa navigasi Next/Previous/Close

**Flow:**
- Klik icon "Panduan" di sidebar → Modal muncul

### M. ML PREDICTIONS (TIER 3 - DI AKHIR)
**Fitur:**
1. **Prediksi Stok**
   - Stockout Prediction (produk berisiko habis)
   - Restock Recommendation (kapan perlu order lagi)
   - Expiry Risk (produk mendekati expired)
   - Klasifikasi produk (fast/slow moving)

2. **Prediksi Keuangan**
   - Revenue Forecasting (prediksi penjualan bulan depan)
   - Profit Forecasting
   - Cost Optimization

**Note:**
- ML butuh data historis (minimal 1-3 bulan)
- Sebelum data cukup: Dashboard ML show "Data belum cukup untuk prediksi"

**Flow:**
- Dashboard → Menu "ML Predictions" → Lihat prediksi/rekomendasi

---

## 2.2 KASIR - FITUR TERBATAS

### A. AUTHENTICATION
1. **Login**
   - Input email + password (password dari admin atau sudah diubah sendiri)
   - Klik "Login" → Dashboard Kasir

2. **Edit Password**
   - Menu Profil → Ubah Password
   - Input password lama → Validasi
   - Input password baru + konfirmasi → Simpan

3. **Lupa Password**
   - Tidak ada fitur lupa password untuk kasir
   - Kasir harus minta admin reset password

### B. TRANSAKSI PENJUALAN (FITUR UTAMA)
**Flow:**
1. **Masuk ke Halaman Transaksi**
   - Login → Otomatis ke halaman transaksi
   - Tampilan: Daftar produk (grid/list) + Keranjang belanja di samping

2. **Pilih Produk**
   - **Opsi 1:** Scan barcode (jika ada scanner)
     - Scan → Produk otomatis masuk keranjang
   - **Opsi 2:** Search produk (nama/SKU)
     - Ketik nama → Produk muncul → Klik → Masuk keranjang
   - **Opsi 3:** Klik produk dari daftar
     - Klik produk → Masuk keranjang

3. **Atur Jumlah & Harga**
   - Di keranjang: Produk, Harga satuan, Jumlah (bisa edit), Subtotal
   - Edit jumlah (+ / - atau input manual)
   - Jika ada diskon: Input diskon per item (% atau nominal)

4. **Hitung Total**
   - Total otomatis calculate: Σ(Harga × Jumlah)
   - Diskon keseluruhan (optional)
   - Total akhir

5. **Pilih Metode Pembayaran**
   - Cash (Tunai)
   - Transfer Bank
   - E-Wallet (GoPay, OVO, Dana, dll)
   - QRIS

6. **Input Uang Dibayar** (jika Cash)
   - Input nominal uang dari customer
   - Otomatis calculate kembalian
   - Tampilkan kembalian

7. **Selesaikan Transaksi**
   - Klik "Selesai" atau "Bayar"
   - Transaksi tersimpan
   - Stok produk otomatis berkurang
   - Generate struk (print atau tidak)

8. **Struk Transaksi**
   - Nomor transaksi
   - Tanggal & waktu
   - Kasir (nama)
   - List produk + jumlah + harga
   - Total + diskon + pembayaran + kembalian
   - Terima kasih
   - Print struk (optional)

9. **Transaksi Baru**
   - Klik "Transaksi Baru" → Keranjang kosong → Ulangi

**Flow Lengkap:**
```
Login → Halaman Transaksi → Scan/Pilih Produk → Masuk Keranjang → 
Edit Jumlah → Pilih Pembayaran → Input Uang → Hitung Kembalian → 
Selesai → Print Struk → Transaksi Baru
```

### C. CEK STOK
**Fitur:**
- Lihat stok produk saat ini
- Search produk
- Lihat status stok (Aman/Warning/Habis)
- **Tidak bisa tambah/kurangi stok**

**Flow:**
- Menu "Cek Stok" → Lihat daftar → Search produk

### D. RIWAYAT TRANSAKSI
**Fitur:**
- Lihat transaksi yang dilakukan oleh kasir sendiri
- Tabel: Nomor transaksi, Tanggal, Total, Pembayaran
- Filter tanggal
- Klik transaksi → Lihat detail (list produk)
- **Tidak bisa edit/hapus transaksi**

**Flow:**
- Menu "Riwayat" → Lihat transaksi sendiri → Klik detail

### E. PROFIL
**Fitur:**
- Lihat profil: Nama, Email, Jabatan (Kasir)
- Edit password (flow sama dengan Authentication)
- **Tidak bisa edit nama/email** (hanya admin yang bisa)

**Flow:**
- Menu "Profil" → Lihat → Ubah Password

### F. PANDUAN/TUTORIAL
**Fitur:**
- Sama dengan Admin (icon di sidebar)
- Isi: Tutorial cara pakai sistem untuk kasir

---

# 3. FITUR PRIORITAS (DEVELOPMENT ORDER)

## PHASE 1: POS ESENSI (Sessions 5-15)
**Priority:** HIGH - Harus ada agar sistem bisa dipakai

### Session 5-7: Database & Models
1. User (Admin + Kasir)
2. Produk
3. Kategori
4. Stok
5. Transaksi (Sale + SaleItem)
6. Supplier (optional di phase ini)
7. EmailVerification & PasswordReset

### Session 8-10: Backend API
1. Authentication API (register, login, logout, forgot password, edit password)
2. Product API (CRUD)
3. Category API (CRUD)
4. Stock API (CRUD + stock movement)
5. Transaction API (create sale, get sales)

### Session 11-15: Frontend UI
1. Landing & Login page
2. Registration flow (6 steps)
3. Dashboard Admin (ringkasan)
4. Manajemen Produk (CRUD)
5. Manajemen Stok (tambah/kurangi/riwayat)
6. Halaman Transaksi Kasir (barcode scan, keranjang, pembayaran, struk)
7. Kelola User (CRUD kasir)

**Deliverable:** Sistem POS basic bisa transaksi, kelola produk, kelola stok

---

## PHASE 2: LAPORAN & SUPPLIER (Sessions 16-19)
**Priority:** MEDIUM - Penting tapi tidak urgent

### Session 16-17: Laporan
1. Laporan Penjualan (harian/periode)
2. Laporan Profit
3. Export Excel/PDF

### Session 18-19: Supplier & Purchase Order
1. Manajemen Supplier (CRUD)
2. Purchase Order (create, list, receive)
3. Integrasi PO dengan Stock In

**Deliverable:** Sistem POS lengkap dengan laporan dan manajemen supplier

---

## PHASE 3: ML & AI (Sessions 20-23)
**Priority:** LOW - Fitur tambahan setelah POS jalan

### Session 20-21: ML Stok Management
1. Stockout Prediction (prediksi produk akan habis)
2. Restock Recommendation (kapan order lagi)
3. Expiry Risk Prediction (produk mendekati kadaluarsa)
4. Product Classification (fast/slow moving)

### Session 22-23: ML Keuangan
1. Revenue Forecasting (prediksi penjualan)
2. Profit Forecasting
3. Cost Optimization

**Deliverable:** Dashboard ML dengan prediksi dan rekomendasi

---

## PHASE 4: DEPLOYMENT (Session 24)
**Priority:** HIGH - Agar bisa dipakai user real

### Session 24: Deploy to Production
1. Setup server (VPS/Cloud)
2. Setup PostgreSQL production
3. Setup email service (SendGrid)
4. Deploy Django + React
5. Setup domain & SSL
6. Testing production

**Deliverable:** Aplikasi live di internet

---

# 4. TECHNICAL STACK

## Backend
- **Framework:** Django 6.0.2
- **Database:** PostgreSQL (pos_ml_db)
- **API:** Django REST Framework
- **Authentication:** JWT (JSON Web Token)
- **Email:** Django Email (Console backend untuk dev, SendGrid untuk production)

## Frontend
- **Framework:** React 19.0.0
- **Build Tool:** Vite 7.3.1
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios (untuk API calls)

## Machine Learning
- **Library:** Scikit-learn, Pandas, NumPy
- **Model:** Time Series (ARIMA/Prophet), Classification (Random Forest/XGBoost)
- **Deployment:** Pickle model + Django integration

## Infrastructure
- **Development:** Laragon (Windows)
- **Production:** VPS (DigitalOcean/AWS) atau Heroku
- **Email Service:** SendGrid (free tier)

---

# 5. DATABASE DESIGN (UPDATED)

## Models Summary

### 1. User (Custom Django User)
- Email (unique, login identifier)
- Password (hashed)
- Role (admin/kasir)
- Business info (nama usaha, no HP, alamat, jenis usaha) - untuk admin only
- is_verified, created_at, updated_at

### 2. EmailVerification
- Email, Token, Expires_at, Is_used

### 3. PasswordReset
- User FK, Token, Expires_at, Is_used

### 4. Category
- Nama kategori, Deskripsi

### 5. Supplier
- Nama, Kontak, Email, Alamat, Status

### 6. Product
- Nama, SKU, Barcode, Category FK, Supplier FK
- Harga Beli, Harga Jual, Satuan
- Minimum Stok, Foto, Status (aktif/tidak aktif)

### 7. Stock
- Product FK, Jumlah (current stock)
- Unique constraint (product)

### 8. StockMovement
- Product FK, Tipe (in/out/sale), Jumlah, Saldo Akhir
- Keterangan, Created_at

### 9. Sale (Transaction)
- Nomor Transaksi (unique), Kasir FK
- Total, Diskon, Grand Total
- Metode Pembayaran (cash/transfer/ewallet/qris)
- Uang Dibayar, Kembalian
- Tanggal, Waktu

### 10. SaleItem
- Sale FK, Product FK
- Jumlah, Harga Satuan, Diskon, Subtotal

### 11. PurchaseOrder
- Supplier FK, Nomor PO (unique)
- Tanggal, Total, Status (draft/pending/received)

### 12. PurchaseOrderItem
- PurchaseOrder FK, Product FK
- Jumlah Order, Harga Beli, Subtotal

### 13. UserOnboarding (Optional)
- User FK, Is_completed, Completed_at, Skipped

**Total:** 13 Models (11 core + 2 auth-related + 1 optional)

---

# 6. USER FLOW DIAGRAM

## Admin Registration Flow
```
Landing Page → Klik "Daftar" → Input Email → Kirim Kode Verifikasi → 
Cek Email → Klik Link → Set Password → Input Data Usaha → 
Auto Login → Dashboard → Onboarding Modal (skip/view)
```

## Admin Daily Flow
```
Login → Dashboard → 
  → Tambah Produk (jika produk baru)
  → Cek Stok (monitor stok)
  → Lihat Transaksi Hari Ini
  → Tambah Kasir (jika perlu)
  → Lihat Laporan
  → Logout
```

## Kasir Daily Flow
```
Login → Halaman Transaksi → 
  → Scan/Pilih Produk → Keranjang → 
  → Pilih Pembayaran → Input Uang → 
  → Selesai → Print Struk → 
  → Transaksi Baru (repeat)
```

## Transaction Flow (Detail)
```
1. Kasir pilih produk (scan barcode/search/klik)
   ↓
2. Produk masuk keranjang
   ↓
3. Edit jumlah produk (+ / -)
   ↓
4. Tambah produk lain (repeat step 1-3)
   ↓
5. Review keranjang (produk, jumlah, total)
   ↓
6. Pilih metode pembayaran (cash/transfer/ewallet/qris)
   ↓
7. Jika cash: Input uang dibayar → Calculate kembalian
   ↓
8. Klik "Selesai"
   ↓
9. Transaksi tersimpan
   ↓
10. Stok otomatis berkurang
    ↓
11. Generate struk (print optional)
    ↓
12. Klik "Transaksi Baru" → Keranjang kosong
```

---

# 7. KEY FEATURES SUMMARY

## Admin Features (13 Modules)
1. ✅ Dashboard (ringkasan bisnis)
2. ✅ Manajemen Produk (CRUD + barcode)
3. ✅ Manajemen Stok (tambah/kurangi/riwayat)
4. ✅ Transaksi Penjualan (sama kayak kasir)
5. ✅ Laporan Penjualan (harian/periode/profit)
6. ✅ Manajemen Supplier (CRUD)
7. ✅ Purchase Order (create/receive)
8. ✅ Kelola User (CRUD kasir)
9. ✅ Kategori (CRUD)
10. ✅ Profil Usaha (view/edit)
11. ✅ Edit Password
12. ✅ Panduan/Tutorial
13. ✅ ML Predictions (phase akhir)

## Kasir Features (5 Modules)
1. ✅ Transaksi Penjualan (scan/keranjang/pembayaran/struk)
2. ✅ Cek Stok (view only)
3. ✅ Riwayat Transaksi (transaksi sendiri)
4. ✅ Profil (view + edit password)
5. ✅ Panduan/Tutorial

---

# 8. DEVELOPMENT TIMELINE

**Total:** 6 Bulan (24 Sessions)

- **Week 1-2 (S1-4):** Planning + Environment + Project Structure ✅
- **Week 3-4 (S5-7):** Database + Models ⏳
- **Week 5-6 (S8-10):** Backend API + Authentication
- **Week 7-10 (S11-15):** Frontend UI (POS Esensi)
- **Week 11-12 (S16-19):** Laporan + Supplier
- **Week 13-15 (S20-23):** ML Integration
- **Week 16 (S24):** Deployment

---

# 9. QUESTIONS ANSWERED

1. ✅ **Edit Password:** Admin & kasir bisa edit sendiri. Admin bisa reset password kasir ke "kasir12345"
2. ✅ **Login Method:** Pakai email (no username)
3. ✅ **Onboarding:** Bisa skip, tetap muncul di sidebar sebagai "Panduan"
4. ✅ **Business Type:** Dropdown (Warung, Toko Kelontong, Minimart, Cafe, dll) + "Lainnya" (free text)
5. ✅ **Kasir Password:** Admin set pertama kali, kasir bisa edit sendiri
6. ✅ **Priority:** POS esensi dulu, ML di akhir

---

# 10. NEXT STEPS

1. ✅ Blueprint finalized
2. Mulai **Session 5:** Create database pos_ml_db
3. **Session 6:** Create 13 models
4. **Session 7:** Test models + admin panel
5. Continue sessions 8-24

---

**Status:** READY TO START SESSION 5  
**Date:** 3 Maret 2026  
**Design:** FINAL & APPROVED
