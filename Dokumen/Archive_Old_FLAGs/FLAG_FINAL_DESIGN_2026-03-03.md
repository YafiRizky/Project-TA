# FLAG: FINAL DESIGN - POS + ML SYSTEM
**Tanggal:** 3 Maret 2026  
**Status:** FINALIZED - Ready for Session 5  
**Target:** UMKM Indonesia (Warung, Toko Kelontong, Minimart, Toko Printer, dll)

---

# EXECUTIVE SUMMARY

Sistem POS dengan Machine Learning untuk UMKM yang fokus pada:
1. **Manajemen Stok** dengan prediksi ML (stockout, restock, expiry)
2. **Keuangan** dengan forecasting ML (revenue, profit)
3. **Katalog Barang** terpisah dari Input Stok (praktis untuk recurring input)
4. **Barcode Per Batch** (1 batch = 1 barcode untuk semua item)

**User Roles:** Admin/Owner + Kasir  
**Development:** 6 Bulan (24 Sessions)  
**Priority:** Fitur POS Esensi → Laporan → ML/AI

---

# 1. AUTHENTICATION & USER MANAGEMENT

## 1.1 Registrasi Admin/Owner (6 Steps)

### Step 1: Input Email
```
Landing Page → Klik "Daftar" → Form Registrasi
Input: Email
Klik: "Kirim Kode Verifikasi"

Backend:
- Generate token (expires 10 menit)
- Send email dengan link verifikasi
- Save token ke EmailVerification table
```

### Step 2: Verifikasi Email
```
User → Cek Email → Klik Link

Redirect ke halaman baru (continuation)
```

### Step 3: Set Password
```
Form:
- Password (min 8 karakter)
- Confirm Password

Klik: "Lanjutkan"
```

### Step 4: Input Data Usaha
```
Form:
- Nama Usaha (required)
- Nomor HP (required)
- Alamat Usaha (optional)
- Jenis Usaha (dropdown):
  • Warung
  • Toko Kelontong
  • Minimart
  • Cafe/Restoran
  • Toko Pakaian
  • Toko Elektronik
  • Apotik
  • Toko Printer
  • Lainnya (free text)

Klik: "Selesaikan Pendaftaran"
```

### Step 5: Auto Login
```
Akun created → Auto login → Redirect Dashboard
```

### Step 6: Onboarding Modal
```
Modal/Popup muncul:
- Welcome screen
- Tutorial fitur (gambar + penjelasan)
- Bisa skip atau view step by step

Modal tetap accessible dari sidebar "Panduan"
```

**Database Impact:**
- User (role: admin, business info)
- EmailVerification (token tracking)

---

## 1.2 Login (Admin & Kasir)

### Login Flow
```
Landing Page → Form Login
Input: Email + Password
Klik: "Login"

Redirect:
- Admin → Dashboard
- Kasir → Halaman Transaksi
```

---

## 1.3 Lupa Password

### Flow
```
Login Page → Klik "Lupa Password?"
Input: Email
Klik: "Kirim Link Reset"

Email dikirim (link expires 10 menit)
User klik link → Form Reset Password
Input: Password Baru + Confirm
Klik: "Reset Password"

Redirect: Login Page
```

**Database Impact:**
- PasswordReset (token tracking)

---

## 1.4 Edit Password (Admin & Kasir)

### Flow
```
Dashboard → Menu "Profil" → "Ubah Password"

Form:
1. Input Password Lama → Validasi
2. Jika benar → Muncul form di bawah:
   - Password Baru
   - Konfirmasi Password Baru
3. Klik "Simpan"

Notifikasi: "Password berhasil diubah"
```

---

## 1.5 Kelola Kasir (Admin Only)

### Tambah Kasir
```
Admin → Menu "Kelola User" → Tambah Kasir

Form:
- Email (required)
- Nama (required)
- Jabatan: Kasir (fixed)
- Password: (Admin set pertama kali)

Klik: "Simpan"

Akun kasir created
```

### Reset Password Kasir
```
Admin → Menu "Kelola User" → Pilih Kasir → "Reset Password"

Konfirmasi → Password direset ke: "kasir12345"

Notifikasi: "Password kasir direset, kasih tahu kasir secara manual"
```

### Edit/Nonaktifkan Kasir
```
Admin → Kelola User → Pilih Kasir
- Edit: Nama/Email
- Nonaktifkan: Status jadi inactive (tidak bisa login)
```

**Database Impact:**
- User (role: kasir)

---

# 2. KATALOG BARANG (MASTER DATA)

## 2.1 Setup Katalog

### Tujuan
Bikin master list produk yang SERING dibeli/dijual.  
Setup SEKALI, bisa tambah kapan aja.

### Flow - Tambah Barang
```
Admin → Menu "Katalog Barang" → Tambah Barang

Form:
┌────────────────────────────────────────┐
│ Nama Barang: Mie Goreng Indomie       │
│ Satuan: [Box 1kg ▼]                   │
│   Dropdown: Box, Pcs, Karton, Liter,  │
│             Kg, Botol, Sachet, dll     │
│                                        │
│ Kategori: [Mie Instan ▼]             │
│ Supplier Default: [Supplier A ▼]     │
│                                        │
│ Harga Jual: 30000 (per box)          │
│ Min Stok: 20 (warning threshold)     │
│                                        │
│ Foto: [Upload] (optional)            │
│                                        │
│ [✓] Generate Kode & Barcode Otomatis │
│                                        │
│         [Simpan]                       │
└────────────────────────────────────────┘

Sistem Auto Generate:
1. Kode Katalog: 01 (2 digit, sequential)
2. SKU: MG-BOX-001 (auto, untuk display)
3. Barcode Katalog: (belum generate, nanti per batch)

Simpan ke Product table (stok masih 0)
```

### Contoh Katalog
```
Admin input 7 produk:

┌───┬───────────────────┬──────────┬──────────┬────────┬──────────┐
│No │ Nama Barang       │ Satuan   │ Kode     │ SKU    │ Harga    │
├───┼───────────────────┼──────────┼──────────┼────────┼──────────┤
│1  │Mie Goreng Indomie │Box 1kg   │01        │MG-BOX-1│ 30000    │
│2  │Mie Goreng Indomie │1 Pcs     │02        │MG-PCS-1│ 3000     │
│3  │Mie Rebus Indomie  │Box 1kg   │03        │MR-BOX-1│ 30000    │
│4  │Mie Rebus Indomie  │1 Pcs     │04        │MR-PCS-1│ 3000     │
│5  │Minyak Goreng      │Liter     │05        │MY-LTR-1│ 15000    │
│6  │Air Putih Aqua     │Botol 600ml│06       │AQ-BTL-1│ 3000     │
│7  │Kopi Kapal Api     │Sachet    │07        │KP-SCH-1│ 1000     │
└───┴───────────────────┴──────────┴──────────┴────────┴──────────┘

[Tambah Barang] [Edit] [Hapus (soft delete)]
```

**Key Points:**
- Mie Goreng Box vs Mie Goreng Pcs = **2 produk berbeda** di katalog
- Harga Jual sudah diset (estimasi awal, bisa diubah)
- Harga Beli = NULL (belum input stok, harga bisa berubah per batch)
- Stok = 0 (belum input stok)

---

## 2.2 Edit/Hapus Katalog
```
Admin → Katalog Barang → Pilih Produk → Edit/Hapus

Edit: Nama, Satuan, Harga Jual, Min Stok, Foto
Hapus: Soft delete (status: inactive, tidak muncul di dropdown)
```

---

## 2.3 Supplier Management
```
Admin → Menu "Supplier" → Tambah Supplier

Form:
- Nama Supplier
- Kontak/HP
- Email (optional)
- Alamat
- Keterangan (optional)

CRUD: Create, Read, Update, Delete (soft)
```

---

## 2.4 Kategori Management
```
Admin → Menu "Kategori" → Tambah Kategori

Form:
- Nama Kategori (Mie Instan, Minuman, Snack, Sembako, dll)
- Deskripsi (optional)

CRUD: Create, Read, Update, Delete
```

**Database Impact:**
- Product (katalog master)
- Category
- Supplier

---

# 3. INPUT STOK (BATCH MANAGEMENT)

## 3.1 Input Stok Baru (Pilih dari Katalog)

### Tujuan
Input stok yang baru masuk dari supplier.  
Ambil produk dari katalog yang sudah dibuat.

### Flow
```
Admin → Menu "Input Stok" → Tambah Stok Masuk

Form:
┌────────────────────────────────────────┐
│ Tanggal: [05-03-2026] (auto, editable)│
│ Supplier: [Supplier A ▼]             │
│                                       │
│ ────── PRODUK 1 ──────                │
│ Barang: [Pilih dari Katalog ▼]      │
│   Search: "mie goreng"                │
│   Result: • Mie Goreng Box 1kg (01)  │
│           • Mie Goreng 1 Pcs (02)    │
│                                       │
│   Selected: Mie Goreng 1 Pcs         │
│                                       │
│ Jumlah: 200 pcs                       │
│ Harga Beli: 2000 (per pcs)           │
│ Expired: [✓] Ada → [31-12-2026]      │
│                                       │
│ [+ Tambah Produk Lain]                │
│                                       │
│ ────── PRODUK 2 ──────                │
│ Barang: Aqua Botol 600ml              │
│ Jumlah: 100 botol                     │
│ Harga Beli: 2500                      │
│ Expired: [ ] Tidak ada                │
│                                       │
│ ────── PRODUK 3 ──────                │
│ Barang: Kopi Sachet                   │
│ Jumlah: 300 sachet                    │
│ Harga Beli: 800                       │
│ Expired: [✓] Ada → [30-06-2027]      │
│                                       │
│ ──────────────────────────────────    │
│ Total Produk: 3                       │
│ Total Items: 600                      │
│                                       │
│         [Simpan Batch]                │
└────────────────────────────────────────┘
```

### Backend Process (Loop per Produk)
```
PRODUK 1: Mie Goreng 1 Pcs (kode katalog: 02)

1. Generate Batch Barcode:
   Format: [Kode][Tanggal DDMMYY][Sequence]
   Result: 02050326001
   
   Logic Sequence:
   - Cek: Ada batch dengan kode 02 + tanggal 050326 + expired sama?
   - Jika YA: Merge (update qty batch existing)
   - Jika TIDAK: Batch baru (sequence 001, 002, dst)

2. INSERT ProductBatch:
   id: 1
   product_id: 2 (Mie Goreng Pcs dari katalog)
   batch_code: BATCH-20260305-001
   batch_barcode: 02050326001
   jumlah: 200
   harga_beli: 2000
   expired_date: 2026-12-31
   tanggal_masuk: 2026-03-05
   status: active

3. UPDATE Stock:
   product_id: 2
   jumlah: 0 → 200 (tambah)

4. INSERT StockMovement:
   product_id: 2
   batch_id: 1
   tipe: IN
   jumlah: +200
   saldo_akhir: 200
   tanggal: 2026-03-05
   keterangan: "Stok masuk Batch BATCH-20260305-001"

5. UPDATE Product (weighted avg harga beli):
   harga_beli: 2000 (first batch)

Repeat untuk Produk 2 dan 3
```

---

## 3.2 Download & Print Barcode

### Flow
```
Setelah Simpan → Popup Konfirmasi:

┌────────────────────────────────────────┐
│ ✓ Stok Berhasil Disimpan!             │
│                                        │
│ Total 3 Produk, 600 Items             │
│                                        │
│ ────────────────────────────────────  │
│ Produk 1: Mie Goreng Pcs              │
│ Batch: BATCH-20260305-001             │
│ Barcode: 02050326001                  │
│ Qty: 200 pcs                          │
│ [Download PDF] 200 stiker             │
│                                        │
│ Produk 2: Aqua Botol 600ml            │
│ Batch: BATCH-20260305-002             │
│ Barcode: 06050326001                  │
│ Qty: 100 botol                        │
│ [Download PDF] 100 stiker             │
│                                        │
│ Produk 3: Kopi Sachet                 │
│ Batch: BATCH-20260305-003             │
│ Barcode: 07050326001                  │
│ Qty: 300 sachet                       │
│ [Download PDF] 300 stiker             │
│                                        │
│ [Download Semua PDF]                  │
│         [Tutup]                        │
└────────────────────────────────────────┘
```

### PDF Content
```
1 PDF per batch berisi:
- Barcode image (repeated 200x untuk 200 items)
- Nama produk
- Satuan
- Tanggal input
- Batch code

Layout: Grid 2x5 per page (10 stiker per page)
200 stiker = 20 pages
```

### Admin Action
```
1. Download PDF (3 files atau 1 combined)
2. Print (laser/inkjet printer)
3. Potong stiker
4. Tempel ke 200 Mie Goreng fisik (semua stiker SAMA: 02050326001)
```

**Key Point:** 1 Batch = 1 Barcode untuk SEMUA item di batch tersebut!

---

## 3.3 Input Stok Lagi (Recurring)

### Skenario: Input Mie Goreng Pcs Lagi (Tanggal Sama, Harga Naik)
```
Admin → Input Stok → Tanggal: 05-03-2026

Produk: Mie Goreng 1 Pcs (kode: 02)
Jumlah: 50 pcs
Harga Beli: 2100 (naik!)
Expired: 31-01-2027 (beda!)

Sistem Generate:
Barcode: 02050326002 (sequence +1 karena expired berbeda!)
Batch: BATCH-20260305-004
```

**Merge Logic:**
- Same day + Same product + **Same expired** → Merge (update qty batch existing)
- Same day + Same product + **Beda expired** → New batch (sequence +1)

**Result ProductBatch Table:**
```
id | product_id | batch_barcode | qty | harga_beli | expired    | status
1  | 2          | 02050326001   | 200 | 2000       | 2026-12-31 | active
2  | 2          | 02050326002   | 50  | 2100       | 2027-01-31 | active
```

Total Stok Mie Goreng Pcs: 250 pcs (200 + 50)

---

## 3.4 Laporan Stok

### View 1: Stok Summary
```
Admin → Menu "Stok" → Lihat Stok

Tabel:
┌────────────────────┬────────┬──────────┬──────────┬────────┐
│ Nama Barang        │ Satuan │ Stok Now │ Min Stok │ Status │
├────────────────────┼────────┼──────────┼──────────┼────────┤
│ Mie Goreng Pcs     │ Pcs    │ 250      │ 100      │ ✅ Aman │
│ Aqua Botol 600ml   │ Botol  │ 100      │ 50       │ ✅ Aman │
│ Kopi Sachet        │ Sachet │ 300      │ 200      │ ✅ Aman │
│ Minyak Goreng      │ Liter  │ 5        │ 10       │ ⚠️ Kurang│
└────────────────────┴────────┴──────────┴──────────┴────────┘

[Tambah Stok] [Export Excel]
```

### View 2: Stok Per Batch (Detail)
```
Admin → Klik "Mie Goreng Pcs" → Lihat Batch Detail

Tabel:
┌────────────────┬─────┬───────────┬────────────┬────────┐
│ Batch Barcode  │ Qty │ Harga Beli│ Expired    │ Status │
├────────────────┼─────┼───────────┼────────────┼────────┤
│ 02050326001    │ 200 │ 2000      │ 2026-12-31 │ Active │
│ 02050326002    │ 50  │ 2100      │ 2027-01-31 │ Active │
└────────────────┴─────┴───────────┴────────────┴────────┘
Total: 250 pcs

[Print Barcode Batch] [Edit Batch (harga/expired)]
```

### View 3: Stok Movement History
```
Admin → Menu "Stok" → Riwayat Movement

Tabel:
┌────────────┬─────────────────┬──────┬──────┬───────┬──────────┐
│ Tanggal    │ Produk          │ Tipe │ Qty  │ Saldo │ Ket      │
├────────────┼─────────────────┼──────┼──────┼───────┼──────────┤
│ 05/03 08:00│ Mie Goreng Pcs  │ IN   │ +200 │ 200   │Batch 001 │
│ 05/03 10:30│ Mie Goreng Pcs  │ SALE │ -5   │ 195   │TRX001    │
│ 05/03 14:00│ Mie Goreng Pcs  │ IN   │ +50  │ 245   │Batch 002 │
│ 05/03 16:20│ Mie Goreng Pcs  │ SALE │ -10  │ 235   │TRX015    │
└────────────┴─────────────────┴──────┴──────┴───────┴──────────┘

Filter: [Tanggal] [Produk] [Tipe] [Export Excel]
```

**Database Impact:**
- ProductBatch (detail per batch)
- Stock (aggregate summary)
- StockMovement (history)

---

# 4. TRANSAKSI PENJUALAN (KASIR)

## 4.1 Halaman Transaksi

### Layout
```
┌──────────────────────────────────────────────────────────┐
│ TRANSAKSI PENJUALAN             Kasir: Budi | 05/03/2026 │
├────────────────────────┬─────────────────────────────────┤
│ DAFTAR PRODUK          │ KERANJANG                       │
│                        │                                 │
│ [Search: __________]   │ ┌─────────────────────────────┐ │
│                        │ │ Mie Goreng Pcs              │ │
│ ┌────────────────────┐ │ │ @3000 x [5] = 15000         │ │
│ │ Mie Goreng Pcs     │ │ │         [−] [+] [×]         │ │
│ │ @3000              │ │ ├─────────────────────────────┤ │
│ │ Stok: 235          │ │ │ Aqua Botol                  │ │
│ │ [Tambah]           │ │ │ @3000 x [2] = 6000          │ │
│ └────────────────────┘ │ │         [−] [+] [×]         │ │
│ ┌────────────────────┐ │ ├─────────────────────────────┤ │
│ │ Aqua Botol 600ml   │ │ │                             │ │
│ │ @3000              │ │ │ Subtotal: 21000             │ │
│ │ Stok: 100          │ │ │ Diskon: 0                   │ │
│ │ [Tambah]           │ │ │ ─────────────────────────   │ │
│ └────────────────────┘ │ │ TOTAL: 21000                │ │
│                        │ │                             │ │
│ [Scan Barcode: ___]   │ │ Pembayaran:                 │ │
│                        │ │ ○ Cash  ○ Transfer          │ │
│                        │ │ ○ E-Wallet  ○ QRIS          │ │
│                        │ │                             │ │
│                        │ │ Uang Dibayar: [_____]       │ │
│                        │ │ Kembalian: 0                │ │
│                        │ │                             │ │
│                        │ │ [Selesai] [Batal]           │ │
│                        │ └─────────────────────────────┘ │
└────────────────────────┴─────────────────────────────────┘
```

---

## 4.2 Flow Transaksi (3 Cara Input Produk)

### Cara 1: Scan Barcode
```
Kasir scan barcode: 02050326001 (dari stiker Mie Goreng)

Backend:
1. Query ProductBatch: WHERE batch_barcode = '02050326001'
   → Result: Batch ID 1, Product ID 2 (Mie Goreng Pcs)

2. Query Product: WHERE id = 2
   → Result: Nama "Mie Goreng Pcs", Harga Jual 3000

3. Masuk Keranjang:
   - Qty: 1 (default)
   - Subtotal auto calculate: 3000 × 1 = 3000

Frontend Update: Keranjang bertambah 1 item
```

### Cara 2: Search/Klik Manual
```
Kasir ketik di search box: "mie goreng"

Frontend:
- Muncul list produk matching
- Kasir klik "Mie Goreng Pcs"

Backend:
- Query Product by name
- Masuk keranjang (same logic Cara 1)
```

### Cara 3: Klik dari Grid
```
Kasir klik produk dari grid/daftar produk

Backend: Same logic Cara 1
```

---

## 4.3 Edit Qty & Diskon
```
Keranjang:
Mie Goreng Pcs @3000 x [5] = 15000

Kasir:
- Klik [+] → Qty jadi 6
- Klik [−] → Qty jadi 4
- Input manual: Ketik 10 → Qty jadi 10

Subtotal auto update
```

**Diskon (Optional Feature):**
```
Per Item:
- Input diskon: 10% atau 500 (nominal)
- Subtotal jadi: (3000 × 5) - 500 = 14500

Total Transaksi:
- Diskon keseluruhan: 1000
- Grand Total: 21000 - 1000 = 20000
```

---

## 4.4 Pembayaran

### Metode Pembayaran
```
○ Cash (Tunai)
○ Transfer Bank
○ E-Wallet (GoPay/OVO/Dana/ShopeePay)
○ QRIS
```

### Jika Pilih Cash
```
Total: 21000

Input Uang Dibayar: 25000
Kembalian: 4000 (auto calculate)
```

### Jika Pilih Non-Cash
```
Uang Dibayar = Total (no kembalian)
```

---

## 4.5 Selesaikan Transaksi

### Kasir Klik "Selesai"
```
Backend Process (CRITICAL FLOW!):

1. INSERT Sale:
   nomor_transaksi: TRX20260305001 (auto)
   kasir_id: 2 (logged in kasir)
   total: 21000
   diskon: 0
   grand_total: 21000
   payment_method: cash
   uang_dibayar: 25000
   kembalian: 4000
   tanggal: 2026-03-05
   waktu: 10:30:00

2. INSERT SaleItem (per produk di keranjang):
   sale_id: 1
   product_id: 2 (Mie Goreng Pcs)
   batch_id: 1 (from scan barcode 02050326001)
   qty: 5
   harga_satuan: 3000
   diskon: 0
   subtotal: 15000
   
   sale_id: 1
   product_id: 6 (Aqua)
   batch_id: 3 (FIFO auto jika tidak scan batch spesifik)
   qty: 2
   harga_satuan: 3000
   diskon: 0
   subtotal: 6000

3. UPDATE ProductBatch (FIFO Logic):
   Batch 1 (Mie Goreng): 200 → 195 (-5)
   Batch 3 (Aqua): 100 → 98 (-2)

4. UPDATE Stock:
   Product 2 (Mie Goreng): 250 → 245 (-5)
   Product 6 (Aqua): 100 → 98 (-2)

5. INSERT StockMovement (history):
   product_id: 2, batch_id: 1
   tipe: SALE, qty: -5, saldo: 245
   ref_type: Sale, ref_id: 1
   tanggal: 2026-03-05 10:30:00
   
   product_id: 6, batch_id: 3
   tipe: SALE, qty: -2, saldo: 98
   ref_type: Sale, ref_id: 1
   tanggal: 2026-03-05 10:30:00

6. Generate Struk (optional print)
```

---

## 4.6 Struk Transaksi

### Format Struk
```
═══════════════════════════════════════
         TOKO SUMBER REJEKI
      Jl. Merdeka No. 123, Jakarta
         HP: 081234567890
═══════════════════════════════════════

No: TRX20260305001
Tanggal: 05/03/2026  10:30
Kasir: Budi

───────────────────────────────────────
Mie Goreng Pcs
  5 x 3,000                     15,000

Aqua Botol 600ml
  2 x 3,000                      6,000
───────────────────────────────────────
Subtotal:                       21,000
Diskon:                              0
───────────────────────────────────────
TOTAL:                          21,000

Cash:                           25,000
Kembalian:                       4,000
═══════════════════════════════════════
        Terima Kasih
    Selamat Berbelanja Kembali
═══════════════════════════════════════
```

**Print Options:**
- Auto print (thermal printer)
- Manual print (click button)
- Email struk (optional)

---

## 4.7 Transaksi Baru

### Flow
```
Setelah selesai → Klik "Transaksi Baru"

Keranjang kosong
Siap input transaksi berikutnya
```

**Database Impact:**
- Sale (header transaksi)
- SaleItem (detail per produk)
- ProductBatch (qty berkurang per batch)
- Stock (aggregate berkurang)
- StockMovement (history sale)

---

# 5. DASHBOARD & MONITORING

## 5.1 Dashboard Admin

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ DASHBOARD                          Owner: John | Logout │
├─────────────────────────────────────────────────────────┤
│ HARI INI (5 Maret 2026)                                │
│ ┌──────────────┬──────────────┬──────────────┐         │
│ │ Total Penjualan │ Transaksi    │ Items Terjual│      │
│ │ Rp 350,000      │ 25           │ 150 pcs      │      │
│ └──────────────┴──────────────┴──────────────┘         │
│                                                         │
│ GRAFIK PENJUALAN (7 Hari Terakhir)                    │
│ ┌─────────────────────────────────────────────┐        │
│ │     Bar Chart / Line Chart                  │        │
│ └─────────────────────────────────────────────┘        │
│                                                         │
│ PRODUK TERLARIS (Hari Ini)                            │
│ ┌───────────────────────────────────────────┐          │
│ │ 1. Mie Goreng Pcs - 50 pcs                │          │
│ │ 2. Aqua Botol - 30 botol                  │          │
│ │ 3. Kopi Sachet - 25 sachet                │          │
│ └───────────────────────────────────────────┘          │
│                                                         │
│ STOK WARNING ⚠️                                         │
│ ┌───────────────────────────────────────────┐          │
│ │ • Minyak Goreng: 5 liter (min: 10)       │          │
│ │ • Roti Tawar: 3 pcs (min: 10)            │          │
│ │   [Tambah Stok]                           │          │
│ └───────────────────────────────────────────┘          │
│                                                         │
│ EXPIRED WARNING 🚨                                      │
│ ┌───────────────────────────────────────────┐          │
│ │ • Susu UHT Batch 001: 5 hari lagi         │          │
│ │   (Expired: 10/03/2026, Stok: 20)        │          │
│ │   [Diskon] [Buang Stok]                   │          │
│ └───────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

### Real-time Query
```sql
-- Total Penjualan Hari Ini
SELECT SUM(grand_total) FROM sale 
WHERE DATE(tanggal) = TODAY

-- Stok Warning
SELECT * FROM stock s
JOIN product p ON s.product_id = p.id
WHERE s.jumlah < p.min_stok

-- Expired Warning (7 hari)
SELECT * FROM productbatch pb
JOIN product p ON pb.product_id = p.id
WHERE pb.expired_date BETWEEN TODAY AND TODAY+7
  AND pb.status = 'active'
```

---

## 5.2 Dashboard Kasir (Simplified)

### Layout
```
┌─────────────────────────────────────────┐
│ DASHBOARD               Kasir: Budi    │
├─────────────────────────────────────────┤
│ TRANSAKSI HARI INI                     │
│ ┌──────────────┬────────────────┐       │
│ │ Transaksi Saya│ Total Penjualan│      │
│ │ 15            │ Rp 150,000     │      │
│ └──────────────┴────────────────┘       │
│                                         │
│ [Mulai Transaksi]                      │
│                                         │
│ RIWAYAT TRANSAKSI SAYA (Hari Ini)      │
│ ┌───────────────────────────────────┐   │
│ │ TRX...001 | 10:30 | Rp 21,000    │   │
│ │ TRX...002 | 10:45 | Rp 15,000    │   │
│ │ TRX...003 | 11:00 | Rp 30,000    │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

# 6. LAPORAN (ADMIN ONLY)

## 6.1 Laporan Penjualan Harian
```
Admin → Menu "Laporan" → Penjualan Harian

Filter: Tanggal [05-03-2026]

┌────────────────────────────────────────┐
│ LAPORAN PENJUALAN HARIAN              │
│ Tanggal: 5 Maret 2026                 │
├────────────────────────────────────────┤
│ Total Transaksi: 25                   │
│ Total Items Terjual: 150 pcs          │
│ Total Revenue: Rp 350,000             │
│ Total COGS: Rp 250,000                │
│ Profit: Rp 100,000 (28.6%)            │
├────────────────────────────────────────┤
│ PRODUK TERLARIS:                      │
│ 1. Mie Goreng Pcs: 50 pcs - Rp 150K  │
│ 2. Aqua Botol: 30 btl - Rp 90K       │
│ 3. Kopi Sachet: 25 pcs - Rp 25K      │
├────────────────────────────────────────┤
│ PEMBAYARAN:                           │
│ Cash: 20 transaksi (Rp 280K)         │
│ Transfer: 3 transaksi (Rp 50K)       │
│ E-Wallet: 2 transaksi (Rp 20K)       │
└────────────────────────────────────────┘

[Export PDF] [Export Excel] [Print]
```

---

## 6.2 Laporan Periode
```
Admin → Menu "Laporan" → Laporan Periode

Filter:
- Dari: 01-03-2026
- Sampai: 31-03-2026

[Generate]

┌────────────────────────────────────────┐
│ LAPORAN PERIODE                       │
│ 1 - 31 Maret 2026                     │
├────────────────────────────────────────┤
│ Total Transaksi: 500                  │
│ Total Revenue: Rp 5,000,000           │
│ Total COGS: Rp 3,500,000              │
│ Profit: Rp 1,500,000 (30%)            │
├────────────────────────────────────────┤
│ GRAFIK TREN PENJUALAN                 │
│ [Line Chart per hari]                 │
├────────────────────────────────────────┤
│ TOP 10 PRODUK TERLARIS:               │
│ 1. Mie Goreng Pcs: 1,000 pcs          │
│ 2. Aqua Botol: 800 btl                │
│ ...                                   │
└────────────────────────────────────────┘

[Export PDF] [Export Excel]
```

---

## 6.3 Laporan Profit
```
Admin → Menu "Laporan" → Laporan Profit

Period: Bulan Maret 2026

┌────────────────────────────────────────┐
│ ANALISA PROFIT                        │
│ Maret 2026                            │
├────────────────────────────────────────┤
│ Revenue: Rp 5,000,000                 │
│ COGS: Rp 3,500,000                    │
│ Gross Profit: Rp 1,500,000 (30%)     │
├────────────────────────────────────────┤
│ PROFIT PER PRODUK:                    │
│ Mie Goreng Pcs:                       │
│   Revenue: 3000 × 1000 = 3,000,000    │
│   COGS: 2000 × 1000 = 2,000,000       │
│   Profit: 1,000,000 (33%)             │
│                                       │
│ Aqua Botol:                           │
│   Revenue: 3000 × 800 = 2,400,000     │
│   COGS: 2500 × 800 = 2,000,000        │
│   Profit: 400,000 (16.7%)             │
└────────────────────────────────────────┘
```

**COGS Calculation:**
```
Per transaksi:
- SaleItem.product_id → ProductBatch (via batch_id or FIFO)
- Ambil harga_beli dari batch yang terjual
- Sum: COGS = harga_beli × qty terjual
```

---

# 7. EXPIRED MANAGEMENT

## 7.1 Auto Cron Job (Daily 00:00)

### Flow
```
System Cron Job → Execute setiap hari jam 00:00

SQL Query:
SELECT * FROM productbatch
WHERE expired_date = TODAY
  AND status = 'active'

If found:
  Loop per batch expired:
  
  1. UPDATE ProductBatch:
     status = 'expired'
  
  2. UPDATE Stock (kurangi stok):
     product_id = batch.product_id
     jumlah = jumlah - batch.jumlah
  
  3. INSERT StockMovement:
     tipe = 'EXPIRED'
     qty = - batch.jumlah (negative)
     keterangan = 'Auto expired: Batch XXX'
  
  4. INSERT Notification:
     user_id = admin
     message = 'Produk XXX Batch YYY (50 pcs) expired. Stok dikurangi otomatis.'
     type = 'warning'
     read = false
```

---

## 7.2 Warning

 Dashboard (7-30 hari)
```
Dashboard Admin → Section "Expired Warning"

Query:
SELECT * FROM productbatch pb
JOIN product p ON pb.product_id = p.id
WHERE pb.expired_date BETWEEN TODAY AND TODAY+7
  AND pb.status = 'active'

Display:
┌────────────────────────────────────────┐
│ EXPIRED DALAM 7 HARI 🚨                │
├────────────────────────────────────────┤
│ • Susu UHT Batch 001                   │
│   Expired: 10/03/2026 (5 hari lagi)   │
│   Stok: 20 pcs                         │
│   Saran: Diskon atau habiskan cepat   │
│   [Set Diskon] [Buang Stok Manual]    │
└────────────────────────────────────────┘
```

---

## 7.3 Manual Actions

### Diskon Produk Mendekati Expired
```
Admin klik [Set Diskon] →

Form:
- Diskon: 20% atau Rp 5000
- Berlaku sampai: 09/03/2026

UPDATE Product:
  harga_jual_promo = harga_jual - diskon
  promo_until = 09/03/2026

Kasir transaksi: Otomatis pakai harga promo
```

### Buang Stok Manual
```
Admin klik [Buang Stok Manual] →

Konfirmasi:
"Yakin buang 20 pcs Susu UHT Batch 001?"

[Ya] → 
UPDATE ProductBatch: status = 'expired', jumlah = 0
UPDATE Stock: jumlah -= 20
INSERT StockMovement: tipe = 'EXPIRED', qty = -20
```

---

# 8. ML PREDICTIONS (PHASE 3 - AKHIR)

## 8.1 Data Collection

### Training Data Requirements
```
Minimal data:
- 3 bulan historis transaksi (SaleItem)
- Stok movement history (StockMovement)
- Product info (kategori, harga, seasonality)

Before 3 months:
- Dashboard ML: "Data belum cukup untuk prediksi (butuh 3 bulan)"
- Show progress: "Data terkumpul: 45 hari / 90 hari"
```

---

## 8.2 ML Training (Background Job Weekly)

### Cron Job - Setiap Minggu Minggu 02:00
```
System Cron Job:

1. Fetch Historical Data:
   Query SaleItem (last 3-6 months)
   Query Stock (current)
   Query ProductBatch (expired info)

2. Prepare Dataset:
   Features: product_id, date, qty_sold, day_of_week, 
            is_weekend, category, price, season
   Target: qty_sold (untuk stockout prediction)

3. Train Model:
   - Time Series (ARIMA/Prophet): Forecast sales
   - Random Forest: Classify fast/slow moving
   - Regression: Revenue forecasting

4. Save Model:
   Pickle model → Storage
   Save predictions → PredictionResult table

5. Generate Recommendations:
   Based on predictions → save to Recommendation table
```

---

## 8.3 Dashboard ML Predictions

### Prediksi Stok
```
Admin → Menu "ML Predictions" → Prediksi Stok

┌────────────────────────────────────────┐
│ PREDIKSI STOCKOUT (7 Hari Ke Depan)  │
├────────────────────────────────────────┤
│ 🔴 HIGH RISK                          │
│ • Mie Goreng Pcs                       │
│   Stok Saat Ini: 50 pcs               │
│   Prediksi Terjual: 200 pcs (7 hari)  │
│   → STOCKOUT dalam 2 hari!            │
│   Rekomendasi: ORDER 500 pcs sekarang │
│   [Buat Purchase Order]                │
│                                        │
│ 🟡 MEDIUM RISK                         │
│ • Aqua Botol 600ml                     │
│   Stok: 100 btl                        │
│   Prediksi Terjual: 90 btl (7 hari)   │
│   → Aman 7 hari, restock 10 hari lagi │
│                                        │
│ 🟢 SAFE                                │
│ • Kopi Sachet                          │
│   Stok: 300 pcs                        │
│   Prediksi Terjual: 100 pcs (7 hari)  │
│   → Stok mencukupi                     │
└────────────────────────────────────────┘
```

### Rekomendasi Restock
```
┌────────────────────────────────────────┐
│ REKOMENDASI RESTOCK                   │
├────────────────────────────────────────┤
│ Berdasarkan analisa penjualan & stok: │
│                                        │
│ 1. Mie Goreng Pcs                      │
│    Order: 500 pcs                      │
│    Estimasi Habis: 14 hari             │
│    Lead Time Supplier: 2 hari          │
│    → Order Sekarang!                   │
│                                        │
│ 2. Minyak Goreng                       │
│    Order: 50 liter                     │
│    Estimasi Habis: 10 hari             │
│    → Order dalam 3 hari                │
└────────────────────────────────────────┘

[Generate Purchase Order Otomatis]
```

### Expiry Risk Prediction
```
┌────────────────────────────────────────┐
│ PREDIKSI EXPIRY RISK                  │
├────────────────────────────────────────┤
│ Produk berisiko expired sebelum habis:│
│                                        │
│ • Susu UHT Batch 001                   │
│   Expired: 10/03/2026 (7 hari lagi)   │
│   Stok: 20 pcs                         │
│   Prediksi Terjual: 10 pcs (7 hari)   │
│   → Sisa 10 pcs akan expired!          │
│   Kerugian: Rp 50,000                  │
│   Saran: Diskon 20% mulai sekarang    │
│   [Set Diskon Auto]                    │
└────────────────────────────────────────┘
```

### Product Classification
```
┌────────────────────────────────────────┐
│ KLASIFIKASI PRODUK                    │
├────────────────────────────────────────┤
│ FAST MOVING (Laku Cepat):             │
│ • Mie Goreng Pcs (200/minggu)         │
│ • Aqua Botol (150/minggu)             │
│ → Prioritas restock tinggi             │
│                                        │
│ SLOW MOVING (Laku Lambat):            │
│ • Minyak Kemasan Besar (5/minggu)     │
│ • Sarden Kaleng (10/minggu)           │
│ → Kurangi stok minimum                 │
│                                        │
│ DEAD STOCK (Tidak Laku):              │
│ • Makanan Instant Brand X (0/bulan)   │
│ → Rekomendasi: Stop order, clearance  │
└────────────────────────────────────────┘
```

---

### Prediksi Keuangan
```
Admin → Menu "ML Predictions" → Prediksi Keuangan

┌────────────────────────────────────────┐
│ REVENUE FORECASTING                   │
├────────────────────────────────────────┤
│ HISTORIS:                             │
│ Januari 2026: Rp 4,000,000            │
│ Februari 2026: Rp 4,500,000 (+12.5%) │
│ Maret 2026: Rp 5,000,000 (+11.1%)     │
│                                        │
│ PREDIKSI:                             │
│ April 2026: Rp 5,500,000 (+10%)       │
│ Mei 2026: Rp 6,000,000 (+9%)          │
│ Juni 2026: Rp 6,500,000 (+8%)         │
│                                        │
│ Confidence: 85%                        │
│ Trend: 📈 Positive Growth             │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ PROFIT FORECASTING                    │
├────────────────────────────────────────┤
│ Maret 2026: Rp 1,500,000 (30%)        │
│ Prediksi April: Rp 1,650,000 (30%)    │
│                                        │
│ Cost Optimization:                     │
│ • Mie Goreng: Cari supplier           │
│   harga lebih murah (save 10%)        │
│ • Bulk order Aqua: Diskon 5%          │
│   (min order 500 btl)                 │
└────────────────────────────────────────┘
```

**Database Impact:**
- MLPrediction (store model predictions)
- MLRecommendation (store recommendations)
- MLModel (store model metadata & pickle path)

---

# 9. FITUR TAMBAHAN

## 9.1 Purchase Order (Optional - Tier 2)
```
Admin → Menu "Purchase Order" → Buat PO

Form:
- Supplier: [Supplier A ▼]
- Tanggal PO: [Today]
- Expected Delivery: [+3 days]

Produk:
┌────────────────────────────────────┐
│ Produk        │ Qty │ Harga │ Total│
├────────────────────────────────────┤
│ Mie Goreng Pcs│ 500 │ 2000  │1,000K│
│ Aqua Botol    │ 100 │ 2500  │ 250K │
└────────────────────────────────────┘
Grand Total: Rp 1,250,000

Status: Draft / Pending / Received

[Simpan sebagai Draft] [Kirim ke Supplier]

When Received:
Admin → PO Detail → [Terima Barang]
→ Konfirmasi qty diterima
→ Auto create StockMovement (IN)
→ Status jadi "Received"
```

---

## 9.2 Notifikasi System
```
Real-time notification (SSE/WebSocket):

Admin Dashboard → Bell icon 🔔 (badge count)

┌────────────────────────────────────┐
│ NOTIFIKASI                        │
├────────────────────────────────────┤
│ • Stok Minyak Goreng < minimum    │
│   (5 menit lalu) [Lihat]          │
│                                   │
│ • Susu UHT akan expired 3 hari    │
│   (1 jam lalu) [Lihat]            │
│                                   │
│ • Transaksi hari ini 25 (target 30)│
│   (Baru saja) [Dashboard]         │
└────────────────────────────────────┘

[Mark All Read]
```

---

## 9.3 User Settings & Profil
```
Admin → Menu "Profil" →

Profil Usaha:
- Nama Usaha: (edit)
- No HP: (edit)
- Alamat: (edit)
- Jenis Usaha: (edit)
- Logo: [Upload]

Profil Admin:
- Email: (tidak bisa edit)
- Nama: (edit)

[Ubah Password]
[Simpan Perubahan]
```

---

## 9.4 Export Data
```
Laporan → [Export Excel/PDF]

Format Excel:
- Sheet 1: Summary
- Sheet 2: Detail Transaksi
- Sheet 3: Top Products
- Sheet 4: Profit Analysis

Format PDF:
- Header: Logo + Nama Usaha
- Content: Laporan lengkap
- Footer: Tanggal generate
```

---

# 10. DATABASE SCHEMA (FINAL COMPLETE)

```sql
-- ============================================
-- AUTHENTICATION & USER
-- ============================================

User (Django AbstractUser extended)
  id (PK)
  email (unique, login identifier)
  password (hashed)
  role (choices: 'admin', 'kasir')
  
  -- Business Info (admin only)
  business_name (nullable)
  business_phone (nullable)
  business_address (text, nullable)
  business_type (nullable)
  business_logo (image, nullable)
  
  -- Status
  is_verified (boolean, default False)
  is_active (boolean, default True)
  
  -- Timestamps
  created_at
  updated_at

EmailVerification
  id (PK)
  email
  token (unique, 64 chars)
  created_at
  expires_at (created + 10 min)
  is_used (boolean, default False)

PasswordReset
  id (PK)
  user_id (FK User)
  token (unique, 64 chars)
  created_at
  expires_at (created + 10 min)
  is_used (boolean, default False)

-- ============================================
-- MASTER DATA
-- ============================================

Category
  id (PK)
  nama
  deskripsi (nullable)
  created_at
  updated_at

Supplier
  id (PK)
  nama
  kontak
  email (nullable)
  alamat (text, nullable)
  keterangan (text, nullable)
  status (choices: 'active', 'inactive')
  created_at
  updated_at

-- ============================================
-- KATALOG BARANG (MASTER PRODUCT)
-- ============================================

Product
  id (PK)
  kode_katalog (unique, 2 digit: '01', '02', '03'...)
  nama_barang
  satuan (choices: 'Box', 'Pcs', 'Karton', 'Liter', 'Kg', 'Botol', 'Sachet')
  sku (auto: 'MG-BOX-001', for display)
  
  kategori_id (FK Category)
  supplier_id (FK Supplier, default supplier)
  
  harga_jual (decimal)
  harga_beli (decimal, nullable, weighted average)
  min_stok (integer, warning threshold)
  
  foto (image, nullable)
  deskripsi (text, nullable)
  status (choices: 'active', 'inactive')
  
  created_at
  updated_at

-- ============================================
-- STOK MANAGEMENT
-- ============================================

Stock
  id (PK)
  product_id (FK Product, unique)
  jumlah (integer, sum dari semua batch active)
  updated_at

ProductBatch
  id (PK)
  product_id (FK Product)
  
  batch_code (unique: 'BATCH-YYYYMMDD-XXX')
  batch_barcode (unique, 11 digit: 'KODEDDMMYYXXX')
  
  jumlah (integer, qty batch ini)
  harga_beli (decimal, per batch, bisa beda)
  expired_date (date, nullable, per batch)
  
  tanggal_masuk (date)
  supplier_id (FK Supplier, nullable)
  
  status (choices: 'active', 'depleted', 'expired')
  
  created_at
  updated_at

StockMovement
  id (PK)
  product_id (FK Product)
  batch_id (FK ProductBatch, nullable)
  
  tipe (choices: 'IN', 'OUT', 'SALE', 'EXPIRED', 'ADJUSTMENT')
  jumlah (integer, + untuk IN, - untuk OUT/SALE)
  saldo_akhir (integer, stock balance after movement)
  
  tanggal (datetime)
  keterangan (text, nullable)
  
  -- Reference to transaction (polymorphic)
  ref_type (nullable: 'Sale', 'PurchaseOrder')
  ref_id (integer, nullable)
  
  created_by (FK User)
  created_at

-- ============================================
-- TRANSAKSI PENJUALAN
-- ============================================

Sale
  id (PK)
  nomor_transaksi (unique: 'TRX20260305001')
  kasir_id (FK User)
  
  total (decimal, subtotal before diskon)
  diskon (decimal, total discount)
  grand_total (decimal, final amount)
  
  payment_method (choices: 'cash', 'transfer', 'ewallet', 'qris')
  uang_dibayar (decimal, nullable if non-cash)
  kembalian (decimal, nullable if non-cash)
  
  tanggal (date)
  waktu (time)
  
  created_at

SaleItem
  id (PK)
  sale_id (FK Sale)
  product_id (FK Product)
  batch_id (FK ProductBatch, tracking batch mana terjual)
  
  qty (integer)
  harga_satuan (decimal, harga jual saat transaksi)
  diskon (decimal, per item)
  subtotal (decimal, (harga_satuan × qty) - diskon)
  
  -- COGS tracking
  harga_beli_satuan (decimal, from batch for profit calc)
  
  created_at

-- ============================================
-- PURCHASE ORDER (OPTIONAL)
-- ============================================

PurchaseOrder
  id (PK)
  nomor_po (unique: 'PO20260305001')
  supplier_id (FK Supplier)
  
  tanggal_po (date)
  expected_delivery (date, nullable)
  
  total (decimal)
  status (choices: 'draft', 'pending', 'received', 'cancelled')
  
  keterangan (text, nullable)
  
  created_by (FK User)
  created_at
  updated_at

PurchaseOrderItem
  id (PK)
  po_id (FK PurchaseOrder)
  product_id (FK Product)
  
  qty_order (integer)
  qty_received (integer, nullable, when status=received)
  harga_beli (decimal)
  subtotal (decimal, qty × harga_beli)
  
  created_at

-- ============================================
-- ML PREDICTIONS & RECOMMENDATIONS
-- ============================================

MLPrediction
  id (PK)
  product_id (FK Product, nullable for revenue forecast)
  
  prediction_type (choices: 'stockout', 'restock', 'expiry_risk', 
                            'revenue_forecast', 'profit_forecast',
                            'product_classification')
  
  prediction_date (date, tanggal prediksi dibuat)
  forecast_period (date, untuk prediksi periode berapa)
  
  predicted_value (json, store prediction result)
  confidence_score (float, 0-1)
  
  model_version (varchar, track model version)
  
  created_at

MLRecommendation
  id (PK)
  prediction_id (FK MLPrediction, nullable)
  product_id (FK Product, nullable)
  
  recommendation_type (choices: 'restock_now', 'discount_product', 
                                'stop_ordering', 'increase_stock')
  
  recommendation_text (text)
  priority (choices: 'high', 'medium', 'low')
  
  is_applied (boolean, default False)
  applied_at (datetime, nullable)
  
  created_at

MLModel
  id (PK)
  model_name (varchar)
  model_type (choices: 'arima', 'prophet', 'random_forest', 'xgboost')
  model_path (filepath, pickle location)
  
  training_data_from (date)
  training_data_to (date)
  
  accuracy_score (float, nullable)
  metrics (json, store evaluation metrics)
  
  is_active (boolean)
  version (varchar)
  
  trained_at
  created_at

-- ============================================
-- NOTIFICATIONS
-- ============================================

Notification
  id (PK)
  user_id (FK User)
  
  title (varchar)
  message (text)
  type (choices: 'info', 'warning', 'danger', 'success')
  
  link (varchar, nullable, redirect url)
  
  is_read (boolean, default False)
  read_at (datetime, nullable)
  
  created_at

-- ============================================
-- SYSTEM SETTINGS
-- ============================================

SystemSetting
  id (PK)
  key (unique, varchar)
  value (text, json or string)
  description (text, nullable)
  
  updated_at

-- Examples:
-- key='email_backend', value='console' or 'sendgrid'
-- key='expired_warning_days', value='7'
-- key='min_data_for_ml', value='90'
```

---

# 11. TECHNICAL STACK

## Backend
- **Framework:** Django 6.0.2
- **Database:** PostgreSQL (pos_ml_db)
- **API:** Django REST Framework
- **Authentication:** JWT (JSON Web Token)
- **Email:** Django Console (dev), SendGrid (prod)
- **Barcode:** python-barcode library
- **PDF:** ReportLab or WeasyPrint
- **ML:** Scikit-learn, Pandas, NumPy, Prophet/ARIMA

## Frontend
- **Framework:** React 19.0.0
- **Build:** Vite 7.3.1
- **Styling:** Tailwind CSS
- **HTTP:** Axios
- **Charts:** Chart.js or Recharts
- **State:** Context API or Zustand
- **Routing:** React Router

## Infrastructure
- **Development:** Laragon (Windows), PostgreSQL
- **Production:** VPS (DigitalOcean/AWS), Nginx, Gunicorn
- **Email Service:** SendGrid (free 100/day)
- **Storage:** Local (dev), S3/DO Spaces (prod) untuk images

---

# 12. DEVELOPMENT ROADMAP (24 SESSIONS)

## Phase 1: Foundation (Sessions 1-4) ✅
- Session 1-3: Planning, Environment Setup
- Session 4: Project Structure (Django + React)

## Phase 2: Database (Sessions 5-7) ⏳
- **Session 5: Create Database & Configure**
  - Create pos_ml_db
  - Configure settings.py
  - Run default migrations
  - Create superuser
  
- **Session 6: Models Part 1 (Master Data)**
  - User (extended)
  - EmailVerification, PasswordReset
  - Category, Supplier
  - Product (katalog)
  
- **Session 7: Models Part 2 (Stok & Transaksi)**
  - Stock, ProductBatch, StockMovement
  - Sale, SaleItem
  - PurchaseOrder, PurchaseOrderItem (optional)

## Phase 3: Backend API (Sessions 8-10)
- **Session 8: Auth API**
  - Register, Login, Logout
  - Forgot Password, Reset Password
  - JWT implementation
  
- **Session 9: Master Data API**
  - Product CRUD
  - Category, Supplier CRUD
  - Barcode generation API
  
- **Session 10: Stok & Transaksi API**
  - Input Stok API (batch creation)
  - Stock query API
  - Sale creation API
  - PDF barcode generation

## Phase 4: Frontend UI (Sessions 11-17)
- **Session 11: Auth Pages**
  - Landing, Login, Register (6 steps)
  - Forgot Password
  
- **Session 12: Dashboard**
  - Admin Dashboard (ringkasan, warning, grafik)
  - Kasir Dashboard simple
  
- **Session 13: Katalog & Supplier**
  - Katalog Barang CRUD
  - Supplier, Kategori CRUD
  
- **Session 14: Input Stok**
  - Form input stok (multiple produk)
  - Download barcode PDF
  
- **Session 15-16: Transaksi Kasir**
  - Halaman transaksi (scan/search)
  - Keranjang, pembayaran
  - Print struk
  
- **Session 17: Kelola User**
  - CRUD Kasir
  - Reset password
  - Profil usaha

## Phase 5: Laporan (Sessions 18-19)
- **Session 18: Laporan Penjualan**
  - Harian, Periode
  - Export PDF/Excel
  
- **Session 19: Laporan Stok & Profit**
  - Stok per batch
  - Movement history
  - Profit analysis

## Phase 6: ML Integration (Sessions 20-23)
- **Session 20: ML Data Preparation**
  - Data collection pipeline
  - Feature engineering
  
- **Session 21: ML Models Training**
  - Stockout prediction
  - Restock recommendation
  - Product classification
  
- **Session 22: ML Predictions API**
  - Prediction endpoints
  - Recommendation generation
  
- **Session 23: ML Dashboard**
  - Prediksi stok UI
  - Revenue forecasting UI
  - Recommendations display

## Phase 7: Deployment (Session 24)
- **Session 24: Production Deployment**
  - Server setup (VPS)
  - PostgreSQL production
  - SendGrid email setup
  - Deploy Django + React
  - Domain & SSL
  - Testing production

---

# 13. FITUR SUMMARY

## Admin/Owner Features (15 Modules)
1. ✅ Dashboard (ringkasan bisnis real-time)
2. ✅ Katalog Barang (master data produk)
3. ✅ Input Stok (batch management, barcode generation)
4. ✅ Manajemen Stok (view summary, batch detail, movement history)
5. ✅ Transaksi Penjualan (sama kayak kasir)
6. ✅ Laporan Penjualan (harian, periode, profit)
7. ✅ Laporan Stok (batch tracking, expiry warning)
8. ✅ Supplier Management (CRUD)
9. ✅ Kategori Management (CRUD)
10. ✅ Purchase Order (optional - Tier 2)
11. ✅ Kelola User (CRUD kasir, reset password)
12. ✅ Profil Usaha (edit data bisnis)
13. ✅ Edit Password
14. ✅ Panduan/Tutorial (modal accessible)
15. ✅ ML Predictions (stockout, restock, revenue forecast)

## Kasir Features (5 Modules)
1. ✅ Dashboard Simple (transaksi hari ini)
2. ✅ Transaksi Penjualan (scan barcode/search, keranjang, pembayaran, print struk)
3. ✅ Cek Stok (view only, tidak bisa tambah/kurangi)
4. ✅ Riwayat Transaksi (transaksi sendiri)
5. ✅ Profil (edit password)

---

# 14. KEY DECISIONS (FINALIZED)

## Authentication
- ✅ Login pakai Email (no username)
- ✅ Register: 6 steps with email verification (10 min expiry)
- ✅ Admin set kasir password pertama kali
- ✅ Kasir & admin bisa edit password sendiri (input password lama → baru)
- ✅ Admin bisa reset password kasir → default "kasir12345"
- ✅ Onboarding wizard: Bisa skip, accessible dari sidebar "Panduan"

## Katalog & Stok
- ✅ 2 Menu terpisah: Katalog Barang (master) + Input Stok (batch)
- ✅ Katalog: Produk berbeda per satuan (Mie Box vs Mie Pcs = 2 produk)
- ✅ Kode Katalog: 2 digit sequential (01, 02, 03...)
- ✅ Harga Jual: Set di katalog
- ✅ Harga Beli: Input saat input stok (fleksibel per batch)

## Barcode
- ✅ **Barcode Per Batch** (bukan per katalog, bukan per item)
- ✅ Format: [Kode Katalog 2 digit][Tanggal DDMMYY 6 digit][Sequence 3 digit]
- ✅ Contoh: 02050326001 (Mie Goreng Pcs, 5 Maret 2026, Batch 1)
- ✅ Length: 11 digit (EAN-13 compatible)
- ✅ 1 Batch = 1 Barcode untuk SEMUA item di batch
- ✅ Print: Download PDF (200 stiker sama), print, tempel

## Stok Management
- ✅ Batch Tracking (not serial tracking)
- ✅ FIFO automatic (expired terdekat keluar dulu)
- ✅ Expired auto handling (cron daily 00:00, auto kurangi stok)
- ✅ Warning dashboard (7-30 hari sebelum expired)
- ✅ Weighted average harga beli untuk profit calculation

## Business Type
- ✅ Dropdown: Warung, Toko Kelontong, Minimart, Cafe, Toko Pakaian, Elektronik, Apotik, Toko Printer, Lainnya (free text)

## Email Service
- ✅ Development: Django Console Backend (print to terminal)
- ✅ Production: SendGrid (free 100 email/day)

## Priority
- ✅ Phase 1-2: POS Esensi (transaksi, stok, laporan)
- ✅ Phase 3: Laporan & Supplier (optional PO)
- ✅ Phase 4: ML/AI (predictions, recommendations)

---

# 15. NEXT STEPS

1. ✅ Design finalized (THIS DOCUMENT)
2. START **Session 5:** Create Database
   - Create pos_ml_db PostgreSQL
   - Configure Django settings.py
   - Run default migrations (18 tables)
   - Create superuser
   - Test admin panel

3. **Session 6:** Create Models Part 1
   - User, EmailVerification, PasswordReset
   - Category, Supplier, Product

4. **Session 7:** Create Models Part 2
   - Stock, ProductBatch, StockMovement
   - Sale, SaleItem
   - Migrations, Admin registration

5. Continue Sessions 8-24

---

**STATUS:** ✅ READY FOR SESSION 5  
**DATE:** 3 Maret 2026  
**DESIGN:** FINAL & APPROVED  
**NEXT ACTION:** CREATE DATABASE pos_ml_db

---

# END OF DOCUMENT
