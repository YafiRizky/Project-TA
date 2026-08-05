"""
=================================================================================
SCRIPT RESTOCK BATCH AKTIF TERBARU UNTUK KLT888 (TOKO KELONTONG SUMBER REJEKI)
=================================================================================
Menambahkan batch stok aktif baru (terima Juli - Agustus 2026) untuk seluruh 30 produk,
sehingga inventori saat ini memiliki stok aktif (100-300 unit/produk).
=================================================================================
"""
import os
import sys
import django
import random
from datetime import date, timedelta
from decimal import Decimal

# Setup Django Environment
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'pos-backend'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from businesses.models import Business
from products.models import Product
from inventory.models import ProductBatch

biz = Business.objects.get(business_code='KLT888')
products = Product.objects.filter(business=biz, is_active=True)

print(f"[RESTOCK] Menambahkan batch aktif baru untuk {products.count()} produk pada {biz.business_name}...")

today = date(2026, 8, 4)
total_added_batches = 0
total_added_stock = 0

for p in products:
    # Buat 2-3 batch aktif baru per produk
    for idx in range(1, 4):
        recv_date = today - timedelta(days=random.randint(1, 25))
        qty = random.randint(40, 100)
        exp_date = recv_date + timedelta(days=random.randint(90, 365))
        
        b = ProductBatch.objects.create(
            business=biz,
            product=p,
            batch_code=f"BTH-RESTOCK-{p.code}-{idx:02d}",
            quantity=qty,
            purchase_cost=p.purchase_price,
            purchase_date=recv_date,
            expiry_date=exp_date,
            status='ACTIVE'
        )
        total_added_batches += 1
        total_added_stock += qty

print(f"[COMPLETED] Berhasil menambahkan {total_added_batches} batch aktif baru dengan total {total_added_stock} unit stok untuk {biz.business_name}!")
