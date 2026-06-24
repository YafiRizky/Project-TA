# Flow Sistem Background — POS ML System

## A. FIFO (First In First Out) [OK]

### A1. Saat Checkout
```
Kasir checkout item: "Mie Goreng" qty 5
  → Backend query:
     SELECT * FROM ProductBatch
     WHERE product_id = X AND status = 'ACTIVE' AND quantity > 0
     ORDER BY purchase_date ASC   ← Batch paling lama duluan
  → Batch #1 (qty 3): kurangi 3, sisa 0 → status DEPLETED
  → Batch #2 (qty 100): kurangi 2, sisa 98
  → StockMovement dicatat: type=OUT, qty=5, reference=TRX-XXX
```

---

## B. NOTIFIKASI STOK [OK]

### B1. Frontend Calculation (useStockAlerts hook)
```
Setiap 60 detik:
  → Fetch semua produk aktif + semua batch aktif
  → Hitung total stok per produk: SUM(batch.quantity) WHERE status=ACTIVE
  → Bandingkan dengan min_stock produk:
     - stok = 0 → HABIS
     - stok <= min_stock → RENDAH
     - stok > min_stock → AMAN
  → lowStockCount → badge bell
  → lowStockProducts → dropdown panel
```

### B2. Kasir Kirim Notif ke Admin
```
Kasir klik "Kirim Notif" di bell panel
  → Backend: POST /api/notifications/create/
     - product_id, notif_type (LOW_STOCK/OUT_OF_STOCK), message
     - sender = kasir yang kirim
     - business = bisnis kasir
  → Admin bisa lihat di bell panel (query GET /api/notifications/)
```

---

## C. MULTI-TENANT ISOLATION [OK]

### C1. Data Isolation
```
Setiap request API:
  → JWT token → extract user → user.business_id
  → Semua query di-filter: WHERE business_id = user.business_id
  → Produk Bisnis A tidak terlihat oleh Bisnis B
  → Transaksi, batch, kasir — semua terpisah per bisnis
```

---

## D. AUTHENTICATION & TOKEN [OK]

### D1. JWT Flow
```
Login → Backend generate:
  - Access token (durasi pendek, untuk API call)
  - Refresh token (durasi panjang, untuk perpanjang access)
  → Frontend simpan di localStorage
  → Setiap API call: Header Authorization: Bearer {access_token}
  → Jika access expired: auto-refresh pakai refresh token
  → Jika refresh expired: auto-logout → redirect ke login
```

---

## E. FIFO STOK & BATCH LIFECYCLE [OK]

### E1. Lifecycle Batch
```
BARU MASUK
  → status: ACTIVE, qty: 200
  
TERJUAL SEBAGIAN
  → status: ACTIVE, qty: 45 (155 terjual via checkout)
  
HABIS TERJUAL
  → qty = 0 → status: DEPLETED (otomatis saat checkout)
  
KADALUARSA [BELUM OTOMATIS]
  → [BELUM] Cron job cek tanggal kadaluarsa setiap hari
  → [OK] Manual: admin ubah status ke EXPIRED di inventory page
  
DIHAPUS
  → Admin klik hapus → status: DEPLETED, qty: 0
```

---

## F. SISTEM YANG BELUM DIIMPLEMENTASI

### F1. ML Training Pipeline [BELUM]
```
[BELUM] Setiap minggu (cron):
  → Ambil data transaksi 3 bulan terakhir
  → Train model: ARIMA (demand), Logistic Regression (expiry), K-Means (classification)
  → Simpan model di server
  → Update prediksi di dashboard ML
```

### F2. Auto Expired Check [BELUM]
```
[BELUM] Setiap hari (cron):
  → Query batch WHERE expiry_date <= today AND status = ACTIVE
  → Update status → EXPIRED
  → Kirim notifikasi ke admin
```

### F3. Email/WhatsApp Notification [BELUM]
```
[BELUM] Saat stok kritis / batch akan expired:
  → Kirim email ke admin
  → Opsional: kirim WhatsApp notification
```
