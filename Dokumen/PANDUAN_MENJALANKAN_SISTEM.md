# 🚀 Panduan Menjalankan Sistem Metacrura POS (Cheatsheet)

Panduan praktis untuk menjalankan aplikasi **Metacrura POS** kapan saja kamu ingin melakukan pengujian, pengujian publik, atau presentasi sidang Tugas Akhir.

---

## ⚡ 2 Perintah Utama (Jalankan di VS Code Laptop Kamu)

Buka VS Code di folder `c:\laragon\www\TA\`, lalu jalankan 2 terminal berikut:

### 1️⃣ Terminal 1 — Backend Django API
```bash
cd pos-backend
python manage.py runserver
```
*(Memastikan server backend Django berjalan di http://localhost:8000)*

### 2️⃣ Terminal 2 — Localtunnel (Pancaran Online Publik)
```bash
cd pos-backend
npx -y localtunnel --port 8000 --subdomain metacrura-api
```
*(Memancarkan backend laptop ke URL publik permanen: **`https://metacrura-api.loca.lt`**)*

---

## 🌐 Alamat Web Publik & Kredensial Pengujian

### 1. Web Frontend Publik (Dapat dibuka dari HP / Laptop mana saja)
- **URL**: `https://project-ta-amber.vercel.app` (atau domain Vercel kamu)

### 2. Kredensial Login Demo (Siap Pakai)

#### 🔐 Akun Admin / Owner (Akses Penuh + 5 Modul ML AI + Laporan)
- **Tab Login**: Admin
- **Kode Admin (Owner)**: `OWN888`
- **Username**: `admin_kelontong2`
- **Password**: `admin123`

#### 🛒 Akun Kasir (Khusus Operasional Transaksi POS)
- **Tab Login**: Kasir
- **Kode Bisnis**: `KLT888`
- **Username**: `kasir_kelontong2`
- **Password**: `kasir123`

---

## 💡 Troubleshooting (Jika Pengunjung Mengalami Gagal Login)

1. **Pastikan Terminal 1 (Django) & Terminal 2 (Localtunnel) di laptop kamu dalam posisi menyala.**
2. **Kunjungan Pertama Browser Pengunjung**:
   - Minta pengunjung membuka link `https://metacrura-api.loca.lt` sekali di browser HP/laptop mereka.
   - Masukkan IP Publik `182.8.193.48` lalu klik **Continue**.
3. Buka kembali `https://project-ta-amber.vercel.app` dan coba Login.
