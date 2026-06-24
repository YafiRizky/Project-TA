# =============================================================================
# PERINTAH RESET DATABASE — Hapus Semua Data Bisnis (Kecuali Technical Admin)
# =============================================================================
# Tanggal: 7 Juni 2026
# Catatan: Jalankan perintah ini dari folder pos-backend dengan virtual env aktif
# 
# URUTAN PENTING! Harus sesuai karena ada Foreign Key dependency:
#   1. Notifikasi (FK ke Product, BusinessUser)
#   2. Transaksi Items (FK ke Transaction, Product)
#   3. Transaksi (FK ke BusinessUser)
#   4. Inventory Movements (FK ke ProductBatch, Product)
#   5. Product Batches (FK ke Product)
#   6. Products (FK ke Category, Supplier, Business)
#   7. Payment Methods (FK ke Business)
#   8. Categories (FK ke Business)
#   9. Suppliers (FK ke Business)
#  10. Business Users (FK ke Business) — kecuali TechnicalAdmin
#  11. Businesses
#  12. JWT Token Blacklist
# =============================================================================

# ========================
# CARA PAKAI (2 opsi):
# ========================

# OPSI 1: Jalankan script Python otomatis
# ----------------------------------------
#   cd c:\laragon\www\TA\pos-backend
#   python manage.py shell < ..\Dokumen\Command\reset_business_data.py

# OPSI 2: Jalankan manual satu-satu di Django shell
# ----------------------------------------
#   cd c:\laragon\www\TA\pos-backend
#   python manage.py shell
#   >>> (copy-paste perintah di bawah satu-satu)

# ========================
# PERINTAH DJANGO SHELL:
# ========================

# --- Cek dulu data yang akan dihapus ---
# from notifications.models import StockNotification
# from transactions.models import Transaction, TransactionItem
# from inventory.models import ProductBatch, StockMovement
# from products.models import Product, Category, Supplier
# from payments.models import PaymentMethod
# from accounts.models import BusinessUser
# from businesses.models import Business
# 
# print(f"Notifikasi: {StockNotification.objects.count()}")
# print(f"TransaksiItem: {TransactionItem.objects.count()}")
# print(f"Transaksi: {Transaction.objects.count()}")
# print(f"StockMovement: {StockMovement.objects.count()}")
# print(f"ProductBatch: {ProductBatch.objects.count()}")
# print(f"Product: {Product.objects.count()}")
# print(f"PaymentMethod: {PaymentMethod.objects.count()}")
# print(f"Category: {Category.objects.count()}")
# print(f"Supplier: {Supplier.objects.count()}")
# print(f"BusinessUser: {BusinessUser.objects.count()}")
# print(f"Business: {Business.objects.count()}")

# --- Hapus semua data bisnis ---
# StockNotification.objects.all().delete()
# TransactionItem.objects.all().delete()
# Transaction.objects.all().delete()
# StockMovement.objects.all().delete()
# ProductBatch.objects.all().delete()
# Product.objects.all().delete()
# PaymentMethod.objects.all().delete()
# Category.objects.all().delete()
# Supplier.objects.all().delete()
# BusinessUser.objects.all().delete()
# Business.objects.all().delete()

# --- Hapus JWT blacklisted tokens ---
# from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
# BlacklistedToken.objects.all().delete()
# OutstandingToken.objects.all().delete()

# print("SELESAI! Semua data bisnis sudah dihapus.")
# print("TechnicalAdmin (techdev) TIDAK terhapus.")
