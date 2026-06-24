# 📋 DOKUMENTASI FITUR DAN HALAMAN
**Project**: Sistem POS dengan Machine Learning  
**Date**: 5 Februari 2026

---

## 🎯 RINGKASAN PROJECT

Sistem kasir digital untuk UMKM (warung, toko fotocopy, minimarket) dengan 2 keunggulan utama:

1. **POS System**: Transaksi kasir + manajemen produk & stok multi-cabang
2. **Machine Learning**: Prediksi stockout, warning expired, rekomendasi otomatis

**Target User**: 
- **Kasir** (usia 40-50 tahun, butuh simpel & cepat)
- **Admin/Owner** (pemilik toko, butuh data & insights untuk keputusan bisnis)

---

## 👥 USER ROLES

### ROLE 1: KASIR (Cashier)
**Akses Terbatas:**
- Hanya bisa: Transaksi penjualan, lihat history transaksi sendiri, cek stok (read-only)
- Tidak bisa: Tambah/edit produk, lihat laporan keuangan, akses ML predictions

**Goal**: Proses 1 customer dalam 2 menit

---

### ROLE 2: ADMIN (Owner/Manager)
**Full Access:**
- Semua fitur kasir + manajemen produk, inventory, laporan, ML predictions, user management

**Goal**: Buat keputusan bisnis smart (kapan restock, berapa quantity, transfer stok kemana)

---

## 📱 DAFTAR HALAMAN & FITUR

### **A. HALAMAN UNTUK KASIR (5 Halaman)**

---

#### **A1. Halaman Login**

**URL**: `/login`

**Fitur:**
- Input username & password
- Dropdown pilih role (Kasir / Admin)
- Button login
- Auto-redirect:
  - Kasir → POS Screen
  - Admin → Dashboard

**Validasi:**
- Username & password wajib diisi
- Error message jika salah (contoh: "Username atau password salah")
- Session timeout setelah 8 jam tidak aktif

---

#### **A2. Halaman POS (Point of Sale) - Transaksi** ⭐ KRITICAL

**URL**: `/kasir/pos`

**Layout**: Split screen (kiri = cart, kanan = payment)

**Fitur Bagian Kiri (Shopping Cart):**

1. **Input Produk:**
   - Scan barcode (fokus auto ke input field)
   - Atau search manual (ketik nama produk → dropdown suggestions)
   - Enter = tambah ke cart

2. **Cart Items:**
   - List produk yang sudah ditambahkan
   - Setiap item tampilkan: Nama produk, Qty, Harga satuan, Subtotal
   - Button [×] untuk hapus item
   - Button [+] [-] untuk ubah quantity
   - Warning merah jika qty melebihi stok yang tersedia

3. **Summary:**
   - Subtotal (total harga sebelum pajak)
   - Tax (PPN 11% - bisa diatur di settings)
   - **Total** (angka besar, bold, highlighted)

4. **Action Buttons:**
   - [Clear Cart]: Kosongkan semua item
   - [Hold Transaction]: Simpan transaksi untuk dilanjutkan nanti (maksimal 5 transaksi hold)

**Fitur Bagian Kanan (Payment):**

1. **Payment Method:**
   - Radio button: Cash / Card / QRIS
   - Default: Cash (paling sering dipilih)

2. **Cash Payment (jika pilih Cash):**
   - Input field: Jumlah uang yang diterima
   - Quick buttons: Rp 50,000 | Rp 100,000 | Rp 200,000 (untuk mempercepat)
   - Auto-calculate kembalian (Change)
   - Warning jika cash kurang dari total

3. **Card/QRIS Payment:**
   - Show total yang harus dibayar
   - Input reference number (untuk card)
   - Show QR code (untuk QRIS)

4. **Process Button:**
   - Button besar hijau [PROCESS PAYMENT]
   - Disabled jika cart kosong
   - Disabled jika cash kurang dari total

**After Process:**
- Auto-print struk (atau popup pilihan: Print / Email / WhatsApp / Tidak)
- Success message: "Transaksi berhasil! Kembalian: Rp XXX"
- Auto-clear cart
- Fokus kembali ke barcode input (siap transaksi berikutnya)

**Keyboard Shortcuts:**
- F1: Fokus ke barcode input
- F2: Clear cart
- F3: Hold transaction
- Enter (di payment): Process

---

#### **A3. Halaman Transaction History (Kasir)**

**URL**: `/kasir/history`

**Fitur:**

1. **Filter:**
   - Tanggal: Today / Yesterday / This Week / This Month / Custom Range
   - Payment Method: All / Cash / Card / QRIS
   - Button [Apply Filter]

2. **List Transaksi:**
   - Setiap row tampilkan:
     - Waktu transaksi (14:35)
     - Transaction ID (TRX-12345)
     - Jumlah item (3 items)
     - Total amount (Rp 95,460)
     - Payment method (icon)
   - Button [View Details]: Popup modal dengan detail item per item
   - Button [Reprint Receipt]: Print ulang struk

3. **Pagination:**
   - 20 transaksi per page
   - Load more atau pagination buttons

4. **Summary Box (Bottom):**
   - Total transaksi hari ini
   - Total revenue hari ini
   - Readonly (hanya tampil, tidak bisa diklik)

---

#### **A4. Halaman Stock Check**

**URL**: `/kasir/stock`

**Fitur:**

1. **Search:**
   - Input field: Cari nama produk atau SKU
   - Real-time search (ketik langsung filter)

2. **Table Stok:**
   - Columns: Nama Produk / SKU / Stock / Unit / Status
   - Status indicator:
     - ✅ Available (hijau): Stock > min stock alert
     - ⚠️ Low Stock (kuning): Stock ≤ min stock alert
     - ❌ Out of Stock (merah): Stock = 0

3. **Read-Only:**
   - Kasir hanya bisa **LIHAT**, tidak bisa edit/tambah stok
   - Catatan di top: "Untuk adjust stok, hubungi Admin"

4. **Mobile Friendly:**
   - Kasir sering cek via HP saat customer tanya "Apakah barang X masih ada?"

---

#### **A5. Print Receipt Design**

**Format**: 80mm thermal printer (standar kasir)

**Content:**

1. **Header:**
   - Nama toko
   - Alamat
   - Telepon

2. **Transaction Info:**
   - Transaction ID
   - Tanggal & waktu
   - Nama kasir

3. **Items:**
   - List produk: Nama / Qty / Harga satuan / Subtotal
   - Format: align left (nama), align right (harga)

4. **Footer:**
   - Subtotal
   - Tax (11%)
   - **Total** (bold)
   - Payment method
   - Cash / Change (jika cash)

5. **Closing:**
   - Terima kasih message
   - Barcode transaksi (untuk retur)

**Optional Features:**
- Print double (1 untuk customer, 1 untuk arsip)
- QR code untuk digital receipt
- Promo/ads space di bagian bawah

---

### **B. HALAMAN UNTUK ADMIN (12 Halaman)**

---

#### **B1. Dashboard Admin** ⭐

**URL**: `/admin/dashboard`

**Fitur:**

1. **Filter Global:**
   - Cabang: All Branches / Cabang 1 / Cabang 2
   - Periode: Today / Yesterday / This Week / This Month / Custom
   - Auto-reload data saat filter berubah

2. **Stats Cards (4 Cards di Top):**
   
   **Card 1: Revenue (Omzet)**
   - Total revenue periode yang dipilih
   - Comparison dengan periode sebelumnya (contoh: +12.5% ↑)
   - Color: Hijau jika naik, merah jika turun
   
   **Card 2: Transactions**
   - Jumlah transaksi
   - Comparison dengan periode sebelumnya
   - Average transaction value (ATV)
   
   **Card 3: Profit**
   - Total profit (revenue - cost)
   - Profit margin (%)
   - Color coded: >30% hijau, 20-30% kuning, <20% merah
   
   **Card 4: Alerts**
   - Jumlah alert aktif (low stock, expired, stockout prediction)
   - Click card → redirect ke ML Predictions page
   - Badge merah jika ada urgent alerts

3. **Revenue Chart:**
   - Tipe: Line chart (trend naik/turun)
   - X-axis: Tanggal (7-30 hari terakhir, tergantung filter)
   - Y-axis: Revenue (Rupiah)
   - Tooltip: Hover show exact value
   - Bisa toggle: Revenue / Profit / Transactions

4. **Sales by Category (Pie Chart):**
   - Breakdown revenue per kategori produk
   - Contoh: Food 45%, Grocery 30%, Beverage 15%, Other 10%
   - Click slice → filter top products by category

5. **Top 5 Products (Table):**
   - Columns: Rank / Product Name / Sold Qty / Revenue / Profit
   - Sortable by: Revenue / Profit / Quantity
   - Link ke detail produk (klik nama)

6. **Recent Transactions (List):**
   - 10 transaksi terbaru
   - Tampilkan: Time / TRX ID / Items / Total / Kasir
   - Button [View All] → redirect ke Transaction History admin

---

#### **B2. Product Management**

**URL**: `/admin/products`

**Fitur:**

1. **Top Actions:**
   - Button [+ Add Product]: Buka form tambah produk baru
   - Button [Import CSV]: Upload file CSV (batch import)
   - Button [Print Barcodes]: Generate & print barcodes untuk selected products
   - Button [Export]: Download Excel list semua produk

2. **Filter & Search:**
   - Search bar: Cari by nama / SKU / barcode
   - Dropdown Category: All / Food / Grocery / Beverage / etc
   - Dropdown Stock Status: All / Available / Low Stock / Out of Stock
   - Dropdown Branch: All / Cabang 1 / Cabang 2

3. **Product List (Table atau Cards):**
   
   **Tampilkan per produk:**
   - Checkbox (untuk bulk actions)
   - Product image (thumbnail)
   - Product name (bold)
   - SKU & Barcode number
   - Category
   - Purchase price → Selling price (profit: Rp XXX)
   - Total stock (gabungan semua cabang)
   - Status badge (Available / Low / Out)
   
   **Actions per row:**
   - Button [View]: Detail produk (modal atau page)
   - Button [Edit]: Edit info produk
   - Button [Delete]: Soft delete (konfirmasi popup)

4. **Bulk Actions:**
   - Checkbox select multiple products
   - Actions: Delete / Print Barcodes / Update Category / Export Selected

5. **Pagination:**
   - 20 produk per page
   - Pagination controls: Previous / 1 2 3 / Next

---

#### **B3. Add/Edit Product Form**

**URL**: `/admin/products/add` atau `/admin/products/edit/:id`

**Fitur:**

**Section 1: Basic Info**

1. Product Name (required)
2. SKU (auto-generate dengan format SKU-XXXXXX, bisa manual edit)
3. Barcode (auto-generate EAN-13, bisa manual input)
   - Preview barcode image setelah generate
   - Button [Download Barcode Image]
4. Category (dropdown, ada button [+ Add New Category])
5. Supplier (dropdown, optional)
6. Description (textarea, optional)

**Section 2: Pricing**

1. Purchase Price (harga beli dari supplier) - required
2. Selling Price (harga jual) - required
3. Profit Margin (auto-calculate: (Selling - Purchase) / Purchase × 100%)
   - Display: 40% (Rp 1,000 per item)
   - Warning jika margin < 10% (mungkin salah input)

**Section 3: Inventory**

1. Initial Stock (hanya saat add, tidak ada di edit)
2. Unit (dropdown: pcs / box / kg / liter / dll)
3. Min Stock Alert (threshold untuk warning low stock)
4. Enable stock tracking (checkbox)
   - Jika unchecked: Produk tidak bisa habis (contoh: service/jasa)

**Section 4: Additional Info**

1. Checkbox: Has Expiry Date
   - Jika checked: Tampil field Expiry Date
   - Format: DD/MM/YYYY atau date picker
2. Checkbox: Has Variants (Size, Color, dll)
   - Jika checked: Tampil form untuk add variants
   - Variant: Name, SKU, Barcode, Price modifier
3. Upload Image (max 2MB, format: jpg/png)
   - Preview image setelah upload
   - Button [Change Image] / [Remove Image]

**Section 5: Assign to Branches** (Multi-branch support)

1. List semua cabang (checkbox)
2. Per cabang yang dicentang: Input initial stock
   - Contoh:
     - ☑ Cabang 1: Stock 50 pcs
     - ☑ Cabang 2: Stock 30 pcs
     - ☐ Cabang 3: (tidak dijual di cabang ini)

**Bottom Actions:**

- Button [Cancel]: Kembali ke products list (konfirmasi jika ada unsaved changes)
- Button [Save Draft]: Simpan tapi belum publish (status: draft)
- Button [Publish]: Simpan dan langsung aktif di POS

**Validations:**

- Required fields harus diisi (red border + error message)
- Selling price harus > Purchase price (warning jika tidak)
- Stock alert harus > 0
- Image size max 2MB

---

#### **B4. Inventory Management**

**URL**: `/admin/inventory`

**Fitur:**

1. **Filter Branch:**
   - Dropdown: All Branches / Cabang 1 / Cabang 2
   - Default: All Branches (tampilkan gabungan)

2. **Alert Summary Box (Top):**
   - Badge count:
     - 🚨 Low Stock: 12 items
     - ⏰ Expiring Soon: 5 items (< 30 hari sebelum expired)
     - ❌ Out of Stock: 3 items
   - Click badge → filter tabel by status

3. **Quick Actions:**
   - Button [+ Stock IN]: Tambah stok (dari supplier/purchase)
   - Button [- Stock OUT]: Kurangi stok (rusak, hilang, used for promo)
   - Button [↔️ Transfer]: Transfer stok antar cabang
   - Button [📋 Stock Opname]: Physical count (audit stok)

4. **Stock Table:**
   
   **Jika view: All Branches**
   - Columns: Product Name / Cabang 1 Stock / Cabang 2 Stock / Total Stock / Status
   - Status: Aggregate (jika salah satu cabang low/out, flag warning)
   
   **Jika view: Single Branch**
   - Columns: Product / SKU / Current Stock / Min Alert / Expiry Date / Status / Actions
   - Actions: [+ IN] [- OUT] [↔️ Transfer]

5. **Status Indicators:**
   - ✅ Available (hijau): Stock > min alert di semua cabang
   - ⚠️ Low Stock (kuning): Stock ≤ min alert di salah satu cabang
   - ❌ Out of Stock (merah): Stock = 0 di salah satu cabang
   - ⏰ Expiring (orange): Ada batch yang akan expired < 30 hari

6. **Batch Management** (untuk produk dengan expiry date):
   - Expand row → tampilkan list batches
   - Setiap batch: Batch ID / Qty / Expiry Date / Actions
   - FIFO suggestion: Batch dengan expiry paling dekat didahulukan (highlight)

---

#### **B5. Stock IN Form**

**URL**: `/admin/inventory/stock-in`

**Fitur:**

1. **Transaction Info:**
   - Transaction Type: Purchase from Supplier / Return from Customer / Adjustment / Other
   - Reference Number (PO number, invoice number, dll) - optional
   - Date (default: today)
   - Branch (dropdown wajib)

2. **Supplier Info** (jika type = Purchase):
   - Dropdown supplier
   - Invoice number
   - Invoice date

3. **Products:**
   - Button [+ Add Product]
   - List produk yang ditambahkan:
     - Product name (search dropdown)
     - Quantity
     - Unit
     - Purchase price (per unit) - bisa beda dari default untuk adjustment
     - Expiry date (jika produk punya expiry)
     - Subtotal (auto-calculate)
   - Button [Remove] per item

4. **Summary:**
   - Total items
   - Total cost
   - Notes (textarea, optional)

5. **Actions:**
   - Button [Save & Print]: Simpan dan print receipt stock IN
   - Button [Save]: Simpan saja
   - Button [Cancel]

**After Save:**
- Stok otomatis bertambah di database
- Generate stock movement record (untuk audit trail)
- Redirect ke Inventory page
- Success message: "Stock IN berhasil. 50 pcs Indomie ditambahkan ke Cabang 1"

---

#### **B6. Stock OUT Form**

**URL**: `/admin/inventory/stock-out`

**Fitur:**

Mirip Stock IN, tapi:

1. **Transaction Type:**
   - Damaged / Lost / Expired / Used for Promo / Other

2. **Products:**
   - Sama seperti Stock IN, tapi tidak ada purchase price
   - Ada reason field (wajib untuk audit)

3. **Batch Selection** (jika produk punya batch):
   - Tampilkan list batch yang tersedia
   - Kasih suggestion: Batch paling dekat dengan expiry (FIFO)
   - Warning jika pilih batch yang masih lama (bukan FIFO)

**After Save:**
- Stok otomatis berkurang
- Generate stock movement record
- Update product total stock

---

#### **B7. Stock Transfer Form**

**URL**: `/admin/inventory/transfer`

**Fitur:**

1. **Transfer Info:**
   - From Branch (dropdown)
   - To Branch (dropdown)
   - Date (default: today)
   - Reference number (optional)

2. **Products:**
   - Button [+ Add Product]
   - List:
     - Product name
     - Available stock at "From" branch (display only)
     - Transfer qty (tidak boleh > available)
     - Notes per item
   - Button [Remove]

3. **ML Recommendation** (Optional - Phase 2):
   - Jika sistem detect ada cabang bisa stockout & cabang lain surplus
   - Tampilkan suggestion card:
     - "💡 Rekomendasi: Transfer 6 btl Minyak dari Cabang B ke A"
     - "Reason: Cabang A akan stockout dalam 6 hari"
     - "Savings: Rp 510,000 (avoid lost sales)"
   - Button [Apply]: Auto-fill form

4. **Approval Workflow** (Optional):
   - Transfer > nilai tertentu (contoh: > Rp 1 juta) butuh approval
   - Status: Pending → Approved → Completed
   - Notif ke manager untuk approve

5. **Actions:**
   - Button [Submit Transfer]
   - Button [Save Draft]
   - Button [Cancel]

**After Submit:**
- Status: Pending (jika butuh approval) atau Completed (jika langsung)
- Stock at "From" branch berkurang
- Stock at "To" branch bertambah (atau pending hingga received)
- Generate 2 stock movement records (OUT from source, IN to destination)

---

#### **B8. ML Predictions Page** ⭐ THE MAGIC!

**URL**: `/admin/ml-predictions`

**Fitur:**

1. **Top Actions:**
   - Button [Refresh Predictions]: Re-run ML model (manual refresh)
   - Button [Export Report]: Download PDF/Excel summary
   - Toggle: Show All / Urgent Only

2. **Summary Cards:**
   - 🔴 Urgent: 3 items (action needed today/this week)
   - 🟡 Warning: 12 items (action needed this month)
   - 🟢 Optimal: 45 items (stok aman)

3. **Alert List (Prioritized):**

**Alert Card Structure:**

**Type 1: Stockout Prediction**

Tampilkan:
- Product name & branch
- Current stock: 45 pcs
- Predicted demand (7 days): 56 pcs
- **Stockout date**: 17 May 2026 (6 days from now) - Bold, warna merah
- Confidence level: Progress bar + percentage (87% - VERY HIGH)
  - Color coded:
    - 80-100%: Hijau (reliable)
    - 60-79%: Kuning (moderate)
    - <60%: Merah (uncertain)

Recommendation section:
- Restock quantity: 120 pcs (enough for 2 weeks)
- Order date: TODAY
- Expected profit if restock: Rp 120,000 ✅
- Risk if not restock: Lost sales Rp 56,000 ⚠️

Actions:
- Button [View Forecast]: Popup modal dengan chart 30 hari
- Button [Order Now]: Redirect ke Stock IN form (auto-fill product & qty)
- Button [Dismiss]: Hide alert (mark as handled)

---

**Type 2: Expiry Warning**

Tampilkan:
- Product name, batch ID, branch
- Qty: 12 bottles
- Expiry date: 25 May 2026 (20 days)
- Predicted sales (20d): 5 bottles
- **Risk**: 7 bottles will expire (Rp 175,000 loss)

Recommendation:
- Option 1: Discount 15% → Expected to sell 10 bottles (loss: Rp 50,000 only)
- Option 2: Transfer to Cabang B (high demand) → Sell all
- Option 3: Bundle promo (buy 2 get 1 free)

Actions:
- Button [Create Discount]: Auto-fill promo form
- Button [Transfer]: Go to transfer form
- Button [Dismiss]

---

**Type 3: Overstock Warning**

Tampilkan:
- Product name & branch
- Current stock: 200 pcs
- Average daily sales: 5 pcs
- Days of inventory: 40 days (TOO LONG)
- Capital locked: Rp 500,000

Recommendation:
- Reduce next order quantity by 50%
- Or: Transfer 100 pcs to another branch

Actions:
- Button [Adjust Order]: Set reminder untuk next order
- Button [Transfer]
- Button [Dismiss]

---

4. **Forecast Detail Modal:**

Ketika klik [View Forecast]:

Popup modal tampilkan:
- **Line chart**: 30-day demand forecast
  - X-axis: Tanggal
  - Y-axis: Quantity demand
  - Line: Predicted demand
  - Shaded area: Confidence interval (range)
  - Vertical line: Current stock akan habis (highlight date)

- **Breakdown per week:**
  - Week 1: 56 pcs (normal)
  - Week 2: 65 pcs (PEAK - UTS season) 🔥
  - Week 3: 42 pcs
  - Week 4: 35 pcs

- **Model info:**
  - Model type: Prophet Time Series / ARIMA
  - Accuracy: 87% (based on 3-month validation)
  - Last updated: 10 May 2026
  - Factors: Seasonality, trend, promotion impact

- **Actions:**
  - Button [Order Now]: Redirect ke Stock IN
  - Button [Close]

---

5. **Auto-Refresh:**
   - Predictions update setiap 24 jam (midnight)
   - Manual refresh button available
   - Show last updated timestamp

6. **Notification:**
   - Email/WhatsApp alert untuk urgent predictions
   - Notify admin saat ada new urgent alert

---

#### **B9. Transaction History (Admin)**

**URL**: `/admin/transactions`

**Fitur:**

Mirip dengan Kasir Transaction History, tapi dengan tambahan:

1. **Extra Filters:**
   - Branch: All / Cabang 1 / Cabang 2
   - Kasir: All / Bu Siti / Pak Andi / dll
   - Amount range: Min - Max

2. **Extra Columns:**
   - Branch name
   - Kasir name
   - Profit (tidak tampil di kasir view)

3. **Bulk Actions:**
   - Export selected transactions
   - Void transaction (cancel transaction)

4. **Detail View:**
   - Semua info transaksi
   - List items dengan profit per item
   - Payment info
   - Log: Created at, by whom, void (if any)

---

#### **B10. Reports**

**URL**: `/admin/reports`

**Fitur:**

Dashboard dengan berbagai report cards, klik card → detail page

**Report Types:**

1. **Financial Report:**
   - Revenue, cost, profit
   - Breakdown by: Branch / Category / Period
   - Chart: Bar chart comparison
   - Export: PDF / Excel

2. **Inventory Report:**
   - Stock level semua produk
   - Stock movement history
   - Slow-moving items (jarang laku)
   - Fast-moving items (laku keras)

3. **Product Performance:**
   - Top selling products
   - Least selling products
   - Profit margin by product
   - Product ABC analysis (Pareto 80/20)

4. **Branch Performance:**
   - Revenue per branch
   - Profit per branch
   - Best performing cabang
   - Growth comparison

5. **Cashier Performance:**
   - Total transactions per kasir
   - Average transaction value
   - Errors/voids (for quality monitoring)

**All reports:**
- Filter by date range
- Export to PDF/Excel
- Print-friendly version
- Schedule email (optional - advanced)

---

#### **B11. Branch Management**

**URL**: `/admin/branches`

**Fitur:**

1. **Branch List:**
   - Card per branch:
     - Branch name
     - Address
     - Phone
     - Status: Active / Inactive
     - Total products assigned
     - Total stock value
   - Button [Edit] [Delete]

2. **Add/Edit Branch Form:**
   - Branch name
   - Address (textarea)
   - Phone
   - Email
   - PIC (Person in Charge)
   - Status: Active / Inactive

---

#### **B12. Supplier Management**

**URL**: `/admin/suppliers`

**Fitur:**

1. **Supplier List (Table):**
   - Columns: Supplier Name / Contact / Email / Phone / Total Products / Status
   - Button [Add Supplier]
   - Actions per row: [Edit] [Delete] [View Products]

2. **Add/Edit Supplier Form:**
   - Supplier name
   - Contact person
   - Email
   - Phone
   - Address
   - Payment terms (contoh: NET 30, COD)
   - Notes

---

#### **B13. User Management**

**URL**: `/admin/users`

**Fitur:**

1. **User List:**
   - Columns: Name / Username / Role / Branch / Status / Last Login
   - Filter: Role (All / Admin / Kasir), Branch, Status (Active / Inactive)
   - Actions: [Edit] [Reset Password] [Deactivate]

2. **Add/Edit User Form:**
   - Full name
   - Username
   - Email (optional)
   - Phone
   - Role: Admin / Kasir
   - Branch assignment (jika kasir, pilih 1 cabang. Jika admin, bisa all)
   - Password (saat add, atau button reset password)
   - Status: Active / Inactive

3. **Permission Matrix** (Optional - Advanced):
   - Custom permissions per user
   - Contoh: Kasir bisa void transaction (normally cannot)

---

#### **B14. Settings**

**URL**: `/admin/settings`

**Fitur:**

**Tab 1: Business Profile**
- Store name
- Logo (upload)
- Address
- Phone / Email
- Tax rate (default: 11%)
- Currency (default: IDR)

**Tab 2: POS Settings**
- Auto-print receipt (yes/no)
- Receipt template (custom footer message)
- Payment methods (enable/disable: Cash, Card, QRIS)
- Default payment method
- Allow discount (yes/no, max %)

**Tab 3: Inventory Settings**
- Low stock threshold (global default)
- Enable batch tracking (yes/no)
- Stock alert notification (email/WhatsApp)
- Expiry alert (days before expiry to alert)

**Tab 4: ML Settings** (Phase 2)
- Enable ML predictions (yes/no)
- Prediction frequency (daily/weekly)
- Confidence threshold (show only >80% confidence)
- Auto-email report (daily/weekly)

**Tab 5: Notification**
- Email notification (enable/disable per event)
- WhatsApp notification (API integration)
- Events: Low stock, stockout prediction, expiry alert, daily report

**Tab 6: Backup & Security**
- Backup database (manual button + schedule)
- Session timeout duration
- Password policy (min length, complexity)

---

## 🔄 WORKFLOW UTAMA

### Workflow 1: Kasir Proses Transaksi

1. Kasir login
2. Masuk ke POS screen
3. Scan barcode/search product → Add to cart
4. Ulangi untuk semua items
5. Pilih payment method
6. Input cash amount (jika cash)
7. Klik [PROCESS]
8. Print struk
9. Selesai (auto-clear, siap transaksi berikutnya)

**Time target**: 2 menit untuk 1 customer dengan 5 items

---

### Workflow 2: Admin Tambah Produk Baru

1. Go to Products page
2. Klik [+ Add Product]
3. Isi nama produk
4. Klik [Auto Generate SKU & Barcode]
5. Isi category, harga beli, harga jual (profit auto-calculate)
6. Isi initial stock & min alert
7. Assign ke cabang (centang + input qty per cabang)
8. Upload foto (optional)
9. Klik [Publish]
10. Produk langsung muncul di POS kasir

**Time target**: 3-5 menit per produk

---

### Workflow 3: Admin Lihat ML Prediction & Action

1. Go to Dashboard → Ada badge "12 Alerts" di card
2. Klik badge → Redirect ke ML Predictions page
3. Lihat urgent alert (Indomie akan stockout 6 hari lagi)
4. Klik [View Forecast] → Lihat chart & detail
5. Yakin prediction akurat (confidence 87%)
6. Klik [Order Now]
7. Auto-redirect ke Stock IN form (product & qty sudah autofill)
8. Tinggal pilih supplier & save
9. Done!

**Time target**: 2-3 klik dari alert sampai action

---

### Workflow 4: Admin Transfer Stok Antar Cabang

1. Go to Inventory page
2. Klik [↔️ Transfer]
3. Pilih From: Cabang B, To: Cabang A
4. Klik [+ Add Product]
5. Pilih "Minyak 1L", qty 6 btl
6. (Optional) Lihat recommendation dari ML: "Transfer 6 btl hemat Rp 510k"
7. Klik [Apply Recommendation] (auto-fill)
8. Klik [Submit Transfer]
9. Status: Completed (stok langsung update)

**Time target**: 2-3 menit per transfer

---

## 🎯 PRIORITAS DEVELOPMENT

### Phase 1: MVP (Months 1-4) - POS Complete

**Priority 1 (Critical - Week 1-4):**
- Login & Authentication
- POS Transaction screen (kasir)
- Product management (admin)
- Basic inventory (stock IN/OUT)

**Priority 2 (Important - Week 5-8):**
- Dashboard admin
- Transaction history (kasir & admin)
- Stock check (kasir)
- Receipt print

**Priority 3 (Nice to Have - Week 9-12):**
- Reports
- Branch management
- Supplier management
- User management
- Settings

**Priority 4 (Enhancement - Week 13-16):**
- Stock transfer
- Batch tracking
- Export features
- Advanced filters

---

### Phase 2: ML Integration (Months 5-6)

**Week 17-20: Data Collection & Training**
- Collect 3 months transaction data (bisa pakai dummy atau real jika sudah live)
- Train ML models (demand forecasting, expiry prediction)
- Validate accuracy (target >85%)

**Week 21-24: ML Features**
- ML Predictions page
- Stockout alerts
- Expiry warnings
- Overstock detection
- Restock recommendations
- Auto-fill suggestions

---

## 📊 METRICS & KPI

### User Metrics:
- **Kasir**: Average transaction time < 2 minutes
- **Admin**: Time from alert to action < 3 clicks

### Business Metrics:
- Stockout reduction: >80% (vs tanpa ML)
- Expired product loss reduction: >70%
- Profit margin increase: Target 50%
- Inventory turnover: Improve by 30%

### ML Metrics:
- Prediction accuracy: >85%
- False positive rate: <15%
- Alert response rate: >90% (admin take action)

---

## 🚀 TEKNOLOGI STACK

**Backend:**
- Django 4.2+ (Python)
- PostgreSQL 14+
- Django REST Framework (API)

**Frontend:**
- React 18+
- Tailwind CSS
- Chart.js (visualizations)

**ML (Phase 2):**
- scikit-learn (classification)
- Prophet / ARIMA (time series forecasting)
- pandas, numpy (data processing)

**Deployment:**
- Backend: Railway / Heroku
- Frontend: Vercel
- Database: PostgreSQL (hosted)

---

**STATUS**: ✅ Dokumentasi Complete  
**NEXT**: Handoff dokumen ini ke UI/UX designer untuk wireframing  
**ETA Design**: 6 weeks (wireframe → mockup → prototype)
