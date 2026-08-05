"""
=================================================================
SCRIPT: Generate Synthetic Data untuk ML Training (V2 - Realistic)
=================================================================
Tanggal: 13 Juli 2026
Tujuan:  Data sintetis REALISTIS untuk warung kelontong kecil.
         Jumlah data sedikit (~300-500 transaksi) tapi berkualitas.

Skenario:
  Owner A (admin1/Yafi)
    +-- Bisnis 1: Warung Yafi (1 toko, 3 bulan data)
        - 15 produk warung kelontong umum
        - 5-8 transaksi/hari (realistis warung kecil)
        - Stok kecil (realistis: 15-40 unit fast-moving)
        - Pola: weekend ramai, gajian naik, Ramadhan naik

Cara Pakai:
  cd c:\\laragon\\www\\TA\\pos-backend
  c:\\laragon\\www\\TA\\.venv\\Scripts\\python.exe generate_synthetic_data.py

PERINGATAN: Jalankan setelah `flush` database.
=================================================================
"""
import os
import sys
import django
import random
from datetime import datetime, timedelta, date, time
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.utils import timezone
from django.utils.timezone import make_aware
from django.db import models as django_models
from businesses.models import Business
from accounts.models import BusinessUser
from products.models import Product, Category, Supplier
from inventory.models import ProductBatch, InventoryMovement
from transactions.models import Transaction, TransactionItem

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def gen_code(prefix, length=5):
    import string
    chars = string.ascii_uppercase + string.digits
    return f"{prefix}-{''.join(random.choice(chars) for _ in range(length))}"

def make_aware_dt(year, month, day, hour=12, minute=0):
    dt = datetime(year, month, day, hour, minute)
    return make_aware(dt)

def random_time_in_range(start_hour, end_hour):
    hour = random.randint(start_hour, end_hour - 1)
    minute = random.randint(0, 59)
    return hour, minute

_trx_counter = {}
def gen_trx_code(prefix_date):
    key = prefix_date
    _trx_counter[key] = _trx_counter.get(key, 0) + 1
    return f"STRX-{prefix_date}-{_trx_counter[key]:04d}"

# ============================================================
# PRODUCT CATALOG — 15 Produk Warung Kelontong Umum
# ============================================================

CATEGORIES = [
    {'code': 'SEMBAKO', 'name': 'Sembako'},
    {'code': 'MIE', 'name': 'Mie Instan'},
    {'code': 'MINUMAN', 'name': 'Minuman'},
    {'code': 'ROKOK', 'name': 'Rokok'},
    {'code': 'SNACK', 'name': 'Snack'},
]

SUPPLIERS = [
    {'code': 'SUP-GROSIR', 'name': 'Indogrosir Semarang', 'phone': '024-7612345', 'city': 'Semarang'},
    {'code': 'SUP-AGEN', 'name': 'Agen Sembako Jaya', 'phone': '024-8812345', 'city': 'Semarang'},
]

# (name, code, cat_code, sell, buy, unit, min_stock, speed, has_expiry, expiry_months)
# speed: 'fast'=sering dibeli, 'medium'=kadang, 'slow'=jarang
PRODUCTS = [
    # Sembako (5 produk)
    ('Beras 5kg', 'BRS5', 'SEMBAKO', 65000, 58000, 'SAK', 5, 'fast', False, 0),
    ('Minyak Goreng 1L', 'MYK1L', 'SEMBAKO', 18000, 15000, 'BTL', 5, 'fast', True, 12),
    ('Gula Pasir 1kg', 'GLA1', 'SEMBAKO', 16000, 13500, 'KG', 5, 'fast', False, 0),
    ('Telur 1kg', 'TLR1', 'SEMBAKO', 28000, 25000, 'KG', 3, 'fast', True, 1),
    ('Tepung Terigu 1kg', 'TPG1', 'SEMBAKO', 12000, 10000, 'KG', 3, 'medium', True, 12),
    # Mie Instan (2 produk)
    ('Indomie Goreng', 'INDGOR', 'MIE', 3500, 2800, 'PCS', 20, 'fast', True, 8),
    ('Mie Sedaap Goreng', 'SDPGOR', 'MIE', 3500, 2800, 'PCS', 10, 'medium', True, 8),
    # Minuman (3 produk)
    ('Aqua 600ml', 'AQA6', 'MINUMAN', 4000, 2800, 'BTL', 12, 'fast', True, 12),
    ('Teh Pucuk 350ml', 'TPK35', 'MINUMAN', 4000, 3000, 'BTL', 12, 'fast', True, 6),
    ('Kopi Kapal Api Sachet', 'KKA', 'MINUMAN', 2000, 1500, 'PCS', 10, 'medium', True, 12),
    # Rokok (2 produk)
    ('Gudang Garam Filter', 'GGF', 'ROKOK', 28000, 25500, 'PAK', 5, 'fast', False, 0),
    ('Surya 12', 'SRY12', 'ROKOK', 22000, 20000, 'PAK', 5, 'medium', False, 0),
    # Snack (3 produk)
    ('Chitato 68g', 'CHT68', 'SNACK', 10000, 7500, 'PCS', 5, 'slow', True, 6),
    ('Taro Net 36g', 'TRN36', 'SNACK', 3000, 2200, 'PCS', 8, 'slow', True, 6),
    ('Sabun Lifebuoy', 'SLBY', 'SNACK', 3500, 2800, 'PCS', 5, 'slow', True, 24),
]


# ============================================================
# MAIN GENERATION LOGIC
# ============================================================

def setup_master_data(business):
    """Create categories, suppliers, and products for a business."""
    print(f"  -> Setting up master data for: {business.business_name}")

    # Categories
    cat_map = {}
    for c in CATEGORIES:
        cat, created = Category.objects.get_or_create(
            business=business, code=c['code'],
            defaults={'name': c['name']}
        )
        cat_map[c['code']] = cat
        if created:
            print(f"    + Category: {c['name']}")

    # Suppliers
    sup_list = []
    for s in SUPPLIERS:
        sup, created = Supplier.objects.get_or_create(
            business=business, code=s['code'],
            defaults={'name': s['name'], 'phone': s.get('phone', ''), 'city': s.get('city', '')}
        )
        sup_list.append(sup)
        if created:
            print(f"    + Supplier: {s['name']}")

    # Products
    prod_map = {}
    for p in PRODUCTS:
        name, code, cat_code, sell, buy, unit, min_stock, speed, has_expiry, expiry_months = p
        prod, created = Product.objects.get_or_create(
            business=business, code=code,
            defaults={
                'name': name,
                'category': cat_map[cat_code],
                'supplier': random.choice(sup_list),
                'selling_price': Decimal(str(sell)),
                'purchase_price': Decimal(str(buy)),
                'unit': unit,
                'min_stock': min_stock,
            }
        )
        prod_map[code] = {
            'obj': prod,
            'speed': speed,
            'has_expiry': has_expiry,
            'expiry_months': expiry_months,
            'sell': Decimal(str(sell)),
            'buy': Decimal(str(buy)),
        }
        if created:
            print(f"    + Product: {name} (sell={sell}, buy={buy})")

    return prod_map


def generate_batches(business, prod_map, start_date, end_date):
    """Generate restock batches with REALISTIC quantities."""
    print(f"  -> Generating batches from {start_date} to {end_date}...")

    batch_count = 0
    current = start_date

    while current <= end_date:
        for code, pdata in prod_map.items():
            speed = pdata['speed']

            # Restock frequency (warung kecil beli stok tiap berapa hari)
            if speed == 'fast':
                restock_interval = random.randint(5, 10)     # 5-10 hari
            elif speed == 'medium':
                restock_interval = random.randint(10, 18)    # 10-18 hari
            else:
                restock_interval = random.randint(18, 30)    # 18-30 hari

            day_of_period = (current - start_date).days
            if day_of_period % restock_interval != 0:
                continue

            # REALISTIC batch quantities for warung kecil
            if speed == 'fast':
                qty = random.randint(15, 40)     # 15-40 unit (2-4 minggu stok)
            elif speed == 'medium':
                qty = random.randint(8, 20)      # 8-20 unit (1-2 minggu stok)
            else:
                qty = random.randint(3, 8)       # 3-8 unit (slow mover)

            # Expiry date
            exp_date = None
            if pdata['has_expiry']:
                exp_months = pdata['expiry_months']
                exp_date = current + timedelta(days=exp_months * 30)

            batch_code = f"BTH-{current.strftime('%y%m%d')}-{code}-{random.randint(100,999)}"

            if ProductBatch.objects.filter(business=business, batch_code=batch_code).exists():
                continue

            ProductBatch.objects.create(
                business=business,
                product=pdata['obj'],
                batch_code=batch_code,
                quantity=qty,
                purchase_date=current,
                expiry_date=exp_date,
                purchase_cost=pdata['buy'],
                status='ACTIVE',
                created_at=make_aware_dt(current.year, current.month, current.day, 8, 0),
            )
            batch_count += 1

        current += timedelta(days=1)

    print(f"    Created {batch_count} batches")
    return batch_count


def get_daily_volume(base_volume, current_date):
    """Calculate adjusted transaction volume for a given date."""
    volume = base_volume

    # Day of week: Sat-Sun = +30%, Mon-Tue = -20%
    dow = current_date.weekday()
    if dow >= 5:
        volume *= 1.3
    elif dow <= 1:
        volume *= 0.8

    # Gajian effect: tanggal 25-5 = +40%
    dom = current_date.day
    if dom >= 25 or dom <= 5:
        volume *= 1.4
    elif 10 <= dom <= 20:
        volume *= 0.85

    # Seasonal: Ramadhan (simplified as March-April)
    month = current_date.month
    if month in (3, 4):
        volume *= 1.5
    elif month == 12:
        volume *= 1.3

    return max(2, int(volume + random.randint(-2, 2)))


def pick_products(prod_map, num_items=None):
    """Pick random products based on speed weights."""
    if num_items is None:
        num_items = random.choices([1, 2, 3, 4], weights=[20, 40, 30, 10])[0]

    speed_weights = {'fast': 70, 'medium': 35, 'slow': 12}
    weighted = [(code, speed_weights[pdata['speed']]) for code, pdata in prod_map.items()]

    selected = set()
    attempts = 0
    while len(selected) < num_items and attempts < 50:
        codes = [c for c, _ in weighted]
        weights = [w for _, w in weighted]
        choice = random.choices(codes, weights=weights, k=1)[0]
        selected.add(choice)
        attempts += 1

    return list(selected)


def generate_transactions(business, prod_map, start_date, end_date, base_volume, cashier_names):
    """Generate transactions with FIFO batch allocation."""
    print(f"  -> Generating transactions from {start_date} to {end_date} (base vol: {base_volume}/day)...")

    trx_count = 0
    item_count = 0
    current = start_date

    # Warung time slots: pagi ramai, siang sepi, sore ramai
    time_slots = [(6, 9, 35), (9, 12, 15), (12, 14, 10), (14, 17, 15), (17, 21, 25)]

    while current <= end_date:
        daily_vol = get_daily_volume(base_volume, current)
        date_str = current.strftime('%y%m%d')

        for trx_idx in range(daily_vol):
            # Pick time slot
            slot_weights = [w for _, _, w in time_slots]
            slot = random.choices(time_slots, weights=slot_weights, k=1)[0]
            hour, minute = random_time_in_range(slot[0], slot[1])

            # Pick products
            selected_codes = pick_products(prod_map)

            trx_code = gen_trx_code(date_str)
            trx_dt = make_aware_dt(current.year, current.month, current.day, hour, minute)
            cashier = random.choice(cashier_names)

            total_amount = Decimal('0.00')
            trx_items = []

            for prod_code in selected_codes:
                pdata = prod_map[prod_code]
                product = pdata['obj']

                # Get available batches (FIFO)
                batches = list(ProductBatch.objects.filter(
                    business=business,
                    product=product,
                    status='ACTIVE',
                    quantity__gt=0,
                ).filter(
                    django_models.Q(expiry_date__isnull=True) | django_models.Q(expiry_date__gt=current)
                ).order_by('purchase_date'))

                if not batches:
                    continue

                total_available = sum(b.quantity for b in batches)
                if total_available <= 0:
                    continue

                # Quantity: 1-3 for warung kecil (customer beli sedikit)
                qty = random.choices([1, 2, 3], weights=[50, 35, 15])[0]
                qty = min(qty, total_available)

                sell_price = pdata['sell']
                subtotal = sell_price * qty

                # FIFO allocation
                remaining = qty
                for batch in batches:
                    if remaining <= 0:
                        break
                    take = min(batch.quantity, remaining)

                    trx_items.append({
                        'product': product,
                        'batch': batch,
                        'quantity': take,
                        'price_per_unit': sell_price,
                        'subtotal': sell_price * take,
                        'cost_per_unit': batch.purchase_cost,
                    })

                    batch.quantity -= take
                    if batch.quantity <= 0:
                        batch.status = 'DEPLETED'
                    batch.save()

                    remaining -= take

                total_amount += subtotal

            if not trx_items:
                continue

            # Small random discount (8% chance)
            discount = Decimal('0.00')
            if random.random() < 0.08:
                discount = Decimal(str(random.choice([500, 1000, 2000])))
                if discount >= total_amount:
                    discount = Decimal('0.00')

            final_total = total_amount - discount

            # Payment method (warung kecil: cash dominan)
            payment_weights = {'CASH': 75, 'QRIS': 15, 'TRANSFER': 7, 'EWALLET': 3}
            payment = random.choices(
                list(payment_weights.keys()),
                weights=list(payment_weights.values()),
                k=1
            )[0]

            # Amount paid
            if payment == 'CASH':
                rounded = int(final_total)
                remainder = rounded % 1000
                if remainder > 0:
                    amount_paid = Decimal(str(rounded + (1000 - remainder)))
                else:
                    amount_paid = final_total
                if random.random() < 0.3:
                    bills = [10000, 20000, 50000, 100000]
                    for bill in bills:
                        if bill >= float(final_total):
                            amount_paid = Decimal(str(bill))
                            break
            else:
                amount_paid = final_total

            change = amount_paid - final_total

            # Create transaction
            trx = Transaction.objects.create(
                business=business,
                transaction_code=trx_code,
                total_amount=final_total,
                discount_amount=discount,
                payment_method=payment,
                amount_paid=amount_paid,
                change_amount=change,
                status='COMPLETED',
                cashier_name=cashier,
                transaction_date=trx_dt,
                created_at=trx_dt,
            )

            for ti in trx_items:
                TransactionItem.objects.create(
                    transaction=trx,
                    product=ti['product'],
                    batch=ti['batch'],
                    quantity=ti['quantity'],
                    price_per_unit=ti['price_per_unit'],
                    subtotal=ti['subtotal'],
                    cost_per_unit=ti['cost_per_unit'],
                    discount=Decimal('0.00'),
                    created_at=trx_dt,
                )
                item_count += 1

            trx_count += 1

        current += timedelta(days=1)

        # Progress
        days_done = (current - start_date).days
        total_days = (end_date - start_date).days + 1
        if days_done % 30 == 0:
            pct = int(days_done / total_days * 100)
            print(f"    ... {pct}% ({days_done}/{total_days} days, {trx_count} transactions)")

    print(f"    Created {trx_count} transactions, {item_count} items")
    return trx_count, item_count


# ============================================================
# MAIN EXECUTION
# ============================================================

def main():
    print("=" * 60)
    print("  SYNTHETIC DATA GENERATOR V2 - Realistic Warung")
    print("  Date: 13 Juli 2026")
    print("=" * 60)

    total_trx = 0
    total_items = 0
    total_batches = 0

    # ===========================================================
    # STEP 1: Create Owner (Admin)
    # ===========================================================
    print("\n[1/5] Creating owner admin1...")

    admin1, created = BusinessUser.objects.get_or_create(
        username='admin1',
        role='admin',
        defaults={
            'full_name': 'Yafi Rizky',
            'email': 'yafi@warung.com',
            'owner_code': BusinessUser.generate_owner_code(),
        }
    )
    if created:
        admin1.set_password('admin123')
        admin1.save()
        print(f"  Created admin: admin1 (owner_code: {admin1.owner_code}, password: admin123)")
    else:
        print(f"  Found admin: admin1 (owner_code: {admin1.owner_code})")

    # ===========================================================
    # STEP 2: Create Business
    # ===========================================================
    print("\n[2/5] Creating business...")

    biz, created = Business.objects.get_or_create(
        business_name="Warung Yafi",
        defaults={
            'business_type': 'Warung / Toko Kelontong',
            'phone': '0812-3456-7890',
            'province': 'Jawa Tengah',
            'city': 'Kota Semarang',
            'district': 'Tembalang',
            'address': 'Jl. Ngesrep Timur V No. 12',
        }
    )
    admin1.owned_businesses.add(biz)
    admin1.business = biz
    admin1.save()
    print(f"  Business: {biz.business_name} (code={biz.business_code})")

    # Create kasir
    kasir_names = ['Kasir Rina', 'Kasir Dewi']
    for kname in kasir_names:
        k, created_k = BusinessUser.objects.get_or_create(
            business=biz, username=kname, role='kasir',
            defaults={'full_name': kname}
        )
        if created_k:
            k.set_password('kasir123')
            k.save()
            print(f"  + Kasir: {kname}")

    # ===========================================================
    # STEP 3: Setup Master Data
    # ===========================================================
    print("\n[3/5] Setting up products & categories...")
    prod_map = setup_master_data(biz)

    # ===========================================================
    # STEP 4: Generate Batches (3 months: Apr-Jul 2026)
    # ===========================================================
    print("\n[4/5] Generating restock batches...")
    total_batches = generate_batches(biz, prod_map, date(2026, 4, 1), date(2026, 7, 12))

    # ===========================================================
    # STEP 5: Generate Transactions (3 months, ~6 trx/day)
    # ===========================================================
    print("\n[5/5] Generating transactions...")
    t, i = generate_transactions(
        biz, prod_map,
        date(2026, 4, 1), date(2026, 7, 12),
        base_volume=6,
        cashier_names=['Kasir Rina', 'Kasir Dewi', 'Yafi Rizky'],
    )
    total_trx += t
    total_items += i

    # ===========================================================
    # Summary
    # ===========================================================
    print("\n" + "=" * 60)
    print("  SYNTHETIC DATA GENERATION COMPLETE!")
    print("=" * 60)
    print(f"  Total Batches:      {total_batches:,}")
    print(f"  Total Transactions: {total_trx:,}")
    print(f"  Total Items:        {total_items:,}")
    print()
    print(f"  Business: {biz.business_name}")
    print(f"  Products: {Product.objects.filter(business=biz).count()}")
    print(f"  Active Batches: {ProductBatch.objects.filter(business=biz, status='ACTIVE').count()}")
    print(f"  Depleted Batches: {ProductBatch.objects.filter(business=biz, status='DEPLETED').count()}")
    print()
    print("  Login Credentials:")
    print(f"    Owner: owner_code={admin1.owner_code} | username=admin1 | password=admin123")
    print(f"    Kasir: business_code={biz.business_code} | username=Kasir Rina / Kasir Dewi | password=kasir123")
    print()
    print("  Next: Start backend -> python manage.py runserver 8000")
    print("=" * 60)


if __name__ == '__main__':
    main()
else:
    main()
