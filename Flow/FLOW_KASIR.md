# Flow Kasir — POS ML System

## A. LOGIN KASIR [OK]

### A1. Login
```
Buka halaman Login → Pilih Tab "Kasir"
  → Isi: Kode Bisnis (dari admin) + Username + Password
  → Backend: Validasi kredensial, cek role = kasir, cek is_active
  → Generate JWT token dengan payload business_code
  → Redirect ke Dashboard Kasir
```

---

## B. DASHBOARD KASIR [OK]

### B1. Melihat Dashboard
```
Login sebagai Kasir
  → Dashboard menampilkan:
     - Greeting + tanggal hari ini
     - 2 card statistik: Produk Stok Rendah, Transaksi Hari Ini
     - Warning stok rendah: "Hubungi admin untuk pengisian"
     - Quick Action: "Buat Transaksi" → navigasi ke POS
```

### B2. Bell Notifikasi Kasir [OK]
```
Di semua halaman (TopBar):
  → Bell icon + badge jumlah produk stok rendah/habis
  → Klik bell → dropdown panel
  → Tampil daftar produk dengan status HABIS/RENDAH
  → Tombol "Kirim Notif" per-item
  → Klik "Kirim Notif" → Backend: POST /api/notifications/create/
  → Admin terima notifikasi di bell panel mereka
```

---

## C. TRANSAKSI POS (INTI KASIR) [OK]

### C1. Cari & Tambah Produk ke Keranjang
```
Menu POS / Klik "Buat Transaksi"
  → Halaman POS tampil: area pencarian + keranjang

Cara tambah produk:
  1. Ketik nama/kode di search bar → hasil muncul real-time
  2. Klik produk dari hasil pencarian
  → Produk masuk keranjang dengan qty = 1
  → Jika produk sudah di keranjang, qty bertambah +1
  → Validasi: qty tidak boleh melebihi stok tersedia
```

### C2. Kelola Keranjang
```
Keranjang (panel kanan):
  → Setiap item menampilkan: Nama, Harga, Qty, Subtotal
  → Tombol +/- untuk ubah qty
  → Tombol hapus (X) untuk remove item
  → Summary di bawah: Subtotal → Grand Total
  → Tombol "Kosongkan" → dialog konfirmasi → clear semua
```

### C3. Proses Pembayaran
```
Keranjang terisi → Pilih metode pembayaran:
  → Cash (selalu tersedia, posisi pertama)
  → Metode lain sesuai yang admin aktifkan (QRIS, Transfer, E-Wallet, Card)

Jika Cash:
  → Input "Uang Dibayar" (format Rp otomatis)
  → Validasi: uang dibayar >= grand total
  → Auto-hitung kembalian
  → Klik "Bayar" → proses

Jika Non-Cash (QRIS/Transfer/dll):
  → Uang dibayar = grand total (otomatis)
  → Klik "Bayar" → proses
```

### C4. Checkout Berhasil
```
Klik "Bayar"
  → Backend: POST /api/transactions/checkout/
     - Validasi stok cukup
     - transaction.atomic() + select_for_update() (mencegah race condition)
     - Buat Transaction + TransactionItem records
     - Kurangi stok batch (FIFO: batch paling lama duluan)
     - Jika batch habis, status → DEPLETED, lanjut batch berikutnya
     - idempotency_key mencegah duplikasi klik ganda
  → Frontend: Modal struk muncul
```

### C5. Struk / Receipt
```
Modal struk menampilkan:
  ┌─────────────────────────────────┐
  │   NAMA BISNIS                   │
  │   Alamat bisnis                 │
  │   No. Telp                      │
  ├─────────────────────────────────┤
  │ No: TRX-XXXXXXXX                │
  │ Tanggal & Waktu                 │
  │ Kasir: Nama Kasir               │
  ├─────────────────────────────────┤
  │ Item 1    qty x harga  subtotal │
  │ Item 2    qty x harga  subtotal │
  ├─────────────────────────────────┤
  │ TOTAL                Rp XXX.XXX │
  │ Bayar                Rp XXX.XXX │
  │ Kembalian            Rp XXX.XXX │
  ├─────────────────────────────────┤
  │ Terima kasih!                   │
  └─────────────────────────────────┘

  Tombol: [Transaksi Baru] → reset keranjang, siap customer baru
```

---

## D. PROFIL KASIR [OK]

### D1. Lihat & Edit Profil
```
Menu Profil → Tab Data Pribadi:
  - Lihat: Nama, Username, Email
  - Ubah: Nama, Email → Simpan
  - Tidak bisa ubah data bisnis (read-only untuk kasir)
```

### D2. Ganti Password
```
Menu Profil → Tab Password:
  - Password Lama, Password Baru, Konfirmasi
  → Backend: POST /auth/change-password/
```

---

## E. FITUR KASIR YANG BELUM

### E1. Hold Transaction [BELUM]
```
[BELUM] Saat transaksi, bisa "Hold" keranjang → simpan sementara
  → Layani customer lain dulu
  → Kembali → "Resume" keranjang yang di-hold
```

### E2. Barcode Scanner [OK PARTIAL]
```
[OK] Scan barcode via kamera
[BELUM] Scan via USB barcode scanner (auto-input ke search)
```

### E3. Riwayat Transaksi Kasir [OK PARTIAL]
```
[OK] Kasir bisa lihat transaksi hari ini di dashboard
[BELUM] Filter transaksi per shift kasir
[BELUM] Statistik performa kasir (total penjualan, item terjual)
```
