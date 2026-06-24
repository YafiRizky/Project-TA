# 🚀 FLAG: SESSION 4 RESTART - FRESH PROJECT STRUCTURE
**Date**: 26 Februari 2026  
**Session**: 4/24 (RESTART setelah Clean Slate)  
**Goal**: Create fresh project structure (Django + React) dengan venv yang proper  
**Status**: 🟡 READY TO START

---

## 📋 CONTEXT

### Why Restart dari Session 4?
**Timeline:**
- **4-10 Feb**: Session 1-3 (Planning & Environment) ✅
- **10-25 Feb**: Session 4-7 (Project structure, Database, Models) ✅
- **25 Feb**: Blueprint review dengan dosen pembimbing ✅
- **26 Feb**: Clean slate - Delete all working folders ✅
- **26 Feb NOW**: Restart Session 4 dengan blueprint baru

**Alasan Fresh Start:**
1. Virtual environment rusak (missing activation scripts)
2. Blueprint baru lebih jelas dari review kemarin
3. Better foundation dengan proper venv setup
4. COMMANDS_QUICK_START.txt sudah dibuat untuk ease of use

**What's Preserved:**
- ✅ All documentation (7 FLAG files di Dokumen/)
- ✅ HTML dummy reference (pos-ml-system_dummy/)
- ✅ Blueprint review (clear scope & features)
- ✅ Session 7 models backup (11 models reference untuk nanti)

**What's Clean:**
- ❌ No venv (will create fresh)
- ❌ No Django project (will create fresh)
- ❌ No React project (will create fresh)
- ❌ No database (will create fresh)

---

## 🎯 SESSION 4 GOALS (RESTART)

### Primary Deliverables:
1. ✅ Create proper virtual environment (.venv)
2. ✅ Create Django project (pos_backend) dengan 7 apps
3. ✅ Create React project (pos-frontend) dengan Vite + Tailwind
4. ✅ Test both servers running simultaneously
5. ✅ Verify venv activation works perfectly

### Success Criteria:
- [ ] Virtual environment created & activatable (tested dengan Activate.ps1)
- [ ] Django runserver works (http://127.0.0.1:8000)
- [ ] React dev server works (http://localhost:5173)
- [ ] Both servers run bersamaan tanpa conflict
- [ ] COMMANDS_QUICK_START.txt verified accurate

---

## 📐 BLUEPRINT REFERENCE (dari Review 25 Feb)

### User Roles (2 Tipe - SIMPLE):
1. **Admin/Owner** - Full access, manage semua
2. **Kasir** - Limited access, POS operations only

### Registration Flow:
1. Public registration → Owner/Admin only (Kasir dibuat oleh Owner)
2. Email verification (6-digit code)
3. Setup usaha (onboarding)
4. Welcome tour
5. Redirect to dashboard

### Feature Priority:
**TIER 1 - CORE (Must Have):**
- Dashboard, Products, Inventory, Sales Report, ML Predictions

**TIER 2 - IMPORTANT:**
- Suppliers, Users, Transaction History

**TIER 3 - NICE TO HAVE (Skip untuk MVP):**
- Multi-branch, Advanced reports, Settings, Real-time notifications

### Kasir Features (4 Menu):
1. Transaksi (POS)
2. Cek Stok (read-only)
3. Riwayat Transaksi (own transactions only)
4. Profil

### Admin Features (8 Menu):
1. Dashboard
2. ML Predictions (FITUR BINTANG)
3. Products Management
4. Inventory Management
5. Sales Report
6. Suppliers (simplified PO)
7. User Management
8. Settings (minimal)

### ML Focus (dari Dosen - 25 Feb):
**A. Manajemen Stok:**
- Stockout prediction (kapan habis)
- Restock recommendations (berapa order)
- Expiry risk prediction
- Product classification (fast/slow-moving)

**B. Keuangan:**
- Revenue forecasting
- Profit forecasting
- Cost optimization
- Margin analysis

---

## 🛠️ SESSION 4 DETAILED STEPS

### PART 1: Create Virtual Environment (15 min)

**Commands:**
```powershell
cd C:\laragon\www\TA
python -m venv .venv
```

**Verify:**
```powershell
# Check folder exists
Test-Path .\.venv

# Check Activate.ps1 exists
Test-Path .\.venv\Scripts\Activate.ps1

# Test activation
.\.venv\Scripts\Activate.ps1
# Should show: (.venv) PS C:\laragon\www\TA>
```

**Success Criteria:**
- [ ] .venv folder created
- [ ] Activate.ps1 exists & executable
- [ ] Activation works (prompt shows (.venv))
- [ ] Python version matches (python --version)

---

### PART 2: Create Django Project (30 min)

**Step 1: Install Django**
```powershell
# Venv MUST be active
pip install django psycopg2 pillow
```

**Step 2: Create Project**
```powershell
django-admin startproject pos_backend
cd pos_backend
```

**Step 3: Create Apps (7 apps)**
```powershell
python manage.py startapp users
python manage.py startapp products
python manage.py startapp inventory
python manage.py startapp transactions
python manage.py startapp branches
python manage.py startapp suppliers
python manage.py startapp reports
```

**Step 4: Verify Structure**
```
pos_backend/
├── manage.py
├── pos_backend/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── users/
├── products/
├── inventory/
├── transactions/
├── branches/
├── suppliers/
└── reports/
```

**Step 5: Test Django Server**
```powershell
python manage.py runserver
# Open: http://127.0.0.1:8000
# Should see Django welcome page
```

**Success Criteria:**
- [ ] Django installed (check: python -m django --version)
- [ ] Project structure created (7 apps)
- [ ] Server runs without errors
- [ ] Django welcome page accessible
- [ ] Can stop server with Ctrl+C

---

### PART 3: Create React Project (30 min)

**Step 1: Create Project dengan Vite**
```powershell
# Di terminal baru (TIDAK perlu venv untuk React/npm)
cd C:\laragon\www\TA
npm create vite@latest pos-frontend -- --template react
```

**Step 2: Install Dependencies**
```powershell
cd pos-frontend
npm install
```

**Step 3: Install Tailwind CSS**
```powershell
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 4: Configure Tailwind**
Edit `tailwind.config.js`:
```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Edit `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 5: Test React Server**
```powershell
npm run dev
# Open: http://localhost:5173
# Should see Vite + React welcome page
```

**Success Criteria:**
- [ ] React project created
- [ ] Dependencies installed (node_modules/)
- [ ] Tailwind configured
- [ ] Dev server runs without errors
- [ ] React welcome page accessible
- [ ] Can stop server with Ctrl+C

---

### PART 4: Test Both Servers Together (10 min)

**Terminal 1 (Django):**
```powershell
cd C:\laragon\www\TA
.\.venv\Scripts\Activate.ps1
cd pos_backend
python manage.py runserver
# Running on http://127.0.0.1:8000
```

**Terminal 2 (React):**
```powershell
cd C:\laragon\www\TA\pos-frontend
npm run dev
# Running on http://localhost:5173
```

**Verify:**
- [ ] Django di 8000 accessible
- [ ] React di 5173 accessible
- [ ] Both run bersamaan tanpa crash
- [ ] No port conflicts

---

### PART 5: Verify COMMANDS_QUICK_START.txt (5 min)

**Test commands dari file:**
```powershell
# Test aktivasi venv
cd C:\laragon\www\TA
.\.venv\Scripts\Activate.ps1
# Should work ✅

# Test Django server
cd pos_backend
python manage.py runserver
# Should work ✅

# Test React server (terminal baru)
cd C:\laragon\www\TA\pos-frontend
npm run dev
# Should work ✅
```

**Update file jika ada yang tidak akurat**

---

## 📊 PROGRESS TRACKING

### Checklist Session 4:
- [ ] PART 1: Virtual environment created & tested
- [ ] PART 2: Django project structure created
- [ ] PART 3: React project structure created
- [ ] PART 4: Both servers tested bersamaan
- [ ] PART 5: COMMANDS_QUICK_START.txt verified

### Expected Issues & Solutions:

**Issue 1: Venv activation error (Execution Policy)**
```powershell
# Solution:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Issue 2: Django "No module named django"**
```powershell
# Solution: Venv belum aktif
.\.venv\Scripts\Activate.ps1
# Verify: prompt harus ada (.venv)
```

**Issue 3: Port 8000 already in use**
```powershell
# Solution: Kill existing process
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Issue 4: npm not found**
```powershell
# Solution: Restart terminal setelah install Node.js
# Or: Tambahkan Node.js ke PATH
```

---

## 🎓 NEXT STEPS AFTER SESSION 4

**Setelah Session 4 selesai:**

### Session 5: Database Configuration (30 min)
- Create database pos_ml_db
- Configure Django settings.py untuk PostgreSQL
- Test connection
- Run initial migrations

### Session 6-7: Database Models (2-3 hours)
- Recreate 11 models (reference: FLAG_CHECKPOINT_SESSION_7)
- Models: User, Branch, Category, Supplier, Product, Stock, StockMovement, Sale, SaleItem, PurchaseOrder, PurchaseOrderItem
- Register in admin
- Test CRUD operations

### Session 8: REST API Part 1 (NEW - belum pernah)
- Install Django REST Framework
- Create serializers
- Create viewsets
- Test API endpoints dengan Postman

**Timeline Catch-up:**
- Session 4: 1-2 jam
- Session 5: 30 menit
- Session 6-7: 2-3 jam
- **Total: 4-6 jam untuk kembali ke posisi siap REST API development**

---

## 📝 NOTES & REMINDERS

### Important:
- ✅ ALWAYS activate venv sebelum run Django commands
- ✅ Django (8000) dan React (5173) harus run bersamaan untuk full stack testing
- ✅ Laragon PostgreSQL harus running sebelum Session 5
- ✅ Reference COMMANDS_QUICK_START.txt untuk daily workflow

### Files to Create After Session 4:
- [ ] requirements.txt (pip freeze > requirements.txt)
- [ ] .gitignore (untuk .venv/, node_modules/, db.sqlite3, __pycache__/)
- [ ] README update (mention fresh start 26 Feb)

### Documentation:
- Update PROJECT_SUMMARY.md after Session 4 complete
- Update ROADMAP_DEVELOPMENT_SESSIONS.md untuk reflect restart
- Create FLAG_CHECKPOINT_SESSION_4_COMPLETE.md kalau selesai

---

**Status**: ✅ SESSION 4 COMPLETE! (27 Feb 2026)
**Completed**: 27 Februari 2026 - 01:30 WIB  
**Duration**: ~90 minutes  
**Next**: Session 5 (Database Configuration)

---

## ✅ COMPLETION SUMMARY

### What Was Completed:
1. ✅ **Virtual environment created** (.venv with Python 3.14.2)
2. ✅ **Django project created** (pos_backend with 7 apps)
3. ✅ **React project created** (pos-frontend with Vite 7.3.1 + Tailwind)
4. ✅ **Both servers tested** (Django 8000, React 5173 - both HTTP 200)
5. ✅ **requirements.txt created** (6 packages: Django 6.0.2, psycopg2, Pillow)
