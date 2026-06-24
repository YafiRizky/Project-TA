# SESSION 2: DETAILED SPECIFICATION & WORKFLOW
**Date**: 5 Februari 2026 (Sesi Kedua)  
**Focus**: Deep dive fitur per role, workflow detail, competitive analysis

---

## KEY DECISIONS DARI SESSION INI

### ✅ STRATEGIC DECISION: 2-FASE APPROACH
1. **FASE 1 (4 bulan)**: Web App POS Complete (tanpa ML)
2. **FASE 2 (2 bulan)**: ML Integration

**Alasan:**
- Realistic untuk 6 bulan
- Build solid foundation dulu (collect data)
- Avoid complexity explosion
- Data dari Fase 1 untuk training ML di Fase 2

---

## COMPLETE FEATURE BREAKDOWN

### ROLE 1: SUPER ADMIN (Owner/Pemilik Bisnis)

#### A. DASHBOARD OVERVIEW
**Features:**
- Real-time stats cards (Revenue, Transactions, Profit, Alerts)
- Auto-refresh setiap 30 detik
- Filter by branch (All / specific branch)
- Filter by date range (Today/Week/Month/Custom)
- Revenue trend chart (7 days)
- Sales by category (pie chart)
- Top 5 products table
- Recent 10 transactions
- Export report (PDF/Excel)

#### B. PRODUCT MANAGEMENT (CRUD)
**List Products Page:**
- Search bar (by name/SKU/barcode)
- Filter by category
- Filter by stock status (All/In Stock/Low/Out)
- Sort options (Name/Price/Stock)
- Bulk actions (checkbox select)
- Pagination

**Add/Edit Product Form:**
- ✅ Basic Info:
  - Product Name* (required)
  - SKU (auto-generate berdasarkan timestamp: SKU-XXXXXX)
  - Barcode (auto-generate EAN-13 dengan country code 899)
  - Category* (dropdown + add new)
  
- ✅ Barcode Features:
  - Real-time barcode preview (JsBarcode library)
  - Manual input option (jika produk sudah punya barcode)
  - Print single barcode label
  
- ✅ Pricing:
  - Purchase Price* (harga beli)
  - Selling Price* (harga jual)
  - Profit Margin (auto-calculated %, Rp)
  
- ✅ Stock & Inventory:
  - Initial Stock* (qty)
  - Unit (pcs/box/btl/kg/rim)
  - Minimum Stock Alert threshold
  
- ✅ Product Image:
  - Upload (max 2MB, JPG/PNG)
  - Preview image
  
- ✅ Additional Info (Optional):
  - Checkbox: Has expiry date → show date picker
  - Checkbox: Has variants → open variant manager modal
  - Supplier dropdown (select + add new)
  - Description textarea
  
- ✅ Multi-Branch Assignment:
  - Checkbox per branch dengan initial stock allocation
  - Branch 1: ☑ Stock: 50
  - Branch 2: ☑ Stock: 30
  - Branch 3: ☐ Stock: 0 (not assigned)

**Actions per Product:**
- 👁️ View: Detail lengkap + stock history
- ✏️ Edit: Update all fields
- 🗑️ Delete: Soft delete (recoverable)
- 📊 Stock History: Transaction log
- 🖨️ Print Barcode: Individual print

**Bulk Actions:**
- Bulk delete (selected products)
- Bulk print barcodes (label sheet)
- Bulk export (CSV/Excel)
- Bulk import (CSV template)

#### C. INVENTORY MANAGEMENT (Multi-Branch)

**Inventory Overview:**
- View selector: All Branches / Branch 1 / Branch 2
- Alert summary cards:
  - ⚠️ Low Stock (count + list)
  - ⏰ Expiring Soon (7 days threshold)
  - ❌ Out of Stock (count + list)
  
- Stock Summary Table:
  ```
  Product      | Branch 1 | Branch 2 | Total | Status
  Indomie      | 100 pcs  | 80 pcs   | 180   | ✅
  Minyak 1L    | 45 btl   | 120 btl  | 165   | ✅
  Gula 1kg     | ⚠️ 15 kg  | 50 kg    | 65    | ⚠️
  Kertas A4    | ❌ 0 rim  | 100 rim  | 100   | ❌
  ```

**Stock IN (Purchase/Restocking):**
```
Form Fields:
- Product* (select dropdown)
- Quantity* (number)
- Branch* (select)
- Purchase Price (update latest price)
- Supplier (select)
- Invoice Number (optional)
- Date* (date picker)
- Expired Date (jika applicable)
- Notes (textarea)
[Save Stock IN]

Result:
- Stock quantity bertambah di branch terpilih
- Create stock_movement record (type: IN)
- Update product purchase_price (jika berubah)
```

**Stock OUT (Non-sales - Damaged/Lost):**
```
Form Fields:
- Product* (select)
- Quantity* (number)
- Branch* (select)
- Reason* (Rusak/Hilang/Expired/Sample/Lainnya)
- Date* (date picker)
- Notes (textarea)
[Save Stock OUT]

Result:
- Stock quantity berkurang di branch terpilih
- Create stock_movement record (type: OUT)
- Log reason untuk audit
```

**Stock Transfer (Between Branches):**
```
Form Fields:
- Product* (select)
- Quantity* (number)
- From Branch* (select)
- To Branch* (select)
- Reason (Rebalancing/Request/Lainnya)
- Transfer Date* (date picker)
- Notes (textarea)
[Request Transfer]

Workflow:
1. Admin request transfer
2. Status: Pending
3. Kasir Branch 2 (from) approve/confirm
4. Stock keluar dari Branch 2
5. Stock masuk ke Branch 1
6. Status: Completed
7. Create 2 stock_movement records (OUT from Branch 2, IN to Branch 1)
```

**Stock Opname (Physical Count/Audit):**
```
Purpose: Reconcile stock fisik vs sistem

Process:
1. Admin pilih Branch & Date
2. System generate table:
   Product    | System | Physical | Difference
   Indomie    | 100    | 98       | -2 ⚠️
   Minyak     | 45     | 45       | 0  ✅
   Gula       | 15     | 17       | +2 ⚠️
   
3. Admin input kolom Physical (hasil hitung manual)
4. System calculate Difference
5. [Adjust System Stock to Match Physical]
6. System create stock_opname record + adjustment in stock_movements
```

#### D. BRANCH MANAGEMENT

**Branch List:**
```
Card per Branch:
┌─────────────────────────────────────┐
│ 📍 Branch 1: Fotocopy Kampus Utara  │
│    Address: Jl. Sudirman No. 123    │
│    Phone: 081234567890              │
│    Status: 🟢 Active                │
│    Staff: 2 kasir                   │
│    Stock Items: 156                 │
│    Revenue (Month): Rp 25,000,000   │
│    [View Details] [Edit] [Inactive] │
└─────────────────────────────────────┘
```

**Add/Edit Branch Form:**
- Branch Name* (e.g., "Fotocopy Kampus Utara")
- Branch Code (auto: BR001, BR002)
- Address* (full address)
- Phone (contact number)
- Email (optional)
- Manager/PIC (person in charge)
- Status: Active/Inactive
- Opening Hours: 09:00 - 21:00
- [Save Branch]

#### E. SUPPLIER MANAGEMENT

**Supplier List:**
```
Card per Supplier:
┌─────────────────────────────────────┐
│ CV. Sumber Rejeki                   │
│ Contact: Pak Budi - 081234567890    │
│ Address: Jl. Pasar Induk No. 12     │
│ Products Supplied: 45 items         │
│ Total Purchase (Month): Rp 15jt    │
│ [View] [Edit] [History] [Delete]   │
└─────────────────────────────────────┘
```

**Add/Edit Supplier Form:**
- Supplier Name* (company name)
- Contact Person (PIC)
- Phone* (contact number)
- Email (optional)
- Address (full address)
- Payment Terms (Cash/Tempo 7/14/30 hari)
- Notes (textarea)
- [Save Supplier]

**Purchase History:**
- List semua Stock IN dari supplier ini
- Total purchase (by period)
- Outstanding payables (jika tempo)

#### F. REPORTS & ANALYTICS

**Report Categories:**

**1. FINANCIAL REPORTS:**
- Sales Report (Daily/Weekly/Monthly/Custom range)
  - Total revenue
  - Total transactions
  - Average transaction value
  - Revenue by payment method
  - Revenue trend chart
  
- Profit & Loss Statement
  - Total revenue
  - COGS (Cost of Goods Sold)
  - Gross profit
  - Losses (expired, damaged, lost)
  - Net profit
  - Profit margin %
  
- Revenue by Branch (comparison)
- Revenue by Category
- Payment Method Report (Cash/Card/QRIS breakdown)

**2. INVENTORY REPORTS:**
- Stock Movement Report
  - All IN/OUT/Transfer transactions
  - Filter by date range, branch, product
  
- Stock Valuation Report
  - Current stock value (qty × purchase price)
  - By branch, by category
  
- Low Stock Report (list products below threshold)
- Expired Products Report (expired/will expire)
- Stock Opname History (audit trail)
- Transfer History (between branches)

**3. PRODUCT PERFORMANCE:**
- Top Selling Products (by qty & by revenue)
- Slow Moving Products (< X qty/month)
- Product Ranking by Revenue
- Product Ranking by Profit Contribution

**Report Features:**
- Filter by branch (All/specific)
- Filter by date range
- Interactive charts (Chart.js)
- Export to PDF
- Export to Excel
- Print report

#### G. USER MANAGEMENT (Role-Based)

**User List Table:**
```
Name  | Role        | Branch    | Status   | Actions
Admin | Super Admin | All       | 🟢 Active | [Edit] [Reset PW]
Siti  | Kasir       | Branch 1  | 🟢 Active | [Edit] [Reset PW] [Deactivate]
Budi  | Kasir       | Branch 2  | 🟢 Active | [Edit] [Reset PW] [Deactivate]
Ani   | Kasir       | Branch 1  | 🔴 Inactive | [Edit] [Reset PW] [Activate]
```

**Add/Edit User Form:**
- Full Name* (display name)
- Email* (for login & notifications)
- Username* (for login)
- Password* (strong password validation)
- Role*: [Super Admin / Kasir]
- Branch*: (only for Kasir role)
- Phone (contact)
- Status: Active/Inactive
- [Save User]

**Role Permissions Matrix:**
| Feature | Super Admin | Kasir |
|---------|-------------|-------|
| Dashboard All Branches | ✅ Full | ❌ |
| Dashboard Own Branch | ✅ | ✅ Read-only |
| Products (CRUD) | ✅ | ❌ |
| Products (View) | ✅ | ✅ Own branch |
| Inventory (CRUD) | ✅ | ❌ |
| Inventory (View) | ✅ | ✅ Own branch |
| POS Transaction | ✅ | ✅ |
| Branches (CRUD) | ✅ | ❌ |
| Suppliers (CRUD) | ✅ | ❌ |
| Reports (All) | ✅ | ❌ |
| Reports (Own Branch) | ✅ | ✅ |
| Users (CRUD) | ✅ | ❌ |
| Settings | ✅ | ❌ |

#### H. SETTINGS & CONFIGURATION

**Business Profile:**
- Business Name
- Business Type (Retail/F&B/Service)
- Logo (upload image)
- Tax ID (NPWP)
- Address
- Phone & Email

**Tax & Pricing:**
- Enable Tax (PPN 11%): Yes/No
- Tax Display: Included/Excluded in price
- Rounding: To nearest 100/500/1000/None

**Receipt Settings:**
- Receipt Header Text (custom message)
- Receipt Footer Text (terima kasih, contact info)
- Auto Print Receipt: Yes/No/Ask
- Receipt Logo: Enable/Disable

**Inventory Settings:**
- Stock Alert Method: Email/In-App/Both
- Default Low Stock Threshold (applies to new products)
- Enable Barcode Scanner: Yes/No
- Stock Update Real-time: Yes/No

**Notification Settings:**
- ☑ Low Stock Alerts (push/email)
- ☑ Expired Product Alerts (X days before)
- ☑ Daily Sales Summary Email
- ☑ Weekly Performance Report
- Email Recipients (admin emails)

---

### ROLE 2: KASIR (Cashier - Per Branch)

#### A. POS TRANSACTION INTERFACE

**Main POS Screen Layout:**

**LEFT PANEL: Shopping Cart**
```
[Scan/Input Barcode: _______________] [🔍 Search by Name]

ITEMS IN CART:
┌──────────────────────────────────────────┐
│ 1. Indomie Goreng              x2  [+][-]│
│    Rp 3,500 × 2         = Rp 7,000  [×] │
│                                           │
│ 2. Minyak Goreng 1L            x1  [+][-]│
│    Rp 25,000 × 1        = Rp 25,000 [×] │
│                                           │
│ 3. Gula 1kg                    x3  [+][-]│
│    Rp 18,000 × 3        = Rp 54,000 [×] │
└──────────────────────────────────────────┘

Subtotal:                    Rp 86,000
Tax (11%):                   Rp 9,460
─────────────────────────────────────
TOTAL:                       Rp 95,460

[Clear Cart] [Hold Transaction]
```

**RIGHT PANEL: Payment**
```
Payment Method:
[💵 CASH] [💳 DEBIT/CREDIT] [📱 QRIS/E-WALLET]

Amount to Pay: Rp 95,460

Cash Received: Rp [__________]
              [Quick: 100k] [150k] [200k]

Change:        Rp 0 (auto-calculated)

Customer (Optional):
Name: [__________] Phone: [__________]

        [PROCESS TRANSACTION]
        (BIG GREEN BUTTON)

After success:
[Print Receipt] [Email Receipt]
```

**BOTTOM: Quick Shortcuts**
```
[🛒 New Transaction] [⏸️ On Hold (2)] [📜 History] [📊 Today's Summary]
```

**POS Features:**

**1. Add Product to Cart:**
- Via Barcode Scanner:
  - Kasir scan barcode dengan scanner device
  - System auto-detect product
  - Add to cart dengan qty = 1
  - Real-time stock check (jika stock < qty → warning)
  
- Via Manual Input:
  - Kasir ketik barcode number manual
  - Enter → system search & add to cart
  
- Via Search:
  - Kasir ketik product name
  - Autocomplete dropdown muncul
  - Select product → add to cart

**2. Cart Management:**
- Adjust Quantity: [+] [-] buttons
- Remove Item: [×] button
- Clear All: [Clear Cart] button
- Validation: Qty tidak boleh > stock available

**3. Payment Processing:**
- **CASH Payment:**
  - Kasir input cash received (manual atau quick buttons)
  - System auto-calculate change
  - Validation: cash received ≥ total
  
- **CARD Payment:**
  - Kasir pilih DEBIT/CREDIT
  - Amount = exact total (no change)
  
- **QRIS/E-Wallet:**
  - Kasir pilih QRIS
  - Generate QR code (future: integration)
  - Amount = exact total

**4. Hold Transaction:**
- Kasir bisa "hold" current cart (simpan sementara)
- Scenario: Customer A belum selesai, Customer B mau bayar dulu
- Kasir hold cart A → proses cart B → resume cart A
- Max hold: 10 transactions
- Hold timeout: 24 hours (auto clear)

**5. Transaction Completion:**
```
Click [PROCESS TRANSACTION]:
1. Validate cart (not empty, stock available)
2. Validate payment (amount sufficient)
3. Save to database:
   - transactions table (header)
   - transaction_items table (details)
4. Update stock (kurangi qty per product)
5. Generate receipt number (TRX-XXXXXX)
6. Auto print receipt (jika enabled)
7. Clear cart
8. Ready for next customer

Success notification: "Transaction completed! TRX-12345"
```

#### B. TRANSACTION HISTORY (Kasir View)

**History Page:**
```
Filter: [Today ▼] [All Payment Methods ▼]

┌──────────────────────────────────────────────────┐
│ Time  | TRX ID    | Items | Total      | Payment│
│ 14:35 | TRX-12345 | 3     | Rp 95,460  | Cash  │
│       [View Details] [Reprint Receipt]           │
│                                                   │
│ 14:20 | TRX-12344 | 5     | Rp 175,000 | QRIS  │
│       [View Details] [Reprint Receipt]           │
│                                                   │
│ 14:05 | TRX-12343 | 2     | Rp 42,000  | Cash  │
│       [View Details] [Reprint Receipt]           │
└──────────────────────────────────────────────────┘

TODAY'S SUMMARY (Own Branch):
Total Transactions: 45
Total Revenue: Rp 2,450,000
By Payment Method:
- Cash: Rp 1,800,000 (32 trx)
- Card: Rp 450,000 (8 trx)
- QRIS: Rp 200,000 (5 trx)
```

**Transaction Detail Modal:**
```
Transaction: TRX-12345
Date: 05 Feb 2026 14:35
Kasir: Siti
Branch: Branch 1

Items:
1. Indomie Goreng        x2  @ Rp 3,500  = Rp 7,000
2. Minyak Goreng 1L      x1  @ Rp 25,000 = Rp 25,000
3. Gula 1kg              x3  @ Rp 18,000 = Rp 54,000

Subtotal:                       Rp 86,000
Tax (11%):                      Rp 9,460
─────────────────────────────────────────
TOTAL:                          Rp 95,460

Payment: Cash
Received: Rp 100,000
Change: Rp 4,540

[Print Receipt] [Close]
```

**Features:**
- View transaction details
- Reprint receipt (customer request)
- Filter by date range
- Filter by payment method
- Today's summary for shift handover
- CANNOT edit/delete transaction (immutable)

#### C. STOCK CHECK (Read-Only)

**Stock Check Page:**
```
Search Product: [_______________] [🔍]

┌──────────────────────────────────────────┐
│ Product          | Stock   | Status      │
│ Indomie Goreng   | 100 pcs | ✅ Available│
│ Minyak 1L        | 45 btl  | ✅ Available│
│ Gula 1kg         | 15 kg   | ⚠️ Low Stock│
│ Kertas A4        | 0 rim   | ❌ Out      │
└──────────────────────────────────────────┘

Note: Anda hanya bisa melihat stock cabang sendiri.
Untuk adjustment stock, hubungi Admin.
```

**Use Case:**
- Customer tanya: "Mas, minyak goreng masih ada?"
- Kasir cek sistem: "Ada 45 botol, Bu. Butuh berapa?"
- Kasir tidak bisa edit stock (read-only)
- Hanya Admin yang bisa adjust stock

---

## WORKFLOW DIAGRAMS

### Workflow 1: Admin Add New Product
```
1. Admin login
2. Navigate to Products → Add New Product
3. Fill form:
   - Product Name ✓
   - Click [Auto Generate SKU] → SKU-123456 ✓
   - Click [Auto Generate Barcode] → 8992388101053 ✓
   - Barcode preview muncul ✓
   - Select Category ✓
   - Input Purchase Price: Rp 2,500 ✓
   - Input Selling Price: Rp 3,500 ✓
   - System auto-calc Profit: Rp 1,000 (40%) ✓
   - Input Initial Stock: 100 pcs ✓
   - Set Min Stock Alert: 20 pcs ✓
   - Upload Image ✓
   - Assign to Branches:
     ☑ Branch 1: 50 pcs
     ☑ Branch 2: 50 pcs
4. Click [Publish]
5. System:
   - Save to products table
   - Create product_stocks records (2 rows, per branch)
   - Create stock_movements records (type: IN, initial stock)
6. Success notification: "Product added successfully!"
7. Barcode label ready to print
```

### Workflow 2: Kasir Process Sale Transaction
```
1. Kasir login (Branch 1)
2. POS page auto-load
3. Customer bawa 3 barang:
   
   a. Scan Indomie Goreng barcode
      → System detect → Add to cart (qty 1)
      → Kasir adjust qty to 2 (click [+])
   
   b. Scan Minyak Goreng barcode
      → System detect → Add to cart (qty 1)
   
   c. Customer tanya: "Gula ada?"
      → Kasir cek stock: "Ada 15 kg, Bu"
      → Customer: "Ambil 3 kg"
      → Kasir search "Gula" → select → adjust qty to 3

4. Cart summary:
   - 3 items
   - Total: Rp 95,460 (including tax)

5. Kasir: "Total Rp 95,460, Bu"
6. Customer bayar cash Rp 100,000
7. Kasir input cash received: Rp 100,000
8. System auto-calc change: Rp 4,540
9. Kasir click [PROCESS TRANSACTION]
10. System:
    - Save transaction (TRX-12345)
    - Update stock:
      * Indomie: 100 → 98
      * Minyak: 45 → 44
      * Gula: 15 → 12 (⚠️ Low stock alert triggered)
    - Generate receipt
    - Auto print (jika enabled)
11. Kasir kasih struk + kembalian Rp 4,540
12. Transaction complete → Cart cleared
```

### Workflow 3: Stock Transfer Between Branches
```
Scenario: Branch 1 kehabisan Kertas A4, Branch 2 masih banyak

1. Admin login
2. Navigate to Inventory → Stock Transfer
3. Fill form:
   - Product: Kertas A4
   - From Branch: Branch 2 (stock: 100 rim)
   - To Branch: Branch 1 (stock: 0 rim)
   - Quantity: 50 rim
   - Reason: Rebalancing (Branch 1 urgent need)
   - Date: Today
4. Click [Request Transfer]
5. System:
   - Status: Pending
   - Send notification to Kasir Branch 2
6. Kasir Branch 2 confirm:
   - "Admin request transfer 50 rim ke Branch 1"
   - Physical check: Kertas ada 100 rim ✓
   - Click [Approve Transfer]
7. System:
   - Update Branch 2 stock: 100 → 50
   - Update Branch 1 stock: 0 → 50
   - Create stock_movement (OUT from B2)
   - Create stock_movement (IN to B1)
   - Status: Completed
8. Admin terima notification: "Transfer completed"
9. Done. Branch 1 sekarang punya stock 50 rim
```

---

## COMPETITIVE ANALYSIS SUMMARY

### Why Current POS Tidak Cukup?

**Problem 1: Reactive, bukan Predictive**
```
Current POS: "Stok tinggal 10 pcs" (sudah terlambat)
Your System: "Stok akan habis dalam 5 hari" (early warning)
```

**Problem 2: Data mentah, bukan Insight**
```
Current POS: "Cabang A laku 100, Cabang B laku 20"
Your System: "Transfer 50 pcs dari B ke A, save Rp 150k"
```

**Problem 3: Mahal untuk UMKM Mikro**
```
Current POS: Rp 100k-500k/bulan (5-10% dari profit)
Your System: Affordable / Freemium model
```

**Problem 4: No Expired Prediction**
```
Current POS: Alert manual 7 hari sebelum expired
Your System: "12 box tidak akan laku, promo sekarang"
```

### Your Unique Selling Points

1. **ML-Powered Demand Forecasting**
   - "Produk X akan laku 56 pcs dalam 7 hari (confidence 87%)"
   - "Stock akan habis tanggal 11 Feb"
   - "Restock 120 pcs sekarang untuk avoid stockout"

2. **Intelligent Multi-Branch Optimization**
   - Auto-detect imbalance antar cabang
   - Recommendation transfer dengan cost-benefit analysis
   - Avoid unnecessary purchases

3. **Proactive Waste Prevention**
   - Predict expired products yang tidak akan laku
   - Early action recommendation (promo/discount)
   - Reduce loss dari barang expired

4. **Academic Contribution**
   - Novel ML application untuk UMKM POS
   - Algorithm comparison (ARIMA vs Prophet vs LSTM)
   - Real-world impact measurement

---

## TECH STACK FINAL DECISION

### Backend: Django (Python)
- Django 4.2+
- Django REST Framework (API)
- PostgreSQL database
- Celery (background tasks - untuk ML prediction)
- Redis (cache & message broker)

### Frontend: React + Tailwind
- React 18+
- React Router (navigation)
- Axios (API calls)
- Chart.js / Recharts (visualization)
- React Hook Form (forms)
- JsBarcode (barcode generation)
- TailwindCSS + DaisyUI/Shadcn (UI components)

### ML (Fase 2):
- scikit-learn (classification, preprocessing)
- Prophet / statsmodels (time series)
- pandas, numpy (data manipulation)
- matplotlib, seaborn (visualization)

### DevOps:
- Git & GitHub (version control)
- Docker (containerization - optional)
- Railway/Heroku (backend deployment)
- Vercel (frontend deployment)
- PostgreSQL (Railway/Heroku)

---

## DATABASE TABLES (11 Core Tables)

```sql
1. users
   - id, name, email, username, password_hash, role, 
     branch_id, phone, status, created_at, updated_at

2. branches
   - id, name, code, address, phone, email, manager, 
     opening_hours, status, created_at, updated_at

3. categories
   - id, name, description, created_at, updated_at

4. suppliers
   - id, name, contact_person, phone, email, address, 
     payment_terms, notes, created_at, updated_at

5. products
   - id, sku, barcode, name, category_id, supplier_id,
     purchase_price, selling_price, profit_margin, unit,
     minimum_stock, has_expired_date, image_url, 
     description, status, created_at, updated_at

6. product_stocks
   - id, product_id, branch_id, quantity, 
     minimum_stock_alert, last_updated

7. product_batches (untuk expired tracking)
   - id, product_id, branch_id, batch_number, 
     quantity, purchase_date, expired_date, 
     supplier_id, invoice_number, created_at

8. transactions
   - id, transaction_number, branch_id, kasir_id,
     subtotal, tax_amount, tax_percentage, total,
     payment_method, cash_received, change_amount,
     customer_name, customer_phone, transaction_date,
     status, created_at, updated_at

9. transaction_items
   - id, transaction_id, product_id, product_name,
     quantity, unit_price, subtotal, created_at

10. stock_movements (audit log)
    - id, product_id, branch_id, type, quantity,
      from_branch_id, to_branch_id, reference_type,
      reference_id, reason, notes, created_by,
      movement_date, created_at

11. stock_opname
    - id, branch_id, product_id, system_stock,
      physical_stock, difference, adjustment_reason,
      notes, opname_date, created_by, created_at
```

**Relationships:**
- users → branches (many-to-one)
- products → categories (many-to-one)
- products → suppliers (many-to-one)
- product_stocks → products, branches (many-to-one each)
- product_batches → products, branches (many-to-one each)
- transactions → users (kasir), branches (many-to-one each)
- transaction_items → transactions, products (many-to-one each)
- stock_movements → products, branches, users (many-to-one each)
- stock_opname → branches, products, users (many-to-one each)

---

## NEXT IMMEDIATE ACTIONS

### For User (Developer):
1. ⏳ **Tunggu approval proposal TA dari dosen**
2. ⏳ **Koordinasi dengan UI/UX Designer:**
   - Berikan specification document ini
   - Diskusikan workflow & use cases
   - Tentukan timeline design (4-6 minggu)
3. ✅ **Setup development environment:**
   - Install Python 3.10+
   - Install Node.js 18+
   - Install PostgreSQL 14+
   - Install Git
   - Setup virtual environment (venv)
4. ✅ **Belajar Django basics** (jika belum familiar):
   - Django official tutorial
   - Django REST Framework tutorial
   - Django authentication & permissions
5. ✅ **Belajar React basics** (jika belum familiar):
   - React official tutorial
   - React Hooks (useState, useEffect)
   - React Router
6. ✅ **Create GitHub repository:**
   - Repository name: pos-ml-system
   - Initialize with README.md
   - Add .gitignore (Python, Node)

### For Designer:
1. ⏳ **Read specification document ini**
2. ⏳ **Create wireframes:**
   - Admin pages (dashboard, products, inventory, etc)
   - Kasir pages (POS, history)
   - Mobile responsive consideration
3. ⏳ **Create hi-fidelity mockups:**
   - Design system (colors, typography, spacing)
   - Component library
   - All screens (20+ pages)
4. ⏳ **Create prototype:**
   - Interactive prototype di Figma
   - User flow demonstration
5. ⏳ **Handoff to developer:**
   - Export assets
   - Design tokens (CSS variables)
   - Component specifications

### Week 1 Action Plan (After Approval):
- [ ] Day 1-2: Setup Django project structure
- [ ] Day 3-4: Design database schema ERD
- [ ] Day 5: Implement database models in Django
- [ ] Day 6: Run migrations, test DB
- [ ] Day 7: Setup Django REST Framework, create basic API

---

## KEY LEARNINGS FROM SESSION 2

1. ✅ **2-Fase strategy realistic** untuk 6 bulan
2. ✅ **Deep-Narrow better** daripada Wide-Shallow untuk TA
3. ✅ **Django + React solid choice** untuk full-stack + ML
4. ✅ **Competitive analysis penting** untuk positioning TA
5. ✅ **Detail specification crucial** sebelum mulai coding
6. ✅ **UI/UX design should start parallel** dengan backend setup

---

**Session End**: 5 Februari 2026  
**Next Session**: After proposal approval + UI/UX design kickoff  
**Status**: ✅ Ready to start development planning
