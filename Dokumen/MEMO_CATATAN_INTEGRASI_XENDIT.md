# MEMO: Status Testing & Catatan Integrasi Payment Gateway Xendit

**Tanggal Memo:** 4 Agustus 2026  
**Sistem:** Metacrura POS (Point of Sale Integrated Machine Learning)  
**Penguji:** User & System Agent  
**Status Pengujian:** 2 dari 3 Metode Xendit 100% Berhasil & Smooth  

---

## 📊 Hasil Pengujian Integrasi Xendit Native

| Metode Pembayaran | Status Pengujian | Keterangan & Detail Log |
| :--- | :---: | :--- |
| **Virtual Account (VA / Bank)** | ✅ **BERHASIL & LANCAR** | Pilihan bank (BCA, Mandiri, BNI, BRI, Permata) berhasil membuat kode VA, simulasi bayar 200/201 OK, dan otomatis mentrigger checkout POS (`TRX-260804-00001`). |
| **QRIS (Dynamic QR Code)** | ✅ **BERHASIL & LANCAR** | Generate QR code berjalan lancar, simulasi pembayaran sukses, dan mentrigger checkout POS (`TRX-260804-00002`). |
| **E-Wallet (OVO, DANA, LinkAja, ShopeePay)** | ⚠️ **MEMERLUKAN CALLBACK URL** | Xendit API mengembalikan error 502/400 karena konfigurasi Callback URL belum diatur di Xendit Dashboard untuk channel E-Wallet. |

---

## 📝 Detail Error Log E-Wallet Xendit

```text
[ERROR] - Xendit E-Wallet API error: Payment request failed because there was no input of callback url in your dashboard settings or request headers. Please save your callback url in your dashboard settings.
[ERROR] - Bad Gateway: /api/payments/xendit/create-payment/
[ERROR] - "POST /api/payments/xendit/create-payment/ HTTP/1.1" 502 196
```

---

## 🛠️ Catatan & Panduan Penyelesaian (Saat Deploy Production / Online API)

1. **Penyebab**: Syarat API V3 Xendit E-Wallet mengharuskan adanya `callback_url` / `redirect_url` yang terdaftar di **Xendit Dashboard Settings** atau dikirimkan melalui request header/payload.
2. **Solusi saat Backend Terdeploy ke Railway/VPS**:
   - Masuk ke Dashboard Xendit → **Settings** → **Callbacks**.
   - Isi **E-Wallet Payment Callback URL** dengan URL backend live aplikasi, contoh:  
     `https://your-domain.up.railway.app/api/payments/xendit/webhook/`
   - Atau pastikan `success_redirect_url` & `failure_redirect_url` disertakan pada header/body payload e-wallet request di backend (`pos-backend/payments/services.py`).
3. **Catatan Tambahan**:
   - Untuk skenario pengujian lokal saat ini, pembayaran via **VA Bank** dan **QRIS** sudah sepenuhnya berfungsi 100% dari transaksi POS hingga pencatatan di DB dan Riwayat Transaksi.
