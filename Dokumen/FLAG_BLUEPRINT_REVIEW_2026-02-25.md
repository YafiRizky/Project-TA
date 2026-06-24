# 🏗️ FLAG: PROJECT BLUEPRINT REVIEW
**Date**: 25 Februari 2026  
**Context**: Review ulang blueprint project dari dasar setelah meeting dengan dosen pembimbing  
**Purpose**: Klarifikasi scope, fitur, dan workflow sistem sebelum melanjutkan development

---

## 📋 KONTEKS PERCAKAPAN

### Background
- User baru bicara dengan dosen pembimbing (25 Feb 2026)
- Arahan dosen: **ML fokus ke 2 area**:
  1. **Manajemen Stok**
  2. **Keuangan**
- User merasa overwhelmed dengan scope yang luas
- Perlu review ulang blueprint seperti "lihat blueprint sebelum bangun rumah"
- Dummy HTML sudah ada di `pos-ml-system_dummy/` sebagai referensi

### State Project Saat Ini
- **Progress**: Session 7/24 complete (29%)
- **Database**: 20 tables (11 models sudah dibuat di Django)
- **Backend**: Django 6.0.2 ready (migrations done)
- **Frontend**: React 19.0.0 + Vite (belum connect ke backend)
- **Dummy HTML**: Sudah ada sebagai design reference
- **Next Step**: Session 8 (REST API) - DITUNDA untuk klarifikasi blueprint dulu

---

## 🎯 KEPUTUSAN FUNDAMENTAL

### 1. USER ROLES (2 Tipe - SIMPLE)

**✅ CONFIRMED:**

**A. ADMIN/OWNER (Pak Budi)**
- Role: Pemilik usaha, full access
- Registrasi: Bisa registrasi sendiri (create account)
- Access: Semua fitur sistem

**B. KASIR (Bu Siti, Mas Budi, etc)**
- Role: Staff operasional, limited access
- Registrasi: **TIDAK BISA** registrasi sendiri
- Created by: Admin/Owner yang create kasir di sistem
- Access: Hanya fitur operasional kasir

**Reasoning:**
> "Kan aneh orang regis kasir tapi ga ada usaha nya"

**Design Decision:**
- Public registration page = untuk Owner/Admin only
- Kasir account = dibuat oleh owner dari dalam sistem (CRUD user)

---

## 🔐 REGISTRATION & ONBOARDING FLOW

### Flow untuk Owner/Admin (New Business Registration)

```
1. LANDING PAGE (Public)
   ↓
2. REGISTRATION FORM
   - Nama lengkap
   - Email
   - Password
   - Nomor HP
   - [Register Button]
   ↓
3. EMAIL CONFIRMATION
   - Kirim kode verifikasi ke email
   - User input kode 6 digit
   - [Verify Button]
   ↓
4. SETUP USAHA (Onboarding)
   - Nama usaha
   - Jenis usaha (dropdown: Fotocopy/Minimarket/Warung/Laundry/dll)
   - Alamat usaha
   - Logo usaha (optional)
   - [Next/Skip]
   ↓
5. PERKENALAN/WELCOME TOUR
   - "Selamat datang di sistem POS pintar!"
   - Quick intro fitur-fitur utama (slider/modal)
   - "Yuk, mulai input produk pertama kamu"
   ↓
6. REDIRECT TO DASHBOARD
   - Empty state (belum ada data)
   - CTA: "Tambah Produk Pertama" button besar
```

**Technical Notes:**
- Email verification menggunakan token/code (bukan link klik)
- Onboarding bisa di-skip (user bisa setup nanti)
- First login = show welcome tour (dismissable)

---

## 📊 FEATURE BREAKDOWN: PRIORITAS

### TIER 1 - CORE (MUST HAVE) ✅

Ini adalah **minimum viable product** untuk TA:

1. **📊 Dashboard**
   - Overview metrics (revenue, transactions, low stock)
   - Charts (sales trend, top products)
   - Quick actions

2. **📦 Produk Management**
   - CRUD produk (Create, Read, Update, Delete)
   - Auto-generate SKU & Barcode
   - Upload foto produk
   - Set harga beli & jual
   - Kategori produk

3. **🏪 Inventori**
   - Track stok real-time
   - Stock IN (terima barang dari supplier)
   - Stock OUT (otomatis dari transaksi)
   - Stock opname (koreksi stok)
   - Low stock alert

4. **💰 Laporan Penjualan**
   - Daily sales report
   - Monthly sales report
   - Revenue & Profit calculation
   - Best/worst selling products
   - Export PDF/Excel

5. **🤖 Prediksi ML (FITUR BINTANG TA)**
   - **A. Manajemen Stok:**
     - Prediksi stok akan habis (stockout prediction)
     - Rekomendasi jumlah order
     - Prediksi expiry risk (untuk produk dengan expired date)
     - Klasifikasi produk (fast/slow-moving)
   
   - **B. Keuangan:**
     - Prediksi revenue bulan depan
     - Prediksi profit
     - Cost optimization insights
     - Margin analysis per produk

### TIER 2 - IMPORTANT (Sangat berguna untuk sistem lengkap) ✅

Ini **nice to have** tapi membuat sistem lebih professional:

6. **🚚 Supplier Management**
   - Database supplier (nama, kontak, alamat)
   - CRUD supplier
   - **Simplified PO**: Tidak perlu workflow kompleks, cukup:
     - "Order from supplier X, qty Y, expected date Z"
     - Mark as "Received" → stok masuk

7. **👥 User Management**
   - Admin bisa create/edit/delete kasir
   - Assign role (admin/kasir)
   - Activity log (siapa login kapan, siapa input apa)

8. **📝 Transaction History**
   - List semua transaksi
   - Search by invoice/date/kasir
   - View detail transaksi
   - Refund/void transaction (jika perlu)

### TIER 3 - NICE TO HAVE (Dikesampingkan dulu) ⏸️

Ini bisa jadi **future work** atau demo terbatas:

9. **🏢 Multi-Branch** 
   - Stock per cabang
   - Transfer antar cabang
   - Consolidated reporting
   - **Status**: Skip untuk MVP, fokus single outlet dulu

10. **📋 Laporan Inventori Advanced**
    - Stock movement detail
    - Aging analysis
    - Dead stock report
    - **Status**: Merge ke laporan basic aja dulu

11. **⚙️ Pengaturan System**
    - Printer settings
    - Tax configuration
    - Receipt template
    - **Status**: Hardcode dulu, setting nanti

12. **🔔 Notifikasi Real-time**
    - Bell icon with badge
    - Push notification
    - **Status**: Pakai modal alert dulu, tidak perlu real-time

---

## 🎨 KASIR FEATURES (SIMPLE - 4 Menu)

Kasir hanya akses fitur operasional harian:

### 1. 💳 Transaksi (POS Interface)
**File**: `kasir/transaksi.html`

**Features:**
- Scan barcode atau search produk manual
- Add to cart (multiple items)
- Quantity adjustment
- Apply discount (jika ada)
- Payment method selection (Cash/Card/E-wallet/QRIS)
- Calculate change (kembalian)
- Print receipt
- Save transaction

**Simpel, fokus ke speed & ease of use**

### 2. 📦 Cek Stok
**File**: `kasir/cek-stok.html`

**Features:**
- Search produk by nama/SKU/barcode
- Lihat stok tersedia
- Biar kasir bisa jawab customer: "Masih ada kak, stok 20 pcs"

**Read-only, kasir tidak bisa edit stok**

### 3. 📜 Riwayat Transaksi
**File**: `kasir/riwayat.html`

**Features:**
- Lihat transaksi yang kasir ini lakukan (hari ini/minggu ini)
- Search by invoice number
- View detail transaksi (kalau customer komplain/return)
- Print ulang struk (jika hilang)

**Kasir hanya lihat transaksi dia sendiri, tidak bisa lihat transaksi kasir lain**

### 4. 👤 Profil
**File**: `kasir/profil.html`

**Features:**
- Lihat & edit info personal (nama, email, no HP)
- Ganti password
- Upload foto profil
- Logout

**Simple profile page**

---

## 🔧 ADMIN FEATURES (COMPLEX - 8 Menu Utama)

### 1. 📊 Dashboard (Home)
**File**: `admin/dashboard.html`

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  METRIC CARDS (4 cards dalam 1 row)            │
│  [Total Sales] [Transactions] [Low Stock] [Profit]
└─────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────┐
│  Sales Trend Chart       │  Top Products Chart  │
│  (Line chart 7 days)     │  (Bar/Pie chart)     │
└──────────────────────────┴──────────────────────┘

┌─────────────────────────────────────────────────┐
│  Recent Transactions Table (last 10)            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  ML ALERTS (if any)                             │
│  ⚠️ 5 produk perlu restock dalam 3 hari         │
│  [Lihat Prediksi ML]                            │
└─────────────────────────────────────────────────┘
```

**Purpose**: 
- One-glance overview bisnis
- Quick access to important actions
- See ML alerts immediately

---

### 2. 🤖 Prediksi ML (FITUR BINTANG)
**File**: `admin/ml-predictions.html`

**Sections:**

#### A. SUMMARY CARDS (Top)
- **Model Accuracy**: 87-95% (confidence badge)
- **Products Need Action**: 15 items (urgent count)
- **Potential Savings**: Rp 500k/month (from waste reduction)

#### B. TABS (Switch between 2 ML areas)

**TAB 1: Manajemen Stok (Stock Intelligence)**

**Features:**
1. **Stockout Prediction Table**
   ```
   | Produk | Stok Saat Ini | Prediksi 7 Hari | Stockout Date | Confidence | Action |
   |--------|---------------|------------------|---------------|------------|--------|
   | Kertas A4 | 45 rim | 56 rim needed | 6 days | 87% | [Order Now] |
   ```

2. **Demand Forecast Chart (30 days)**
   - Line chart: Predicted demand per day
   - Visual: Current stock level line (horizontal)
   - Highlight: When stock will hit zero (red zone)

3. **Restock Recommendations**
   - "Order 120 rim sekarang"
   - "Expected profit if follow: Rp 25 juta"
   - "Risk if ignore: Lost sales Rp 12 juta"

4. **Expiry Risk Alerts** (untuk produk dengan expiry date)
   ```
   ⏰ Tinta HP 680
   - Stock: 12 botol
   - Expiry: 31 Agustus (110 days)
   - Predicted sales: 6 botol
   - ⚠️ 6 botol akan expired
   
   💡 Options:
   - Promo diskon 20%
   - Bundling package
   - Transfer ke cabang lain (jika multi-branch)
   ```

5. **Product Classification**
   ```
   🔥 FAST-MOVING (Priority High)
   - Kertas A4: 8 rim/day, turnover 5 days
   - Action: Always keep high stock
   
   📊 MEDIUM-MOVING
   - Tinta: 2 botol/week, turnover 15 days
   - Action: Moderate stock OK
   
   🐌 SLOW-MOVING
   - Kertas F4: 2 rim/month, turnover 60 days
   - Action: Reduce order quantity
   
   ❌ DEAD STOCK
   - Kertas BC: 0 sales in 3 months
   - Action: Stop ordering, clearance sale
   ```

**TAB 2: Keuangan (Financial Intelligence)**

**Features:**
1. **Revenue Forecast Chart**
   - Line chart: Next 30 days revenue prediction
   - Compare with previous month (actual vs predicted)
   - Confidence interval (range min-max)

2. **Profit Prediction**
   ```
   📈 NEXT MONTH FORECAST
   
   Expected Revenue: Rp 35-42 juta
   Expected COGS: Rp 22-26 juta
   Expected Profit: Rp 13-16 juta (32-38% margin)
   Confidence: 82%
   
   UP Factors:
   + Final exam season (peak demand for stationery)
   + 2 new offices opened nearby
   
   DOWN Factors:
   - Holiday semester 2 weeks (drop 40%)
   ```

3. **Cost Optimization Insights**
   ```
   💡 SAVING OPPORTUNITIES
   
   1. Reduce waste from expired products
      Current loss: Rp 800k/month
      Potential saving: Rp 600k (75% reduction)
      How: Follow ML expiry alerts
   
   2. Optimize restock timing
      Current: Order too early → cash tied up
      Potential saving: Rp 2M cash flow improvement
      How: Follow ML restock recommendations
   ```

4. **Margin Analysis per Product**
   ```
   | Product | Revenue | Profit | Margin | Note |
   |---------|---------|--------|--------|------|
   | Kertas A4 | Rp 9.5M | Rp 6.5M | 68% | 🏆 Best |
   | Tinta | Rp 3M | Rp 1.1M | 36% | Good |
   | Jilid | Rp 1M | Rp 750k | 75% | 🏆 Best |
   
   💡 Recommendation: Focus marketing on high-margin items
   ```

**Action Buttons:**
- [Refresh Model] - Re-train ML model dengan data terbaru
- [Export Report] - Download PDF prediksi ML
- [View History] - Lihat akurasi prediksi sebelumnya

---

### 3. 📦 Produk Management
**File**: `admin/products.html`

**Features:**
- **List View**: Table dengan search, filter (kategori, status)
- **Add Product**: Modal form
  - Nama produk
  - Kategori (dropdown)
  - Harga beli
  - Harga jual (auto-calculate margin %)
  - **Auto-generate SKU** (button generate)
  - **Auto-generate Barcode** (EAN-13, with preview)
  - Upload foto
  - Has expiry date? (checkbox, jika YES → show field expiry date)
  - Min stock level (untuk alert)
  - Status (Active/Inactive)
- **Edit Product**: Modal form (same as add)
- **Delete Product**: Confirmation modal
- **Bulk Actions**: Select multiple → delete/activate/deactivate
- **Print Barcode**: Generate barcode labels untuk di-print & tempel

**Barcode Feature (Important):**
- EAN-13 format (13 digit)
- Indonesia country code: 899
- Auto-calculate check digit
- Visual preview menggunakan JsBarcode library
- Print ready (PDF dengan layout label)

---

### 4. 🏪 Inventori
**File**: `admin/inventory.html`

**Features:**

**A. Stock List Table**
```
| Product | SKU | Stock | Min Stock | Status | Last Update | Action |
|---------|-----|-------|-----------|--------|-------------|--------|
| Kertas A4 | SKU-001 | 45 rim | 20 rim | 🟢 OK | 2h ago | [Adjust] [History] |
| Tinta HP | SKU-002 | 5 btl | 10 btl | 🔴 LOW | 1d ago | [Adjust] [History] |
```

**Status Colors:**
- 🔴 RED: Stock below min level (urgent)
- 🟡 YELLOW: Stock near min level (warning)
- 🟢 GREEN: Stock OK

**B. Stock Adjustment Actions**

1. **Stock IN** (Terima barang)
   - Modal form:
     - Product (dropdown/search)
     - Quantity masuk
     - Supplier (dropdown, optional)
     - Notes (optional)
     - Date received
     - [Save] → Stok bertambah

2. **Stock OUT** (Selain penjualan)
   - Untuk kasus: Rusak, hilang, expired dispose
   - Modal form:
     - Product
     - Quantity keluar
     - Reason (dropdown: Damaged/Lost/Expired/Other)
     - Notes
     - [Save] → Stok berkurang

3. **Stock Opname** (Koreksi manual)
   - Untuk kasus: Hasil stock opname fisik tidak match sistem
   - Modal form:
     - Product
     - System stock: 45 rim (read-only)
     - Physical stock: 43 rim (input)
     - Difference: -2 rim (auto-calculate, red if minus)
     - Reason for difference (textarea)
     - [Confirm Adjustment]

**C. Stock Movement History**
- Timeline view semua pergerakan stok
- Filter by product, date range, movement type
- Export to Excel

**D. Low Stock Alert Box (Top of page)**
```
⚠️ 12 Produk Stok Hampir Habis
[View ML Predictions] untuk restock recommendations
```

---

### 5. 💰 Laporan Penjualan
**File**: `admin/sales-report.html`

**Tabs:**

#### TAB 1: Daily Report
```
📅 Date Picker: [25 Feb 2026]

┌─────────────────────────────────────────┐
│ METRICS (4 cards)                       │
│ [Revenue] [Transactions] [Items Sold] [Avg] │
└─────────────────────────────────────────┘

📊 Sales by Hour Chart (line chart 24 hours)

📦 Best Sellers Today (top 10 table)

👤 Cashier Performance
| Kasir | Transactions | Revenue | Items Sold |
|-------|--------------|---------|------------|
| Bu Siti | 35 | Rp 8.5M | 250 |
| Mas Joko | 28 | Rp 6.2M | 180 |

[Export PDF] [Export Excel]
```

#### TAB 2: Monthly Report
```
📅 Month Picker: [February 2026]

┌─────────────────────────────────────────┐
│ MONTHLY SUMMARY                         │
│ Revenue: Rp 35M                         │
│ COGS: Rp 22M                            │
│ Gross Profit: Rp 13M (37% margin)      │
└─────────────────────────────────────────┘

📊 Revenue Trend Chart (30 days line chart)

📦 Top 10 Products (table dengan revenue, qty sold, profit)

📉 Worst 10 Products (untuk evaluasi)

📊 Sales by Category (pie chart)

[Export PDF] [Export Excel] [Compare Previous Month]
```

#### TAB 3: Custom Range
- Date range picker (from - to)
- Same metrics & charts as daily/monthly
- Flexible untuk analisa periode tertentu

---

### 6. 🚚 Supplier Management (SIMPLIFIED)
**File**: `admin/suppliers.html`

**Features:**

**A. Supplier List Table**
```
| Supplier Name | Contact Person | Phone | Email | Products Supplied | Action |
|---------------|----------------|-------|-------|-------------------|--------|
| CV Sumber Kertas | Pak Andi | 0812xxx | andi@sk.com | Kertas A4, F4 | [Edit] [Delete] |
```

**B. Add/Edit Supplier**
- Modal form:
  - Nama supplier
  - Contact person
  - Phone
  - Email
  - Address
  - Products supplied (multi-select)
  - Payment terms (optional notes)

**C. Order from Supplier (SIMPLIFIED PO)**
- Button: [Order from Supplier]
- Modal form:
  - Supplier (dropdown)
  - Products (add multiple):
    - Product (dropdown)
    - Quantity ordered
    - Unit price
  - Expected delivery date
  - [Save Order]
- Status: Pending → Received
- When mark "Received" → stok masuk otomatis

**NOT included (too complex for MVP):**
- Approval workflow
- Partial receiving
- Payment tracking
- Multi-step PO process

---

### 7. 👥 User Management
**File**: `admin/users.html`

**Features:**

**A. User List Table**
```
| Name | Email | Role | Phone | Status | Last Login | Action |
|------|-------|------|-------|--------|------------|--------|
| Pak Budi | budi@mail.com | Admin | 0812xxx | Active | 2h ago | [Edit] |
| Bu Siti | siti@mail.com | Kasir | 0813xxx | Active | 5m ago | [Edit] [Delete] |
| Mas Joko | joko@mail.com | Kasir | 0814xxx | Inactive | 2d ago | [Edit] [Activate] |
```

**B. Add Kasir**
- Button: [+ Tambah Kasir]
- Modal form:
  - Nama lengkap
  - Email (akan jadi username)
  - Password (auto-generate option)
  - Phone
  - Role: Kasir (fixed, tidak bisa pilih admin)
  - [Save & Send Credentials via Email]

**C. Edit User**
- Edit info (nama, phone, email)
- Reset password
- Activate/Deactivate user

**D. Activity Log (Optional tapi bagus)**
- List login history
- List actions (siapa input produk apa, siapa void transaksi)

---

### 8. ⚙️ Settings (MINIMAL)
**File**: `admin/settings.html`

**Simplified untuk MVP:**

#### TAB 1: Business Profile
- Nama usaha
- Logo upload
- Address
- Phone, Email, Website

#### TAB 2: Receipt Settings
- Receipt header text
- Footer text (thank you message)
- Show logo on receipt? (checkbox)

#### TAB 3: System
- Tax rate % (input, default 0%)
- Currency (default: IDR)
- Date format (DD/MM/YYYY or MM/DD/YYYY)

**NOT included (hardcode dulu):**
- Printer configuration (use browser print)
- Email SMTP setup (use default email service)
- Payment gateway integration (manual payment dulu)

---

## 🔄 PENDING QUESTIONS TO ANSWER

Sebelum lanjut ke workflow detail, perlu klarifikasi dari dosen:

### Tentang ML - Manajemen Stok:
Dosen bilang "ML untuk Manajemen Stok" - maksudnya include semua ini?
- ✅ Prediksi stockout (kapan barang habis)
- ✅ Rekomendasi restock (berapa banyak order)
- ✅ Prediksi expiry risk (barang akan expired)
- ✅ Klasifikasi fast/slow-moving products
- ❓ Transfer optimization antar cabang (jika multi-branch)?
- ❓ Lainnya?

### Tentang ML - Keuangan:
Dosen bilang "ML untuk Keuangan" - maksudnya include semua ini?
- ✅ Revenue forecasting (prediksi omzet)
- ✅ Profit forecasting (prediksi profit)
- ✅ Cost optimization (saving opportunities)
- ✅ Margin analysis per product
- ❓ Cash flow prediction?
- ❓ Break-even analysis?
- ❓ Lainnya?

### Tentang Scope:
- ❓ Fokus balance 50-50 (Web App + ML)?
- ❓ Atau lebih fokus ke ML (70%) web app sebagai demo platform?
- ❓ Atau sebaliknya?

### Tentang Multi-Branch:
- ❓ MUST have multi-branch untuk TA?
- ❓ Atau single outlet dulu, multi-branch future work?

---

## 📝 NEXT STEPS

Setelah klarifikasi di atas:
1. **Define workflow detail** per fitur (user journey)
2. **API endpoint planning** untuk REST API Session 8
3. **ML model strategy** (algorithm selection, training approach)
4. **Database schema review** (apakah 11 models sekarang cukup atau perlu adjustment)
5. **Timeline adjustment** (apakah 24 sessions masih realistis dengan scope baru)

---

**Status**: ⏸️ WAITING FOR USER CLARIFICATION  
**Priority**: HIGH - Ini adalah foundation semua development selanjutnya  
**Impact**: Semua Sessions 8-24 depend on blueprint yang clear

