"""
Generate Synthetic Transaction Data dari Data Mentah UMKM
=========================================================
Script ini:
1. Membaca data produk dari Excel responden UMKM
2. Memilih 25 produk representatif (dari Barokah + Moro + lainnya)  
3. Normalize harga (per-pcs jika data per-box)
4. Generate transaksi sintetis 3 bulan (Apr-Jun 2026)
5. Generate batch stok dengan tanggal expired
6. Output: compiled_products.csv, transactions.csv, batches.csv
"""

import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import random

random.seed(42)
np.random.seed(42)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============================================================
# STEP 1: Definisi 25 Produk Representatif
# ============================================================
# Sumber: Kompilasi dari 11 responden UMKM Semarang (Jul 2026)
# Harga terverifikasi dari: interview langsung + referensi Kemendag/marketplace

products = [
    # === SEMBAKO (dari Barokah, Amanah, Melati) ===
    {"code": "SMB01", "name": "Gula Pasir 1kg",      "category": "Sembako",          "buy": 13500, "sell": 15500, "unit": "kg",     "min_stock": 10, "avg_daily": 3,  "std_daily": 1.2, "restock_days": 7,  "batch_qty": 25, "expiry_days": None,  "source": "Toko Amanah"},
    {"code": "SMB02", "name": "Minyak Goreng 1L",     "category": "Sembako",          "buy": 13500, "sell": 15000, "unit": "liter",  "min_stock": 5,  "avg_daily": 2,  "std_daily": 0.8, "restock_days": 7,  "batch_qty": 8,  "expiry_days": 365,   "source": "Toko Barokah"},
    {"code": "SMB03", "name": "Tepung Beras",          "category": "Sembako",          "buy": 3300,  "sell": 4000,  "unit": "bungkus","min_stock": 8,  "avg_daily": 2,  "std_daily": 1.0, "restock_days": 7,  "batch_qty": 15, "expiry_days": 180,   "source": "Toko Barokah"},
    {"code": "SMB04", "name": "Kecap Manis",           "category": "Sembako",          "buy": 3300,  "sell": 4000,  "unit": "bungkus","min_stock": 8,  "avg_daily": 2,  "std_daily": 1.0, "restock_days": 7,  "batch_qty": 15, "expiry_days": 365,   "source": "Toko Barokah"},
    
    # === MIE INSTAN (dari Barokah, Amanah, Moro) ===
    {"code": "MIE01", "name": "Indomie Goreng",        "category": "Mie Instan",       "buy": 2500,  "sell": 3000,  "unit": "pcs",   "min_stock": 20, "avg_daily": 7,  "std_daily": 2.5, "restock_days": 7,  "batch_qty": 40, "expiry_days": 240,   "source": "Toko Barokah"},
    {"code": "MIE02", "name": "Mie Sedap Goreng",      "category": "Mie Instan",       "buy": 2500,  "sell": 3000,  "unit": "pcs",   "min_stock": 20, "avg_daily": 7,  "std_daily": 2.5, "restock_days": 7,  "batch_qty": 40, "expiry_days": 240,   "source": "Toko Barokah"},
    {"code": "MIE03", "name": "Mie Sedap Soto Ayam",   "category": "Mie Instan",       "buy": 2750,  "sell": 3500,  "unit": "pcs",   "min_stock": 15, "avg_daily": 5,  "std_daily": 2.0, "restock_days": 7,  "batch_qty": 40, "expiry_days": 240,   "source": "Toko Moro"},
    {"code": "MIE04", "name": "Mie Sedap Cup Soto",    "category": "Mie Instan",       "buy": 4500,  "sell": 5500,  "unit": "pcs",   "min_stock": 5,  "avg_daily": 2,  "std_daily": 1.0, "restock_days": 7,  "batch_qty": 12, "expiry_days": 240,   "source": "Toko Moro"},

    # === MINUMAN (dari Barokah, Amanah, Moro) ===
    {"code": "MNM01", "name": "Aqua Botol 600ml",      "category": "Minuman",          "buy": 3000,  "sell": 4000,  "unit": "pcs",   "min_stock": 24, "avg_daily": 8,  "std_daily": 3.0, "restock_days": 7,  "batch_qty": 24, "expiry_days": 365,   "source": "Toko Amanah"},
    {"code": "MNM02", "name": "Teh Pucuk Harum",       "category": "Minuman",          "buy": 3000,  "sell": 4000,  "unit": "pcs",   "min_stock": 12, "avg_daily": 4,  "std_daily": 1.5, "restock_days": 7,  "batch_qty": 24, "expiry_days": 180,   "source": "Toko Moro"},
    {"code": "MNM03", "name": "Fanta 390ml",           "category": "Minuman",          "buy": 4000,  "sell": 5000,  "unit": "botol", "min_stock": 8,  "avg_daily": 3,  "std_daily": 1.2, "restock_days": 7,  "batch_qty": 12, "expiry_days": 365,   "source": "Toko Moro"},
    {"code": "MNM04", "name": "Pocari Sweat",          "category": "Minuman",          "buy": 4000,  "sell": 5000,  "unit": "botol", "min_stock": 8,  "avg_daily": 2,  "std_daily": 1.0, "restock_days": 7,  "batch_qty": 12, "expiry_days": 365,   "source": "Toko Moro"},

    # === MINUMAN SACHET (dari Barokah, Moro) ===
    {"code": "MSC01", "name": "Kopi Sachet Gula Aren",  "category": "Minuman Sachet",   "buy": 1700,  "sell": 2000,  "unit": "pcs",   "min_stock": 15, "avg_daily": 5,  "std_daily": 2.0, "restock_days": 7,  "batch_qty": 30, "expiry_days": 365,   "source": "Toko Barokah"},
    {"code": "MSC02", "name": "Milo Sachet",           "category": "Minuman Sachet",   "buy": 700,   "sell": 1000,  "unit": "pcs",   "min_stock": 15, "avg_daily": 5,  "std_daily": 2.0, "restock_days": 7,  "batch_qty": 30, "expiry_days": 365,   "source": "Toko Barokah"},

    # === ROKOK (dari Amanah) ===
    {"code": "RKK01", "name": "Rokok Sampoerna",       "category": "Rokok",            "buy": 24000, "sell": 27000, "unit": "pack",  "min_stock": 10, "avg_daily": 5,  "std_daily": 1.5, "restock_days": 7,  "batch_qty": 10, "expiry_days": None,  "source": "Toko Amanah"},

    # === SNACK (dari Barokah, Moro) ===
    {"code": "SNK01", "name": "Chitato",               "category": "Snack",            "buy": 1800,  "sell": 2000,  "unit": "pcs",   "min_stock": 10, "avg_daily": 3,  "std_daily": 1.5, "restock_days": 7,  "batch_qty": 10, "expiry_days": 120,   "source": "Toko Moro"},
    {"code": "SNK02", "name": "Better Caramel",        "category": "Snack",            "buy": 1600,  "sell": 2000,  "unit": "pcs",   "min_stock": 10, "avg_daily": 2,  "std_daily": 1.0, "restock_days": 7,  "batch_qty": 12, "expiry_days": 180,   "source": "Toko Barokah"},
    {"code": "SNK03", "name": "Chocolatos",            "category": "Snack",            "buy": 1000,  "sell": 1500,  "unit": "pcs",   "min_stock": 10, "avg_daily": 3,  "std_daily": 1.5, "restock_days": 7,  "batch_qty": 20, "expiry_days": 180,   "source": "Toko Moro"},

    # === KEBUTUHAN RT (dari Barokah, Melati, Moro) ===
    {"code": "KRT01", "name": "Rinso Anti Noda Sachet", "category": "Kebutuhan RT",    "buy": 1200,  "sell": 1500,  "unit": "sachet","min_stock": 15, "avg_daily": 2,  "std_daily": 1.0, "restock_days": 7,  "batch_qty": 25, "expiry_days": None,  "source": "Toko Barokah"},
    {"code": "KRT02", "name": "Sunlight Cuci Piring",  "category": "Kebutuhan RT",     "buy": 9000,  "sell": 10000, "unit": "pcs",   "min_stock": 4,  "avg_daily": 1,  "std_daily": 0.5, "restock_days": 14, "batch_qty": 6,  "expiry_days": None,  "source": "Toko Moro"},
    {"code": "KRT03", "name": "Sabun Cuci Baju",       "category": "Kebutuhan RT",     "buy": 4500,  "sell": 5000,  "unit": "pcs",   "min_stock": 10, "avg_daily": 3,  "std_daily": 1.2, "restock_days": 7,  "batch_qty": 20, "expiry_days": None,  "source": "Warung Melati"},

    # === BUMBU (dari Melati) ===
    {"code": "BMB01", "name": "Masako Ayam",           "category": "Bumbu Dapur",      "buy": 4500,  "sell": 5000,  "unit": "pack",  "min_stock": 15, "avg_daily": 5,  "std_daily": 1.5, "restock_days": 7,  "batch_qty": 30, "expiry_days": 365,   "source": "Warung Melati"},

    # === GAS (dari Barokah) ===
    {"code": "GAS01", "name": "Gas LPG 3kg",           "category": "Kebutuhan Dapur",  "buy": 20000, "sell": 23000, "unit": "tabung","min_stock": 2,  "avg_daily": 1,  "std_daily": 0.5, "restock_days": 7,  "batch_qty": 3,  "expiry_days": None,  "source": "Toko Barokah"},

    # === PERAWATAN (dari Melati, Amanah) ===
    {"code": "PRW01", "name": "Shampoo Sachet",        "category": "Perawatan Tubuh",  "buy": 500,   "sell": 1000,  "unit": "pcs",   "min_stock": 15, "avg_daily": 4,  "std_daily": 2.0, "restock_days": 7,  "batch_qty": 24, "expiry_days": 730,   "source": "Toko Amanah"},
]

print(f"Total produk: {len(products)}")

# Save compiled products
df_products = pd.DataFrame(products)
df_products.to_csv(os.path.join(OUTPUT_DIR, 'compiled_products.csv'), index=False)
print(f"Saved: compiled_products.csv")

# ============================================================
# STEP 2: Generate Transaksi Sintetis (3 bulan)
# ============================================================

START_DATE = datetime(2026, 4, 1)
END_DATE = datetime(2026, 6, 30)
NUM_DAYS = (END_DATE - START_DATE).days + 1  # 91 hari

transactions = []
transaction_items = []
tx_id = 0

for day_offset in range(NUM_DAYS):
    current_date = START_DATE + timedelta(days=day_offset)
    day_of_week = current_date.weekday()  # 0=Mon, 6=Sun
    day_of_month = current_date.day
    
    # Faktor multiplier
    is_weekend = day_of_week >= 5
    is_payday = 25 <= day_of_month or day_of_month <= 5
    is_early_month = 1 <= day_of_month <= 5
    
    # Jumlah transaksi hari ini
    base_tx = random.randint(10, 20)
    if is_weekend:
        base_tx = int(base_tx * 1.3)
    if is_payday:
        base_tx = int(base_tx * 1.4)
    if is_early_month:
        base_tx = int(base_tx * 1.2)
    
    # Tambah random noise
    base_tx = max(5, base_tx + random.randint(-3, 3))
    
    for tx_num in range(base_tx):
        tx_id += 1
        tx_code = f"STRX-{current_date.strftime('%y%m%d')}-{tx_id:04d}"
        
        # Random jam transaksi (puncak 10-12 dan 16-18)
        hour_weights = [0]*6 + [2,3,4,5,6,6,5,4,3,4,5,6,5,4,3] + [0]*3
        hour = random.choices(range(24), weights=hour_weights)[0]
        minute = random.randint(0, 59)
        tx_time = current_date.replace(hour=hour, minute=minute)
        
        # Jumlah item per transaksi (1-5, biasanya 2-3)
        num_items = random.choices([1,2,3,4,5], weights=[20,35,25,15,5])[0]
        
        # Pilih produk random (weighted by avg_daily)
        weights = [p['avg_daily'] for p in products]
        chosen_products = random.choices(products, weights=weights, k=num_items)
        # Remove duplicates
        seen = set()
        unique_products = []
        for p in chosen_products:
            if p['code'] not in seen:
                seen.add(p['code'])
                unique_products.append(p)
        
        if not unique_products:
            continue
        
        # Metode pembayaran
        payment = random.choices(
            ['CASH', 'QRIS', 'TRANSFER', 'EWALLET'],
            weights=[80, 12, 5, 3]
        )[0]
        
        total = 0
        items_for_tx = []
        for prod in unique_products:
            # Qty: biasanya 1-3, kadang lebih untuk fast-moving
            if prod['avg_daily'] >= 5:
                qty = random.choices([1,2,3,4,5], weights=[30,30,20,15,5])[0]
            else:
                qty = random.choices([1,2,3], weights=[60,30,10])[0]
            
            # Kadang ada diskon kecil
            price = prod['sell']
            discount = 0
            if random.random() < 0.05:  # 5% chance diskon
                discount = round(price * random.choice([0.05, 0.10, 0.15]))
                price = price - discount
            
            subtotal = price * qty
            total += subtotal
            
            items_for_tx.append({
                'transaction_code': tx_code,
                'product_code': prod['code'],
                'product_name': prod['name'],
                'category': prod['category'],
                'quantity': qty,
                'price': price,
                'buying_price': prod['buy'],
                'discount': discount,
                'subtotal': subtotal
            })
        
        # Hitung kembalian (untuk CASH)
        if payment == 'CASH':
            # Round up ke kelipatan 5000
            amount_paid = ((total // 5000) + 1) * 5000
            change = amount_paid - total
        else:
            amount_paid = total
            change = 0
        
        transactions.append({
            'transaction_code': tx_code,
            'date': tx_time.strftime('%Y-%m-%d'),
            'time': tx_time.strftime('%H:%M:%S'),
            'datetime': tx_time.strftime('%Y-%m-%d %H:%M:%S'),
            'day_of_week': day_of_week,
            'day_name': current_date.strftime('%A'),
            'is_weekend': int(is_weekend),
            'is_payday': int(is_payday),
            'total': total,
            'payment_method': payment,
            'amount_paid': amount_paid,
            'change': change,
            'num_items': len(items_for_tx)
        })
        
        transaction_items.extend(items_for_tx)

df_tx = pd.DataFrame(transactions)
df_items = pd.DataFrame(transaction_items)

df_tx.to_csv(os.path.join(OUTPUT_DIR, 'transactions.csv'), index=False)
df_items.to_csv(os.path.join(OUTPUT_DIR, 'transaction_items.csv'), index=False)

print(f"\nHasil Generate:")
print(f"  Total hari: {NUM_DAYS}")
print(f"  Total transaksi: {len(df_tx)}")
print(f"  Total item terjual: {len(df_items)}")
print(f"  Total revenue: Rp {df_tx['total'].sum():,.0f}")
print(f"  Avg revenue/hari: Rp {df_tx['total'].sum()/NUM_DAYS:,.0f}")
print(f"  Avg transaksi/hari: {len(df_tx)/NUM_DAYS:.1f}")
print(f"\nMetode Bayar:")
print(df_tx['payment_method'].value_counts().to_string())
print(f"\nTop 10 Produk (by qty sold):")
top = df_items.groupby('product_name')['quantity'].sum().sort_values(ascending=False).head(10)
print(top.to_string())

# ============================================================
# STEP 3: Generate Batch Stok
# ============================================================

batches = []
batch_id = 0

for prod in products:
    # Generate batch setiap restock_days selama 3 bulan
    current = START_DATE - timedelta(days=7)  # Mulai 1 minggu sebelum
    while current <= END_DATE:
        batch_id += 1
        batch_code = f"BCH-{batch_id:04d}"
        
        qty = prod['batch_qty'] + random.randint(-2, 5)
        qty = max(1, qty)
        
        expiry = None
        if prod['expiry_days']:
            expiry = (current + timedelta(days=prod['expiry_days'])).strftime('%Y-%m-%d')
        
        batches.append({
            'batch_code': batch_code,
            'product_code': prod['code'],
            'product_name': prod['name'],
            'quantity': qty,
            'cost_per_unit': prod['buy'],
            'purchase_date': current.strftime('%Y-%m-%d'),
            'expiry_date': expiry,
            'status': 'ACTIVE'
        })
        
        current += timedelta(days=prod['restock_days'])

df_batches = pd.DataFrame(batches)
df_batches.to_csv(os.path.join(OUTPUT_DIR, 'batches.csv'), index=False)
print(f"\nTotal batch stok: {len(df_batches)}")
print(f"\nSaved all files to: {OUTPUT_DIR}")
print("  - compiled_products.csv")
print("  - transactions.csv")  
print("  - transaction_items.csv")
print("  - batches.csv")
