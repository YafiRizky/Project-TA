#!/bin/bash
# ==============================================================================
# 🚀 AUTOMATED ALL-IN-ONE DEPLOYMENT SCRIPT FOR MERCATURA POS
# Server IP: 202.155.16.135 (Rumahweb Cloud VPS)
# ==============================================================================

set -e

echo "----------------------------------------------------------------------"
echo "🌟 MEMULAI INSTALLASI AUTOMATIS MERCATURA POS DI RUMAHWEB VPS..."
echo "----------------------------------------------------------------------"

# 1. Setup 1GB Swap Memory for 1GB RAM stability
if [ ! -f /swapfile ]; then
    sudo fallocate -l 1G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
fi

# 2. Update Packages & Dependencies (Non-interactive mode)
export DEBIAN_FRONTEND=noninteractive
sudo dpkg --configure -a --force-confdef --force-confold || true
sudo apt update && sudo apt upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib nginx git curl build-essential libpq-dev

# Clean default Nginx welcome page immediately
sudo rm -f /etc/nginx/sites-enabled/default

# 3. Setup PostgreSQL Database
sudo -u postgres psql -c "CREATE DATABASE pos_ml;" || true
sudo -u postgres psql -c "CREATE USER pos_user WITH PASSWORD 'MercaturaPos2026!';" || true
sudo -u postgres psql -c "ALTER USER pos_user WITH PASSWORD 'MercaturaPos2026!';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pos_ml TO pos_user;" || true
sudo -u postgres psql -c "ALTER USER pos_user CREATEDB;" || true
sudo -u postgres psql -d pos_ml -c "GRANT ALL ON SCHEMA public TO pos_user;" || true
sudo -u postgres psql -d pos_ml -c "ALTER SCHEMA public OWNER TO pos_user;" || true

# 3. Setup Application Directory
sudo mkdir -p /var/www/mercatura-pos
sudo chown -R $USER:$USER /var/www/mercatura-pos

cd /var/www/mercatura-pos

# Clone repository if not existing
if [ ! -d ".git" ]; then
    git clone https://github.com/YafiRizky/Project-TA.git .
else
    git pull origin main
fi

# 4. Setup Python Virtual Environment for Backend
cd /var/www/mercatura-pos/pos-backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary python-dotenv

# Create .env file for production
cat > /var/www/mercatura-pos/pos-backend/.env <<'EOF'
DJANGO_SECRET_KEY=mercatura-production-secret-key-2026-rumahweb-vps
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=*
DB_NAME=pos_ml
DB_USER=pos_user
DB_PASSWORD=MercaturaPos2026!
DB_HOST=127.0.0.1
DB_PORT=5432
EOF

# Run Migrations, Collect Static & Seed Data
python manage.py migrate
python manage.py collectstatic --noinput || true
python manage.py generate_umkm_data || true

# 5. Build Frontend React
cd /var/www/mercatura-pos/pos-frontend
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install
VITE_API_URL="http://202.155.16.135/api" npm run build

# 6. Configure Systemd Service for Django Gunicorn
sudo bash -c 'cat <<EOF > /etc/systemd/system/mercatura-backend.service
[Unit]
Description=Gunicorn Application Server for Mercatura POS
After=network.target postgresql.service

[Service]
User=root
Group=www-data
WorkingDirectory=/var/www/mercatura-pos/pos-backend
ExecStart=/var/www/mercatura-pos/pos-backend/.venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
EOF'

sudo systemctl daemon-reload
sudo systemctl enable mercatura-backend
sudo systemctl restart mercatura-backend

# 7. Configure Nginx Web Server
sudo bash -c 'cat <<EOF > /etc/nginx/sites-available/mercatura-pos
server {
    listen 80;
    server_name 202.155.16.135;

    client_max_body_size 20M;

    # Frontend React Static Files
    location / {
        root /var/www/mercatura-pos/pos-frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend Django REST API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Django Admin Panel
    location /admin/ {
        proxy_pass http://127.0.0.1:8000/admin/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Django Static & Media Files
    location /static/ {
        alias /var/www/mercatura-pos/pos-backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/mercatura-pos/pos-backend/media/;
    }
}
EOF'

sudo ln -sf /etc/nginx/sites-available/mercatura-pos /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "----------------------------------------------------------------------"
echo "🎉 INSTALLASI SELESAI 100%! MERCATURA POS SUDAH ONLINE PERMANEN!"
echo "🌐 Buka Browser di: http://202.155.16.135"
echo "----------------------------------------------------------------------"
