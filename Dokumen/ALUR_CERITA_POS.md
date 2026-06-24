# Cerita Lengkap: Perjalanan POS Pintar (Dari Gudang ke Tangan Pelanggan)

Bayangkan Anda adalah Pak Budi, pemilik **Toko Kelontong "Maju Jaya"**. Toko ini sudah menggunakan POS ML System kita. Mari kita ikuti perjalanan sehari di toko ini.

## Bab 1: Persiapan (Master Data Produk)
Pak Budi (sebagai **Admin**) baru saja membuka tokonya. Dia ingin menjual produk baru: **Beras SPHP 5Kg**.
Dia masuk ke menu **Produk** dan menambahkan data baru:
- **Nama Produk:** Beras SPHP 5Kg
- **Kategori:** Sembako
- **Harga Beli (Estimasi Modal):** Rp 50.000
- **Harga Jual (Harga Etalase):** Rp 60.000

*Kenapa Harga Jual diset di sini?* Karena Pak Budi akan mencetak **label harga Rp 60.000** dan menempelkannya di rak toko. Pelanggan yang masuk akan melihat harga ini. Harga ini harus stabil agar pelanggan tidak bingung.

## Bab 2: Kedatangan Barang (Inventori & Batch)
Sore harinya, truk supplier dari Bulog datang membawa 100 karung Beras SPHP.
Pak Budi harus mencatat barang masuk ini. Dia buka menu **Inventori -> Penerimaan Barang (Restock)**.
Dia memilih "Beras SPHP 5Kg" dari *dropdown*. Sistem otomatis bertanya: *"Pak Budi, mau pakai Harga Modal default (Rp 50.000) atau ada perubahan harga dari supplier?"*
Ternyata hari ini Bulog sedang diskon! Harga kulaknya hanya **Rp 48.000**.
Pak Budi memasukkan Harga Modal = Rp 48.000. 
Sistem langsung memunculkan **Smart Margin Info**: *"Harga Jual di Kasir: Rp 60.000. Untung Anda untuk batch ini: Rp 12.000 per karung (naik!)."*
Pak Budi menyimpan batch ini. Terciptalah **Batch 1 (QTY: 100, Modal: Rp 48.000, Expired: 1 Tahun lagi)**.

*Catatan: Harga di label rak tetap Rp 60.000. Pelanggan tidak peduli Pak Budi dapat diskon dari Bulog, yang penting harga jual stabil.*

## Bab 3: Penjualan (Kasir POS & FIFO)
Esok harinya, **Kasir** bernama Siti sedang berjaga.
Seorang ibu bernama Bu Tejo datang membawa 2 karung Beras SPHP ke kasir.
Siti men-scan/mencari Beras SPHP di aplikasi Kasir. Muncul harga **Rp 60.000** (mengambil dari Master Data Produk).
Total belanja Bu Tejo = Rp 120.000. Bu Tejo membayar tunai, struk dicetak.

Di balik layar (Backend), sistem kita yang sangat cerdas langsung bekerja:
1. Sistem mengecek: *"Siti baru saja menjual 2 Beras. Ambil stok dari mana nih?"*
2. **Logika FIFO** berjalan: Sistem mencari Batch yang paling lama (Batch 1).
3. Sistem memotong stok Batch 1: 100 - 2 = **Sisa 98 karung**.
4. Sistem mencatat keuntungan: *"Terjual Rp 120.000. Modal dari Batch 1 adalah Rp 48.000 x 2 = Rp 96.000. Untung bersih transaksi ini = **Rp 24.000**."*

## Bab 4: Waktu Berlalu (Barang Kadaluarsa & Habis)
Tiga bulan berlalu. 
Dari 100 karung (Batch 1), sudah terjual 95 karung. Sisa 5 karung.
Sayangnya, 5 karung ini terselip di gudang sampai melewati **Tanggal Kadaluarsa**.
Tepat di hari kadaluarsa, sistem background kita langsung bertindak otomatis:
1. Status Batch 1 yang tadinya **ACTIVE**, otomatis diubah menjadi **EXPIRED**.
2. Stok 5 karung ini langsung **dihilangkan dari layar Kasir** agar Siti tidak bisa menjual beras busuk ke pelanggan.
3. Pak Budi melihat notifikasi di Dashboard Admin: *"Peringatan! 5 Karung Beras SPHP dari Batch 1 telah kadaluarsa!"*
4. Kelima beras ini dicatat sebagai **Kerugian (Loss)** karena gagal terjual sebelum expired.

Sementara itu, karena stok Beras SPHP kosong, sistem memberi Notifikasi Lonceng (Bell) berbunyi merah: *"Stok Beras SPHP habis! Segera Restock!"*. Pak Budi pun menelpon Bulog lagi untuk membuat Batch 2.

## Bab 5: Kejadian Tak Terduga (Stock Opname)
Suatu hari, ada tikus masuk ke gudang dan merobek 1 karung beras dari Batch 2.
Pak Budi melihat fisiknya rusak dan harus dibuang. Di sistem masih tercatat sisa 50 karung, padahal fisik tinggal 49 karung.
Karena **Batch bersifat permanen (tidak bisa diedit manual)**, Pak Budi tidak bisa seenaknya mengganti angka di tabel Batch. Ini demi mencegah kecurangan kasir/karyawan.
Pak Budi harus masuk ke menu **Stock Opname**. Dia melaporkan: *"Beras SPHP fisik di gudang tinggal 49."*
Sistem akan meminta alasan, Pak Budi menulis: *"Dimakan tikus"*.
Sistem kemudian otomatis memotong 1 stok dari Batch 2. Jejak audit (Audit Log) tercatat jelas bahwa stok berkurang karena rusak, bukan karena terjual.

## Tamat
Begitulah perjalanan sistem POS ini. Semuanya saling terhubung, otomatis, anti-kecurangan, dan laba yang dihitung sangat akurat layaknya sistem minimarket modern berskala nasional.
