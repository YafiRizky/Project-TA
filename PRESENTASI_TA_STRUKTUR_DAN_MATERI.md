# DOKUMEN STRUKTUR DAN NASKAH SLIDE PRESENTASI SIDANG TUGAS AKHIR

**Judul Penelitian**: Sistem Point of Sale Terintegrasi Machine Learning untuk Optimasi Manajemen Stok pada UMKM  
**Penyusun**: Yafi Rizky  
**Akses Live Demo VPS**: `http://202.155.16.135`  
**File Dummy HTML Slide Interaktif**: [PRESENTASI_TA_SLIDES.html](file:///c:/laragon/www/TA/PRESENTASI_TA_SLIDES.html)

---

## RINGKASAN STRUKTUR PRESENTASI (13 SLIDE)

1. **Slide 1**: Judul Utama & Identitas Peneliti
2. **Slide 2**: Latar Belakang & Permasalahan Stok UMKM
3. **Slide 3**: Rumusan Masalah & Tujuan Penelitian
4. **Slide 4**: Pengenalan Project & Arsitektur Sistem (System Overview)
5. **Slide 5**: Stack Teknologi & Keunggulan Arsitektural (Multi-Tenant & FIFO)
6. **Slide 6**: Modul Machine Learning 1 - Prediksi Stok Habis (Moving Average)
7. **Slide 7**: Modul Machine Learning 2 - Rekomendasi Restock (Safety Stock & EOQ)
8. **Slide 8**: Modul Machine Learning 3 - Analisis Risiko Kadaluarsa (Expiry Risk)
9. **Slide 9**: Modul Machine Learning 4 - Prediksi Pendapatan (Ridge Regression)
10. **Slide 10**: Modul Machine Learning 5 - Klasifikasi Produk ABC (Pareto Analysis)
11. **Slide 11**: Pengujian Fungsional (Black Box Testing) & Performa Server
12. **Slide 12**: Kesimpulan & Saran Masa Depan
13. **Slide 13**: Penutup & Sesi Tanya Jawab (Q&A)

---

## RINCIAN MATERI PER SLIDE & NASKAH PRESENTASI

### SLIDE 1: JUDUL UTAMA & IDENTITAS PENELITI

- **Judul Slide**: SISTEM POINT OF SALE TERINTEGRASI MACHINE LEARNING UNTUK OPTIMASI MANAJEMEN STOK PADA UMKM
- **Konten Ringkas**:
  - Jenis Kegiatan: Presentasi Sidang Tugas Akhir Program Studi D3 Manajemen Informatika / Teknik Informatika
  - Nama Peneliti: Yafi Rizky
  - Ringkasan Solusi: Pengembangan Sistem Informasi Kasir Multi-Tenant Berbasis Web dengan Integrasi 5 Modul Machine Learning Prediktif dan Pembayaran Digital Xendit API.
- **Placeholder Gambar / Bukti Visual**:
  - `*{Gambar Logo Kampus / Institusi dan Hero Banner Mercatura POS}`
- **Naskah Penjelasan (Speaker Notes)**:
  "Selamat pagi/siang Bapak/Ibu Dosen Penguji. Pada kesempatan kali ini, saya akan mempresentasikan hasil penelitian Tugas Akhir saya yang berjudul 'Sistem Point of Sale Terintegrasi Machine Learning untuk Optimasi Manajemen Stok pada UMKM'. Sistem ini dibangun berbasis web full-stack untuk membantu pemilik toko ritel dan warung kelontong dalam mencatat transaksi sekaligus mengelola stok secara prediktif."

---

### SLIDE 2: LATAR BELAKANG & PERMASALAHAN STOK UMKM

- **Judul Slide**: 01. LATAR BELAKANG - Tantangan Utama Manajemen Stok UMKM
- **Konten Ringkas**:
  - **Konteks**: UMKM menyumbang >60% PDB Indonesia (Kemenkop UKM, 2023), namun manajemen persediaan masih dikelola secara manual.
  - **Tiga Masalah Utama**:
    1. *Stockout Risk*: Kehabisan stok barang laku secara mendadak akibat tidak ada estimasi waktu pemesanan ulang.
    2. *Expiry Risk*: Kerugian finansial akibat akumulasi barang kadaluarsa di gudang tanpa sistem batch.
    3. *Inefficient Capital Allocation*: Modal terikat pada barang slow-moving karena tidak bisa membedakan produk berproduksi tinggi (Pareto).
- **Placeholder Gambar / Bukti Visual**:
  - `*{Infografis Permasalahan Stok UMKM: Stockout, Expired Goods, dan Dead Stock}`
- **Referensi Akademis**:
  - Kementerian Koperasi dan UKM RI (2023). Data UMKM Indonesia.
  - Heizer, J., Render, B., & Munson, C. (2017). Operations Management: Sustainability and Supply Chain Management.
- **Naskah Penjelasan (Speaker Notes)**:
  "Latar belakang penelitian ini berawal dari tiga masalah klasik UMKM: kehabisan stok produk populer yang menyebabkan hilangnya potensi penjualan, kerugian akibat barang kadaluarsa di gudang, dan modal usaha yang mengendap pada produk slow-moving. Melalui sistem ini, pendekatan berbasis data dan Machine Learning diterapkan untuk menyelesaikan ketiga masalah tersebut."

---

### SLIDE 3: RUMUSAN MASALAH & TUJUAN PENELITIAN

- **Judul Slide**: 02. FOKUS PENELITIAN - Rumusan Masalah & Tujuan Sistem
- **Konten Ringkas**:
  - **Rumusan Masalah**:
    1. Bagaimana merancang sistem POS berbasis web yang mendukung pencatatan transaksi real-time dan manajemen stok batch FIFO?
    2. Bagaimana mengintegrasikan 5 modul Machine Learning prediktif untuk stok habis, restock EOQ, risiko kadaluarsa, forecast pendapatan, dan klasifikasi produk ABC?
  - **Tujuan Penelitian**:
    1. Membangun sistem POS multi-tenant responsif dengan pembayaran digital Xendit (QRIS, VA, E-Wallet).
    2. Menghasilkan dashboard ML prediktif yang memberikan rekomendasi konkret untuk alokasi modal dan pemesanan ulang.
- **Placeholder Gambar / Bukti Visual**:
  - `*{Diagram Alur Kerangka Konseptual Mercatura POS: Input Data Transaksi -> ML Engine -> Actionable Dashboard}`
- **Naskah Penjelasan (Speaker Notes)**:
  "Berdasarkan permasalahan tersebut, penelitian ini bertujuan membangun sistem POS multi-tenant berbasis web yang tidak hanya mencatat transaksi, tetapi juga mengeksekusi algoritma Machine Learning secara otomatis untuk menghasilkan rekomendasi operasional bagi pemilik usaha."

---

### SLIDE 4: PENGENALAN PROJECT & ARSITEKTUR SISTEM

- **Judul Slide**: 03. ARSITEKTUR SISTEM - Gambaran Umum Mercatura POS
- **Konten Ringkas**:
  - **Tiga Layer Arsitektur**:
    1. *Client Tier*: React.js 19 (Single Page Application) responsif untuk antarmuka Kasir dan Admin.
    2. *Application Tier*: Django REST Framework (10 apps independen) mengelola autentikasi JWT, alur FIFO, dan Xendit API.
    3. *Data & ML Tier*: PostgreSQL 16 (Multi-Tenant Isolation) & Scikit-Learn Engine untuk pemrosesan data historis.
  - **Spesifikasi VPS**: Rumahweb Cloud VPS Ubuntu 24.04 (`202.155.16.135`).
- **Placeholder Gambar / Bukti Visual**:
  - `*{Diagram Arsitektur System Overview: React Frontend -> Django REST API -> PostgreSQL -> ML Engine -> Xendit Gateway}`
- **Naskah Penjelasan (Speaker Notes)**:
  "Secara arsitektur, sistem ini memisahkan frontend React.js dan backend Django REST API. Seluruh komponen terpasang All-in-One pada VPS Cloud Rumahweb, menjamin ketersediaan sistem 24/7 dan waktu respons API yang cepat kurang dari 350 milidetik."

---

### SLIDE 5: STACK TEKNOLOGI & KEUNGGULAN ARSITEKTURAL

- **Judul Slide**: 04. TEKNOLOGI & KEUNGGULAN - Stack Teknologi & Fitur Unggulan
- **Konten Ringkas**:
  - **Tech Stack**: React 19, Django REST Framework, PostgreSQL 16, Scikit-Learn, Pandas, Xendit API, Tailwind CSS.
  - **Dua Keunggulan Arsitektur**:
    1. *Multi-Tenant Data Isolation*: Filter otomatis `business_id` pada setiap query via token JWT, menjamin data antar toko terpisah 100% aman.
    2. *Otomatisasi FIFO Batch*: Pengurangan stok saat checkout POS selalu memprioritaskan batch stok dengan tanggal masuk (`received_date`) paling awal.
- **Placeholder Gambar / Bukti Visual**:
  - `*{Logo Stack Teknologi: React, Django, PostgreSQL, Scikit-learn, Xendit}`
- **Referensi Akademis**:
  - Pedregosa et al. (2011). Scikit-learn: Machine Learning in Python.
  - McKinney, W. (2017). Python for Data Analysis.
- **Naskah Penjelasan (Speaker Notes)**:
  "Keunggulan utama arsitektur sistem ini terletak pada arsitektur multi-tenant yang aman dan otomatisasi metode FIFO pada level batch. Setiap kali kasir melakukan transaksi, sistem secara otomatis mengambil stok dari batch terlama untuk meminimalkan risiko kadaluarsa."

---

### SLIDE 6: MODUL ML 1 - PREDIKSI KEHABISAN STOK (STOCKOUT PREDICTION)

- **Judul Slide**: 05. MODUL MACHINE LEARNING (1/5) - Stockout Prediction (Moving Average)
- **Konten Ringkas**:
  - **Fungsi**: Memprediksi sisa hari hingga stok produk habis.
  - **Metodologi & Rumus**:
    $$\text{MA}_k = \frac{1}{k} \sum_{i=1}^{k} S_i \quad (k=7, 30)$$
    $$v_{\text{daily}} = \max(\text{MA}_7, \text{MA}_{30})$$
    $$\text{Hari Stok Habis} = \frac{\text{Stok Saat Ini}}{v_{\text{daily}}}$$
  - **Tingkat Risiko**: Critical (<= 3 hari), High (<= 7 hari), Medium (<= 14 hari), Low (> 14 hari).
  - **Alasan Pemilihan**: Efisien secara komputasi dan stabil terhadap fluktuasi harian data ritel UMKM.
- **Placeholder Gambar / Bukti Visual**:
  - `*{Screenshot Tab Prediksi Stok Habis & Tabel Tingkat Risiko}`
- **Referensi Akademis**:
  - Hyndman, R. J., & Athanasopoulos, G. (2021). Forecasting: Principles and Practice.
- **Naskah Penjelasan (Speaker Notes)**:
  "Modul ML pertama adalah Stockout Prediction menggunakan Moving Average 7 dan 30 hari. Rumus ini mengambil angka penjualan harian tertinggi secara konservatif untuk menghitung berapa hari sisa stok akan bertahan, lalu mengelompokkannya ke dalam tingkatan risiko Critical hingga Low."

---

### SLIDE 7: MODUL ML 2 - REKOMENDASI RESTOCK (SAFETY STOCK & EOQ)

- **Judul Slide**: 06. MODUL MACHINE LEARNING (2/5) - Safety Stock & Economic Order Quantity (EOQ)
- **Konten Ringkas**:
  - **Fungsi**: Menentukan titik pemesanan ulang (Reorder Point) dan kuantitas pembelian paling ekonomis.
  - **Metodologi & Rumus**:
    $$\text{Safety Stock} = Z \times \sigma \times \sqrt{L} \quad (Z = 1.65 / 95\% \text{ service level})$$
    $$\text{ROP} = (v_{\text{daily}} \times L) + \text{Safety Stock} \quad (L = 3 \text{ hari})$$
    $$\text{EOQ} = \sqrt{\frac{2 \times D \times S}{H}}$$
    *(D = demand tahunan, S = biaya pesan Rp 10.000, H = biaya simpan 20% harga beli)*
  - **Alasan Pemilihan**: Meminimalkan akumulasi total biaya inventori (biaya pesan + biaya simpan) sekaligus mencegah hilangnya penjualan akibat keterlambatan supplier.
- **Placeholder Gambar / Bukti Visual**:
  - `*{Screenshot Tab Rekomendasi Restock & Grafik Kurva Biaya EOQ}`
- **Referensi Akademis**:
  - Chopra, S., & Meindl, P. (2016). Supply Chain Management: Strategy, Planning, and Operation.
- **Naskah Penjelasan (Speaker Notes)**:
  "Modul kedua mengombinasikan Safety Stock dan EOQ. Dengan Service Level 95 persen dan Z-score 1.65, sistem menghitung batas aman persediaan dan memberikan jumlah pasti unit yang harus dipesan agar biaya pemesanan dan biaya penyimpanan berada pada titik paling ekonomis."

---

### SLIDE 8: MODUL ML 3 - ANALISIS RISIKO KADALUARSA (EXPIRY RISK ANALYSIS)

- **Judul Slide**: 07. MODUL MACHINE LEARNING (3/5) - Expiry Risk Analysis & Loss Projection
- **Konten Ringkas**:
  - **Fungsi**: Memproyeksikan sisa stok batch yang tidak terjual sebelum expired dan menghitung proyeksi kerugian finansial.
  - **Metodologi & Rumus**:
    $$\text{Proyeksi Terjual} = v_{\text{daily}} \times (\text{Expiry Date} - \text{Hari Ini})$$
    $$\text{Proyeksi Tidak Terjual} = \max(0, \text{Stok Batch} - \text{Proyeksi Terjual})$$
    $$\text{Kerugian Finansial} = \text{Proyeksi Tidak Terjual} \times \text{Harga Beli Per Unit}$$
  - **Rekomendasi Otomatis**: Diskon 50% / Bundle (<= 3 hari), Diskon 30% (<= 7 hari), Write-off (< 0 hari).
  - **Alasan Pemilihan**: Mencegah kerugian total dengan mengonversi barang berisiko menjadi arus kas melalui diskon bertingkat.
- **Placeholder Gambar / Bukti Visual**:
  - `*{Screenshot Tab Risiko Expired & Tabel Tindakan Diskon Otomatis}`
- **Referensi Akademis**:
  - Kimes, S. E. & Wirtz, J. (2003). Has Revenue Management become Acceptable?
- **Naskah Penjelasan (Speaker Notes)**:
  "Modul ketiga menganalisis kecepatan penjualan batch stok terhadap sisa hari kadaluarsa. Jika sistem memprediksi ada unit yang tidak akan habis sebelum expired, sistem secara otomatis merekomendasikan tingkat diskon seperti 30% atau 50% untuk menyelamatkan modal usaha."

---

### SLIDE 9: MODUL ML 4 - PREDIKSI PENDAPATAN (REVENUE FORECAST)

- **Judul Slide**: 08. MODUL MACHINE LEARNING (4/5) - Revenue Forecast (Ridge Regression + 12 Features)
- **Konten Ringkas**:
  - **Fungsi**: Memprediksi tren pendapatan harian dan bulanan untuk perencanaan keuangan.
  - **Metodologi & Rumus**:
    $$\min_{w} \|Y - Xw\|^2_2 + \alpha \|w\|^2_2 \quad (\alpha = 0.01)$$
  - **12 Feature Engineering**: Day of week, Is Weekend, Periode Gajian (tgl 25-5), Rolling 3d/7d, Lag-1/Lag-7, Sin/Cos Day Encoding, Bulan, Indikator Ramadan & Libur Nasional.
  - **Hasil Evaluasi Live**: R-squared Train 0.65-0.80, Test 0.30-0.50, MAE Rp 100rb-150rb/hari.
  - **Alasan Pemilihan**: Menoleransi keterkaitan antar fitur (multicollinearity) dan mencegah overfitting pada data time series UMKM.
- **Placeholder Gambar / Bukti Visual**:
  - `*{Screenshot Tab Forecast Pendapatan dengan Grafik Realita vs Prediksi AI}`
- **Referensi Akademis**:
  - Pedregosa, F., et al. (2011). Scikit-learn: Machine Learning in Python.
- **Naskah Penjelasan (Speaker Notes)**:
  "Modul keempat memprediksi tren pendapatan menggunakan Ridge Regression dengan 12 fitur kalender dan lag penjualan historis. Regularisasi L2 digunakan untuk menjaga kestabilan model dari fluktuasi pendapatan harian UMKM."

---

### SLIDE 10: MODUL ML 5 - KLASIFIKASI PRODUK ABC (PARETO ANALYSIS)

- **Judul Slide**: 09. MODUL MACHINE LEARNING (5/5) - ABC Product Classification (Pareto 80/20)
- **Konten Ringkas**:
  - **Fungsi**: Pengelompokan produk berdasarkan akumulasi kontribusi omzet.
  - **Metodologi & Rumus**:
    $$\text{Kontribusi Kumulatif}_k = \sum_{i=1}^{k} \frac{\text{Revenue}_i}{\text{Total Revenue}} \times 100\%$$
  - **Pembagian Kelas**:
    - *Kelas A (Fast Moving)*: Kumulatif <= 80% revenue (~20% SKU produk). Prioritas utama stok.
    - *Kelas B (Medium Moving)*: Kumulatif 80-95% revenue (~30% SKU produk).
    - *Kelas C (Slow/Dead)*: Kumulatif > 95% revenue (~50% SKU produk). Evaluasi efisiensi display.
  - **Alasan Pemilihan**: Membantu pemilik toko memfokuskan alokasi modal usaha pada 20% produk yang menghasilkan 80% pendapatan.
- **Placeholder Gambar / Bukti Visual**:
  - `*{Screenshot Tab Klasifikasi ABC dengan Pie Chart & Bar Chart Top Revenue}`
- **Referensi Akademis**:
  - Heizer, J., Render, B., & Munson, C. (2017). Operations Management.
- **Naskah Penjelasan (Speaker Notes)**:
  "Modul kelima mengklasifikasikan produk menggunakan Analisis Pareto 80/20. Produk Kelas A yang menyumbang 80% omzet toko diidentifikasi secara otomatis agar pemilik usaha tidak salah memprioritaskan alokasi modal."

---

### SLIDE 11: PENGUJIAN FUNGSIONAL & PERFORMA SERVER

- **Judul Slide**: 10. PENGUJIAN SISTEM - Hasil Black Box Testing & Performa Server
- **Konten Ringkas**:
  - **Black Box Testing**: 20 skenario pengujian fungsional (Login, Registrasi, POS Checkout, FIFO Batch, Void, Diskon, Xendit Payment, 5 Tab ML).
  - **Tingkat Keberhasilan**: 100% (20 dari 20 Skenario Dinyatakan BERHASIL).
  - **Performa Live Server**:
    - Data Sintetis: 13.560 transaksi, 1.942 batch stok, 4 toko UMKM.
    - Response Time REST API: < 350 ms.
- **Placeholder Gambar / Bukti Visual**:
  - `*{Tabel Ringkasan Hasil Pengujian Black Box Testing 20 Skenario}`
- **Naskah Penjelasan (Speaker Notes)**:
  "Seluruh fitur sistem telah diuji menggunakan metode Black Box Testing dengan 20 skenario utama. Hasilnya menunjukkan tingkat keberhasilan 100%, dan sistem terbukti stabil mengolah lebih dari 13 ribu transaksi di server VPS live."

---

### SLIDE 12: KESIMPULAN & SARAN MASA DEPAN

- **Judul Slide**: 11. KESIMPULAN & SARAN - Kesimpulan & Arah Pengembangan
- **Konten Ringkas**:
  - **Kesimpulan**:
    1. Berhasil membangun sistem POS full-stack web multi-tenant (React + Django + PostgreSQL + Xendit API).
    2. Berhasil mengimplementasikan manajemen stok FIFO otomatis berbasis batch.
    3. Berhasil mengintegrasikan 5 modul Machine Learning prediktif yang memberikan rekomendasi operasional secara real-time.
  - **Saran Masa Depan**:
    1. Pengembangan aplikasi mobile native (Android/iOS).
    2. Penggunaan model time-series tingkat lanjut seperti Prophet atau LSTM.
    3. Notifikasi otomatis via WhatsApp / Push Notification.
- **Placeholder Gambar / Bukti Visual**:
  - `*{Tangkapan Layar Dashboard Utama Mercatura POS di Server VPS Rumahweb}`
- **Naskah Penjelasan (Speaker Notes)**:
  "Sebagai kesimpulan, sistem ini telah memenuhi seluruh tujuan penelitian dalam menyediakan POS modern yang terintegrasi dengan kecerdasan buatan. Untuk pengembangan selanjutnya, integrasi mobile native dan model LSTM menjadi rekomendasi utama."

---

### SLIDE 13: PENUTUP & SESI TANYA JAWAB (Q&A)

- **Judul Slide**: 12. PENUTUP - Sesi Tanya Jawab (Q&A)
- **Konten Ringkas**:
  - Ucapan Terima Kasih kepada Dewan Penguji dan Dosen Pembimbing.
  - Live Demo Application URL: `http://202.155.16.135`
  - Keterbukaan untuk Diskusi dan Masukan.
- **Placeholder Gambar / Bukti Visual**:
  - `*{Slide Penutup dengan QR Code Link Live Demo Server}`
- **Naskah Penjelasan (Speaker Notes)**:
  "Sekian presentasi Tugas Akhir saya. Terima kasih atas perhatian Bapak/Ibu Dosen Penguji. Saya persilakan jika ada masukan, tanggapan, atau pertanyaan."
