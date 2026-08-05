"""
Generate UMKM Data v2 -- Langsung ke Django Database
=====================================================
Script ini:
1. Hapus semua bisnis/user kecuali techdev (superuser)
2. Buat 4 UMKM baru dengan variasi usaha
3. Generate produk, batch (inventory), dan transaksi langsung ke DB
4. 2 UMKM = 12 bulan data, 2 UMKM = 4 bulan data

Cara jalankan:
  python manage.py shell < generate_data_v2.py
  ATAU
  python manage.py runscript generate_data_v2

Timezone: Asia/Jakarta (WIB)
"""
import os
import sys
import django
import random
import numpy as np
from datetime import datetime, timedelta, date
from decimal import Decimal

# Setup Django
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
random.seed(42)
np.random.seed(42)

# ============================================================
# STEP 0: SAFETY -- Preserve techdev / superuser
# ============================================================
print("=" * 70)
print("GENERATE DATA v2 -- Langsung ke Django Database")
print("=" * 70)

# Find techdev user (superuser / is_staff) -- preserve this
techdev_user = User.objects.filter(is_staff=True).first()
if not techdev_user:
    techdev_user = User.objects.filter(username='techdev').first()
print(f"[PRESERVE] techdev user: {techdev_user}")

# ============================================================
# STEP 1: HAPUS semua data kecuali techdev
# ============================================================
print("\n[1/6] Menghapus data lama (kecuali techdev)...")

# Hapus transaksi
TransactionItem.objects.all().delete()
Transaction.objects.all().delete()
print("  - Transaksi dihapus")

# Hapus inventory
ProductBatch.objects.all().delete()
print("  - Batch/Inventory dihapus")

# Hapus produk, kategori, supplier
Product.objects.all().delete()
Category.objects.all().delete()
Supplier.objects.all().delete()
print("  - Produk, Kategori, Supplier dihapus")

# Hapus BusinessUser kecuali techdev
if techdev_user:
    BusinessUser.objects.exclude(id=techdev_user.id).delete()
else:
    BusinessUser.objects.all().delete()
print("  - BusinessUser dihapus (kecuali techdev)")

# Hapus Business
Business.objects.all().delete()
print("  - Business dihapus")

# ============================================================
# STEP 2: BUAT 4 UMKM BARU
# ============================================================
print("\n[2/6] Membuat 4 UMKM baru...")

UMKM_LIST = [
    {
        "name": "Toko Berkah Jaya",
        "type": "Warung Kelontong",
        "phone": "+6281234567890",
        "address": "Jl. Raya Cibubur No. 45",
        "province": "Jawa Barat",
        "city": "Kota Bekasi",
        "district": "Bekasi Timur",
        "postal_code": "17111",
        "months_data": 12,  # 12 bulan data
        "daily_transactions": (8, 15),  # min-max transaksi per hari
        "description": "Kelontong ramai, banyak produk, banyak transaksi"
    },
    {
        "name": "Warung Makan Bu Sari",
        "type": "Warung Makan",
        "phone": "+6285678901234",
        "address": "Jl. Sudirman No. 12, Pasar Minggu",
        "province": "Dki Jakarta",
        "city": "Kota Jakarta Selatan",
        "district": "Pasar Minggu",
        "postal_code": "12520",
        "months_data": 12,  # 12 bulan data
        "daily_transactions": (10, 25),  # warung makan ramai
        "description": "Warung makan, penjualan harian tinggi"
    },
    {
        "name": "Toko Beras Pak Hadi",
        "type": "Toko Beras",
        "phone": "+6287890123456",
        "address": "Jl. Pasar Induk No. 3",
        "province": "Jawa Tengah",
        "city": "Kota Semarang",
        "district": "Semarang Barat",
        "postal_code": "50141",
        "months_data": 4,  # 4 bulan data
        "daily_transactions": (3, 9),  # medium, 3-9 per minggu -> rata2 ~1/hari
        "description": "Penjual beras medium, 3-9 penjualan per minggu"
    },
    {
        "name": "Minimart Sejahtera",
        "type": "Minimart",
        "phone": "+6289012345678",
        "address": "Jl. Ahmad Yani No. 88",
        "province": "Jawa Timur",
        "city": "Kota Surabaya",
        "district": "Wonokromo",
        "postal_code": "60243",
        "months_data": 4,  # 4 bulan data
        "daily_transactions": (5, 12),
        "description": "Minimart standar, variasi produk lengkap"
    },
]

# Produk untuk setiap UMKM (berbeda sesuai tipe)
PRODUCTS_BY_TYPE = {
    "Warung Kelontong": [
        # Sembako
        {"code": "BRS01", "name": "Beras Premium 5kg",       "cat": "Sembako",      "buy": 62000, "sell": 68000, "unit": "karung",  "min_stock": 5,  "avg_daily": 1.5, "expiry_days": 180},
        {"code": "GLA01", "name": "Gula Pasir 1kg",           "cat": "Sembako",      "buy": 13500, "sell": 15500, "unit": "kg",      "min_stock": 10, "avg_daily": 3.0, "expiry_days": None},
        {"code": "MYK01", "name": "Minyak Goreng Bimoli 1L",  "cat": "Sembako",      "buy": 16000, "sell": 18000, "unit": "botol",   "min_stock": 5,  "avg_daily": 2.0, "expiry_days": 365},
        {"code": "TLR01", "name": "Telur Ayam 1kg",           "cat": "Sembako",      "buy": 26000, "sell": 29000, "unit": "kg",      "min_stock": 3,  "avg_daily": 1.2, "expiry_days": 14},
        {"code": "TPG01", "name": "Tepung Terigu 1kg",        "cat": "Sembako",      "buy": 10000, "sell": 12000, "unit": "bungkus", "min_stock": 5,  "avg_daily": 1.0, "expiry_days": 365},
        # Mie Instan
        {"code": "MIE01", "name": "Indomie Goreng",           "cat": "Mie Instan",   "buy": 2500,  "sell": 3000,  "unit": "pcs",     "min_stock": 30, "avg_daily": 8.0, "expiry_days": 240},
        {"code": "MIE02", "name": "Mie Sedap Goreng",         "cat": "Mie Instan",   "buy": 2500,  "sell": 3000,  "unit": "pcs",     "min_stock": 20, "avg_daily": 6.0, "expiry_days": 240},
        {"code": "MIE03", "name": "Indomie Soto",             "cat": "Mie Instan",   "buy": 2500,  "sell": 3000,  "unit": "pcs",     "min_stock": 15, "avg_daily": 4.0, "expiry_days": 240},
        # Minuman
        {"code": "MNM01", "name": "Aqua Botol 600ml",         "cat": "Minuman",      "buy": 3000,  "sell": 4000,  "unit": "botol",   "min_stock": 24, "avg_daily": 9.0, "expiry_days": 365},
        {"code": "MNM02", "name": "Teh Pucuk Harum 350ml",    "cat": "Minuman",      "buy": 3000,  "sell": 4000,  "unit": "botol",   "min_stock": 12, "avg_daily": 4.0, "expiry_days": 180},
        {"code": "MNM03", "name": "Sprite 390ml",             "cat": "Minuman",      "buy": 4000,  "sell": 5000,  "unit": "botol",   "min_stock": 8,  "avg_daily": 2.5, "expiry_days": 365},
        # Rokok
        {"code": "RKK01", "name": "Rokok Sampoerna Mild",     "cat": "Rokok",        "buy": 24000, "sell": 27000, "unit": "pack",    "min_stock": 10, "avg_daily": 6.0, "expiry_days": None},
        # Snack
        {"code": "SNK01", "name": "Chitato 68g",              "cat": "Snack",        "buy": 6500,  "sell": 8000,  "unit": "pcs",     "min_stock": 8,  "avg_daily": 2.5, "expiry_days": 90},
        {"code": "SNK02", "name": "Oreo 133g",                "cat": "Snack",        "buy": 7500,  "sell": 9000,  "unit": "pcs",     "min_stock": 5,  "avg_daily": 1.5, "expiry_days": 180},
        # Bumbu
        {"code": "BMB01", "name": "Masako Ayam",              "cat": "Bumbu Dapur",  "buy": 4500,  "sell": 5000,  "unit": "pack",    "min_stock": 15, "avg_daily": 4.0, "expiry_days": 365},
        # Kebutuhan RT
        {"code": "KRT01", "name": "Rinso Anti Noda 800g",     "cat": "Kebutuhan RT", "buy": 13000, "sell": 15000, "unit": "bungkus", "min_stock": 5,  "avg_daily": 1.5, "expiry_days": None},
        {"code": "KRT02", "name": "Sunlight 400ml",           "cat": "Kebutuhan RT", "buy": 7500,  "sell": 9000,  "unit": "botol",   "min_stock": 6,  "avg_daily": 1.8, "expiry_days": None},
        # Sachet
        {"code": "MSC01", "name": "Kopi Kapal Api Sachet",    "cat": "Minuman Sachet","buy": 1200, "sell": 1500,  "unit": "pcs",     "min_stock": 20, "avg_daily": 5.0, "expiry_days": 365},
        # Gas
        {"code": "GAS01", "name": "Gas LPG 3kg",              "cat": "Kebutuhan Dapur","buy": 20000,"sell": 23000,"unit": "tabung",  "min_stock": 2,  "avg_daily": 0.8, "expiry_days": None},
        # Perawatan
        {"code": "PRW01", "name": "Pasta Gigi Pepsodent 75g", "cat": "Perawatan",    "buy": 5000,  "sell": 7000,  "unit": "pcs",     "min_stock": 5,  "avg_daily": 1.2, "expiry_days": 730},
    ],
    "Warung Makan": [
        {"code": "NAS01", "name": "Nasi Goreng",              "cat": "Makanan",      "buy": 7000,  "sell": 12000, "unit": "porsi",   "min_stock": 0,  "avg_daily": 15.0, "expiry_days": 1},
        {"code": "NAS02", "name": "Nasi Ayam Goreng",         "cat": "Makanan",      "buy": 8000,  "sell": 15000, "unit": "porsi",   "min_stock": 0,  "avg_daily": 12.0, "expiry_days": 1},
        {"code": "NAS03", "name": "Nasi Ayam Bakar",          "cat": "Makanan",      "buy": 9000,  "sell": 17000, "unit": "porsi",   "min_stock": 0,  "avg_daily": 8.0,  "expiry_days": 1},
        {"code": "NAS04", "name": "Nasi Pecel Lele",          "cat": "Makanan",      "buy": 8000,  "sell": 14000, "unit": "porsi",   "min_stock": 0,  "avg_daily": 6.0,  "expiry_days": 1},
        {"code": "GRG01", "name": "Gorengan Campur",          "cat": "Makanan",      "buy": 500,   "sell": 1000,  "unit": "pcs",     "min_stock": 0,  "avg_daily": 25.0, "expiry_days": 1},
        {"code": "MNM01", "name": "Es Teh Manis",             "cat": "Minuman",      "buy": 1000,  "sell": 3000,  "unit": "gelas",   "min_stock": 0,  "avg_daily": 20.0, "expiry_days": 1},
        {"code": "MNM02", "name": "Es Jeruk",                 "cat": "Minuman",      "buy": 1500,  "sell": 4000,  "unit": "gelas",   "min_stock": 0,  "avg_daily": 10.0, "expiry_days": 1},
        {"code": "MNM03", "name": "Kopi Hitam",               "cat": "Minuman",      "buy": 800,   "sell": 3000,  "unit": "gelas",   "min_stock": 0,  "avg_daily": 8.0,  "expiry_days": 1},
        {"code": "MNM04", "name": "Aqua Botol 600ml",         "cat": "Minuman",      "buy": 3000,  "sell": 5000,  "unit": "botol",   "min_stock": 12, "avg_daily": 6.0,  "expiry_days": 365},
        {"code": "SNK01", "name": "Kerupuk Udang",            "cat": "Pelengkap",    "buy": 500,   "sell": 1500,  "unit": "bungkus", "min_stock": 0,  "avg_daily": 15.0, "expiry_days": 30},
        {"code": "BMB01", "name": "Sambal Terasi",            "cat": "Pelengkap",    "buy": 2000,  "sell": 3500,  "unit": "botol",   "min_stock": 5,  "avg_daily": 1.0,  "expiry_days": 90},
        {"code": "MIE01", "name": "Mie Goreng Spesial",       "cat": "Makanan",      "buy": 6000,  "sell": 12000, "unit": "porsi",   "min_stock": 0,  "avg_daily": 5.0,  "expiry_days": 1},
    ],
    "Toko Beras": [
        {"code": "BRS01", "name": "Beras Premium 5kg",        "cat": "Beras",        "buy": 62000, "sell": 68000, "unit": "karung",  "min_stock": 10, "avg_daily": 3.0,  "expiry_days": 180},
        {"code": "BRS02", "name": "Beras Medium 5kg",         "cat": "Beras",        "buy": 50000, "sell": 56000, "unit": "karung",  "min_stock": 10, "avg_daily": 4.0,  "expiry_days": 180},
        {"code": "BRS03", "name": "Beras IR64 25kg",          "cat": "Beras",        "buy": 230000,"sell": 260000,"unit": "karung",  "min_stock": 3,  "avg_daily": 0.8,  "expiry_days": 180},
        {"code": "BRS04", "name": "Beras Pandan Wangi 10kg",  "cat": "Beras",        "buy": 135000,"sell": 155000,"unit": "karung",  "min_stock": 5,  "avg_daily": 1.0,  "expiry_days": 180},
        {"code": "BRS05", "name": "Beras Ketan 1kg",          "cat": "Beras",        "buy": 18000, "sell": 22000, "unit": "kg",      "min_stock": 5,  "avg_daily": 0.5,  "expiry_days": 180},
        {"code": "GLA01", "name": "Gula Pasir 1kg",           "cat": "Sembako",      "buy": 13500, "sell": 15500, "unit": "kg",      "min_stock": 10, "avg_daily": 2.0,  "expiry_days": None},
        {"code": "MYK01", "name": "Minyak Goreng 2L",         "cat": "Sembako",      "buy": 30000, "sell": 35000, "unit": "botol",   "min_stock": 3,  "avg_daily": 1.0,  "expiry_days": 365},
        {"code": "TPG01", "name": "Tepung Beras 500g",        "cat": "Sembako",      "buy": 8000,  "sell": 10000, "unit": "bungkus", "min_stock": 5,  "avg_daily": 0.5,  "expiry_days": 365},
    ],
    "Minimart": [
        {"code": "MNM01", "name": "Aqua Botol 600ml",         "cat": "Minuman",      "buy": 3000,  "sell": 4500,  "unit": "botol",   "min_stock": 24, "avg_daily": 10.0, "expiry_days": 365},
        {"code": "MNM02", "name": "Coca Cola 390ml",          "cat": "Minuman",      "buy": 4500,  "sell": 6000,  "unit": "botol",   "min_stock": 12, "avg_daily": 4.0,  "expiry_days": 365},
        {"code": "MNM03", "name": "Teh Botol Sosro 450ml",    "cat": "Minuman",      "buy": 3500,  "sell": 5000,  "unit": "botol",   "min_stock": 12, "avg_daily": 5.0,  "expiry_days": 180},
        {"code": "MIE01", "name": "Indomie Goreng",           "cat": "Mie Instan",   "buy": 2500,  "sell": 3500,  "unit": "pcs",     "min_stock": 40, "avg_daily": 10.0, "expiry_days": 240},
        {"code": "MIE02", "name": "Mie Sedap Soto",           "cat": "Mie Instan",   "buy": 2500,  "sell": 3500,  "unit": "pcs",     "min_stock": 20, "avg_daily": 5.0,  "expiry_days": 240},
        {"code": "SNK01", "name": "Chitato 68g",              "cat": "Snack",        "buy": 6500,  "sell": 8500,  "unit": "pcs",     "min_stock": 10, "avg_daily": 3.0,  "expiry_days": 90},
        {"code": "SNK02", "name": "Tango Wafer",              "cat": "Snack",        "buy": 5000,  "sell": 7000,  "unit": "pcs",     "min_stock": 8,  "avg_daily": 2.0,  "expiry_days": 120},
        {"code": "SNK03", "name": "Pocky Stik",               "cat": "Snack",        "buy": 7000,  "sell": 9500,  "unit": "pcs",     "min_stock": 6,  "avg_daily": 1.5,  "expiry_days": 120},
        {"code": "RKK01", "name": "Rokok Gudang Garam",       "cat": "Rokok",        "buy": 22000, "sell": 25000, "unit": "pack",    "min_stock": 10, "avg_daily": 5.0,  "expiry_days": None},
        {"code": "KRT01", "name": "Sabun Lifebuoy 100g",      "cat": "Kebutuhan RT", "buy": 4000,  "sell": 6000,  "unit": "pcs",     "min_stock": 8,  "avg_daily": 2.0,  "expiry_days": None},
        {"code": "KRT02", "name": "Shampoo Clear Sachet",     "cat": "Kebutuhan RT", "buy": 1000,  "sell": 1500,  "unit": "pcs",     "min_stock": 20, "avg_daily": 5.0,  "expiry_days": None},
        {"code": "MSC01", "name": "Good Day Cappucino Sachet","cat": "Minuman Sachet","buy": 1500, "sell": 2000,  "unit": "pcs",     "min_stock": 20, "avg_daily": 4.0,  "expiry_days": 365},
        {"code": "BRS01", "name": "Beras 5kg",                "cat": "Sembako",      "buy": 62000, "sell": 68000, "unit": "karung",  "min_stock": 3,  "avg_daily": 1.0,  "expiry_days": 180},
        {"code": "GAS01", "name": "Gas LPG 3kg",              "cat": "Kebutuhan Dapur","buy": 20000,"sell": 23000,"unit": "tabung",  "min_stock": 2,  "avg_daily": 0.5,  "expiry_days": None},
    ],
}

# Indonesian event calendar
def is_ramadan(d):
    """Approx Ramadan 2025: Mar 1 - Mar 30, 2026: Feb 18 - Mar 19"""
    if d.year == 2025:
        return date(2025, 3, 1) <= d <= date(2025, 3, 30)
    if d.year == 2026:
        return date(2026, 2, 18) <= d <= date(2026, 3, 19)
    return False

def is_holiday(d):
    """Major Indonesian holidays (approximated)"""
    holidays = [
        (1, 1), (5, 1), (8, 17), (12, 25),   # Tahun Baru, May Day, Kemerdekaan, Natal
    ]
    return (d.month, d.day) in holidays

def is_payday(d):
    """Payday: 25th - end of month & 1st of month"""
    return d.day >= 25 or d.day <= 2

businesses_created = []

for idx, umkm in enumerate(UMKM_LIST):
    biz = Business.objects.create(
        business_name=umkm["name"],
        business_type=umkm["type"],
        phone=umkm["phone"],
        address=umkm["address"],
        country="Indonesia",
        province=umkm["province"],
        city=umkm["city"],
        district=umkm["district"],
        postal_code=umkm["postal_code"],
    )
    businesses_created.append(biz)
    print(f"  [{idx+1}] {biz.business_name} ({biz.business_code}) - {umkm['description']}")

    # Create admin user for this business
    admin_user = BusinessUser.objects.create(
        business=biz,
        username=f"admin_{biz.business_code.lower()}",
        role='admin',
        full_name=f"Admin {umkm['name']}",
        is_active=True,
    )
    admin_user.set_password('admin123')
    admin_user.save()
    admin_user.owned_businesses.add(biz)

    # Create kasir user
    kasir_user = BusinessUser.objects.create(
        business=biz,
        username=f"kasir_{biz.business_code.lower()}",
        role='kasir',
        full_name=f"Kasir {umkm['name']}",
        is_active=True,
    )
    kasir_user.set_password('kasir123')
    kasir_user.save()

    # Add techdev as owner of all businesses
    if techdev_user and hasattr(techdev_user, 'owned_businesses'):
        techdev_user.owned_businesses.add(biz)

# ============================================================
# STEP 3: BUAT KATEGORI, SUPPLIER, PRODUK per UMKM
# ============================================================
print("\n[3/6] Membuat kategori, supplier, dan produk...")

for idx, biz in enumerate(businesses_created):
    umkm = UMKM_LIST[idx]
    product_list = PRODUCTS_BY_TYPE[umkm["type"]]

    # Create categories
    categories_map = {}
    cat_codes = set(p["cat"] for p in product_list)
    for cat_name in cat_codes:
        cat_code = cat_name.upper().replace(" ", "")[:10]
        cat_obj = Category.objects.create(
            business=biz,
            code=cat_code,
            name=cat_name,
        )
        categories_map[cat_name] = cat_obj

    # Create default supplier
    supplier = Supplier.objects.create(
        business=biz,
        code="SUP001",
        name=f"Supplier Utama {umkm['name']}",
        contact_person="Bapak Distributor",
        phone="+628123456000",
        city=umkm["city"],
    )

    # Create products
    products_map = {}
    for p_data in product_list:
        prod = Product.objects.create(
            business=biz,
            category=categories_map[p_data["cat"]],
            supplier=supplier,
            code=p_data["code"],
            name=p_data["name"],
            purchase_price=Decimal(str(p_data["buy"])),
            selling_price=Decimal(str(p_data["sell"])),
            unit=p_data["unit"],
            min_stock=p_data["min_stock"],
        )
        products_map[p_data["code"]] = {
            "obj": prod,
            "avg_daily": p_data["avg_daily"],
            "expiry_days": p_data["expiry_days"],
            "buy": p_data["buy"],
            "sell": p_data["sell"],
        }

    print(f"  [{biz.business_name}] {len(product_list)} produk, {len(categories_map)} kategori dibuat")

    # ============================================================
    # STEP 4: GENERATE BATCH (INVENTORY) & TRANSAKSI
    # ============================================================
    today = date(2026, 8, 1)  # Hari ini
    months_back = umkm["months_data"]
    start_date = today - timedelta(days=months_back * 30)
    min_tx, max_tx = umkm["daily_transactions"]

    # Create initial batch for all products
    for code, pdata in products_map.items():
        initial_qty = int(pdata["avg_daily"] * 30)  # 1 bulan stok awal
        exp_date = None
        if pdata["expiry_days"] and pdata["expiry_days"] > 1:
            exp_date = start_date + timedelta(days=pdata["expiry_days"])

        ProductBatch.objects.create(
            business=biz,
            product=pdata["obj"],
            batch_code=f"INIT-{code}",
            quantity=initial_qty,
            purchase_date=start_date,
            expiry_date=exp_date,
            purchase_cost=Decimal(str(pdata["buy"] * initial_qty)),
            status='ACTIVE',
        )

    # Generate daily transactions
    current_date = start_date
    tx_counter = 0
    batch_counter = 0

    print(f"  [{biz.business_name}] Generating transaksi dari {start_date} s/d {today}...")

    while current_date < today:
        # Determine number of transactions today
        base_tx = random.randint(min_tx, max_tx)
        day_of_week = current_date.weekday()

        # Weekend boost (Sabtu-Minggu lebih ramai)
        if day_of_week >= 5:
            base_tx = int(base_tx * 1.3)

        # Ramadan boost
        if is_ramadan(current_date):
            base_tx = int(base_tx * 1.5)

        # Payday boost
        if is_payday(current_date):
            base_tx = int(base_tx * 1.2)

        # Holiday dip (beberapa tutup)
        if is_holiday(current_date):
            base_tx = max(1, int(base_tx * 0.5))

        # Toko Beras: reduce to weekly pattern (3-9 per WEEK, not daily)
        if umkm["type"] == "Toko Beras":
            # Simulate weekly pattern: some days 0-1, some days 2-3
            if day_of_week in [0, 2, 4, 6]:  # Sen, Rab, Jum, Minggu - hari pasar
                base_tx = random.randint(2, 5)
            else:
                base_tx = random.randint(0, 2)

        for tx_num in range(base_tx):
            # Determine time (jam operasional 07:00 - 21:00 WIB)
            hour = random.randint(7, 20)
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            tx_datetime = timezone.make_aware(
                datetime(current_date.year, current_date.month, current_date.day, hour, minute, second),
                timezone.get_current_timezone()
            )

            # Pick random products for this transaction (1-5 items)
            num_items = random.choices([1, 2, 3, 4, 5], weights=[30, 35, 20, 10, 5])[0]
            selected_products = random.sample(list(products_map.keys()), min(num_items, len(products_map)))

            total_amount = Decimal('0.00')
            items_data = []

            for prod_code in selected_products:
                pdata = products_map[prod_code]
                # Quantity based on avg_daily with variation
                avg = pdata["avg_daily"]
                if avg >= 10:
                    qty = max(1, int(np.random.normal(avg / base_tx * 2, avg * 0.3)))
                elif avg >= 3:
                    qty = max(1, int(np.random.normal(avg / base_tx * 1.5, avg * 0.4)))
                else:
                    qty = random.randint(1, max(1, int(avg * 2)))

                qty = max(1, min(qty, 50))  # Clamp 1-50
                subtotal = Decimal(str(pdata["sell"])) * qty
                total_amount += subtotal

                items_data.append({
                    "product": pdata["obj"],
                    "quantity": qty,
                    "price_per_unit": Decimal(str(pdata["sell"])),
                    "subtotal": subtotal,
                    "cost_per_unit": Decimal(str(pdata["buy"])),
                })

            if total_amount <= 0:
                continue

            # Random payment method
            payment_method = random.choices(
                ['CASH', 'QRIS', 'TRANSFER', 'EWALLET'],
                weights=[60, 20, 10, 10]
            )[0]

            # Create transaction
            tx_code = f"TX-{biz.business_code}-{current_date.strftime('%Y%m%d')}-{tx_counter:04d}"
            amount_paid = total_amount if payment_method != 'CASH' else (
                total_amount + Decimal(str(random.choice([0, 500, 1000, 2000, 5000])))
            )
            change = max(Decimal('0.00'), amount_paid - total_amount)

            tx = Transaction.objects.create(
                business=biz,
                transaction_code=tx_code,
                total_amount=total_amount,
                discount_amount=Decimal('0.00'),
                payment_method=payment_method,
                amount_paid=amount_paid,
                change_amount=change,
                status='COMPLETED',
                cashier_name=f"Kasir {umkm['name']}",
                transaction_date=tx_datetime,
                created_at=tx_datetime,
            )

            # Create transaction items
            for item in items_data:
                TransactionItem.objects.create(
                    transaction=tx,
                    product=item["product"],
                    quantity=item["quantity"],
                    price_per_unit=item["price_per_unit"],
                    subtotal=item["subtotal"],
                    cost_per_unit=item["cost_per_unit"],
                    created_at=tx_datetime,
                )

            tx_counter += 1

        # Restock batches periodically (every 7 days)
        if current_date.day % 7 == 0:
            for code, pdata in products_map.items():
                restock_qty = int(pdata["avg_daily"] * 10)
                if restock_qty <= 0:
                    restock_qty = 5
                exp_date = None
                if pdata["expiry_days"] and pdata["expiry_days"] > 1:
                    exp_date = current_date + timedelta(days=pdata["expiry_days"])
                batch_counter += 1
                ProductBatch.objects.create(
                    business=biz,
                    product=pdata["obj"],
                    batch_code=f"B-{code}-{batch_counter:04d}",
                    quantity=restock_qty,
                    purchase_date=current_date,
                    expiry_date=exp_date,
                    purchase_cost=Decimal(str(pdata["buy"] * restock_qty)),
                    status='ACTIVE',
                )

        current_date += timedelta(days=1)

    print(f"  [{biz.business_name}] {tx_counter} transaksi, {batch_counter} batch restock dibuat")

# ============================================================
# STEP 5: RINGKASAN
# ============================================================
print("\n[5/6] Ringkasan:")
print("=" * 70)
total_tx = Transaction.objects.count()
total_items = TransactionItem.objects.count()
total_products = Product.objects.count()
total_batches = ProductBatch.objects.count()
print(f"Total UMKM       : {len(businesses_created)}")
print(f"Total Produk     : {total_products}")
print(f"Total Transaksi  : {total_tx}")
print(f"Total Item TX    : {total_items}")
print(f"Total Batch Stok : {total_batches}")
print(f"Total User       : {BusinessUser.objects.count()}")
print()

for biz in businesses_created:
    tx_count = Transaction.objects.filter(business=biz).count()
    revenue = Transaction.objects.filter(business=biz, status='COMPLETED').aggregate(
        total=django.db.models.Sum('total_amount')
    )['total'] or 0
    print(f"  {biz.business_name} ({biz.business_code})")
    print(f"    Transaksi: {tx_count}")
    print(f"    Revenue  : Rp {revenue:,.0f}")
    print()

print("[6/6] SELESAI!")
print("=" * 70)
