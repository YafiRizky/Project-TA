# CURRENT STATUS: MERCATURA POS PROJECT
Tanggal Update: 09 Agustus 2026

## FASE AKTIF: PHASE 3 - PRODUCTION DEPLOYMENT & TESTING (COMPLETED & DOMAIN LIVE)

### Status Komponen Utama

| Komponen | Teknologi | Status | Catatan |
| :--- | :--- | :--- | :--- |
| **Domain Resmi** | Custom Domain (`.cloud`) | Active & Live | `https://www.mercaturapos.cloud` & `https://mercaturapos.cloud` |
| **SSL Sertifikat** | Let's Encrypt Certbot (HTTPS) | Active | Enkripsi SSL gembok hijau aktif 100% |
| **Server VPS** | Rumahweb Cloud VPS Ubuntu 24.04 | Active | IP Public: `202.155.16.135` |
| **Frontend Web** | React Vite + Tailwind CSS | Deployed | Served via Nginx (Static Dist) |
| **Backend REST API**| Django 6.0 + Gunicorn | Deployed | Endpoint API di `https://www.mercaturapos.cloud/api/` |
| **Database** | PostgreSQL 16 (`pos_ml`) | Deployed | 13.558 Transaksi, 4 Toko UMKM |
| **ML Engine** | Scikit-learn + Pandas | Deployed | 5 Modul ML AI aktif di server |
| **Payment Gateway**| Xendit API (QRIS/VA/eWallet) | Active & Automated | Payload `callback_url` otomatis + handler VA teruji |

---

## CATATAN FLAG TERAKHIR (09 AGUSTUS 2026)

- **Flag**: `FLAG_09_08_2026_Domain_SSL_DashboardNotifTable.md`
- **Pencapaian**: 
  - Domain kustom `mercaturapos.cloud` dan `www.mercaturapos.cloud` berhasil dihubungkan ke VPS `202.155.16.135` dan dilengkapi sertifikat SSL HTTPS gratis (Certbot Let's Encrypt).
  - Peringatan stok & kadaluarsa di Dashboard Admin & Kasir diredesain dari bentuk banner menjadi Tabel Berstruktur yang dilengkapi komponen `Pagination.jsx` standar.
  - Masalah penumpukan batch diselesaikan secara bersih: batch kadaluarsa yang stoknya 0 otomatis di-filter out dari peringatan aktif tanpa mengotori UI/UX bell notifikasi.
- **Kestabilan**: Sistem 100% siap digunakan dan dipresentasikan pada sidang Tugas Akhir.

---

## DAFTAR PEKERJAAN YANG TERSISA (BACKLOG TA)

1. **Dokumentasi & Laporan Tugas Akhir**:
   - Memasukkan tangkapan layar pengujian live dari domain `https://www.mercaturapos.cloud` ke Bab 4 Hasil dan Pembahasan.
   - Menyusun Bab 5 Kesimpulan dan Saran.

2. **Persiapan Skenario Sidang**:
   - Menyiapkan skenario pengujian live untuk presentasi di depan dosen penguji.