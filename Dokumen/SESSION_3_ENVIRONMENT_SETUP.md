# 🚀 SESSION 3: DEVELOPMENT ENVIRONMENT SETUP
**Date**: 6 Februari 2026  
**Status**: ✅ **COMPLETE & READY TO CODE!**

---

## 📋 QUICK CHECKLIST

### ✅ **ALL INSTALLED & WORKING:**

| Component | Version | Command | Status |
|-----------|---------|---------|--------|
| Python | 3.14.2 | `python --version` | ✅ |
| pip | 26.0 | `pip --version` | ✅ |
| Node.js | v24.13.0 | `node --version` | ✅ |
| npm | 11.6.2 | `npm --version` | ✅ |
| Git | 2.52.0 | `git --version` | ✅ |
| VS Code | 1.109.0 | `code --version` | ✅ |
| GCC | 15.2.0 | `gcc --version` | ✅ |
| PostgreSQL | 17.2 | `psql --version` | ✅ |
| Django | 6.0.2 | `django-admin --version` | ✅ |
| Vite | 7.3.1 | `vite --version` | ✅ |

---

## 🗄️ DATABASE & SERVERS

| Service | Port | Status | Access |
|---------|------|--------|--------|
| PostgreSQL | 5432 | ✅ Running | Laragon |
| MySQL | 3306 | ✅ Running | Laragon (untuk Laravel) |
| Apache | 80 | ✅ Running | Laragon |
| phpMyAdmin | - | ✅ Available | http://localhost/phpmyadmin |

---

## 📦 INSTALLED PACKAGES

### **Python/Django Stack:**
```bash
pip install django djangorestframework psycopg2 django-cors-headers python-dotenv
```

✅ Installed:
- django (6.0.2)
- djangorestframework (3.16.1)
- psycopg2 (2.9.11)
- django-cors-headers (4.9.0)
- python-dotenv (1.2.1)
- asgiref (3.11.1)
- sqlparse (0.5.5)
- tzdata (2025.3)

### **Frontend Tools:**
```bash
npm install -g vite
```

✅ Installed:
- vite (7.3.1)

---

## 🔧 FIXES APPLIED

### **1. npm Execution Policy (FIXED)**

**Problem:**
```
npm : cannot be loaded because running scripts is disabled on this system
```

**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Result:** ✅ npm works globally di semua disk (C/D/E)

---

### **2. PostgreSQL PATH (FIXED)**

**Problem:**
```
psql : The term 'psql' is not recognized
```

**Solution:**
- Add to Environment Variable PATH: `C:\laragon\bin\postgresql\postgresql\bin`
- Restart terminal

**Result:** ✅ `psql --version` works globally

---

## 💡 UNDERSTANDING: LARAVEL vs DJANGO+REACT

### **User Background:**
- Sudah pernah develop dengan **Laravel + phpMyAdmin** (project magang)
- Project Laravel tetap jalan di `http://localhost/project-magang`
- Familiar dengan MVC, Eloquent, Blade

### **Key Differences:**

#### **1. Architecture**

**Laravel (Monolithic):**
```
laragon/www/project-magang/
├── app/              (Backend)
├── resources/views/  (Frontend - Blade)
├── public/
└── database/

✅ 1 folder
✅ 1 server (Apache)
✅ URL: http://localhost/project-magang
```

**Django + React (Decoupled):**
```
laragon/www/TA/
├── pos-backend/      (Django - API only)
│   ├── manage.py
│   └── pos_backend/
│
└── pos-frontend/     (React - UI only)
    ├── src/
    └── package.json

✅ 2 folder terpisah
✅ 2 dev servers
✅ Backend: http://localhost:8000
✅ Frontend: http://localhost:5173
```

---

#### **2. Workflow**

**Laravel:**
```
User → Apache → Laravel Controller → MySQL → Blade View → HTML
└─ Page reload setiap navigasi
```

**Django + React:**
```
User → React (Frontend) ←→ Django API (Backend) ←→ PostgreSQL
         │                      │
         └── JSON Request/Response ──┘
         
└─ NO page reload (SPA - Single Page Application)
```

---

#### **3. Data Flow Example**

**Scenario: User mau lihat list produk**

**Laravel:**
```php
// routes/web.php
Route::get('/products', [ProductController::class, 'index']);

// ProductController.php
public function index() {
    $products = Product::all();
    return view('products.index', compact('products'));
}

// resources/views/products/index.blade.php
@foreach($products as $product)
    <div>{{ $product->name }}</div>
@endforeach

Result: HTML complete dari server
```

**Django + React:**
```javascript
// React Component (ProductPage.jsx)
function ProductPage() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    // Fetch dari Django API
    fetch('http://localhost:8000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);
  
  return (
    <div>
      {products.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}

// Django View (views.py)
from rest_framework.views import APIView
from rest_framework.response import Response

class ProductListView(APIView):
    def get(self, request):
        products = Product.objects.all()
        data = [{'id': p.id, 'name': p.name} for p in products]
        return Response(data)  # Return JSON

Result: JSON dari server, React render UI
```

---

#### **4. Roles & Responsibilities**

| Aspect | Laravel | Django + React |
|--------|---------|----------------|
| **Backend** | PHP (Laravel) | Python (Django) |
| **Frontend** | Blade (HTML template) | React (JavaScript SPA) |
| **Database** | MySQL | PostgreSQL |
| **Rendering** | Server-side | Client-side |
| **Response** | HTML complete | JSON only |
| **Navigation** | Page reload | No reload (SPA) |
| **API** | Optional | Wajib (komunikasi frontend-backend) |

---

#### **5. Analogi Sederhana**

**React = KASIR (Frontend)**
```
Tugas:
✅ Tampilkan UI (display, form, button)
✅ Terima input user (klik, ketik)
✅ Tampilkan data yang diterima
❌ Tidak punya database
❌ Tidak punya business logic
```

**Django = GUDANG + MANAGER (Backend)**
```
Tugas:
✅ Punya database (PostgreSQL)
✅ Business logic (hitung profit, validasi)
✅ Authentication & authorization
✅ Return data (JSON)
❌ Tidak render HTML
```

**Flow:**
```
Customer → Kasir (React): "Mau lihat produk"
           ↓
Kasir → Manager (Django): "GET /api/products"
           ↓
Manager → Gudang (PostgreSQL): "SELECT * FROM products"
           ↓
Gudang → Manager: [data produk]
           ↓
Manager → Kasir: JSON response
           ↓
Kasir → Customer: Tampilkan di display (NO RELOAD!)
```

---

## 🎯 WHY THIS STACK?

### **Django + React Benefits:**

1. **Python = ML Language**
   - scikit-learn, Prophet, pandas → Easy integration
   - Tidak perlu bahasa lain untuk ML

2. **React = Modern UX**
   - SPA (no reload)
   - Smooth, fast, responsive
   - Mobile-app-like experience

3. **PostgreSQL = Analytics Ready**
   - JSON fields (flexible)
   - Better untuk ML/analytics
   - More powerful untuk data besar

4. **API-based = Scalable**
   - Frontend & Backend bisa deploy terpisah
   - Bisa ganti frontend (React → Vue → Mobile) tanpa ubah backend
   - Team bisa kerja parallel

5. **Industry Standard**
   - Netflix, Instagram, Spotify pakai stack ini
   - Modern, in-demand skill

---

## 📍 PORT MAPPING

```
┌──────────────────────────────────────────────────┐
│         TIDAK BENTROK! SEMUA BISA JALAN          │
├──────────────────────────────────────────────────┤
│ Service          │ Port  │ URL                   │
├──────────────────────────────────────────────────┤
│ Apache (Laragon) │ 80    │ http://localhost      │
│ Laravel Project  │ 80    │ http://localhost/     │
│                  │       │   project-magang      │
│ MySQL            │ 3306  │ localhost:3306        │
│ phpMyAdmin       │ -     │ http://localhost/     │
│                  │       │   phpmyadmin          │
├──────────────────────────────────────────────────┤
│ PostgreSQL       │ 5432  │ localhost:5432        │
│ Django (Backend) │ 8000  │ http://localhost:8000 │
│ React (Frontend) │ 5173  │ http://localhost:5173 │
└──────────────────────────────────────────────────┘

✅ Laravel project tetap jalan normal
✅ Django + React project bisa jalan bersamaan
```

---

## 🚀 NEXT: CREATE PROJECT

### **Step 1: Create Django Project**

```powershell
# Di C:\laragon\www\TA\
django-admin startproject pos_backend
cd pos_backend

# Create apps
python manage.py startapp products
python manage.py startapp transactions
python manage.py startapp inventory
python manage.py startapp users

# Test server
python manage.py runserver
# Akses: http://localhost:8000
```

---

### **Step 2: Create React Project**

```powershell
# Di C:\laragon\www\TA\
npm create vite@latest pos-frontend -- --template react
cd pos-frontend

# Install dependencies
npm install

# Install additional packages
npm install axios react-router-dom

# Test server
npm run dev
# Akses: http://localhost:5173
```

---

### **Step 3: Configure PostgreSQL**

```powershell
# Create database
psql -U postgres
CREATE DATABASE pos_ml_db;
\q

# Update Django settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pos_ml_db',
        'USER': 'postgres',
        'PASSWORD': '',  # Kosong di Laragon
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Test connection
python manage.py migrate
```

---

## ✅ VERIFICATION COMMANDS

Run these to verify everything works:

```powershell
# Python & Django
python --version          # 3.14.2
pip --version             # 26.0
django-admin --version    # 6.0.2

# Node & React
node --version            # v24.13.0
npm --version             # 11.6.2
vite --version            # 7.3.1

# Database
psql --version            # 17.2

# Git
git --version             # 2.52.0

# VS Code
code --version            # 1.109.0
```

---

## 🎉 STATUS: READY TO CODE!

**Environment Setup:** ✅ **100% COMPLETE**

**Ready for:**
- ✅ Django backend development
- ✅ React frontend development
- ✅ PostgreSQL database
- ✅ Git version control
- ✅ ML integration (Phase 2)

**Next Session:**
- Create project structure
- Setup database models
- Build authentication
- Start POS interface

---

**Saved**: 6 Februari 2026  
**Recall Command**: "Lihat SESSION_3_ENVIRONMENT_SETUP.md"  
**Purpose**: Quick reference untuk environment setup yang sudah selesai
