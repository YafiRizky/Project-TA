# 🔴 ANALISA KELEMAHAN & POTENSI BUG — PRODUCTION SCENARIO
**Tanggal:** 31 Mei 2026  
**Konteks:** Jika project ini dijalankan secara real oleh admin dan kasir

---

## Ringkasan

| Kategori | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| 🔒 Keamanan | 2 | 3 | 2 | 0 |
| ⚡ Concurrency & Data | 1 | 2 | 1 | 0 |
| 🖥️ UX & Flow | 0 | 2 | 3 | 0 |
| 🏗️ Arsitektur | 1 | 2 | 1 | 0 |
| 💼 Bisnis Logic | 1 | 2 | 1 | 0 |
| **TOTAL** | **5** | **11** | **8** | **0** |

---

## 🔒 1. KEAMANAN

### 1.1 ❌ Tidak Ada Rate Limiting pada Login [CRITICAL]
**File:** [views.py](file:///c:/laragon/www/TA/pos-backend/accounts/views.py#L99-L131)

**Skenario:** Orang jahat bisa mencoba login ribuan kali per detik (brute force attack) untuk menebak password admin/kasir.

**Kenapa terjadi:** Endpoint `/api/auth/login/` menggunakan `@permission_classes([AllowAny])` tanpa rate limiter. Tidak ada batas percobaan login.

**Dampak:**
- Password admin bisa ditebak jika lemah
- Server bisa down karena request berlebihan (DoS)

**Solusi:** Tambah `django-ratelimit` atau `django-axes` untuk membatasi percobaan login (contoh: max 5 kali per menit per IP).

---

### 1.2 ❌ SECRET_KEY Hardcoded [CRITICAL]
**File:** [settings.py](file:///c:/laragon/www/TA/pos-backend/backend/settings.py#L23)

```python
SECRET_KEY = 'django-insecure-opgp@f!a1@njl+%=q*c=69v!br%no5r3-ato^5*j^s9fwt-@04'
```

**Skenario:** Kalau kode ini di-push ke GitHub publik, siapapun bisa membaca SECRET_KEY → bisa forge JWT token → bisa login sebagai siapapun tanpa password.

**Kenapa terjadi:** Default Django project, tidak pernah diganti ke environment variable.

**Dampak:** Semua JWT token bisa dipalsukan. Total compromise.

**Solusi:** Pindahkan ke environment variable: `SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')`

---

### 1.3 ⚠️ Refresh Token Bukan RefreshToken Asli [HIGH]
**File:** [views.py](file:///c:/laragon/www/TA/pos-backend/accounts/views.py#L172-L176)

```python
# Create simple refresh token (without blacklist dependency)
refresh_token = AccessToken()  # ← Ini AccessToken, bukan RefreshToken!
refresh_token['token_type'] = 'refresh'
```

**Skenario:** Refresh token sebenarnya adalah AccessToken yang di-label "refresh". Ini berarti:
- Token tidak bisa di-blacklist saat logout
- User logout → token lama masih valid sampai expired (7 hari)
- Jika token dicuri, tidak ada cara untuk membatalkannya

**Kenapa terjadi:** Workaround karena model BusinessUser terpisah dari Django User, sehingga `RefreshToken.for_user()` tidak kompatibel langsung.

**Dampak:** Logout tidak benar-benar logout. Token tetap valid.

---

### 1.4 ⚠️ Tidak Ada Validasi File Upload (QRIS Image) [HIGH]
**File:** [views.py](file:///c:/laragon/www/TA/pos-backend/payments/views.py#L58)

```python
qris_image = request.FILES.get('qris_image')
# Langsung disimpan tanpa validasi tipe file, ukuran, atau konten
```

**Skenario:** Admin bisa upload file `.exe`, `.php`, atau file berbahaya lainnya sebagai "QRIS image". Jika server misconfigured, file ini bisa dieksekusi.

**Dampak:** Remote Code Execution (RCE) di server.

**Solusi:** Validasi: cek file extension (hanya `.jpg/.png/.webp`), cek ukuran max (misal 2MB), cek MIME type.

---

### 1.5 ⚠️ Kasir Bisa Akses Endpoint yang Seharusnya Admin-Only [HIGH]
**File:** [views.py](file:///c:/laragon/www/TA/pos-backend/transactions/views.py#L32)

```python
class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # ← Kasir juga bisa CRUD transaksi!
```

**Skenario:** Kasir bisa menghapus atau mengubah transaksi milik kasir lain melalui API (walaupun UI tidak menampilkan tombolnya). Kasir tinggal kirim request manual via Postman/curl.

**Kenapa terjadi:** Frontend membatasi UI, tapi backend tidak membatasi permission per action. `TransactionViewSet` tidak menggunakan `IsBusinessAdmin` untuk `update` dan `destroy`.

**Dampak:** Kasir bisa memanipulasi data transaksi.

---

### 1.6 ⚠️ DEBUG = True & ALLOWED_HOSTS = ['*'] [MEDIUM]
**File:** [settings.py](file:///c:/laragon/www/TA/pos-backend/backend/settings.py#L26-L29)

**Skenario:** Di production:
- `DEBUG=True` menampilkan stack trace dan info sensitif ke user
- `ALLOWED_HOSTS=['*']` membolehkan akses dari domain manapun

**Dampak:** Information disclosure, Host header injection.

---

### 1.7 ⚠️ CORS Terlalu Terbatas (Sebaliknya Bisa Jadi Masalah) [MEDIUM]

**Skenario:** CORS hanya allow `localhost:3000`. Kalau deploy ke server production dengan domain `pos.example.com`, frontend akan gagal terhubung ke backend → semua API call ditolak browser.

**Kenapa terjadi:** Config development belum disiapkan untuk production.

---

## ⚡ 2. CONCURRENCY & DATA

### 2.1 ❌ Race Condition Saat 2 Kasir Checkout Produk yang Sama [CRITICAL]
**File:** [views.py](file:///c:/laragon/www/TA/pos-backend/transactions/views.py#L120-L134)

**Skenario:**
1. Produk A stok = 1
2. Kasir 1 dan Kasir 2 **hampir bersamaan** scan Produk A
3. Kedua kasir melihat stok = 1 (saat validasi stock check)
4. Kedua checkout berhasil → stok jadi **-1** (oversold!)

**Kenapa terjadi:** Stock check (line 132-134) dan stock deduction (line 214-217) terpisah. Walaupun sudah ada `select_for_update()` di deduction, validasi awal tidak di-lock.

**Detail:** `select_for_update()` di line 189 sudah baik untuk bagian FIFO deduction, **TAPI** stock check di line 132-134 menggunakan `aggregate(Sum('quantity'))` yang **TIDAK di-lock**. Jadi celah ada antara check dan deduction.

**Dampak:** Stok bisa negatif, data penjualan tidak akurat.

**Solusi:** Pindahkan stock check ke dalam `select_for_update()` scope, atau gunakan database constraint `CHECK (quantity >= 0)`.

---

### 2.2 ⚠️ Double Submit / Double Click pada Checkout [HIGH]
**File:** Frontend KasirPOSPage.jsx

**Skenario:** Kasir klik "Bayar" → loading lambat → kasir klik lagi → 2 transaksi tercatat untuk 1 penjualan.

**Kenapa terjadi:** Tidak ada mekanisme idempotency key. Frontend mungkin sudah disable button saat loading, tapi request tetap bisa dikirim via network retry atau slow connection.

**Dampak:** Double charge customer, stok berkurang 2x.

**Solusi:** Implementasi idempotency key (client kirim unique ID, server cek duplikat).

---

### 2.3 ⚠️ Timezone Tidak Konsisten [HIGH]
**File:** [settings.py](file:///c:/laragon/www/TA/pos-backend/backend/settings.py#L124)

```python
TIME_ZONE = 'UTC'  # Server pakai UTC
USE_TZ = True
```

**Skenario:**
- Server simpan transaksi jam 10:00 UTC
- User di Indonesia (WIB = UTC+7) → yang dia lihat seharusnya jam 17:00 WIB
- Tapi jika frontend tidak konversi, user lihat jam 10:00 → bingung
- Report "penjualan hari ini" bisa salah karena batasan hari berbeda UTC vs WIB

**Dampak:** Laporan harian tidak akurat, transaksi malam hari masuk ke hari berikutnya.

---

### 2.4 ⚠️ Transaction Code Bisa Collision [MEDIUM]

```python
unique_part = str(uuid4()).split('-')[0].upper()[:5]  # 5 karakter hex
transaction_code = f"TRX-{today}-{unique_part}"
```

**Skenario:** Dengan 5 karakter hex (16^5 = ~1 juta kemungkinan), jika toko sangat ramai (ratusan transaksi per hari), ada kemungkinan kecil 2 transaksi punya kode sama.

**Dampak:** Error database (unique constraint) atau data corruption.

---

## 🖥️ 3. UX & FLOW

### 3.1 ⚠️ Token Expired = Kick Tanpa Peringatan [HIGH]
**File:** [api.js](file:///c:/laragon/www/TA/pos-frontend/src/services/api.js#L50-L84)

**Skenario:**
1. Kasir sedang input transaksi panjang (banyak item)
2. Sudah 1 jam → token expired
3. Kasir klik "Bayar" → redirect ke login tanpa peringatan
4. Semua item di keranjang hilang! Kasir harus ulang dari awal

**Kenapa terjadi:** Token refresh gagal → langsung `window.location.href = '/login'` tanpa simpan state keranjang.

**Dampak:** Kasir frustasi, waktu terbuang, customer menunggu.

**Solusi:** Simpan cart ke localStorage sebelum redirect. Atau tampilkan modal "Sesi habis, silakan login ulang" dengan opsi simpan.

---

### 3.2 ⚠️ Tidak Ada Offline Handling [HIGH]

**Skenario:** Internet mati saat kasir sedang checkout → error, transaksi gagal, tapi stok di client sudah dikurangi (UI). User bingung apakah transaksi berhasil atau tidak.

**Dampak:** Data inconsistency antara apa yang kasir lihat vs database.

---

### 3.3 ⚠️ Tidak Ada Konfirmasi Logout [MEDIUM]

**Skenario:** Kasir tidak sengaja klik logout → langsung keluar. Kalau ada transaksi yang sedang diproses, data hilang.

---

### 3.4 ⚠️ Pagination Tidak Ada di Beberapa Page [MEDIUM]

**Skenario:** Setelah 6 bulan berjalan, ada 5000 produk dan 50.000 transaksi. Halaman Products dan Transactions load semua data sekaligus → browser hang/crash.

**Kenapa terjadi:** Frontend fetch semua data tanpa limit/pagination di beberapa page.

---

### 3.5 ⚠️ Error Message Kurang Informatif [MEDIUM]

**Skenario:** Kasir checkout gagal → pesan error generic "Gagal checkout". Kasir tidak tahu apakah masalah stok, jaringan, atau server error.

---

## 🏗️ 4. ARSITEKTUR

### 4.1 ❌ SQLite untuk Production = Disaster [CRITICAL]
**File:** [settings.py](file:///c:/laragon/www/TA/pos-backend/backend/settings.py#L92-L97)

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

**Skenario:**
- SQLite **tidak support concurrent write** → 2+ kasir checkout bersamaan = `database is locked` error
- SQLite file bisa corrupt jika server crash saat write
- Tidak bisa di-scale ke multiple server

**Dampak:** System crash saat multiple kasir aktif bersamaan.

**Solusi:** Migrasi ke PostgreSQL (sudah ada `psycopg2` installed, tinggal konfigurasi).

---

### 4.2 ⚠️ Tidak Ada Logging yang Proper [HIGH]

**Skenario:** Ada error di production → tidak ada log file → tidak bisa debug. Kasir bilang "tadi error pas checkout" → tidak ada bukti.

**Kenapa terjadi:** `logger` sudah di-import di views.py tapi logging config di settings.py belum diatur (no LOGGING dict).

---

### 4.3 ⚠️ Tidak Ada Backup Strategy [HIGH]

**Skenario:** Server crash → `db.sqlite3` corrupt → semua data hilang (transaksi, produk, user). Tidak ada backup.

**Dampak:** Total data loss.

---

### 4.4 ⚠️ Media Files Tidak Ada CDN/Protection [MEDIUM]

**Skenario:** File QRIS image di `/media/` bisa diakses siapapun yang tahu URL-nya. Tidak ada access control.

---

## 💼 5. BISNIS LOGIC

### 5.1 ❌ Tidak Ada Fitur Void/Refund Transaksi [CRITICAL]

**Skenario:**
1. Kasir salah input → transaksi sudah completed
2. Tidak ada cara untuk void/refund → stok tidak dikembalikan
3. Admin harus manual ubah database → berisiko corruption

**Kenapa terjadi:** Transaksi yang `COMPLETED` di-block dari edit/delete (by design), tapi tidak ada fitur void/refund yang proper.

**Dampak:** Stok tidak akurat, laporan keuangan salah.

---

### 5.2 ⚠️ Kasir Bisa Set Harga Sendiri [HIGH]
**File:** [views.py](file:///c:/laragon/www/TA/pos-backend/transactions/views.py#L104)

```python
# Frontend kirim: {product_id, quantity, price_per_unit, discount}
```

**Skenario:** Kasir bisa mengirim harga yang berbeda dari harga asli produk via API. Misal produk Rp 100.000 tapi kasir kirim `price_per_unit: 10000`.

**Kenapa terjadi:** Backend tidak memvalidasi apakah `price_per_unit` yang dikirim sesuai dengan harga produk di database.

**Dampak:** Kerugian finansial, kasir bisa "diskon" untuk teman.

**Solusi:** Backend harus lookup harga dari database, bukan percaya harga dari frontend.

---

### 5.3 ⚠️ Discount Tanpa Batas & Tanpa Approval [HIGH]

**Skenario:** Kasir bisa memberikan diskon berapa saja tanpa perlu approval admin. Bisa 100% diskon → gratis.

**Kenapa terjadi:** Field `discount_amount` diterima langsung dari frontend tanpa validasi maximum.

**Dampak:** Kerugian finansial.

---

### 5.4 ⚠️ Tidak Ada Audit Trail [MEDIUM]

**Skenario:** Admin mengubah harga produk dari Rp 100.000 ke Rp 50.000 → tidak ada log siapa yang ubah dan kapan. Kalau ada masalah, tidak bisa di-trace.

---

## 📊 PRIORITAS PERBAIKAN (Jika Mau Production-Ready)

### Must Fix Sebelum Production:
1. 🔴 Migrasi SQLite → PostgreSQL
2. 🔴 Rate limiting pada login
3. 🔴 SECRET_KEY ke environment variable
4. 🔴 Fix race condition stock check
5. 🔴 Validasi harga dari database (bukan frontend)
6. 🔴 Fitur void/refund transaksi

### Sebaiknya Di-fix:
7. 🟡 Proper RefreshToken (bukan AccessToken)
8. 🟡 File upload validation
9. 🟡 Timezone → Asia/Jakarta
10. 🟡 Backend permission per action (kasir vs admin)
11. 🟡 Simpan cart sebelum session expire
12. 🟡 Logging configuration

### Nice to Have:
13. 🔵 Audit trail
14. 🔵 Discount approval workflow
15. 🔵 Offline handling
16. 🔵 Pagination optimization
17. 🔵 Backup strategy

---

> [!IMPORTANT]
> **Untuk tugas akhir/demo**, kondisi sekarang sudah cukup baik. Tapi kalau mau **production real** dengan kasir dan uang sungguhan, 6 item "Must Fix" di atas WAJIB diselesaikan dulu.
