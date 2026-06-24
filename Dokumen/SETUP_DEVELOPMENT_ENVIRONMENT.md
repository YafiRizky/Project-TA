# 🛠️ SETUP DEVELOPMENT ENVIRONMENT
**Laptop Baru - Fresh Install Guide**  
**Date**: 5 Februari 2026

---

## 📋 CHECKLIST: Software yang Harus Diinstall

### ✅ WAJIB (Must Have)
- [ ] Python 3.10 atau 3.11
- [ ] Node.js 18 LTS atau 20 LTS
- [ ] PostgreSQL 14 atau 15
- [ ] Git
- [ ] VS Code (Code Editor)

### ✅ OPTIONAL (Recommended)
- [ ] Postman (test API)
- [ ] TablePlus / pgAdmin (database GUI)
- [ ] GitHub Desktop (jika tidak suka Git command line)

---

## 🔧 INSTALASI STEP-BY-STEP

### **1. PYTHON (Backend - Django)**

#### Download & Install:
```
🌐 Link: https://www.python.org/downloads/
📦 Version: Python 3.11.x (latest stable)
⚙️ Installer: python-3.11.x-amd64.exe

PENTING saat install:
✅ CENTANG "Add Python to PATH"
✅ CENTANG "Install pip"
```

#### Verifikasi Install:
```powershell
# Buka PowerShell, ketik:
python --version
# Output seharusnya: Python 3.11.x

pip --version
# Output seharusnya: pip 23.x.x
```

#### Install Django & Dependencies:
```powershell
# Install Django
pip install django

# Install Django REST Framework (untuk API)
pip install djangorestframework

# Install PostgreSQL adapter
pip install psycopg2

# Install CORS headers (untuk koneksi frontend-backend)
pip install django-cors-headers

# Install Python Dotenv (untuk environment variables)
pip install python-dotenv

# NANTI di Fase 2 (ML):
# pip install pandas numpy scikit-learn prophet matplotlib
```

#### Verifikasi Django:
```powershell
django-admin --version
# Output: 5.0.x (atau latest version)
```

---

### **2. NODE.JS (Frontend - React)**

#### Download & Install:
```
🌐 Link: https://nodejs.org/
📦 Version: 20.x LTS (Long Term Support)
⚙️ Installer: node-v20.x.x-x64.msi

Install otomatis include NPM (Node Package Manager)
```

#### Verifikasi Install:
```powershell
node --version
# Output: v20.x.x

npm --version
# Output: 10.x.x
```

#### Install React & Tools:
```powershell
# Install Create React App (global)
npm install -g create-react-app

# Install Vite (alternatif, lebih cepat dari CRA)
npm install -g vite

# Verifikasi:
npm list -g
# Seharusnya muncul create-react-app & vite
```

---

### **3. POSTGRESQL (Database)**

#### Download & Install:
```
🌐 Link: https://www.postgresql.org/download/windows/
📦 Version: PostgreSQL 15.x
⚙️ Installer: postgresql-15.x-windows-x64.exe

Saat install:
✅ Set password untuk user "postgres" (INGAT PASSWORD INI!)
✅ Port: 5432 (default)
✅ Locale: Default
✅ Install Stack Builder: NO (skip)
```

#### Verifikasi Install:
```powershell
# Buka PowerShell, ketik:
psql --version
# Output: psql (PostgreSQL) 15.x
```

#### Create Database untuk Project:
```powershell
# Login ke PostgreSQL
psql -U postgres

# Di dalam psql (prompt berubah jadi postgres=#):
CREATE DATABASE pos_ml_db;

# Buat user untuk project (optional, bisa pakai user postgres):
CREATE USER pos_admin WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE pos_ml_db TO pos_admin;

# Keluar:
\q
```

---

### **4. GIT (Version Control)**

#### Download & Install:
```
🌐 Link: https://git-scm.com/download/win
📦 Version: Latest (2.44.x)
⚙️ Installer: Git-2.44.x-64-bit.exe

Saat install:
✅ Default editor: VS Code (pilih dari dropdown)
✅ PATH environment: Git from command line (recommended)
✅ Line ending: Checkout Windows-style, commit Unix-style
✅ Terminal: Use Windows default console
✅ Sisanya: Default semua
```

#### Setup Git Config:
```powershell
# Set username & email (untuk commit history)
git config --global user.name "Nama Anda"
git config --global user.email "email@example.com"

# Verifikasi:
git config --list
```

---

### **5. VS CODE (Code Editor)**

#### Download & Install:
```
🌐 Link: https://code.visualstudio.com/
📦 Version: Latest
⚙️ Installer: VSCodeUserSetup-x64-x.x.x.exe

Saat install:
✅ Add "Open with Code" to context menu
✅ Register Code as editor for supported file types
✅ Add to PATH
```

#### Install Extensions (Wajib):
Buka VS Code, tekan `Ctrl+Shift+X`, search & install:

**Python Development:**
- ✅ Python (Microsoft)
- ✅ Pylance (Microsoft)
- ✅ Django (Baptiste Darthenay)

**JavaScript/React:**
- ✅ ES7+ React/Redux/React-Native snippets
- ✅ Prettier - Code formatter
- ✅ ESLint

**Database:**
- ✅ PostgreSQL (Chris Kolkman)

**General:**
- ✅ GitLens (Eric Amodio)
- ✅ Auto Rename Tag
- ✅ Path Intellisense
- ✅ Bracket Pair Colorizer 2

---

### **6. POSTMAN (Optional - Test API)**

#### Download & Install:
```
🌐 Link: https://www.postman.com/downloads/
📦 Version: Latest
⚙️ Installer: Postman-win64-Setup.exe

Guna: Test API endpoint Django (GET, POST, PUT, DELETE)
Alternative: Thunder Client (VS Code extension, lebih ringan)
```

---

### **7. DATABASE GUI (Optional - Recommended)**

#### Opsi A: TablePlus (Recommended - Simple & Beautiful)
```
🌐 Link: https://tableplus.com/windows
📦 Version: Latest
💰 Price: Free (for 2 connections)

Guna: Visual interface untuk lihat & edit database
```

#### Opsi B: pgAdmin 4 (Free - Auto-install dengan PostgreSQL)
```
Sudah terinstall otomatis saat install PostgreSQL
Akses via: Start Menu → pgAdmin 4
```

---

## 🚀 QUICK START PROJECT

### **1. Setup Backend (Django)**

```powershell
# Buat folder project
cd C:\laragon\www\TA
mkdir pos-backend
cd pos-backend

# Create virtual environment (isolate dependencies)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate
# (Prompt berubah jadi (venv) PS C:\...>)

# Install Django & dependencies
pip install django djangorestframework psycopg2 django-cors-headers python-dotenv

# Create Django project
django-admin startproject pos_backend .
# (Titik di akhir = create di current folder)

# Create Django app
python manage.py startapp products
python manage.py startapp transactions
python manage.py startapp inventory

# Run development server (test)
python manage.py runserver
# Akses: http://localhost:8000
# Seharusnya muncul Django welcome page ✅
```

---

### **2. Setup Frontend (React)**

```powershell
# Buka terminal baru (jangan tutup Django server)
cd C:\laragon\www\TA
mkdir pos-frontend
cd pos-frontend

# Create React app dengan Vite (lebih cepat)
npm create vite@latest . -- --template react

# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install additional libraries
npm install axios react-router-dom chart.js react-chartjs-2

# Run development server (test)
npm run dev
# Akses: http://localhost:5173
# Seharusnya muncul Vite + React logo ✅
```

---

### **3. Connect Django to PostgreSQL**

Edit file `pos_backend/settings.py`:

```python
# Ganti DATABASES dari sqlite3 ke PostgreSQL:
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pos_ml_db',
        'USER': 'postgres',  # atau 'pos_admin' jika sudah buat user
        'PASSWORD': 'password_anda',  # password yang Anda set saat install PostgreSQL
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Test connection:
```powershell
# Di folder pos-backend dengan venv active:
python manage.py migrate
# Seharusnya success, database tables created ✅
```

---

## 🎯 FOLDER STRUCTURE FINAL

```
C:\laragon\www\TA\
├── pos-backend\                 (Django)
│   ├── venv\                    (virtual environment)
│   ├── pos_backend\             (Django project settings)
│   ├── products\                (Django app)
│   ├── transactions\            (Django app)
│   ├── inventory\               (Django app)
│   ├── manage.py
│   └── requirements.txt         (list dependencies)
│
├── pos-frontend\                (React)
│   ├── node_modules\            (dependencies)
│   ├── src\
│   │   ├── components\
│   │   ├── pages\
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── CHECKPOINT_SESSION_2.md      (dokumentasi)
├── PROJECT_SUMMARY.md
└── SESSION_2_DETAILED_SPEC.md
```

---

## ✅ VERIFIKASI SEMUA INSTALL

### Checklist Final:
```powershell
# Python
python --version
# ✅ Python 3.11.x

# Django
django-admin --version
# ✅ 5.0.x

# Node.js
node --version
# ✅ v20.x.x

# NPM
npm --version
# ✅ 10.x.x

# PostgreSQL
psql --version
# ✅ psql (PostgreSQL) 15.x

# Git
git --version
# ✅ git version 2.44.x
```

### Test Run:
```powershell
# Terminal 1: Django Backend
cd C:\laragon\www\TA\pos-backend
.\venv\Scripts\activate
python manage.py runserver
# ✅ http://localhost:8000

# Terminal 2: React Frontend
cd C:\laragon\www\TA\pos-frontend
npm run dev
# ✅ http://localhost:5173

# Kedua server running? READY TO CODE! 🚀
```

---

## 🆘 TROUBLESHOOTING

### Problem: "python not recognized"
**Solution**: 
- Reinstall Python, pastikan centang "Add Python to PATH"
- Atau manual add PATH: System Properties → Environment Variables → Path → Add `C:\Python311\` dan `C:\Python311\Scripts\`

### Problem: "psql not recognized"
**Solution**:
- Add PostgreSQL ke PATH: `C:\Program Files\PostgreSQL\15\bin`

### Problem: Django error "No module named 'psycopg2'"
**Solution**:
```powershell
pip install psycopg2-binary
# Atau:
pip install psycopg2
```

### Problem: React error saat npm install
**Solution**:
```powershell
# Clear cache:
npm cache clean --force
# Hapus folder node_modules & package-lock.json
rm -r node_modules
rm package-lock.json
# Install ulang:
npm install
```

### Problem: Port 8000 atau 5173 sudah dipakai
**Solution**:
```powershell
# Django: Run di port lain
python manage.py runserver 8001

# React: Edit vite.config.js, tambahkan:
export default {
  server: {
    port: 5174
  }
}
```

---

## 📚 LEARNING RESOURCES

### Django:
- 📖 Official Tutorial: https://docs.djangoproject.com/en/5.0/intro/tutorial01/
- 🎥 YouTube: Corey Schafer Django Series

### React:
- 📖 Official Tutorial: https://react.dev/learn
- 🎥 YouTube: Net Ninja React Tutorial

### PostgreSQL:
- 📖 Official Docs: https://www.postgresql.org/docs/
- 🎥 YouTube: PostgreSQL Tutorial for Beginners

---

## 🎯 NEXT STEP SETELAH INSTALL

1. ✅ **Belajar Django Basics** (2-3 hari):
   - Models, Views, URLs
   - Django Admin
   - Django REST Framework

2. ✅ **Belajar React Basics** (2-3 hari):
   - Components, Props, State
   - React Hooks (useState, useEffect)
   - React Router

3. ✅ **Practice Mini Project** (1 minggu):
   - Bikin TO-DO list app (Django + React)
   - CRUD operations
   - Connect frontend-backend via API

4. 🚀 **Start Real Project** (Week 4):
   - Implement authentication
   - Create Product model
   - Build Product CRUD API
   - Build Product management UI

---

**STATUS**: ✅ Development Environment Ready  
**NEXT**: Start coding sprint 1 (Authentication & Product Management)

**Good Luck! 💪🚀**
