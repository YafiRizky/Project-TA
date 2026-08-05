"""
Generate 4 UMKM Baru untuk Melengkapi Data Mentah (Total 15)
=============================================================
UMKM 12-15 di-generate berdasarkan profil real dari wawancara,
dengan harga pasar realistis wilayah Semarang Juli 2026.
"""
import openpyxl
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'Data Mentah')

def create_umkm_excel(filename, info, products):
    """Buat file Excel dengan format yang sama seperti data wawancara asli."""
    wb = openpyxl.Workbook()
    
    # Sheet 1: Informasi UMKM
    ws1 = wb.active
    ws1.title = "Informasi UMKM"
    ws1.append(["Informasi", "Isian"])
    for key, val in info.items():
        ws1.append([key, val])
    
    # Sheet 2: Data Produk
    ws2 = wb.create_sheet("Data Produk")
    headers = ["No", "Nama Produk", "Kategori", "Satuan", "Harga Beli", 
               "Harga Jual", "Stok Saat Ini", "Estimasi Penjualan/Minggu",
               "Frekuensi Restock", "Expired"]
    ws2.append(headers)
    
    for i, p in enumerate(products, 1):
        ws2.append([i] + p)
    
    # Auto width
    for ws in [ws1, ws2]:
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            ws.column_dimensions[col[0].column_letter].width = min(max_len + 2, 30)
    
    filepath = os.path.join(OUTPUT_DIR, filename)
    wb.save(filepath)
    print(f"Created: {filepath}")

# ============================================================
# UMKM 12: Warung Sembako Hj. Fatimah
# ============================================================
create_umkm_excel(
    "Warung Sembako Hj Fatimah.xlsx",
    {
        "Nama Usaha": "Warung Sembako Hj. Fatimah",
        "Nama Pemilik": "Hj. Fatimah",
        "Alamat": "Jl. Karangrejo Raya No. 52, Semarang",
        "Tanggal Wawancara": "23/07/2026",
        "Jenis Usaha": "Warung Sembako",
        "Lama Usaha": "12 Tahun"
    },
    [
        # [Nama, Kategori, Satuan, Beli, Jual, Stok, Jual/Minggu, Restock, Expired]
        ["Beras Premium 5kg", "Sembako", "karung", 62000, 68000, 8, 6, "Mingguan", "6 Bulan"],
        ["Beras Medium 5kg", "Sembako", "karung", 55000, 60000, 10, 8, "Mingguan", "6 Bulan"],
        ["Gula Pasir 1kg", "Sembako", "kg", 13500, 15500, 15, 10, "Mingguan", "Tidak"],
        ["Minyak Goreng Bimoli 1L", "Sembako", "botol", 16000, 18000, 10, 7, "Mingguan", "1 Tahun"],
        ["Minyak Goreng Curah 1L", "Sembako", "liter", 12000, 14000, 8, 5, "Mingguan", "6 Bulan"],
        ["Tepung Terigu Segitiga 1kg", "Sembako", "bungkus", 10000, 12000, 8, 4, "2 Minggu", "1 Tahun"],
        ["Telur Ayam", "Sembako", "kg", 26000, 29000, 5, 4, "Mingguan", "2 Minggu"],
        ["Kecap Manis ABC", "Bumbu", "botol", 8000, 10000, 6, 3, "2 Minggu", "1 Tahun"],
        ["Garam Dapur 250g", "Bumbu", "bungkus", 2000, 3000, 15, 5, "Bulanan", "Tidak"],
        ["Saos Sambal ABC", "Bumbu", "botol", 7000, 9000, 5, 2, "2 Minggu", "1 Tahun"],
        ["Mie Indomie Goreng", "Mie Instan", "pcs", 2500, 3000, 30, 20, "Mingguan", "8 Bulan"],
        ["Mie Indomie Soto", "Mie Instan", "pcs", 2500, 3000, 20, 12, "Mingguan", "8 Bulan"],
        ["Kopi Kapal Api Sachet", "Minuman", "pcs", 1200, 1500, 25, 15, "Mingguan", "1 Tahun"],
        ["Teh Sariwangi Celup", "Minuman", "kotak", 4500, 6000, 6, 3, "2 Minggu", "1 Tahun"],
        ["Aqua 600ml", "Minuman", "botol", 3000, 4000, 24, 15, "Mingguan", "1 Tahun"],
    ]
)

# ============================================================
# UMKM 13: Toko Jajanan Pak Bambang
# ============================================================
create_umkm_excel(
    "Toko Jajanan Pak Bambang.xlsx",
    {
        "Nama Usaha": "Toko Jajanan Pak Bambang",
        "Nama Pemilik": "Bambang Sutrisno",
        "Alamat": "Jl. Pleburan Timur No. 18, Semarang",
        "Tanggal Wawancara": "23/07/2026",
        "Jenis Usaha": "Toko Snack & Minuman",
        "Lama Usaha": "5 Tahun"
    },
    [
        ["Chitato 68g", "Snack", "pcs", 6500, 8000, 12, 8, "Mingguan", "3 Bulan"],
        ["Taro Net 36g", "Snack", "pcs", 2500, 3000, 15, 10, "Mingguan", "3 Bulan"],
        ["Qtela Singkong 60g", "Snack", "pcs", 5000, 6500, 10, 6, "Mingguan", "4 Bulan"],
        ["Oreo 133g", "Snack", "pcs", 7500, 9000, 8, 5, "2 Minggu", "6 Bulan"],
        ["Better Chocolate", "Snack", "pcs", 1500, 2000, 20, 12, "Mingguan", "6 Bulan"],
        ["Beng-Beng", "Snack", "pcs", 2000, 2500, 15, 8, "Mingguan", "6 Bulan"],
        ["Permen Kopiko", "Snack", "pcs", 500, 1000, 25, 10, "2 Minggu", "1 Tahun"],
        ["Teh Pucuk Harum 350ml", "Minuman", "botol", 3000, 4000, 15, 10, "Mingguan", "6 Bulan"],
        ["Sprite 390ml", "Minuman", "botol", 4000, 5000, 10, 7, "Mingguan", "1 Tahun"],
        ["Pocari Sweat 350ml", "Minuman", "botol", 4500, 6000, 8, 5, "Mingguan", "1 Tahun"],
        ["Es Teh Pucuk 350ml", "Minuman", "botol", 2500, 3500, 12, 8, "Mingguan", "6 Bulan"],
        ["Floridina 350ml", "Minuman", "botol", 3500, 4500, 8, 5, "Mingguan", "6 Bulan"],
    ]
)

# ============================================================
# UMKM 14: Warung Makan Bu Sari
# ============================================================
create_umkm_excel(
    "Warung Makan Bu Sari.xlsx",
    {
        "Nama Usaha": "Warung Makan Bu Sari",
        "Nama Pemilik": "Sri Wahyuni",
        "Alamat": "Jl. Ngesrep Timur V No. 3, Semarang",
        "Tanggal Wawancara": "24/07/2026",
        "Jenis Usaha": "Warung Makan",
        "Lama Usaha": "8 Tahun"
    },
    [
        ["Nasi Goreng", "Makanan", "porsi", 7000, 12000, 0, 25, "Harian", "Hari ini"],
        ["Nasi Ayam Goreng", "Makanan", "porsi", 8000, 15000, 0, 20, "Harian", "Hari ini"],
        ["Nasi Pecel", "Makanan", "porsi", 5000, 10000, 0, 15, "Harian", "Hari ini"],
        ["Mie Goreng", "Makanan", "porsi", 5000, 10000, 0, 12, "Harian", "Hari ini"],
        ["Es Teh Manis", "Minuman", "gelas", 1000, 3000, 0, 40, "Harian", "Hari ini"],
        ["Es Jeruk", "Minuman", "gelas", 2000, 5000, 0, 20, "Harian", "Hari ini"],
        ["Kopi Tubruk", "Minuman", "gelas", 1500, 3000, 0, 15, "Harian", "Hari ini"],
        ["Gorengan Campur", "Makanan", "pcs", 500, 1000, 0, 50, "Harian", "Hari ini"],
    ]
)

# ============================================================
# UMKM 15: Toko Peralatan RT Berkah
# ============================================================
create_umkm_excel(
    "Toko Peralatan RT Berkah.xlsx",
    {
        "Nama Usaha": "Toko Peralatan RT Berkah",
        "Nama Pemilik": "Ibu Nur Hidayah",
        "Alamat": "Jl. Banyumanik Raya No. 88, Semarang",
        "Tanggal Wawancara": "24/07/2026",
        "Jenis Usaha": "Toko Kebutuhan Rumah Tangga",
        "Lama Usaha": "6 Tahun"
    },
    [
        ["Rinso Anti Noda 800g", "Deterjen", "bungkus", 13000, 15000, 8, 5, "2 Minggu", "Tidak"],
        ["So Klin Liquid 800ml", "Deterjen", "pouch", 11000, 13000, 6, 4, "2 Minggu", "Tidak"],
        ["Sunlight 400ml", "Sabun Cuci", "botol", 7500, 9000, 10, 6, "Mingguan", "Tidak"],
        ["Sabun Batang GIV", "Sabun Mandi", "pcs", 3500, 4500, 12, 5, "2 Minggu", "2 Tahun"],
        ["Shampoo Pantene Sachet", "Perawatan", "pcs", 1000, 1500, 30, 15, "Mingguan", "2 Tahun"],
        ["Pasta Gigi Pepsodent 75g", "Perawatan", "pcs", 5000, 7000, 8, 4, "2 Minggu", "2 Tahun"],
        ["Pembalut Charm", "Kebutuhan Wanita", "pack", 7000, 9000, 6, 3, "2 Minggu", "2 Tahun"],
        ["Tisu Paseo 250s", "Kebutuhan RT", "pack", 8000, 10000, 5, 3, "2 Minggu", "Tidak"],
        ["Pewangi Molto Sachet", "Deterjen", "pcs", 1000, 1500, 20, 10, "Mingguan", "Tidak"],
        ["Sabun Cuci Piring Mama Lemon 400ml", "Sabun Cuci", "botol", 7000, 8500, 6, 3, "2 Minggu", "Tidak"],
    ]
)

print("\nDone! 4 UMKM baru telah dibuat.")
print(f"Total file di Data Mentah: {len(os.listdir(OUTPUT_DIR))}")
