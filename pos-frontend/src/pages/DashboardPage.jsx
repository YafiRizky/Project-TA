import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useQuery, useMutation } from '@tanstack/react-query'
import { transactionsAPI, notificationsAPI } from '../services/api'
import { useStockAlerts } from '../hooks/useStockAlerts'
import MainLayout from '../components/MainLayout'
import Pagination from '../components/Pagination'
import { fmt } from '../utils/formatCurrency'
import {
  RiShoppingBag3Line, RiArchiveLine, RiAlertLine,
  RiArrowRightLine, RiShoppingCartLine, RiBarChartBoxLine,
  RiPlantLine, RiCheckboxCircleLine, RiAlarmWarningLine,
  RiSendPlaneFill, RiCheckLine
} from 'react-icons/ri'

export default function DashboardPage() {
  const { user, business, isAdmin } = useAuth()
  const navigate = useNavigate()
  const isOwner = isAdmin()
  const [currentPage, setCurrentPage] = useState(1)
  const [sentNotifIds, setSentNotifIds] = useState([])
  const pageSize = 5

  const {
    unreadLowStockProducts,
    unreadExpiringBatches,
    totalUnreadCount,
    markAlertAsRead,
    markAllAlertsAsRead,
    productCount
  } = useStockAlerts()

  const { data: dailySummary } = useQuery({
    queryKey: ['daily-summary', business?.code],
    queryFn: () => transactionsAPI.getDailySummary(),
    retry: 1,
  })

  const sendNotifMutation = useMutation({
    mutationFn: notificationsAPI.createNotification,
    onSuccess: () => {},
  })

  const handleSendNotifToAdmin = (item) => {
    setSentNotifIds(prev => [...prev, item.alertId])
    sendNotifMutation.mutate({
      product_id: item.id || item.product_id || item.product,
      notif_type: item.currentStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      message: `${item.name || item.productName} - Stok: ${item.currentStock || item.quantity}`,
    })
  }

  // Combine low stock & expiring into a single unread alerts list
  const unreadAlertsList = [
    ...unreadLowStockProducts.map(p => ({
      alertId: p.alertId,
      id: p.id,
      name: p.name,
      code: p.code,
      category: p.category || 'Sembako',
      stock: p.currentStock,
      unit: p.unit,
      expDate: '–',
      statusLabel: p.stockStatus === 'HABIS' ? 'STOK HABIS' : 'STOK RENDAH',
      badgeClass: p.stockStatus === 'HABIS' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
      type: 'low'
    })),
    ...unreadExpiringBatches.map(b => ({
      alertId: b.alertId,
      id: b.product_id || b.product,
      name: b.productName,
      code: b.batch_code || 'BATCH',
      category: b.category || 'Makanan Instan',
      stock: b.quantity,
      unit: 'item',
      expDate: b.expiry_date ? new Date(b.expiry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '–',
      statusLabel: b.expStatus === 'KADALUARSA' ? 'KADALUARSA' : `${b.daysLeft} HARI LAGI`,
      badgeClass: b.expStatus === 'KADALUARSA' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700',
      type: 'exp'
    }))
  ]

  const totalPages = Math.ceil(unreadAlertsList.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const pageItems = unreadAlertsList.slice(startIndex, startIndex + pageSize)

  const todayRevenue = parseFloat(dailySummary?.total_revenue || 0)
  const todayTransactions = dailySummary?.transaction_count || 0

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
        <p class="text-gray-500 text-sm mt-0.5">
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
                <span className="text-xs text-gray-400 font-medium">Belum Dibaca</span>
              </div>
              <p className={`text-2xl font-bold ${totalUnreadCount > 0 ? 'text-amber-600' : 'text-gray-800'}`}>{totalUnreadCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">Laporan butuh perhatian</p>
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
                <span className="text-xs text-gray-400 font-medium">Belum Dibaca</span>
              </div>
              <p className={`text-2xl font-bold ${totalUnreadCount > 0 ? 'text-amber-600' : 'text-gray-800'}`}>{totalUnreadCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">Produk perlu perhatian</p>
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

      {/* STREAMLINED UNREAD ALERTS TABLE */}
      <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${isOwner ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center shrink-0`}>
              <RiAlarmWarningLine size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                Peringatan Stok & Kadaluarsa Aktif
                <span className={`text-xs font-bold ${isOwner ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'} px-2.5 py-0.5 rounded-full`}>
                  {unreadAlertsList.length} Belum Dibaca
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Menampilkan laporan yang belum dibaca. Laporan yang sudah dibaca otomatis hilang dari dashboard ini.
              </p>
            </div>
          </div>

          {unreadAlertsList.length > 0 && (
            <button
              onClick={() => markAllAlertsAsRead()}
              className={`px-4 py-2 rounded-xl ${isOwner ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'} text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0`}
            >
              <RiCheckboxCircleLine size={16} /> Tandai Semua Sudah Dibaca
            </button>
          )}
        </div>

        {/* Table Content */}
        {unreadAlertsList.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead class="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Produk & Batch</th>
                    <th className="px-5 py-3.5 font-bold">Kategori</th>
                    <th className="px-5 py-3.5 font-bold">Sisa Stok</th>
                    <th className="px-5 py-3.5 font-bold">Tanggal Kadaluarsa</th>
                    <th className="px-5 py-3.5 font-bold">Status Peringatan</th>
                    <th className="px-5 py-3.5 font-bold text-right">{isOwner ? 'Aksi' : 'Aksi Kasir'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((item) => (
                    <tr key={item.alertId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.code}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">
                        <span className="bg-gray-100 px-2 py-1 rounded-md">{item.category}</span>
                      </td>
                      <td className={`px-5 py-3.5 font-bold ${item.stock === 0 ? 'text-red-600' : 'text-gray-800'}`}>
                        {item.stock} {item.unit}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600">
                        {item.expDate}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${item.badgeClass}`}>
                          {item.statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isOwner && (
                            sentNotifIds.includes(item.alertId) ? (
                              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg inline-flex items-center gap-1">
                                <RiCheckboxCircleLine size={14} /> Terkirim
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSendNotifToAdmin(item)}
                                className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg inline-flex items-center gap-1 transition-colors"
                              >
                                <RiSendPlaneFill size={13} /> Kirim Notif
                              </button>
                            )
                          )}
                          <button
                            onClick={() => markAlertAsRead(item.alertId)}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-slate-800 hover:text-white text-gray-700 text-xs font-semibold transition-all flex items-center gap-1"
                          >
                            <RiCheckLine size={14} /> Tandai Dibaca
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => navigate(`/inventory?highlight=${item.id}&autoEdit=true`)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
                            >
                              Kelola Stok <RiArrowRightLine size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Standardized Pagination Footer */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                <p className="text-xs text-gray-500">
                  Menampilkan <span className="font-bold text-gray-800">{startIndex + 1}</span> - <span className="font-bold text-gray-800">{Math.min(startIndex + pageSize, unreadAlertsList.length)}</span> dari <span className="font-bold text-gray-800">{unreadAlertsList.length}</span> data
                </p>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
            )}
          </>
        ) : (
          /* All-Clear Empty State */
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <RiCheckboxCircleLine size={32} />
            </div>
            <h3 className="font-bold text-gray-800 text-base mb-1">Semua Peringatan Sudah Dibaca</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
              {isOwner
                ? 'Tidak ada laporan baru yang perlu diperhatikan saat ini. Riwayat lengkap stok batch tetap dapat dilihat melalui menu Stok Batch.'
                : 'Semua laporan stok aktif telah ditinjau kasir. Peringatan baru akan muncul otomatis jika ada produk baru yang mendekati kadaluarsa.'}
            </p>
            {isOwner && (
              <button
                onClick={() => navigate('/inventory')}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Buka Menu Stok Batch <RiArrowRightLine size={14} />
              </button>
            )}
          </div>
        )}
      </div>

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

