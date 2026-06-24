"""
Reset Business Data Script
===========================
Hapus SEMUA data yang berkaitan dengan bisnis, user bisnis, produk, transaksi, dll.
KECUALI TechnicalAdmin (techdev).

Jalankan dengan:
  cd c:\laragon\www\TA\pos-backend
  python manage.py shell < ..\Dokumen\Command\reset_business_data.py
"""

print("=" * 60)
print("RESET DATABASE — Hapus Semua Data Bisnis")
print("=" * 60)

# Import semua model
from notifications.models import StockNotification
from transactions.models import Transaction, TransactionItem
from inventory.models import ProductBatch, InventoryMovement
from products.models import Product, Category, Supplier
from payments.models import PaymentMethod
from accounts.models import BusinessUser
from businesses.models import Business

# Cek dulu sebelum hapus
print("\n--- DATA SEBELUM RESET ---")
print(f"  Notifikasi:     {StockNotification.objects.count()}")
print(f"  TransaksiItem:  {TransactionItem.objects.count()}")
print(f"  Transaksi:      {Transaction.objects.count()}")
print(f"  InventoryMovement:  {InventoryMovement.objects.count()}")
print(f"  ProductBatch:   {ProductBatch.objects.count()}")
print(f"  Product:        {Product.objects.count()}")
print(f"  PaymentMethod:  {PaymentMethod.objects.count()}")
print(f"  Category:       {Category.objects.count()}")
print(f"  Supplier:       {Supplier.objects.count()}")
print(f"  BusinessUser:   {BusinessUser.objects.count()}")
print(f"  Business:       {Business.objects.count()}")

# Hapus berurutan (sesuai FK dependency)
print("\n--- MENGHAPUS DATA ---")

r = StockNotification.objects.all().delete()
print(f"  [1/12] Notifikasi dihapus: {r[0]}")

r = TransactionItem.objects.all().delete()
print(f"  [2/12] TransaksiItem dihapus: {r[0]}")

r = Transaction.objects.all().delete()
print(f"  [3/12] Transaksi dihapus: {r[0]}")

r = InventoryMovement.objects.all().delete()
print(f"  [4/12] StockMovement dihapus: {r[0]}")

r = ProductBatch.objects.all().delete()
print(f"  [5/12] ProductBatch dihapus: {r[0]}")

r = Product.objects.all().delete()
print(f"  [6/12] Product dihapus: {r[0]}")

r = PaymentMethod.objects.all().delete()
print(f"  [7/12] PaymentMethod dihapus: {r[0]}")

r = Category.objects.all().delete()
print(f"  [8/12] Category dihapus: {r[0]}")

r = Supplier.objects.all().delete()
print(f"  [9/12] Supplier dihapus: {r[0]}")

r = BusinessUser.objects.all().delete()
print(f"  [10/12] BusinessUser dihapus: {r[0]}")

r = Business.objects.all().delete()
print(f"  [11/12] Business dihapus: {r[0]}")

# JWT tokens
try:
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
    r1 = BlacklistedToken.objects.all().delete()
    r2 = OutstandingToken.objects.all().delete()
    print(f"  [12/12] JWT tokens dihapus: {r1[0] + r2[0]}")
except Exception as e:
    print(f"  [12/12] JWT tokens skip: {e}")

# Cleanup media files (orphaned assets)
import shutil, os
from django.conf import settings
media_dirs_to_clean = ['qris']
for d in media_dirs_to_clean:
    media_path = os.path.join(settings.MEDIA_ROOT, d)
    if os.path.exists(media_path):
        shutil.rmtree(media_path)
        os.makedirs(media_path)
        print(f"  [EXTRA] Folder media/{d}/ dibersihkan")
    else:
        print(f"  [EXTRA] Folder media/{d}/ tidak ada, skip")

# Verifikasi
print("\n--- DATA SETELAH RESET ---")
print(f"  Notifikasi:     {StockNotification.objects.count()}")
print(f"  TransaksiItem:  {TransactionItem.objects.count()}")
print(f"  Transaksi:      {Transaction.objects.count()}")
print(f"  InventoryMovement:  {InventoryMovement.objects.count()}")
print(f"  ProductBatch:   {ProductBatch.objects.count()}")
print(f"  Product:        {Product.objects.count()}")
print(f"  PaymentMethod:  {PaymentMethod.objects.count()}")
print(f"  Category:       {Category.objects.count()}")
print(f"  Supplier:       {Supplier.objects.count()}")
print(f"  BusinessUser:   {BusinessUser.objects.count()}")
print(f"  Business:       {Business.objects.count()}")

# Verifikasi TechnicalAdmin masih ada
from accounts.models import TechnicalAdmin
print(f"\n  TechnicalAdmin: {TechnicalAdmin.objects.count()} (HARUS TETAP ADA)")

print("\n" + "=" * 60)
print("SELESAI! Semua data bisnis berhasil dihapus.")
print("TechnicalAdmin (techdev) TIDAK terhapus.")
print("Silakan register akun baru dari halaman Register.")
print("=" * 60)
