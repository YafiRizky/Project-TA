# POS System - Design Reference (Clean & Complete)

## 📋 Overview
Folder ini berisi **design reference** HTML mockup untuk sistem POS dengan design yang:
- ✅ **Clean & Familiar** - Tidak bikin pusing, mudah dipahami
- ✅ **Complete Flow** - Core features lengkap dengan flow yang jelas
- ✅ **Professional** - Design modern dan konsisten
- ✅ **Ready to Implement** - Bisa langsung dijadikan acuan React development

## 🎯 Philosophy
**"Simplicity is the ultimate sophistication"**
- Focus pada functionality, bukan overwhelm user dengan features
- Consistent design language di semua pages
- Clear visual hierarchy
- Intuitive navigation

## 📁 Structure

```
pos-system-design/
├── index.html                    # Landing + Login (clean & simple)
├── register.html                 # Business Registration (one-page form)
├── README.md                     # This file
│
├── admin/                        # Admin Dashboard (8 core pages)
│   ├── dashboard.html            # Overview dengan stats cards
│   ├── categories.html           # ⭐ Kategori CRUD
│   ├── products.html             # ⭐ Katalog/Master Produk
│   ├── suppliers.html            # Supplier management
│   ├── inventory.html            # Monitoring stok (list + batch view)
│   ├── transactions.html         # Riwayat transaksi semua kasir
│   ├── reports.html              # Laporan (harian, periode, per produk)
│   └── ml-predictions.html       # ⏳ AI Features (Coming Soon placeholder)
│
└── kasir/                        # Kasir Interface (2 focused pages)
    ├── dashboard.html            # Dashboard kasir (simplified)
    └── pos.html                  # ⭐ Transaksi POS (scan, cart, payment)
```

## 🎨 Design System

### Colors
- **Primary**: Indigo/Blue (#4F46E5) - Calm, professional
- **Success**: Green (#10B981) - Positive actions
- **Warning**: Yellow/Orange (#F59E0B) - Alerts
- **Danger**: Red (#EF4444) - Critical actions
- **Neutral**: Gray shades - Text & backgrounds

### Layout Pattern
All pages follow consistent structure:
```
┌────────────────────────────────────────────┐
│  Top Bar: Logo | Title | User Info         │
├──────────┬─────────────────────────────────┤
│          │                                 │
│ Sidebar  │  Main Content                   │
│ (256px)  │  - Header with actions          │
│          │  - Content cards/table          │
│ Menu     │  - Forms/Data display           │
│ Links    │                                 │
│          │                                 │
└──────────┴─────────────────────────────────┘
```

### Components
- **Cards**: White bg, subtle shadow, rounded corners
- **Tables**: Clean rows, hover effects, action buttons
- **Forms**: Clear labels, validation states, helpful hints
- **Buttons**: Solid primary, outline secondary, text tertiary
- **Badges**: Rounded pills for status indicators

## ⭐ Key Features Explained

### 1. Categories Management (admin/categories.html)
**Purpose**: Manage product categories (Makanan, Minuman, Elektronik, dll)

**Features**:
- Table view dengan columns: Code, Name, Description, Status
- Add/Edit modal dengan form validation
- Delete dengan confirmation
- Active/Inactive toggle
- Search & filter

**Why Important**: Foundation untuk products organization

---

### 2. Products/Katalog (admin/products.html)
**Purpose**: Master list semua produk yang dijual

**Features**:
- Full product info: Code, Name, SKU, Category, Price, Min Stock
- Filter by category, supplier, status
- Search by name atau SKU
- Quick actions: Edit, Delete, View Detail
- Status indicator: Active, Low Stock, Out of Stock

**Flow**: Setup sekali → Gunakan berkali-kali

---

### 3. Inventory (admin/inventory.html)
**Purpose**: Monitor stok real-time semua produk

**Features**:
- List semua produk dengan current stock level
- Warning indicators: Low Stock (yellow), Out of Stock (red)
- Filter: Show Low Stock Only
- Quick action: Input Stok baru
- Detail view: Stock history & movements

---

### 4. POS Transaction (kasir/pos.html)
**Purpose**: Interface utama kasir untuk melayani customer

**Features**:
- 3 Input methods:
  - Scan barcode (primary)
  - Search manual by name
  - Browse by category
- Shopping cart:
  - Add/remove items
  - Adjust quantity
  - Real-time total calculation
- Payment:
  - Cash (auto calculate change)
  - QRIS
  - Transfer Bank
  - E-Wallet
- Print receipt

**Flow**: Scan → Add to Cart → Checkout → Payment → Receipt

---

### 5. Reports (admin/reports.html)
**Purpose**: Business insights & analytics

**Features**:
- 3 Report types:
  - **Daily**: Sales hari ini
  - **Period**: custom date range
  - **Product**: per-produk performance
- Charts: Line chart (trend), Bar chart (comparison)
- Export: PDF, Excel
- Key metrics: Revenue, Transactions, Top Products

---

### 6. ML Predictions (admin/ml-predictions.html)
**Status**: ⏳ Coming Soon

**Planned Features** (displayed as placeholders):
- Stockout Prediction
- Restock Recommendation
- Expiry Risk Analysis
- Revenue Forecast
- Product Classification (Fast/Slow/Dead)

**Note**: "Fitur AI/ML akan dikembangkan dalam waktu dekat. Stay tuned!"

---

## 🚀 How to Use This Reference

### For Frontend Development:
1. Open each HTML file in browser
2. Inspect the layout structure
3. Note the component patterns
4. Copy the design language (colors, spacing, typography)
5. Implement in React with same UX flow

### For Backend API:
Each page indicates required API endpoints:
- Categories: GET, POST, PUT, DELETE `/api/products/categories/`
- Products: GET, POST, PUT, DELETE `/api/products/products/`
- etc.

### Design Tokens to Extract:
```css
/* Colors */
--primary: #4F46E5;
--success: #10B981;
--warning: #F59E0B;
--danger: #EF4444;

/* Spacing */
--spacing-xs: 0.5rem;
--spacing-sm: 1rem;
--spacing-md: 1.5rem;
--spacing-lg: 2rem;

/* Border Radius */
--radius-sm: 0.375rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
```

## 📝 Implementation Checklist

### Phase 1: Layout & Navigation ✅
- [ ] Create base layout component (TopBar + Sidebar + Main)
- [ ] Implement routing
- [ ] Add authentication guard
- [ ] Build navigation menu

### Phase 2: Core Pages (Current Focus)
- [ ] Categories CRUD ← **YOU ARE HERE**
- [ ] Products CRUD
- [ ] Suppliers CRUD
- [ ] Inventory monitoring
- [ ] POS Transaction
- [ ] Reports dashboard

### Phase 3: Polish & Features
- [ ] Search & filtering
- [ ] Pagination
- [ ] Export functionality
- [ ] Notifications
- [ ] Settings

### Phase 4: ML Integration (Later)
- [ ] ML predictions API
- [ ] Dashboard integrations
- [ ] Alerts & recommendations

## 🎯 Success Criteria

A page is "done" when it has:
1. ✅ **Functional backend API** - Tested, no errors
2. ✅ **Complete UI** - All CRUD operations accessible
3. ✅ **Good UX** - Loading states, error handling, success messages
4. ✅ **Consistent design** - Matches design system
5. ✅ **Responsive** - Works on different screen sizes
6. ✅ **Tested** - Manual testing passed

---

**Created**: March 23, 2026
**Purpose**: Design reference untuk implementasi React frontend
**Status**: Foundation template - ready for core features implementation
