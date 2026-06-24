# Authentication & Onboarding Flow
**Tanggal:** 3 Maret 2026  
**Status:** Design Specification untuk Database Session 5-6

---

## REGISTRATION FLOW (Owner/Admin)

### Step 1: Klik Registrasi
Landing page → Klik "Daftar" → Form registrasi

### Step 2: Input Email
- Input email
- Klik "Kirim Kode Verifikasi"
- Backend: Generate token, kirim email dengan link verifikasi
- Token expiry: **10 menit**

### Step 3: Verifikasi Email
- User cek email
- Klik link verifikasi
- Redirect ke halaman set password

### Step 4: Set Password
- Form: Password + Confirm Password
- Password minimal 8 karakter
- Klik "Lanjutkan"

### Step 5: Input Data Usaha
**Form fields:**
- Nama Usaha (required)
- Nomor HP (required)
- Alamat Usaha (optional)
- Jenis Usaha (optional dropdown?)

Klik "Selesaikan Pendaftaran"

### Step 6: Auto Login → Dashboard
- Akun created, auto login
- Masuk ke dashboard
- **Onboarding modal/popup muncul**

---

## ONBOARDING WIZARD (First Login)

**Format:** Modal/Popup

**Konten:**
- Gambar illustrasi
- Teks penjelasan step by step
- Guide penggunaan sistem (alur lengkap)

**Steps dalam wizard:**
1. Welcome screen
2. Cara input produk
3. Cara kelola stok
4. Cara transaksi
5. Cara buat akun kasir
6. Cara pakai ML predictions

**User action:** Klik "Next" atau "Skip" atau "Selesai"

---

## LOGIN FLOW

### Semua User (Admin & Kasir)
- Landing page: Form login (email + password)
- Klik "Login"
- Redirect ke dashboard (sesuai role)

### Lupa Password
- Klik "Lupa Password?"
- Input email → Klik "Kirim Link Reset"
- Cek email → Klik link reset (token 10 menit)
- Set password baru → Redirect login

---

## KASIR ACCOUNT CREATION

### Flow:
1. Admin/Owner di dashboard
2. Buka menu "Kelola User" atau "Tambah Kasir"
3. Form input:
   - Email kasir
   - Nama kasir
   - Jabatan: Kasir (fixed/tidak bisa diubah)
4. Klik "Buat Akun Kasir"

### Pertanyaan:
**Kasir set password sendiri atau admin yang set?**

**Opsi A:** Kasir dapat email untuk set password sendiri
- Admin input email + nama
- Kasir dapat email dengan link aktivasi
- Kasir klik link → Set password sendiri
- Kasir bisa login

**Opsi B:** Admin set password untuk kasir
- Admin input email + nama + password
- Admin kasih tahu password ke kasir secara manual
- Kasir langsung bisa login

**Rekomendasi:** Opsi A lebih secure. Tolong pilih Opsi A atau B?

---

## DATABASE MODELS REQUIREMENTS

### 1. User Model (Extend AbstractUser)
```python
class User(AbstractUser):
    email          # EmailField, unique (override from AbstractUser)
    username       # CharField (keep from AbstractUser, atau gunakan email sebagai username?)
    
    role           # CharField, choices: 'admin'/'kasir'
    phone          # CharField, max_length=20
    is_verified    # BooleanField, default=False
    
    # Business info (untuk Admin/Owner only)
    business_name  # CharField, null=True (kasir kosong)
    business_address  # TextField, null=True, blank=True
    business_type  # CharField, null=True, blank=True
    
    created_at     # DateTimeField, auto_now_add
    updated_at     # DateTimeField, auto_now
```

### 2. EmailVerification Model (NEW)
```python
class EmailVerification:
    email          # EmailField
    token          # CharField, unique, max_length=64
    created_at     # DateTimeField, auto_now_add
    expires_at     # DateTimeField (created_at + 10 minutes)
    is_used        # BooleanField, default=False
```

### 3. PasswordReset Model (NEW)
```python
class PasswordReset:
    user           # ForeignKey(User, on_delete=CASCADE)
    token          # CharField, unique, max_length=64
    created_at     # DateTimeField, auto_now_add
    expires_at     # DateTimeField (created_at + 10 minutes)
    is_used        # BooleanField, default=False
```

### 4. UserOnboarding Model (NEW - Optional)
```python
class UserOnboarding:
    user           # OneToOneField(User)
    is_completed   # BooleanField, default=False
    completed_at   # DateTimeField, null=True
    skipped        # BooleanField, default=False
```

---

## EMAIL SERVICE - RECOMMENDATION

### Development (Sekarang - Sessions 5-10)
**Gunakan Django Console Backend**
- Email tidak dikirim real, tapi print di terminal/console
- Bisa lihat link verifikasi langsung di terminal
- Setting:
  ```python
  EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
  ```

**Keuntungan:**
- Tidak perlu setup SMTP
- Testing cepat
- Gratis, tidak perlu akun external service

### Production (Deployment - Session 24)
**Gunakan SendGrid**
- Free tier: 100 email/hari
- Setup mudah, API key only
- Deliverability bagus
- Setting:
  ```python
  EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
  EMAIL_HOST = 'smtp.sendgrid.net'
  EMAIL_PORT = 587
  EMAIL_USE_TLS = True
  EMAIL_HOST_USER = 'apikey'
  EMAIL_HOST_PASSWORD = 'your_sendgrid_api_key'
  ```

**Alternatif:** Gmail SMTP (ribet setup, less reliable)

---

## IMPACT KE SESSIONS

### Session 6 Models: 4 → 7 models
**Original:**
1. User
2. Branch
3. Category
4. Supplier

**Updated:**
1. User (updated dengan business_name, phone, is_verified)
2. EmailVerification (NEW)
3. PasswordReset (NEW)
4. UserOnboarding (NEW - optional)
5. Branch (tidak berubah)
6. Category (tidak berubah)
7. Supplier (tidak berubah)

### Session 10: Authentication Implementation
- JWT token authentication
- Email verification logic
- Password reset logic
- Onboarding wizard frontend

---

## PERTANYAAN TERAKHIR SEBELUM SESSION 5

1. **Kasir set password:** Opsi A (kasir set sendiri via email) atau Opsi B (admin set password)?

2. **Username field:** Gunakan email sebagai username atau tetap pakai username terpisah?
   - Opsi 1: Login pakai email (username = email)
   - Opsi 2: Login pakai username (email terpisah untuk verifikasi)
   - **Rekomendasi:** Opsi 1 (email sebagai username, lebih simple)

3. **Onboarding wizard:** Wajib dilalui atau bisa skip?
   - Jika bisa skip, wizard bisa ditampilkan lagi dari menu settings?

4. **Business type dropdown:** Apa aja pilihan jenis usaha?
   - Warung
   - Toko Kelontong
   - Minimart
   - Cafe/Restoran
   - Lainnya
   - Atau free text input?

---

## NEXT ACTION

Setelah 4 pertanyaan di atas dijawab:
1. Finalize database design
2. Mulai Session 5: Create database pos_ml_db
3. Session 6: Create 7 models (updated)
4. Continue to Session 7

---

**Created:** 3 Maret 2026  
**For:** Database design specification
