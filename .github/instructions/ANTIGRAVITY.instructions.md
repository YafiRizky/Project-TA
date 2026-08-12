---
applyTo: '**'
context: 'antigravity-ai-setup'
lastUpdated: '2026-08-01'
session: '18-data-gen-stale-fix'
---

# ANTIGRAVITY AI SETUP - POS ML SYSTEM PROJECT
**Setup Date:** April 29, 2026 (last updated: August 1, 2026)
**Project Name:** POS ML System (Multi-Tenant Point of Sale)
**Current Phase:** Phase 3 (ML + Xendit Integration)
**Next Phase:** Landing Page + Branding → Deploy (Railway + Vercel)

---

## PART 1: PROJECT STATE TERKINI (JULY 31, 2026)

### Overall Status
- **Backend:** Django REST API - COMPLETE & VERIFIED (All Phase 1-2 features, ML endpoints, Xendit native payment)
- **Frontend:** React + Tailwind CSS - COMPLETE (All pages, ML Dashboard, Xendit inline payment)
- **Database:** PostgreSQL (pos_ml) - COMPLETE & TESTED (13,560 transaksi, 4 UMKM)
- **Authentication:** JWT Multi-tenant - WORKING (role-based permissions added)
- **Payment:** Xendit Native Integration - WORKING (QRIS/VA/E-Wallet, test mode)
- **ML:** 5 Endpoints Active - WORKING (Classification, Stockout, Restock, Expiry Risk, Forecast)
- **Build:** Local dev working
- **Masih local development** -- belum deploy ke server

### Current Development State
- **Dev Server:** Ready to run (`npm run dev` on port 3001)
- **Backend Server:** Django on `http://localhost:8000`
- **Last Session:** August 1, 2026 (Stale data fix, UMKM data generation, PhoneInput UX fix)
- **Pending:** Landing page + branding, ML v2 verification, deployment
- **Next Action:** Landing Page & Branding → Deploy

### Technology Stack (Current)
```
Backend:  Django 6.x + DRF (Django REST Framework) + PostgreSQL (pos_ml)
Frontend: React 19 + Vite 7.3.2 + Tailwind CSS 4.2.1
Styling:  Tailwind CSS (100% migration from Material-UI)
Icons:    react-icons (RiRemix icon set)
Fonts:    Inter (Google Fonts CDN)
API:      Axios wrapper (queryClient + React Query pattern)
Auth:     JWT tokens + Custom BusinessUserJWTAuthentication
Utils:    src/utils/generateCode.js, src/utils/formatCurrency.js (shared)
Perms:    accounts/permissions.py (IsBusinessAdmin - kasir read-only)
Phone:    react-phone-number-input (register step)
Address:  emsifa API (wilayah Indonesia) + kodepos.json (offline, 7274 kecamatan)
Validate: zod + react-hook-form (frontend), validate_email (backend)
Payment:  Xendit API (QRIS/VA/eWallet) + qrcode.react (QR renderer)
ML:       scikit-learn, pandas, numpy, scipy
```

### Credential Test Access
```
TECHDEV (Superuser - akses semua bisnis):
  Username:      techdev
  Password:      [set saat setup awal]

4 UMKM DATA (Generated August 1, 2026):
  1. Toko Berkah Jaya (HBRPOI) - Kelontong, 20 produk, 4814 tx, 12 bulan
     Admin: admin_hbrpoi / admin123 | Owner Code: FI52TX
     Kasir: kasir_hbrpoi / kasir123 (Kode Bisnis: HBRPOI)

  2. Warung Makan Bu Sari (G8F1CB) - Warung Makan, 12 produk, 7385 tx, 12 bulan
     Admin: admin_g8f1cb / admin123 | Owner Code: PTS288
     Kasir: kasir_g8f1cb / kasir123 (Kode Bisnis: G8F1CB)

  3. Toko Beras Pak Hadi (FNO6B9) - Toko Beras, 8 produk, 270 tx, 4 bulan
     Admin: admin_fno6b9 / admin123 | Owner Code: 4EYJ2Q
     Kasir: kasir_fno6b9 / kasir123 (Kode Bisnis: FNO6B9)

  4. Minimart Sejahtera (M80O2R) - Minimart, 14 produk, 1091 tx, 4 bulan
     Admin: admin_m80o2r / admin123 | Owner Code: OR1C0X
     Kasir: kasir_m80o2r / kasir123 (Kode Bisnis: M80O2R)
```

### Backend Access
```
Django Admin:      http://localhost:8000/admin/
Superuser:         admin / admin (set during initial migration)
API Root:          http://localhost:8000/api/
```

---

## PART 2: FLAG SYSTEM EXPLANATION

### What is a FLAG?

A **FLAG** is a timestamped marker document that represents a **significant project milestone, completion checkpoint, or state change**. It serves as:
- **Progress checkpoint** - Marks when a major phase was completed
- **State snapshot** - Records what was done, what works, what's known
- **Recovery reference** - If bugs occur later, helps trace when/how they were introduced
- **Knowledge preservation** - Future sessions remember exactly what happened

### FLAG Anatomy

**Filename Convention:**
```
FLAG_[DESCRIPTION]_[DATE].md
Example: FLAG_SESSION_12_FRONTEND_REDESIGN_COMPLETE_2026-04-15.md
```

**Content Structure:**
```markdown
# FLAG: [Title]
**Date:** [YYYY-MM-DD]
**Status:** COMPLETED / IN-PROGRESS / BLOCKED
**Session:** [Session Number]

## Summary
[What was accomplished in 2-3 lines]

## Changes Made
[Detailed list of changes]

## Testing/Verification
[How was it verified? Build output, test results, etc.]

## Known Issues (if any)
[Any issues to track for future reference]

## Lessons Learned
[What AI/developer learned - prevents repeating mistakes]
```

### Where FLAGS Are Stored

**Active Flags (Current/Recent):**
```
c:\laragon\www\TA\Active phase\
+-- FLAG_*.md files (most recent, sorted by session)
```

**Archived Flags (Historical Reference):**
```
c:\laragon\www\TA\Dokumen\Archive_Old_FLAGs\
+-- FLAG_*.md files (older sessions, reference only)
```

**Historical Timeline:**
```
SESSION 1-7:   Foundation & Auth (Rebuilt March 16)
  +-- FLAG_FRESH_START_2026-02-26.md
  +-- FLAG_SESSION_4_RESTART_2026-02-26.md
  +-- FLAG_CHECKPOINT_SESSION_5_2026-02-11.md

SESSION 8:     Products & Inventory API (Rebuilt March 16)
  +-- FLAG_CHECKPOINT_SESSION_6_2026-02-24.md
  +-- FLAG_CHECKPOINT_SESSION_7_2026-02-25.md

SESSION 9:     React Frontend Foundation
  +-- FLAG_BLUEPRINT_REVIEW_2026-02-25.md

SESSION 10-11: Critical Recovery Event
  +-- FLAG_SESSION_10-11_BACKEND_REBUILD_RECOVERY_2026-03-16.md

SESSION 12:    Frontend Redesign Complete
  +-- FLAG_SESSION_12_FRONTEND_REDESIGN_COMPLETE_2026-04-15.md

SESSION 12+:   Core POS & Polish (May 2026)
  +-- FLAG_CORE_POS_COMPLETED_2026-05-06.md
  +-- FLAG_18_06_2026_Pagination_UI_Fix.md

SESSION 17+:   Indonesia Lock + ML Overhaul (July 2026)
  +-- FLAG_14_07_2026_ML_Overhaul_V2_Documentation.md
  +-- FLAG_31_07_2026_Indonesia_Lock_KodePos.md

SESSION 18:    Data Generation + Stale Fix + PostgreSQL (August 2026)
  +-- FLAG_01_08_2026_DataGen_StaleFix.md  <-- LATEST
```

### FLAG Best Practices

**When to create a FLAG:**
- When a major phase/feature is COMPLETED
- When a major RECOVERY or REBUILD happens
- When a critical BUG is FIXED with lessons learned
- When transitioning to new phase or major architecture change
- Jika masih di tanggal yang sama tapi sudah ada FLAG, maka UPDATE FLAG yang ada. Jika tanggal berbeda, buat FLAG baru.

**What to include:**
- Clear timestamp and session number
- Specific list of what was done (file names, changes)
- Build output or verification proof (npm run build result, tests passed, etc.)
- Known issues for next session
- Error yang ditemukan: sumber error, kenapa terjadi, dan solusi yang diterapkan
- Lessons learned (what went wrong, what to avoid next time)

**What NOT to include:**
- Vague descriptions ("fixed some stuff")
- Incomplete information
- Personal opinions unrelated to code
- Information already in session notes

---

## PART 3: COMPLETE FOLDER HIERARCHY & STRUCTURE

### Root Project Structure
```
c:\laragon\www\TA\
+-- .github/
|   +-- instructions/
|       +-- RULE.instructions.md          [CORE RULES - Project behavior guidelines]
|       +-- ANTIGRAVITY.instructions.md   [THIS FILE - Antigravity AI setup]
|
+-- pos-backend/                          [DJANGO REST API - Core backend engine]
|   +-- manage.py                         [Django management script]
|   +-- (PostgreSQL: pos_ml)              [Database: PostgreSQL, NOT SQLite]
|   |
|   +-- backend/                          [Django project settings/config]
|   +-- accounts/                         [USER MODELS & AUTH]
|   +-- businesses/                       [MULTI-TENANT BUSINESS MODEL]
|   +-- products/                         [PRODUCT CATALOG MANAGEMENT]
|   +-- inventory/                        [STOCK & BATCH MANAGEMENT]
|   +-- transactions/                     [POS ORDERS & PAYMENTS]
|   +-- payments/                         [PAYMENT METHOD MANAGEMENT]
|
+-- pos-frontend/                         [REACT + VITE + TAILWIND]
|   +-- src/
|   |   +-- main.jsx                      [React entry point (providers setup)]
|   |   +-- App.jsx                       [Main router & route definitions + 404 page]
|   |   +-- index.css                     [Global styles: Tailwind @import + Inter font]
|   |   |
|   |   +-- pages/                        [ALL PAGES - Tailwind CSS]
|   |   +-- components/                   [REUSABLE UI COMPONENTS]
|   |   +-- contexts/                     [REACT CONTEXT STATE MANAGEMENT]
|   |   +-- services/                     [API INTEGRATION LAYER]
|   |   +-- utils/                        [SHARED UTILITIES (NEW)]
|   |
|   +-- index.html                        [Title: "POS ML System"]
|   +-- vite.config.js                    [Vite config + Tailwind plugin]
|   +-- package.json                      [NPM dependencies (113 unused packages removed)]
|
+-- Active phase/                         [CURRENT/RECENT DOCUMENTATION & FLAGS]
|   +-- FLAG_18_06_2026_Pagination_UI_Fix.md          [LATEST FLAG]
|   +-- FLAG_POLISH_AUDIT_FIX_COMPLETE_2026-05-22.md
|   +-- FLAG_SESSION_12_FRONTEND_REDESIGN_COMPLETE_2026-04-15.md
|   +-- FITUR_DAN_FLOW_LENGKAP_PRIORITY.md [Feature specifications & flow diagrams]
|   +-- CURRENT_STATUS.md                 [Quick status snapshot]
|   +-- [other documentation files]
|
+-- Note Improvement Project/             [USER-WRITTEN IMPROVEMENT NOTES]
|   +-- 01-05-2026/01-05-2026.txt         [4 items: register UI, phone code, typo, stock validation]
|   +-- 21-05-2026/21-05-2026.txt         [7 items: phone, sidebar, supplier, profile, currency, batch, kasir nama]
|   +-- 23-05-2026/Yang saya temukan.txt  [2 items: phone placeholder, kecamatan dropdown]
|
+-- Dokumen/                              [HISTORICAL DOCUMENTATION]
|   +-- Archive_Old_FLAGs/                [Historical FLAGS for reference]
|   +-- PROPOSAL_TA_POS_ML_UMKM.md        [Original proposal & requirements]
|   +-- PROJECT_SUMMARY.md                [Complete project overview]
|
+-- Flow/                                 [PROCESS FLOW DIAGRAMS]
+-- Debug/                                [ERROR TRACKING & DEBUG FILES]
```

---

## PART 4: FOLDER FUNCTION BREAKDOWN

### Backend Structure (pos-backend/)

**accounts/** — Authentication & User Management
- **Purpose:** Handle login, registration, JWT token generation, user roles
- **Key Models:** 
  - `TechnicalAdmin` (Django admin users)
  - `BusinessUser` (POS system users: admin, kasir)
- **API Endpoints:**
  - `POST /api/auth/login/` - Business login (business_code + username + password)
  - `POST /api/auth/register/` - New business registration
  - `POST /api/auth/token/refresh/` - JWT token refresh
- **Auth Backend:** `BusinessUserJWTAuthentication` - Validates JWT for business context

**businesses/** — Multi-Tenant Business Management
- **Purpose:** Isolate data per business, handle business-level settings
- **Key Models:** `Business` (unique business_code, name, type)
- **Middleware:** Extracts business from JWT token, applies to all queries
- **Pattern:** Every query filtered by `business=request.auth['business']`

**products/** — Product Catalog Management
- **Purpose:** CRUD for products, categories, suppliers
- **Key Models:**
  - `Product` (SKU, name, pricing, category, supplier)
  - `Category` (grouping products)
  - `Supplier` (vendor info: contact, phone, address)
- **API Endpoints:**
  - `GET/POST /api/products/` - Product CRUD
  - `GET/POST /api/categories/` - Category CRUD
  - `GET/POST /api/suppliers/` - Supplier CRUD
- **Business Isolation:** All filtered by `business_id`

**inventory/** — Stock & FIFO Batch Management
- **Purpose:** Track inventory using FIFO batches, calculate stock levels
- **Key Models:**
  - `ProductBatch` (batch code, quantity, purchase_date, expiry_date, status)
  - `StockMovement` (logs of stock in/out)
- **API Endpoints:**
  - `GET/POST /api/inventory/batches/` - Batch management
  - `GET /api/inventory/summary/` - Current stock levels per product
- **Logic:** FIFO selection for POS checkout, automatic expiry calculations

**transactions/** — POS Orders & Payments
- **Purpose:** Handle point-of-sale transactions, payment processing
- **Key Models:**
  - `Order` (order header: user, date, total)
  - `OrderItem` (line items: product, quantity, price)
  - `Payment` (payment method, amount)
- **API Endpoints:**
  - `GET /api/transactions/` - Transaction history
  - `POST /api/transactions/checkout/` - Complete POS sale
  - `GET /api/transactions/summary/` - Daily sales summary
- **Payment Methods:** CASH, CARD, QRIS, TRANSFER, EWALLET

### Frontend Structure (pos-frontend/src/)

**pages/** — Full Application Pages (11 total, ALL TAILWIND CSS)

1. **LoginPage.jsx** 
   - Entry point for authentication
   - Fields: business_code (auto-uppercase), username, password
   - UI: Dark gradient background, centered white card
   - Styling: Tailwind dark-mode gradients

2. **RegisterPage.jsx**
   - 4-step wizard for new business registration
   - Step 0: Credentials (username, password)
   - Step 1: Personal info (name, email, phone)
   - Step 2: Business info (business_name, business_type, address)
   - Step 3: Review & confirm
   - Validation: zod schema (preserved from original)

3. **DashboardPage.jsx**
   - Role-based display (different for admin vs kasir)
   - Admin: 4 stat cards (products, low stock alerts, transactions, revenue)
   - Kasir: 1 stat card (low stock) + quick action to open transaction
   - Uses MainLayout wrapper

4. **ProductsPage.jsx**
   - CRUD interface for product management
   - Search box with RiSearchLine icon
   - Table: 9 columns (code, name, category, buy price, sell price, unit, status, actions)
   - Modal for add/edit: category dropdown, supplier dropdown, pricing, stock

5. **CategoriesPage.jsx**
   - Simple CRUD for product categories
   - Table: code, name, description, status (toggle), actions
   - Modal: code, name, description, is_active toggle
   - Handles both array and {results: []} response formats

6. **SuppliersPage.jsx**
   - Vendor management CRUD
   - Table: code, name, contact_person, phone, email, city, status, actions
   - Modal: all 7 fields + address textarea

7. **InventoryPage.jsx**
   - FIFO batch tracking & management
   - Product selector (dropdown), batch code, quantity
   - Date inputs: purchase_date, expiry_date
   - Status selector: ACTIVE, EXPIRED, DEPLETED
   - Table: batch_code, product, qty, purchase_date, expiry_date, status, actions

8. **TransactionsPage.jsx**
   - **MOST COMPLEX** - POS point-of-sale interface
   - Product selector + quantity + price override
   - Shopping cart table (product, qty, price, subtotal, remove button)
   - Payment methods selector (5 options)
   - Amount paid input + automatic change calculation
   - Checkout button with mutation handling

9. **ReportsPage.jsx** (PLACEHOLDER)
   - 4 feature sections: Daily, Period, Per Product, Payment Methods
   - Using FeaturePlaceholder component with icons
   - Ready for reports dashboard implementation

10. **MLPredictionsPage.jsx** (PLACEHOLDER)
    - 4 AI feature sections: Demand Forecast, Stock Optimization, Anomaly Detection, Recommendations
    - Using FeaturePlaceholder component with icons
    - Ready for ML integration

11. **UserManagementPage.jsx** (PLACEHOLDER)
    - Grayed-out kasir account management interface
    - Dummy table showing structure
    - Ready for backend user management endpoints

**components/** — Reusable UI Building Blocks (All Tailwind)

1. **MainLayout.jsx**
   - Master wrapper for all authenticated pages
   - Props: children, title, alertCount
   - Layout: Sidebar (fixed left) + TopBar (sticky top) + content area
   - Responsive: Mobile hamburger menu + overlay sidebar
   - Background: Light gray-50, white cards

2. **Sidebar.jsx**
   - Dark vertical navigation (bg-slate-900)
   - Menu items: Dashboard, Products, Categories, Suppliers, Inventory, Transactions, Reports, ML, Users (owner only)
   - Active state: bg-blue-600 (admin) or bg-emerald-600 (kasir)
   - Bottom: User avatar + name + role badge + logout button
   - Icons: All from react-icons (RiRemix set)

3. **TopBar.jsx**
   - Sticky horizontal header (h-14 bg-white border-b)
   - Left: Mobile hamburger + page title
   - Right: Bell icon with alert badge + user avatar + name/role
   - Responsive: Hamburger visible on mobile, hidden on desktop

4. **FeaturePlaceholder.jsx**
   - Reusable placeholder for incomplete features
   - Props: title, description, icon (optional)
   - Styling: Dashed border, center-aligned, light background
   - Used by: ReportsPage, MLPredictionsPage, UserManagementPage

5. **ProtectedRoute.jsx**
   - Route guard for role-based access control
   - Checks: isAuthenticated, user role (admin vs kasir)
   - Fallback: Pure Tailwind spinner (animated border)
   - Unauthorized: Redirect to /login

**services/api.js** — API Integration Layer
- **Pattern:** Axios wrapper with queryKey + mutationFn structure
- **Methods Organized by Domain:**
  - `productsAPI` - All product/category/supplier operations
  - `inventoryAPI` - Batch and stock operations
  - `transactionsAPI` - POS checkout and order history

**contexts/AuthContext.jsx** — Application State Management
- **State:** user object, JWT tokens, loading flag
- **Methods:** login(business_code, username, password), logout(), refresh token on startup
- **Provides:** useAuth hook for components
- **Business Logic:** Extracts role from user, implements isAdmin(), isKasir()

---

## PART 5: WORKFLOW & DEVELOPMENT CONVENTIONS

### Start Development Session (Every Time)

1. **Backend startup (Terminal 1):**
   ```bash
   cd c:\laragon\www\TA\pos-backend
   python manage.py runserver
   # Output: Running on http://localhost:8000
   ```

2. **Frontend startup (Terminal 2):**
   ```bash
   cd c:\laragon\www\TA\pos-frontend
   npm run dev
   # Output: VITE v7.3.2 ready in XX ms
   # Running at: http://localhost:5173
   ```

3. **Verify connectivity:**
   - Backend: http://localhost:8000/api/ (should show API root)
   - Frontend: http://localhost:5173 (should show login page)
   - Test login with T2EUNE / admin01 / admin123

### API Integration Pattern (Every new feature)

**Backend API endpoint created → Frontend service method → React Query hook → Page component**

Example: Adding new report endpoint
```
1. Backend: accounts/views.py → Add new ViewSet/APIView
2. Backend: accounts/urls.py → Register route
3. Backend: Test with Postman/curl
4. Frontend: src/services/api.js → Add new method
5. Frontend: import { useQuery } from '@tanstack/react-query'
6. Frontend: Use useQuery({ queryKey: ['reports'], queryFn: ... })
7. Frontend: Test in page component
```

### Component Development Pattern (Every new page/component)

**For CRUD Pages (Products, Categories, Suppliers, Inventory):**
1. Use MainLayout wrapper
2. Create search box (if list view)
3. Create data table with columns
4. Add modal for create/edit
5. Add delete confirmation
6. Use React Query (useQuery for read, useMutation for write)
7. Preserve all original form validation (zod schema)
8. Style entirely with Tailwind CSS classes

**For Custom Components:**
1. Place in src/components/
2. Accept props for flexibility
3. Use Tailwind for all styling
4. No inline styles
5. Export as default export

### Testing Before Commit/Building

```bash
# 1. Check for errors
npm run build  # Frontend production build (must be 0 errors)

# 2. Visual test in dev server
npm run dev    # Check UI in browser, test basic flows

# 3. Test key flows:
   - Login with both roles (admin & kasir)
   - Create/Edit/Delete on each CRUD page
   - Checkout in POS
   - Verify data persists after refresh
```

### Common Tailwind Utilities Used (Reference)

**Layout:**
- `flex`, `flex-col`, `grid`, `gap-4`, `p-4`, `m-0`

**Sizing:**
- `w-full`, `h-screen`, `max-w-2xl`, `min-h-screen`

**Colors:**
- `bg-slate-900`, `bg-blue-600`, `bg-emerald-600`, `bg-white`, `bg-gray-50`
- `text-white`, `text-gray-600`, `text-blue-600`
- Status badges: `bg-green-100`, `bg-red-100`, `bg-gray-100`

**States:**
- `hover:bg-gray-100`, `focus:ring-2`, `disabled:opacity-50`
- `border-b`, `rounded-lg`, `shadow-lg`

**Responsive:**
- `hidden lg:block`, `lg:pl-60`, `md:grid-cols-2`

---

## PART 6: PROJECT CORE RULES & GUIDELINES

### Rule 1: Proactive & Clarifying
- **Always ask clarifying questions** if instructions are ambiguous
- **Confirm intent** before making code changes
- **Request details** for technical decisions
- **Never assume** what user wants - verify first

### Rule 2: Code Preservation
- **Never delete existing code** without explicit user permission
- Exception: Only if user says "remove this" explicitly
- Preserve all business logic and API integration patterns

### Rule 3: Complete Explanations
- **Explain EVERY change** (block by block, line by line if relevant)
- **State the reason** for the change
- **Describe expected result** (especially for CRUD or business logic)
- **No vague descriptions** - be specific

### Rule 4: No Emoticons
- Professionalism: No emojis, no smiley faces anywhere in output

### Rule 5: Project Structure Respect
- **Don't create new files/folders** without user permission
- **Maintain existing structure** - follow established patterns
- **Use existing components** instead of creating duplicates

### Rule 6: Professional Suggestions
- **Provide tech arguments** - explain WHY a change is needed
- **Reference standards** - Tailwind best practices, React patterns, REST conventions
- **Warn about risks** - alert user to potential bugs or side effects before proceeding

### Rule 7: Ambiguity Resolution
- **Don't guess implementation** when requirements are unclear
- **Ask first** - get clarity on exact requirement
- **Propose options** if multiple valid approaches exist

### Rule 8: Error Detection & Warning
- **Detect potential bugs** before they're created
- **Alert user** about inconsistencies or risks
- **Suggest prevention** - document the issue for future reference
- **Don't proceed** if risk is high without explicit permission

### Rule 9: Reasoning Process (Always)
A. **Understand context** - Review project state, conversation history, related code
B. **Connect to structure** - Map request to existing codebase organization
C. **Identify implicit intent** - Infer deeper meaning from communication patterns
D. **Then execute** - Only after full understanding

### Rule 10: NO Unsolicited Documentation
- **NEVER create README/comments** without user asking
- **NEVER auto-generate docs** to "be helpful"
- **Always ask first** - "Should I document this? What format?"
- Exception: When documenting code changes explicitly requested

---

## PART 7: TECHNICAL ARCHITECTURE REFERENCE

### Database Relationships (Backend)

```
Business
  ├─→ (1:N) User (TechnicalAdmin + BusinessUser)
  ├─→ (1:N) Product
  │   ├─→ (N:1) Category
  │   ├─→ (N:1) Supplier
  │   └─→ (1:N) ProductBatch
  │       └─→ (1:N) StockMovement
  ├─→ (1:N) Order
  │   ├─→ (1:N) OrderItem
  │   │   └─→ (N:1) Product
  │   └─→ (1:1) Payment
```

**Business Isolation:** Every table has `business_id` foreign key. All queries filtered by authenticated user's business.

### Authentication Flow (Frontend → Backend)

```
1. LoginPage: User submits (business_code, username, password)
2. API: POST /api/auth/login/ → Backend validates
3. Backend: Returns JWT token + user profile
4. AuthContext: Stores token in localStorage + state
5. ProtectedRoute: Checks token validity, user role
6. All subsequent API calls: Include Authorization: Bearer {token} header
7. Logout: Clear token + redirect to /login
```

### API Request/Response Pattern (React Query)

**Read (useQuery):**
```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ['products'],  // Cache key
  queryFn: () => productsAPI.getProducts()  // API call function
})
```

**Write (useMutation):**
```javascript
const mutation = useMutation({
  mutationFn: ({ id, data }) => productsAPI.updateProduct(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['products'])  // Refresh data
    handleCloseDialog()
  }
})
```

### Tailwind CSS Setup (Current - v4.2.1)

**Key Difference from v3:**
- Gradient syntax: `bg-linear-to-br` (not `bg-gradient-to-br`)
- Configured via `@tailwindcss/vite` plugin (not postcss)

**Import order in src/index.css:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:...');  /* Google Fonts first */
@import "tailwindcss";  /* Then Tailwind */
```

---

## PART 8: COMMON SCENARIOS & SOLUTIONS

### Scenario: Adding New CRUD Page

**Steps:**
1. Create backend ViewSet in Django app
2. Register URLs in urls.py
3. Create frontend page in src/pages/NewPage.jsx
4. Add service methods in src/services/api.js
5. Use MainLayout wrapper
6. Import Tailwind CSS utilities (no Material-UI)
7. Test CRUD operations (create, read, update, delete)

### Scenario: Adding API Endpoint

**Check list:**
- Backend: View created + URL registered + business isolation (filter by `business_id`)
- Frontend: Service method added to api.js
- React Query: queryKey defined + queryFn pointing to service
- Error handling: Try/catch in service, error state in component
- Authentication: JWT token included automatically by Axios

### Scenario: Styling a New Component

**Always:**
1. Use Tailwind classes (100% no Material-UI imports)
2. No inline `style={{...}}` objects
3. Mobile-first: Use responsive prefixes (`sm:`, `md:`, `lg:`)
4. Colors from scheme: Blue (admin), Emerald (kasir), Slate (dark)
5. Verify in both dev server and production build

### Scenario: Debugging API Call Fails

**Check:**
1. Backend running on localhost:8000?
2. JWT token valid? Check browser DevTools → Application → localStorage
3. API endpoint registered in urls.py?
4. Business isolation applied? (filter by business_id)
5. Response format matches frontend expectation?
6. CORS enabled in Django settings?

---

## PART 9: FILE TEMPLATES & CODE PATTERNS

### Pattern: New CRUD Page Template

```jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiSearchLine } from 'react-icons/ri'
import MainLayout from '../components/MainLayout'
import { productsAPI } from '../services/api'

export default function NewPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ /* initial fields */ })

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => productsAPI.getItems()
  })

  const createMutation = useMutation({
    mutationFn: (data) => productsAPI.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['items'])
      handleCloseDialog()
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productsAPI.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['items'])
      handleCloseDialog()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => productsAPI.deleteItem(id),
    onSuccess: () => queryClient.invalidateQueries(['items'])
  })

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingId(item.id)
      setFormData(item)
    } else {
      setEditingId(null)
      setFormData({ /* reset */ })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <MainLayout title="Item Management">
      {/* Search & Add button */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <RiSearchLine className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RiAddLine size={20} />
          Add
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Column1</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Column2</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(i => i.name.includes(search)).map(item => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{item.column1}</td>
                <td className="px-6 py-4">{item.column2}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleOpenDialog(item)}
                    className="text-blue-600 hover:text-blue-700 mr-4"
                  >
                    <RiEditLine size={18} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <RiDeleteBinLine size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Item' : 'Add Item'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Field 1"
                value={formData.field1 || ''}
                onChange={(e) => setFormData({ ...formData, field1: e.target.value })}
                className="col-span-2 px-4 py-2 border rounded-lg"
              />
              <button type="submit" className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="col-span-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
```

---

## PART 10: QUICK REFERENCE CHECKLIST

### Before Starting Work
- [ ] Read CURRENT_STATUS_SESSION_12.md (what's done)
- [ ] Check FLAG_SESSION_12_*.md (what was accomplished)
- [ ] Understand project state at April 29, 2026
- [ ] Confirm which phase/feature user wants to work on

### Before Making Code Changes
- [ ] Ask clarifying questions if instructions unclear
- [ ] Confirm intent with user
- [ ] Check RULE.instructions.md for behavior guidelines
- [ ] Review existing patterns in codebase

### Before Committing Changes
- [ ] Run `npm run build` (0 errors required)
- [ ] Test in dev server (`npm run dev`)
- [ ] Verify at least 2-3 key flows
- [ ] Check for console errors (DevTools)

### When Session Ends
- [ ] Create FLAG_*.md if major work completed
- [ ] Update CURRENT_STATUS_*.md with progress
- [ ] Document any known issues for next session
- [ ] Record lessons learned in FLAG

---

## PART 11: ROADMAP & PENDING WORK

### Pending: User Improvement Notes (10 item)
User menulis note improvement di folder `Note Improvement Project/`. WAJIB baca file-file ini sebelum mulai kerja.
Lihat PART 2B di file ini untuk detail lengkap status tiap item.

### Tahap Selanjutnya (Roadmap)
1. **NOW:** Kerjakan 10 item user improvement notes
2. **Phase 2:** Multiple Bisnis oleh Admin (fitur besar)
3. **Phase 3:** ML Integration (tunggu data real dari user)

### Catatan Penting
- Project masih dalam tahap **local development testing**
- Jangan khawatir tentang production deployment (SECRET_KEY, rate limiting, dll)
- Nanti jika sudah benar dan baik, user akan mencari API online untuk:
  1. Email OTP konfirmasi dan reset password
  2. API pembayaran (bank dan QR)

**Reference:** c:\laragon\www\TA\Active phase\FUTURE_FEATURES_FLAGS.md

---

## PART 12: ANTIGRAVITY SPECIFIC NOTES

### For Antigravity AI Setup

When opening this project in Antigravity:

1. **Folder structure to understand first:**
   - Active phase/ = Current state & recent docs
   - pos-backend/ = Django API
   - pos-frontend/ = React app
   - Dokumen/ = Historical reference

2. **Key commands to know:**
   ```
   # Terminal 1 - Backend
   cd pos-backend && python manage.py runserver
   
   # Terminal 2 - Frontend
   cd pos-frontend && npm run dev
   
   # Build check
   cd pos-frontend && npm run build
   ```

3. **Files to reference always:**
   - RULE.instructions.md (behavior rules)
   - Active phase/FLAG_POLISH_AUDIT_FIX_COMPLETE_2026-05-22.md (latest state)
   - Note Improvement Project/ (user's pending improvement requests)
   - Active phase/FITUR_DAN_FLOW_LENGKAP_PRIORITY.md (feature specs)

4. **If stuck or confused:**
   - Check "Active phase" folder first (most relevant FLAGS)
   - Check "Note Improvement Project" folder (user's own findings)
   - Then check "Dokumen" folder (historical context)
   - Read the FLAG files in order (shows project progression)
}

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <MainLayout title="Item Management">
      {/* Search & Add button */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <RiSearchLine className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RiAddLine size={20} />
          Add
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Column1</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Column2</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(i => i.name.includes(search)).map(item => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{item.column1}</td>
                <td className="px-6 py-4">{item.column2}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleOpenDialog(item)}
                    className="text-blue-600 hover:text-blue-700 mr-4"
                  >
                    <RiEditLine size={18} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <RiDeleteBinLine size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Item' : 'Add Item'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Field 1"
                value={formData.field1 || ''}
                onChange={(e) => setFormData({ ...formData, field1: e.target.value })}
                className="col-span-2 px-4 py-2 border rounded-lg"
              />
              <button type="submit" className="col-span-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="col-span-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

## PART 2B: USER IMPROVEMENT NOTES (10/10 SELESAI & VERIFIED)

Semua 10 item user improvement notes dari folder `Note Improvement Project/` telah diverifikasi dan **100% SELESAI**:

### Status Per-Item (Semua Terverifikasi):
1. **Phone input kode negara (+62)**: `PhoneInput defaultCountry="ID"` di `RegisterPage.jsx` & `ProfilePage.jsx` ✅
2. **Register step 3 field alamat**: Form layout `textarea` rapi ✅
3. **Kecamatan dropdown (bukan text input)**: `district` select dropdown via EMSIFA API (`ID_API/districts/...json`) di `RegisterPage.jsx` & `ProfilePage.jsx` ✅
4. **Quantity stok warning di frontend**: `showStockWarning` & `stockMap` di `KasirPOSPage.jsx` ✅
5. **Sidebar scroll position**: Preserved via module-level `_savedScrollTop` di `Sidebar.jsx` ✅
6. **Supplier phone placeholder**: `placeholder="Masukan No Telfon"` di `SuppliersPage.jsx` ✅
7. **Profile admin CRUD business info**: Admin dapat edit nama bisnis, tipe usaha, telepon, alamat, provinsi, kota, kecamatan, kodepos di `ProfilePage.jsx` ✅
8. **Auto-format angka titik ribuan**: `formatNumberInput` & `parseFormattedNumber` di `formatCurrency.js` & `ProductsPage.jsx` ✅
9. **Kode batch auto-generate**: `generateCode` di `InventoryPage.jsx` ✅
10. **Typo & validation produk transaksi**: Verifikasi & validasi di `KasirPOSPage.jsx` & `TransactionsPage.jsx` ✅

## PART 2C: LATEST MILESTONE UPDATE (5 AGUSTUS 2026)

- **Branding App**: Mengubah nama aplikasi dari `Antigravity POS` menjadi **`Metracrura POS`** di seluruh portal & meta title.
- **Generasi Data Padat 1 Tahun**: Dibuatkan UMKM baru `Toko Kelontong Sumber Rejeki` (`KLT888` / `OWN888`) dengan 8.887 transaksi, Rp 1,167 M omset, 30 SKU, stok ratusan per produk tanpa ada hari bolong.
- **Paginasi Independen**: Hook `usePageSize.js` dan 10 halaman tabel kini menggunakan storage key unik per-fitur (`pos_page_size_${key}`).
- **Fix Chart & Paginator Backend**: `TransactionPagination.max_page_size` dinaikkan ke `5000` di backend, dan `chartData` Laporan Penjualan di-match menggunakan format ISO `YYYY-MM-DD` (`toYMD`) sehingga grafik 7 hari naik dan kontinu sempurna.
- **Fix React Key Warning**: Menambahkan `<Fragment key={t.id}>` di `TransactionsPage.jsx`.

---

## PART 2D: LATEST MILESTONE UPDATE (10 AGUSTUS 2026)

- **Single-Format Dedicated Modals & UI**:
  - Implemented dedicated export modals for CSV/XLSX (emerald theme) and PDF (red theme) in `ReportsPage.jsx` and mockup.
  - Removed inner format switcher tabs to ensure unambiguous single-format modal flow.
  - Replaced emoji icons with RemixIcon `<RiInformationLine />` component for professional design compliance.
- **Native Excel (.xlsx) Export via OpenPyXL**:
  - Replaced plain text CSV export in Django backend (`pos-backend/transactions/views.py`) with native `.xlsx` Excel Workbooks using `openpyxl`.
  - Auto-fit dynamic column widths (`max_len + 4`), bold emerald headers (`#059669`), formatted currency values as numeric types for `=SUM()` compatibility.
- **Multi-Page Landscape PDF Export**:
  - ReportLab multi-page landscape PDF export with custom page numbers (`Halaman X dari Y`), headers on every page, and exact summary rows.
- **Universal Backend Route Matching & DRF Fixes**:
  - Resolved DRF content-negotiation `Http404` by overriding `perform_content_negotiation` in `TransactionViewSet`.
  - Fixed `request.user.business.business_name` attribute reference in PDF report titles.
  - Registered fail-safe routes in `backend/urls.py` and `transactions/urls.py`.
- **Live VPS Deployment Verified**:
  - Re-compiled React production bundle `pos-frontend/dist` and verified live 200 OK responses on `www.mercaturapos.cloud` on August 10, 2026.

## PART 2E: LATEST MILESTONE UPDATE (11 AGUSTUS 2026)

- **Google Search Console Domain Verification**:
  - Successfully verified domain ownership for `https://www.mercaturapos.cloud` via HTML file verification method (`google8b72da0e9037818d.html`).
- **SEO Metadata & OpenGraph Setup**:
  - Enhanced `pos-frontend/index.html` with primary SEO meta tags (title, description, keywords, robots, canonical URL) and OpenGraph tags for social sharing.
- **Search Engine Crawling Infrastructure**:
  - Configured `robots.txt` in `pos-frontend/public/` and `pos-frontend/dist/` to allow indexing of public pages while protecting internal app routes.
  - Generated `sitemap.xml` for `https://www.mercaturapos.cloud/` and submitted to Google Search Console (Status: **Success**, 3 discovered pages).

- **Void Transaction & Report Synchronization**:
  - Filtered `completedTransactionsList` (`t.status !== 'VOIDED'`) in `ReportsPage.jsx` across daily/monthly sales trend charts, top products, and summary fallbacks.
  - Ensured real-time chart auto-adjustment whenever transactions are voided, keeping reports, charts, and Machine Learning calculations 100% linear and dynamic.
- **Stock Opname 500 Error Fix & Safe Creation**:
  - Resolved `500 Internal Server Error` on `POST /api/inventory/opname/` by implementing safe business relation lookup (`getattr(user, 'business', None)`) in `StockOpnameSerializer.create()`.
  - Wrapped stock opname document & batch item creation in `transaction.atomic()`, added `perform_create` audit logging, and updated frontend `onError` toast handlers for clear feedback.

## PART 2F: LATEST MILESTONE UPDATE (12 AGUSTUS 2026)

- **Security Hardening & DRF Rate Limiting**:
  - Configured `DEFAULT_THROTTLE_CLASSES` (`AnonRateThrottle` & `UserRateThrottle`) in `backend/settings.py`.
  - Added scoped rate limits: `register: 5/hour`, `login: 15/minute`, `kasir_create: 20/hour`.
  - Implemented `PROBE_KEYWORDS` filtering (`is_suspicious_input`) in `accounts/views.py` to auto-reject bot scanner payloads (Log4j, SSTI, OAST, Vigolium, pentest).
  - Enforced security HTTP headers: `SECURE_BROWSER_XSS_FILTER`, `SECURE_CONTENT_TYPE_NOSNIFF`, `X_FRAME_OPTIONS = 'DENY'`.

---

**End of ANTIGRAVITY AI SETUP Document**
**Last Updated:** August 12, 2026
**For Questions:** Refer to Active phase/ documentation or latest FLAG file
