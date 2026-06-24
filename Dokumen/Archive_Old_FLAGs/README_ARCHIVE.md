# 📦 ARCHIVE - OLD FLAGS & BLUEPRINTS

**Created:** 4 Maret 2026  
**Purpose:** Archive file-file lama yang sudah outdated/digantikan

---

## ⚠️ PENTING: JANGAN PAKAI FILE DI FOLDER INI!

File-file di folder ini adalah **OUTDATED** dan sudah digantikan oleh dokumentasi yang lebih baru.

**GUNAKAN FILE INI SEBAGAI GANTINYA:**
- 📄 `FLAG_SYSTEM_ARCHITECTURE_2026-03-04_PRIORITY.md` (root folder)
- 📄 `FITUR_DAN_FLOW_LENGKAP_PRIORITY.md` (root folder)
- 📄 `LATAR_BELAKANG_PROPOSAL_TA_PRIORITY.md` (root folder)
- 📄 `FLAG_MOCKUP_COMPLETED_2026-03-04_PRIORITY.md` (root folder)

---

## 📋 FILE YANG DI-ARCHIVE

### 1. **FLAG_FINAL_DESIGN_2026-03-03.md**
**Tanggal:** 3 Maret 2026  
**Status:** Outdated  
**Digantikan Oleh:** `FLAG_SYSTEM_ARCHITECTURE_2026-03-04_PRIORITY.md`

**Alasan Archive:**
- Design sudah berubah signifikan di Session 4 (4 Maret 2026)
- Multi-tenant architecture finalized (tidak ada di versi ini)
- Business code auto-generate (versi ini masih manual input)
- Login method berubah (Admin: email, Kasir: business code + username)
- Payment setup completed (bank name free input)

---

### 2. **PROJECT_BLUEPRINT_FINAL_2026-03-03.md**
**Tanggal:** 3 Maret 2026  
**Status:** Outdated  
**Digantikan Oleh:** `FITUR_DAN_FLOW_LENGKAP_PRIORITY.md`

**Alasan Archive:**
- Fitur requirement sudah diperjelas dan diperluas
- Flow detail sudah lebih lengkap di versi baru
- Beberapa fitur berubah (katalog concept, batch tracking)

---

### 3. **FLAG_AUTH_FLOW_2026-03-02.md**
**Tanggal:** 2 Maret 2026  
**Status:** Outdated  
**Digantikan Oleh:** Section Auth di `FLAG_SYSTEM_ARCHITECTURE_2026-03-04_PRIORITY.md`

**Alasan Archive:**
- Auth flow berubah setelah diskusi 3-4 Maret 2026
- Admin login: Email + password (bukan business code)
- Kasir login: Business code + username + password
- Business code auto-generate (tidak ada manual input)

---

### 4. **FLAG_AUTH_FLOW_2026-03-03.md**
**Tanggal:** 3 Maret 2026  
**Status:** Outdated  
**Digantikan Oleh:** Section Auth di `FLAG_SYSTEM_ARCHITECTURE_2026-03-04_PRIORITY.md`

**Alasan Archive:**
- Versi auth yang masih kurang final
- Revisi terakhir 4 Maret dengan email login untuk admin

---

## 📖 KAPAN BOLEH BACA FILE INI?

**✅ Boleh:**
- Untuk **historical reference** (lihat evolusi design)
- Untuk **compare** keputusan lama vs baru
- Untuk **understand context** kenapa ada perubahan

**❌ Jangan:**
- **Implement** berdasarkan file ini (OUTDATED!)
- **Referensi** sebagai spec/requirement (gunakan _PRIORITY files!)
- **Copy-paste** ke dokumentasi baru (bisa inconsistent)

---

## 🔄 CHANGELOG PERUBAHAN

**3 Maret 2026 → 4 Maret 2026:**

| Aspek | Sebelum (3 Mar) | Sesudah (4 Mar) |
|-------|-----------------|-----------------|
| **Business Code** | Manual/auto | **Auto only** |
| **Admin Login** | Business code + username | **Email + password** |
| **Kasir Login** | Same as admin | **Business code + username + password** |
| **Multi-Tenant** | Belum dibahas | **Fully designed** (business_id isolation) |
| **Payment Setup** | Dropdown bank | **Free text input** |
| **Database Schema** | Basic outline | **Complete 13 tables ERD** |
| **Batch Flow** | Konsep dasar | **Detail dengan contoh konkret** |

---

## 📞 KONTAK

Jika ada pertanyaan tentang file archive ini atau kenapa ada perubahan:
- Baca: `DOCUMENTATION_INDEX_PRIORITY.md` (root folder)
- Lihat: Section "REVISI & KLARIFIKASI" di `FLAG_SYSTEM_ARCHITECTURE_2026-03-04_PRIORITY.md`

---

**Archive Created:** 4 Maret 2026, 18:00 WIB  
**Last Updated:** 4 Maret 2026, 18:00 WIB
