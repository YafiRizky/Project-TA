"""
Generate UMKM Data -- Django Management Command (PostgreSQL optimized)
=====================================================================
Jalankan: python manage.py generate_umkm_data

Membuat 1 usaha "Toko Berkah Jaya" dengan data transaksi 12 bulan penuh.
Kredensial:
  - Owner Code : G8F1CB
  - Admin       : admin_hbrpoi / admin123
  - Kasir       : kasir_hbrpoi / kasir123
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


UMKM_CONFIG = {
    "name": "Toko Berkah Jaya",
    "type": "Warung Kelontong",
    "phone": "+6281234567890",
    "address": "Jl. Raya Cibubur No. 45",
    "province": "Jawa Barat",
    "city": "Kota Bekasi",
    "district": "Bekasi Timur",
    "postal_code": "17111",
    "months_data": 12,
    "daily_transactions": (8, 15),
    "owner_code": "G8F1CB",
    "admin_username": "admin_hbrpoi",
    "kasir_username": "kasir_hbrpoi",
}

PRODUCT_LIST = [
    {"code": "BRS01", "name": "Beras Premium 5kg",       "cat": "Sembako",        "buy": 62000, "sell": 68000, "unit": "karung",  "min_stock": 5,  "avg_daily": 1.5, "expiry_days": 180},
    {"code": "GLA01", "name": "Gula Pasir 1kg",           "cat": "Sembako",        "buy": 13500, "sell": 15500, "unit": "kg",      "min_stock": 10, "avg_daily": 3.0, "expiry_days": None},
    {"code": "MYK01", "name": "Minyak Goreng Bimoli 1L",  "cat": "Sembako",        "buy": 16000, "sell": 18000, "unit": "botol",   "min_stock": 5,  "avg_daily": 2.0, "expiry_days": 365},
    {"code": "TLR01", "name": "Telur Ayam 1kg",           "cat": "Sembako",        "buy": 26000, "sell": 29000, "unit": "kg",      "min_stock": 3,  "avg_daily": 1.2, "expiry_days": 14},
    {"code": "TPG01", "name": "Tepung Terigu 1kg",        "cat": "Sembako",        "buy": 10000, "sell": 12000, "unit": "bungkus", "min_stock": 5,  "avg_daily": 1.0, "expiry_days": 365},
    {"code": "MIE01", "name": "Indomie Goreng",           "cat": "Mie Instan",     "buy": 2500,  "sell": 3000,  "unit": "pcs",     "min_stock": 30, "avg_daily": 8.0, "expiry_days": 240},
    {"code": "MIE02", "name": "Mie Sedap Goreng",         "cat": "Mie Instan",     "buy": 2500,  "sell": 3000,  "unit": "pcs",     "min_stock": 20, "avg_daily": 6.0, "expiry_days": 240},
    {"code": "MIE03", "name": "Indomie Soto",             "cat": "Mie Instan",     "buy": 2500,  "sell": 3000,  "unit": "pcs",     "min_stock": 15, "avg_daily": 4.0, "expiry_days": 240},
    {"code": "MNM01", "name": "Aqua Botol 600ml",         "cat": "Minuman",        "buy": 3000,  "sell": 4000,  "unit": "botol",   "min_stock": 24, "avg_daily": 9.0, "expiry_days": 365},
    {"code": "MNM02", "name": "Teh Pucuk Harum 350ml",    "cat": "Minuman",        "buy": 3000,  "sell": 4000,  "unit": "botol",   "min_stock": 12, "avg_daily": 4.0, "expiry_days": 180},
    {"code": "MNM03", "name": "Sprite 390ml",             "cat": "Minuman",        "buy": 4000,  "sell": 5000,  "unit": "botol",   "min_stock": 8,  "avg_daily": 2.5, "expiry_days": 365},
    {"code": "RKK01", "name": "Rokok Sampoerna Mild",     "cat": "Rokok",          "buy": 24000, "sell": 27000, "unit": "pack",    "min_stock": 10, "avg_daily": 6.0, "expiry_days": None},
    {"code": "SNK01", "name": "Chitato 68g",              "cat": "Snack",          "buy": 6500,  "sell": 8000,  "unit": "pcs",     "min_stock": 8,  "avg_daily": 2.5, "expiry_days": 90},
    {"code": "SNK02", "name": "Oreo 133g",                "cat": "Snack",          "buy": 7500,  "sell": 9000,  "unit": "pcs",     "min_stock": 5,  "avg_daily": 1.5, "expiry_days": 180},
    {"code": "BMB01", "name": "Masako Ayam",              "cat": "Bumbu Dapur",    "buy": 4500,  "sell": 5000,  "unit": "pack",    "min_stock": 15, "avg_daily": 4.0, "expiry_days": 365},
    {"code": "KRT01", "name": "Rinso Anti Noda 800g",     "cat": "Kebutuhan RT",   "buy": 13000, "sell": 15000, "unit": "bungkus", "min_stock": 5,  "avg_daily": 1.5, "expiry_days": None},
    {"code": "KRT02", "name": "Sunlight 400ml",           "cat": "Kebutuhan RT",   "buy": 7500,  "sell": 9000,  "unit": "botol",   "min_stock": 6,  "avg_daily": 1.8, "expiry_days": None},
    {"code": "MSC01", "name": "Kopi Kapal Api Sachet",    "cat": "Minuman Sachet", "buy": 1200,  "sell": 1500,  "unit": "pcs",     "min_stock": 20, "avg_daily": 5.0, "expiry_days": 365},
    {"code": "GAS01", "name": "Gas LPG 3kg",              "cat": "Kebutuhan Dapur","buy": 20000, "sell": 23000, "unit": "tabung",  "min_stock": 2,  "avg_daily": 0.8, "expiry_days": None},
    {"code": "PRW01", "name": "Pasta Gigi Pepsodent 75g", "cat": "Perawatan",      "buy": 5000,  "sell": 7000,  "unit": "pcs",     "min_stock": 5,  "avg_daily": 1.2, "expiry_days": 730},
]


def is_ramadan(d):
    if d.year == 2025: return date(2025, 3, 1) <= d <= date(2025, 3, 30)
    if d.year == 2026: return date(2026, 2, 18) <= d <= date(2026, 3, 19)
    return False

def is_payday(d):
    return d.day >= 25 or d.day <= 2

def is_holiday(d):
    return (d.month, d.day) in [(1, 1), (5, 1), (8, 17), (12, 25)]


class Command(BaseCommand):
    help = 'Generate 1 UMKM dengan data transaksi padat 12 bulan (PostgreSQL bulk_create)'

    def handle(self, *args, **options):
        random.seed(42)
        np.random.seed(42)

        self.stdout.write("=" * 70)
        self.stdout.write("GENERATE DATA -- 1 UMKM, 12 Bulan, Data Padat")
        self.stdout.write("=" * 70)

        # Pastikan superuser techdev ada dengan password dev123456
        from accounts.models import TechnicalAdmin
        techdev = TechnicalAdmin.objects.filter(username='techdev').first()
        if not techdev:
            techdev = TechnicalAdmin.objects.create_superuser(
                username='techdev',
                email='techdev@mercatura.com',
                password='dev123456',
                full_name='Technical Administrator'
            )
            self.stdout.write("  Superuser TechnicalAdmin techdev dibuat (password: dev123456)")
        else:
            techdev.is_active = True
            techdev.is_staff = True
            techdev.is_superuser = True
            techdev.set_password('dev123456')
            techdev.save()
            self.stdout.write("  Password superuser TechnicalAdmin techdev diperbarui ke dev123456")

        # ---- STEP 1: CLEAN (hapus semua kecuali techdev) ----
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

        # ---- STEP 2: CREATE BUSINESS ----
        self.stdout.write("\n[2/5] Membuat 1 UMKM...")
        umkm = UMKM_CONFIG
        biz = Business.objects.create(
            business_name=umkm["name"], business_type=umkm["type"],
            phone=umkm["phone"], address=umkm["address"],
            country="Indonesia", province=umkm["province"],
            city=umkm["city"], district=umkm["district"],
            postal_code=umkm["postal_code"],
        )
        self.stdout.write(f"  {biz.business_name} ({biz.business_code})")

        # Admin user dengan owner_code hardcoded G8F1CB
        admin = BusinessUser.objects.create(
            business=biz, username=umkm["admin_username"],
            role='admin', full_name=f"Admin {umkm['name']}", is_active=True,
            owner_code=umkm["owner_code"],
        )
        admin.set_password('admin123')
        admin.save()
        admin.owned_businesses.add(biz)
        self.stdout.write(f"  Admin: {umkm['admin_username']} | owner_code: {umkm['owner_code']}")

        # Kasir user
        kasir = BusinessUser.objects.create(
            business=biz, username=umkm["kasir_username"],
            role='kasir', full_name=f"Kasir {umkm['name']}", is_active=True,
        )
        kasir.set_password('kasir123')
        kasir.save()
        self.stdout.write(f"  Kasir: {umkm['kasir_username']}")

        # Hubungkan techdev ke bisnis ini
        if techdev and hasattr(techdev, 'owned_businesses'):
            techdev.owned_businesses.add(biz)

        # ---- STEP 3: PRODUCTS (20 produk) ----
        self.stdout.write("\n[3/5] Membuat produk...")

        cats = {}
        for cat_name in set(p["cat"] for p in PRODUCT_LIST):
            cats[cat_name] = Category.objects.create(
                business=biz, code=cat_name.upper().replace(" ", "")[:10], name=cat_name,
            )

        supplier = Supplier.objects.create(
            business=biz, code="SUP001", name=f"Supplier {umkm['name']}",
            contact_person="Distributor", phone="+628123456000", city=umkm["city"],
        )

        pmap = {}
        for p in PRODUCT_LIST:
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

        self.stdout.write(f"  {biz.business_name}: {len(PRODUCT_LIST)} produk dibuat")

        # ---- STEP 4: TRANSACTIONS 12 BULAN (BULK) ----
        self.stdout.write("\n[4/5] Generating transaksi 12 bulan (bulk_create)...")

        today = date(2026, 8, 7)
        start_date = today - timedelta(days=umkm["months_data"] * 30)
        min_tx, max_tx = umkm["daily_transactions"]

        # Initial batches (stok awal)
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

        # Generate transaksi hari per hari
        tx_buffer = []
        batch_buffer = []
        tx_counter = 0
        batch_counter = 0
        current_date = start_date
        product_codes = list(pmap.keys())

        while current_date < today:
            base_tx = random.randint(min_tx, max_tx)
            dow = current_date.weekday()

            # Variasi harian
            if dow >= 5:
                base_tx = int(base_tx * 1.3)
            if is_ramadan(current_date):
                base_tx = int(base_tx * 1.5)
            if is_payday(current_date):
                base_tx = int(base_tx * 1.2)
            if is_holiday(current_date):
                base_tx = max(1, int(base_tx * 0.5))

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

            # Restock setiap 7 hari
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

        # BULK INSERT transaksi dan items dalam chunk 500
        CHUNK = 500
        self.stdout.write(f"  Inserting {tx_counter} transaksi...")

        for i in range(0, len(tx_buffer), CHUNK):
            chunk = tx_buffer[i:i + CHUNK]
            tx_objs = [t[0] for t in chunk]
            Transaction.objects.bulk_create(tx_objs)

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

        self.stdout.write(f"  {tx_counter} transaksi, {batch_counter} batch DONE")

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

        tc = Transaction.objects.filter(business=biz).count()
        rev = Transaction.objects.filter(business=biz, status='COMPLETED').aggregate(
            t=Sum('total_amount'))['t'] or 0
        self.stdout.write(f"\n  {biz.business_name} ({biz.business_code})")
        self.stdout.write(f"    Transaksi: {tc}")
        self.stdout.write(f"    Revenue  : Rp {rev:,.0f}")
        self.stdout.write(f"\n  Login:")
        self.stdout.write(f"    Owner Code : {umkm['owner_code']}")
        self.stdout.write(f"    Admin      : {umkm['admin_username']} / admin123")
        self.stdout.write(f"    Kasir      : {umkm['kasir_username']} / kasir123")
        self.stdout.write("\nSELESAI!")
