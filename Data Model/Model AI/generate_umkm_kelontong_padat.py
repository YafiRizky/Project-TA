"""
=================================================================================
SCRIPT GENERASI DATA SIMULASI TOKO KELONTONG PADAT (1 TAHUN / 365 HARI HISTORIS)
=================================================================================
File Location: TA/Data Model/Model AI/generate_umkm_kelontong_padat.py
Target: 
  1. Mengisi data UMKM baru ke Database PostgreSQL Django (Project POS ML System).
  2. TIDAK MENGHAPUS UMKM LAMA (Non-destructive).
  3. Kuantitas stok ratusan per produk (150 - 500 unit per SKU).
  4. Transaksi padat tanpa hari bolong (15-35 tx/hari, ~8.000 transaksi/tahun).
  5. Melengkapi kode owner admin (`owner_code`) dan user kasir.

Profil Usaha:
  Nama Usaha    : Toko Kelontong Sumber Rejeki
  Jenis Usaha   : Warung Kelontong / Retail Sembako
  Lokasi        : Semarang, Jawa Tengah
  Periode Data  : 4 Agustus 2025 s.d. 4 Agustus 2026 (12 Bulan / 365 Hari)
  Kredensial    :
    - Kode Bisnis : KLT888
    - Kode Owner  : OWN888
    - Admin User  : admin_kelontong2 / admin123
    - Kasir User  : kasir_kelontong2 / kasir123
=================================================================================
"""
import os
import sys
import django
import random
import csv
import json
import numpy as np
from datetime import datetime, timedelta, date
from decimal import Decimal

# Setup Django Environment
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'pos-backend'))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.utils import timezone
from django.contrib.auth import get_user_model
from businesses.models import Business
from accounts.models import BusinessUser
from products.models import Product, Category, Supplier
from inventory.models import ProductBatch
from transactions.models import Transaction, TransactionItem

User = get_user_model()

# Seed for reproducibility
random.seed(2026)
np.random.seed(2026)

print("=" * 80)
print(" GENERASI DATA UMKM BARU: TOKO KELONTONG SUMBER REJEKI (PADAT 1 TAHUN)")
print("=" * 80)

biz_code = 'KLT888'
owner_code = 'OWN888'

# Clean up only this specific business if it already exists (idempotent for re-runs)
existing_biz = Business.objects.filter(business_code=biz_code).first()
if existing_biz:
    print(f"[CLEANUP] Menghapus data lama untuk bisnis {biz_code}...")
    TransactionItem.objects.filter(transaction__business=existing_biz).delete()
    Transaction.objects.filter(business=existing_biz).delete()
    ProductBatch.objects.filter(business=existing_biz).delete()
    Product.objects.filter(business=existing_biz).delete()
    Category.objects.filter(business=existing_biz).delete()
    Supplier.objects.filter(business=existing_biz).delete()
    BusinessUser.objects.filter(business=existing_biz).delete()
    existing_biz.delete()

# -----------------------------------------------------------------------------
# 1. BUAT BISNIS & USER ADMIN + KASIR
# -----------------------------------------------------------------------------
biz = Business.objects.create(
    business_code=biz_code,
    business_name="Toko Kelontong Sumber Rejeki",
    business_type="Warung Kelontong",
    phone="+6281355566778",
    address="Jl. Gajah Mada No. 88, Kembangsari",
    country="Indonesia",
    province="Jawa Tengah",
    city="Kota Semarang",
    district="Semarang Tengah",
    postal_code="50138",
    is_active=True
)
print(f"[CREATED] Bisnis: {biz.business_name} (Kode Bisnis: {biz.business_code})")

# Custom User Admin (BusinessUser)
admin_buser = BusinessUser.objects.filter(username="admin_kelontong2").first()
if admin_buser:
    admin_buser.business = biz
    admin_buser.role = "admin"
    admin_buser.owner_code = owner_code
    admin_buser.full_name = "Budi Rejeki (Admin)"
    admin_buser.is_active = True
    admin_buser.set_password("admin123")
    admin_buser.save()
    admin_buser.owned_businesses.add(biz)
else:
    admin_buser = BusinessUser.objects.create(
        username="admin_kelontong2",
        business=biz,
        role="admin",
        owner_code=owner_code,
        full_name="Budi Rejeki (Admin)",
        is_active=True
    )
    admin_buser.set_password("admin123")
    admin_buser.save()
    admin_buser.owned_businesses.add(biz)

# Custom User Kasir (BusinessUser)
kasir_buser = BusinessUser.objects.filter(username="kasir_kelontong2").first()
if kasir_buser:
    kasir_buser.business = biz
    kasir_buser.role = "kasir"
    kasir_buser.owner_code = None
    kasir_buser.full_name = "Siti Kasir (Kasir 1)"
    kasir_buser.is_active = True
    kasir_buser.set_password("kasir123")
    kasir_buser.save()
else:
    kasir_buser = BusinessUser.objects.create(
        username="kasir_kelontong2",
        business=biz,
        role="kasir",
        owner_code=None,
        full_name="Siti Kasir (Kasir 1)",
        is_active=True
    )
    kasir_buser.set_password("kasir123")
    kasir_buser.save()

print(f"[CREATED] User Admin: admin_kelontong2 | Pass: admin123 | Owner Code: {owner_code}")
print(f"[CREATED] User Kasir: kasir_kelontong2 | Pass: kasir123 | Business Code: {biz_code}")

# -----------------------------------------------------------------------------
# 2. BUAT KATEGORI & SUPPLIER
# -----------------------------------------------------------------------------
categories_data = [
    ("CAT-SMB", "Sembako", "Beras, Minyak, Gula, Terigu"),
    ("CAT-MNS", "Mie & Instant", "Mie goreng, mie kuah, bihun"),
    ("CAT-MNM", "Minuman", "Kopi, Teh, Susu, Air Mineral"),
    ("CAT-SNK", "Makanan Ringan", "Snack, Biskuit, Roti, Wafer"),
    ("CAT-BMB", "Bumbu Dapur", "Kecap, Saos, Bumbu Racik, Garam"),
    ("CAT-RMH", "Kebutuhan Rumah Tangga", "Sabun, Sampo, Deterjen, Tisu"),
    ("CAT-ROK", "Rokok & Korek", "Rokok batang/pak"),
    ("CAT-GAS", "Gas & Elpiji", "Gas LPG 3kg & 12kg"),
]
cat_map = {}
for code, name, desc in categories_data:
    c = Category.objects.create(business=biz, code=code, name=name, description=desc, is_active=True)
    cat_map[code] = c

suppliers_data = [
    ("SUP-IND", "PT Indofood Sukses Makmur", "Pak Bambang", "+628111222333", "Semarang"),
    ("SUP-UNL", "PT Unilever Indonesia", "Ibu Dewi", "+628111222444", "Semarang"),
    ("SUP-WNG", "PT Wings Surya", "Pak Hendra", "+628111222555", "Kudus"),
    ("SUP-MAY", "PT Mayora Indah", "Ibu Rina", "+628111222666", "Demak"),
    ("SUP-MNS", "Distributor Sembako Lokal", "Pak Haji Slamet", "+628111222777", "Semarang"),
]
sup_map = {}
for code, name, cp, ph, city in suppliers_data:
    s = Supplier.objects.create(business=biz, code=code, name=name, contact_person=cp, phone=ph, city=city, address=f"Jl. Raya {city}")
    sup_map[code] = s

# -----------------------------------------------------------------------------
# 3. BUAT KATALOG PRODUK (30 SKU)
# -----------------------------------------------------------------------------
products_definition = [
    # (code, name, unit, cat_code, sup_code, buy_price, sell_price, min_stock, base_popularity_weight)
    ("SKU-001", "Minyak Goreng Bimoli 2L", "Pouch", "CAT-SMB", "SUP-MNS", 34000, 39000, 20, 15),
    ("SKU-002", "Beras C4 Premium 5kg", "Karung", "CAT-SMB", "SUP-MNS", 62000, 72000, 15, 12),
    ("SKU-003", "Telur Ayam Negeri 1kg", "Kg", "CAT-SMB", "SUP-MNS", 25000, 29000, 25, 20),
    ("SKU-004", "Gula Pasir Gulaku 1kg", "Bungkus", "CAT-SMB", "SUP-MNS", 14500, 17500, 30, 18),
    ("SKU-005", "Terigu Segitiga Biru 1kg", "Bungkus", "CAT-SMB", "SUP-IND", 10500, 13000, 20, 10),
    ("SKU-006", "Indomie Goreng Spesial", "Pcs", "CAT-MNS", "SUP-IND", 2800, 3500, 100, 35),
    ("SKU-007", "Indomie Kuah Soto Ayam", "Pcs", "CAT-MNS", "SUP-IND", 2700, 3400, 80, 28),
    ("SKU-008", "Kopi Kapal Api Mantap 165g", "Pcs", "CAT-MNM", "SUP-MAY", 12000, 15000, 25, 16),
    ("SKU-009", "Teh Celup Sariwangi 25s", "Kotak", "CAT-MNM", "SUP-UNL", 6500, 8500, 20, 14),
    ("SKU-010", "Susu Kental Manis Frisian Flag 370g", "Kaleng", "CAT-MNM", "SUP-IND", 10500, 13000, 20, 12),
    ("SKU-011", "Rinso Anti Noda 770g", "Pouch", "CAT-RMH", "SUP-UNL", 18500, 22500, 15, 10),
    ("SKU-012", "Sabun Mandi Lifebuoy 110g", "Pcs", "CAT-RMH", "SUP-UNL", 3800, 5000, 30, 15),
    ("SKU-013", "Sampo Pantene 160ml", "Botol", "CAT-RMH", "SUP-UNL", 19000, 24000, 10, 6),
    ("SKU-014", "Pasta Gigi Pepsodent 190g", "Pcs", "CAT-RMH", "SUP-UNL", 11000, 14000, 15, 9),
    ("SKU-015", "Air Mineral Aqua 600ml", "Botol", "CAT-MNM", "SUP-MNS", 3000, 4500, 50, 22),
    ("SKU-016", "Air Mineral Galon Aqua 19L", "Galon", "CAT-MNM", "SUP-MNS", 17000, 21000, 20, 18),
    ("SKU-017", "Gas LPG 3kg (Melon)", "Tabung", "CAT-GAS", "SUP-MNS", 17500, 21000, 30, 25),
    ("SKU-018", "Roti Tawar Sari Roti", "Pcs", "CAT-SNK", "SUP-MAY", 13000, 16000, 10, 8),
    ("SKU-019", "Chiki Balls Keju 55g", "Pcs", "CAT-SNK", "SUP-IND", 4500, 6000, 25, 11),
    ("SKU-020", "Biskuit Roma Kelapa 300g", "Pcs", "CAT-SNK", "SUP-MAY", 9000, 11500, 20, 9),
    ("SKU-021", "Kecap Manis Bango 520ml", "Pouch", "CAT-BMB", "SUP-UNL", 21000, 25500, 15, 10),
    ("SKU-022", "Saos Sambal ABC 275ml", "Botol", "CAT-BMB", "SUP-IND", 11000, 13500, 15, 8),
    ("SKU-023", "Bumbu Racik Indofood Nasi Goreng", "Saset", "CAT-BMB", "SUP-IND", 2000, 2800, 50, 15),
    ("SKU-024", "Rokok Sampoerna Mild 16", "Bungkus", "CAT-ROK", "SUP-MNS", 29500, 33500, 30, 30),
    ("SKU-025", "Rokok Gudang Garam Surya 12", "Bungkus", "CAT-ROK", "SUP-MNS", 22000, 25500, 30, 26),
    ("SKU-026", "Deterjen So Klin Smart 800g", "Pouch", "CAT-RMH", "SUP-WNG", 16000, 19500, 15, 8),
    ("SKU-027", "Minyak Kayu Putih Cap Lang 60ml", "Botol", "CAT-RMH", "SUP-MNS", 21000, 25000, 10, 5),
    ("SKU-028", "Tisu Paseo 250s", "Pack", "CAT-RMH", "SUP-MNS", 12000, 15000, 20, 10),
    ("SKU-029", "Snack Lays Rumput Laut 68g", "Pcs", "CAT-SNK", "SUP-IND", 8500, 11000, 20, 8),
    ("SKU-030", "Wafer Tango Cokelat 110g", "Pcs", "CAT-SNK", "SUP-MAY", 6500, 8500, 25, 9),
]

product_objects = []
pop_weights = []

for code, name, unit, cat_code, sup_code, buy_price, sell_price, min_stock, pop_w in products_definition:
    p = Product.objects.create(
        business=biz,
        code=code,
        barcode=f"899{random.randint(100000000, 999999999)}",
        name=name,
        category=cat_map[cat_code],
        supplier=sup_map[sup_code],
        unit=unit,
        purchase_price=Decimal(str(buy_price)),
        selling_price=Decimal(str(sell_price)),
        min_stock=min_stock,
        is_active=True
    )
    product_objects.append(p)
    pop_weights.append(pop_w)

pop_weights = np.array(pop_weights, dtype=float)
pop_weights /= pop_weights.sum()

print(f"[CREATED] Katalog Produk: {len(product_objects)} SKU.")

# -----------------------------------------------------------------------------
# 4. BUAT BATCH STOK DALAM JUMLAH RATUSAN (FIFO INVENTORY)
# -----------------------------------------------------------------------------
print("[INITIALIZING] Membuat stok awal batch (kuantitas ratusan per produk)...")
start_date = date(2025, 8, 4)
end_date = date(2026, 8, 4)

product_batches_pool = {p.id: [] for p in product_objects}

for p in product_objects:
    # Buat 4 s.d. 6 batch per produk agar stok total berada di kisaran 200 - 600 unit
    num_batches = random.randint(4, 6)
    for b_idx in range(1, num_batches + 1):
        # Tanggal terima disebar dalam 12 bulan terakhir
        receive_offset = random.randint(0, 330)
        batch_recv_date = start_date + timedelta(days=receive_offset)
        
        # Quantity per batch: 50 s.d. 120 unit (total per produk ratusan!)
        qty_batch = random.randint(50, 120)
        
        # Expiry date untuk barang berisiko kadaluarsa
        exp_date = None
        if p.category.code in ["CAT-SNK", "CAT-MNM", "CAT-MNS", "CAT-SMB"]:
            # Ada beberapa batch yang expired mendekati bulan Agustus 2026 untuk menguji ML Risiko Expired
            if random.random() < 0.25:
                exp_date = end_date + timedelta(days=random.randint(5, 30)) # Risk warning!
            else:
                exp_date = batch_recv_date + timedelta(days=random.randint(120, 365))
        
        batch = ProductBatch.objects.create(
            business=biz,
            product=p,
            batch_code=f"BTH-{p.code}-{b_idx:02d}",
            quantity=qty_batch, # initial high stock
            purchase_cost=p.purchase_price,
            purchase_date=batch_recv_date,
            expiry_date=exp_date,
            status='ACTIVE'
        )
        product_batches_pool[p.id].append({
            'obj': batch,
            'current_qty': qty_batch,
            'cost': p.purchase_price,
            'recv': batch_recv_date,
            'exp': exp_date
        })

total_initial_stock = sum(
    sum(b['current_qty'] for b in b_list) 
    for b_list in product_batches_pool.values()
)
print(f"[CREATED] Product Batches: Total Stok Awal Terbuat = {total_initial_stock} unit di seluruh {len(product_objects)} produk.")

# -----------------------------------------------------------------------------
# 5. SIMULASI TRANSAKSI PADAT SELAMA 365 HARI (TANPA BOLONG)
# -----------------------------------------------------------------------------
print("[SIMULATING] Memulai generasi transaksi padat harian (365 hari)...")

current_day = start_date
trx_counter = 1
total_transactions = 0
total_items_sold = 0
total_revenue = Decimal('0.00')

pm_weights = [0.70, 0.15, 0.15] # 70% CASH, 15% QRIS, 15% TRANSFER

while current_day <= end_date:
    # Faktor musiman/variasi harian
    day_of_week = current_day.weekday() # 0=Monday, 6=Sunday
    is_weekend = day_of_week in [5, 6]
    day_of_month = current_day.day
    is_payday = day_of_month <= 5 or day_of_month >= 28
    
    # Base transactions per day: 15 s.d. 25
    base_tx_count = random.randint(15, 25)
    if is_weekend:
        base_tx_count = int(base_tx_count * 1.35) # Weekend spike (+35%)
    if is_payday:
        base_tx_count = int(base_tx_count * 1.40) # Payday spike (+40%)
        
    for _ in range(base_tx_count):
        # Jam transaksi realistis antara 07:00 s.d. 21:00 WIB
        hour = random.choice([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        
        dt_naive = datetime(current_day.year, current_day.month, current_day.day, hour, minute, second)
        dt_aware = timezone.make_aware(dt_naive)
        
        trx_code = f"TRX-{current_day.strftime('%y%m%d')}-{trx_counter:05d}"
        payment_method = np.random.choice(['CASH', 'QRIS', 'TRANSFER'], p=pm_weights)
        cashier_name = random.choice(["Siti Kasir", "Budi Rejeki", "Rina Kasir"])
        
        # Buat Header Transaksi dulu
        trx = Transaction.objects.create(
            business=biz,
            transaction_code=trx_code,
            transaction_date=dt_aware,
            cashier_name=cashier_name,
            total_amount=Decimal('0.00'),
            discount_amount=Decimal('0.00'),
            payment_method=payment_method,
            status='COMPLETED'
        )
        
        # Pilih 1 s.d. 5 jenis produk per keranjang belanja
        num_items = random.randint(1, 5)
        selected_products = np.random.choice(product_objects, size=num_items, replace=False, p=pop_weights)
        
        trx_total = Decimal('0.00')
        
        for prod in selected_products:
            # Quantity per produk: 1 s.d. 4 pcs
            qty_buy = random.randint(1, 4)
            unit_price = prod.selling_price
            
            # Cari FIFO Batch untuk produk ini
            b_list = product_batches_pool[prod.id]
            # Sort by received_date
            b_list.sort(key=lambda x: x['recv'])
            
            chosen_batch_obj = None
            cost_per_unit = prod.purchase_price
            
            for b_info in b_list:
                if b_info['current_qty'] >= qty_buy:
                    chosen_batch_obj = b_info['obj']
                    cost_per_unit = b_info['cost']
                    b_info['current_qty'] -= qty_buy
                    # Update di DB (stok batch berkurang)
                    b_info['obj'].quantity = max(0, b_info['current_qty'])
                    b_info['obj'].save(update_fields=['quantity'])
                    break
            
            if not chosen_batch_obj and len(b_list) > 0:
                chosen_batch_obj = b_list[0]['obj']
                cost_per_unit = b_list[0]['cost']
            
            subtotal = unit_price * qty_buy
            trx_total += subtotal
            total_items_sold += qty_buy
            
            TransactionItem.objects.create(
                transaction=trx,
                product=prod,
                batch=chosen_batch_obj,
                quantity=qty_buy,
                price_per_unit=unit_price,
                cost_per_unit=cost_per_unit,
                subtotal=subtotal
            )
            
        trx.total_amount = trx_total
        trx.save(update_fields=['total_amount'])
        
        total_revenue += trx_total
        total_transactions += 1
        trx_counter += 1
        
    current_day += timedelta(days=1)

print(f"[COMPLETED] Simulasi 1 Tahun Selesai Ditulis ke Database PostgreSQL!")
print(f" - Total Transaksi  : {total_transactions:,} Transaksi")
print(f" - Total Item Terjual: {total_items_sold:,} Pcs")
print(f" - Total Omset Revenue: Rp {total_revenue:,.2f}")
print("=" * 80)
print(f"LOGIN CREDENTIALS UNTUK DIPAKAI DI APP (METRACRURA POS):")
print(f" - Kode Bisnis : {biz_code}")
print(f" - Kode Owner  : {owner_code}")
print(f" - Admin Login : admin_kelontong2 / admin123")
print(f" - Kasir Login : kasir_kelontong2 / kasir123")
print("=" * 80)
