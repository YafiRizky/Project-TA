# ⚠️ PROJECT NOTES - IMPORTANT REMINDERS

**Tanggal:** 10 Februari 2026  
**Catatan:** Hal-hal penting yang harus diingat AI selama development

---

## 🔴 CRITICAL REMINDERS

### 1. FITUR BERSIFAT DINAMIS (BISA BERUBAH)

**Status:** Fitur masih FLEXIBLE, belum final

**Kemungkinan Perubahan:**
- ✏️ **Ditambah** - Fitur baru mungkin diminta user
- ➖ **Dikurangi** - Fitur yang terlalu kompleks mungkin disederhanakan
- 🗑️ **Dihapus** - Fitur yang tidak relevan bisa dihapus
- 🔄 **Diganti** - Fitur bisa berubah requirements

**Implikasi untuk Development:**
- Jangan hardcode terlalu banyak
- Buat modular (easy to add/remove features)
- Schema database harus fleksibel (avoid over-normalize di awal)
- API endpoints buat generic dulu, spesifik kemudian
- Frontend components buat reusable

**Action untuk AI:**
- Selalu tanya konfirmasi jika implement fitur besar
- Jika user minta perubahan, langsung adapt (jangan argue)
- Track perubahan fitur di dokumen ini

---

### 2. DESAIN UI/UX MASIH DALAM PENGERJAAN

**Status:** UI/UX Designer sedang bekerja (external atau user sendiri)

**Yang Sudah Ada:**
- ✅ HTML Prototype (pos-ml-system/) - 17 halaman dengan Tailwind CSS
- ✅ Color scheme: Blue #2563EB (primary)
- ✅ Font: Inter
- ✅ Layout: Sidebar navigation

**Yang Belum Final:**
- ⏳ Logo brand (belum ada)
- ⏳ Icon set (masih pakai emoji atau basic icons)
- ⏳ Ilustrasi/gambar marketing
- ⏳ Detail spacing, typography, component variants

**Implikasi untuk Development:**
- Frontend styling pakai Tailwind (easy to change)
- Jangan terlalu fokus ke pixel-perfect di awal
- Buat placeholder untuk logo/images
- Component library flexible (easy to restyle)

**Action untuk AI:**
- Jika user kirim design baru, update frontend sesuai design
- Jangan complaint jika desain berubah berkali-kali
- Track design changes di dokumen ini

---

### 3. ASSET MANAGEMENT (Logo, Gambar, Icons)

**Requirement:** Buat folder khusus untuk semua asset

**Folder Structure Asset:**

```
Backend (Django):
pos_backend/
├── media/                    # User uploads (product images, etc)
│   ├── products/             # Product photos
│   ├── profiles/             # User profile pictures
│   └── documents/            # Uploaded documents (PO, invoices)
├── static/                   # Static files (logo, icons, CSS, JS)
│   ├── images/
│   │   ├── logo/             # Brand logo (PNG, SVG)
│   │   ├── icons/            # Custom icons
│   │   └── illustrations/    # Marketing images
│   ├── css/                  # Custom CSS if needed
│   └── js/                   # Custom JS if needed

Frontend (React):
pos-frontend/
├── public/
│   ├── logo.png              # Favicon, main logo
│   ├── logo.svg              # SVG version
│   └── images/               # Static images (not imported in code)
├── src/
│   └── assets/
│       ├── images/           # Images imported in React components
│       │   ├── logo/         # Logo variations (light/dark mode)
│       │   ├── icons/        # Custom SVG icons
│       │   ├── illustrations/# Empty state, error pages
│       │   └── products/     # Product placeholder
│       ├── fonts/            # Custom fonts (if not using CDN)
│       └── styles/           # Global CSS/SCSS
```

**Action untuk AI:**
- Selalu create folder media/ dan static/ di Django
- Selalu create assets/ di React
- Buat placeholder images untuk semua yang butuh gambar
- Dokumentasikan struktur folder asset dengan jelas

---

## 📝 CHANGE LOG FITUR

### Session 4 - Initial Setup (10 Feb 2026)
- Initial project structure created
- 7 Django apps: users, products, inventory, transactions, branches, suppliers, reports
- React setup dengan Vite + Tailwind

### Session 5 - Database Configuration (11 Feb 2026)
- PostgreSQL database `pos_ml_db` created (8MB)
- Django configured untuk connect ke PostgreSQL
- 18 initial migrations applied - 10 Django tables created
- Django superuser created (username: admin)
- Admin panel verified working
- Database visualization tools configured (DBCode + DBeaver)

### 📅 Project Resume - 21 Feb 2026 (10 Days Gap)
**Context:** Project di-pause 11-21 Feb (10 hari) untuk menunggu UI/UX designer

**Status Check:**
- ✅ Database pos_ml_db: Intact, 10 tables
- ✅ Django backend: Ready
- ✅ React frontend: Structure ready

**IMPORTANT DECISION: UI/UX Strategy**
- **Issue:** UI/UX designer membutuhkan waktu lama untuk finalize design
- **Risk:** Development terhambat menunggu final design
- **Decision:** **LANJUT dengan default/basic design dulu**
- **Rationale:** 
  - Backend logic (models, API) independent dari UI design
  - Frontend component structure bisa dibuat dengan styling minimal
  - Styling/theming bisa diganti kapan saja tanpa ubah logic
  - Pakai Tailwind CSS = easy to restyle later
  
**Action Plan:**
- Use default Tailwind components untuk UI
- Focus pada functionality & business logic
- Design/styling adalah "skin" yang bisa diganti nanti
- Designer bisa provide mockup belakangan, kita apply ke existing components

**Next:** Resume Session 6 - Database Models (no UI dependency)

### Session 6 - Database Models Part 1 (24 Feb 2026)
**Status:** ✅ COMPLETED

**Models Created:**
- ✅ Custom User Model (extend AbstractUser) - role (admin/kasir), phone, branch FK
- ✅ Branch Model - Multi-outlet management (name, address, phone, PIC, is_active)
- ✅ Category Model - Product categorization (name unique, description)
- ✅ Supplier Model - Vendor management (name, contact, payment_terms, is_active)

**Settings Updated:**
- ✅ AUTH_USER_MODEL = 'users.User' configured
- ✅ All 7 apps registered in INSTALLED_APPS

**Admin Registered:**
- ✅ CustomUserAdmin (extends UserAdmin)
- ✅ BranchAdmin, CategoryAdmin, SupplierAdmin

**Critical Issue Resolved:**
- ❌ **InconsistentMigrationHistory** - Custom User model switched after initial migrations
- ✅ **Solution:** Database reset (DROP + CREATE pos_ml_db) with fresh migrations
- ✅ 22 migrations applied successfully on clean database
- ✅ Superuser recreated (admin/admin123)

**Database State:**
- Tables: 14 total (6 custom + 8 Django default)
- Custom tables: users_user, branches_branch, products_category, suppliers_supplier + 2 m2m
- Status: Clean, all models accessible via admin panel

**Lessons Learned:**
- ⚠️ **CRITICAL:** Custom User model MUST be defined BEFORE any migrations
- Database reset acceptable for early development (minimal data loss)
- Forward references ('app.Model') solve circular imports
- Admin registration enables fast CRUD testing

**Next:** Session 7 - Database Models Part 2 (Product, Stock, Sale, PurchaseOrder)

### Session 7 - Database Models Part 2 (25 Feb 2026)
**Status:** ✅ COMPLETED

**Models Created:**
- ✅ Product Model - name, SKU (unique), barcode, category FK, price, cost, image, is_active
- ✅ Stock Model - product FK, branch FK, quantity, min/max stock, last_restock_date (unique_together: product+branch)
- ✅ StockMovement Model - stock FK, movement_type (in/out/adjustment/transfer/return), quantity, reference (generic FK), created_by FK
- ✅ Sale Model - sale_number (unique), branch FK, cashier FK, customer_name, total_amount, payment_method, status
- ✅ SaleItem Model - sale FK, product FK, quantity, unit_price, subtotal (auto-calculated)
- ✅ PurchaseOrder Model - po_number (unique), supplier FK, branch FK, dates (order/expected/received), total_amount, status
- ✅ PurchaseOrderItem Model - PO FK, product FK, qty_ordered, qty_received, unit_cost, subtotal (auto-calculated)

**Admin Configurations:**
- ✅ Inline editing: SaleAdmin with SaleItemInline (tabular)
- ✅ Inline editing: PurchaseOrderAdmin with PurchaseOrderItemInline (tabular)
- ✅ Fieldsets: ProductAdmin (Basic, Pricing, Media, Status, Timestamps)
- ✅ Filters & Search: All admins configured dengan proper filters

**Database State:**
- Tables: 20 total (+7 new: products_product, inventory_stock, inventory_stockmovement, transactions_sale, transactions_saleitem, suppliers_purchaseorder, suppliers_purchaseorderitem)
- Migrations: 26 total applied (4 new migrations)
- Relationships: All FK constraints working (CASCADE, PROTECT, SET_NULL appropriate)
- Unique constraints: SKU, sale_number, po_number, Stock(product+branch)

**Dependencies:**
- ✅ Pillow 12.1.1 installed (required for Product ImageField)

**Lessons Learned:**
- Generic FK pattern: reference_type + reference_id untuk flexible relationships (StockMovement)
- Denormalization: Store calculated values (subtotal) via override save() for performance
- CASCADE vs PROTECT: PROTECT untuk historical data (Product → SaleItem), CASCADE untuk owned children
- Inline admin editing: Better UX untuk parent-child (Sale → Items, PO → Items)

**Next:** Session 8 - REST API Part 1 (Django REST Framework, serializers, viewsets, authentication)

---

### Future Changes (Track here)

**Format:**
```
[Date] - [Change Type: ADD/REMOVE/MODIFY/REPLACE]
Description: ...
Reason: ...
Impact: ...
```

**Contoh:**
```
[15 Feb 2026] - ADD
Description: Tambah fitur Loyalty Program (poin reward customer)
Reason: User request untuk fitur retention customer
Impact: 
  - Backend: Buat app baru 'loyalty'
  - Database: Tambah model CustomerPoints
  - API: 5 endpoints baru
  - Frontend: 2 halaman baru (Loyalty Dashboard, Redeem Points)
```

---

## 🎨 DESIGN CHANGE LOG

### Session 3 - Prototype (7-9 Feb 2026)
- Created 17 HTML prototype pages
- Primary color: Blue #2563EB
- Font: Inter from Google Fonts
- Layout: White sidebar with emoji icons

### 21 Feb 2026 - DESIGN STRATEGY UPDATE
**Decision:** Pakai default Tailwind styling untuk semua components
- **Reason:** UI/UX designer masih lama, don't block development
- **Approach:** Clean, minimal, professional default styling
- **Color scheme:** Stick to Tailwind defaults (blue-600 primary)
- **Components:** Headless UI + Tailwind utilities
- **Philosophy:** "Design is skin, logic is skeleton" - skin bisa diganti kapan saja

**Designer Handoff Plan (Future):**
- Designer provide mockups/Figma
- Developer apply styling ke existing components
- No restructure needed, just CSS/Tailwind class changes
- Components already functional, just restyling

---

### Future Design Changes (Track here)

**Format:**
```
[Date] - [Change Type: COLOR/LAYOUT/TYPOGRAPHY/COMPONENT]
Description: ...
Files affected: ...
```

---

## 🖼️ ASSET INVENTORY

### Current Assets (10 Feb 2026)

**Logo:**
- ❌ Belum ada (pakai text "POS System" dulu)

**Icons:**
- ✅ Chart.js (for charts)
- ✅ Emoji icons di sidebar (temporary)
- ❌ Belum ada icon set profesional (LineIcons, Heroicons, Lucide)

**Images:**
- ❌ Product placeholder images (belum ada)
- ❌ Empty state illustrations (belum ada)
- ❌ Error page illustrations (belum ada)

**Fonts:**
- ✅ Inter (Google Fonts CDN)

---

### Asset TODO (Track here when added)

- [ ] Logo brand (PNG + SVG) - light & dark mode variant
- [ ] Favicon (32x32, 64x64)
- [ ] Product placeholder (default image untuk produk tanpa foto)
- [ ] User avatar placeholder (default profile picture)
- [ ] Empty state illustrations (tidak ada data, tidak ada transaksi, dll)
- [ ] Error page illustrations (404, 500, no connection)
- [ ] Icon set (tentukan antara Heroicons, Lucide, atau custom)
- [ ] Loading spinner/animation
- [ ] Success/error/warning icons untuk toast notifications

---

## 🤖 AI BEHAVIOR GUIDELINES

### Saat User Minta Perubahan Fitur:

1. **JANGAN argue** - user adalah decision maker
2. **ASK clarification** - pastikan paham requirement baru
3. **ESTIMATE impact** - beritahu file mana yang affected
4. **LOG changes** - update dokumen ini dengan change log
5. **IMPLEMENT** - langsung kerjakan tanpa complain

### Saat User Kirim Design Baru:

1. **COMPARE** - bandingkan dengan design lama
2. **LIST changes** - apa saja yang beda (color, spacing, layout, dll)
3. **UPDATE code** - implement design baru
4. **LOG design changes** - update dokumen ini

### Saat User Minta Tambah Asset:

1. **CREATE placeholder** - jika asset belum ready, buat placeholder dulu
2. **UPDATE structure** - pastikan folder asset terorganisir
3. **DOCUMENT** - update asset inventory di dokumen ini

---

## � PROJECT STRUCTURE COMPARISON

### Before Session 4:
```
C:\laragon\www\TA\
├── pos-ml-system/          # HTML prototype only
└── [documentation files]
```

### After Session 4 + Reorganization (10 Feb 2026 - Latest):
```
C:\laragon\www\TA\
├── .github/
│   └── instructions/       # Instruction files for AI
├── Dokumen/                # ✅ REORGANIZED - All documentation moved here
│   ├── Errors/             # ❌ ERROR TRACKING (separate folder)
│   │   ├── README.md       # Quick guide to error folder
│   │   └── ERROR_TRACKING.md  # Database semua error (kritis & kecil)
│   ├── AI_DESIGN_PROMPTS.md
│   ├── BRIEF_FOR_UI_UX_DESIGNER.md
│   ├── BUSINESS_STORY_FEATURES.md
│   ├── BUSINESS_STORY_PAK_BUDI.md
│   ├── CHECKPOINT_SESSION_*.md
│   ├── DOKUMENTASI_FITUR_DAN_HALAMAN.md
│   ├── FLAG_CHECKPOINT_SESSION_*.md
│   ├── FLAG_COMMAND_REFERENCE.md
│   ├── IDEA_TA.txt
│   ├── LAST_CONVO_WITH_IDEA_TA.txt
│   ├── PANDUAN_DEPLOYMENT.md
│   ├── PROJECT_NOTES_IMPORTANT.md
│   ├── PROJECT_SUMMARY.md
│   ├── ROADMAP_DEVELOPMENT_SESSIONS.md
│   ├── SESSION_*_DETAILED_SPEC.md
│   └── SETUP_DEVELOPMENT_ENVIRONMENT.md
├── pos-ml-system_dummy/    # ✅ RENAMED - HTML prototype (UI reference)
│   ├── admin/ (12 pages)
│   ├── kasir/ (4 pages)
│   ├── login.html
│   └── assets/
├── pos_backend/            # ✅ NEW - Django backend (Session 4)
│   ├── users/
│   ├── products/
│   ├── inventory/
│   ├── transactions/
│   ├── branches/
│   ├── suppliers/
│   ├── reports/
│   ├── media/ folders
│   └── static/ folders
└── pos-frontend/           # ✅ NEW - React frontend (Session 4)
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   ├── services/
    │   ├── assets/
    │   └── ...
    └── 65 npm packages installed
```

**Perubahan Struktur (10 Feb 2026 - After Session 4):**
- ✅ Semua dokumentasi dipindah ke folder `Dokumen/` untuk organisasi lebih rapi
- ✅ HTML prototype direname dari `pos-ml-system/` → `pos-ml-system_dummy/` (clarify ini dummy/reference, bukan production)
- ✅ Project backend & frontend tetap di root (`pos_backend/`, `pos-frontend/`) untuk easy access development
- ✅ **NEW:** Created `Dokumen/Errors/` folder untuk tracking error terpisah dari dokumentasi biasa

---

## ❌ ERROR TRACKING SYSTEM (NEW!)

### Purpose: Folder Terpisah untuk Error Documentation

**Location:** `Dokumen/Errors/`

**Why Separate?**
1. **Easy Search** - Cepat cari solusi error yang pernah terjadi
2. **Prevent Repeat** - Jangan ulangi error yang sama
3. **Pattern Recognition** - Identify error patterns untuk prevention
4. **Clean Docs** - Dokumentasi biasa tidak penuh dengan error logs

**Main File:** `ERROR_TRACKING.md`

**Format Tracking:**
```markdown
Error #ID: [Nama Error]
- Severity: 🔴 Critical / 🟡 Medium / 🟢 Minor
- Date & Session
- Error message lengkap
- Location: File, line, function, module
- Impact: Fitur & kode affected
- Root Cause
- Solution yang berhasil
- Prevention untuk masa depan
```

**Error Categories:**
- 🔴 **Critical** (C001-C999): System crash, blocking, data loss
- 🟡 **Medium** (M001-M999): Mengganggu, ada workaround
- 🟢 **Minor** (L001-L999): Informational, easy fix

**Current Status (Session 4):**
- Total: 4 errors logged
- Critical: 0
- Medium: 3 (interactive CLI, wrong directory x2)
- Minor: 1 (folder exists)
- All: ✅ Resolved

**Integration with FLAG:**
- FLAG checkpoint: Error summary
- ERROR_TRACKING.md: Error detail lengkap
- Cross-reference between both
