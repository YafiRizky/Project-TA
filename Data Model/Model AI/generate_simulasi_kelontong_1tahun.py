"""
=================================================================================
SCRIPT GENERASI DATA SIMULASI TOKO KELONTONG (1 TAHUN / 12 BULAN HISTORIS)
=================================================================================
File Location: TA/Data Model/Model AI/generate_simulasi_kelontong_1tahun.py
Target: 
  1. Langsung mengisi ke Database PostgreSQL Django (Project POS ML System).
  2. Ekspor CSV Data Simulasi ke folder 'data_simulasi_kelontong_1tahun'.

Profil Usaha:
  Nama Usaha    : Toko Kelontong Berkah Utama
  Jenis Usaha   : Warung Kelontong / Retail
  Lokasi        : Semarang, Jawa Tengah
  Periode Data  : 1 Agustus 2025 s.d. 1 Agustus 2026 (12 Bulan / 365 Hari)
  Kredensial    :
    - Kode Bisnis : KLN789
    - Kode Owner  : KLN123
    - Admin User  : admin_kelontong / admin123
    - Kasir User  : kasir_kelontong / kasir123
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
print(" GENERASI DATA SIMULASI TOKO KELONTONG (1 TAHUN HISTORIS)")
print("=" * 80)

# Output directory for CSV exports
EXPORT_DIR = os.path.join(os.path.dirname(__file__), 'data_simulasi_kelontong_1tahun')
os.makedirs(EXPORT_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# 1. SETUP BISNIS & PENGGUNA
# -----------------------------------------------------------------------------
biz_code = 'KLN789'
owner_code = 'KLN123'

# Hapus bisnis lama jika ada (agar clean & idempotent)
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

# Buat Business Baru
biz = Business.objects.create(
    business_code=biz_code,
    business_name="Toko Kelontong Berkah Utama",
    business_type="Warung Kelontong",
    phone="+6281298765432",
    address="Jl. Pemuda No. 108, Sekayu",
    country="Indonesia",
    province="Jawa Tengah",
    city="Kota Semarang",
    district="Semarang Tengah",
    postal_code="50132",
    is_active=True
)
print(f"[CREATED] Bisnis: {biz.business_name} (Kode Bisnis: {biz.business_code})")

# Buat Admin User
admin_user, _ = BusinessUser.objects.get_or_create(
    username="admin_kelontong",
    defaults={
        "role": "admin",
        "full_name": "Ibu Hj. Maryam (Owner)",
        "owner_code": owner_code,
        "is_active": True
    }
)
admin_user.set_password("admin123")
admin_user.owner_code = owner_code
admin_user.save()
admin_user.owned_businesses.add(biz)
print(f"[CREATED] Admin: admin_kelontong (Kode Owner: {owner_code} | Pass: admin123)")

# Buat Kasir User
kasir_user = BusinessUser.objects.create(
    business=biz,
    username="kasir_kelontong",
    role="kasir",
    full_name="Siti Rahma (Kasir)",
    is_active=True
)
kasir_user.set_password("kasir123")
kasir_user.save()
print(f"[CREATED] Kasir: kasir_kelontong (Pass: kasir123)")

# Hubungkan Superuser / techdev (jika ada)
techdev = User.objects.filter(is_staff=True).first()
if techdev and hasattr(techdev, 'owned_businesses'):
    techdev.owned_businesses.add(biz)

# -----------------------------------------------------------------------------
# 2. SETUP KATEGORI & SUPPLIER
# -----------------------------------------------------------------------------
categories_data = [
    {"code": "SEMBAKO", "name": "Sembako"},
    {"code": "MIE", "name": "Mie Instan"},
    {"code": "MINUMAN", "name": "Minuman"},
    {"code": "ROKOK", "name": "Rokok"},
    {"code": "SNACK", "name": "Snack & Makanan Ringan"},
    {"code": "BUMBU", "name": "Bumbu Dapur"},
    {"code": "KERT", "name": "Kebutuhan Rumah Tangga"},
    {"code": "PERAWATAN", "name": "Perawatan Diri"},
    {"code": "ROTI", "name": "Roti & Dairi"},
    {"code": "GAS", "name": "Gas & Energi"},
]

cat_map = {}
for c in categories_data:
    cat_obj = Category.objects.create(
        business=biz,
        code=c["code"],
        name=c["name"]
    )
    cat_map[c["name"]] = cat_obj

sup_grosir = Supplier.objects.create(
    business=biz,
    code="SUP-GROSIR",
    name="Indogrosir Semarang",
    contact_person="Bapak Hery",
    phone="024-7612345",
    address="Jl. Kaligawe Raya No. 12, Semarang"
)

sup_agen = Supplier.objects.create(
    business=biz,
    code="SUP-AGEN",
    name="Agen Sembako Maju Jaya",
    contact_person="Ibu Dewi",
    phone="024-8854321",
    address="Jl. Mataram No. 45, Semarang"
)

# -----------------------------------------------------------------------------
# 3. KATALOG PRODUK REALISTIS (25 SKUs)
# -----------------------------------------------------------------------------
products_data = [
    # [Code, Name, Category, BuyPrice, SellPrice, Unit, MinStock, AvgDailySales, ExpiryDays]
    # Sembako (Fast Moving)
    ["BRS01", "Beras Premium C4 5kg", "Sembako", 62000, 68000, "karung", 5, 2.5, 180],
    ["BRS02", "Beras Medium IR64 5kg", "Sembako", 54000, 60000, "karung", 8, 3.5, 180],
    ["GLA01", "Gula Pasir Gulaku 1kg", "Sembako", 14000, 16000, "kg", 10, 5.0, None],
    ["MYK01", "Minyak Goreng Bimoli 1L", "Sembako", 16500, 18500, "botol", 8, 4.0, 365],
    ["MYK02", "Minyak Goreng Kita 1L", "Sembako", 13500, 15000, "pouch", 10, 4.5, 365],
    ["TLR01", "Telur Ayam Ras 1kg", "Sembako", 26000, 29000, "kg", 5, 3.0, 14],
    ["TPG01", "Tepung Segitiga Biru 1kg", "Sembako", 10500, 12500, "kg", 5, 1.8, 365],
    
    # Mie Instan (Very Fast Moving)
    ["MIE01", "Indomie Goreng Spesial 85g", "Mie Instan", 2600, 3100, "pcs", 30, 15.0, 240],
    ["MIE02", "Indomie Kuah Soto Ayam", "Mie Instan", 2500, 3000, "pcs", 25, 10.0, 240],
    ["MIE03", "Mie Sedaap Goreng", "Mie Instan", 2500, 3000, "pcs", 20, 8.0, 240],
    
    # Minuman
    ["MNM01", "Aqua Air Mineral 600ml", "Minuman", 3000, 4000, "botol", 24, 12.0, 365],
    ["MNM02", "Teh Pucuk Harum 350ml", "Minuman", 3100, 4000, "botol", 15, 7.0, 180],
    ["MNM03", "Kopi Kapal Api Mix Sachet", "Minuman", 1200, 1500, "pcs", 30, 10.0, 365],
    ["MNM04", "Le Minerale 600ml", "Minuman", 3000, 4000, "botol", 15, 6.0, 365],
    
    # Rokok
    ["RKK01", "Rokok Sampoerna A Mild 16", "Rokok", 31500, 34500, "pack", 10, 8.0, None],
    ["RKK02", "Rokok Gudang Garam Filter 12", "Rokok", 23000, 25500, "pack", 10, 6.0, None],
    
    # Snack
    ["SNK01", "Chitato Sapi Panggang 68g", "Snack & Makanan Ringan", 6800, 8500, "pcs", 8, 3.0, 120],
    ["SNK02", "Oreo Chocolate Cream 133g", "Snack & Makanan Ringan", 7500, 9500, "pcs", 6, 2.0, 180],
    ["SNK03", "Wafer Tango Cokelat 110g", "Snack & Makanan Ringan", 5200, 7000, "pcs", 8, 2.5, 180],
    
    # Bumbu & Kebutuhan RT
    ["BMB01", "Masako Rasa Ayam 100g", "Bumbu Dapur", 4500, 5500, "pack", 10, 4.0, 365],
    ["KRT01", "Rinso Anti Noda 770g", "Kebutuhan Rumah Tangga", 16500, 19000, "pouch", 5, 2.0, None],
    ["KRT02", "Sunlight Pencuci Piring 650ml", "Kebutuhan Rumah Tangga", 12000, 14000, "pouch", 6, 2.5, None],
    
    # Roti & Expiry Risk Items (Perishable)
    ["ROTI01", "Roti Tawar Kupas Sari Roti", "Roti & Dairi", 13000, 16000, "pcs", 4, 2.0, 5],
    ["ROTI02", "Susu UHT Ultramilk 250ml", "Roti & Dairi", 5500, 7000, "pcs", 10, 3.5, 30],
    ["GAS01", "Gas LPG 3kg (Melon)", "Gas & Energi", 18500, 21000, "tabung", 4, 1.5, None],
]

prod_map = {}
for p in products_data:
    code, name, cat_name, buy, sell, unit, min_stk, avg_daily, exp_days = p
    prod_obj = Product.objects.create(
        business=biz,
        category=cat_map[cat_name],
        supplier=sup_grosir if cat_name in ["Sembako", "Mie Instan", "Rokok"] else sup_agen,
        code=code,
        barcode=f"899{random.randint(100000000, 999999999)}",
        name=name,
        purchase_price=Decimal(str(buy)),
        selling_price=Decimal(str(sell)),
        unit=unit,
        min_stock=min_stk,
        is_active=True
    )
    prod_map[code] = {
        "obj": prod_obj,
        "buy": buy,
        "sell": sell,
        "avg_daily": avg_daily,
        "exp_days": exp_days
    }

print(f"[CREATED] {len(prod_map)} produk katalog kelontong berhasil dibuat.")

# -----------------------------------------------------------------------------
# 4. SIMULASI HISTORIS 1 TAHUN (1 AGUSTUS 2025 S/D 1 AGUSTUS 2026)
# -----------------------------------------------------------------------------
end_date = date(2026, 8, 1)
start_date = date(2025, 8, 1)
total_days = (end_date - start_date).days

print(f"[SIMULATION] Memulai simulasi transaksi selama {total_days} hari ({start_date} s/d {end_date})...")

# Event Helper Functions
def is_ramadan(d):
    # Ramadan 2026: 18 Februari - 19 Maret 2026
    return date(2026, 2, 18) <= d <= date(2026, 3, 19)

def is_payday(d):
    # Tanggal gajian: 25 s.d. 5
    return d.day >= 25 or d.day <= 5

def is_holiday(d):
    holidays = [(1, 1), (5, 1), (8, 17), (12, 25)]
    return (d.month, d.day) in holidays

# Step A: Buat Stok Awal (Initial Batch)
for code, pdata in prod_map.items():
    init_qty = int(pdata["avg_daily"] * 30)  # 30 hari pasokan awal
    exp_date = start_date + timedelta(days=pdata["exp_days"]) if pdata["exp_days"] else None
    
    ProductBatch.objects.create(
        business=biz,
        product=pdata["obj"],
        batch_code=f"INIT-{code}",
        quantity=init_qty,
        purchase_date=start_date,
        expiry_date=exp_date,
        purchase_cost=Decimal(str(pdata["buy"] * init_qty)),
        status='ACTIVE'
    )

current_date = start_date
tx_counter = 0
batch_counter = 0

transactions_csv_rows = []
items_csv_rows = []
batches_csv_rows = []
products_csv_rows = []

# Collect products CSV
for code, pdata in prod_map.items():
    p = pdata["obj"]
    products_csv_rows.append({
        "product_id": p.id,
        "code": p.code,
        "name": p.name,
        "category": p.category.name,
        "purchase_price": p.purchase_price,
        "selling_price": p.selling_price,
        "unit": p.unit,
        "min_stock": p.min_stock
    })

while current_date <= end_date:
    day_dow = current_date.weekday()
    
    # Rata-rata 12 - 22 transaksi per hari
    daily_tx_count = random.randint(12, 22)
    
    # Multipliers
    if day_dow >= 5: # Weekend
        daily_tx_count = int(daily_tx_count * 1.3)
    if is_payday(current_date):
        daily_tx_count = int(daily_tx_count * 1.25)
    if is_ramadan(current_date):
        daily_tx_count = int(daily_tx_count * 1.45)
    if is_holiday(current_date):
        daily_tx_count = max(5, int(daily_tx_count * 0.6))
        
    for _ in range(daily_tx_count):
        # Time distribution (07:00 - 21:30 WIB)
        hour = random.choices(
            [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
            weights=[5, 6, 8, 7, 6, 7, 5, 5, 6, 8, 12, 10, 8, 4, 3] # Puncak jam 17-18
        )[0]
        minute = random.randint(0, 59)
        sec = random.randint(0, 59)
        
        tx_time = timezone.make_aware(
            datetime(current_date.year, current_date.month, current_date.day, hour, minute, sec)
        )
        
        tx_counter += 1
        tx_code = f"TRX-KLN-{current_date.strftime('%Y%m%d')}-{tx_counter:05d}"
        
        # 1-4 produk per transaksi
        item_count = random.choices([1, 2, 3, 4], weights=[45, 35, 15, 5])[0]
        selected_codes = random.sample(list(prod_map.keys()), item_count)
        
        total_amount = Decimal('0.00')
        line_items = []
        
        for code in selected_codes:
            pdata = prod_map[code]
            # Quantity purchased per item
            if pdata["avg_daily"] >= 10:
                qty = random.randint(1, 4)
            elif pdata["avg_daily"] >= 4:
                qty = random.randint(1, 3)
            else:
                qty = random.randint(1, 2)
                
            subtotal = Decimal(str(pdata["sell"])) * qty
            total_amount += subtotal
            
            line_items.append({
                "product": pdata["obj"],
                "code": code,
                "name": pdata["obj"].name,
                "qty": qty,
                "price": Decimal(str(pdata["sell"])),
                "buy": Decimal(str(pdata["buy"])),
                "subtotal": subtotal
            })
            
        pay_method = random.choices(
            ['CASH', 'QRIS', 'TRANSFER', 'EWALLET'],
            weights=[65, 20, 8, 7]
        )[0]
        
        amount_paid = total_amount if pay_method != 'CASH' else (
            total_amount + Decimal(str(random.choice([0, 500, 1000, 2000, 5000, 10000])))
        )
        change_amt = max(Decimal('0.00'), amount_paid - total_amount)
        
        # Save Transaction
        tx_obj = Transaction.objects.create(
            business=biz,
            transaction_code=tx_code,
            total_amount=total_amount,
            discount_amount=Decimal('0.00'),
            payment_method=pay_method,
            amount_paid=amount_paid,
            change_amount=change_amt,
            status='COMPLETED',
            cashier_name="Siti Rahma",
            transaction_date=tx_time,
            created_at=tx_time
        )
        
        transactions_csv_rows.append({
            "transaction_code": tx_code,
            "date": tx_time.strftime('%Y-%m-%d %H:%M:%S'),
            "total_amount": float(total_amount),
            "payment_method": pay_method,
            "status": "COMPLETED"
        })
        
        # Save Transaction Items
        for item in line_items:
            ti = TransactionItem.objects.create(
                transaction=tx_obj,
                product=item["product"],
                quantity=item["qty"],
                price_per_unit=item["price"],
                subtotal=item["subtotal"],
                cost_per_unit=item["buy"],
                created_at=tx_time
            )
            items_csv_rows.append({
                "transaction_code": tx_code,
                "product_code": item["code"],
                "product_name": item["name"],
                "quantity": item["qty"],
                "price_per_unit": float(item["price"]),
                "cost_per_unit": float(item["buy"]),
                "subtotal": float(item["subtotal"]),
                "date": tx_time.strftime('%Y-%m-%d')
            })

    # Periodic Restock Batches (Setiap 7 hari)
    if current_date.day % 7 == 0:
        for code, pdata in prod_map.items():
            restock_qty = int(pdata["avg_daily"] * random.uniform(8, 14))
            if restock_qty > 0:
                batch_counter += 1
                exp_date = current_date + timedelta(days=pdata["exp_days"]) if pdata["exp_days"] else None
                
                b_obj = ProductBatch.objects.create(
                    business=biz,
                    product=pdata["obj"],
                    batch_code=f"B-{code}-{batch_counter:04d}",
                    quantity=restock_qty,
                    purchase_date=current_date,
                    expiry_date=exp_date,
                    purchase_cost=Decimal(str(pdata["buy"] * restock_qty)),
                    status='ACTIVE'
                )
                batches_csv_rows.append({
                    "batch_code": b_obj.batch_code,
                    "product_code": code,
                    "quantity": restock_qty,
                    "purchase_date": current_date.strftime('%Y-%m-%d'),
                    "expiry_date": exp_date.strftime('%Y-%m-%d') if exp_date else "",
                    "purchase_cost": float(b_obj.purchase_cost),
                    "status": "ACTIVE"
                })

    current_date += timedelta(days=1)

print(f"[SUCCESS] Total Transaksi Dihasilkan: {tx_counter:,} transaksi")
print(f"[SUCCESS] Total Item Transaksi     : {len(items_csv_rows):,} item")
print(f"[SUCCESS] Total Batch Stok         : {batch_counter:,} batch")

# -----------------------------------------------------------------------------
# 5. EKSPOR KE FILE CSV DI FOLDER Data Model/Model AI/data_simulasi_kelontong_1tahun/
# -----------------------------------------------------------------------------
print(f"\n[EXPORT] Mengespor data simulasi ke CSV di folder {EXPORT_DIR}...")

# Export Products CSV
with open(os.path.join(EXPORT_DIR, 'products.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=["product_id", "code", "name", "category", "purchase_price", "selling_price", "unit", "min_stock"])
    writer.writeheader()
    writer.writerows(products_csv_rows)

# Export Batches CSV
with open(os.path.join(EXPORT_DIR, 'batches.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=["batch_code", "product_code", "quantity", "purchase_date", "expiry_date", "purchase_cost", "status"])
    writer.writeheader()
    writer.writerows(batches_csv_rows)

# Export Transactions CSV
with open(os.path.join(EXPORT_DIR, 'transactions.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=["transaction_code", "date", "total_amount", "payment_method", "status"])
    writer.writeheader()
    writer.writerows(transactions_csv_rows)

# Export Transaction Items CSV
with open(os.path.join(EXPORT_DIR, 'transaction_items.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=["transaction_code", "product_code", "product_name", "quantity", "price_per_unit", "cost_per_unit", "subtotal", "date"])
    writer.writeheader()
    writer.writerows(items_csv_rows)

# Summary JSON
total_rev = sum(r["total_amount"] for r in transactions_csv_rows)
summary_info = {
    "business_name": biz.business_name,
    "business_code": biz.business_code,
    "owner_code": owner_code,
    "admin_username": "admin_kelontong",
    "kasir_username": "kasir_kelontong",
    "start_date": start_date.strftime('%Y-%m-%d'),
    "end_date": end_date.strftime('%Y-%m-%d'),
    "total_days": total_days,
    "total_products": len(products_data),
    "total_transactions": tx_counter,
    "total_transaction_items": len(items_csv_rows),
    "total_batches": batch_counter,
    "total_revenue": total_rev,
    "avg_daily_revenue": round(total_rev / total_days, 2)
}

with open(os.path.join(EXPORT_DIR, 'summary.json'), 'w', encoding='utf-8') as f:
    json.dump(summary_info, f, indent=2)

print("\n" + "=" * 80)
print(" RINGKASAN DATA SIMULASI (1 TAHUN TOKO KELONTONG):")
print("=" * 80)
for k, v in summary_info.items():
    if "revenue" in k:
        print(f"  {k:<25}: Rp {v:,.2f}")
    else:
        print(f"  {k:<25}: {v}")

print("\n[DONE] Data siap dipakai di live website POS & analisis ML Notebook!")
print("=" * 80)
