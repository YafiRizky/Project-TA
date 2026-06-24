# FLAG: Authentication Flow Specification
**Tanggal:** 2 Maret 2026  
**Status:** Design Phase - Sebelum Session 5 (Database Creation)  
**Tujuan:** Dokumentasi detail authentication flow untuk menentukan database design yang tepat

---

## 1. LANDING PAGE & LOGIN

### Landing Page
- Halaman pertama ketika buka aplikasi
- Menampilkan login form
- Untuk semua user: **Admin/Owner** dan **Kasir**

### Login Page Components
- Input: Email
- Input: Password
- Button: "Login"
- Link: "Lupa Password?"
- Link: "Belum punya akun? Daftar"

---

## 2. REGISTRATION FLOW (Owner/Admin Only)

### Step 1: Input Email
**Halaman:** Register Page  
**Form Fields:**
- Email (required)

**Action:**
- User input email
- Klik button "Kirim Kode Verifikasi"

**Backend Process:**
- Generate verification token/code
- Send email dengan link verifikasi
- Save token ke database (belum buat akun user)

**Email Content:**
- Subject: "Verifikasi Email - [Nama Aplikasi]"
- Body: 
  - "Halo, terima kasih telah mendaftar"
  - Link verifikasi: `https://domain.com/verify?token=xxxxx`
  - Link aktif selama X menit (tentukan durasi)

---

### Step 2: Verifikasi Email
**User Action:**
- Buka email
- Ada notifikasi masuk dari web
- Klik link verifikasi di email

**Halaman Baru:** Verification Success Page  
**Tampilan:**
- Halaman baru (redirect dari link email)
- Halaman ini adalah **lanjutan** dari register (continuation)
- Tampilan menunjukkan email sudah terverifikasi

---

### Step 3: Set Password
**Halaman:** Set Password Page (halaman baru setelah verifikasi)  
**Form Fields:**
- Password (required, min 8 karakter?)
- Confirm Password (required, harus sama dengan password)

**Additional Fields (Opsional - untuk diskusi):**
- Nama Lengkap?
- Nomor HP?
- Nama Usaha?
- Atau ini diisi nanti setelah login pertama kali?

**Action:**
- User set password
- Klik "Buat Akun" atau "Selesaikan Pendaftaran"

**Backend Process:**
- Create user account dengan:
  - Email (dari token)
  - Password (hashed)
  - Role: 'admin' (default untuk registrasi)
  - Status: 'active'
- Delete/invalidate verification token
- Auto login atau redirect ke login page?

---

## 3. FORGOT PASSWORD FLOW

### Step 1: Request Reset
**Halaman:** Forgot Password Page  
**Form Fields:**
- Email (required)

**Action:**
- User input email
- Klik "Kirim Link Reset Password"

**Backend Process:**
- Check email exist di database
- Generate password reset token
- Send email dengan link reset

**Email Content:**
- Subject: "Reset Password - [Nama Aplikasi]"
- Body:
  - "Kami menerima permintaan reset password"
  - Link reset: `https://domain.com/reset-password?token=xxxxx`
  - Link aktif selama X menit
  - "Jika bukan Anda yang meminta, abaikan email ini"

---

### Step 2: Reset Password
**User Action:**
- Buka email
- Klik link reset password

**Halaman:** Reset Password Page  
**Form Fields:**
- Password Baru (required)
- Konfirmasi Password Baru (required)

**Action:**
- User input password baru
- Klik "Reset Password"

**Backend Process:**
- Validate token masih aktif
- Update password user (hashed)
- Delete/invalidate reset token
- Redirect ke login page dengan notif "Password berhasil direset"

---

## 4. DATABASE REQUIREMENTS

Berdasarkan flow di atas, database needs:

### User Model Fields
```python
class User:
    email           # EmailField, unique, required
    password        # CharField, hashed
    role            # CharField, choices: 'admin'/'kasir'
    is_active       # BooleanField, default=True
    is_verified     # BooleanField, default=False (untuk email verification)
    created_at      # DateTimeField
    updated_at      # DateTimeField
    
    # Additional fields (diskusi):
    full_name       # CharField, optional?
    phone           # CharField, optional?
    branch          # ForeignKey to Branch, optional (kasir wajib punya)
```

### EmailVerification Model (NEW)
```python
class EmailVerification:
    email           # EmailField
    token           # CharField, unique, max_length=100
    created_at      # DateTimeField
    expires_at      # DateTimeField
    is_used         # BooleanField, default=False
```

### PasswordReset Model (NEW)
```python
class PasswordReset:
    user            # ForeignKey to User
    token           # CharField, unique, max_length=100
    created_at      # DateTimeField
    expires_at      # DateTimeField
    is_used         # BooleanField, default=False
```

---

## 5. PERTANYAAN UNTUK KLARIFIKASI

Sebelum implement ke database, perlu jawab:

### A. Registration Details
1. **Setelah set password**, user langsung auto-login atau redirect ke login page?
2. **Step 3 (set password)**, apakah perlu input **data tambahan**?
   - Nama lengkap?
   - Nomor HP?
   - Nama usaha?
   - Atau ini diisi nanti di onboarding wizard setelah login pertama?

3. **Token expiry**: Link verifikasi aktif berapa lama?
   - 15 menit?
   - 30 menit?
   - 1 jam?
   - 24 jam?

4. **Resend verification**: Jika user tidak dapat email atau link expired, ada tombol "Kirim Ulang Kode Verifikasi"?

### B. Kasir Account Creation
1. **Kasir tidak bisa register sendiri**, betul?
2. Kasir dibuat oleh Admin/Owner via dashboard (add user feature)?
3. Ketika Admin buat akun Kasir:
   - Admin input email kasir
   - Kasir dapat email untuk set password sendiri? ATAU
   - Admin set password untuk kasir dan kasih tahu secara manual?

### C. Password Requirements
1. Minimal berapa karakter? (8, 10, 12?)
2. Harus ada kombinasi huruf + angka?
3. Harus ada huruf besar/kecil?
4. Harus ada special character?

### D. Login Behavior
1. Jika login gagal 3x, ada **lockout** atau **captcha**?
2. Ada "Remember Me" checkbox?
3. Session timeout berapa lama? (30 menit, 1 jam, 1 hari?)

### E. Email Service
1. Pakai email service apa?
   - Gmail SMTP?
   - SendGrid?
   - Mailgun?
   - AWS SES?
   - Atau untuk development pakai Django console backend dulu (print email ke console)?

---

## 6. IMPACT TERHADAP SESSION 5-7

### Session 5 (Database Configuration)
- Standard User table sudah ada dari Django (django.contrib.auth)
- Perlu extend dengan custom fields (role, is_verified)

### Session 6 (Database Models Part 1) - PERLU UPDATE
- **User Model**: Extend AbstractUser, tambah field role + is_verified
- **EmailVerification Model**: NEW (belum di blueprint awal)
- **PasswordReset Model**: NEW (belum di blueprint awal)

**Total Models Session 6 berubah dari 4 → 6:**
1. User (update dari blueprint)
2. EmailVerification (NEW)
3. PasswordReset (NEW)
4. Branch (tidak berubah)
5. Category (tidak berubah)
6. Supplier (tidak berubah)

### Session 10 (Authentication & Security) - SUDAH ADA DI ROADMAP
- Implement JWT atau Session authentication
- Implement email verification logic
- Implement password reset logic
- Implement password hashing (bcrypt/argon2)

---

## 7. FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────┐
│                   LANDING PAGE                      │
│                    (Login Page)                     │
└─────────────────┬───────────────────────────────────┘
                  │
         ┌────────┴─────────┐
         │                  │
    [Login]            [Register]
         │                  │
         │                  ▼
         │         ┌────────────────┐
         │         │ Input Email    │
         │         │ Kirim Kode     │
         │         └────────┬───────┘
         │                  │
         │                  ▼
         │         ┌────────────────┐
         │         │ Cek Email      │
         │         │ Klik Link      │
         │         └────────┬───────┘
         │                  │
         │                  ▼
         │         ┌────────────────┐
         │         │ Halaman Baru   │
         │         │ Set Password   │
         │         └────────┬───────┘
         │                  │
         │                  ▼
         │         ┌────────────────┐
         │         │ Akun Created   │
         │         │ Redirect Login │
         │         └────────┬───────┘
         │                  │
         └──────────────────┤
                            ▼
                   ┌────────────────┐
                   │   Dashboard    │
                   │   (Setelah     │
                   │    Login)      │
                   └────────────────┘

         [Lupa Password]
                │
                ▼
       ┌────────────────┐
       │ Input Email    │
       │ Kirim Link     │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │ Cek Email      │
       │ Klik Link      │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │ Set Password   │
       │ Baru           │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │ Redirect Login │
       └────────────────┘
```

---

## 8. NEXT STEPS

1. **User jawab pertanyaan klarifikasi** (Section 5)
2. **Update blueprint** jika ada perubahan database models
3. **Lanjut Session 5**: Create database pos_ml_db
4. **Session 6 Updated**: Create 6 models (User, EmailVerification, PasswordReset, Branch, Category, Supplier)
5. **Session 10**: Implement authentication logic (JWT, email service, password hashing)

---

## 9. NOTES

- Authentication flow ini **lebih secure** daripada registrasi langsung karena ada email verification
- Perlu email service untuk production (SendGrid recommended untuk free tier)
- Development: bisa pakai Django console backend (print email to terminal)
- Token-based reset lebih aman daripada kirim password baru via email

---

**Status:** Waiting for user clarification on Section 5 questions before updating database design.
