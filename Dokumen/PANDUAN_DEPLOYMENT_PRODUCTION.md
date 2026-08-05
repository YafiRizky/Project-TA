# Panduan Deployment Production Metracrura POS

Panduan ini berisi instruksi langkah-demi-langkah untuk melakukan **deployment online** aplikasi **Metracrura POS** (Frontend React Vite di Vercel/Netlify, Backend Django REST + PostgreSQL di Railway/Render/VPS, dan Webhook Xendit).

---

## 🏗️ Arsitektur Server Production

```
+--------------------------+              +--------------------------+
|  Frontend (React Vite)   |   HTTP/API   |  Backend (Django REST)   |
|  Hosting: Vercel/Netlify |  ----------> |  Hosting: Railway / VPS  |
|  URL: pos.metracrura.com |              |  URL: api.metracrura.com |
+--------------------------+              +--------------------------+
                                                       |
                                            +----------+----------+
                                            |  PostgreSQL Database |
                                            |  Railway / Neon DB   |
                                            +---------------------+
```

---

## 🚀 Opsi 1: Deployment Tercepat (Railway + Vercel) — [DIREKOMENDASIKAN]

### A. Deploy Backend & Database ke Railway (Railway.app)

1. **Buat Akun di Railway.app** dan hubungkan ke GitHub Repository kamu (`YafiRizky/Project-TA`).
2. **Tambahkan PostgreSQL Database Service**:
   - Klik **New Project** → Select **Provision PostgreSQL**.
   - Copy `DATABASE_URL` atau variabel koneksi (`PGHOST`, `PGUSER`, `PGPASSWORD`, `PGPORT`, `PGDATABASE`).
3. **Deploy Backend Service**:
   - Klik **New Service** → Pilih **GitHub Repo** → Pilih repositori `Project-TA`.
   - Atur **Root Directory** ke: `pos-backend`
   - Railway akan otomatis membaca `Procfile` (`web: gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT`).
4. **Atur Environment Variables di Railway Backend Service**:
   ```env
   DJANGO_SECRET_KEY=ganti_dengan_secret_key_random_panjang_production
   DJANGO_DEBUG=False
   DJANGO_ALLOWED_HOSTS=*
   DB_NAME=${PGDATABASE}
   DB_USER=${PGUSER}
   DB_PASSWORD=${PGPASSWORD}
   DB_HOST=${PGHOST}
   DB_PORT=${PGPORT}
   FRONTEND_URL=https://metracrura-pos.vercel.app
   XENDIT_SECRET_KEY=xnd_production_xxx
   XENDIT_WEBHOOK_TOKEN=xnd_webhook_token_xxx
   ```
5. **Jalankan Migration & Superuser Pertama**:
   - Buka tab **Railway CLI / Terminal**:
     ```bash
     python manage.py migrate
     python manage.py collectstatic --noinput
     python manage.py shell -c "from accounts.models import TechnicalAdmin; TechnicalAdmin.objects.create_superuser('admin_tech', 'AdminTechPass123!')"
     ```
   - backend Railway kamu kini aktif misal di: `https://metracrura-backend.up.railway.app`

---

### B. Deploy Frontend React Vite ke Vercel (Vercel.com)

1. **Buat Akun di Vercel.com** dan Add New Project dari GitHub `YafiRizky/Project-TA`.
2. **Atur Framework Preset**: `Vite`
3. **Atur Root Directory**: `pos-frontend`
4. **Atur Build & Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Atur Environment Variable**:
   ```env
   VITE_API_URL=https://metracrura-backend.up.railway.app/api
   ```
6. **Klik Deploy**. Vercel akan otomatis membaca file [vercel.json](file:///c:/laragon/www/TA/pos-frontend/vercel.json) untuk penanganan routing React Single Page App (SPA).

---

## ⚡ Opsi 2: Deployment Self-Hosted (VPS Ubuntu 22.04 + Nginx + Gunicorn)

Jika memilih VPS (DigitalOcean / Linode / Biznet / Biznet Gio / Niagahoster):

### 1. Install Prerequisites di VPS
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv postgresql postgresql-contrib nginx git -y
```

### 2. Setup Database PostgreSQL
```sql
sudo -u postgres psql
CREATE DATABASE pos_ml;
CREATE USER pos_user WITH PASSWORD 'PasswordRahasiamu123!';
GRANT ALL PRIVILEGES ON DATABASE pos_ml TO pos_user;
\q
```

### 3. Clone Repository & Virtual Environment
```bash
cd /var/www
git clone https://github.com/YafiRizky/Project-TA.git
cd Project-TA/pos-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 4. Setup Environment & Migration
Buat file `.env` di `/var/www/Project-TA/pos-backend/.env`:
```env
DJANGO_SECRET_KEY=production_secret_key_3948572
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.metracrura.com,localhost,127.0.0.1
DB_NAME=pos_ml
DB_USER=pos_user
DB_PASSWORD=PasswordRahasiamu123!
DB_HOST=localhost
DB_PORT=5432
```

Jalankan perintah:
```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

### 5. Setup Gunicorn Systemd Service
Buat file `/etc/systemd/system/gunicorn.service`:
```ini
[Unit]
Description=gunicorn daemon for Metracrura POS Backend
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/var/www/Project-TA/pos-backend
ExecStart=/var/www/Project-TA/pos-backend/.venv/bin/gunicorn --workers 3 --bind unix:/var/www/Project-TA/pos-backend/gunicorn.sock backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

Jalankan service:
```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

### 6. Setup Nginx Reverse Proxy
Buat file `/etc/nginx/sites-available/metracrura-backend`:
```nginx
server {
    server_name api.metracrura.com;

    location /static/ {
        alias /var/www/Project-TA/pos-backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/Project-TA/pos-backend/media/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/Project-TA/pos-backend/gunicorn.sock;
    }
}
```

Aktifkan Nginx site & SSL Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/metracrura-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d api.metracrura.com
```

---

## 💳 3. Konfigurasi Webhook Xendit Production

1. Login ke Dashboard Xendit (`dashboard.xendit.co`).
2. Buka menu **Settings** → **Callbacks**.
3. Masukkan Callback URL:
   `https://api.metracrura.com/api/payments/xendit/callback/` (atau URL Railway).
4. Centang event:
   - Invoice Paid / Expired
   - Virtual Account Payment Paid
   - QRIS Payment Paid
   - E-Wallet Payment Status
5. Copy **Verification Token** dan paste ke variabel `XENDIT_WEBHOOK_TOKEN` di backend.

---

## ✅ Checklist Verifikasi Setelah Deploy Online:
- [ ] Buka URL Frontend (Vercel) -> Pastikan halaman Login & Register tampil cepat.
- [ ] Test Login Admin & Kasir -> Token JWT ter-issue tanpa error CORS.
- [ ] Test Transaksi POS & Cetak Struk -> Stok batch berkurang presisi.
- [ ] Test Modul ML (5 Modul) -> Grafik Ridge Regression & Pareto ABC tampil riil.
- [ ] Test Payment Simulator / Live Payment Xendit -> Status transaksi ter-update otomatis.
