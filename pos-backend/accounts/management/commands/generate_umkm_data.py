"""
Generate UMKM Data v2 -- Django Management Command (PostgreSQL optimized)
=========================================================================
Jalankan: python manage.py generate_umkm_data
"""
import random
import numpy as np
from datetime import datetime, timedelta, date
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import connection

from businesses.models import Business
from accounts.models import BusinessUser
from products.models import Product, Category, Supplier
from inventory.models import ProductBatch
from transactions.models import Transaction, TransactionItem

User = get_user_model()


UMKM_LIST = [
    {
        "name": "Toko Berkah Jaya",
        "type": "Warung Kelontong",
        "phone": "+6281234567890",
        "address": "Jl. Raya Cibubur No. 45",
        "province": "Jawa Barat", "city": "Kota Bekasi",
        "district": "Bekasi Timur", "postal_code": "17111",
        "months_data": 12,
        "daily_transactions": (8, 15),
    },
    {
        "name": "Warung Makan Bu Sari",
        "type": "Warung Makan",
        "phone": "+6285678901234",
        "address": "Jl. Sudirman No. 12, Pasar Minggu",
        "province": "Dki Jakarta", "city": "Kota Jakarta Selatan",
        "district": "Pasar Minggu", "postal_code": "12520",
        "months_data": 12,
        "daily_transactions": (10, 25),
    },
    {
        "name": "Toko Beras Pak Hadi",
        "type": "Toko Beras",
        "phone": "+6287890123456",
        "address": "Jl. Pasar Induk No. 3",
        "province": "Jawa Tengah", "city": "Kota Semarang",
        "district": "Semarang Barat", "postal_code": "50141",
        "months_data": 4,
        "daily_transactions": (3, 9),
    },
    {
        "name": "Minimart Sejahtera",
        "type": "Minimart",
        "phone": "+6289012345678",
        "address": "Jl. Ahmad Yani No. 88",
        "province": "Jawa Timur", "city": "Kota Surabaya",
        "district": "Wonokromo", "postal_code": "60243",
        "months_data": 4,
        "daily_transactions": (5, 12),
    },
]

PRODUCTS_BY_TYPE = {
    "Warung Kelontong": [
        {"code": "BRS01", "name": "Beras Premium 5kg",       "cat": "Sembako",       "buy": 62000, "sell": 68000, "unit": "karung",  "min_stock": 5,  "avg_daily": 1.5, "expiry_days": 180},
        {"code": "GLA01", "name": "Gula Pasir 1kg",           "cat": "Sembako",       "buy": 13500, "sell": 15500, "unit": "kg",      "min_stock": 10, "avg_daily": 3.0, "expiry_days": None},
        {"code": "MYK01", "name": "Minyak Goreng Bimoli 1L",  "cat": "Sembako",       "buy": 16000, "sell": 18000, "unit": "botol",   "min_stock": 5,  "avg_daily": 2.0, "expiry_days": 365},
        {"code": "TLR01", "name": "Telur Ayam 1kg",           "cat": "Sembako",       "buy": 26000, "sell": 29000, "unit": "kg",      "min_stock": 3,  "avg_daily": 1.2, "expiry_days": 14},
        {"code": "TPG01", "name": "Tepung Terigu 1kg",        "cat": "Sembako",       "buy": 10000, "sell": 12000, "unit": "bungkus", "min_stock": 5,  "avg_daily": 1.0, "expiry_days": 365},
        {"code": "MIE01", "name": "Indomie Goreng",           "cat": "Mie Instan",    "buy": 2500,  "sell": 3000,  "unit": "pcs",     "min_stock": 30, "avg_daily": 8.0, "expiry_days": 240},
        {"code": "MIE02", "name": "Mie Sedap Goreng",         "cat": "Mie Instan",    "buy": 2500,  "sell": 3000,  "unit": "pcs",     "min_stock": 20, "avg_daily": 6.0, "expiry_days": 240},
        {"code": "MIE03", "name": "Indomie Soto",             "cat": "Mie Instan",    "buy": 2500,  "sell": 3000,  "unit": "pcs",     "min_stock": 15, "avg_daily": 4.0, "expiry_days": 240},
        {"code": "MNM01", "name": "Aqua Botol 600ml",         "cat": "Minuman",       "buy": 3000,  "sell": 4000,  "unit": "botol",   "min_stock": 24, "avg_daily": 9.0, "expiry_days": 365},
        {"code": "MNM02", "name": "Teh Pucuk Harum 350ml",    "cat": "Minuman",       "buy": 3000,  "sell": 4000,  "unit": "botol",   "min_stock": 12, "avg_daily": 4.0, "expiry_days": 180},
        {"code": "MNM03", "name": "Sprite 390ml",             "cat": "Minuman",       "buy": 4000,  "sell": 5000,  "unit": "botol",   "min_stock": 8,  "avg_daily": 2.5, "expiry_days": 365},
        {"code": "RKK01", "name": "Rokok Sampoerna Mild",     "cat": "Rokok",         "buy": 24000, "sell": 27000, "unit": "pack",    "min_stock": 10, "avg_daily": 6.0, "expiry_days": None},
        {"code": "SNK01", "name": "Chitato 68g",              "cat": "Snack",         "buy": 6500,  "sell": 8000,  "unit": "pcs",     "min_stock": 8,  "avg_daily": 2.5, "expiry_days": 90},
        {"code": "SNK02", "name": "Oreo 133g",                "cat": "Snack",         "buy": 7500,  "sell": 9000,  "unit": "pcs",     "min_stock": 5,  "avg_daily": 1.5, "expiry_days": 180},
        {"code": "BMB01", "name": "Masako Ayam",              "cat": "Bumbu Dapur",   "buy": 4500,  "sell": 5000,  "unit": "pack",    "min_stock": 15, "avg_daily": 4.0, "expiry_days": 365},
        {"code": "KRT01", "name": "Rinso Anti Noda 800g",     "cat": "Kebutuhan RT",  "buy": 13000, "sell": 15000, "unit": "bungkus", "min_stock": 5,  "avg_daily": 1.5, "expiry_days": None},
        {"code": "KRT02", "name": "Sunlight 400ml",           "cat": "Kebutuhan RT",  "buy": 7500,  "sell": 9000,  "unit": "botol",   "min_stock": 6,  "avg_daily": 1.8, "expiry_days": None},
        {"code": "MSC01", "name": "Kopi Kapal Api Sachet",    "cat": "Minuman Sachet","buy": 1200,  "sell": 1500,  "unit": "pcs",     "min_stock": 20, "avg_daily": 5.0, "expiry_days": 365},
        {"code": "GAS01", "name": "Gas LPG 3kg",              "cat": "Kebutuhan Dapur","buy": 20000,"sell": 23000, "unit": "tabung",  "min_stock": 2,  "avg_daily": 0.8, "expiry_days": None},
        {"code": "PRW01", "name": "Pasta Gigi Pepsodent 75g", "cat": "Perawatan",     "buy": 5000,  "sell": 7000,  "unit": "pcs",     "min_stock": 5,  "avg_daily": 1.2, "expiry_days": 730},
    ],
    "Warung Makan": [
        {"code": "NAS01", "name": "Nasi Goreng",              "cat": "Makanan",   "buy": 7000,  "sell": 12000, "unit": "porsi",   "min_stock": 0, "avg_daily": 15.0, "expiry_days": 1},
        {"code": "NAS02", "name": "Nasi Ayam Goreng",         "cat": "Makanan",   "buy": 8000,  "sell": 15000, "unit": "porsi",   "min_stock": 0, "avg_daily": 12.0, "expiry_days": 1},
        {"code": "NAS03", "name": "Nasi Ayam Bakar",          "cat": "Makanan",   "buy": 9000,  "sell": 17000, "unit": "porsi",   "min_stock": 0, "avg_daily": 8.0,  "expiry_days": 1},
        {"code": "NAS04", "name": "Nasi Pecel Lele",          "cat": "Makanan",   "buy": 8000,  "sell": 14000, "unit": "porsi",   "min_stock": 0, "avg_daily": 6.0,  "expiry_days": 1},
        {"code": "GRG01", "name": "Gorengan Campur",          "cat": "Makanan",   "buy": 500,   "sell": 1000,  "unit": "pcs",     "min_stock": 0, "avg_daily": 25.0, "expiry_days": 1},
        {"code": "MNM01", "name": "Es Teh Manis",             "cat": "Minuman",   "buy": 1000,  "sell": 3000,  "unit": "gelas",   "min_stock": 0, "avg_daily": 20.0, "expiry_days": 1},
        {"code": "MNM02", "name": "Es Jeruk",                 "cat": "Minuman",   "buy": 1500,  "sell": 4000,  "unit": "gelas",   "min_stock": 0, "avg_daily": 10.0, "expiry_days": 1},
        {"code": "MNM03", "name": "Kopi Hitam",               "cat": "Minuman",   "buy": 800,   "sell": 3000,  "unit": "gelas",   "min_stock": 0, "avg_daily": 8.0,  "expiry_days": 1},
        {"code": "MNM04", "name": "Aqua Botol 600ml",         "cat": "Minuman",   "buy": 3000,  "sell": 5000,  "unit": "botol",   "min_stock": 12,"avg_daily": 6.0,  "expiry_days": 365},
        {"code": "SNK01", "name": "Kerupuk Udang",            "cat": "Pelengkap", "buy": 500,   "sell": 1500,  "unit": "bungkus", "min_stock": 0, "avg_daily": 15.0, "expiry_days": 30},
        {"code": "BMB01", "name": "Sambal Terasi",            "cat": "Pelengkap", "buy": 2000,  "sell": 3500,  "unit": "botol",   "min_stock": 5, "avg_daily": 1.0,  "expiry_days": 90},
        {"code": "MIE01", "name": "Mie Goreng Spesial",       "cat": "Makanan",   "buy": 6000,  "sell": 12000, "unit": "porsi",   "min_stock": 0, "avg_daily": 5.0,  "expiry_days": 1},
    ],
    "Toko Beras": [
        {"code": "BRS01", "name": "Beras Premium 5kg",        "cat": "Beras",   "buy": 62000,  "sell": 68000,  "unit": "karung",  "min_stock": 10, "avg_daily": 3.0, "expiry_days": 180},
        {"code": "BRS02", "name": "Beras Medium 5kg",         "cat": "Beras",   "buy": 50000,  "sell": 56000,  "unit": "karung",  "min_stock": 10, "avg_daily": 4.0, "expiry_days": 180},
        {"code": "BRS03", "name": "Beras IR64 25kg",          "cat": "Beras",   "buy": 230000, "sell": 260000, "unit": "karung",  "min_stock": 3,  "avg_daily": 0.8, "expiry_days": 180},
        {"code": "BRS04", "name": "Beras Pandan Wangi 10kg",  "cat": "Beras",   "buy": 135000, "sell": 155000, "unit": "karung",  "min_stock": 5,  "avg_daily": 1.0, "expiry_days": 180},
        {"code": "BRS05", "name": "Beras Ketan 1kg",          "cat": "Beras",   "buy": 18000,  "sell": 22000,  "unit": "kg",      "min_stock": 5,  "avg_daily": 0.5, "expiry_days": 180},
        {"code": "GLA01", "name": "Gula Pasir 1kg",           "cat": "Sembako", "buy": 13500,  "sell": 15500,  "unit": "kg",      "min_stock": 10, "avg_daily": 2.0, "expiry_days": None},
        {"code": "MYK01", "name": "Minyak Goreng 2L",         "cat": "Sembako", "buy": 30000,  "sell": 35000,  "unit": "botol",   "min_stock": 3,  "avg_daily": 1.0, "expiry_days": 365},
        {"code": "TPG01", "name": "Tepung Beras 500g",        "cat": "Sembako", "buy": 8000,   "sell": 10000,  "unit": "bungkus", "min_stock": 5,  "avg_daily": 0.5, "expiry_days": 365},
    ],
    "Minimart": [
        {"code": "MNM01", "name": "Aqua Botol 600ml",         "cat": "Minuman",       "buy": 3000,  "sell": 4500,  "unit": "botol",   "min_stock": 24, "avg_daily": 10.0,"expiry_days": 365},
        {"code": "MNM02", "name": "Coca Cola 390ml",          "cat": "Minuman",       "buy": 4500,  "sell": 6000,  "unit": "botol",   "min_stock": 12, "avg_daily": 4.0, "expiry_days": 365},
        {"code": "MNM03", "name": "Teh Botol Sosro 450ml",    "cat": "Minuman",       "buy": 3500,  "sell": 5000,  "unit": "botol",   "min_stock": 12, "avg_daily": 5.0, "expiry_days": 180},
        {"code": "MIE01", "name": "Indomie Goreng",           "cat": "Mie Instan",    "buy": 2500,  "sell": 3500,  "unit": "pcs",     "min_stock": 40, "avg_daily": 10.0,"expiry_days": 240},
        {"code": "MIE02", "name": "Mie Sedap Soto",           "cat": "Mie Instan",    "buy": 2500,  "sell": 3500,  "unit": "pcs",     "min_stock": 20, "avg_daily": 5.0, "expiry_days": 240},
        {"code": "SNK01", "name": "Chitato 68g",              "cat": "Snack",         "buy": 6500,  "sell": 8500,  "unit": "pcs",     "min_stock": 10, "avg_daily": 3.0, "expiry_days": 90},
        {"code": "SNK02", "name": "Tango Wafer",              "cat": "Snack",         "buy": 5000,  "sell": 7000,  "unit": "pcs",     "min_stock": 8,  "avg_daily": 2.0, "expiry_days": 120},
        {"code": "SNK03", "name": "Pocky Stik",               "cat": "Snack",         "buy": 7000,  "sell": 9500,  "unit": "pcs",     "min_stock": 6,  "avg_daily": 1.5, "expiry_days": 120},
        {"code": "RKK01", "name": "Rokok Gudang Garam",       "cat": "Rokok",         "buy": 22000, "sell": 25000, "unit": "pack",    "min_stock": 10, "avg_daily": 5.0, "expiry_days": None},
        {"code": "KRT01", "name": "Sabun Lifebuoy 100g",      "cat": "Kebutuhan RT",  "buy": 4000,  "sell": 6000,  "unit": "pcs",     "min_stock": 8,  "avg_daily": 2.0, "expiry_days": None},
        {"code": "KRT02", "name": "Shampoo Clear Sachet",     "cat": "Kebutuhan RT",  "buy": 1000,  "sell": 1500,  "unit": "pcs",     "min_stock": 20, "avg_daily": 5.0, "expiry_days": None},
        {"code": "MSC01", "name": "Good Day Cappucino Sachet","cat": "Minuman Sachet","buy": 1500,  "sell": 2000,  "unit": "pcs",     "min_stock": 20, "avg_daily": 4.0, "expiry_days": 365},
        {"code": "BRS01", "name": "Beras 5kg",                "cat": "Sembako",       "buy": 62000, "sell": 68000, "unit": "karung",  "min_stock": 3,  "avg_daily": 1.0, "expiry_days": 180},
        {"code": "GAS01", "name": "Gas LPG 3kg",              "cat": "Kebutuhan Dapur","buy": 20000,"sell": 23000, "unit": "tabung",  "min_stock": 2,  "avg_daily": 0.5, "expiry_days": None},
    ],
}


def is_ramadan(d):
    if d.year == 2025: return date(2025, 3, 1) <= d <= date(2025, 3, 30)
    if d.year == 2026: return date(2026, 2, 18) <= d <= date(2026, 3, 19)
    return False

def is_payday(d):
    return d.day >= 25 or d.day <= 2

def is_holiday(d):
    return (d.month, d.day) in [(1, 1), (5, 1), (8, 17), (12, 25)]


class Command(BaseCommand):
    help = 'Generate 4 UMKM dengan data transaksi lengkap (PostgreSQL bulk_create)'

    def handle(self, *args, **options):
        random.seed(42)
        np.random.seed(42)

        self.stdout.write("=" * 70)
        self.stdout.write("GENERATE DATA v2 -- PostgreSQL bulk_create")
        self.stdout.write("=" * 70)

        # Preserve techdev
        techdev = User.objects.filter(is_staff=True).first()
        if not techdev:
            techdev = User.objects.filter(username='techdev').first()
        self.stdout.write(f"[PRESERVE] techdev: {techdev}")

        # ---- STEP 1: CLEAN ----
        self.stdout.write("\n[1/5] Menghapus data lama...")
        TransactionItem.objects.all().delete()
        Transaction.objects.all().delete()
        ProductBatch.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        Supplier.objects.all().delete()
        if techdev:
            BusinessUser.objects.exclude(id=techdev.id).delete()
        else:
            BusinessUser.objects.all().delete()
        Business.objects.all().delete()
        self.stdout.write("  Data lama dihapus (kecuali techdev)")

        # ---- STEP 2: CREATE BUSINESSES ----
        self.stdout.write("\n[2/5] Membuat 4 UMKM...")
        businesses = []
        for umkm in UMKM_LIST:
            biz = Business.objects.create(
                business_name=umkm["name"], business_type=umkm["type"],
                phone=umkm["phone"], address=umkm["address"],
                country="Indonesia", province=umkm["province"],
                city=umkm["city"], district=umkm["district"],
                postal_code=umkm["postal_code"],
            )
            businesses.append(biz)
            self.stdout.write(f"  {biz.business_name} ({biz.business_code})")

            admin = BusinessUser.objects.create(
                business=biz, username=f"admin_{biz.business_code.lower()}",
                role='admin', full_name=f"Admin {umkm['name']}", is_active=True,
                owner_code=BusinessUser.generate_owner_code(),
            )
            admin.set_password('admin123')
            admin.save()
            admin.owned_businesses.add(biz)

            kasir = BusinessUser.objects.create(
                business=biz, username=f"kasir_{biz.business_code.lower()}",
                role='kasir', full_name=f"Kasir {umkm['name']}", is_active=True,
            )
            kasir.set_password('kasir123')
            kasir.save()

            if techdev and hasattr(techdev, 'owned_businesses'):
                techdev.owned_businesses.add(biz)

        # ---- STEP 3: PRODUCTS ----
        self.stdout.write("\n[3/5] Membuat produk...")
        all_products_map = {}  # biz_id -> {code -> {obj, avg_daily, ...}}

        for idx, biz in enumerate(businesses):
            umkm = UMKM_LIST[idx]
            product_list = PRODUCTS_BY_TYPE[umkm["type"]]

            cats = {}
            for cat_name in set(p["cat"] for p in product_list):
                cats[cat_name] = Category.objects.create(
                    business=biz, code=cat_name.upper().replace(" ", "")[:10], name=cat_name,
                )

            supplier = Supplier.objects.create(
                business=biz, code="SUP001", name=f"Supplier {umkm['name']}",
                contact_person="Distributor", phone="+628123456000", city=umkm["city"],
            )

            pmap = {}
            for p in product_list:
                prod = Product.objects.create(
                    business=biz, category=cats[p["cat"]], supplier=supplier,
                    code=p["code"], name=p["name"],
                    purchase_price=Decimal(str(p["buy"])),
                    selling_price=Decimal(str(p["sell"])),
                    unit=p["unit"], min_stock=p["min_stock"],
                )
                pmap[p["code"]] = {"obj": prod, "avg_daily": p["avg_daily"],
                                   "expiry_days": p["expiry_days"],
                                   "buy": p["buy"], "sell": p["sell"]}

            all_products_map[biz.id] = pmap
            self.stdout.write(f"  {biz.business_name}: {len(product_list)} produk")

        # ---- STEP 4: TRANSACTIONS (BULK) ----
        self.stdout.write("\n[4/5] Generating transaksi (bulk_create)...")

        for idx, biz in enumerate(businesses):
            umkm = UMKM_LIST[idx]
            pmap = all_products_map[biz.id]
            today = date(2026, 8, 1)
            start_date = today - timedelta(days=umkm["months_data"] * 30)
            min_tx, max_tx = umkm["daily_transactions"]

            # Initial batches
            init_batches = []
            for code, pd in pmap.items():
                qty = int(pd["avg_daily"] * 30)
                exp = None
                if pd["expiry_days"] and pd["expiry_days"] > 1:
                    exp = start_date + timedelta(days=pd["expiry_days"])
                init_batches.append(ProductBatch(
                    business=biz, product=pd["obj"], batch_code=f"INIT-{code}",
                    quantity=qty, purchase_date=start_date, expiry_date=exp,
                    purchase_cost=Decimal(str(pd["buy"] * qty)), status='ACTIVE',
                ))
            ProductBatch.objects.bulk_create(init_batches)

            # Accumulate transactions and items in memory, then bulk_create in chunks
            tx_buffer = []
            item_buffer = []
            batch_buffer = []
            tx_counter = 0
            batch_counter = 0
            current_date = start_date
            product_codes = list(pmap.keys())

            while current_date < today:
                base_tx = random.randint(min_tx, max_tx)
                dow = current_date.weekday()

                if dow >= 5:
                    base_tx = int(base_tx * 1.3)
                if is_ramadan(current_date):
                    base_tx = int(base_tx * 1.5)
                if is_payday(current_date):
                    base_tx = int(base_tx * 1.2)
                if is_holiday(current_date):
                    base_tx = max(1, int(base_tx * 0.5))

                # Toko Beras: weekly pattern
                if umkm["type"] == "Toko Beras":
                    if dow in [0, 2, 4, 6]:
                        base_tx = random.randint(2, 5)
                    else:
                        base_tx = random.randint(0, 2)

                for _ in range(base_tx):
                    hour = random.randint(7, 20)
                    minute = random.randint(0, 59)
                    tx_dt = timezone.make_aware(
                        datetime(current_date.year, current_date.month, current_date.day,
                                 hour, minute, random.randint(0, 59)),
                        timezone.get_current_timezone()
                    )

                    num_items = random.choices([1, 2, 3, 4, 5], weights=[30, 35, 20, 10, 5])[0]
                    sel = random.sample(product_codes, min(num_items, len(product_codes)))

                    total = Decimal('0.00')
                    items = []
                    for pc in sel:
                        pd = pmap[pc]
                        avg = pd["avg_daily"]
                        if avg >= 10:
                            qty = max(1, int(np.random.normal(avg / base_tx * 2, avg * 0.3)))
                        elif avg >= 3:
                            qty = max(1, int(np.random.normal(avg / base_tx * 1.5, avg * 0.4)))
                        else:
                            qty = random.randint(1, max(1, int(avg * 2)))
                        qty = max(1, min(qty, 50))
                        sub = Decimal(str(pd["sell"])) * qty
                        total += sub
                        items.append({"product": pd["obj"], "qty": qty,
                                      "price": Decimal(str(pd["sell"])),
                                      "sub": sub, "cost": Decimal(str(pd["buy"]))})

                    if total <= 0:
                        continue

                    pm = random.choices(['CASH', 'QRIS', 'TRANSFER', 'EWALLET'],
                                        weights=[60, 20, 10, 10])[0]
                    paid = total if pm != 'CASH' else total + Decimal(str(random.choice([0, 500, 1000, 2000, 5000])))
                    change = max(Decimal('0.00'), paid - total)
                    tx_code = f"TX-{biz.business_code}-{current_date.strftime('%Y%m%d')}-{tx_counter:04d}"

                    tx_obj = Transaction(
                        business=biz, transaction_code=tx_code,
                        total_amount=total, discount_amount=Decimal('0.00'),
                        payment_method=pm, amount_paid=paid, change_amount=change,
                        status='COMPLETED', cashier_name=f"Kasir {umkm['name']}",
                        transaction_date=tx_dt, created_at=tx_dt,
                    )
                    tx_buffer.append((tx_obj, items))
                    tx_counter += 1

                # Restock every 7 days
                if current_date.day % 7 == 0:
                    for code, pd in pmap.items():
                        rq = max(5, int(pd["avg_daily"] * 10))
                        exp = None
                        if pd["expiry_days"] and pd["expiry_days"] > 1:
                            exp = current_date + timedelta(days=pd["expiry_days"])
                        batch_counter += 1
                        batch_buffer.append(ProductBatch(
                            business=biz, product=pd["obj"],
                            batch_code=f"B-{code}-{batch_counter:04d}",
                            quantity=rq, purchase_date=current_date, expiry_date=exp,
                            purchase_cost=Decimal(str(pd["buy"] * rq)), status='ACTIVE',
                        ))

                current_date += timedelta(days=1)

            # BULK INSERT: transactions first, then items
            CHUNK = 500
            self.stdout.write(f"  [{biz.business_name}] Inserting {tx_counter} transaksi...")

            for i in range(0, len(tx_buffer), CHUNK):
                chunk = tx_buffer[i:i + CHUNK]
                tx_objs = [t[0] for t in chunk]
                Transaction.objects.bulk_create(tx_objs)

                # Now create items with the saved transaction IDs
                item_objs = []
                for tx_obj, items in chunk:
                    for it in items:
                        item_objs.append(TransactionItem(
                            transaction=tx_obj, product=it["product"],
                            quantity=it["qty"], price_per_unit=it["price"],
                            subtotal=it["sub"], cost_per_unit=it["cost"],
                            created_at=tx_obj.transaction_date,
                        ))
                TransactionItem.objects.bulk_create(item_objs)

            # Bulk insert batches
            if batch_buffer:
                ProductBatch.objects.bulk_create(batch_buffer, batch_size=500)

            self.stdout.write(f"  [{biz.business_name}] {tx_counter} tx, {batch_counter} batch DONE")

        # ---- STEP 5: SUMMARY ----
        self.stdout.write("\n[5/5] RINGKASAN:")
        self.stdout.write("=" * 70)
        from django.db.models import Sum
        self.stdout.write(f"Total UMKM       : {Business.objects.count()}")
        self.stdout.write(f"Total Produk     : {Product.objects.count()}")
        self.stdout.write(f"Total Transaksi  : {Transaction.objects.count()}")
        self.stdout.write(f"Total Item TX    : {TransactionItem.objects.count()}")
        self.stdout.write(f"Total Batch      : {ProductBatch.objects.count()}")
        self.stdout.write(f"Total User       : {BusinessUser.objects.count()}")
        for biz in businesses:
            tc = Transaction.objects.filter(business=biz).count()
            rev = Transaction.objects.filter(business=biz, status='COMPLETED').aggregate(
                t=Sum('total_amount'))['t'] or 0
            self.stdout.write(f"\n  {biz.business_name} ({biz.business_code})")
            self.stdout.write(f"    Transaksi: {tc}")
            self.stdout.write(f"    Revenue  : Rp {rev:,.0f}")
        self.stdout.write("\nSELESAI!")
