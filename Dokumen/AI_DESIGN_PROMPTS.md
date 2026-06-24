# AI DESIGN TOOL - PROMPT TEMPLATES
## POS ML System - Complete Design Prompts

**Project:** Point of Sale with Machine Learning Demand Forecasting  
**Stack:** Django REST API + React + PostgreSQL + Tailwind CSS  
**Date:** 7 Februari 2026

---

## HOW TO USE THIS FILE

### Step 1: Copy MASTER CONTEXT PROMPT
Setiap kali memulai design halaman baru, copy **MASTER CONTEXT PROMPT** di bawah terlebih dahulu ke AI design tool untuk memberikan context project.

### Step 2: Copy SPECIFIC PAGE PROMPT
Setelah context diberikan, copy prompt halaman spesifik (contoh: LOGIN PAGE, POS TRANSACTION PAGE, dll).

### Step 3: Iterate & Refine
Jika hasil tidak sesuai, tambahkan detail spesifik atau minta revisi berdasarkan output yang dihasilkan.

---

## MASTER CONTEXT PROMPT (Copy ini SELALU untuk setiap halaman)

```
You are designing a complete Point of Sale (POS) system with Machine Learning demand forecasting for Indonesian small businesses (warung, fotocopy shops).

TECH STACK:
- Frontend: React 18+ with Vite
- Styling: Tailwind CSS 3+ (utility-first)
- Backend: Django REST Framework (JSON API)
- State: React Context API
- Routing: React Router v6
- Charts: Chart.js + react-chartjs-2
- Icons: Heroicons or Lucide React

DESIGN SYSTEM:
Colors:
- Primary Blue: #2563EB (buttons, links, active states)
- Success Green: #10B981 (success messages, positive metrics)
- Warning Yellow: #F59E0B (low stock warnings, alerts)
- Danger Red: #EF4444 (delete actions, critical alerts, expired products)
- Neutral Gray: #6B7280 (text secondary), #F3F4F6 (backgrounds), #E5E7EB (borders)

Typography:
- Font: Inter or System UI (clean, professional)
- Headings: font-semibold or font-bold
- Body: font-normal, text-sm or text-base
- Small text: text-xs (timestamps, hints)

Spacing: Tailwind default (4px increments)
Border Radius: rounded-lg (8px) for cards, rounded-md (6px) for inputs
Shadows: shadow-sm for cards, shadow-md for modals

LAYOUT PRINCIPLES:
- Responsive: Mobile-first (but desktop is primary for this app)
- Clean & minimal: White space is important
- Accessibility: Proper contrast, focus states, ARIA labels
- Fast: Optimistic UI updates, loading states, error states

USER ROLES:
1. Kasir (Cashier): Limited access, POS transaction focused
2. Admin (Owner/Manager): Full access to all features

BUSINESS CONTEXT:
- Target: Small Indonesian businesses (warung, toko fotocopy, minimarket kecil)
- Language: Indonesian (labels, buttons, messages)
- Currency: Rupiah (Rp format: Rp 15.000 or Rp 1.500.000)
- Pain points: Manual stock counting, expired products, stockouts, buying too much inventory
- Magic feature: ML predictions untuk demand forecasting (reduce waste, auto-suggest order qty)

IMPORTANT BEHAVIORS:
- All data from Django REST API (fetch/axios calls)
- Form validation before submit
- Loading states during API calls
- Error handling with user-friendly messages
- Success feedback (toast notifications)
- Confirmation dialogs for destructive actions
- Real-time stock updates (after transaction/mutation)
- Barcode scanner support (POS transaction)
```

---

## PAGE 1: LOGIN PAGE (Both Kasir & Admin)

### Prompt:

```
Design a login page for POS system.

PAGE SPECS:
- Route: /login
- Users: Both Kasir and Admin (same login page)
- Layout: Centered card on gradient background

FEATURES:
1. Full-screen gradient background (blue to purple, subtle)
2. White login card (max-w-md, centered vertically & horizontally)
3. Logo/Brand area at top (text: "POS ML System")
4. Form fields:
   - Username (text input, icon: user)
   - Password (password input, icon: lock, toggle show/hide)
   - Remember Me (checkbox, optional)
5. Primary button: "Masuk" (full width, blue, loading state)
6. Error message area (red text, above button, hidden by default)

INTERACTIONS:
- Focus state: Blue ring on inputs
- Validation: Show error if username/password empty
- Loading state: Button shows spinner + disabled
- Error state: Show red message "Username atau password salah"
- Success: Redirect to /dashboard (Admin) or /kasir (Kasir) based on role

API INTEGRATION:
- POST /api/auth/login/ { username, password }
- Response: { token, user: { id, username, role, full_name } }
- Store token in localStorage
- Store user data in React Context

RESPONSIVE:
- Mobile: Same centered card but smaller padding
- Desktop: Card stays centered, background covers full viewport

ACCESSIBILITY:
- Label for each input
- Enter key submits form
- Error message announced by screen reader

Generate: React component with Tailwind CSS, include useState for form handling, include API call logic placeholder.
```

---

## PAGE 2: KASIR - POS TRANSACTION (CRITICAL FEATURE)

### Prompt:

```
Design the main POS (Point of Sale) transaction page for cashier role. This is the MOST IMPORTANT page in the system.

PAGE SPECS:
- Route: /kasir/transaksi
- User: Kasir only
- Layout: Split screen (left: product search, right: cart/checkout)

LEFT SIDE (60% width):
1. Header:
   - Title: "Transaksi Baru"
   - Branch name badge (current branch)
   - Date & time display (real-time clock)
   
2. Search Bar:
   - Input: Search by product name, SKU, or barcode
   - Icon: magnifying glass
   - Placeholder: "Cari produk (nama/SKU) atau scan barcode..."
   - Autofocus on page load
   - Shortcuts: Alt+S to focus

3. Product Grid (search results):
   - 3-4 columns responsive grid
   - Each card:
     * Product image (thumbnail)
     * Product name (truncate if long)
     * SKU code (small text)
     * Stock badge: "Stok: 15" (green if >10, yellow if 5-10, red if <5)
     * Price: Rp 15.000 (bold)
     * "+" button (add to cart, blue, circular)
   - Empty state: "Cari produk untuk memulai transaksi"

RIGHT SIDE (40% width, fixed sidebar):
1. Cart Header:
   - Title: "Keranjang"
   - Item count badge: "3 items"
   - Clear all button (red text, confirmation dialog)

2. Cart Items List (scrollable):
   - Each item row:
     * Product name (truncate)
     * SKU (small, gray)
     * Quantity controls: [-] [5] [+] (inline, blue buttons)
     * Unit price: Rp 15.000
     * Subtotal: Rp 75.000 (bold)
     * Remove button (trash icon, red, right-aligned)
   - Empty state: "Keranjang kosong"

3. Cart Summary (sticky at bottom):
   - Subtotal: Rp 150.000
   - Diskon: Input field + % button (optional, default 0)
   - Total: Rp 150.000 (large, bold, green)
   - Payment button: "Bayar Sekarang" (large, green, full width)

INTERACTIONS:
- Click product card → Add to cart (qty 1)
- Click "+" in cart → Increase qty (max: available stock)
- Click "-" in cart → Decrease qty (min: 1, if 1 remove item with confirmation)
- Barcode scan → Auto search → Auto add to cart if 1 result
- Search → Debounced API call (300ms)
- Stock validation: Prevent adding more than available stock
- Discount: Calculate on-the-fly, show warning if >50%

MODAL - Payment Dialog (when click "Bayar Sekarang"):
- Modal overlay (dark backdrop)
- Modal content:
  * Total: Rp 150.000 (bold, large)
  * Uang Diterima: Input (auto focus, number only, format Rupiah)
  * Kembalian: Rp XX.XXX (calculated, green if > 0, red if insufficient)
  * Metode Pembayaran: Radio buttons (Cash, Debit, QRIS)
  * Actions:
    - Cancel button (gray)
    - Confirm button (green, disabled if insufficient payment)
- After confirm:
  * Loading overlay
  * API call to create transaction
  * Success: Show print receipt dialog + redirect to new transaction
  * Error: Show error message

SHORTCUTS:
- Alt+S: Focus search
- Alt+C: Clear cart
- Alt+P: Open payment dialog
- Escape: Close dialogs

API INTEGRATION:
- GET /api/products/?search=xxx&branch_id=1 (search products)
- GET /api/products/:id/stock/?branch_id=1 (check real-time stock)
- POST /api/transactions/ { items: [...], discount, payment_method, total, cash_received }
- Response: { id, invoice_number, timestamp, change, ... }

RESPONSIVE:
- Desktop: Split screen as described
- Mobile: Tabbed interface (Tab 1: Products, Tab 2: Cart, floating cart badge)

PERFORMANCE:
- Virtualized list for large product catalogs (react-window or similar)
- Optimistic UI updates (instant cart add feedback)

Generate: React component with Tailwind CSS, include cart state management (useState or useReducer), include API placeholders, include keyboard shortcuts.
```

---

## PAGE 3: KASIR - Stock Check

### Prompt:

```
Design a quick stock check page for cashier role.

PAGE SPECS:
- Route: /kasir/stok
- User: Kasir only
- Purpose: Quick lookup for stock availability (read-only, no editing)

LAYOUT:
1. Header:
   - Title: "Cek Stok Produk"
   - Branch badge: Current branch
   - Back button: → Transaksi

2. Search Bar:
   - Input: Search by name or SKU
   - Real-time search (debounced)
   - Clear button

3. Product List:
   - Table or card list
   - Columns:
     * Product name + image (small thumbnail)
     * SKU
     * Category badge
     * Stock quantity (with color indicator)
     * Location/Rack (if available)
   - Sort by: Name, Stock (low to high), Category

4. Stock Status Indicators:
   - Green badge: "Stok Aman" (>20)
   - Yellow badge: "Stok Sedikit" (5-20)
   - Red badge: "Stok Habis/Kritis" (<5)

INTERACTIONS:
- Click row → Show detail modal (product info, batch details if any)
- Filter by category (dropdown)
- Filter by stock status (buttons: All, Aman, Sedikit, Habis)

API:
- GET /api/products/stock/?branch_id=1&search=xxx

Generate: React component with Tailwind CSS, table with search and filters.
```

---

## PAGE 4: KASIR - Transaction History (Kasir View)

### Prompt:

```
Design transaction history page for cashier role (view their own transactions only).

PAGE SPECS:
- Route: /kasir/riwayat
- User: Kasir only
- Purpose: View completed transactions from their shift

LAYOUT:
1. Header:
   - Title: "Riwayat Transaksi"
   - Date range filter: Today | This Week | Custom
   - Total sales badge: "Total: Rp 1.500.000"

2. Transaction List:
   - Card-based design (stack vertically)
   - Each card:
     * Invoice number: #INV-2026-001
     * Timestamp: 7 Feb 2026, 14:30
     * Item count: "3 items"
     * Total: Rp 150.000
     * Payment method badge: Cash | Debit | QRIS
     * View detail button

3. Empty state: "Belum ada transaksi hari ini"

DETAIL MODAL (click view detail):
- Invoice number (header)
- Timestamp
- Table: Product | Qty | Price | Subtotal
- Subtotal, Discount, Total
- Payment: Method, Cash received, Change
- Print button (call print API)

API:
- GET /api/transactions/?user_id=xxx&date_from=xxx&date_to=xxx

Generate: React component with Tailwind CSS, card list with modal detail.
```

---

## PAGE 5: KASIR - Profile

### Prompt:

```
Design simple profile page for cashier role.

PAGE SPECS:
- Route: /kasir/profil
- User: Kasir only
- Purpose: View own info, change password, logout

LAYOUT:
1. Profile Card:
   - Avatar placeholder (initials)
   - Full name
   - Username
   - Role badge: "Kasir"
   - Branch assignment

2. Actions:
   - Change password button (opens modal)
   - Logout button (red, confirmation)

CHANGE PASSWORD MODAL:
- Current password input
- New password input
- Confirm password input
- Validation: Min 8 chars, must match
- Save button

API:
- GET /api/users/me/
- PUT /api/users/me/change-password/ { old_password, new_password }

Generate: React component with Tailwind CSS.
```

---

## PAGE 6: ADMIN - Dashboard (Main Overview)

### Prompt:

```
Design main admin dashboard with key metrics and charts.

PAGE SPECS:
- Route: /admin/dashboard
- User: Admin only
- Purpose: Overview of business performance

LAYOUT:
1. Header:
   - Title: "Dashboard"
   - Branch selector (if multiple branches)
   - Date range filter: Hari Ini | Minggu Ini | Bulan Ini | Custom

2. Metrics Cards (4 cards, horizontal row):
   - Card 1: Total Penjualan
     * Value: Rp 15.000.000
     * Trend: +12% vs last period (green arrow up)
     * Icon: Currency/Dollar icon
   - Card 2: Transaksi Hari Ini
     * Value: 45 transaksi
     * Trend: +5 vs yesterday
     * Icon: Chart/Analytics icon
   - Card 3: Produk Hampir Habis
     * Value: 12 produk
     * Status: Warning (yellow)
     * Icon: Alert/Warning icon
   - Card 4: Produk Expired/Kadaluarsa
     * Value: 3 produk
     * Status: Critical (red)
     * Icon: Calendar/Expiry icon

3. Charts Section (2 columns):
   - Left: Sales Chart (Line chart)
     * Title: "Penjualan 7 Hari Terakhir"
     * X-axis: Dates
     * Y-axis: Rupiah
     * Tooltip: Show date + value
   - Right: Top Products (Bar chart horizontal)
     * Title: "Produk Terlaris"
     * X-axis: Quantity sold
     * Y-axis: Product names
     * Colors: Blue bars

4. Recent Activity (Bottom section):
   - Table: Recent transactions
   - Columns: Invoice | Time | Items | Total | Cashier
   - Show 10 latest
   - View all button → /admin/laporan/penjualan

INTERACTIONS:
- Click metric card → Navigate to related page
- Hover card → Show more details
- Date range → Reload all data

API:
- GET /api/dashboard/metrics/?date_from=xxx&date_to=xxx
- GET /api/dashboard/sales-chart/?days=7
- GET /api/dashboard/top-products/?limit=5
- GET /api/transactions/?limit=10&sort=-created_at

Generate: React component with Tailwind CSS, Chart.js integration, responsive grid layout.
```

---

## PAGE 7: ADMIN - ML Predictions (Magic Feature!)

### Prompt:

```
Design the Machine Learning demand forecasting page (THIS IS THE STAR FEATURE).

PAGE SPECS:
- Route: /admin/prediksi
- User: Admin only
- Purpose: View ML-generated demand predictions, get order suggestions

LAYOUT:
1. Header:
   - Title: "Prediksi Permintaan (AI)"
   - Subtitle: "Prediksi otomatis untuk 7 hari ke depan"
   - Info badge: "Data diupdate setiap hari pukul 01:00"
   - Refresh button (manual trigger ML)

2. Summary Cards (3 cards):
   - Card 1: Akurasi Model
     * Value: 92% (gauge chart or progress bar)
     * Status: "Sangat Baik" (green)
   - Card 2: Produk Perlu Diorder
     * Value: 15 produk
     * Icon: Package/Box icon
   - Card 3: Potensi Penghematan
     * Value: Rp 500.000/bulan
     * Info: From reduced waste + stockouts

3. Main Table: Product Predictions
   - Sortable, filterable table
   - Columns:
     * Product Name + Image
     * Stok Saat Ini (current stock, with color badge)
     * Prediksi 7 Hari (predicted demand for next 7 days)
     * Rekomendasi Order (suggested order qty, bold, green)
     * Confidence Score: 92% (progress bar)
     * Action: "Order" button (green, opens order modal)
   
4. Filters:
   - Category dropdown
   - Confidence threshold slider (show only >80%)
   - Sort: By demand (high to low), by confidence, by product name

5. Chart Section (below table):
   - Title: "Tren Permintaan vs Aktual"
   - Multi-line chart:
     * Blue line: Actual historical demand (past 30 days)
     * Orange dashed line: ML predicted demand (past 30 days, for validation)
     * Green dashed line: Future prediction (next 7 days)
   - Legend with labels
   - Tooltip: Date + values

ORDER MODAL (when click "Order" button):
- Product info: Name, current stock
- Predicted demand: 50 units
- Recommended order: 60 units (with explanation: "+10 safety stock")
- Manual override: Input field (editable)
- Supplier dropdown: Select supplier
- Expected delivery date: Date picker
- Confirm button: "Buat Purchase Order"

INTERACTIONS:
- Click row → Show detail (historical sales chart for that product)
- Hover confidence score → Show tooltip explaining the score
- Refresh button → Trigger ML re-training (loading state, takes 30-60 seconds)
- Order button → Open modal → Create purchase order

ALERTS:
- Low confidence warning: "Prediksi untuk produk ini kurang akurat (<70%). Periksa stok manual."
- High demand alert: "Produk ini diprediksi laris! Order segera untuk hindari kehabisan stok."

API:
- GET /api/ml/predictions/ (all products with predictions)
- GET /api/ml/accuracy/ (model metrics)
- POST /api/ml/retrain/ (trigger manual retraining)
- GET /api/ml/product/:id/history/ (historical demand for chart)
- POST /api/orders/ (create purchase order from recommendation)

Generate: React component with Tailwind CSS, table with sorting/filtering, Chart.js for trend chart, modal with form.
```

---

## PAGE 8: ADMIN - Product Management

### Prompt:

```
Design product management page with CRUD operations.

PAGE SPECS:
- Route: /admin/produk
- User: Admin only
- Purpose: Manage product catalog

LAYOUT:
1. Header:
   - Title: "Manajemen Produk"
   - Add Product button (blue, right side, icon: +)
   - Search bar (left side)

2. Filters & Sort:
   - Category dropdown filter
   - Status filter: All | Active | Inactive
   - Sort by: Name | Price | Stock | Created Date

3. Product Table/Grid:
   - Toggle view: Table | Grid (icons)
   
   TABLE VIEW:
   - Columns:
     * Image (thumbnail, 40x40px)
     * Nama Produk + SKU (stacked)
     * Kategori (badge)
     * Harga Jual (Rp format)
     * Margin (percentage, green)
     * Stok Total (across all branches, color badge)
     * Status (toggle switch: Active/Inactive)
     * Actions: Edit | Delete (icons)
   
   GRID VIEW (4 columns):
   - Each card:
     * Product image (square, cover)
     * Product name (truncate)
     * Price (bold)
     * Stock badge
     * Edit button (overlay on hover)

4. Pagination: Previous | 1 2 3 ... 10 | Next

ADD/EDIT PRODUCT MODAL:
- Full-screen modal or slide-over panel
- Form sections:
  
  1. Basic Info:
     - Product Name (required)
     - SKU (auto-generated or manual)
     - Category (dropdown, with "Add New" option)
     - Description (textarea)
  
  2. Pricing:
     - Harga Modal (purchase price)
     - Harga Jual (selling price)
     - Margin (calculated auto, show %)
  
  3. Image:
     - Upload image (drag & drop or click)
     - Preview thumbnail
  
  4. Stock Management:
     - Enable batch tracking? (toggle)
     - Enable expiry tracking? (toggle)
     - Min stock level (for low stock alert)
  
  5. Supplier (optional):
     - Supplier dropdown
  
- Actions: Cancel | Save (blue button)

DELETE CONFIRMATION:
- Modal: "Hapus produk '[Nama Produk]'?"
- Warning: "Stok dan riwayat transaksi akan tetap tersimpan."
- Cancel | Confirm (red)

INTERACTIONS:
- Click Add → Open modal (empty form)
- Click Edit → Open modal (pre-filled)
- Toggle Active/Inactive → API call (instant feedback)
- Search → Debounced API call
- Filter/Sort → Reload table

API:
- GET /api/products/ (with pagination, search, filters)
- POST /api/products/ (create)
- PUT /api/products/:id/ (update)
- DELETE /api/products/:id/ (soft delete)
- GET /api/categories/ (for dropdown)
- POST /api/products/:id/upload-image/ (image upload)

Generate: React component with Tailwind CSS, table with actions, modal form with validation, toggle view.
```

---

## PAGE 9: ADMIN - Inventory Management

### Prompt:

```
Design inventory/stock management page with multi-branch support.

PAGE SPECS:
- Route: /admin/inventori
- User: Admin only
- Purpose: View and manage stock across branches

LAYOUT:
1. Header:
   - Title: "Manajemen Inventori"
   - Branch selector: All Branches | Branch A | Branch B
   - Actions: Stock Opname | Transfer Stok | Penyesuaian Stok

2. Stock Overview Cards (3 cards):
   - Total Items: 250 produk
   - Total Stock Value: Rp 15.000.000
   - Low Stock Items: 12 produk (warning, yellow)

3. Main Table:
   - Columns:
     * Product Name + SKU
     * Category
     * Branch (if "All Branches" selected)
     * Quantity (with color badge)
     * Batch Info (if tracked): "3 batches, oldest expires 15 Feb"
     * Last Updated (timestamp)
     * Actions: View Detail | Adjust | Transfer
   
4. Filters:
   - Stock status: All | Normal | Low Stock | Out of Stock
   - Has expiry: All | Expiring Soon (<30 days) | Expired
   - Category filter

DETAIL MODAL (Click "View Detail"):
- Product info header
- Tabs:
  1. Stock by Branch:
     - Table: Branch | Qty | Last Updated
  2. Batch Details (if batch tracking enabled):
     - Table: Batch Code | Qty | Purchase Date | Expiry Date | Status
     - Expired batches highlighted in red
  3. Stock Movement History:
     - Table: Date | Type (In/Out/Transfer/Adjust) | Qty | User | Notes
     - Last 50 movements

TRANSFER STOCK MODAL:
- Product selector (autocomplete)
- From Branch (dropdown)
- To Branch (dropdown)
- Quantity (number input, max: available stock)
- Notes (textarea)
- Confirm button

ADJUST STOCK MODAL:
- Product selector
- Branch selector
- Current Stock: 50 (display only)
- Adjustment Type: Add | Subtract | Set
- Quantity: Input
- Reason: Dropdown (Damaged | Expired | Lost | Count Error | Other)
- Notes: Textarea
- Confirm button (with confirmation dialog)

API:
- GET /api/inventory/?branch_id=xxx&status=xxx
- GET /api/inventory/product/:id/ (detail with branches + batches)
- POST /api/inventory/transfer/ { product_id, from_branch, to_branch, qty, notes }
- POST /api/inventory/adjust/ { product_id, branch_id, type, qty, reason, notes }
- GET /api/inventory/movements/?product_id=xxx (history)

Generate: React component with Tailwind CSS, table with filters, multiple modals for actions.
```

---

## PAGE 10: ADMIN - Sales Report

### Prompt:

```
Design comprehensive sales report page with charts and exports.

PAGE SPECS:
- Route: /admin/laporan/penjualan
- User: Admin only
- Purpose: View detailed sales analytics

LAYOUT:
1. Header:
   - Title: "Laporan Penjualan"
   - Date Range Picker: From - To (default: This Month)
   - Export button: Download CSV | Download PDF

2. Summary Cards (4 cards, horizontal):
   - Total Penjualan: Rp 15.000.000 (+12% vs previous period)
   - Total Transaksi: 450 (+5%)
   - Avg Transaction Value: Rp 33.333
   - Top Product: "Produk A" (image + name)

3. Charts Section (2 rows):
   
   Row 1 (2 charts side by side):
   - Chart 1: Daily Sales (Line chart)
     * X: Dates
     * Y: Sales (Rupiah)
     * Color: Blue line
   - Chart 2: Sales by Category (Pie chart)
     * Categories with different colors
     * Percentage labels
   
   Row 2 (1 full-width chart):
   - Chart 3: Sales by Hour (Bar chart)
     * X: Hours (00:00 - 23:00)
     * Y: Number of transactions
     * Color: Blue bars
     * Insight: Peak hours highlighted

4. Detailed Transaction Table:
   - Title: "Detail Transaksi"
   - Columns:
     * Invoice Number
     * Timestamp
     * Cashier Name
     * Items (count)
     * Total (Rp)
     * Payment Method (badge)
     * Actions: View Detail
   - Pagination: 50 per page
   - Search by invoice number

5. Filters (sidebar or top):
   - Branch (if multi-branch)
   - Cashier (dropdown, show all users)
   - Payment Method: All | Cash | Debit | QRIS
   - Min/Max amount range

DETAIL MODAL (Click "View Detail"):
- Invoice number (header)
- Full transaction details:
  * Date & time
  * Cashier name
  * Branch
  * Items table: Product | Qty | Price | Subtotal
  * Subtotal, Discount, Total
  * Payment: Method, Received, Change
- Print button

EXPORT:
- CSV: All transactions in date range
- PDF: Summary report with charts + transaction table

API:
- GET /api/reports/sales/?date_from=xxx&date_to=xxx&branch_id=xxx
- GET /api/reports/sales/summary/ (for cards + charts)
- GET /api/reports/sales/export/?format=csv|pdf

Generate: React component with Tailwind CSS, multiple Chart.js charts, table with search/filter, export buttons.
```

---

## PAGE 11: ADMIN - Inventory Report

### Prompt:

```
Design inventory report page focusing on stock movements and waste.

PAGE SPECS:
- Route: /admin/laporan/inventori
- User: Admin only
- Purpose: Track stock movements, identify waste/losses

LAYOUT:
1. Header:
   - Title: "Laporan Inventori"
   - Date Range Picker
   - Export CSV button

2. Summary Cards (5 cards):
   - Stock In: 500 units (green)
   - Stock Out: 450 units (blue)
   - Transferred: 30 units (orange)
   - Damaged/Lost: 15 units (red)
   - Expired Products: 5 units (dark red)

3. Stock Movement Chart (Line chart):
   - Title: "Pergerakan Stok"
   - Multiple lines:
     * Green: Stock In
     * Blue: Stock Out
     * Orange: Transfers
     * Red: Waste (damaged + expired)
   - X: Dates
   - Y: Units

4. Waste Analysis Table:
   - Title: "Analisis Kerugian"
   - Columns:
     * Product Name
     * Category
     * Quantity Lost
     * Value Lost (Rp, calculated from purchase price)
     * Reason (Expired | Damaged | Lost)
     * Date
   - Sort by value (highest loss first)
   - Total loss footer: Rp 500.000

5. Stock Valuation:
   - Current total stock value: Rp 15.000.000
   - Breakdown by category (table or chart)

API:
- GET /api/reports/inventory/movements/?date_from=xxx&date_to=xxx
- GET /api/reports/inventory/waste/
- GET /api/reports/inventory/valuation/

Generate: React component with Tailwind CSS, Chart.js, tables with sorting.
```

---

## PAGE 12: ADMIN - User Management (Cashiers)

### Prompt:

```
Design user management page for managing cashier accounts.

PAGE SPECS:
- Route: /admin/pengguna
- User: Admin only
- Purpose: Create and manage cashier accounts

LAYOUT:
1. Header:
   - Title: "Manajemen Pengguna"
   - Add User button (blue, right side)

2. User Table:
   - Columns:
     * Avatar (initials)
     * Full Name
     * Username
     * Role (badge: Admin | Kasir)
     * Branch Assignment
     * Status (toggle: Active | Inactive)
     * Last Login (timestamp)
     * Actions: Edit | Delete

3. Active Users Badge:
   - "5 pengguna aktif"

ADD/EDIT USER MODAL:
- Form fields:
  * Full Name (required)
  * Username (required, unique)
  * Password (required for new, optional for edit)
  * Confirm Password
  * Role: Radio buttons (Admin | Kasir)
  * Branch Assignment: Dropdown (required for Kasir)
  * Status: Toggle (Active by default)
- Cancel | Save

DELETE CONFIRMATION:
- Modal: "Hapus pengguna '[Nama]'?"
- Warning: "Riwayat transaksi pengguna ini tetap tersimpan."
- Cancel | Confirm (red)

API:
- GET /api/users/
- POST /api/users/ (create)
- PUT /api/users/:id/ (update)
- DELETE /api/users/:id/ (soft delete)

Generate: React component with Tailwind CSS, table with actions, modal form.
```

---

## PAGE 13: ADMIN - Branch Management

### Prompt:

```
Design branch/outlet management page (for multi-location businesses).

PAGE SPECS:
- Route: /admin/cabang
- User: Admin only
- Purpose: Manage multiple store locations

LAYOUT:
1. Header:
   - Title: "Manajemen Cabang"
   - Add Branch button

2. Branch Cards (Grid layout, 2-3 columns):
   - Each card:
     * Branch Name (bold)
     * Address (2 lines max)
     * Phone number
     * Manager name (if assigned)
     * Total products: 150 items
     * Total stock value: Rp 5.000.000
     * Status badge: Active | Inactive
     * Actions: Edit | Delete | View Stock

ADD/EDIT BRANCH MODAL:
- Branch Name
- Address (textarea)
- Phone
- Manager (user dropdown, Kasir role)
- Status toggle
- Cancel | Save

API:
- GET /api/branches/
- POST /api/branches/
- PUT /api/branches/:id/
- DELETE /api/branches/:id/

Generate: React component with Tailwind CSS, card grid, modal form.
```

---

## PAGE 14: ADMIN - Supplier Management

### Prompt:

```
Design supplier management page.

PAGE SPECS:
- Route: /admin/supplier
- User: Admin only
- Purpose: Manage supplier contacts and track purchase orders

LAYOUT:
1. Header:
   - Title: "Manajemen Supplier"
   - Add Supplier button

2. Supplier Table:
   - Columns:
     * Supplier Name
     * Contact Person
     * Phone
     * Email
     * Address (truncate)
     * Total Orders (count)
     * Last Order Date
     * Status (Active/Inactive toggle)
     * Actions: Edit | Delete | View Orders

ADD/EDIT SUPPLIER MODAL:
- Supplier Name
- Contact Person
- Phone
- Email
- Address (textarea)
- Status toggle
- Cancel | Save

VIEW ORDERS (Detail Modal):
- Supplier info header
- Purchase orders table:
  * PO Number
  * Date
  * Products (count)
  * Total Value
  * Status (Pending | Received)

API:
- GET /api/suppliers/
- POST /api/suppliers/
- PUT /api/suppliers/:id/
- DELETE /api/suppliers/:id/
- GET /api/orders/?supplier_id=xxx

Generate: React component with Tailwind CSS, table with actions, modal form.
```

---

## PAGE 15: ADMIN - Purchase Orders

### Prompt:

```
Design purchase order management page (order from suppliers).

PAGE SPECS:
- Route: /admin/purchase-orders
- User: Admin only
- Purpose: Create and track purchase orders

LAYOUT:
1. Header:
   - Title: "Purchase Order"
   - Add PO button

2. Status Tabs:
   - All | Pending | Received | Cancelled
   - Badge count for each

3. PO Table:
   - Columns:
     * PO Number
     * Date Created
     * Supplier Name
     * Products (count)
     * Total Value (Rp)
     * Expected Delivery Date
     * Status (badge)
     * Actions: View | Mark Received | Cancel

CREATE PO MODAL:
- Supplier dropdown
- Expected delivery date picker
- Product line items:
  * Product selector (autocomplete)
  * Quantity input
  * Purchase price input
  * Subtotal (calculated)
  * Remove button
- Add Product button
- Total (calculated)
- Notes (textarea)
- Create button

RECEIVE PO MODAL:
- PO details
- For each product:
  * Expected qty
  * Received qty (input, editable)
  * Note (if partial receive)
- If batch tracking:
  * Batch code input
  * Expiry date picker
- Confirm receive button

API:
- GET /api/orders/
- POST /api/orders/ (create PO)
- PUT /api/orders/:id/receive/ (mark received, add stock)
- PUT /api/orders/:id/cancel/

Generate: React component with Tailwind CSS, tabbed interface, table, multi-step modal form.
```

---

## PAGE 16: ADMIN - Settings

### Prompt:

```
Design system settings page (configurations).

PAGE SPECS:
- Route: /admin/pengaturan
- User: Admin only
- Purpose: Configure system-wide settings

LAYOUT:
Sections (vertical stack or tabs):

1. General Settings:
   - Business Name (input)
   - Currency (dropdown: IDR)
   - Tax Rate (input, percentage)
   - Low Stock Threshold (input, default: 5)

2. Receipt Settings:
   - Print logo (upload image)
   - Footer text (textarea)
   - Show cashier name (toggle)

3. Notification Settings:
   - Email alerts for low stock (toggle)
   - Email alerts for expired products (toggle)
   - Email address for alerts (input)

4. ML Settings:
   - Enable ML predictions (toggle)
   - Auto-retrain frequency: Dropdown (Daily | Weekly | Manual)
   - Minimum confidence threshold: Slider (50%-100%)

5. Security Settings:
   - Force password change every X days (input)
   - Session timeout (minutes, input)

- Save button (bottom, blue)

API:
- GET /api/settings/
- PUT /api/settings/ (update)

Generate: React component with Tailwind CSS, form sections, various input types.
```

---

## PAGE 17: ADMIN - Notifications/Alerts

### Prompt:

```
Design notifications center page.

PAGE SPECS:
- Route: /admin/notifikasi
- User: Admin only (Kasir has simpler version)
- Purpose: View system alerts and notifications

LAYOUT:
1. Header:
   - Title: "Notifikasi"
   - Mark all as read button

2. Notification List:
   - Grouped by date: Hari Ini | Kemarin | Minggu Ini
   - Each notification card:
     * Icon (based on type: warning icon, success icon, info icon)
     * Title (bold)
     * Message (2 lines max)
     * Timestamp (relative: "2 jam lalu")
     * Unread indicator (blue dot)
     * Click to dismiss or view detail

3. Notification Types:
   - Low Stock: "15 produk stok menipis"
   - Expired: "3 produk sudah kadaluarsa"
   - Order Suggestion: "ML menyarankan order 20 produk"
   - New Transaction: "Transaksi baru Rp 150.000"
   - User Activity: "Pengguna '[Nama]' login pertama kali"

4. Filters:
   - All | Unread | Low Stock | Expired | ML Predictions

API:
- GET /api/notifications/?status=unread
- PUT /api/notifications/mark-read/

Generate: React component with Tailwind CSS, grouped list, icon indicators.
```

---

## DESIGN CONSISTENCY CHECKLIST

After generating each page, verify:

[x] **Colors:**
- Primary actions: #2563EB (blue)
- Success/positive: #10B981 (green)
- Warning: #F59E0B (yellow)
- Danger/delete: #EF4444 (red)
- Neutral: #6B7280, #F3F4F6, #E5E7EB

[x] **Typography:**
- Font: Inter or system-ui
- Heading sizes: text-xl, text-2xl
- Body: text-sm, text-base

[x] **Spacing:**
- Cards: p-6 (padding 24px)
- Sections: space-y-6 (gap 24px)
- Forms: space-y-4 (gap 16px)

[x] **Components:**
- Buttons: rounded-lg, px-4 py-2, font-medium
- Input fields: rounded-md, border-gray-300, focus:ring-blue-500
- Cards: bg-white shadow-sm rounded-lg
- Badges: rounded-full px-2.5 py-0.5 text-xs

[x] **Interactions:**
- Loading states (spinner or skeleton)
- Error states (red text/border)
- Success feedback (toast notification)
- Confirmation dialogs (delete/destructive actions)
- Focus states (ring-2 ring-blue-500)

[x] **Responsive:**
- Mobile: Stack vertically, full-width cards
- Tablet: 2-column grids
- Desktop: 3-4 column grids, sidebar layouts

[x] **Accessibility:**
- Labels for all inputs
- Alt text for images
- ARIA labels for icon buttons
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader announcements

---

## COMPONENT LIBRARY (Reusable Across Pages)

Generate these reusable components first:

1. **Button** (Primary, Secondary, Danger, sizes)
2. **Input** (Text, Number, Password, with validation states)
3. **Select/Dropdown**
4. **Modal** (Generic modal wrapper)
5. **Card** (Generic card container)
6. **Badge** (Status indicators)
7. **Table** (with sorting, pagination)
8. **Loading Spinner**
9. **Toast Notification** (Success, Error, Info)
10. **Confirmation Dialog** (Yes/No actions)
11. **DatePicker** (Custom or library)
12. **Chart Wrapper** (Chart.js integration)

---

## IMPLEMENTATION ORDER (Priority)

**Phase 1 (Critical MVP):**
1. Login Page
2. POS Transaction (Kasir) - MOST IMPORTANT
3. Stock Check (Kasir)
4. Admin Dashboard

**Phase 2 (Core Features):**
5. Product Management (Admin)
6. Inventory Management (Admin)
7. Sales Report (Admin)

**Phase 3 (Advanced Features):**
8. ML Predictions (Admin) - MAGIC FEATURE
9. Purchase Orders (Admin)
10. Transaction History (Kasir)

**Phase 4 (Support Features):**
11. User Management (Admin)
12. Supplier Management (Admin)
13. Branch Management (Admin)
14. Settings (Admin)
15. Profile (Kasir)
16. Notifications (Both)
17. Inventory Report (Admin)

---

## TIPS FOR BEST RESULTS

1. **Start with Master Context**: Always copy master context first to give AI tool full project understanding.

2. **One Page at a Time**: Don't ask for multiple pages in one prompt. Quality > quantity.

3. **Iterate**: If result is not perfect, refine with specific feedback:
   - "Make the buttons larger"
   - "Add more spacing between cards"
   - "Change color scheme to match design system"

4. **Component-First**: Generate reusable components first, then use them in pages.

5. **Mobile Consideration**: Always mention "responsive design, mobile-first" even though desktop is primary.

6. **Indonesian Language**: Remind AI to use Indonesian for all labels/text.

7. **API Placeholders**: Ask AI to include commented API call locations with endpoint names.

8. **State Management**: For complex pages (POS Transaction, ML Predictions), ask AI to include useState/useReducer examples.

---

**SELAMAT MENDESAIN!**

File ini adalah panduan lengkap untuk generate desain UI yang konsisten, interaktif, dan sesuai dengan tech stack Django + React + Tailwind CSS.
