"""
Generate UMKM Data -- Django Management Command (PostgreSQL / SQLite optimized)
=====================================================================
Jalankan: python manage.py generate_umkm_data

Membuat 3 profil usaha dengan rentang data 1 tahun penuh (Dinamis: 365 hari yang lalu hingga HARI INI):
1. Bisnis Ramai (Warung Kelontong - Toko Berkah Jaya)
   - Code: HBRPOI | Owner Code: FI52TX
   - Admin: admin_hbrpoi / admin123
   - Kasir: kasir_hbrpoi / kasir123
   - Volume: 8-18 transaksi/hari (~4,000+ total transaksi)

2. Bisnis Menengah (Toko Elektronik - Berkah Elektro)
   - Code: ELEK01 | Owner Code: EL99X1
   - Admin: admin_elektronik / admin123
   - Kasir: kasir_elektronik / kasir123
   - Volume: 2-6 transaksi/hari (~1,000+ total transaksi)

3. Bisnis Sepi (Toko Antik - Galeri Antik Barokah)
   - Code: ANTK01 | Owner Code: AT77Y2
   - Admin: admin_antik / admin123
   - Kasir: kasir_antik / kasir123
   - Volume: 15-25 transaksi/bulan (~200+ total transaksi)

Superuser `techdev` (dev123456) dipertahankan dan dihubungkan ke ketiga bisnis.
"""
import random
import numpy as np
from datetime import datetime, timedelta, date
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import transaction as db_transaction

from businesses.models import Business
from accounts.models import BusinessUser, TechnicalAdmin
from products.models import Product, Category, Supplier
from inventory.models import ProductBatch, InventoryMovement, StockOpname, StockOpnameItem
from transactions.models import Transaction, TransactionItem
from payments.models import PaymentMethod
from promotions.models import DiscountRule

User = get_user_model()


BUSINESS_CONFIGS = [
    {
        "code": "HBRPOI",
        "name": "Toko Berkah Jaya",
        "type": "Warung Kelontong",
        "phone": "+6281234567890",
        "address": "Jl. Raya Cibubur No. 45",
        "province": "Jawa Barat",
        "city": "Kota Bekasi",
        "district": "Bekasi Timur",
        "postal_code": "17111",
        "owner_code": "FI52TX",
        "admin_username": "admin_hbrpoi",
        "kasir_username": "kasir_hbrpoi",
        "mode": "RAMAI",
        "daily_tx": (8, 18),
        "discounts": [
            {"name": "Promo Sembako Gajian (10%)", "type": "PERCENT", "value": 10.0, "min_qty": 2},
            {"name": "Potongan Belanja Hemat (Rp 3.000)", "type": "NOMINAL", "value": 3000.0, "min_qty": 3},
        ],
        "products": [
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
    },
    {
        "code": "ELEK01",
        "name": "Berkah Elektro",
        "type": "Toko Elektronik",
        "phone": "+6281987654321",
        "address": "Jl. Pemuda No. 12",
        "province": "Jawa Tengah",
        "city": "Kota Semarang",
        "district": "Semarang Tengah",
        "postal_code": "50132",
        "owner_code": "EL99X1",
        "admin_username": "admin_elektronik",
        "kasir_username": "kasir_elektronik",
        "mode": "MENENGAH",
        "daily_tx": (2, 6),
        "discounts": [
            {"name": "Diskon Aksesoris Weekend (15%)", "type": "PERCENT", "value": 15.0, "min_qty": 1},
            {"name": "Cashback Elektronik (Rp 10.000)", "type": "NOMINAL", "value": 10000.0, "min_qty": 1},
        ],
        "products": [
            {"code": "KBL01", "name": "Kabel Data Type-C Fast Charging", "cat": "Aksesoris HP", "buy": 15000, "sell": 35000, "unit": "pcs", "min_stock": 10, "avg_daily": 1.5, "expiry_days": None},
            {"code": "KBL02", "name": "Kabel Lightning iPhone 1m",        "cat": "Aksesoris HP", "buy": 20000, "sell": 45000, "unit": "pcs", "min_stock": 8,  "avg_daily": 1.0, "expiry_days": None},
            {"code": "CHG01", "name": "Kepala Charger 20W QuickCharge",   "cat": "Aksesoris HP", "buy": 35000, "sell": 75000, "unit": "pcs", "min_stock": 5,  "avg_daily": 0.8, "expiry_days": None},
            {"code": "PWB01", "name": "Powerbank 10000mAh Slim",         "cat": "Powerbank",     "buy": 75000, "sell": 135000,"unit": "unit","min_stock": 4,  "avg_daily": 0.5, "expiry_days": None},
            {"code": "TWS01", "name": "Earphone TWS Bluetooth 5.3",       "cat": "Audio",         "buy": 60000, "sell": 120000,"unit": "unit","min_stock": 5,  "avg_daily": 0.7, "expiry_days": None},
            {"code": "EAR01", "name": "Handsfree Kabel Jack 3.5mm",       "cat": "Audio",         "buy": 8000,  "sell": 20000, "unit": "pcs", "min_stock": 10, "avg_daily": 1.2, "expiry_days": None},
            {"code": "FLS01", "name": "Flashdisk Sandisk 32GB USB 3.0",   "cat": "Storage",       "buy": 40000, "sell": 65000, "unit": "pcs", "min_stock": 6,  "avg_daily": 0.6, "expiry_days": None},
            {"code": "MOU01", "name": "Mouse Wireless Silent Click",      "cat": "Komputer",      "buy": 30000, "sell": 55000, "unit": "pcs", "min_stock": 5,  "avg_daily": 0.5, "expiry_days": None},
            {"code": "KBD01", "name": "Keyboard USB Standar Kantor",      "cat": "Komputer",      "buy": 45000, "sell": 75000, "unit": "pcs", "min_stock": 3,  "avg_daily": 0.3, "expiry_days": None},
            {"code": "STP01", "name": "Stop Kontak Uticon 4 Lubang 3m",   "cat": "Kelistrikan",   "buy": 35000, "sell": 55000, "unit": "pcs", "min_stock": 4,  "avg_daily": 0.4, "expiry_days": None},
            {"code": "LMP01", "name": "Lampu LED Philips 12W",            "cat": "Kelistrikan",   "buy": 28000, "sell": 40000, "unit": "pcs", "min_stock": 8,  "avg_daily": 0.9, "expiry_days": None},
            {"code": "BAT01", "name": "Baterai AA Alkaline 4-Pack",       "cat": "Baterai",       "buy": 16000, "sell": 25000, "unit": "pack","min_stock": 12, "avg_daily": 1.0, "expiry_days": 1095},
        ]
    },
    {
        "code": "ANTK01",
        "name": "Galeri Antik Barokah",
        "type": "Toko Barang Antik & Seni",
        "phone": "+6281357924680",
        "address": "Jl. Kaliurang KM 9 No. 88",
        "province": "D.I. Yogyakarta",
        "city": "Kabupaten Sleman",
        "district": "Ngaglik",
        "postal_code": "55581",
        "owner_code": "AT77Y2",
        "admin_username": "admin_antik",
        "kasir_username": "kasir_antik",
        "mode": "SEPI",
        "daily_tx": (0, 2),  # Sepi: 15-25 tx / bulan (sekitar 0.6 tx/hari)
        "discounts": [
            {"name": "Diskon Kolektor Spesial (5%)", "type": "PERCENT", "value": 5.0, "min_qty": 1},
        ],
        "products": [
            {"code": "JAM01", "name": "Jam Dinding Kuno kayu 1950", "cat": "Barang Antik", "buy": 450000, "sell": 850000, "unit": "unit", "min_stock": 1, "avg_daily": 0.05, "expiry_days": None},
            {"code": "LKS01", "name": "Lukisan Minyak Klasik Pemandangan", "cat": "Seni & Lukisan", "buy": 600000, "sell": 1200000, "unit": "unit", "min_stock": 1, "avg_daily": 0.04, "expiry_days": None},
            {"code": "PRG01", "name": "Piring Keramik Vintage Dinasti", "cat": "Keramik & Porselen", "buy": 250000, "sell": 500000, "unit": "pcs", "min_stock": 2, "avg_daily": 0.08, "expiry_days": None},
            {"code": "LMP01", "name": "Lampu Minyak Antik Kuningan", "cat": "Barang Antik", "buy": 180000, "sell": 350000, "unit": "pcs", "min_stock": 2, "avg_daily": 0.07, "expiry_days": None},
            {"code": "PTG01", "name": "Patung Ukir Kayu Jati Klasik", "cat": "Seni & Lukisan", "buy": 350000, "sell": 700000, "unit": "pcs", "min_stock": 1, "avg_daily": 0.05, "expiry_days": None},
            {"code": "GRM01", "name": "Gramofon Antik Engkol Kayu", "cat": "Koleksi Musik", "buy": 1200000,"sell": 2500000,"unit": "unit", "min_stock": 1, "avg_daily": 0.02, "expiry_days": None},
            {"code": "RDO01", "name": "Radio Tabung Kuno 1960",     "cat": "Koleksi Musik", "buy": 550000, "sell": 1100000,"unit": "unit", "min_stock": 1, "avg_daily": 0.03, "expiry_days": None},
            {"code": "VAS01", "name": "Vas Bunga Perunggu Ukir",   "cat": "Keramik & Porselen", "buy": 300000, "sell": 600000, "unit": "pcs", "min_stock": 2, "avg_daily": 0.06, "expiry_days": None},
        ]
    }
]


def is_ramadan(d):
    if d.year == 2025: return date(2025, 3, 1) <= d <= date(2025, 3, 30)
    if d.year == 2026: return date(2026, 2, 18) <= d <= date(2026, 3, 19)
    if d.year == 2027: return date(2027, 2, 8) <= d <= date(2027, 3, 9)
    return False

def is_payday(d):
    return d.day >= 25 or d.day <= 2

def is_holiday(d):
    return (d.month, d.day) in [(1, 1), (5, 1), (8, 17), (12, 25)]


class Command(BaseCommand):
    help = 'Generate 3 UMKM (Ramai, Menengah, Sepi) dengan data transaksi 1 tahun penuh hingga hari ini'

    def handle(self, *args, **options):
        random.seed(42)
        np.random.seed(42)

        # Tanggal dinamis: Hari ini dan 365 hari ke belakang
        today = timezone.now().date()
        start_date = today - timedelta(days=365)

        self.stdout.write("=" * 75)
        self.stdout.write(f"GENERATE DATA -- 3 UMKM (Ramai, Menengah, Sepi) | Rentang: {start_date} s.d. {today}")
        self.stdout.write("=" * 75)

        # ---------------------------------------------------------------------
        # STEP 0: Techdev Superuser Safe Check
        # ---------------------------------------------------------------------
        techdev = TechnicalAdmin.objects.filter(username='techdev').first()
        if not techdev:
            techdev = TechnicalAdmin.objects.create_superuser(
                username='techdev',
                email='techdev@mercatura.com',
                password='dev123456',
                full_name='Technical Administrator'
            )
            self.stdout.write("  [OK] Superuser TechnicalAdmin 'techdev' dibuat (password: dev123456)")
        else:
            techdev.is_active = True
            techdev.is_staff = True
            techdev.is_superuser = True
            techdev.set_password('dev123456')
            techdev.save()
            self.stdout.write("  [OK] Superuser TechnicalAdmin 'techdev' dipastikan aktif (password: dev123456)")

        # ---------------------------------------------------------------------
        # STEP 1: CLEANING DATABASE (Restrukturisasi bersih kecuali techdev)
        # ---------------------------------------------------------------------
        self.stdout.write("\n[1/5] Menghapus seluruh data lama (kecuali techdev)...")
        with db_transaction.atomic():
            DiscountRule.objects.all().delete()
            PaymentMethod.objects.all().delete()
            StockOpnameItem.objects.all().delete()
            StockOpname.objects.all().delete()
            InventoryMovement.objects.all().delete()
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
        self.stdout.write("  [OK] Database bersih 100%.")

        # ---------------------------------------------------------------------
        # GENERASI DATA 3 UMKM
        # ---------------------------------------------------------------------
        for bidx, cfg in enumerate(BUSINESS_CONFIGS, 1):
            self.stdout.write(f"\n[{bidx+1}/5] MEMPROSES UMKM {bidx}: {cfg['name']} ({cfg['mode']})...")
            self.stdout.write("-" * 65)

            with db_transaction.atomic():
                # 1. Business
                biz = Business.objects.create(
                    business_code=cfg["code"],
                    business_name=cfg["name"],
                    business_type=cfg["type"],
                    phone=cfg["phone"],
                    address=cfg["address"],
                    country="Indonesia",
                    province=cfg["province"],
                    city=cfg["city"],
                    district=cfg["district"],
                    postal_code=cfg["postal_code"],
                )
                self.stdout.write(f"  Business        : {biz.business_name} ({biz.business_code})")

                # Hubungkan techdev ke bisnis ini
                if techdev and hasattr(techdev, 'owned_businesses'):
                    techdev.owned_businesses.add(biz)

                # 2. BusinessUser (Admin & Kasir)
                admin = BusinessUser.objects.create(
                    business=biz,
                    username=cfg["admin_username"],
                    role='admin',
                    full_name=f"Admin {cfg['name']}",
                    is_active=True,
                    owner_code=cfg["owner_code"],
                )
                admin.set_password('admin123')
                admin.save()
                admin.owned_businesses.add(biz)

                kasir = BusinessUser.objects.create(
                    business=biz,
                    username=cfg["kasir_username"],
                    role='kasir',
                    full_name=f"Kasir {cfg['name']}",
                    is_active=True,
                )
                kasir.set_password('kasir123')
                kasir.save()
                self.stdout.write(f"  Admin User      : {cfg['admin_username']} (owner_code: {cfg['owner_code']})")
                self.stdout.write(f"  Kasir User      : {cfg['kasir_username']}")

                # 3. Payment Methods (Setiap UMKM memiliki 4 metode pembayaran)
                PaymentMethod.objects.create(
                    business=biz, method_type='CASH', name='Tunai', is_active=True, instructions='Pembayaran Tunai'
                )
                PaymentMethod.objects.create(
                    business=biz, method_type='QRIS', name='QRIS Toko', is_active=True, instructions='Scan QRIS di Kasir'
                )
                PaymentMethod.objects.create(
                    business=biz, method_type='TRANSFER', name='BCA', account_number='1234567890', account_name=f"A/N {cfg['name']}", is_active=True
                )
                PaymentMethod.objects.create(
                    business=biz, method_type='EWALLET', name='GoPay', account_number=cfg['phone'], account_name=f"A/N {cfg['name']}", is_active=True
                )
                self.stdout.write("  Payment Methods : CASH, QRIS, TRANSFER (BCA), EWALLET (GoPay) -> TERISI")

                # 4. Supplier & Categories
                supplier = Supplier.objects.create(
                    business=biz,
                    code=f"SUP-{cfg['code']}",
                    name=f"Distributor Utama {cfg['name']}",
                    contact_person="Bapak Hery",
                    phone="+628123456777",
                    city=cfg["city"],
                )

                cats = {}
                for cat_name in set(p["cat"] for p in cfg["products"]):
                    cats[cat_name] = Category.objects.create(
                        business=biz,
                        code=cat_name.upper().replace(" ", "")[:10],
                        name=cat_name,
                    )

                pmap = {}
                created_products = []
                for p in cfg["products"]:
                    prod = Product.objects.create(
                        business=biz,
                        category=cats[p["cat"]],
                        supplier=supplier,
                        code=p["code"],
                        name=p["name"],
                        purchase_price=Decimal(str(p["buy"])),
                        selling_price=Decimal(str(p["sell"])),
                        unit=p["unit"],
                        min_stock=p["min_stock"],
                    )
                    created_products.append(prod)
                    pmap[p["code"]] = {
                        "obj": prod,
                        "avg_daily": p["avg_daily"],
                        "expiry_days": p["expiry_days"],
                        "buy": p["buy"],
                        "sell": p["sell"],
                    }
                self.stdout.write(f"  Products        : {len(cfg['products'])} produk terdaftar")

                # 4b. Discount Rules (Aturan Diskon Mandiri)
                for dcfg in cfg.get("discounts", []):
                    drule = DiscountRule.objects.create(
                        business=biz,
                        name=dcfg["name"],
                        discount_type=dcfg["type"],
                        discount_value=Decimal(str(dcfg["value"])),
                        min_quantity=dcfg["min_qty"],
                        is_active=True,
                    )
                    # Sambungkan ke sebagian produk
                    drule.products.set(created_products[:3])
                self.stdout.write(f"  Discount Rules  : {len(cfg.get('discounts', []))} aturan diskon terdaftar")

                # 5. Product Batches Awal (Stok Awal 365 Hari Lalu)
                init_batches = []
                for code, pd in pmap.items():
                    qty = max(10, int(pd["avg_daily"] * 60)) if cfg["mode"] != "SEPI" else random.randint(3, 8)
                    exp = None
                    if pd["expiry_days"] and pd["expiry_days"] > 1:
                        exp = start_date + timedelta(days=pd["expiry_days"])
                    init_batches.append(ProductBatch(
                        business=biz,
                        product=pd["obj"],
                        batch_code=f"INIT-{code}",
                        quantity=qty,
                        purchase_date=start_date,
                        expiry_date=exp,
                        purchase_cost=Decimal(str(pd["buy"] * qty)),
                        status='ACTIVE',
                    ))
                ProductBatch.objects.bulk_create(init_batches)

            # 6. Generate Transaksi 1 Tahun (Daily Loop: start_date -> today)
            self.stdout.write(f"  Generating transaksi 1 tahun ({start_date} s.d. {today})...")
            tx_buffer = []
            batch_buffer = []
            tx_counter = 0
            batch_counter = 0
            current_date = start_date
            product_codes = list(pmap.keys())

            min_tx, max_tx = cfg["daily_tx"]

            while current_date <= today:
                if cfg["mode"] == "SEPI":
                    # Kategori Sepi: 15-25 tx per bulan -> sekitar ~0.6 tx per hari
                    # Peluang transaksi per hari ~65%
                    base_tx = 1 if random.random() < 0.65 else 0
                else:
                    base_tx = random.randint(min_tx, max_tx)
                    dow = current_date.weekday()
                    if dow >= 5: base_tx = int(base_tx * 1.3)
                    if is_ramadan(current_date): base_tx = int(base_tx * 1.4)
                    if is_payday(current_date): base_tx = int(base_tx * 1.2)
                    if is_holiday(current_date): base_tx = max(1, int(base_tx * 0.6))

                for _ in range(base_tx):
                    hour = random.randint(8, 20)
                    minute = random.randint(0, 59)
                    tx_dt = timezone.make_aware(
                        datetime(current_date.year, current_date.month, current_date.day,
                                 hour, minute, random.randint(0, 59)),
                        timezone.get_current_timezone()
                    )

                    num_items = random.choices([1, 2, 3, 4], weights=[50, 30, 15, 5])[0]
                    sel = random.sample(product_codes, min(num_items, len(product_codes)))

                    total = Decimal('0.00')
                    items = []
                    for pc in sel:
                        pd = pmap[pc]
                        qty = random.randint(1, 3) if cfg["mode"] == "RAMAI" else 1
                        sub = Decimal(str(pd["sell"])) * qty
                        total += sub
                        items.append({
                            "product": pd["obj"],
                            "qty": qty,
                            "price": Decimal(str(pd["sell"])),
                            "sub": sub,
                            "cost": Decimal(str(pd["buy"])),
                        })

                    if total <= 0:
                        continue

                    # 98% COMPLETED, 2% VOIDED
                    tx_status = 'VOIDED' if random.random() < 0.02 else 'COMPLETED'
                    pm = random.choices(['CASH', 'QRIS', 'TRANSFER', 'EWALLET'], weights=[60, 25, 8, 7])[0]
                    paid = total if pm != 'CASH' else total + Decimal(str(random.choice([0, 1000, 2000, 5000])))
                    change = max(Decimal('0.00'), paid - total)
                    tx_code = f"TX-{biz.business_code}-{current_date.strftime('%Y%m%d')}-{tx_counter:04d}"

                    tx_obj = Transaction(
                        business=biz,
                        transaction_code=tx_code,
                        total_amount=total,
                        discount_amount=Decimal('0.00'),
                        payment_method=pm,
                        amount_paid=paid,
                        change_amount=change,
                        status=tx_status,
                        cashier_name=f"Kasir {cfg['name']}",
                        transaction_date=tx_dt,
                        created_at=tx_dt,
                    )
                    tx_buffer.append((tx_obj, items))
                    tx_counter += 1

                # Restock Batch Periodik (Ramai: tiap 7 hari, Menengah: tiap 14 hari, Sepi: tiap 30 hari)
                restock_interval = 7 if cfg["mode"] == "RAMAI" else (14 if cfg["mode"] == "MENENGAH" else 30)
                if current_date.day % restock_interval == 0:
                    for code, pd in pmap.items():
                        rq = max(5, int(pd["avg_daily"] * restock_interval * 1.5)) if cfg["mode"] != "SEPI" else random.randint(2, 4)
                        exp = None
                        if pd["expiry_days"] and pd["expiry_days"] > 1:
                            exp = current_date + timedelta(days=pd["expiry_days"])
                        batch_counter += 1
                        batch_buffer.append(ProductBatch(
                            business=biz,
                            product=pd["obj"],
                            batch_code=f"B-{code}-{batch_counter:04d}",
                            quantity=rq,
                            purchase_date=current_date,
                            expiry_date=exp,
                            purchase_cost=Decimal(str(pd["buy"] * rq)),
                            status='ACTIVE',
                        ))

                current_date += timedelta(days=1)

            # Bulk insert transaksi & items (Chunk size 500)
            CHUNK = 500
            for i in range(0, len(tx_buffer), CHUNK):
                chunk = tx_buffer[i:i + CHUNK]
                tx_objs = [t[0] for t in chunk]
                Transaction.objects.bulk_create(tx_objs)

                item_objs = []
                for tx_obj, items in chunk:
                    for it in items:
                        item_objs.append(TransactionItem(
                            transaction=tx_obj,
                            product=it["product"],
                            quantity=it["qty"],
                            price_per_unit=it["price"],
                            subtotal=it["sub"],
                            cost_per_unit=it["cost"],
                            created_at=tx_obj.transaction_date,
                        ))
                TransactionItem.objects.bulk_create(item_objs)

            if batch_buffer:
                ProductBatch.objects.bulk_create(batch_buffer, batch_size=500)

            # 7. Stock Opname Sample (Agar Halaman Stock Opname Terisi Data Valid)
            first_batch = ProductBatch.objects.filter(business=biz).first()
            if first_batch:
                so = StockOpname.objects.create(
                    business=biz,
                    document_number=f"SO-{biz.business_code}-{today.strftime('%Y%m01')}",
                    created_by=f"Admin {cfg['name']}",
                    approved_by=f"Admin {cfg['name']}",
                    status='APPROVED',
                    notes=f"Audit stok fisik bulanan {today.strftime('%B %Y')}",
                )
                StockOpnameItem.objects.create(
                    opname=so,
                    batch=first_batch,
                    system_qty=first_batch.quantity,
                    actual_qty=first_batch.quantity,
                    difference=0,
                )
                self.stdout.write("  Stock Opname    : Sample dokumen SO terbuat -> TERISI")

            self.stdout.write(f"  [SUCCESS] {biz.business_name}: {tx_counter} Transaksi, {batch_counter} Batches Generated.")

        # ---------------------------------------------------------------------
        # STEP 5: FINAL SUMMARY REPORT
        # ---------------------------------------------------------------------
        self.stdout.write("\n" + "=" * 75)
        self.stdout.write(f"RINGKASAN DATABASE HASIL GENERASI DATA 1 TAHUN ({start_date} s.d. {today}):")
        self.stdout.write("=" * 75)
        from django.db.models import Sum
        self.stdout.write(f"Total UMKM Bisnis  : {Business.objects.count()}")
        self.stdout.write(f"Total User Bisnis  : {BusinessUser.objects.count()}")
        self.stdout.write(f"Total Produk       : {Product.objects.count()}")
        self.stdout.write(f"Total DiscountRule : {DiscountRule.objects.count()}")
        self.stdout.write(f"Total Batch Stok   : {ProductBatch.objects.count()}")
        self.stdout.write(f"Total Transaksi    : {Transaction.objects.count()}")
        self.stdout.write(f"Total Item TX      : {TransactionItem.objects.count()}")
        self.stdout.write(f"Total PaymentMethod: {PaymentMethod.objects.count()}")
        self.stdout.write(f"Total Stock Opname : {StockOpname.objects.count()}")

        self.stdout.write("\n" + "-" * 75)
        self.stdout.write("DETAIL AKSES & KREDENSIAL 3 UMKM:")
        self.stdout.write("-" * 75)
        self.stdout.write("Superuser Admin  : techdev / dev123456 (Akses Semua Bisnis)")

        for cfg in BUSINESS_CONFIGS:
            b = Business.objects.filter(business_code=cfg["code"]).first()
            if b:
                tc = Transaction.objects.filter(business=b).count()
                rev = Transaction.objects.filter(business=b, status='COMPLETED').aggregate(t=Sum('total_amount'))['t'] or 0
                self.stdout.write(f"\n* [{cfg['mode']}] {b.business_name} ({b.business_code}):")
                self.stdout.write(f"    Total Transaksi (1 Tahun) : {tc:,} tx")
                self.stdout.write(f"    Total Omset Penjualan     : Rp {rev:,.0f}")
                self.stdout.write(f"    Kode Owner               : {cfg['owner_code']}")
                self.stdout.write(f"    Admin User               : {cfg['admin_username']} / admin123")
                self.stdout.write(f"    Kasir User               : {cfg['kasir_username']} / kasir123")

        self.stdout.write("\nSELESAI 100%! Seluruh data 1 tahun dinamis terisi sempurna.")
