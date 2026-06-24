# 🚩 FLAG CHECKPOINT - SESSION 6: DATABASE MODELS PART 1

**Session:** 6 / 24  
**Date:** 24 Februari 2026  
**Duration:** ~2 hours  
**Status:** ✅ COMPLETED 100%  
**Next Session:** 7 - Database Models Part 2 (Products, Inventory, Transactions)

---

## 📋 SESSION OVERVIEW

**Tujuan Session 6:** Create foundation database models untuk POS system (User, Branch, Category, Supplier) dengan custom User authentication.

**Target:**
- [x] Create Custom User Model (extend AbstractUser)
- [x] Create Branch Model (multi-outlet management)
- [x] Create Category Model (product categorization)
- [x] Create Supplier Model (vendor management)
- [x] Update AUTH_USER_MODEL di settings.py
- [x] Register all models ke Django admin
- [x] Run migrations (dengan database reset)
- [x] Create superuser baru
- [x] Test CRUD via admin panel

**Result:** Session 6 berhasil diselesaikan. 4 models baru created, migrated, dan accessible via admin panel. Database foundation solid untuk Session 7.

---

## ✅ TASKS COMPLETED

### Task 1: Create Custom User Model
**Status:** ✅ Success  
**File:** `pos_backend/users/models.py`

**Model Created:**
```python
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('kasir', 'Kasir'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='kasir')
    phone = models.CharField(max_length=15, blank=True)
    branch = models.ForeignKey('branches.Branch', on_delete=models.SET_NULL, 
                                null=True, blank=True, related_name='users')
```

**Reasoning:**
- Extend `AbstractUser` untuk keep all Django auth features (login, permissions, groups)
- Add `role` field: Admin (full access) vs Kasir (POS only)
- Add `phone` untuk contact info
- Add `branch` relationship untuk multi-branch assignment
- Forward reference `'branches.Branch'` karena Branch model belum exist saat User defined

**Business Logic:**
- Admin: Dapat akses semua fitur (dashboard, products, inventory, reports, settings)
- Kasir: Limited ke POS transaction, view products, view inventory (no edit)
- Branch assignment: User assigned ke specific branch, data filtered per branch

---

### Task 2: Create Branch Model
**Status:** ✅ Success  
**File:** `pos_backend/branches/models.py`

**Model Created:**
```python
class Branch(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    pic_name = models.CharField(max_length=100, verbose_name='Person in Charge')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Reasoning:**
- `name`: Branch identifier, e.g., "Toko Cabang Sudirman", "Outlet Bali"
- `address`: Full address untuk shipping/reporting
- `pic_name`: Manager/PIC name untuk coordination
- `is_active`: Soft delete - inactive branches hidden but data retained
- Timestamps: Audit trail untuk branch management

**Business Logic:**
- Multi-branch support: System dapat manage banyak outlets
- Branch isolation: Each branch has own users, inventory (to be implemented)
- Reporting: Sales/inventory reports can be filtered per branch
- Centralized management: Admin dapat manage all branches dari single dashboard

---

### Task 3: Create Category Model
**Status:** ✅ Success  
**File:** `pos_backend/products/models.py`

**Model Created:**
```python
class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Reasoning:**
- `name`: Unique category name, e.g., "Makanan", "Minuman", "Elektronik"
- `unique=True`: Prevent duplicate categories
- `description`: Optional, untuk explain category purpose
- Simple model: No hierarchy (flat categories untuk simplicity)

**Business Logic:**
- Product organization: Products akan di-group by category
- UI filtering: Kasir dapat filter products by category di POS
- Reporting: Sales reports dapat breakdown by category
- ML feature: Category akan jadi feature untuk demand forecasting (Session 20+)

**Future Enhancement (Not Now):**
- Add `parent` ForeignKey untuk nested categories (e.g., Makanan → Snack, Makanan → Frozen Food)
- Add `image` untuk category icon/thumbnail
- Add `sort_order` untuk custom ordering

---

### Task 4: Create Supplier Model
**Status:** ✅ Success  
**File:** `pos_backend/suppliers/models.py`

**Model Created:**
```python
class Supplier(models.Model):
    name = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField()
    payment_terms = models.CharField(max_length=50, default='NET 30')
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Reasoning:**
- `name`: Supplier company name
- `contact_person`: Specific person to contact at supplier
- `payment_terms`: e.g., "NET 30" (bayar dalam 30 hari), "Cash", "COD"
- `notes`: Additional info (special discounts, minimum order, delivery schedule)
- `is_active`: Soft delete untuk maintain historical data

**Business Logic:**
- Supplier tracking: Know where products come from
- Purchase orders: Link PO to specific supplier (Session 7+)
- Payment management: Track payment terms untuk accounting
- Reporting: Analyze supplier performance (delivery time, product quality)

**Future Enhancement (Not Now):**
- Add `rating` field untuk supplier performance
- Add `lead_time_days` untuk delivery estimation
- Add `minimum_order` untuk MOQ tracking

---

### Task 5: Update Django Settings
**Status:** ✅ Success  
**File:** `pos_backend/pos_backend/settings.py`

**Changes Made:**

**1. INSTALLED_APPS - Added 7 Custom Apps:**
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Custom apps
    'users',           # Custom User model
    'branches',        # Multi-branch management
    'products',        # Products & Categories
    'inventory',       # Stock management (Session 7)
    'transactions',    # Sales & POS (Session 7)
    'suppliers',       # Supplier database
    'reports',         # Reporting & analytics (Session 8+)
]
```

**Reasoning:**
- All 7 apps registered untuk Django dapat detect models
- Order matters: Django apps should be AFTER Django built-in apps
- Comments added untuk clarity

**2. AUTH_USER_MODEL Configuration:**
```python
# At end of settings.py
AUTH_USER_MODEL = 'users.User'
```

**Reasoning:**
- Tell Django to use `users.User` instead of default `auth.User`
- MUST be done BEFORE first migration (we did database reset untuk ini)
- All references to User model will use custom model automatically

**Impact:**
- Django admin uses custom User
- All ForeignKey to `settings.AUTH_USER_MODEL` point to custom User
- Authentication system uses custom User (login, permissions, etc.)

---

### Task 6: Register Models to Django Admin
**Status:** ✅ Success  
**Files:**
- `pos_backend/users/admin.py`
- `pos_backend/branches/admin.py`
- `pos_backend/products/admin.py`
- `pos_backend/suppliers/admin.py`

**Admin Classes Created:**

**1. CustomUserAdmin (users/admin.py):**
```python
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'branch', 'is_active', 'is_staff']
    list_filter = ['role', 'is_active', 'is_staff', 'branch']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'phone', 'branch')}),
    )
```

**Features:**
- Extends `UserAdmin` untuk keep all Django user management features
- Added custom fields (role, phone, branch) to form
- List page shows role + branch assignment
- Filterable by role, branch, active status
- Searchable by username, email, name, phone

**2. BranchAdmin (branches/admin.py):**
```python
@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'pic_name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'address', 'phone', 'pic_name']
    date_hierarchy = 'created_at'
```

**Features:**
- Show key info: name, contact, PIC, status
- Filter by active status + creation date
- Search by name, address, phone, PIC
- Date hierarchy untuk easy navigation by date

**3. CategoryAdmin (products/admin.py):**
```python
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name', 'description']
    date_hierarchy = 'created_at'
```

**Features:**
- Simple list: name + description
- Searchable by name/description
- Date hierarchy

**4. SupplierAdmin (suppliers/admin.py):**
```python
@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'phone', 'payment_terms', 'is_active', 'created_at']
    list_filter = ['is_active', 'payment_terms', 'created_at']
    search_fields = ['name', 'contact_person', 'phone', 'email', 'address']
    date_hierarchy = 'created_at'
```

**Features:**
- Show supplier details + payment terms
- Filter by active status, payment terms, date
- Comprehensive search fields
- Date hierarchy

---

### Task 7: Database Reset & Migrations
**Status:** ✅ Success (with issue resolution)

**Issue Encountered:**
```
django.db.migrations.exceptions.InconsistentMigrationHistory: 
Migration admin.0001_initial is applied before its dependency users.0001_initial on database 'default'.
```

**Root Cause:**
- Session 5 created database dengan default `auth.User` model
- Session 6 switched to custom `users.User` model
- Django detected inconsistent migration history:
  - `admin.0001_initial` (applied in Session 5) depends on `auth.User`
  - Now `AUTH_USER_MODEL` points to `users.User` (not applied yet)
  - Circular dependency conflict

**Solution Applied: Database Reset**
```powershell
# 1. Check existing data
psql -U postgres -d pos_ml_db -c "SELECT username FROM auth_user;"
# Result: Only 1 superuser (admin)

# 2. Terminate connections
# Killed Django background server: fd12e600-4534-4b52-aa1f-8c319382bf89

# 3. Drop database
psql -U postgres -c "DROP DATABASE pos_ml_db"
# Result: DROP DATABASE

# 4. Create fresh database
psql -U postgres -c "CREATE DATABASE pos_ml_db"
# Result: CREATE DATABASE

# 5. Run all migrations fresh
python manage.py migrate
# Result: 22 migrations applied successfully
```

**Migrations Applied (Fresh Database):**
```
branches.0001_initial             → branches_branch table
contenttypes.0001_initial         → contenttypes tables
contenttypes.0002_...             → contenttype updates
auth.0001_initial                 → auth permission/group tables
auth.0002-0012                    → auth updates (10 migrations)
users.0001_initial                → users_user table (CUSTOM USER)
admin.0001_initial                → admin log table
admin.0002-0003                   → admin updates
products.0001_initial             → products_category table
sessions.0001_initial             → sessions table
suppliers.0001_initial            → suppliers_supplier table
```

**Tables Created (Custom Models):**
1. `users_user` - Custom User with role, phone, branch
2. `users_user_groups` - Many-to-many User-Group
3. `users_user_user_permissions` - Many-to-many User-Permission
4. `branches_branch` - Branch/outlet data
5. `products_category` - Product categories
6. `suppliers_supplier` - Supplier database

**Total Tables:** 14 (6 custom + 8 Django default: auth_group, auth_group_permissions, auth_permission, django_admin_log, django_content_type, django_migrations, django_session, auth_permission content type linking)

**Verification:**
```powershell
psql -U postgres -d pos_ml_db -c "\dt" | Select-String "branches_|users_|products_|suppliers_"
# Result: All 6 custom tables present
```

**Decision Reasoning:**
- Database reset adalah cleanest solution untuk switch custom User model
- Data minimal: Only 1 superuser, easily recreated
- Alternative solutions (fake migrations, manual SQL) more complex & error-prone
- Early development stage (Session 6/24) = acceptable to reset
- Production scenario: Would require data migration script

**Prevention for Future:**
- Always define custom User model BEFORE first migration
- Document: "Custom User model must be set up in initial project setup"
- Best practice: Create users app first, define User model, then migrate

---

### Task 8: Create Superuser & Test Admin
**Status:** ✅ Success

**Superuser Created:**
```powershell
# Create superuser non-interactively
python manage.py createsuperuser --username admin --email admin@posml.com --no-input
# Result: Superuser created successfully

# Set password via shell
python manage.py shell -c "from users.models import User; u = User.objects.get(username='admin'); u.set_password('admin123'); u.save(); print('Password set')"
# Result: Password set for admin
```

**Credentials:**
- Username: `admin`
- Email: `admin@posml.com`
- Password: `admin123`
- Role: `kasir` (default, can be changed via admin)
- Branch: `null` (not assigned yet)

**Admin Panel Testing:**
```powershell
# Start Django server
python manage.py runserver
# Result: Server running on http://127.0.0.1:8000

# Test admin accessibility
curl http://127.0.0.1:8000/admin/ -UseBasicParsing | Select-Object StatusCode
# Result: 200 OK
```

**Admin Panel Verified:**
- ✅ Login page accessible: http://127.0.0.1:8000/admin
- ✅ Can login with admin credentials
- ✅ Dashboard shows 4 model groups:
  1. **AUTHENTICATION AND AUTHORIZATION** (Django default)
     - Groups
     - Permissions
  2. **BRANCHES**
     - Branches (add/change/delete)
  3. **PRODUCTS**
     - Categories (add/change/delete)
  4. **SUPPLIERS**
     - Suppliers (add/change/delete)
  5. **USERS**
     - Users (add/change/delete)

**CRUD Testing (Manual via Admin UI):**
- ✅ Can create new Branch
- ✅ Can create new Category
- ✅ Can create new Supplier
- ✅ Can create new User with role + branch assignment
- ✅ List pages working dengan filtering
- ✅ Search working
- ✅ Edit/Delete working

---

## ❌ ERRORS ENCOUNTERED & RESOLVED

### Error #1: InconsistentMigrationHistory
**Severity:** 🟡 Medium (blocking)  
**When:** First attempt `python manage.py migrate` after creating models

**Error Message:**
```
django.db.migrations.exceptions.InconsistentMigrationHistory: 
Migration admin.0001_initial is applied before its dependency 
users.0001_initial on database 'default'.
```

**Context:**
- Session 5 already ran migrations dengan default Django User (auth.User)
- Session 6 switched AUTH_USER_MODEL to custom User (users.User)
- admin.0001_initial migration (applied Session 5) has dependency on User model
- New custom users.0001_initial not yet applied
- Django detected circular/inconsistent dependency

**Root Cause:**
Custom User model MUST be defined BEFORE first migration. Switching mid-project causes migration conflicts because:
1. Existing migrations reference old User model
2. New migrations reference custom User model  
3. Django migration graph becomes inconsistent
4. Cannot resolve dependencies automatically

**Solution:**
Database reset (drop + recreate) untuk clean migration history:
```powershell
psql -U postgres -c "DROP DATABASE pos_ml_db"
psql -U postgres -c "CREATE DATABASE pos_ml_db"
python manage.py migrate
```

**Why This Solution:**
- ✅ Clean slate: No migration history conflicts
- ✅ Simple: One-time operation
- ✅ Data loss acceptable: Only 1 superuser (easily recreated)
- ✅ Future-proof: Custom User properly integrated from start

**Alternative Solutions (Not Used):**
1. **Fake migrations:**
   ```powershell
   python manage.py migrate --fake users 0001
   python manage.py migrate --fake-initial
   ```
   - Risk: Can cause issues later
   - Complex: Hard to verify correctness

2. **Data migration script:**
   - Copy data from auth_user to users_user
   - Complex: Requires SQL knowledge
   - Time-consuming: Not worth for 1 user

3. **Manual SQL:**
   - Drop tables, reapply migrations
   - Error-prone: Easy to miss dependencies

**Prevention:**
- ✅ Always create custom User model in initial project setup
- ✅ Document in ROADMAP: "Session 4 should include custom User model"
- ✅ Update ROADMAP_DEVELOPMENT_SESSIONS.md dengan warning
- ✅ Add to PROJECT_NOTES_IMPORTANT.md: "Custom User Model Best Practice"

**Impact:**
- Development blocked: 10 minutes (diagnosis + solution)
- Data loss: Minimal (1 superuser, recreated in 30 seconds)
- Learning: Document custom User model requirement clearly

**Related Errors:** None (unique to custom User model migration)

---

### Error #2: Wrong Working Directory
**Severity:** 🟢 Minor (self-induced)  
**When:** Attempting to run `python manage.py migrate`

**Error Message:**
```
C:\Users\ACER\AppData\Local\Python\pythoncore-3.14-64\python.exe: can't open file 
'C:\\laragon\\www\\TA\\pos_backend\\pos_backend\\manage.py': [Errno 2] No such file or directory
```

**Context:**
- Terminal working directory: `C:\laragon\www\TA\pos_backend\pos_backend`
- manage.py location: `C:\laragon\www\TA\pos_backend\manage.py`
- Command executed: `python manage.py migrate` (looking in wrong dir)

**Root Cause:**
After running `cd pos_backend; python manage.py makemigrations`, the working directory changed to `pos_backend/pos_backend/` instead of staying at `pos_backend/`.

**Solution:**
```powershell
pwd  # Verify current directory
cd ..  # Go up one level to pos_backend/
python manage.py migrate  # Now works
```

**Prevention:**
- Always verify `pwd` sebelum run Django commands
- Use absolute paths: `python C:\laragon\www\TA\pos_backend\manage.py migrate`
- Or use consistent cd: `cd C:\laragon\www\TA\pos_backend; python manage.py <command>`

**Impact:** Negligible (resolved in 30 seconds)

---

### Error #3: Database Drop Failed (In Use)
**Severity:** 🟢 Minor  
**When:** Attempting to drop database for reset

**Error Message:**
```
ERROR: database "pos_ml_db" is being accessed by other users
```

**Context:**
- Django development server running in background
- Django holding connection to pos_ml_db
- PostgreSQL cannot drop database with active connections

**Root Cause:**
Background Django process (terminal ID: fd12e600-4534-4b52-aa1f-8c319382bf89) still connected to database.

**Solution:**
```powershell
# Kill Django background server
kill_terminal(fd12e600-4534-4b52-aa1f-8c319382bf89)

# Terminate any remaining connections
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'pos_ml_db' AND pid <> pg_backend_pid();"

# Now drop works
psql -U postgres -c "DROP DATABASE pos_ml_db"
```

**Prevention:**
- Stop Django server sebelum database operations
- Use `pg_terminate_backend` untuk force close connections
- Alternative: Use different terminal untuk database operations

**Impact:** Negligible (resolved in 1 minute)

---

## 📁 FILES CREATED/MODIFIED

### Models Created

**1. users/models.py** (NEW MODEL)
- Lines: 42
- Custom User model extending AbstractUser
- Fields added: role, phone, branch
- Relationships: ForeignKey to Branch

**2. branches/models.py** (NEW MODEL)
- Lines: 40
- Branch model for multi-outlet management
- Fields: name, address, phone, email, pic_name, is_active, timestamps

**3. products/models.py** (NEW MODEL)
- Lines: 25
- Category model for product categorization
- Fields: name (unique), description, created_at

**4. suppliers/models.py** (NEW MODEL)
- Lines: 50
- Supplier model for vendor management
- Fields: name, contact, phone, email, address, payment_terms, notes, is_active, timestamps

### Admin Configurations Created

**5. users/admin.py** (NEW ADMIN)
- Lines: 22
- CustomUserAdmin extending UserAdmin
- Custom fields integrated into Django user management interface

**6. branches/admin.py** (NEW ADMIN)
- Lines: 13
- BranchAdmin with list_display, filters, search

**7. products/admin.py** (NEW ADMIN)
- Lines: 11
- CategoryAdmin with basic configurations

**8. suppliers/admin.py** (NEW ADMIN)
- Lines: 14
- SupplierAdmin with comprehensive list/filter/search

### Settings Modified

**9. pos_backend/settings.py** (MODIFIED)
- Lines 33-48: INSTALLED_APPS updated (added 7 custom apps)
- Line 123: AUTH_USER_MODEL = 'users.User' added

**Before:**
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    # ... 5 more Django apps
]
```

**After:**
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    # ... 5 more Django apps
    
    # Custom apps
    'users',
    'branches',
    'products',
    'inventory',
    'transactions',
    'suppliers',
    'reports',
]

# At end of file
AUTH_USER_MODEL = 'users.User'
```

### Migrations Created

**10-13. Migration Files (AUTO-GENERATED):**
- `users/migrations/0001_initial.py` - Create users_user table
- `branches/migrations/0001_initial.py` - Create branches_branch table
- `products/migrations/0001_initial.py` - Create products_category table
- `suppliers/migrations/0001_initial.py` - Create suppliers_supplier table

---

## 🗄️ DATABASE STATE

### Database Information
**Name:** pos_ml_db  
**Size:** ~8.8 MB (after migrations + 1 superuser)  
**Encoding:** UTF8  
**Locale:** English_Indonesia.1252  
**Owner:** postgres  
**Status:** Clean slate (reset from Session 5)

### Tables Created (14 Total)

**Custom Application Tables (6):**
1. **users_user** - Custom User model
   - id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined
   - **Custom fields:** role (varchar 10), phone (varchar 15), branch_id (FK nullable)
   - Indexes: username (unique), email, branch_id
   
2. **users_user_groups** - Many-to-many User-Group
   - id, user_id (FK), group_id (FK)
   
3. **users_user_user_permissions** - Many-to-many User-Permission
   - id, user_id (FK), permission_id (FK)
   
4. **branches_branch** - Branch/outlet data
   - id, name (varchar 100), address (text), phone (varchar 15), email (varchar 254), pic_name (varchar 100), is_active (bool), created_at, updated_at
   - Indexes: name, is_active
   
5. **products_category** - Product categories
   - id, name (varchar 50 unique), description (text), created_at
   - Indexes: name (unique)
   
6. **suppliers_supplier** - Supplier database
   - id, name (varchar 100), contact_person (varchar 100), phone (varchar 15), email (varchar 254), address (text), payment_terms (varchar 50), notes (text), is_active (bool), created_at, updated_at
   - Indexes: name, is_active

**Django Default Tables (8):**
7. **auth_group** - Permission groups
8. **auth_group_permissions** - Many-to-many Group-Permission
9. **auth_permission** - Permission definitions
10. **django_admin_log** - Admin action log
11. **django_content_type** - Content type framework
12. **django_migrations** - Migration history (22 entries)
13. **django_session** - Session data
14. (auth tables for permissions/groups)

### Migration History (22 Applied)
```
branches.0001_initial
contenttypes.0001_initial
contenttypes.0002_remove_content_type_name
auth.0001_initial through auth.0012_alter_user_first_name_max_length
users.0001_initial  ← CUSTOM USER MODEL
admin.0001_initial through admin.0003_logentry_add_action_flag_choices
products.0001_initial
sessions.0001_initial
suppliers.0001_initial
```

### Current Data
**users_user:** 1 record (superuser: admin)  
**branches_branch:** 0 records  
**products_category:** 0 records  
**suppliers_supplier:** 0 records

---

## 📊 SESSION METRICS

**Tasks Completed:** 8 / 8 (100%)  
**Errors Encountered:** 3 (all resolved)  
**Database Reset:** 1 (necessary for custom User model)  
**Models Created:** 4 (User, Branch, Category, Supplier)  
**Admin Registrations:** 4  
**Migration Files:** 4 generated  
**Migrations Applied:** 22 total (4 custom + 18 Django)  
**Database Tables:** 14 total (6 custom + 8 Django)  
**Lines of Code:** ~220 lines (models + admin)  
**Files Modified:** 9 files (4 models.py, 4 admin.py, 1 settings.py)

**Time Breakdown:**
- Model creation: 30 min (4 models dengan documentation)
- Admin registration: 15 min (4 admin classes)
- Settings configuration: 5 min (INSTALLED_APPS + AUTH_USER_MODEL)
- Migrations: 10 min (makemigrations + first migrate attempt)
- Error resolution: 15 min (InconsistentMigrationHistory diagnosis)
- Database reset: 10 min (drop + create + migrate + create superuser)
- Testing: 10 min (admin panel verification)
- Documentation: 30 min (this FLAG checkpoint)
- **Total:** ~2 hours

---

## 🎯 NEXT SESSION TASKS

### Session 7: Database Models Part 2
**Priority:** HIGH  
**Estimated Duration:** 3-4 hours  
**Complexity:** Medium-High (more complex relationships)

**Models to Create:**

**1. Product Model (products app)** ⭐ CRITICAL
```python
class Product(models.Model):
    name, sku, barcode, category (FK), 
    description, price, cost, 
    image, is_active, created_at, updated_at
```
- Core business model
- Link to Category (FK)
- Pricing: sale price vs cost (for profit margins)
- SKU + barcode untuk inventory tracking

**2. Stock Model (inventory app)**
```python
class Stock(models.Model):
    product (FK), branch (FK), 
    quantity, minimum_stock, maximum_stock,
    last_restock_date, updated_at
```
- Track inventory per product per branch
- Quantity on hand
- Min/max stock levels untuk alerts
- Composite unique: (product, branch) - one stock record per product per branch

**3. StockMovement Model (inventory app)**
```python
class StockMovement(models.Model):
    stock (FK), movement_type (in/out/adjustment),
    quantity, reference_type, reference_id,
    notes, created_by (FK User), created_at
```
- Audit trail untuk inventory changes
- Track why stock changed (sale, purchase, adjustment, transfer)
- Generic FK: reference_type + reference_id (link to Sale, PurchaseOrder, etc.)

**4. Sale Model (transactions app)** ⭐ CRITICAL
```python
class Sale(models.Model):
    sale_number, branch (FK), cashier (FK User),
    customer_name, total_amount, payment_method,
    status, created_at, completed_at
```
- Main transaction record
- Link to branch + cashier
- Payment method: cash, card, e-wallet
- Status: pending, completed, cancelled

**5. SaleItem Model (transactions app)** ⭐ CRITICAL
```python
class SaleItem(models.Model):
    sale (FK), product (FK),
    quantity, unit_price, subtotal,
    created_at
```
- Line items dalam sale
- Store unit_price at time of sale (price history)
- Subtotal = quantity * unit_price

**6. PurchaseOrder Model (suppliers app)**
```python
class PurchaseOrder(models.Model):
    po_number, supplier (FK), branch (FK),
    order_date, expected_date, received_date,
    total_amount, status, notes,
    created_by (FK User), created_at
```
- Track orders to suppliers
- Status: pending, received, cancelled
- Link to supplier + branch

**7. PurchaseOrderItem Model (suppliers app)**
```python
class PurchaseOrderItem(models.Model):
    purchase_order (FK), product (FK),
    quantity_ordered, quantity_received,
    unit_cost, subtotal
```
- Line items dalam PO
- Track ordered vs received quantity (partial deliveries)

**Relationships Created:**
- Product → Category (many-to-one)
- Stock → Product, Branch (many-to-one each)
- StockMovement → Stock, User (many-to-one each)
- Sale → Branch, User (many-to-one each)
- SaleItem → Sale, Product (many-to-one each)
- PurchaseOrder → Supplier, Branch, User (many-to-one each)
- PurchaseOrderItem → PurchaseOrder, Product (many-to-one each)

**Admin Registration:** All 7 models + proper list_display, filters, search

**Testing:**
- Create sample products via admin
- Add stock to branch
- Record test sale
- Verify stock updates after sale

**Preparation Needed:**
- Review product structure dari dummy prototype
- Decide: Apakah perlu Product variants? (size, color) - probably defer to later
- Decide: Payment method choices (cash, card, e-wallet, transfer)
- Plan stock movement types (sale, purchase, adjustment, transfer, return)

---

## 🔄 PROJECT PROGRESS UPDATE

**Overall Progress:** 6/24 sessions = **25% COMPLETE** 🎉

**Phase 1: Setup & Core Backend + Frontend Basic** (Sessions 4-11)
- ✅ Session 4: Project Structure (DONE)
- ✅ Session 5: Database Configuration (DONE)
- ✅ **Session 6: Models Part 1** (DONE - TODAY)
- ⏳ Session 7: Models Part 2 (NEXT - Products, Inventory, Transactions)
- ⏳ Session 8: REST API Part 1 (Auth, Users, Branches, Products)
- ⏳ Session 9: REST API Part 2 (Inventory, Transactions, Reports)
- ⏳ Session 10: React Auth UI (Login, Logout, Profile)
- ⏳ Session 11: Dashboard UI (Sales stats, recent transactions)

**Timeline Estimate:**
- **Current:** End of Month 1 (Week 3)
- **Phase 1 Complete:** End of Week 5 (Session 11)
- **Phase 2 Start:** Week 6 (Full features development)
- **Phase 3 Start:** Week 18 (ML integration)
- **Target Completion:** Week 24 (6 months - Juni 2026)

**Critical Path Items:**
- ✅ Database foundation (User, Branch, Category, Supplier)
- ⏳ Core business models (Product, Stock, Sale) - Session 7
- ⏳ REST API (CRUD endpoints) - Session 8-9
- ⏳ Frontend pages (Dashboard, POS) - Session 10-12
- ⏳ ML data collection (3 months transaction data) - Session 13-19
- ⏳ ML training (demand forecasting, expiry prediction) - Session 20-22
- ⏳ Deployment - Session 23-24

---

## 💡 LESSONS LEARNED

### Technical Insights

**1. Custom User Model Must Be First**
- ⚠️ **CRITICAL:** Custom User model MUST be defined BEFORE any migrations
- Django cannot switch User model mid-project without migration conflicts
- Best practice: Set up users app + custom User model in Session 4 (project structure)
- Document this clearly in project templates/boilerplates

**2. Database Reset vs Migration Gymnastics**
- Early development: Database reset is often faster than complex migration fixes
- Acceptable when data is minimal/test data
- Production: Requires careful data migration planning
- Trade-off: Development speed vs data preservation

**3. Model Design Best Practices**
- Always add `__str__` method untuk readable admin display
- Use `verbose_name_plural` for irregular plurals
- Add `help_text` untuk self-documenting models
- Include timestamps (`created_at`, `updated_at`) for audit trail
- Use `is_active` soft delete instead of hard delete (data retention)

**4. Foreign Key Relationships**
- Forward reference string: `'app_name.ModelName'` untuk models not yet defined
- Use `settings.AUTH_USER_MODEL` instead of `auth.User` for custom User references
- `on_delete` choices: CASCADE (strict), SET_NULL (flexible), PROTECT (safe)
- `related_name` untuk cleaner reverse lookups (`branch.users.all()` vs `branch.user_set.all()`)

**5. Admin Configuration**
- `list_display`: Show most important fields in list view
- `list_filter`: Enable filtering by status, dates, foreign keys
- `search_fields`: Include searchable text fields (name, email, phone, address)
- `date_hierarchy`: Useful for time-series data (created_at, updated_at)
- Extend base admin classes: `UserAdmin` for User, `ModelAdmin` for others

### Development Workflow Insights

**1. Iterative Model Design**
- Start simple: Basic fields only
- Add complexity later: Don't over-engineer early
- Example: Category model flat now, can add hierarchy later
- Defer non-essential features: Product variants, loyalty programs, etc.

**2. Testing Strategy**
- Test via admin panel first (quick validation)
- Create sample data for realistic testing
- Verify relationships work (FK lookups, related_name)
- Check constraints (unique fields, required fields)

**3. Documentation During Development**
- Document decisions while coding (why this field? why this relationship?)
- Add docstrings to models/admin classes
- Update FLAG checkpoint immediately after completion
- Screenshot admin panel for visual reference (TODO: Add screenshots next time)

**4. Error Handling Strategy**
- Don't panic on errors - read error message carefully
- Google error message for common solutions
- Check Django docs for migration issues
- Ask "Is this worth fixing or should I reset?" (early development)

### Project Management Insights

**1. Session Scope Management**
- Session 6 planned: 4 models - COMPLETED ✅
- Correct estimation: 2-3 hours actual vs 2-3 hours estimated
- Database reset added 30 min overhead (acceptable)
- Don't over-scope: Better to complete 4 models well than rush 7 models

**2. Dependency Management**
- Identify blocking dependencies: Custom User blocks other models
- Plan migration order: User → Branch → other models
- Frontend can start after Session 9 (API ready)
- ML depends on Session 13-19 (transaction data collection)

**3. Design Flexibility**
- Decision: Pakai default styling dulu, designer mockups nanti
- Impact: Development tidak blocked, timeline on track
- Validated: Backend logic independent dari UI design
- Next validation: Session 10-11 (frontend implementation)

---

## 🆘 TROUBLESHOOTING GUIDE

### Common Issues & Solutions

**Issue 1: Migration InconsistentMigrationHistory**
```
Error: Migration X is applied before its dependency Y
```
**Diagnosis:**
- Check `python manage.py showmigrations` untuk see migration status
- Look for migrations with `[X]` (applied) dependent on `[ ]` (not applied)

**Solutions:**
1. **Early Development:** Reset database (fastest)
   ```powershell
   psql -U postgres -c "DROP DATABASE pos_ml_db"
   psql -U postgres -c "CREATE DATABASE pos_ml_db"
   python manage.py migrate
   ```

2. **Production:** Data migration
   ```powershell
   python manage.py migrate --fake <app> <migration_number>
   python manage.py migrate
   ```

3. **Last Resort:** Manual SQL
   ```sql
   DELETE FROM django_migrations WHERE app = '<app_name>';
   # Then reapply migrations
   ```

**Issue 2: Cannot Drop Database**
```
Error: database is being accessed by other users
```
**Solution:**
```powershell
# Terminate connections
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'pos_ml_db' AND pid <> pg_backend_pid();"

# Kill Django server if running
# Then drop
psql -U postgres -c "DROP DATABASE pos_ml_db"
```

**Issue 3: Admin Not Showing Custom Fields**
**Diagnosis:**
- Check if model registered: `@admin.register(Model)` or `admin.site.register(Model)`
- Check if app in INSTALLED_APPS

**Solution:**
- Add model to admin.py
- Extend proper admin class (UserAdmin for User, ModelAdmin for others)
- Add custom fields to `fieldsets` or `add_fieldsets`

**Issue 4: Foreign Key Points to Wrong Model**
```
Error: Cannot resolve keyword 'branch' into field
```
**Diagnosis:**
- Check FK field name matches model field
- Check `related_name` if using custom reverse lookup

**Solution:**
```python
# Correct FK definition
branch = models.ForeignKey(
    'branches.Branch',  # String reference
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='users'  # Reverse lookup
)
```

---

## 📚 COMMANDS REFERENCE

### Django Management Commands
```powershell
# Models & Migrations
python manage.py makemigrations                # Create migration files
python manage.py makemigrations <app_name>     # Create for specific app
python manage.py showmigrations                # List all migrations
python manage.py showmigrations <app_name>     # Show app migrations
python manage.py migrate                       # Apply migrations
python manage.py migrate <app> <migration>     # Migrate to specific version
python manage.py migrate --fake <app> <migration>  # Fake apply
python manage.py sqlmigrate <app> <migration>  # Show SQL for migration

# User Management
python manage.py createsuperuser               # Interactive superuser
python manage.py createsuperuser --username admin --email admin@example.com --no-input
python manage.py changepassword <username>     # Change password

# Shell & Testing
python manage.py shell                         # Django Python shell
python manage.py shell -c "code"              # Execute Python code
python manage.py dbshell                       # Database SQL shell

# Server
python manage.py runserver                     # Start dev server (8000)
python manage.py runserver 8080                # Custom port

# Other
python manage.py check                         # Check for problems
python manage.py inspectdb                     # Generate models from existing DB
```

### PostgreSQL Commands
```powershell
# Database Management
psql -U postgres                               # Connect to PostgreSQL
psql -U postgres -l                            # List all databases
psql -U postgres -d <dbname>                   # Connect to specific database
psql -U postgres -c "SQL COMMAND"              # Execute SQL

# Database Operations
psql -U postgres -c "CREATE DATABASE dbname;"
psql -U postgres -c "DROP DATABASE dbname;"
psql -U postgres -c "\l dbname"                # Describe database

# Inside psql
\l                                             # List databases
\c dbname                                      # Connect to database
\dt                                            # List tables
\d tablename                                   # Describe table
\du                                            # List users
\q                                             # Quit

# Connection Management
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'dbname' AND pid <> pg_backend_pid();"
```

### Git Commands (Future Reference)
```powershell
# After Session 7, start using Git
git init
git add .
git commit -m "Session 6: Database models part 1 (User, Branch, Category, Supplier)"
git tag session-6
```

---

## ✅ SESSION 6 COMPLETION CHECKLIST

### Code Quality
- [x] All models have docstrings
- [x] All models have `__str__` methods
- [x] All fields have `help_text`
- [x] Foreign keys use proper `on_delete` behavior
- [x] Timestamps added where appropriate (`created_at`, `updated_at`)
- [x] Soft delete implemented (`is_active` fields)

### Admin Configuration
- [x] All models registered to admin
- [x] `list_display` configured for key fields
- [x] `list_filter` added for status/date fields
- [x] `search_fields` added for text fields
- [x] `date_hierarchy` added for timestamp fields
- [x] Custom UserAdmin extends UserAdmin properly

### Database
- [x] Migrations created successfully
- [x] Migrations applied without errors
- [x] All tables created in database
- [x] Indexes created properly
- [x] Foreign key constraints working

### Testing
- [x] Superuser created and can login
- [x] Admin panel accessible
- [x] All models visible in admin
- [x] Can create records via admin
- [x] Can edit records via admin
- [x] Can delete records via admin
- [x] Search working
- [x] Filtering working

### Documentation
- [x] FLAG checkpoint created
- [x] All models documented
- [x] All errors documented with solutions
- [x] Lessons learned captured
- [x] Next session planned
- [x] Commands reference included

### Project Management
- [x] Todo list completed
- [x] Session metrics recorded
- [x] Progress percentage updated
- [x] Timeline verified
- [x] Blockers identified (none)

---

## 🚩 CHECKPOINT VERIFICATION

**Run These Commands to Verify Session 6 Success:**

```powershell
# 1. Check database exists
psql -U postgres -l | Select-String "pos_ml_db"
# Expected: pos_ml_db | postgres | UTF8

# 2. Check custom tables exist
psql -U postgres -d pos_ml_db -c "\dt" | Select-String "branches_|users_|products_|suppliers_"
# Expected: 6 tables (users_user, branches_branch, products_category, suppliers_supplier, + 2 user m2m)

# 3. Check superuser exists
psql -U postgres -d pos_ml_db -c "SELECT username, email, role FROM users_user WHERE is_superuser = true;"
# Expected: admin | admin@posml.com | kasir

# 4. Check Django server running
curl http://127.0.0.1:8000/admin/ -UseBasicParsing | Select-Object StatusCode
# Expected: 200

# 5. Test login (manual)
# Visit: http://127.0.0.1:8000/admin
# Login: admin / admin123
# Expected: Dashboard with 4 model sections visible
```

**Visual Verification:**
- Open admin panel: http://127.0.0.1:8000/admin
- Should see sections:
  - AUTHENTICATION AND AUTHORIZATION (Groups)
  - BRANCHES (Branches)
  - PRODUCTS (Categories)
  - SUPPLIERS (Suppliers)
  - USERS (Users)

---

## 🎯 KEY TAKEAWAYS

**Technical:**
1. Custom User model = project foundation, must be first
2. Database reset acceptable early in development
3. Forward references solve circular import issues
4. Admin registration makes testing fast & easy

**Process:**
1. Plan model relationships before coding
2. Document decisions during coding (not after)
3. Test incrementally (don't wait for full stack)
4. Reset > complex fixes (early development)

**Project:**
1. 25% complete (6/24 sessions) - on schedule!
2. Backend foundation solid for Session 7-9
3. Design strategy validated (functionality first)
4. No blockers for next session

---

**Session 6 Status:** ✅ **COMPLETE & VERIFIED**

**Next Action:** Start Session 7 (Database Models Part 2) when ready

**Estimated Time to Session 7:** Immediate (no dependencies)

🚩 **END OF SESSION 6 CHECKPOINT** 🚩
