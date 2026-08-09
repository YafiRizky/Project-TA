import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import MainLayout from '../components/MainLayout'
import { transactionsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { RiMoneyDollarCircleLine, RiShoppingCartLine, RiArchiveLine, RiLineChartLine, RiFileExcel2Line, RiFilePdfLine, RiDownload2Line, RiBarChartBoxLine } from 'react-icons/ri'
import { fmt } from '../utils/formatCurrency'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']

export default function ReportsPage() {
  const { business } = useAuth()
  const bCode = business?.code
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [rangeDays, setRangeDays] = useState(7)

  // Preset range handler
  const applyRange = (days) => {
    setRangeDays(days)
    const end = new Date()
    const endStr = end.toISOString().split('T')[0]
    setEndDate(endStr)
    if (days === 0) {
      setStartDate('')
    } else {
      const start = new Date()
      start.setDate(start.getDate() - (days - 1))
      setStartDate(start.toISOString().split('T')[0])
    }
  }

  const { data: dailyData, isLoading: loadingDaily } = useQuery({
    queryKey: ['daily-summary', bCode],
    queryFn: transactionsAPI.getDailySummary,
  })

  const { data: paymentData, isLoading: loadingPayment } = useQuery({
    queryKey: ['payment-summary', bCode],
    queryFn: transactionsAPI.getPaymentSummary,
  })

  const { data: transData, isLoading: loadingTrans } = useQuery({
    queryKey: ['transactions-report', bCode, startDate, endDate],
    queryFn: () => transactionsAPI.getTransactions({ 
      page_size: 1000,
      start_date: startDate || undefined,
      end_date: endDate || undefined
    }),
    placeholderData: (previousData) => previousData,
  })

  // Only show initial full-page spinner if there is no data loaded yet at all
  const isInitialLoading = (loadingDaily && !dailyData) || (loadingPayment && !paymentData) || (loadingTrans && !transData)

  // Calculate summary
  const summary = dailyData || {}
  const transactions = transData?.results || transData || []
  const transactionsList = Array.isArray(transactions) ? transactions : []

  const totalRevenue = parseFloat(summary.total_revenue || 0) || transactionsList.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0)
  const totalTransactions = summary.transaction_count || transactionsList.length
  const totalItems = summary.item_count || transactionsList.reduce((sum, t) => sum + (t.items?.length || 0), 0)
  const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  // Estimasi profit: jumlahkan (selling_price - cost_per_unit) * qty per item
  // cost_per_unit bisa dari item.cost_per_unit (jika backend kirim) atau dari item.purchase_cost
  const totalEstimatedCost = transactionsList
    .filter(t => t.status !== 'VOIDED')
    .reduce((sum, t) => {
      return sum + (t.items || []).reduce((s, item) => {
        const cost = parseFloat(item.cost_per_unit || item.purchase_cost || 0)
        return s + cost * (item.quantity || 0)
      }, 0)
    }, 0)
  const totalEstimatedProfit = totalRevenue - totalEstimatedCost
  const profitMarginPct = totalRevenue > 0 ? ((totalEstimatedProfit / totalRevenue) * 100).toFixed(1) : 0
  const hasCostData = totalEstimatedCost > 0

  // Payment method breakdown -- backend returns { payment_methods: { CASH: {amount, count}, ... } }
  const paymentMethodsObj = paymentData?.payment_methods || {}
  const paymentChartData = Object.entries(paymentMethodsObj).map(([method, data]) => ({
    name: method,
    value: parseFloat(data.amount || 0),
    count: data.count || 0,
  }))

  // Build trend chart data from transactions
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const useMonthlyChart = rangeDays >= 90 || rangeDays === 0

  const chartData = (() => {
    if (useMonthlyChart) {
      // Monthly groupby untuk 90 Hari dan Semua — grafik bersih, rapi, mudah di-hover
      const monthMap = new Map()
      transactionsList.forEach(t => {
        const dateKey = t.transaction_date || t.created_at
        if (dateKey) {
          const d = new Date(dateKey)
          const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
          if (!monthMap.has(key)) monthMap.set(key, { name: key, revenue: 0, count: 0 })
          const entry = monthMap.get(key)
          entry.revenue += parseFloat(t.total_amount || 0)
          entry.count += 1
        }
      })
      return Array.from(monthMap.values())
    }

    // Daily view untuk 7 Hari dan 30 Hari
    const days = {}
    let end = endDate ? new Date(endDate) : new Date()
    let start = startDate ? new Date(startDate) : new Date()
    if (!startDate) start.setDate(start.getDate() - 6)

    const toYMD = (d) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const current = new Date(start)
    while (current <= end) {
      const ymd = toYMD(current)
      const label = current.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      days[ymd] = { name: label, revenue: 0, count: 0 }
      current.setDate(current.getDate() + 1)
    }

    transactionsList.forEach(t => {
      const dateKey = t.transaction_date || t.created_at
      if (dateKey) {
        const d = new Date(dateKey)
        const ymd = toYMD(d)
        if (days[ymd]) {
          days[ymd].revenue += parseFloat(t.total_amount || 0)
          days[ymd].count += 1
        }
      }
    })
    return Object.values(days)
  })()

  // Top products from transaction items
  const topProducts = (() => {
    const productMap = {}
    transactionsList.forEach(t => {
      (t.items || []).forEach(item => {
        const name = item.product_name || item.product?.name || `Product ${item.product}`
        if (!productMap[name]) productMap[name] = { name, qty: 0, revenue: 0 }
        productMap[name].qty += item.quantity || 0
        productMap[name].revenue += parseFloat(item.subtotal || 0)
      })
    })
    return Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 5)
  })()

  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')
  const [modalStartDate, setModalStartDate] = useState('')
  const [modalEndDate, setModalEndDate] = useState('')

  // Open Export Modal with initial dates
  const openExportModal = (format) => {
    setExportFormat(format)
    setModalStartDate(startDate || '')
    setModalEndDate(endDate || '')
    setShowExportModal(true)
  }

  // Apply range inside Modal
  const applyModalPreset = (days) => {
    const end = new Date()
    const endStr = end.toISOString().split('T')[0]
    setModalEndDate(endStr)
    if (days === 0) {
      setModalStartDate('')
    } else {
      const start = new Date()
      start.setDate(start.getDate() - (days - 1))
      setModalStartDate(start.toISOString().split('T')[0])
    }
  }

  const handleExport = async () => {
    if (modalStartDate && modalEndDate && modalStartDate > modalEndDate) {
      alert('Tanggal mulai tidak boleh lebih besar dari tanggal selesai!')
      return
    }

    try {
      setIsExporting(true)
      const blob = await transactionsAPI.exportData(exportFormat, modalStartDate, modalEndDate)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      const ext = exportFormat === 'pdf' ? 'pdf' : 'xlsx'
      link.setAttribute('download', `Laporan_Penjualan_${modalStartDate || 'semua'}_sd_${modalEndDate || 'semua'}.${ext}`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      setShowExportModal(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Gagal mengunduh laporan. Pastikan koneksi backend stabil dan coba lagi.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <MainLayout title="Laporan Penjualan">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Laporan Penjualan</h2>
          <p className="text-gray-400 text-sm">Analisis dan laporan data penjualan bisnis</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm text-gray-500 font-medium">Filter Tampilan:</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none" />
            <span className="text-gray-400">-</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => openExportModal('csv')} disabled={isExporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              <RiFileExcel2Line size={16} /> Unduh CSV
            </button>
            <button onClick={() => openExportModal('pdf')} disabled={isExporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              <RiFilePdfLine size={16} /> Unduh PDF
            </button>
          </div>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Memuat data laporan...
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard icon={RiMoneyDollarCircleLine} iconBg="bg-blue-100" iconColor="text-blue-600"
              label="Revenue Hari Ini" value={`Rp ${fmt(totalRevenue)}`} />
            <SummaryCard icon={RiShoppingCartLine} iconBg="bg-green-100" iconColor="text-green-600"
              label="Jumlah Transaksi" value={totalTransactions} />
            <SummaryCard icon={RiArchiveLine} iconBg="bg-amber-100" iconColor="text-amber-600"
              label="Total Item Terjual" value={totalItems} />
            <SummaryCard icon={RiLineChartLine} iconBg="bg-purple-100" iconColor="text-purple-600"
              label="Rata-rata / Transaksi" value={`Rp ${fmt(Math.round(avgTransaction))}`} />
          </div>

          {/* Profit Estimasi Row */}
          {hasCostData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100">
                    <RiMoneyDollarCircleLine size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Total Modal (Est.)</p>
                    <p className="text-xl font-bold text-gray-800">Rp {fmt(Math.round(totalEstimatedCost))}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${totalEstimatedProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    <RiLineChartLine size={20} className={totalEstimatedProfit >= 0 ? 'text-emerald-600' : 'text-red-600'} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Estimasi Profit Bersih</p>
                    <p className={`text-xl font-bold ${totalEstimatedProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Rp {fmt(Math.round(Math.abs(totalEstimatedProfit)))}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${parseFloat(profitMarginPct) >= 10 ? 'bg-emerald-100' : parseFloat(profitMarginPct) >= 0 ? 'bg-amber-100' : 'bg-red-100'}`}>
                    <RiBarChartBoxLine size={20} className={parseFloat(profitMarginPct) >= 10 ? 'text-emerald-600' : parseFloat(profitMarginPct) >= 0 ? 'text-amber-600' : 'text-red-600'} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Margin Keuntungan</p>
                    <p className={`text-xl font-bold ${parseFloat(profitMarginPct) >= 10 ? 'text-emerald-700' : parseFloat(profitMarginPct) >= 0 ? 'text-amber-700' : 'text-red-700'}`}>{profitMarginPct}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    {rangeDays === 7 ? 'Tren Penjualan Harian (7 Hari Terakhir)' :
                     rangeDays === 30 ? 'Tren Penjualan Harian (30 Hari Terakhir)' :
                     rangeDays === 90 ? 'Tren Penjualan Bulanan (90 Hari Terakhir)' :
                     'Tren Penjualan Bulanan (Semua Data)'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {useMonthlyChart
                      ? 'Otomatis mengelompokkan data per bulan agar grafik bersih, rapi, dan mudah di-hover'
                      : 'Tampilan detail per hari (Format Tanggal DD/MM/YYYY)'}
                  </p>
                </div>
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                  {[{ label: '7 Hari', days: 7 }, { label: '30 Hari', days: 30 }, { label: '90 Hari', days: 90 }, { label: 'Semua', days: 0 }].map(p => (
                    <button
                      key={p.days}
                      onClick={() => applyRange(p.days)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        rangeDays === p.days
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              {chartData.some(d => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 15, right: 45, left: 20, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      interval={Math.max(0, Math.floor(chartData.length / 10) - 1)}
                      padding={{ left: 25, right: 25 }}
                      dy={5}
                    />
                    <YAxis
                      width={65}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={v => {
                        if (v >= 1000000) return `${(v/1000000).toFixed(1)}jt`
                        return `${(v/1000).toFixed(0)}rb`
                      }}
                    />
                    <Tooltip formatter={(v) => [`Rp ${fmt(v)}`, 'Revenue']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5}
                      dot={chartData.length <= 31} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
                  Belum ada data penjualan untuk periode ini
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-4">Produk Terlaris</h3>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-400">Rp {fmt(p.revenue)}</p>
                      </div>
                      <span className="text-blue-600 font-bold text-sm">{p.qty} terjual</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
                  Belum ada data produk terjual
                </div>
              )}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-4">Metode Pembayaran</h3>
              {paymentChartData.length > 0 ? (
                <div className="space-y-3">
                  {paymentChartData.map((p, i) => {
                    const total = paymentChartData.reduce((s, x) => s + x.value, 0)
                    const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : 0
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{p.name}</span>
                          <span className="text-xs text-gray-500">{p.count}x - Rp {fmt(p.value)} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-[150px] flex items-center justify-center text-gray-400 text-sm">
                  Belum ada data pembayaran
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-4">Transaksi Terakhir</h3>
              {transactionsList.length > 0 ? (
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {transactionsList.slice(0, 8).map(t => (
                    <div key={t.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                      <div>
                        <p className="font-mono text-blue-600 text-xs font-bold">{t.transaction_code}</p>
                        <p className="text-gray-400 text-xs">{t.cashier_name || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">Rp {fmt(t.total_amount)}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          t.payment_method === 'CASH' ? 'bg-green-100 text-green-700' :
                          t.payment_method === 'QRIS' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>{t.payment_method}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[150px] flex items-center justify-center text-gray-400 text-sm">
                  Belum ada transaksi
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODAL DIALOG UNDUH LAPORAN (PILIH PERIODE TANGGAL) */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${exportFormat === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center shrink-0 font-bold`}>
                  {exportFormat === 'pdf' ? <RiFilePdfLine size={22} /> : <RiFileExcel2Line size={22} />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Unduh Laporan Penjualan ({exportFormat.toUpperCase()})</h3>
                  <p className={`text-xs font-semibold ${exportFormat === 'pdf' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {exportFormat === 'pdf' ? 'Format dokumen cetak resmi (.pdf)' : 'Format spreadsheet Microsoft Excel (.csv)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Preset Buttons */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Preset Tanggal Cepat:</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyModalPreset(1)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-semibold text-gray-600 transition-colors"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => applyModalPreset(7)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-semibold text-gray-600 transition-colors"
                >
                  7 Hari Terakhir
                </button>
                <button
                  type="button"
                  onClick={() => applyModalPreset(30)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-semibold text-gray-600 transition-colors"
                >
                  30 Hari Terakhir
                </button>
                <button
                  type="button"
                  onClick={() => applyModalPreset(0)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-xs font-semibold text-gray-600 transition-colors"
                >
                  Semua Data
                </button>
              </div>
            </div>

            {/* Custom Date Inputs */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Dari Tanggal:</label>
                <input
                  type="date"
                  value={modalStartDate}
                  onChange={(e) => setModalStartDate(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Sampai Tanggal:</label>
                <input
                  type="date"
                  value={modalEndDate}
                  onChange={(e) => setModalEndDate(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Summary Notice */}
            <div className="mb-6 bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
              <p className="font-semibold flex items-center gap-1">
                ℹ️ Periode Ekspor:
              </p>
              <p className="mt-0.5 text-blue-700">
                {modalStartDate || modalEndDate ? (
                  <>Menampilkan data transaksi dari <span className="font-bold">{modalStartDate || 'awal'}</span> sampai <span className="font-bold">{modalEndDate || 'sekarang'}</span>.</>
                ) : (
                  <>Menampilkan seluruh riwayat transaksi tanpa batasan tanggal.</>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 ${
                  exportFormat === 'pdf' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                } disabled:opacity-50`}
              >
                {isExporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <RiDownload2Line size={16} /> Unduh File {exportFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

function SummaryCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div>
          <p className="text-gray-500 text-xs">{label}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  )
}
