# 🎨 DESIGN BRIEF: POS + ML SYSTEM
**Untuk UI/UX Designer**  
**Project**: Tugas Akhir - Sistem Point of Sale dengan Machine Learning  
**Date**: 5 Februari 2026

---

## 📌 PROJECT OVERVIEW (Gambaran Umum)

### Apa yang Kita Bikin?
**Sistem kasir pintar untuk UMKM (warung, toko fotocopy, minimarket kecil) yang punya 2 keunggulan:**

1. **Sistem POS (Point of Sale)** = Kasir digital
   - Transaksi penjualan cepat (scan barcode → bayar → print struk)
   - Manage produk & stok multi-cabang
   - Laporan otomatis (berapa omzet, profit, stok dll)

2. **Machine Learning (Kecerdasan Buatan)** = Prediksi & Rekomendasi
   - Prediksi: "Barang ini akan habis 6 hari lagi"
   - Warning: "12 botol akan expired, tidak akan laku"
   - Rekomendasi: "Transfer 6 botol dari Cabang B ke A, hemat Rp 510k"

### Kenapa Ini Penting?
UMKM sering rugi karena:
- ❌ Kehabisan stok pas ramai (kehilangan penjualan)
- ❌ Barang numpuk & expired (buang uang)
- ❌ Tidak tahu cabang mana yang untung

Sistem kita **solve masalah ini** dengan prediksi & rekomendasi otomatis.

---

## 👥 SIAPA SAJA USERNYA? (2 Role)

### **ROLE 1: KASIR (Cashier)**
**Siapa?** 
- Karyawan toko yang terima uang customer
- Contoh: Bu Siti (kasir toko fotocopy)

**Apa yang Mereka Lakukan?**
- Scan barcode produk (atau ketik manual)
- Hitung total belanja
- Terima pembayaran (cash/card/QRIS)
- Print struk
- Lihat history transaksi hari ini

**Karakteristik User:**
- 👵 Bisa usia 40-50 tahun (tidak tech-savvy)
- 📱 Pakai HP Android basic
- ⏱️ Butuh yang **CEPAT & SIMPEL** (antrian customer panjang)
- 🎯 Goal: Proses 1 customer dalam 2 menit

---

### **ROLE 2: ADMIN (Owner/Pemilik Toko)**
**Siapa?**
- Pemilik bisnis / manager
- Contoh: Pak Budi (punya 2 toko fotocopy)

**Apa yang Mereka Lakukan?**
- Input produk baru
- Cek stok semua cabang
- Transfer stok antar cabang
- Lihat laporan penjualan (harian, mingguan, bulanan)
- **Lihat prediksi ML** (barang mana yang akan habis, akan expired)
- Export laporan PDF/Excel

**Karakteristik User:**
- 👔 Usia 30-50 tahun
- 💼 Punya waktu lebih untuk analisa bisnis
- 📊 Suka data & charts (tapi harus mudah dipahami)
- 🎯 Goal: Bikin keputusan bisnis yang smart (beli stok berapa, kapan)

---

## 📱 SCREEN APA SAJA YANG PERLU DIDESIGN?

### **UNTUK KASIR (5 Screens)**

#### 1. **Login Screen**
```
┌─────────────────────────────────┐
│      [Logo POS System]          │
│                                  │
│   Username: [__________]        │
│   Password: [__________]        │
│                                  │
│       [LOGIN BUTTON]            │
│                                  │
│   Role: Kasir / Admin           │
└─────────────────────────────────┘
```
**Note**: Simpel, big button, easy to tap

---

#### 2. **POS Transaction Screen** (PALING PENTING!)
```
┌─────────────────────────────────────────────────────┐
│ LEFT: Shopping Cart              RIGHT: Payment     │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [Scan Barcode: _______] [Search]                   │
│                                  Payment Method:    │
│ ITEMS IN CART:                   [💵 CASH]         │
│ 1. Indomie x2    Rp 7,000  [×]  [💳 CARD]         │
│ 2. Minyak x1     Rp 25,000 [×]  [📱 QRIS]         │
│                                                      │
│                                  Cash: [______]     │
│ Subtotal: Rp 32,000             Quick: [50k] [100k]│
│ Tax:      Rp 3,520                                  │
│ ─────────────────────           Change: Rp 0       │
│ TOTAL:    Rp 35,520                                 │
│                                                      │
│ [Clear Cart] [Hold]             [PROCESS - BIG]    │
└─────────────────────────────────────────────────────┘
```

**Design Requirements:**
- ✅ **Touch-friendly**: Big buttons (minimum 44px × 44px)
- ✅ **Clear hierarchy**: TOTAL paling besar, menonjol
- ✅ **Color coding**: 
  - Hijau = Action button (Process, Add)
  - Merah = Delete/Remove
  - Abu = Cancel/Secondary
- ✅ **Real-time update**: Cart otomatis update saat item ditambah/hapus
- ✅ **Error handling**: Warning jika stok tidak cukup

**Inspirasi**: 
- Square POS
- Kasir Pintar
- Moka POS

---

#### 3. **Transaction History (Kasir)**
```
┌─────────────────────────────────────────────────────┐
│ 📜 TRANSACTION HISTORY                              │
├─────────────────────────────────────────────────────┤
│ Filter: [Today ▼] [All Payment ▼]                  │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 14:35   TRX-12345   3 items   Rp 95,460   Cash │ │
│ │ [View Details] [Reprint Receipt]                │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ 14:20   TRX-12344   5 items   Rp 175,000  QRIS │ │
│ │ [View Details] [Reprint Receipt]                │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ 📊 TODAY'S SUMMARY:                                 │
│ Total: 45 transactions, Rp 2,450,000               │
└─────────────────────────────────────────────────────┘
```

---

#### 4. **Stock Check (Read-Only)**
```
┌─────────────────────────────────────────────────────┐
│ 📦 STOCK CHECK - Cabang 1                           │
├─────────────────────────────────────────────────────┤
│ Search: [__________] [🔍]                           │
│                                                      │
│ Product          Stock      Status                  │
│ Indomie          100 pcs    ✅ Available            │
│ Minyak 1L        45 btl     ✅ Available            │
│ Gula 1kg         15 kg      ⚠️ Low Stock            │
│ Kertas A4        0 rim      ❌ Out of Stock         │
│                                                      │
│ Note: Hanya bisa lihat. Hubungi Admin untuk adjust │
└─────────────────────────────────────────────────────┘
```

---

#### 5. **Receipt Design (Print/Digital)**
```
┌─────────────────────────────┐
│    FOTOCOPY KAMPUS UTARA    │
│   Jl. Sudirman No. 123      │
│    Tel: 081234567890        │
│                             │
│ TRX: TRX-12345              │
│ Date: 05/02/2026 14:35      │
│ Kasir: Bu Siti              │
│────────────────────────────│
│ Indomie Goreng       x2     │
│ @Rp 3,500        Rp 7,000   │
│                             │
│ Minyak Goreng 1L     x1     │
│ @Rp 25,000      Rp 25,000   │
│────────────────────────────│
│ Subtotal:       Rp 32,000   │
│ Tax (11%):       Rp 3,520   │
│────────────────────────────│
│ TOTAL:          Rp 35,520   │
│                             │
│ CASH:           Rp 50,000   │
│ CHANGE:         Rp 14,480   │
│────────────────────────────│
│  Terima kasih sudah belanja │
│      Datang lagi ya 😊      │
└─────────────────────────────┘
```

---

### **UNTUK ADMIN (12 Screens)**

#### 6. **Dashboard Admin**
```
┌─────────────────────────────────────────────────────┐
│ 📊 DASHBOARD                                        │
├─────────────────────────────────────────────────────┤
│ Filter: [All Branches ▼] [Today ▼]                 │
│                                                      │
│ [Revenue Card]  [Transactions]  [Profit]  [Alerts] │
│ Rp 2,450,000    45 transaksi    Rp 735k   12 items│
│ +12.5% ↑        +8 ↑            30% margin ⚠️      │
│                                                      │
│ 📈 Revenue Trend (7 Days)        🥧 Sales Category │
│ [Line Chart]                      [Pie Chart]      │
│                                                      │
│ 🏆 Top 5 Products                🕐 Recent Trx     │
│ [Table]                           [List]           │
└─────────────────────────────────────────────────────┘
```

**Design Requirements:**
- ✅ **Data visualization**: Charts mudah dibaca (tidak terlalu ramai)
- ✅ **Color coding**: 
  - Hijau = Positive (↑ growth)
  - Merah = Negative (↓ drop)
  - Orange = Warning (low stock)
- ✅ **Cards**: Stats cards paling atas (hero section)
- ✅ **Responsive**: Desktop first, tapi mobile-friendly

---

#### 7. **Product Management**
```
┌─────────────────────────────────────────────────────┐
│ 📦 PRODUCTS                                         │
├─────────────────────────────────────────────────────┤
│ [+ Add Product] [Import CSV] [Print Barcodes]      │
│                                                      │
│ Search: [____] Category: [All ▼] Stock: [All ▼]    │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ☐ [img] Indomie Goreng    Food    100 pcs      │ │
│ │    SKU-001 | 8992388101053                      │ │
│ │    Rp 2,500 → Rp 3,500 (Profit: Rp 1,000)      │ │
│ │    [👁️ View] [✏️ Edit] [🗑️ Delete]              │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ ☐ [img] Minyak 1L         Grocery  45 btl      │ │
│ │    ...                                          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ [< Previous] [1] [2] [3] [Next >]                   │
└─────────────────────────────────────────────────────┘
```

---

#### 8. **Add/Edit Product Form**
```
┌─────────────────────────────────────────────────────┐
│ ➕ ADD NEW PRODUCT                                   │
├─────────────────────────────────────────────────────┤
│ Product Name*: [____________________________]       │
│ SKU: [SKU-123456] [Auto Generate]                  │
│ Barcode: [8992388101053] [Auto Generate]           │
│                                                      │
│ [Barcode Preview Image]                             │
│                                                      │
│ Category: [Food ▼] [+ New]                         │
│                                                      │
│ Purchase Price: Rp [_____]  Selling Price: Rp [___]│
│ Profit Margin: 40% (Rp 1,000) [Auto calculated]    │
│                                                      │
│ Initial Stock: [___] Unit: [pcs ▼]                 │
│ Min Stock Alert: [___]                              │
│                                                      │
│ Upload Image: [📎 Choose File] Max 2MB              │
│                                                      │
│ ☐ Has Expiry Date → [DD/MM/YYYY]                   │
│ ☐ Has Variants (Size/Color)                        │
│                                                      │
│ Assign to Branches:                                 │
│ ☑ Cabang 1 (Stock: 50)                             │
│ ☑ Cabang 2 (Stock: 30)                             │
│                                                      │
│         [Cancel] [Save Draft] [Publish]            │
└─────────────────────────────────────────────────────┘
```

**Design Requirements:**
- ✅ **Form validation**: Red border jika field wajib kosong
- ✅ **Auto-calculate**: Profit margin update real-time
- ✅ **Barcode preview**: Show barcode saat generate
- ✅ **Progress indicator**: Step 1/3 (jika multi-step form)

---

#### 9. **Inventory Management**
```
┌─────────────────────────────────────────────────────┐
│ 📦 INVENTORY                                        │
├─────────────────────────────────────────────────────┤
│ View: [All Branches ▼]                              │
│                                                      │
│ 🚨 ALERTS:                                          │
│ ⚠️ Low Stock: 12 items | ⏰ Expiring: 5 | ❌ Out: 3│
│                                                      │
│ Quick Actions: [+ Stock IN] [- Stock OUT] [↔️ Transfer]│
│                                                      │
│ 📊 STOCK BY BRANCH:                                 │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Product      Cabang 1  Cabang 2  Total  Status  │ │
│ │ Indomie      100       80        180    ✅      │ │
│ │ Minyak       45        120       165    ✅      │ │
│ │ Gula         ⚠️15      50        65     ⚠️      │ │
│ │ Kertas       ❌0       100       100    ❌      │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

#### 10. **ML Predictions Page** (THE MAGIC!)
```
┌─────────────────────────────────────────────────────┐
│ 🤖 ML PREDICTIONS & RECOMMENDATIONS                 │
├─────────────────────────────────────────────────────┤
│ [Refresh] [Export Report]                           │
│                                                      │
│ 📊 SUMMARY:                                         │
│ 🔴 Urgent: 3   🟡 Warning: 12   🟢 Optimal: 45     │
│                                                      │
│ 🚨 URGENT RESTOCK ALERTS:                           │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ⚠️ Indomie Goreng - Cabang 1                    │ │
│ │                                                  │ │
│ │ Current Stock: 45 pcs                            │ │
│ │ Predicted Demand (7d): 56 pcs                    │ │
│ │                                                  │ │
│ │ 🔴 STOCKOUT IN: 6 DAYS (17 Mei 2026)            │ │
│ │                                                  │ │
│ │ Confidence: ████████░░ 87% (VERY HIGH)          │ │
│ │                                                  │ │
│ │ 💡 RECOMMENDATION:                               │ │
│ │ • Restock Quantity: 120 pcs                     │ │
│ │ • Order Date: TODAY                              │ │
│ │ • Expected Profit: Rp 120,000 ✅                │ │
│ │ • Risk if not: Lost sales Rp 56,000 ⚠️          │ │
│ │                                                  │ │
│ │ [📊 View Forecast] [💰 Order Now] [❌ Dismiss]  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ [View More Alerts (3)]                              │
└─────────────────────────────────────────────────────┘
```

**Design Requirements (CRITICAL!):**
- ✅ **Visual hierarchy**: Urgent alerts merah, paling atas
- ✅ **Confidence bar**: Visual bar (bukan angka saja)
- ✅ **Actionable**: CTA button jelas (Order Now = hijau besar)
- ✅ **Storytelling**: Explain prediction dengan bahasa sederhana (bukan jargon ML)
- ✅ **Chart forecast**: Show trend 30 hari (line chart)

---

#### 11. **Forecast Detail Modal**
```
┌─────────────────────────────────────────────────────┐
│ 📈 DEMAND FORECAST: Indomie Goreng          [×]     │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [Line Chart: 30 Days Demand]                        │
│        /\                                            │
│       /  \___                                        │
│      /       \___                                    │
│ ━━━━━━━━━━━━━━━━━━                                   │
│  Now  W1  W2  W3  W4                                │
│                                                      │
│ Your current stock (45 pcs) will run out:           │
│ ▼ Day 6 (17 May 2026)                               │
│                                                      │
│ 📊 BREAKDOWN:                                       │
│ Week 1 (11-17 May): 56 pcs                          │
│ Week 2 (18-24 May): 65 pcs (PEAK UTS) 🔥           │
│ Week 3 (25-31 May): 42 pcs                          │
│ Week 4 (1-7 Jun): 35 pcs                            │
│                                                      │
│ Model: Prophet Time Series                          │
│ Accuracy: 87% (based on 3 months validation)        │
│ Last Updated: 10 May 2026                           │
│                                                      │
│                 [Close] [Order Now]                 │
└─────────────────────────────────────────────────────┘
```

---

#### 12-17. **Other Screens** (Simplified)
- **12. Branch Management** (List branches, add/edit)
- **13. Supplier Management** (List suppliers, CRUD)
- **14. Stock Transfer Form** (Transfer antar cabang)
- **15. Reports Page** (Financial, Inventory, Product performance)
- **16. User Management** (CRUD users, reset password)
- **17. Settings** (Business profile, tax, notifications)

---

## 🎨 DESIGN SYSTEM REQUIREMENTS

### **Color Palette**

#### Primary Colors:
- **Primary Blue**: `#3B82F6` (Buttons, links, highlights)
- **Success Green**: `#10B981` (Positive actions, profit)
- **Warning Orange**: `#F59E0B` (Alerts, low stock)
- **Danger Red**: `#EF4444` (Urgent, delete, stockout)
- **Info**: `#6366F1` (Information, neutral alerts)

#### Neutral Colors:
- **Background**: `#F9FAFB` (Page background)
- **Card Background**: `#FFFFFF`
- **Text Primary**: `#111827`
- **Text Secondary**: `#6B7280`
- **Border**: `#E5E7EB`

#### ML Prediction Colors:
- **Confidence High**: `#10B981` (Green, 80-100%)
- **Confidence Medium**: `#F59E0B` (Orange, 60-79%)
- **Confidence Low**: `#EF4444` (Red, <60%)

---

### **Typography**

#### Font Family:
- **Primary**: Inter (Google Fonts) atau SF Pro (Apple-like)
- **Monospace**: JetBrains Mono (untuk code/SKU/barcode)

#### Font Sizes:
- **H1 (Page Title)**: 32px, Bold
- **H2 (Section)**: 24px, Semi-bold
- **H3 (Card Title)**: 18px, Semi-bold
- **Body**: 16px, Regular
- **Small**: 14px, Regular
- **Caption**: 12px, Regular

#### Button Text:
- **Primary Button**: 16px, Semi-bold
- **Secondary Button**: 14px, Medium

---

### **Spacing (8px Grid System)**
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

---

### **Components**

#### Buttons:
```
Primary: Blue background, white text, 8px radius, 12px padding
Secondary: White background, blue border, blue text
Danger: Red background, white text
Success: Green background, white text

Size:
- Small: 32px height
- Medium: 40px height (default)
- Large: 48px height (POS screen)
```

#### Cards:
```
Background: White
Border: 1px solid #E5E7EB
Border Radius: 8px
Shadow: 0 1px 3px rgba(0,0,0,0.1)
Padding: 16px or 24px
```

#### Form Inputs:
```
Height: 40px
Border: 1px solid #E5E7EB
Border Radius: 8px
Padding: 8px 12px
Focus: Blue ring (2px)
Error: Red border, error message below
```

#### Tables:
```
Header: Gray background (#F9FAFB)
Border: 1px solid #E5E7EB
Row Hover: Light gray
Striped: Alternate row colors (optional)
```

---

### **Icons**
- **Library**: Font Awesome 6 atau Heroicons
- **Size**: 16px (text inline), 20px (buttons), 24px (large)
- **Style**: Outline lebih disukai, solid untuk emphasis

---

## 📐 LAYOUT & RESPONSIVENESS

### **Desktop (Primary)**
- **Minimum**: 1280px width
- **Optimal**: 1440px - 1920px
- **Sidebar**: Fixed 250px width (admin pages)
- **Content**: Fluid, max 1200px centered

### **Tablet (Optional - Nice to Have)**
- **768px - 1024px**
- Sidebar collapse jadi hamburger menu

### **Mobile (Kasir only)**
- **POS Screen harus mobile-friendly** (320px - 768px)
- Touch-friendly buttons (min 44px × 44px)
- Admin pages mobile = optional (low priority)

---

## 🚀 WORKFLOW YANG PERLU DIDESIGN

### **1. Kasir: Proses Transaksi**
```
Screen Flow:
1. Login → 2. POS Screen → 3. Add Items → 4. Payment → 5. Success + Print Receipt

Important: Step 2-4 harus bisa diselesaikan dalam 2 menit!
```

### **2. Admin: Add New Product**
```
Screen Flow:
1. Products Page → 2. Click [+ Add] → 3. Fill Form → 4. Generate Barcode → 5. Assign Stock → 6. Publish

Important: Auto-generate features (SKU, Barcode) harus clear
```

### **3. Admin: Lihat ML Prediction & Action**
```
Screen Flow:
1. Dashboard → 2. ML Predictions Page → 3. Klik Alert → 4. View Forecast Detail → 5. Click [Order Now] → 6. Stock IN form autofill

Important: Dari alert sampai action hanya 2-3 klik
```

### **4. Admin: Transfer Stock Antar Cabang**
```
Screen Flow:
1. Inventory Page → 2. Click [↔️ Transfer] → 3. Select Product, From, To, Qty → 4. Submit → 5. Wait Approval → 6. Completed

Important: Approval flow perlu visual indicator (Pending → Approved)
```

---

## ✅ DESIGN DELIVERABLES (Apa yang Harus Diserahkan?)

### **Phase 1: Wireframes** (Week 1-2)
- [ ] Low-fidelity wireframe semua screens (17 screens)
- [ ] User flow diagram (kasir & admin)
- [ ] Navigation structure
- [ ] Responsive breakpoints

**Tools**: Figma, Adobe XD, Sketch, atau Balsamiq

---

### **Phase 2: Hi-Fi Mockups** (Week 3-4)
- [ ] High-fidelity mockup dengan design system
- [ ] All screens dengan real content (not lorem ipsum)
- [ ] Interactive states (hover, active, disabled, error)
- [ ] Mobile version (untuk POS screen)

**Priority Screens** (buat dulu):
1. ⭐ POS Transaction (kasir) - MOST IMPORTANT
2. ⭐ Dashboard Admin
3. ⭐ ML Predictions Page
4. Product Management
5. Inventory Management
6. Sisanya (reports, settings, dll)

---

### **Phase 3: Prototype** (Week 5-6)
- [ ] Interactive prototype di Figma
- [ ] Demo user flow (click-through)
- [ ] Transitions & animations (subtle, not distracting)

---

### **Phase 4: Handoff to Developer** (Week 6)
- [ ] Export assets (icons, images, logo)
- [ ] Design specs (spacing, colors hex, fonts)
- [ ] Figma link dengan developer access
- [ ] Component library documentation

---

## 🎯 DESIGN PRINCIPLES (Yang Harus Diingat)

### **1. Simplicity Over Complexity**
- ❌ Jangan: 20 buttons di 1 screen
- ✅ Lakukan: 3-5 primary actions, sisanya hide di menu

### **2. Speed Over Beauty (Untuk POS)**
- ❌ Jangan: Fancy animations yang lambat
- ✅ Lakukan: Instant feedback, fast response

### **3. Data Over Decoration (Untuk Admin)**
- ❌ Jangan: Charts yang indah tapi tidak informatif
- ✅ Lakukan: Clear data visualization, actionable insights

### **4. Accessible (Untuk Semua User)**
- ✅ Font size min 14px
- ✅ Contrast ratio min 4.5:1 (WCAG AA)
- ✅ Touch target min 44px × 44px
- ✅ Keyboard navigable (tab, enter, esc)

### **5. Consistent (Design System)**
- ✅ Button style sama di semua page
- ✅ Card component reusable
- ✅ Color usage konsisten (red = danger, green = success)

---

## 📚 REFERENCE & INSPIRATION

### **POS Systems** (Lihat UI/UX Mereka):
- Square POS
- Kasir Pintar (Indonesia)
- Moka POS (Indonesia)
- Shopify POS
- Toast POS

### **Dashboard & Analytics**:
- Stripe Dashboard
- Notion
- Linear
- Vercel Dashboard

### **Design Systems**:
- Material Design (Google)
- Ant Design
- Tailwind UI
- Shadcn UI

---

## 🆘 QUESTIONS? CONTACT

**Developer**: [Your Name]  
**Email**: your.email@example.com  
**WhatsApp**: 0812-xxxx-xxxx

**Project Files**:
- Figma Link: [Will be shared]
- GitHub Repo: [Will be created]
- Documentation: C:\laragon\www\TA\

---

## 📅 TIMELINE DESIGN (6 Weeks)

```
Week 1: Research & Wireframes
- [ ] Competitive analysis (lihat POS lain)
- [ ] User flow mapping
- [ ] Low-fi wireframes

Week 2: Wireframes Final + Design System
- [ ] Finalize wireframes
- [ ] Define color palette
- [ ] Typography system
- [ ] Component library start

Week 3-4: Hi-Fi Mockups (Priority Screens)
- [ ] POS Transaction screen
- [ ] Dashboard Admin
- [ ] ML Predictions page
- [ ] Product & Inventory pages

Week 5: Hi-Fi Mockups (Remaining Screens)
- [ ] Reports, Settings, Users
- [ ] Mobile responsive version
- [ ] Dark mode (optional)

Week 6: Prototype & Handoff
- [ ] Interactive prototype
- [ ] Demo to developer
- [ ] Export assets
- [ ] Documentation handoff
```

---

## 🎨 FINAL NOTES

**Ingat:**
- User kita bukan designer atau developer → Harus **SIMPLE**
- Kasir butuh **CEPAT** (2 menit per customer)
- Admin butuh **INSIGHTS** (bukan raw data)
- ML predictions harus **ACTIONABLE** (kasih tahu "apa yang harus dilakukan")

**Goal:** 
Bikin sistem yang Pak Budi (pemilik toko) bilang: 
> "Wah, gampang banget dipake! Kasir saya yang umur 50 tahun juga bisa!"

**Good luck designing! 🚀✨**

---

**STATUS**: ✅ Design Brief Ready  
**NEXT**: Start wireframing & mockup  
**ETA**: 6 weeks untuk complete design handoff
