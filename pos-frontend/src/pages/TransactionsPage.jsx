import { useState, Fragment } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import MainLayout from '../components/MainLayout'
import { RiMoneyDollarCircleLine, RiBarChartLine, RiShoppingCartLine, RiFileListLine, RiArrowDownSLine, RiArrowUpSLine, RiCalendarLine, RiArrowLeftSLine, RiArrowRightSLine, RiRefreshLine } from 'react-icons/ri'
import { toast } from 'react-hot-toast'
import { fmt } from '../utils/formatCurrency'
import Pagination from '../components/Pagination'
import { usePageSize } from '../hooks/usePageSize'

export default function TransactionsPage() {
  const { isAdmin, business } = useAuth()
  const bCode = business?.code
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState(null)
  const [voidModal, setVoidModal] = useState(null)
  const [voidReason, setVoidReason] = useState('')
  const [voidError, setVoidError] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = usePageSize('transactions', 10)

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', bCode, currentPage, pageSize, filterStart, filterEnd],
    queryFn: () => transactionsAPI.getTransactions({
      page: currentPage,
      page_size: pageSize,
      ...(filterStart && { start_date: filterStart }),
      ...(filterEnd && { end_date: filterEnd }),
    }),
    retry: 1,
  })
  const { data: dailySummary } = useQuery({ queryKey: ['daily-summary', bCode], queryFn: () => transactionsAPI.getDailySummary(), retry: 1 })

  // Server-side pagination: backend returns { count, results, next, previous }
  const transList = transactionsData?.results || (Array.isArray(transactionsData) ? transactionsData : [])
  const totalCount = transactionsData?.count || transList.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))


  const handleFilterChange = (field, value) => {
    if (field === 'start') setFilterStart(value)
    else setFilterEnd(value)
    setCurrentPage(1) // reset to page 1 when filter changes
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Void mutation
  const voidMutation = useMutation({
    mutationFn: ({ id, reason }) => transactionsAPI.voidTransaction(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions', bCode])
      queryClient.invalidateQueries(['daily-summary', bCode])
      queryClient.invalidateQueries(['stock-pos', bCode])
      setVoidModal(null)
      setVoidReason('')
      setVoidError('')
    },
    onError: (err) => {
      setVoidError(err.response?.data?.error || 'Gagal melakukan void transaksi.')
    }
  })

  const handleVoid = () => {
    if (!voidReason.trim()) {
      setVoidError('Alasan void wajib diisi.')
      return
    }
    voidMutation.mutate({ id: voidModal.id, reason: voidReason.trim() })
  }

  const getStatusBadge = (status) => {
    const styles = {
      COMPLETED: 'bg-green-100 text-green-700',
      VOIDED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-yellow-100 text-yellow-700',
      PENDING: 'bg-amber-100 text-amber-700',
    }
    const labels = {
      COMPLETED: 'Selesai',
      VOIDED: 'Void',
      CANCELLED: 'Dibatalkan',
      PENDING: 'Pending',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <MainLayout title="Daftar Transaksi">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Penjualan Hari Ini', value: `Rp ${fmt(dailySummary?.total_revenue)}`, icon: RiMoneyDollarCircleLine, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Jumlah Transaksi', value: dailySummary?.transaction_count || 0, icon: RiBarChartLine, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Item', value: dailySummary?.item_count || 0, icon: RiShoppingCartLine, color: 'bg-violet-50 text-violet-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon size={20} /></div>
            <div><p className="text-xs text-gray-500">{label}</p><p className="font-bold text-gray-800 text-lg leading-tight">{value}</p></div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-gray-800 font-bold text-lg">Riwayat Transaksi</h2>
          <p className="text-gray-400 text-sm">{totalCount} transaksi {(filterStart || filterEnd) ? 'dalam filter' : 'tercatat'} — klik baris untuk lihat detail</p>
        </div>
        {/* Date filter */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <RiCalendarLine size={15} className="text-gray-400" />
          <input type="date" value={filterStart} onChange={e => handleFilterChange('start', e.target.value)}
            className="text-sm outline-none text-gray-700 bg-transparent" />
          <span className="text-gray-300 text-sm">—</span>
          <input type="date" value={filterEnd} onChange={e => handleFilterChange('end', e.target.value)}
            className="text-sm outline-none text-gray-700 bg-transparent" />
          {(filterStart || filterEnd) && (
            <button onClick={() => { setFilterStart(''); setFilterEnd(''); setCurrentPage(1) }}
              className="ml-1 text-xs text-red-500 hover:text-red-700 font-medium">Reset</button>
          )}
        </div>
      </div>


      {/* Transaction history table */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 mb-8 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between gap-4 bg-white">
          <div className="relative flex-1 group">
            {/* The filter takes care of finding transactions, so we'll just have the refresh button here if we want or just remove the search input space since it's already filtered above */}
            <div className="text-sm text-gray-500 font-medium">
              Riwayat Transaksi
            </div>
          </div>
          <button onClick={() => {queryClient.invalidateQueries(['transactions', bCode])}} className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
            <RiRefreshLine size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                    {['', 'Kode', 'Total', 'Pembayaran', 'Status', 'Tanggal', 'Kasir'].map(h => (
                      <th key={h} className={`px-5 py-4 ${h === 'Total' ? 'text-right' : 'text-left'} ${h === '' ? 'w-8' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm bg-white">
                  {transList.length > 0 ? transList.map((t) => (
                    <Fragment key={t.id}>
                      <tr onClick={() => toggleExpand(t.id)} className={`hover:bg-gray-50 transition-colors cursor-pointer ${t.status === 'VOIDED' ? 'opacity-60' : ''}`}>
                        <td className="px-5 py-4 text-gray-400">
                          {expandedId === t.id ? <RiArrowUpSLine size={16} /> : <RiArrowDownSLine size={16} />}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-700">{t.transaction_code}</td>
                        <td className={`px-5 py-4 text-right font-medium ${t.status === 'VOIDED' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>Rp {fmt(t.total_amount)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                            t.payment_method === 'CASH' ? 'bg-green-50 text-green-700 border-green-100/50' :
                            t.payment_method === 'QRIS' ? 'bg-blue-50 text-blue-700 border-blue-100/50' :
                            t.payment_method === 'TRANSFER' ? 'bg-purple-50 text-purple-700 border-purple-100/50' :
                            'bg-amber-50 text-amber-700 border-amber-100/50'
                          }`}>{t.payment_method}</span>
                        </td>
                        <td className="px-5 py-4">
                          {getStatusBadge(t.status)}
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs">{new Date(t.transaction_date).toLocaleString('id-ID')}</td>
                        <td className="px-5 py-4 text-gray-500 font-medium">{t.cashier_name || '-'}</td>
                      </tr>
                      {/* Expanded detail row */}
                      {expandedId === t.id && (
                        <tr key={`detail-${t.id}`}>
                          <td colSpan={7} className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Detail Item</h4>
                                <div className="flex gap-4 text-xs text-gray-500 items-center">
                                  {t.amount_paid && <span>Dibayar: <strong className="text-gray-700">Rp {fmt(t.amount_paid)}</strong></span>}
                                  {t.change_amount && parseFloat(t.change_amount) > 0 && <span>Kembalian: <strong className="text-emerald-600">Rp {fmt(t.change_amount)}</strong></span>}
                                  
                                  {/* Void button - admin only, only for COMPLETED */}
                                  {isAdmin() && t.status === 'COMPLETED' && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setVoidModal({ id: t.id, code: t.transaction_code }); setVoidReason(''); setVoidError('') }}
                                      className="ml-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors flex items-center gap-1.5"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                      </svg>
                                      Void Transaksi
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Void info banner */}
                              {t.status === 'VOIDED' && (
                                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs">
                                  <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                                    </svg>
                                    Transaksi ini telah di-void
                                  </div>
                                  {t.voided_by && <p className="text-red-600 font-medium">Oleh: {t.voided_by}</p>}
                                  {t.voided_at && <p className="text-red-600 font-medium">Waktu: {new Date(t.voided_at).toLocaleString('id-ID')}</p>}
                                  {t.void_reason && <p className="text-red-600 font-medium">Alasan: {t.void_reason}</p>}
                                </div>
                              )}

                              {t.items && t.items.length > 0 ? (
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="border-b border-gray-100">
                                      <th className="py-2 text-[11px] uppercase tracking-wider text-gray-500 font-bold">Produk</th>
                                      <th className="py-2 text-[11px] uppercase tracking-wider text-gray-500 font-bold text-center">Qty</th>
                                      <th className="py-2 text-[11px] uppercase tracking-wider text-gray-500 font-bold text-right">Harga</th>
                                      <th className="py-2 text-[11px] uppercase tracking-wider text-gray-500 font-bold text-right">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {t.items.map((item, idx) => (
                                      <tr key={idx} className="last:border-0">
                                        <td className="py-2.5 text-gray-800 font-medium">{item.product_name || `Produk #${item.product}`}</td>
                                        <td className="py-2.5 text-center text-gray-600 font-medium">{item.quantity}</td>
                                        <td className="py-2.5 text-right text-gray-600">Rp {fmt(item.price_per_unit)}</td>
                                        <td className="py-2.5 text-right font-bold text-gray-800">Rp {fmt(item.subtotal)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-gray-400 text-sm text-center py-4">Data item tidak tersedia</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <RiFileListLine size={24} className="text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-semibold text-sm">Belum ada transaksi</p>
                          <p className="text-gray-400 text-xs">Transaksi yang dilakukan kasir akan muncul di sini</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Box */}
            <div className="p-5 border-t border-gray-50 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500 w-full md:w-1/3">
                Menampilkan <span className="font-semibold text-gray-700">{totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)}</span> dari <span className="font-semibold text-gray-700">{totalCount}</span> transaksi
              </div>
              <div className="flex items-center justify-center w-full md:w-1/3">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
          </>
        )}
      </div>

      {/* Void confirmation modal */}
      {voidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <h3 className="text-gray-800 font-bold text-sm">Void Transaksi</h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  {voidModal.code} — Stok akan dikembalikan ke inventori
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Alasan Void <span className="text-red-500">*</span></label>
              <textarea
                value={voidReason}
                onChange={(e) => { setVoidReason(e.target.value); setVoidError('') }}
                placeholder="Contoh: Kesalahan input kasir, permintaan pembeli..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
              {voidError && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {voidError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setVoidModal(null); setVoidReason(''); setVoidError('') }}
                disabled={voidMutation.isPending}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleVoid}
                disabled={voidMutation.isPending}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {voidMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                    Ya, Void Transaksi
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
