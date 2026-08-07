import { useState } from 'react'
import Pagination from '../components/Pagination'
import { usePageSize } from '../hooks/usePageSize'
import { useQuery } from '@tanstack/react-query'
import MainLayout from '../components/MainLayout'
import { mlAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { fmt } from '../utils/formatCurrency'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, Area, AreaChart, ComposedChart,
} from 'recharts'
import {
  RiBrainLine, RiLineChartLine, RiPieChartLine, RiTimeLine,
  RiShoppingCartLine, RiAlertLine, RiArrowUpLine, RiArrowDownLine,
  RiRefreshLine, RiTruckLine, RiShieldCheckLine, RiFireLine,
  RiErrorWarningLine, RiCheckboxCircleLine, RiBarChartBoxLine,
} from 'react-icons/ri'

const TABS = [
  { key: 'forecast', label: 'Forecast Pendapatan', icon: RiLineChartLine },
  { key: 'classification', label: 'Klasifikasi Produk', icon: RiPieChartLine },
  { key: 'stockout', label: 'Prediksi Stok Habis', icon: RiTimeLine },
  { key: 'restock', label: 'Rekomendasi Restock', icon: RiShoppingCartLine },
  { key: 'expiry', label: 'Risiko Expired', icon: RiAlertLine },
]

const ABC_COLORS = { A: '#10b981', B: '#f59e0b', C: '#ef4444' }
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444']
const RISK_COLORS = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#10b981' }
const URGENCY_COLORS = { URGENT: '#ef4444', SOON: '#f59e0b', OK: '#10b981' }
const MONTH_NAMES_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default function MLPredictionsPage() {
  const { business } = useAuth()
  const [activeTab, setActiveTab] = useState('forecast')
  const [forecastDays, setForecastDays] = useState(30)
  const [classDays, setClassDays] = useState(90)

  // Queries
  // Queries
  const { data: forecastData, isLoading: loadingForecast, refetch: refetchForecast } = useQuery({
    queryKey: ['ml-forecast', business?.code],
    queryFn: () => mlAPI.getRevenueForecast(180, 3650),
    enabled: activeTab === 'forecast',
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })

  const { data: classData, isLoading: loadingClass, refetch: refetchClass } = useQuery({
    queryKey: ['ml-classification', business?.code, classDays],
    queryFn: () => mlAPI.getProductClassification(classDays),
    enabled: activeTab === 'classification',
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })

  const { data: stockoutData, isLoading: loadingStockout, refetch: refetchStockout } = useQuery({
    queryKey: ['ml-stockout', business?.code],
    queryFn: mlAPI.getStockoutPrediction,
    enabled: activeTab === 'stockout',
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })

  const { data: restockData, isLoading: loadingRestock, refetch: refetchRestock } = useQuery({
    queryKey: ['ml-restock', business?.code],
    queryFn: () => mlAPI.getRestockRecommendation(3),
    enabled: activeTab === 'restock',
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })

  const { data: expiryData, isLoading: loadingExpiry, refetch: refetchExpiry } = useQuery({
    queryKey: ['ml-expiry', business?.code],
    queryFn: mlAPI.getExpiryRisk,
    enabled: activeTab === 'expiry',
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })

  const refetchMap = {
    forecast: refetchForecast,
    classification: refetchClass,
    stockout: refetchStockout,
    restock: refetchRestock,
    expiry: refetchExpiry,
  }

  // Only show full spinner on initial data load (when there's no data yet)
  const isInitialLoading = {
    forecast: loadingForecast && !forecastData,
    classification: loadingClass && !classData,
    stockout: loadingStockout && !stockoutData,
    restock: loadingRestock && !restockData,
    expiry: loadingExpiry && !expiryData,
  }[activeTab]

  return (
    <MainLayout title="ML Predictions">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <RiBrainLine className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Machine Learning & Prediksi</h2>
              <p className="text-gray-400 text-sm">Analisis cerdas berbasis AI untuk optimasi bisnis</p>
            </div>
          </div>
          <button
            onClick={() => refetchMap[activeTab]?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <RiRefreshLine size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {isInitialLoading ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium">Memproses data dengan AI...</p>
          <p className="text-xs mt-1">Menganalisis ribuan transaksi dengan Machine Learning</p>
        </div>
      ) : (
        <>
          {activeTab === 'forecast' && <ForecastTab data={forecastData} forecastDays={forecastDays} setForecastDays={setForecastDays} />}
          {activeTab === 'classification' && <ClassificationTab data={classData} classDays={classDays} setClassDays={setClassDays} />}
          {activeTab === 'stockout' && <StockoutTab data={stockoutData} />}
          {activeTab === 'restock' && <RestockTab data={restockData} />}
          {activeTab === 'expiry' && <ExpiryTab data={expiryData} />}
        </>
      )}
    </MainLayout>
  )
}

const FORECAST_PERIODS = [
  { label: '7 Hari', days: 7 },
  { label: '30 Hari', days: 30 },
  { label: '1 Tahun', days: 365 },
  { label: 'Semua', days: 0 },
]

function ForecastTab({ data, forecastDays, setForecastDays }) {
  const [showActual, setShowActual] = useState(true)
  const [showPredicted, setShowPredicted] = useState(true)

  if (!data?.metrics) return <EmptyState text="Tidak ada data forecast" />

  const m = data.metrics
  const isUp = m.trend === 'UP'
  const isDown = m.trend === 'DOWN'

  const hist = data.historical || []
  const fore = data.forecast || []

  // Determine slice mode based on selected preset
  const isMonthly = forecastDays === 365 || forecastDays === 0

  let histSlice, foreSlice
  if (forecastDays === 7) {
    // 7 Hari (Match demo 1:1): 7 hari lampau + 7 hari prediksi ke depan
    histSlice = hist.slice(-7)
    foreSlice = fore.slice(0, 7)
  } else if (forecastDays === 30) {
    // 30 Hari (Match demo 1:1): 30 hari lampau + 14 hari prediksi ke depan
    histSlice = hist.slice(-30)
    foreSlice = fore.slice(0, 14)
  } else if (forecastDays === 365) {
    // 1 Tahun: 365 hari terakhir historical + 6 bulan prediksi, BULANAN
    histSlice = hist.slice(-365)
    foreSlice = fore.slice(0, 180)
  } else {
    // Semua: SEMUA historical dari awal + 6 bulan prediksi, BULANAN
    histSlice = hist
    foreSlice = fore.slice(0, 180)
  }

  // Helper: format date YYYY-MM-DD to DD/MM/YYYY
  const fmtDate = (dateStr) => {
    if (dateStr && dateStr.includes('-')) {
      const parts = dateStr.split('T')[0].split('-')
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }

  // Build chart data
  let chartData = []

  if (isMonthly) {
    // Monthly groupby untuk 1 Tahun & Semua
    const monthMap = new Map()

    histSlice.forEach(h => {
      const d = new Date(h.date)
      const key = `${MONTH_NAMES_ID[d.getMonth()]} ${d.getFullYear()}`
      if (!monthMap.has(key)) monthMap.set(key, { actualSum: 0, predSum: 0, hasActual: false })
      const entry = monthMap.get(key)
      entry.actualSum += h.revenue || 0
      entry.predSum += (h.predicted_revenue !== undefined ? h.predicted_revenue : h.revenue) || 0
      entry.hasActual = true
    })

    foreSlice.forEach(f => {
      const d = new Date(f.date.split('T')[0])
      const key = `${MONTH_NAMES_ID[d.getMonth()]} ${d.getFullYear()}`
      if (!monthMap.has(key)) monthMap.set(key, { actualSum: 0, predSum: 0, hasActual: false })
      const entry = monthMap.get(key)
      entry.predSum += f.predicted_revenue || 0
    })

    chartData = Array.from(monthMap.entries()).map(([key, val]) => ({
      date: key,
      actual: val.hasActual ? val.actualSum : null,
      predicted: val.predSum,
    }))
  } else {
    // Daily view untuk 7 Hari & 30 Hari
    histSlice.forEach(h => {
      chartData.push({
        date: fmtDate(h.date),
        rawDate: h.date,
        actual: h.revenue,
        predicted: h.predicted_revenue !== undefined ? h.predicted_revenue : h.revenue,
      })
    })

    foreSlice.forEach(f => {
      chartData.push({
        date: fmtDate(f.date),
        rawDate: f.date,
        predicted: f.predicted_revenue,
      })
    })
  }

  // Custom Dark Tooltip (Steam Market Style)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const actualItem = payload.find(p => p.dataKey === 'actual')
      const predictedItem = payload.find(p => p.dataKey === 'predicted')
      const actual = actualItem?.value
      const predicted = predictedItem?.value

      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 min-w-[210px]">
          <p className="font-bold text-slate-300 border-b border-slate-700 pb-1">Tanggal: {label}</p>
          {actual !== undefined && actual !== null && (
            <div className="flex items-center justify-between gap-4 text-sky-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>Realita (Aktual):</span>
              <span className="font-bold">Rp {fmt(Math.round(actual))}</span>
            </div>
          )}
          {predicted !== undefined && predicted !== null && (
            <div className="flex items-center justify-between gap-4 text-amber-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>Prediksi AI:</span>
              <span className="font-bold">Rp {fmt(Math.round(predicted))}</span>
            </div>
          )}
          {actual !== undefined && actual !== null && predicted !== undefined && predicted !== null && (
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-emerald-400 font-medium text-[11px]">
              <span>Selisih Presisi:</span>
              <span>Rp {fmt(Math.round(Math.abs(actual - predicted)))}</span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const renderLegend = () => {
    const items = [
      { key: 'actual', label: 'Revenue Realita (Aktual)', color: '#6366f1', active: showActual },
      { key: 'predicted', label: 'Prediksi ML (Model Ridge)', color: '#f59e0b', active: showPredicted },
    ]
    return (
      <div className="flex items-center justify-center gap-6 mt-3">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => {
              if (item.key === 'actual') setShowActual(p => !p)
              if (item.key === 'predicted') setShowPredicted(p => !p)
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              item.active
                ? 'bg-white shadow-sm border border-gray-200 text-gray-800'
                : 'bg-gray-100 text-gray-400 line-through'
            }`}
          >
            <span
              className="inline-block w-5 h-1 rounded-full"
              style={{ backgroundColor: item.active ? item.color : '#d1d5db' }}
            />
            {item.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Revenue Bulan Ini" value={`Rp ${fmt(Math.round(m.current_monthly_revenue))}`} icon={RiBarChartBoxLine} color="blue" />
        <MetricCard label="Prediksi Bulan Depan" value={`Rp ${fmt(Math.round(m.predicted_monthly_revenue))}`} icon={RiLineChartLine} color="indigo" badge={`${m.growth_percentage > 0 ? '+' : ''}${m.growth_percentage}%`} badgeColor={isUp ? 'green' : isDown ? 'red' : 'gray'} />
        <MetricCard label="Rata-rata Harian" value={`Rp ${fmt(Math.round(m.avg_daily_revenue))}`} icon={RiLineChartLine} color="purple" />
        <MetricCard label="Akurasi Model (R²)" value={`${(m.r_squared * 100).toFixed(1)}%`} icon={RiBrainLine} color="emerald" subtitle={`Test R²: ${((m.r_squared_test || 0) * 100).toFixed(1)}%`} />
      </div>

      {/* Validation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center"><p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">MAE</p><p className="text-xl font-bold text-gray-800">Rp {fmt(Math.round(m.mae || 0))}</p></div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center"><p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">RMSE</p><p className="text-xl font-bold text-gray-800">Rp {fmt(Math.round(m.rmse || 0))}</p></div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center"><p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Train / Test</p><p className="text-xl font-bold text-gray-800">{m.train_size || 0} / {m.test_size || 0}</p></div>
      </div>

      {/* Trend Badge */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${isUp ? 'bg-emerald-50 border border-emerald-200' : isDown ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
        {isUp ? <RiArrowUpLine className="text-emerald-600" size={20} /> : isDown ? <RiArrowDownLine className="text-red-600" size={20} /> : <RiLineChartLine className="text-gray-600" size={20} />}
        <span className={`font-medium text-sm ${isUp ? 'text-emerald-700' : isDown ? 'text-red-700' : 'text-gray-700'}`}>
          {isUp ? 'Tren NAIK' : isDown ? 'Tren TURUN' : 'Tren STABIL'} — Model Ridge Regression memprediksi pertumbuhan {m.growth_percentage}% bulan depan.
        </span>
      </div>

      {/* Chart Box */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-800">Grafik Revenue: Realita vs Prediksi AI</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {forecastDays === 7 ? 'Tampilan 7 Hari Lampau (Realita + Prediksi) & 7 Hari Depan (Prediksi Proyeksi)' :
               forecastDays === 30 ? 'Tampilan 30 Hari Lampau (Realita + Prediksi) & 14 Hari Depan (Prediksi Proyeksi)' :
               forecastDays === 365 ? 'Tampilan Aggregasi Bulanan (1 Tahun) agar grafik bersih, rapi, dan mudah di-hover' :
               'Tampilan Aggregasi Bulanan (Semua Data)'}
            </p>
          </div>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {FORECAST_PERIODS.map(p => (
              <button key={p.days} onClick={() => setForecastDays(p.days)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${forecastDays === p.days ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white'}`}>{p.label}</button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={chartData} margin={{ top: 15, right: 45, left: 20, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              interval={Math.max(0, Math.floor(chartData.length / 10) - 1)}
              padding={{ left: 25, right: 25 }}
              dy={5}
            />
            <YAxis
              width={65}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={v => {
                if (v >= 1000000) return `${(v / 1000000).toFixed(1)}jt`
                return `${(v / 1000).toFixed(0)}rb`
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Garis Prediksi AI (SOLID LINE) */}
            {showPredicted && (
              <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="predicted" connectNulls={false} />
            )}
            {/* Garis Realita (SOLID LINE) */}
            {showActual && (
              <Area type="monotone" dataKey="actual" fill="rgba(99, 102, 241, 0.08)" stroke="#6366f1" strokeWidth={2.5} name="actual" connectNulls={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        {renderLegend()}
      </div>
    </div>
  )
}

const CLASS_PERIODS = [
  { label: '30 Hari', days: 30 },
  { label: '90 Hari', days: 90 },
  { label: '180 Hari', days: 180 },
  { label: '1 Tahun', days: 365 },
]

function ClassificationTab({ data, classDays, setClassDays }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = usePageSize('ml_abc', 10)

  if (!data?.summary) return <EmptyState text="Tidak ada data klasifikasi" />

  const s = data.summary
  const products = data.products || []

  const pieData = [
    { name: 'Kelas A (Fast Moving)', value: s.class_a_count, pct: s.class_a_revenue_pct },
    { name: 'Kelas B (Medium)', value: s.class_b_count, pct: s.class_b_revenue_pct },
    { name: 'Kelas C (Slow/Dead)', value: s.class_c_count, pct: s.class_c_revenue_pct },
  ]

  // Pagination for product table
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize))
  const safePageNum = Math.min(currentPage, totalPages)
  const pagedProducts = products.slice((safePageNum - 1) * pageSize, safePageNum * pageSize)

  // Custom Y-axis tick for bar chart: truncated name + classification badge
  const CustomBarTick = ({ x, y, payload }) => {
    const product = products.find(p => p.product_name === payload.value)
    const truncated = payload.value.length > 15 ? payload.value.slice(0, 15) + '...' : payload.value
    const cls = product?.classification || 'C'
    const clsColor = cls === 'A' ? '#10b981' : cls === 'B' ? '#f59e0b' : '#ef4444'
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={-8} y={0} dy={4} textAnchor="end" fill="#374151" fontSize={11}>
          {truncated}
        </text>
        <rect x={-x + 4} y={-7} width={14} height={14} rx={3} fill={`${clsColor}20`} />
        <text x={-x + 11} y={4} textAnchor="middle" fill={clsColor} fontSize={9} fontWeight="bold">
          {cls}
        </text>
      </g>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-800">Klasifikasi ABC (Pareto)</h3>
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {CLASS_PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setClassDays(p.days)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                classDays === p.days
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200">
          <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wide">Kelas A -- Fast Moving</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{s.class_a_count} <span className="text-base font-normal">produk</span></p>
          <p className="text-emerald-600 text-sm mt-1">Kontribusi {s.class_a_revenue_pct}% revenue</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-200">
          <p className="text-amber-600 text-xs font-semibold uppercase tracking-wide">Kelas B -- Medium</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{s.class_b_count} <span className="text-base font-normal">produk</span></p>
          <p className="text-amber-600 text-sm mt-1">Kontribusi {s.class_b_revenue_pct}% revenue</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border border-red-200">
          <p className="text-red-600 text-xs font-semibold uppercase tracking-wide">Kelas C -- Slow/Dead</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{s.class_c_count} <span className="text-base font-normal">produk</span></p>
          <p className="text-red-600 text-sm mt-1">Kontribusi {s.class_c_revenue_pct}% revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-4">Distribusi ABC</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v, name) => [`${v} produk`, name]} />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-4">Top 10 Produk by Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={products.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}rb`} />
              <YAxis type="category" dataKey="product_name" tick={<CustomBarTick />} width={140} />
              <Tooltip formatter={v => `Rp ${fmt(Math.round(v))}`} />
              <Bar dataKey="total_revenue" name="Revenue" radius={[0, 6, 6, 0]}>
                {products.slice(0, 10).map((p, i) => (
                  <Cell key={i} fill={ABC_COLORS[p.classification]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Detail Semua Produk ({s.total_products_analyzed} produk, periode {s.period_days} hari)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Produk</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Revenue</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Profit</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Qty</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">% Revenue</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Kelas</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Trend 30d</th>
              </tr>
            </thead>
            <tbody>
              {pagedProducts.map((p, i) => (
                <tr key={p.product_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 text-gray-400">{(safePageNum - 1) * pageSize + i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{p.product_name}</td>
                  <td className="px-4 py-2.5 text-right">Rp {fmt(Math.round(p.total_revenue))}</td>
                  <td className="px-4 py-2.5 text-right text-emerald-600 font-medium">Rp {fmt(Math.round(p.total_profit || 0))}</td>
                  <td className="px-4 py-2.5 text-right">{p.total_qty_sold}</td>
                  <td className="px-4 py-2.5 text-right">{p.revenue_percentage}%</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      p.classification === 'A' ? 'bg-emerald-100 text-emerald-700' :
                      p.classification === 'B' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.classification === 'A' ? 'A -- Fast' : p.classification === 'B' ? 'B -- Medium' : 'C -- Slow'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-xs font-bold ${p.trend === 'UP' ? 'text-emerald-600' : p.trend === 'DOWN' ? 'text-red-600' : 'text-gray-500'}`}>
                      {p.trend === 'UP' ? '\u2191' : p.trend === 'DOWN' ? '\u2193' : '\u2192'} {p.trend_percentage > 0 ? '+' : ''}{p.trend_percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Box */}
        <div className="p-5 border-t border-gray-50 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 w-full md:w-1/3">
            Menampilkan <span className="font-semibold text-gray-700">{products.length === 0 ? 0 : (safePageNum - 1) * pageSize + 1}-{Math.min(safePageNum * pageSize, products.length)}</span> dari <span className="font-semibold text-gray-700">{products.length}</span> produk
          </div>
          <div className="flex items-center justify-center w-full md:w-1/3">
            <Pagination currentPage={safePageNum} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
          <div className="w-full md:w-1/3 flex justify-end items-center gap-2 text-sm text-gray-500">
            <span>Tampilkan</span>
            <select value={pageSize} onChange={e => {setPageSize(Number(e.target.value)); setCurrentPage(1)}} className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-gray-50 hover:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer font-medium appearance-none">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>baris</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// TAB 3: PREDIKSI STOK HABIS (Moving Average)
// ============================================================
function StockoutTab({ data }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = usePageSize('ml_stockout', 10)

  if (!data?.results) return <EmptyState text="Tidak ada data prediksi stok" />

  const results = data.results || []
  const criticalCount = data.critical_count || 0
  const highCount = data.high_count || 0

  // Filter relevant results (non-LOW or has stock)
  const filtered = results.filter(r => r.risk_level !== 'LOW' || r.current_stock > 0)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePageNum = Math.min(currentPage, totalPages)
  const pagedResults = filtered.slice((safePageNum - 1) * pageSize, safePageNum * pageSize)

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {(criticalCount > 0 || highCount > 0) && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <RiFireLine className="text-red-500 flex-shrink-0" size={24} />
          <div>
            <p className="font-bold text-red-700">Peringatan Stok Kritis!</p>
            <p className="text-red-600 text-sm">
              {criticalCount} produk akan habis dalam 3 hari, {highCount} produk dalam 7 hari.
              Segera lakukan restock!
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => {
          const count = results.filter(r => r.risk_level === level).length
          const labels = { CRITICAL: 'Kritis (<=3 hari)', HIGH: 'Tinggi (<=7 hari)', MEDIUM: 'Sedang (<=14 hari)', LOW: 'Aman (>14 hari)' }
          return (
            <div key={level} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RISK_COLORS[level] }} />
                <span className="text-xs text-gray-500 font-medium">{labels[level]}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Produk</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Stok</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Avg/Hari (7d)</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Avg/Hari (30d)</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Habis Dalam</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Risiko</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {pagedResults.map(r => (
                <tr key={r.product_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-gray-800">{r.product_name}</p>
                    <p className="text-xs text-gray-400">{r.product_code}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium">{r.current_stock}</td>
                  <td className="px-4 py-2.5 text-right">{r.avg_daily_sales_7d}</td>
                  <td className="px-4 py-2.5 text-right">{r.avg_daily_sales_30d}</td>
                  <td className="px-4 py-2.5 text-right font-bold" style={{ color: RISK_COLORS[r.risk_level] }}>
                    {r.days_until_stockout < 999 ? `${r.days_until_stockout} hari` : '\u221e'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold" style={{
                      backgroundColor: `${RISK_COLORS[r.risk_level]}15`,
                      color: RISK_COLORS[r.risk_level],
                    }}>
                      {r.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.confidence === 'HIGH' ? 'bg-emerald-100 text-emerald-700' : r.confidence === 'MEDIUM' ? 'bg-blue-100 text-blue-700' : r.confidence === 'LOW' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.confidence === 'INSUFFICIENT_DATA' ? 'N/A' : r.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Box */}
        <div className="p-5 border-t border-gray-50 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 w-full md:w-1/3">
            Menampilkan <span className="font-semibold text-gray-700">{filtered.length === 0 ? 0 : (safePageNum - 1) * pageSize + 1}-{Math.min(safePageNum * pageSize, filtered.length)}</span> dari <span className="font-semibold text-gray-700">{filtered.length}</span> produk
          </div>
          <div className="flex items-center justify-center w-full md:w-1/3">
            <Pagination currentPage={safePageNum} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
          <div className="w-full md:w-1/3 flex justify-end items-center gap-2 text-sm text-gray-500">
            <span>Tampilkan</span>
            <select value={pageSize} onChange={e => {setPageSize(Number(e.target.value)); setCurrentPage(1)}} className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-gray-50 hover:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer font-medium appearance-none">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>baris</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// TAB 4: REKOMENDASI RESTOCK (Safety Stock)
// ============================================================
function RestockTab({ data }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = usePageSize('ml_restock', 10)

  if (!data?.results) return <EmptyState text="Tidak ada data rekomendasi" />

  const results = data.results || []
  const needsRestock = results.filter(r => r.needs_restock)

  // Pagination
  const totalPages = Math.max(1, Math.ceil(needsRestock.length / pageSize))
  const safePageNum = Math.min(currentPage, totalPages)
  const pagedRestock = needsRestock.slice((safePageNum - 1) * pageSize, safePageNum * pageSize)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Produk Perlu Restock"
          value={data.needs_restock_count || 0}
          icon={RiTruckLine}
          color="orange"
        />
        <MetricCard
          label="Total Estimasi Biaya"
          value={`Rp ${fmt(Math.round(data.total_estimated_cost || 0))}`}
          icon={RiShoppingCartLine}
          color="blue"
        />
        <MetricCard
          label="Lead Time"
          value={`${data.lead_time_days || 3} hari`}
          icon={RiTimeLine}
          color="purple"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Daftar Rekomendasi Restock</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Produk</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Stok</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Avg/Hari</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Reorder Point</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Qty Beli</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Est. Biaya</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Urgensi</th>
              </tr>
            </thead>
            <tbody>
              {pagedRestock.map(r => (
                <tr key={r.product_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-gray-800">{r.product_name}</p>
                    <p className="text-xs text-gray-400">{r.product_code} | Habis ~{r.days_until_stockout} hari</p>
                  </td>
                  <td className="px-4 py-2.5 text-right">{r.current_stock}</td>
                  <td className="px-4 py-2.5 text-right">{r.avg_daily_sales}</td>
                  <td className="px-4 py-2.5 text-right">{r.reorder_point}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-indigo-600">{r.recommended_order_qty}</td>
                  <td className="px-4 py-2.5 text-right">Rp {fmt(Math.round(r.estimated_cost))}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold" style={{
                      backgroundColor: `${URGENCY_COLORS[r.urgency]}15`,
                      color: URGENCY_COLORS[r.urgency],
                    }}>
                      {r.urgency}
                    </span>
                  </td>
                </tr>
              ))}
              {needsRestock.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  <RiCheckboxCircleLine size={32} className="mx-auto mb-2 text-emerald-400" />
                  Semua stok aman! Tidak ada yang perlu restock saat ini.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Box */}
        {needsRestock.length > 0 && (
          <div className="p-5 border-t border-gray-50 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 w-full md:w-1/3">
              Menampilkan <span className="font-semibold text-gray-700">{(safePageNum - 1) * pageSize + 1}-{Math.min(safePageNum * pageSize, needsRestock.length)}</span> dari <span className="font-semibold text-gray-700">{needsRestock.length}</span> produk
            </div>
            <div className="flex items-center justify-center w-full md:w-1/3">
              <Pagination currentPage={safePageNum} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
            <div className="w-full md:w-1/3 flex justify-end items-center gap-2 text-sm text-gray-500">
              <span>Tampilkan</span>
              <select value={pageSize} onChange={e => {setPageSize(Number(e.target.value)); setCurrentPage(1)}} className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-gray-50 hover:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer font-medium appearance-none">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>baris</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// TAB 5: RISIKO EXPIRED & KERUGIAN (Deterministik)
// ============================================================
function ExpiryTab({ data }) {
  if (!data?.summary) return <EmptyState text="Tidak ada data expired" />

  const s = data.summary

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Sudah Expired"
          value={s.total_expired_batches}
          icon={RiErrorWarningLine}
          color="red"
          subtitle={`Rugi: Rp ${fmt(Math.round(s.total_expired_loss))}`}
        />
        <MetricCard
          label="Kritis (<=7 hari)"
          value={s.total_critical_batches}
          icon={RiFireLine}
          color="orange"
          subtitle={`Risiko: Rp ${fmt(Math.round(s.total_critical_risk))}`}
        />
        <MetricCard
          label="Warning (<=30 hari)"
          value={s.total_warning_batches}
          icon={RiAlertLine}
          color="amber"
          subtitle={`Risiko: Rp ${fmt(Math.round(s.total_warning_risk))}`}
        />
        <MetricCard
          label="Total Risiko Finansial"
          value={`Rp ${fmt(Math.round(s.total_at_risk))}`}
          icon={RiShieldCheckLine}
          color="purple"
        />
      </div>

      {/* Expired & Critical Batches */}
      {[
        { title: 'Sudah Expired (Rugi Pasti)', items: data.expired || [], color: 'red' },
        { title: 'Kritis - Expired dalam 7 Hari', items: data.critical || [], color: 'orange' },
        { title: 'Warning - Expired dalam 30 Hari', items: data.warning || [], color: 'amber' },
      ].map(section => (
        section.items.length > 0 && (
          <ExpirySectionTable key={section.title} section={section} />
        )
      ))}

      {s.total_expired_batches === 0 && s.total_critical_batches === 0 && s.total_warning_batches === 0 && (
        <div className="text-center py-12 text-gray-400">
          <RiCheckboxCircleLine size={48} className="mx-auto mb-3 text-emerald-400" />
          <p className="font-medium text-emerald-600">Semua batch aman!</p>
          <p className="text-sm">Tidak ada produk yang mendekati tanggal expired.</p>
        </div>
      )}
    </div>
  )
}

// Sub-component for each expiry section with its own pagination
function ExpirySectionTable({ section }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = usePageSize('ml_expiry', 5)

  const totalPages = Math.max(1, Math.ceil(section.items.length / pageSize))
  const safePageNum = Math.min(currentPage, totalPages)
  const pagedItems = section.items.slice((safePageNum - 1) * pageSize, safePageNum * pageSize)

  const headerColors = {
    red: 'bg-red-50 border-red-100',
    orange: 'bg-orange-50 border-orange-100',
    amber: 'bg-amber-50 border-amber-100',
  }
  const titleColors = {
    red: 'text-red-700',
    orange: 'text-orange-700',
    amber: 'text-amber-700',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`px-6 py-3 ${headerColors[section.color] || 'bg-gray-50'} border-b`}>
        <h3 className={`font-bold ${titleColors[section.color] || 'text-gray-700'}`}>{section.title} ({section.items.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Produk</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Qty</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Proyeksi Tdk Terjual</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Est. Rugi</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Expired</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Rekomendasi</th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.map(item => (
              <tr key={item.batch_id} className="border-b border-gray-50">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-gray-800">{item.product_name}</p>
                  <p className="text-xs text-gray-400">{item.batch_code}</p>
                </td>
                <td className="px-4 py-2.5 text-right">{item.quantity}</td>
                <td className="px-4 py-2.5 text-right font-medium text-orange-600">{item.projected_unsold ?? item.quantity}</td>
                <td className="px-4 py-2.5 text-right font-bold text-red-600">Rp {fmt(Math.round(item.adjusted_loss ?? item.potential_loss))}</td>
                <td className="px-4 py-2.5 text-right">
                  {item.days_until_expiry < 0 
                    ? <span className="text-red-600 font-bold">{Math.abs(item.days_until_expiry)} hari lalu</span>
                    : <span className="text-orange-600">{item.days_until_expiry} hari lagi</span>
                  }
                </td>
                <td className="px-4 py-2.5 text-left text-xs text-gray-600 max-w-[180px]">{item.recommendation || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Box */}
      <div className="p-4 border-t border-gray-50 bg-white flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-500 w-full md:w-1/3">
          Menampilkan <span className="font-semibold text-gray-700">{(safePageNum - 1) * pageSize + 1}-{Math.min(safePageNum * pageSize, section.items.length)}</span> dari <span className="font-semibold text-gray-700">{section.items.length}</span> batch
        </div>
        <div className="flex items-center justify-center w-full md:w-1/3">
          <Pagination currentPage={safePageNum} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
        <div className="w-full md:w-1/3 flex justify-end items-center gap-2 text-sm text-gray-500">
          <span>Tampilkan</span>
          <select value={pageSize} onChange={e => {setPageSize(Number(e.target.value)); setCurrentPage(1)}} className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-gray-50 hover:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer font-medium appearance-none">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>baris</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function MetricCard({ label, value, icon: Icon, color, badge, badgeColor, subtitle }) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    green: 'bg-emerald-100 text-emerald-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
  }
  const badgeMap = {
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
          <Icon size={20} />
        </div>
        {badge && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeMap[badgeColor] || badgeMap.gray}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-gray-500 text-xs mt-3">{label}</p>
      <p className="text-xl font-bold text-gray-800 mt-0.5">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <RiBrainLine size={48} className="mx-auto mb-3 opacity-30" />
      <p className="font-medium">{text}</p>
      <p className="text-sm mt-1">Pastikan bisnis memiliki data transaksi yang cukup.</p>
    </div>
  )
}
