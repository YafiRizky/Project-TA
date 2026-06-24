import MainLayout from '../components/MainLayout'
import FeaturePlaceholder from '../components/FeaturePlaceholder'
import { RiRobot2Line, RiStockLine, RiAlertLine, RiLightbulbLine } from 'react-icons/ri'

export default function MLPredictionsPage() {
  return (
    <MainLayout title="Prediksi ML">
      <div className="mb-5">
        <h2 className="text-gray-800 font-bold text-lg">Machine Learning & Prediksi</h2>
        <p className="text-gray-400 text-sm">Analisis berbasis AI untuk optimasi bisnis</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FeaturePlaceholder
          icon={RiRobot2Line}
          title="Demand Forecasting"
          description="Prediksi permintaan produk berdasarkan data historis penjualan menggunakan model ML."
        />
        <FeaturePlaceholder
          icon={RiStockLine}
          title="Optimasi Stok"
          description="Rekomendasi jumlah stok optimal untuk meminimalkan biaya penyimpanan dan mencegah stockout."
        />
        <FeaturePlaceholder
          icon={RiAlertLine}
          title="Deteksi Anomali"
          description="Identifikasi pola penjualan tidak biasa dan potensi kecurangan secara otomatis."
        />
        <FeaturePlaceholder
          icon={RiLightbulbLine}
          title="Rekomendasi Produk"
          description="Saran produk untuk dipromosikan atau dihentikan berdasarkan performa dan tren pasar."
        />
      </div>
    </MainLayout>
  )
}
