import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { transactionsAPI } from '../services/api'
import { useStockAlerts } from '../hooks/useStockAlerts'
import MainLayout from '../components/MainLayout'
import { fmt } from '../utils/formatCurrency'
import {
  RiShoppingBag3Line, RiArchiveLine, RiAlertLine,
  RiArrowRightLine, RiShoppingCartLine, RiBarChartBoxLine,
  RiPlantLine, RiCheckboxCircleLine
} from 'react-icons/ri'

export default function DashboardPage() {
  const { user, business, isAdmin } = useAuth()
  const navigate = useNavigate()
  const isOwner = isAdmin()
  const { lowStockCount, lowStockProducts, productCount, expiringBatchesCount, expiringBatches } = useStockAlerts()

  const { data: dailySummary } = useQuery({
    queryKey: ['daily-summary', business?.code],
    queryFn: () => transactionsAPI.getDailySummary(),
    retry: 1,
  })

  const todayRevenue = parseFloat(dailySummary?.total_revenue || 0)
  const todayTransactions = dailySummary?.transaction_count || 0

  const accentCard = isOwner ? 'bg-blue-600' : 'bg-emerald-600'
  const accentText = isOwner ? 'text-blue-600' : 'text-emerald-600'
  const accentBorder = isOwner ? 'border-blue-100' : 'border-emerald-100'
  const accentBg = isOwner ? 'bg-blue-50' : 'bg-emerald-50'

  const ownerActions = [
    { label: 'Kelola Produk', path: '/products', icon: RiShoppingBag3Line, desc: 'Tambah & edit produk' },
    { label: 'Cek Inventori', path: '/inventory', icon: RiArchiveLine, desc: 'Kelola stok batch' },
    { label: 'Transaksi', path: '/transactions', icon: RiShoppingCartLine, desc: 'Riwayat penjualan' },
    { label: 'Laporan', path: '/reports', icon: RiBarChartBoxLine, desc: 'Analisis penjualan' },
  ]

  const kasirActions = [
    { label: 'Buat Transaksi', path: '/pos', icon: RiShoppingCartLine, desc: 'POS kasir' },
  ]

  const actions = isOwner ? ownerActions : kasirActions

  // Onboarding: tampil jika admin dan belum ada produk
  const showOnboarding = isOwner && productCount === 0

  const onboardingSteps = [
    { step: 1, label: 'Tambah Kategori', desc: 'Kelompokkan produk Anda', path: '/categories', done: false },
    { step: 2, label: 'Tambah Produk', desc: 'Daftarkan produk yang dijual', path: '/products', done: false },
    { step: 3, label: 'Restock Batch', desc: 'Masukkan stok awal ke inventori', path: '/inventory', done: false },
  ]

  return (
    <MainLayout title="Dashboard">
      {/* Onboarding Card — bisnis baru */}
      {showOnboarding && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <RiPlantLine size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Selamat Datang di Sistem POS!</h3>
              <p className="text-blue-100 text-xs">Ikuti 3 langkah ini untuk mulai berjualan</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {onboardingSteps.map(({ step, label, desc, path }) => (
              <button
                key={step}
                onClick={() => navigate(path)}
                className="flex items-center gap-3 bg-white/15 hover:bg-white/25 rounded-xl p-3 text-left transition-colors group"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:bg-white/30">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-blue-100 text-xs">{desc}</p>
                </div>
                <RiArrowRightLine size={14} className="ml-auto text-white/70" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-gray-800 font-bold text-xl">
          Selamat datang, {user?.full_name || user?.username}
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">
          {business?.name} &bull; {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-4 mb-6 ${isOwner ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
        {isOwner && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center shrink-0`}>
                  <RiShoppingBag3Line size={20} className={accentText} />
                </div>
                <span className="text-xs text-gray-400 font-medium">Produk</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{productCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total produk aktif</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  <RiAlertLine size={20} className="text-amber-600" />
                </div>
                <span className="text-xs text-gray-400 font-medium">Stok</span>
              </div>
              <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-gray-800'}`}>{lowStockCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">Stok perlu diisi</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <RiShoppingCartLine size={20} className="text-green-600" />
                </div>
                <span className="text-xs text-gray-400 font-medium">Hari Ini</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{todayTransactions}</p>
              <p className="text-xs text-gray-500 mt-0.5">Transaksi hari ini</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center shrink-0`}>
                  <RiBarChartBoxLine size={20} className={accentText} />
                </div>
                <span className="text-xs text-gray-400 font-medium">Revenue</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                Rp {fmt(todayRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Revenue hari ini</p>
            </div>
          </>
        )}

        {!isOwner && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <RiAlertLine size={20} className="text-amber-600" />
                </div>
                <span className="text-xs text-gray-400 font-medium">Stok</span>
              </div>
              <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-gray-800'}`}>{lowStockCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">Produk stok rendah</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <RiShoppingCartLine size={20} className="text-green-600" />
                </div>
                <span className="text-xs text-gray-400 font-medium">Hari Ini</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{todayTransactions}</p>
              <p className="text-xs text-gray-500 mt-0.5">Transaksi hari ini</p>
            </div>
          </>
        )}
      </div>

      {/* Low stock alert — admin & kasir */}
      {lowStockCount > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <RiAlertLine size={18} className="text-amber-600 shrink-0" />
            <p className="text-amber-700 text-sm font-medium flex-1">
              {lowStockCount} produk membutuhkan pengisian stok segera.
            </p>
            {isOwner && (
              <button
                onClick={() => navigate('/inventory')}
                className="text-amber-700 text-xs font-semibold hover:text-amber-900 flex items-center gap-1 shrink-0"
              >
                Lihat <RiArrowRightLine size={13} />
              </button>
            )}
            {!isOwner && (
              <span className="text-amber-600 text-xs font-medium shrink-0">Hubungi admin untuk pengisian</span>
            )}
          </div>

          {/* Individual low stock items for admin — clickable to inventory auto-edit */}
          {isOwner && lowStockProducts.slice(0, 5).map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/inventory?highlight=${p.id}&autoEdit=true`)}
              className="w-full flex items-center justify-between px-4 py-2 border-t border-amber-100 hover:bg-amber-100/50 transition-colors text-left"
            >
              <div>
                <span className="text-sm text-gray-800 font-medium">{p.name}</span>
                <span className="text-xs text-gray-500 ml-2">{p.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stockStatus === 'HABIS' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {p.stockStatus === 'HABIS' ? 'Habis' : `Sisa ${p.currentStock}`}
                </span>
                <RiArrowRightLine size={13} className="text-amber-500" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Expiring batch alert — admin & kasir */}
      {expiringBatchesCount > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <RiAlertLine size={18} className="text-red-600 shrink-0" />
            <p className="text-red-700 text-sm font-medium flex-1">
              {expiringBatchesCount} batch produk akan atau telah kadaluarsa.
            </p>
            {isOwner && (
              <button
                onClick={() => navigate('/inventory')}
                className="text-red-700 text-xs font-semibold hover:text-red-900 flex items-center gap-1 shrink-0"
              >
                Lihat <RiArrowRightLine size={13} />
              </button>
            )}
            {!isOwner && (
              <span className="text-red-600 text-xs font-medium shrink-0">Beri tahu admin segera</span>
            )}
          </div>

          {/* Individual expiring items for admin */}
          {isOwner && expiringBatches.slice(0, 5).map((b) => (
            <button
              key={`exp-${b.id}`}
              onClick={() => navigate(`/inventory?highlight=${b.product_id || b.product}`)}
              className="w-full flex items-center justify-between px-4 py-2 border-t border-red-100 hover:bg-red-100/50 transition-colors text-left"
            >
              <div>
                <span className="text-sm text-gray-800 font-medium">{b.productName}</span>
                <span className="text-xs text-gray-400 ml-2">
                  Exp: {b.expiry_date ? new Date(b.expiry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '–'}
                  {' '}· Sisa {b.quantity} item
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.expStatus === 'KADALUARSA' ? 'bg-red-200 text-red-800' : 'bg-orange-100 text-orange-700'}`}>
                  {b.expStatus === 'KADALUARSA' ? 'Kadaluarsa' : `${b.daysLeft} Hari Lagi`}
                </span>
                <RiArrowRightLine size={13} className="text-red-500" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-gray-700 font-semibold text-sm mb-3">Aksi Cepat</h3>
        <div className={`grid gap-3 ${isOwner ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`flex items-center gap-3 p-4 bg-white rounded-2xl border ${accentBorder} hover:border-current hover:shadow-sm transition-all group text-left`}
              >
                <div className={`w-10 h-10 ${accentBg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon size={20} className={accentText} />
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-sm">{action.label}</p>
                  <p className="text-gray-400 text-xs">{action.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}
