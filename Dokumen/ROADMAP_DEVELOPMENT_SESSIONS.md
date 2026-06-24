# 🗺️ ROADMAP DEVELOPMENT: SESSION BY SESSION
**Project**: Sistem POS dengan Machine Learning  
**Duration**: 6 Bulan (24 Minggu)  
**Date Created**: 6 Februari 2026

---

## 📋 OVERVIEW TIMELINE

```
Phase 1: Setup & Core (Month 1-2) → Session 4-11
Phase 2: Features (Month 3-4) → Session 12-19
Phase 3: ML Integration (Month 5-6) → Session 20-24
```

**Progress Saat Ini:**
- ✅ Session 1-2: Planning & Scoping (DONE)
- ✅ Session 3: Environment Setup (DONE)
- 🔜 Session 4: Project Structure Setup (NEXT!)

---

# 🚀 PHASE 1: SETUP & CORE FEATURES (Month 1-2)

## SESSION 4: CREATE PROJECT STRUCTURE (Week 1 - Day 1-2)

### **Goal:** Buat folder structure Django & React, test server running

### **Langkah-langkah:**

#### **Part 1: Create Django Project (Backend)**

**Step 1: Create Project**
```powershell
cd C:\laragon\www\TA
django-admin startproject pos_backend
cd pos_backend
```

**Step 2: Create Django Apps**
```powershell
python manage.py startapp users
python manage.py startapp products
python manage.py startapp inventory
python manage.py startapp transactions
python manage.py startapp branches
python manage.py startapp suppliers
python manage.py startapp reports
```

**Step 3: Verify Structure**
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

**Step 4: Test Django Server**
```powershell
python manage.py runserver
# Akses: http://localhost:8000
# Seharusnya muncul Django welcome page ✅
```

---

#### **Part 2: Create React Project (Frontend)**

**Step 1: Create Project dengan Vite**
```powershell
cd C:\laragon\www\TA
npm create vite@latest pos-frontend -- --template react
cd pos-frontend
```

**Step 2: Install Dependencies**
```powershell
# Base dependencies
npm install

# Additional packages
npm install axios react-router-dom
npm install chart.js react-chartjs-2
npm install @headlessui/react
npm install react-hot-toast
```

**Step 3: Install Tailwind CSS**
```powershell
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 4: Test React Server**
```powershell
npm run dev
# Akses: http://localhost:5173
# Seharusnya muncul Vite + React welcome ✅
```

---

#### **Part 3: Test Both Servers Running Together**

**Terminal 1 (Backend):**
```powershell
cd C:\laragon\www\TA\pos-backend
python manage.py runserver
```

**Terminal 2 (Frontend):**
```powershell
cd C:\laragon\www\TA\pos-frontend
npm run dev
```

**Verifikasi:**
- ✅ Backend: http://localhost:8000 (Django page)
- ✅ Frontend: http://localhost:5173 (React page)
- ✅ Keduanya jalan bersamaan tanpa error

---

#### **Deliverables Session 4:**
- ✅ Django project structure (7 apps)
- ✅ React project structure dengan Tailwind
- ✅ Both servers tested & running
- ✅ Dependencies installed

**Time Estimate:** 2-3 jam  
**Next:** Session 5 (Database Configuration)

---

## SESSION 5: DATABASE CONFIGURATION (Week 1 - Day 3)

### **Goal:** Setup PostgreSQL database, configure Django connection, create initial migrations

### **Langkah-langkah:**

#### **Part 1: Create Database**

**Step 1: Open psql**
```powershell
psql -U postgres
```

**Step 2: Create Database & User**
```sql
-- Create database
CREATE DATABASE pos_ml_db;

-- Create user (optional, bisa pakai postgres)
CREATE USER pos_admin WITH PASSWORD 'admin123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pos_ml_db TO pos_admin;

-- Exit
\q
```

**Step 3: Verify Database**
```powershell
psql -U postgres -l
# Seharusnya muncul pos_ml_db di list ✅
```

---

#### **Part 2: Configure Django Settings**

**Step 1: Edit pos_backend/settings.py**

```python
# Update INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'corsheaders',
    
    # Local apps
    'users',
    'products',
    'inventory',
    'transactions',
    'branches',
    'suppliers',
    'reports',
]

# Update MIDDLEWARE (add CORS)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # ADD THIS
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Update DATABASES
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pos_ml_db',
        'USER': 'postgres',  # atau 'pos_admin'
        'PASSWORD': '',  # kosong di Laragon, atau 'admin123' jika pakai pos_admin
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Add CORS settings (temporary, untuk development)
CORS_ALLOW_ALL_ORIGINS = True  # Di production, ganti dengan whitelist

# Add REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}
```

---

#### **Part 3: Test Database Connection**

**Step 1: Migrate Database**
```powershell
python manage.py migrate
# Seharusnya success, create tables bawaan Django ✅
```

**Step 2: Create Superuser**
```powershell
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: admin123
```

**Step 3: Test Django Admin**
```powershell
python manage.py runserver
# Akses: http://localhost:8000/admin
# Login dengan superuser credentials ✅
```

---

#### **Deliverables Session 5:**
- ✅ PostgreSQL database `pos_ml_db` created
- ✅ Django settings.py configured (CORS, REST, Database)
- ✅ Initial migrations completed
- ✅ Superuser created
- ✅ Django admin accessible

**Time Estimate:** 1-2 jam  
**Next:** Session 6 (Database Models - Part 1)

---

## SESSION 6: DATABASE MODELS - PART 1 (Week 1 - Day 4-5)

### **Goal:** Create database models untuk Users, Branches, Categories, Suppliers

### **Langkah-langkah:**

#### **Part 1: Users App (Custom User Model)**

**Step 1: Edit users/models.py**

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('kasir', 'Kasir'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='kasir')
    phone = models.CharField(max_length=15, blank=True)
    branch = models.ForeignKey('branches.Branch', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
```

**Step 2: Update settings.py**
```python
# Add at end of settings.py
AUTH_USER_MODEL = 'users.User'
```

---

#### **Part 2: Branches App**

**Step 1: Edit branches/models.py**

```python
from django.db import models

class Branch(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    pic_name = models.CharField(max_length=100, verbose_name='Person in Charge')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Branches'
    
    def __str__(self):
        return self.name
```

---

#### **Part 3: Categories & Suppliers**

**Step 1: Create products/models.py - Category**

```python
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name
```

**Step 2: Edit suppliers/models.py**

```python
from django.db import models

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
    
    def __str__(self):
        return self.name
```

---

#### **Part 4: Migrate Models**

**Step 1: Create Migrations**
```powershell
python manage.py makemigrations
# Seharusnya detect 4 models baru
```

**Step 2: Apply Migrations**
```powershell
python manage.py migrate
# Tables created: users_user, branches_branch, products_category, suppliers_supplier
```

**Step 3: Register to Admin**

**users/admin.py:**
```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'branch', 'is_active']
    list_filter = ['role', 'is_active', 'branch']
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'phone', 'branch')}),
    )
```

**branches/admin.py:**
```python
from django.contrib import admin
from .models import Branch

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'pic_name', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'address']
```

*(Similar for Category & Supplier)*

**Step 4: Test Django Admin**
```powershell
python manage.py runserver
# Akses http://localhost:8000/admin
# Verify semua models muncul ✅
```

---

#### **Deliverables Session 6:**
- ✅ User model (custom auth)
- ✅ Branch model
- ✅ Category model
- ✅ Supplier model
- ✅ All migrations applied
- ✅ All models registered in admin

**Time Estimate:** 3-4 jam  
**Next:** Session 7 (Database Models - Part 2)

---

## SESSION 7: DATABASE MODELS - PART 2 (Week 2 - Day 1-2)

### **Goal:** Create models untuk Products, Inventory, Transactions

### **Langkah-langkah:**

#### **Part 1: Product Model**

**Edit products/models.py:**

```python
from django.db import models
from suppliers.models import Supplier

class Product(models.Model):
    UNIT_CHOICES = [
        ('pcs', 'Pieces'),
        ('box', 'Box'),
        ('kg', 'Kilogram'),
        ('liter', 'Liter'),
        ('pack', 'Pack'),
    ]
    
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=20, unique=True)
    barcode = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='pcs')
    min_stock_alert = models.IntegerField(default=10)
    
    has_expiry = models.BooleanField(default=False)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    description = models.TextField(blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def profit_margin(self):
        if self.purchase_price > 0:
            return ((self.selling_price - self.purchase_price) / self.purchase_price) * 100
        return 0
    
    def __str__(self):
        return f"{self.name} ({self.sku})"
```

---

#### **Part 2: Inventory Models**

**Edit inventory/models.py:**

```python
from django.db import models
from products.models import Product
from branches.models import Branch

class ProductStock(models.Model):
    """Stock per produk per cabang"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stocks')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='stocks')
    quantity = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('product', 'branch')
        verbose_name_plural = 'Product Stocks'
    
    def __str__(self):
        return f"{self.product.name} at {self.branch.name}: {self.quantity}"

class ProductBatch(models.Model):
    """Batch tracking untuk produk dengan expiry date"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='batches')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='batches')
    batch_number = models.CharField(max_length=50)
    quantity = models.IntegerField()
    expiry_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.product.name} - Batch {self.batch_number}"

class StockMovement(models.Model):
    """History perubahan stok"""
    MOVEMENT_TYPE_CHOICES = [
        ('in', 'Stock IN'),
        ('out', 'Stock OUT'),
        ('transfer', 'Transfer'),
        ('adjustment', 'Adjustment'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movements')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPE_CHOICES)
    quantity = models.IntegerField()
    reference_number = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.get_movement_type_display()}: {self.product.name} ({self.quantity})"
```

---

#### **Part 3: Transaction Models**

**Edit transactions/models.py:**

```python
from django.db import models
from products.models import Product
from branches.models import Branch
from users.models import User

class Transaction(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('qris', 'QRIS'),
    ]
    
    transaction_id = models.CharField(max_length=20, unique=True)
    branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name='transactions')
    cashier = models.ForeignKey(User, on_delete=models.PROTECT, related_name='transactions')
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES)
    cash_received = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    change_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.transaction_id} - Rp {self.total}"

class TransactionItem(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    
    def __str__(self):
        return f"{self.product.name} x{self.quantity}"
```

---

#### **Part 4: Migrate & Register**

```powershell
# Install Pillow untuk ImageField
pip install Pillow

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Register semua model ke admin (products/admin.py, inventory/admin.py, transactions/admin.py)
```

---

#### **Deliverables Session 7:**
- ✅ Product model dengan profit_margin property
- ✅ ProductStock model (stock per branch)
- ✅ ProductBatch model (expiry tracking)
- ✅ StockMovement model (audit trail)
- ✅ Transaction & TransactionItem models
- ✅ All migrations applied
- ✅ Pillow installed (for ImageField)

**Time Estimate:** 4-5 jam  
**Next:** Session 8 (Django REST API - Part 1)

---

## SESSION 8: DJANGO REST API - PART 1 (Week 2 - Day 3-4)

### **Goal:** Create REST API endpoints untuk Authentication & Products

### **Langkah-langkah:**

#### **Part 1: Install JWT Authentication**

```powershell
pip install djangorestframework-simplejwt
```

**Update settings.py:**
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
```

---

#### **Part 2: Authentication Endpoints**

**Create users/serializers.py:**
```python
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'branch', 'phone', 'is_active']
        read_only_fields = ['id']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'branch', 'phone']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
```

**Create users/views.py:**
```python
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, UserCreateSerializer

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
```

**Create users/urls.py:**
```python
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('users/', views.UserListCreateView.as_view(), name='user_list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
]
```

**Update pos_backend/urls.py:**
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
]
```

---

#### **Part 3: Product API Endpoints**

**Create products/serializers.py:**
```python
from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    profit_margin = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = '__all__'
```

**Create products/views.py:**
```python
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'sku', 'barcode']
    ordering_fields = ['name', 'created_at', 'selling_price']

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
```

**Create products/urls.py & update main urls.py**

---

#### **Part 4: Test API dengan Postman atau Thunder Client**

**Test Authentication:**
```
POST http://localhost:8000/api/auth/login/
Body: {
  "username": "admin",
  "password": "admin123"
}
Response: {
  "access": "eyJ0eXAiOiJKV1...",
  "refresh": "eyJ0eXAiOiJKV1..."
}
```

**Test Get Products:**
```
GET http://localhost:8000/api/products/
Headers: Authorization: Bearer <access_token>
```

---

#### **Deliverables Session 8:**
- ✅ JWT authentication installed & configured
- ✅ Auth API endpoints (login, refresh, me, users)
- ✅ Product API endpoints (list, create, detail, update, delete)
- ✅ Category API endpoints
- ✅ Search & filtering implemented
- ✅ All APIs tested dengan Postman

**Time Estimate:** 4-5 jam  
**Next:** Session 9 (React Setup & Authentication UI)

---

## SESSION 9: REACT SETUP & AUTH UI (Week 2 - Day 5, Week 3 - Day 1)

### **Goal:** Setup React routing, Tailwind, create Login page & Auth context

### **Langkah-langkah:**

#### **Part 1: Configure Tailwind CSS**

**Edit tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      }
    },
  },
  plugins: [],
}
```

**Edit src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition;
  }
  
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary;
  }
  
  .card {
    @apply bg-white rounded-lg shadow p-6;
  }
}
```

---

#### **Part 2: Create Project Structure**

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Card.jsx
│   └── layout/
│       ├── Navbar.jsx
│       └── Sidebar.jsx
├── pages/
│   ├── auth/
│   │   └── Login.jsx
│   ├── admin/
│   │   ├── Dashboard.jsx
│   │   └── Products.jsx
│   └── kasir/
│       └── POS.jsx
├── context/
│   └── AuthContext.jsx
├── services/
│   └── api.js
├── utils/
│   └── constants.js
├── App.jsx
└── main.jsx
```

---

#### **Part 3: Setup API Service**

**Create src/services/api.js:**
```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

#### **Part 4: Create Auth Context**

**Create src/context/AuthContext.jsx:**
```javascript
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await api.get('/auth/me/');
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    await checkAuth();
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

#### **Part 5: Create Login Page**

**Create src/pages/auth/Login.jsx:**
```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">POS System Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

#### **Part 6: Setup Routing**

**Update src/App.jsx:**
```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

#### **Deliverables Session 9:**
- ✅ Tailwind CSS configured
- ✅ Project folder structure created
- ✅ API service with axios interceptors
- ✅ Auth context (login, logout, checkAuth)
- ✅ Login page UI
- ✅ React Router setup
- ✅ Protected routes (PrivateRoute)
- ✅ Toast notifications

**Time Estimate:** 4-5 jam  
**Next:** Session 10 (Admin Dashboard UI)

---

## SESSION 10-24: CONTINUING...

*(Document sudah panjang, saya lanjutkan di bagian bawah dengan ringkasan session berikutnya)*

---

# 📋 QUICK SUMMARY: SESSION 10-24

## SESSION 10: Admin Dashboard UI (Week 3)
- Create Dashboard layout (Sidebar, Navbar)
- Stats cards (Revenue, Transactions, Profit, Alerts)
- Charts (Revenue trend, Sales category pie chart)
- Top products table
- Recent transactions list

## SESSION 11: Product Management UI (Week 3-4)
- Product list page (table with search & filter)
- Add product form (with barcode generate)
- Edit product form
- Delete product (confirmation modal)
- Product detail modal

## SESSION 12: POS Transaction UI - Kasir (Week 4-5) ⭐ CRITICAL
- POS layout (split: cart & payment)
- Barcode scanner integration
- Add item to cart
- Calculate subtotal, tax, total
- Payment methods (Cash, Card, QRIS)
- Print receipt
- Transaction success modal

## SESSION 13: Inventory Management UI (Week 5-6)
- Stock list per branch
- Stock IN form
- Stock OUT form
- Stock transfer form
- Low stock alerts
- Batch management (for products with expiry)

## SESSION 14: Transaction History (Week 6)
- Transaction list (admin & kasir)
- Filter by date, payment method, branch
- Transaction detail modal
- Reprint receipt
- Export to Excel

## SESSION 15: Reports UI (Week 7)
- Financial report (revenue, profit)
- Inventory report
- Product performance report
- Branch performance report
- Export reports to PDF/Excel

## SESSION 16: Branch & Supplier Management (Week 7-8)
- Branch list, add, edit, delete
- Supplier list, add, edit, delete
- User management (admin only)

## SESSION 17: Settings & Profile (Week 8)
- Business profile settings
- POS settings
- User profile
- Change password

## SESSION 18: Testing & Bug Fixes (Week 9-10)
- End-to-end testing
- Fix bugs
- UI/UX improvements
- Performance optimization

## SESSION 19: Deployment Preparation (Week 11-12)
- Setup production database
- Configure environment variables
- Build React for production
- Deploy backend (Railway/Heroku)
- Deploy frontend (Vercel)

## SESSION 20-22: ML Data Collection & Training (Week 13-18)
- Collect transaction data (3+ months)
- Data preprocessing
- Feature engineering
- Train demand forecasting model (Prophet/ARIMA)
- Train expiry prediction model
- Model validation (target >85% accuracy)

## SESSION 23: ML Integration to UI (Week 19-22)
- ML Predictions page UI
- Stockout alerts
- Expiry warnings
- Overstock detection
- Restock recommendations
- Forecast detail modal

## SESSION 24: Final Testing & Documentation (Week 23-24)
- Complete testing (ML + Web)
- Write documentation (user manual)
- Create demo video
- Prepare TA presentation
- Final submission

---

**Total Sessions:** 24 sessions  
**Time per session:** 3-5 hours  
**Total estimated hours:** 96-120 hours (coding time only)

**Current Progress:**
- ✅ Session 1-3: Planning & Setup (DONE)
- 🔜 Session 4: Next (Create project structure)

---

**Saved:** 6 Februari 2026  
**File:** ROADMAP_DEVELOPMENT_SESSIONS.md
