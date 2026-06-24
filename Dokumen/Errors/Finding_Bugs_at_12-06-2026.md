# Finding Bugs at 12-06-2026

Dokumen ini berisi hasil audit komprehensif terhadap sistem POS pada fase development tanggal 12 Juni 2026. Audit mencakup pengecekan kode, *logs*, dan database untuk setiap anomali yang ditemukan.

## 1. UI/UX "Buat Bisnis" (Cabang Baru) Tidak Familiar
- **Gejala (Symptom):** Alur pembuatan cabang baru di `BusinessSelectionPage` sangat sederhana (hanya 4 field: Nama Bisnis, Tipe, Telepon, Alamat) dibandingkan dengan form pendaftaran awal di `RegisterPage` yang sangat lengkap dan detail hingga tingkat Kecamatan/Kota.
- **Penyebab (Root Cause):** Terdapat perbedaan desain di mana registrasi pertama meminta data lengkap untuk keperluan *profiling* pemilik (`Owner`), sedangkan pembuatan cabang baru difokuskan pada kecepatan (hanya identitas toko).
- **Dampak (Impact):** Pengguna merasa ada inkonsistensi (*disconnect*) dan fitur terkesan "belum selesai" karena tidak selengkap awal pendaftaran. Kehilangan konsistensi *brand experience*.

## 2. Hilangnya Kode Unik saat Login Admin
- **Gejala (Symptom):** Pada halaman login, admin bisa login tanpa memasukkan kode bisnis (hanya butuh username dan password). Berbeda dengan sistem Kasir yang diwajibkan menggunakan kode unik bisnis.
- **Penyebab (Root Cause):** Pada `accounts/views.py` (`business_login`), admin yang tidak memiliki *primary business context* saat login menggunakan `authenticate(username, password)`. Jika terdapat lebih dari 1 admin dengan username yang sama (contoh: "admin") dari perusahaan yang berbeda, sistem akan gagal mengidentifikasi atau bentrok.
- **Dampak (Impact):** Potensi celah keamanan (*Security Flaw*) dan inkonsistensi identitas jika platform ini akan dikembangkan menjadi *multi-tenant* sungguhan. Username "admin" sangat umum digunakan.

## 3. Data Kasir Tidak Muncul di Dashboard/List (Data Gaib)
- **Gejala (Symptom):** Admin membuat akun kasir, data berhasil tersimpan di *database*, namun ketika kembali ke halaman `UserManagementPage`, daftar kasir kosong.
- **Penyebab (Root Cause):** 
  - Backend (`accounts/views.py` fungsi `kasir_list_create` Phase 2) mengembalikan data dalam format paginasi DRF secara global atau terbungkus key `results`: `{'results': [...]}`.
  - Frontend (`UserManagementPage.jsx` baris 32) mengekstrak data menggunakan `data?.kasir || []`. Karena *key* `kasir` tidak ada di respons backend, list menjadi *undefined* (kosong).
- **Dampak (Impact):** Admin tidak bisa mengedit, menghapus, atau melihat kasir yang ada meskipun kasir tersebut eksis dan bisa login.

## 4. Dropdown Produk di Manajemen Diskon Kosong & Salah Posisi Menu
- **Gejala (Symptom):** 
  - Menu "Manajemen Diskon" masuk dalam grup *sidebar* "Promosi" yang kurang tepat dari sudut pandang hierarki POS, seharusnya masuk di bawah "Master Data".
  - Saat ingin memilih produk spesifik untuk dikenakan diskon, *dropdown list* produk tidak memuat data apa-apa.
- **Penyebab (Root Cause):**
  - Untuk menu: Konfigurasi hierarki di `Sidebar.jsx` masih menggunakan grup `Promosi`.
  - Untuk data kosong: Frontend `DiscountManagementPage.jsx` mencoba mem-*parsing* data menggunakan `productsData?.products?.map(...)`. Namun, karena backend telah menggunakan `PageNumberPagination` (terlihat di `backend/settings.py`), *response API* berbentuk `{'count': X, 'next': Y, 'previous': Z, 'results': [...]}`. Frontend seharusnya membaca `productsData?.results?.map(...)`.
- **Dampak (Impact):** Fitur diskon per produk rusak total (hanya bisa diskon global) karena ID produk tidak bisa dipilih.

## 5. Fitur "Stock Opname" yang Mentah & Crash
- **Gejala (Symptom):** Fitur Stock Opname terasa terlalu simpel (hanya mengubah angka) dan tidak memiliki dampak sistemik lain. Selain itu, fitur ini berpotensi gagal/*crash* pada sistem tertentu.
- **Penyebab (Root Cause):**
  - **Error Teknis:** Pada `StockOpnamePage.jsx` baris 222 dan 285, sistem memanggil `p.current_stock` untuk membaca stok sistem saat ini. Padahal di model `Product` (`products/models.py`), *field* bernama `current_stock` tidak eksis. Stok dihitung dari relasi `ProductBatch`.
  - **Error Bisnis:** Sistem hanya mengurangi/menambah `ProductBatch` tanpa ada rekam jejak formal ke jurnal akuntansi/Laporan Laba-Rugi (misalnya, kerugian barang hilang belum dicatat sebagai *loss* secara finansial).
- **Dampak (Impact):** *Frontend* membaca stok = *undefined* (atau 0), yang menyebabkan selisih perhitungan (Difference) selalu salah, dan pencatatan inventarisasi fisik tidak akurat.

## 6. Audit Log Gagal (Internal Server Error) saat Update Produk/Batch
- **Gejala (Symptom):** Ketika mencoba mengedit harga beli pada *batch* produk, muncul *Internal Server Error* (500).
- **Penyebab (Root Cause):** Modul `auditlog/utils.py` memiliki sisa kode lama yang secara *hardcoded* memanggil `old.buying_price` ketika mencatat log perubahan. Saat ini, skema *database* menggunakan atribut `purchase_price`. Perbedaan penamaan *field* ini menyebabkan Python melempar `AttributeError`.
- **Dampak (Impact):** Semua operasi *update* yang memicu *logging* dengan properti lama ini akan gagal, membuat data produk/batch sama sekali tidak bisa di-edit.

---
*Dokumen ini merupakan hasil audit teknikal dan difokuskan sebagai baseline (referensi) untuk perbaikan dan refactoring pada Phase 2/3 (Refinement and Feature Parity).*
