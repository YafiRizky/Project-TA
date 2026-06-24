# PANDUAN DEPLOYMENT - POS ML SYSTEM

**Tanggal Dibuat:** 9 Februari 2026  
**Status Project:** Fase Development (Localhost)  
**Target Deployment:** Setelah semua fitur selesai 100%

---

## RINGKASAN EKSEKUTIF

Dokumen ini berisi panduan lengkap untuk deployment POS ML System setelah fase development di localhost selesai. Sistem ini terdiri dari:
- Django Backend + REST API
- PostgreSQL Database
- React Frontend (Production Build)
- Machine Learning Model (Prophet/LSTM)

**REKOMENDASI:** Pakai VPS All-in-One untuk kesederhanaan dan efisiensi biaya.

---

## 1. PERBANDINGAN OPSI HOSTING

### Opsi A: VPS All-in-One (REKOMENDASI)

**Konsep:**
Semua komponen (Django, PostgreSQL, React Build, ML Model, Nginx) jalan di 1 server VPS.

| Aspek | Detail |
|-------|--------|
| **Kelebihan** | - Semua jadi satu, mudah manage<br>- Harga flat bulanan, tidak ada surprise cost<br>- Full control server (install apapun)<br>- Cocok untuk project kecil-menengah |
| **Kekurangan** | - Perlu skill Linux dasar (SSH, terminal)<br>- Setup awal butuh effort (1-2 hari)<br>- Maintenance server sendiri |
| **Biaya Total** | Rp 60.000 - Rp 90.000/bulan (SEMUA INCLUDE) |
| **Cocok Untuk** | Skripsi, UMKM, project small-medium scale |

**Provider VPS Rekomendasi:**

| Provider | Spesifikasi | Harga | Lokasi Server | Link |
|----------|-------------|-------|---------------|------|
| **Niagahoster VPS Murah** | 1 vCPU, 1GB RAM, 20GB SSD | Rp 60.000/bulan | Indonesia (Jakarta) | niagahoster.co.id |
| **DigitalOcean Droplet** | 1 vCPU, 1GB RAM, 25GB SSD | $6/bulan (~Rp 90K) | Singapore/AS | digitalocean.com |
| **Vultr Cloud Compute** | 1 vCPU, 1GB RAM, 25GB SSD | $6/bulan (~Rp 90K) | Singapore/AS | vultr.com |
| **AWS Lightsail** | 1 vCPU, 1GB RAM, 40GB SSD | $5/bulan (~Rp 75K) | Singapore/AS | aws.amazon.com/lightsail |

**Spesifikasi Minimum untuk Project Ini:**
- CPU: 1 vCPU (cukup untuk traffic <100 user concurrent)
- RAM: 1GB (minimum, 2GB lebih baik untuk ML model)
- Storage: 20GB SSD
- Bandwidth: 1TB/bulan (cukup untuk demo/skripsi)

---

### Opsi B: Cloud Service Terpisah (Microservices)

**Konsep:**
Komponen terpisah di layanan berbeda (Frontend di Vercel, Backend di Railway, Database di Supabase).

| Aspek | Detail |
|-------|--------|
| **Kelebihan** | - Ada free tier (gratis untuk testing)<br>- Setup lebih mudah (GUI-based)<br>- Auto-scaling (traffic naik otomatis scale)<br>- Tidak perlu maintenance server |
| **Kekurangan** | - **RIBET:** Setup 3-4 akun berbeda<br>- Biaya unpredictable (bisa membengkak jika traffic naik)<br>- Free tier terbatas (sleep mode, limit request)<br>- Kompleksitas debugging (3 tempat berbeda) |
| **Biaya Total** | Free tier: Gratis (dengan batasan)<br>Paid: $15-30/bulan (~Rp 225-450K)<br>**LEBIH MAHAL dari VPS** |
| **Cocok Untuk** | Startup yang butuh scalability, team besar |

**Perbandingan Provider:**

| Layanan | Untuk | Provider | Free Tier | Paid Tier |
|---------|-------|----------|-----------|-----------|
| Frontend | React Build | Vercel | ✅ 100GB bandwidth | $20/bulan (unlimited) |
| Backend | Django API | Railway | ✅ $5 credit/bulan | $10/bulan (512MB RAM) |
| Database | PostgreSQL | Supabase | ✅ 500MB storage | $25/bulan (8GB storage) |
| ML Model | Python Script | Fly.io | ✅ 3GB storage | $15/bulan |

**Total Biaya Paid Tier:** $70/bulan (~Rp 1.050.000/bulan) → **TIDAK REKOMENDASI**

---

## 2. ESTIMASI BIAYA DEPLOYMENT

### Skenario 1: Development & Demo Skripsi (3-6 bulan)

**Pakai VPS All-in-One:**
- Niagahoster VPS Murah: Rp 60.000/bulan x 3 bulan = **Rp 180.000**
- Domain .com (opsional): Rp 150.000/tahun
- SSL Certificate: **GRATIS** (Let's Encrypt)

**Total:** Rp 180.000 - Rp 330.000 (untuk 3 bulan)

---

### Skenario 2: Production untuk Usaha Nyata (1 tahun)

**Pakai VPS dengan Upgrade:**
- DigitalOcean Droplet 2GB RAM: $12/bulan (~Rp 180K) x 12 = **Rp 2.160.000/tahun**
- Domain .com: Rp 150.000/tahun
- SSL Certificate: **GRATIS** (Let's Encrypt)
- Backup otomatis: $1/bulan (~Rp 15K) x 12 = Rp 180.000/tahun

**Total:** Rp 2.490.000/tahun (~Rp 207.500/bulan)

---

## 3. CHECKLIST PRE-DEPLOYMENT

Pastikan semua ini sudah selesai di localhost sebelum deploy:

### A. Backend Development
- [ ] Django project sudah setup dengan 7 apps (users, products, inventory, transactions, branches, suppliers, reports)
- [ ] Database models sudah final (11 models)
- [ ] REST API endpoints sudah lengkap dan tested
- [ ] Authentication JWT sudah jalan
- [ ] CRUD operations semua fitur sudah tested
- [ ] File requirements.txt sudah dibuat (list semua package Python)

### B. Frontend Development
- [ ] React components sudah selesai (17 halaman)
- [ ] API integration dengan Axios sudah jalan
- [ ] State management (Redux) sudah implemented
- [ ] React production build berhasil (`npm run build`)
- [ ] File .env.production sudah dikonfigurasi (API URL production)

### C. Machine Learning Model
- [ ] Model demand forecasting sudah trained
- [ ] Model file (.pkl atau .h5) sudah ready
- [ ] API endpoint untuk prediction sudah jalan
- [ ] Testing prediction dengan data real sudah akurat

### D. Database
- [ ] Database schema sudah final (tidak ada perubahan lagi)
- [ ] Migration files sudah lengkap
- [ ] Dummy data untuk testing sudah ready (optional)

### E. Testing Lokal
- [ ] Semua fitur sudah tested di localhost
- [ ] Tidak ada error di console browser
- [ ] Tidak ada error di Django server log
- [ ] Performance testing sudah dilakukan (load time, response time)

### F. Dokumentasi
- [ ] README.md sudah lengkap (cara install, cara run)
- [ ] API documentation sudah dibuat (Postman collection atau Swagger)
- [ ] User manual sudah dibuat (untuk Pak Budi)

---

## 4. TUTORIAL DEPLOYMENT KE VPS (Step-by-Step)

### Fase 1: Persiapan VPS (Estimasi: 1 jam)

**Step 1.1: Beli VPS**
1. Pilih provider (contoh: Niagahoster VPS Murah Rp 60K/bulan)
2. Pilih OS: **Ubuntu 22.04 LTS** (paling stabil)
3. Catat IP Address, username (biasanya `root`), dan password yang diberikan

**Step 1.2: Login ke VPS via SSH**
```bash
# Buka PowerShell di Windows
ssh root@IP_ADDRESS_VPS_ANDA

# Contoh:
ssh root@103.20.30.40

# Masukkan password yang diberikan provider
```

**Step 1.3: Update Sistem**
```bash
apt update && apt upgrade -y
```

**Step 1.4: Install Dependencies**
```bash
# Install Python 3.11
apt install python3.11 python3.11-venv python3-pip -y

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install Nginx (Web Server)
apt install nginx -y

# Install Git
apt install git -y
```

---

### Fase 2: Setup Database (Estimasi: 30 menit)

**Step 2.1: Buat Database PostgreSQL**
```bash
# Masuk ke PostgreSQL
sudo -u postgres psql

# Jalankan command SQL ini:
CREATE DATABASE pos_ml_db;
CREATE USER pos_admin WITH PASSWORD 'password_kuat_anda';
ALTER ROLE pos_admin SET client_encoding TO 'utf8';
ALTER ROLE pos_admin SET default_transaction_isolation TO 'read committed';
ALTER ROLE pos_admin SET timezone TO 'Asia/Jakarta';
GRANT ALL PRIVILEGES ON DATABASE pos_ml_db TO pos_admin;

# Keluar dari PostgreSQL
\q
```

**Step 2.2: Test Koneksi Database**
```bash
psql -U pos_admin -d pos_ml_db -h localhost
# Masukkan password, jika berhasil login berarti OK
\q
```

---

### Fase 3: Deploy Django Backend (Estimasi: 1 jam)

**Step 3.1: Upload Code ke VPS**
```bash
# Di VPS, masuk ke folder web
cd /var/www/

# Clone repository atau upload manual via SFTP
# Opsi A: Jika pakai Git/GitHub
git clone https://github.com/username/pos-ml-system.git
cd pos-ml-system

# Opsi B: Jika upload manual via WinSCP/FileZilla
# Upload folder project Anda ke /var/www/pos-ml-system/
```

**Step 3.2: Setup Virtual Environment**
```bash
cd /var/www/pos-ml-system

# Buat virtual environment
python3 -m venv venv

# Aktifkan virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn  # Production server untuk Django
```

**Step 3.3: Konfigurasi Django untuk Production**

Edit file `settings.py`:
```python
# settings.py

DEBUG = False  # PENTING: Matikan debug mode

ALLOWED_HOSTS = ['IP_ADDRESS_VPS_ANDA', 'domain_anda.com', 'www.domain_anda.com']

# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pos_ml_db',
        'USER': 'pos_admin',
        'PASSWORD': 'password_kuat_anda',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Static Files
STATIC_URL = '/static/'
STATIC_ROOT = '/var/www/pos-ml-system/staticfiles/'

# CORS (untuk React Frontend)
CORS_ALLOWED_ORIGINS = [
    "http://IP_ADDRESS_VPS_ANDA",
    "https://domain_anda.com",
]
```

**Step 3.4: Migrate Database**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --no-input
python manage.py createsuperuser  # Buat admin user
```

**Step 3.5: Test Django dengan Gunicorn**
```bash
gunicorn --bind 0.0.0.0:8000 pos_ml_system.wsgi:application
# Jika tidak error, berarti berhasil
# Tekan Ctrl+C untuk stop
```

---

### Fase 4: Deploy React Frontend (Estimasi: 30 menit)

**Step 4.1: Build React di Localhost**
```bash
# Di komputer Anda (Windows), masuk ke folder React project
cd C:\laragon\www\TA\pos-ml-system-frontend

# Edit file .env.production
REACT_APP_API_URL=http://IP_ADDRESS_VPS_ANDA/api

# Build production
npm run build
```

**Step 4.2: Upload Build ke VPS**
```bash
# Upload folder "build" hasil npm run build ke VPS
# Gunakan WinSCP atau FileZilla
# Upload ke: /var/www/pos-ml-system/frontend-build/
```

---

### Fase 5: Konfigurasi Nginx (Estimasi: 30 menit)

**Step 5.1: Buat Konfigurasi Nginx**
```bash
# Di VPS, buat file konfigurasi
nano /etc/nginx/sites-available/pos-ml-system
```

**Isi file:**
```nginx
server {
    listen 80;
    server_name IP_ADDRESS_VPS_ANDA;

    # Frontend (React)
    location / {
        root /var/www/pos-ml-system/frontend-build;
        try_files $uri $uri/ /index.html;
    }

    # Backend (Django API)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (Django admin, CSS, JS)
    location /static/ {
        alias /var/www/pos-ml-system/staticfiles/;
    }

    # Media files (Upload gambar produk, dll)
    location /media/ {
        alias /var/www/pos-ml-system/media/;
    }
}
```

**Step 5.2: Aktifkan Konfigurasi**
```bash
# Buat symbolic link
ln -s /etc/nginx/sites-available/pos-ml-system /etc/nginx/sites-enabled/

# Test konfigurasi Nginx
nginx -t

# Jika OK, restart Nginx
systemctl restart nginx
```

---

### Fase 6: Setup Gunicorn sebagai Service (Estimasi: 20 menit)

**Step 6.1: Buat Systemd Service**
```bash
nano /etc/systemd/system/gunicorn.service
```

**Isi file:**
```ini
[Unit]
Description=Gunicorn daemon for POS ML System
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/pos-ml-system
Environment="PATH=/var/www/pos-ml-system/venv/bin"
ExecStart=/var/www/pos-ml-system/venv/bin/gunicorn \
          --workers 3 \
          --bind 127.0.0.1:8000 \
          pos_ml_system.wsgi:application

[Install]
WantedBy=multi-user.target
```

**Step 6.2: Start Service**
```bash
# Reload systemd
systemctl daemon-reload

# Start Gunicorn
systemctl start gunicorn

# Enable auto-start saat boot
systemctl enable gunicorn

# Check status
systemctl status gunicorn
```

---

### Fase 7: Setup SSL Certificate (GRATIS via Let's Encrypt) (Estimasi: 15 menit)

**Step 7.1: Install Certbot**
```bash
apt install certbot python3-certbot-nginx -y
```

**Step 7.2: Dapatkan SSL Certificate**
```bash
# Ganti domain_anda.com dengan domain Anda
certbot --nginx -d domain_anda.com -d www.domain_anda.com

# Jika berhasil, website Anda otomatis HTTPS
# Certificate akan auto-renew setiap 90 hari
```

---

## 5. KONFIGURASI PRODUCTION

### A. Environment Variables (.env)

**Backend (Django):**
```bash
# .env di /var/www/pos-ml-system/
DEBUG=False
SECRET_KEY=generate_random_string_50_karakter
DATABASE_NAME=pos_ml_db
DATABASE_USER=pos_admin
DATABASE_PASSWORD=password_kuat_anda
DATABASE_HOST=localhost
DATABASE_PORT=5432
ALLOWED_HOSTS=IP_ADDRESS_VPS,domain_anda.com
CORS_ORIGIN=https://domain_anda.com
```

**Frontend (React):**
```bash
# .env.production
REACT_APP_API_URL=https://domain_anda.com/api
REACT_APP_ENV=production
```

---

### B. Security Checklist

- [ ] DEBUG = False di Django settings
- [ ] SECRET_KEY tidak di-commit ke Git (pakai environment variable)
- [ ] Database password strong (min 16 karakter, kombinasi huruf+angka+simbol)
- [ ] Firewall UFW aktif (hanya allow port 22, 80, 443)
- [ ] SSH login pakai key (disable password login)
- [ ] SSL Certificate terinstall (HTTPS)
- [ ] CORS configured dengan benar (hanya allow domain sendiri)

**Setup Firewall:**
```bash
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
ufw status
```

---

### C. Backup Strategy

**Database Backup (Otomatis Setiap Hari):**
```bash
# Buat script backup
nano /var/www/backup-db.sh
```

**Isi script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U pos_admin pos_ml_db > /var/www/backups/db_backup_$DATE.sql
# Hapus backup lebih dari 7 hari
find /var/www/backups/ -type f -mtime +7 -name "db_backup_*.sql" -delete
```

**Setup Cron Job:**
```bash
chmod +x /var/www/backup-db.sh
crontab -e

# Tambahkan baris ini (backup setiap hari jam 2 pagi):
0 2 * * * /var/www/backup-db.sh
```

---

## 6. MONITORING & MAINTENANCE

### A. Log Files Location

| Komponen | Log Location |
|----------|--------------|
| Nginx Access | `/var/log/nginx/access.log` |
| Nginx Error | `/var/log/nginx/error.log` |
| Gunicorn | `/var/log/gunicorn/error.log` |
| PostgreSQL | `/var/log/postgresql/postgresql-14-main.log` |

**Cara Lihat Log:**
```bash
# Lihat 50 baris terakhir Nginx error log
tail -n 50 /var/log/nginx/error.log

# Monitor log secara real-time
tail -f /var/log/nginx/access.log
```

---

### B. Performance Monitoring

**Check Resource Usage:**
```bash
# Check CPU & Memory
htop

# Check Disk Usage
df -h

# Check Nginx Status
systemctl status nginx

# Check Gunicorn Status
systemctl status gunicorn

# Check PostgreSQL Status
systemctl status postgresql
```

---

## 7. TROUBLESHOOTING UMUM

### Error 1: "502 Bad Gateway" di Browser

**Penyebab:**
- Gunicorn tidak jalan
- Nginx tidak bisa connect ke Gunicorn

**Solusi:**
```bash
# Check Gunicorn status
systemctl status gunicorn

# Jika inactive, restart
systemctl restart gunicorn

# Check log error
journalctl -u gunicorn -n 50
```

---

### Error 2: "500 Internal Server Error"

**Penyebab:**
- Error di Django code
- Database connection error
- Missing environment variables

**Solusi:**
```bash
# Lihat error detail di Gunicorn log
tail -n 100 /var/log/gunicorn/error.log

# Test Django manual
cd /var/www/pos-ml-system
source venv/bin/activate
python manage.py check

# Test database connection
python manage.py migrate
```

---

### Error 3: Static Files (CSS/JS) Tidak Load

**Penyebab:**
- Belum run `collectstatic`
- Nginx konfigurasi salah

**Solusi:**
```bash
# Collect static files lagi
cd /var/www/pos-ml-system
source venv/bin/activate
python manage.py collectstatic --no-input

# Check permission folder
chmod -R 755 /var/www/pos-ml-system/staticfiles/

# Restart Nginx
systemctl restart nginx
```

---

### Error 4: "Connection Timeout" saat Akses Website

**Penyebab:**
- Firewall block port 80/443
- Nginx tidak jalan

**Solusi:**
```bash
# Check Nginx status
systemctl status nginx

# Check firewall
ufw status

# Pastikan port 80 & 443 allowed
ufw allow 80
ufw allow 443
```

---

### Error 5: Database Connection Error

**Penyebab:**
- PostgreSQL tidak jalan
- Credentials salah di settings.py
- Database belum dibuat

**Solusi:**
```bash
# Check PostgreSQL status
systemctl status postgresql

# Jika inactive, start
systemctl start postgresql

# Test login manual
psql -U pos_admin -d pos_ml_db -h localhost

# Jika error "database not exist", buat lagi
sudo -u postgres psql
CREATE DATABASE pos_ml_db;
GRANT ALL PRIVILEGES ON DATABASE pos_ml_db TO pos_admin;
\q
```

---

## 8. UPDATE PRODUCTION (Setelah Deploy)

Jika ada perubahan code dan ingin update production:

**Step 1: Backup Database Dulu**
```bash
pg_dump -U pos_admin pos_ml_db > /var/www/backups/db_backup_before_update.sql
```

**Step 2: Pull Code Terbaru**
```bash
cd /var/www/pos-ml-system
git pull origin main  # Jika pakai Git
```

**Step 3: Update Dependencies**
```bash
source venv/bin/activate
pip install -r requirements.txt
```

**Step 4: Migrate Database (jika ada perubahan model)**
```bash
python manage.py migrate
python manage.py collectstatic --no-input
```

**Step 5: Restart Services**
```bash
systemctl restart gunicorn
systemctl restart nginx
```

**Step 6: Test Website**
```bash
# Buka di browser, pastikan semua jalan OK
```

---

## 9. CHECKLIST FINAL SETELAH DEPLOYMENT

- [ ] Website bisa diakses via browser (HTTP & HTTPS)
- [ ] Login admin berhasil
- [ ] Semua halaman load dengan benar (tidak 404)
- [ ] CSS & JavaScript load (inspect browser console, tidak ada error)
- [ ] API endpoint bisa diakses (test via Postman)
- [ ] CRUD operations jalan (Create, Read, Update, Delete data)
- [ ] ML prediction API jalan (test prediksi demand)
- [ ] Upload gambar produk berhasil
- [ ] Generate report (PDF/Excel) berhasil
- [ ] Performance OK (load time < 3 detik)
- [ ] Mobile responsive (test di HP)
- [ ] SSL Certificate aktif (ikon gembok hijau di browser)

---

## 10. KONTAK SUPPORT PROVIDER

| Provider | Support | Link Bantuan |
|----------|---------|--------------|
| Niagahoster | Live Chat 24/7 | niagahoster.co.id/support |
| DigitalOcean | Community Forum, Docs | digitalocean.com/community |
| Vultr | Ticket System | my.vultr.com/support/ |

---

## KESIMPULAN

**Timeline Deployment:**
- Persiapan VPS: 1 jam
- Setup Database: 30 menit
- Deploy Backend: 1 jam
- Deploy Frontend: 30 menit
- Konfigurasi Nginx: 30 menit
- Setup Gunicorn Service: 20 menit
- Setup SSL: 15 menit
- Testing & Troubleshooting: 1 jam

**Total Estimasi:** 5-6 jam (untuk pertama kali)

**Biaya Total untuk Demo Skripsi (3 bulan):**
- VPS: Rp 180.000
- Domain (opsional): Rp 150.000
- **Total: Rp 180.000 - 330.000**

**Rekomendasi Final:**
1. Selesaikan development di localhost 100% dulu
2. Baru deploy 1-2 minggu sebelum presentasi skripsi
3. Pakai Niagahoster VPS Murah (Rp 60K/bulan) untuk cost-effective
4. Jika butuh bantuan deployment, hubungi support provider (gratis)

---

**Catatan:**
Dokumen ini akan di-update jika ada perubahan arsitektur atau requirement setelah fase development selesai.
