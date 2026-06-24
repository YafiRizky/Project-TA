import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { inventoryAPI, productsAPI } from '../services/api'
import MainLayout from '../components/MainLayout'
import { useAuth } from '../contexts/AuthContext'
import { RiAddLine, RiArchiveLine, RiStackLine, RiRefreshLine, RiBarcodeBoxLine, RiCloseLine, RiDeleteBinLine, RiSearchLine, RiHistoryLine, RiPrinterLine } from 'react-icons/ri'
import Pagination from '../components/Pagination'
import { formatNumberInput, parseFormattedNumber, fmt } from '../utils/formatCurrency'
import JsBarcode from 'jsbarcode'
import { jsPDF } from 'jspdf'
import { usePageSize } from '../hooks/usePageSize'

const emptyForm = { product: '', batch_code: '', quantity: '', purchase_date: '', expiry_date: '', purchase_cost: 0 }

// Generate random batch code: BTH-XXXXXX (6 random alphanumeric chars)
const generateBatchCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let suffix = ''
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `BTH-${suffix}`
}

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const { business } = useAuth()
  const bCode = business?.code
  const [searchParams, setSearchParams] = useSearchParams()
  const today = new Date().toISOString().split('T')[0]
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({ ...emptyForm, purchase_date: today })
  const [error, setError] = useState(null)
  const [highlightId, setHighlightId] = useState(null)
  const [showBarcodeModal, setShowBarcodeModal] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  // Pagination & Search states
  const [activePage, setActivePage] = useState(1)
  const [activePageSize, setActivePageSize] = usePageSize(10)
  const [activeSearch, setActiveSearch] = useState('')

  const [archivedPage, setArchivedPage] = useState(1)
  const [archivedPageSize, setArchivedPageSize] = useState(5)
  const [archivedSearch, setArchivedSearch] = useState('')

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpenDialog(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const { data: batches, isLoading, isError } = useQuery({ queryKey: ['batches', bCode], queryFn: () => inventoryAPI.getBatches(), retry: 1 })
  const { data: products } = useQuery({ queryKey: ['products', bCode], queryFn: () => productsAPI.getProducts({ limit: 500 }), retry: 1 })

  const list = Array.isArray(batches) ? batches : (batches?.results || [])
  const totalQty = list.reduce((sum, b) => sum + (b.quantity || 0), 0)
  const productList = Array.isArray(products) ? products : (products?.results || [])

  // Build stock map for status calculation
  const stockMap = {}
  list.forEach(b => {
    const pid = b.product_id || b.product
    stockMap[pid] = (stockMap[pid] || 0) + (b.quantity || 0)
  })

  // Get stock status for a product
  const getStockStatus = (productId) => {
    const product = productList.find(p => p.id === productId || String(p.id) === String(productId))
    const totalStock = stockMap[productId] || 0
    const minStock = product?.min_stock || 0
    if (totalStock === 0) return { label: 'Habis', color: 'bg-red-100 text-red-700' }
    if (totalStock <= minStock) return { label: 'Rendah', color: 'bg-amber-100 text-amber-700' }
    return { label: 'Aman', color: 'bg-green-100 text-green-700' }
  }

  // Handle auto-edit from URL query params (USER-3: dashboard click -> auto-edit)
  useEffect(() => {
    const highlightParam = searchParams.get('highlight')
    const autoEdit = searchParams.get('autoEdit')
    
    if (highlightParam && productList.length > 0 && list.length > 0) {
      const productId = parseInt(highlightParam)
      setHighlightId(productId)
      
      if (autoEdit === 'true') {
        // Find the first active batch for this product, or open new batch form
        const batch = list.find(b => (b.product_id || b.product) === productId && b.status === 'ACTIVE')
        if (batch) {
          handleOpenDialog(batch)
        } else {
          // Open new batch form pre-filled with this product
          setEditingBatch(null)
          const selectedProduct = productList.find(p => p.id === productId)
          setFormData({
            ...emptyForm,
            purchase_date: today,
            batch_code: generateBatchCode(),
            product: productId,
            purchase_cost: selectedProduct ? parseFloat(selectedProduct.purchase_price || 0) : 0,
          })
          setOpenDialog(true)
        }
      }
      
      // Clear params after processing
      setSearchParams({}, { replace: true })
      
      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightId(null), 3000)
    }
  }, [searchParams, productList.length, list.length])

  const createMutation = useMutation({
    mutationFn: (data) => inventoryAPI.createBatch(data),
    onSuccess: () => { queryClient.invalidateQueries(['batches', bCode]); queryClient.invalidateQueries(['inventory-summary', bCode]); queryClient.invalidateQueries(['batches-stock-check', bCode]); handleCloseDialog(); setError(null) },
    onError: (err) => setError(err.response?.data?.message || 'Gagal membuat batch'),
  })

  const handleOpenDialog = () => {
    setFormData({ ...emptyForm, purchase_date: today, batch_code: generateBatchCode(), purchase_cost: 0 })
    setProductSearch('')
    setShowProductDropdown(false)
    setError(null)
    setOpenDialog(true)
  }

  // Auto-fill purchase_cost dan tampilkan margin saat produk dipilih
  const handleProductChange = (productId) => {
    const selectedProduct = productList.find(p => String(p.id) === String(productId))
    const newCost = selectedProduct ? Math.round(parseFloat(selectedProduct.purchase_price) || 0) : 0
    setFormData({ ...formData, product: productId, purchase_cost: newCost })
    setProductSearch(selectedProduct ? selectedProduct.name : '')
    setShowProductDropdown(false)
  }

  const handleCloseDialog = () => { setOpenDialog(false); setError(null) }

  const handleSubmit = () => {
    if (!formData.product || !formData.batch_code || !formData.quantity) { setError('Produk, kode batch, dan kuantitas wajib diisi'); return }
    const data = { ...formData, quantity: parseInt(formData.quantity), purchase_cost: parseFloat(formData.purchase_cost) }
    createMutation.mutate(data)
  }

  // Kalkulasi margin untuk Smart Margin Info box
  const getMarginInfo = () => {
    if (!formData.product || !formData.purchase_cost) return null
    const selectedProduct = productList.find(p => String(p.id) === String(formData.product))
    if (!selectedProduct || !selectedProduct.selling_price) return null
    const modalPerUnit = parseFloat(formData.purchase_cost)
    const hargaJual = parseFloat(selectedProduct.selling_price)
    if (modalPerUnit <= 0 || hargaJual <= 0) return null
    const profit = hargaJual - modalPerUnit
    const marginPct = ((profit / hargaJual) * 100).toFixed(1)
    const status = profit < 0 ? 'RUGI' : marginPct < 10 ? 'TIPIS' : 'SEHAT'
    return { hargaJual, modalPerUnit, profit, marginPct, status, productName: selectedProduct.name }
  }

  const isPending = createMutation.isPending

  const statusColor = { 
    ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100/50', 
    EXPIRED: 'bg-red-50 text-red-600 border-red-100/50', 
    DEPLETED: 'bg-gray-50 text-gray-600 border-gray-200' 
  }
  const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'

  // Stat card hanya hitung batch ACTIVE yang tidak expired
  const activeLiveList = list.filter(b => b.status === 'ACTIVE' && !b.is_expired)
  const activeLiveQty = activeLiveList.reduce((sum, b) => sum + (b.quantity || 0), 0)

  return (
    <MainLayout title="Inventori">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Batch Aktif', value: activeLiveList.length, icon: RiArchiveLine, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Stok Tersedia', value: activeLiveQty, icon: RiStackLine, color: 'bg-emerald-50 text-emerald-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon size={20} /></div>
            <div><p className="text-xs text-gray-500">{label}</p><p className="font-bold text-gray-800 text-lg leading-tight">{value}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-gray-800 font-bold text-lg">Batch Produk</h2>
          <p className="text-gray-400 text-sm">{list.length} batch tercatat</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBarcodeModal(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <RiBarcodeBoxLine size={16} /> Cetak Barcode
          </button>
          <button onClick={handleOpenDialog}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <RiAddLine size={16} /> Penerimaan Barang (Restock)
          </button>
        </div>
      </div>

      {isError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">Gagal memuat data inventori.</div>
      )}

      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (() => {
          const rawActive = list.filter(b => b.status === 'ACTIVE' && !b.is_expired)
          const rawArchived = list.filter(b => b.status !== 'ACTIVE' || b.is_expired)

          // Process Active Batches
          const filteredActive = rawActive.filter(b => 
            !activeSearch || 
            b.batch_code.toLowerCase().includes(activeSearch.toLowerCase()) || 
            (b.product_name || String(b.product)).toLowerCase().includes(activeSearch.toLowerCase())
          )
          const totalActivePages = Math.ceil(filteredActive.length / activePageSize)
          const paginatedActive = filteredActive.slice((activePage - 1) * activePageSize, activePage * activePageSize)

          // Process Archived Batches
          const filteredArchived = rawArchived.filter(b => 
            !archivedSearch || 
            b.batch_code.toLowerCase().includes(archivedSearch.toLowerCase()) || 
            (b.product_name || String(b.product)).toLowerCase().includes(archivedSearch.toLowerCase())
          )
          const totalArchivedPages = Math.ceil(filteredArchived.length / archivedPageSize)
          const paginatedArchived = filteredArchived.slice((archivedPage - 1) * archivedPageSize, archivedPage * archivedPageSize)

          const BatchTable = ({ items, emptyMsg }) => (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                    {['Kode Batch', 'Produk', 'Qty', 'Modal/Unit', 'Tgl Beli', 'Tgl Kadaluarsa', 'Status Batch', 'Aksi'].map(h => (
                      <th key={h} className={`px-5 py-4 ${['Status Batch', 'Aksi', 'Qty'].includes(h) ? 'text-center' : h === 'Modal/Unit' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm bg-white">
                  {items.length > 0 ? items.map((b) => {
                    const productId = b.product_id || b.product
                    const isHighlighted = highlightId === productId
                    return (
                      <tr key={b.id} className={`hover:bg-gray-50 transition-colors ${isHighlighted ? 'bg-amber-50 ring-2 ring-amber-300 ring-inset' : ''}`}>
                        <td className="px-5 py-4 font-mono font-semibold text-gray-700 text-xs">{b.batch_code}</td>
                        <td className="px-5 py-4 font-medium text-gray-800">{b.product_name || b.product}</td>
                        <td className="px-5 py-4 text-center font-bold text-gray-700">{b.quantity}</td>
                        <td className="px-5 py-4 text-gray-600 text-right font-mono">{b.purchase_cost ? `Rp ${fmt(b.purchase_cost)}` : '-'}</td>
                        <td className="px-5 py-4 text-gray-500">{b.purchase_date}</td>
                        <td className="px-5 py-4 text-gray-500">
                          {b.expiry_date || '-'}
                          {b.is_expired && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">Expired</span>}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border uppercase ${statusColor[b.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{b.status}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-gray-300 font-medium">—</span>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400 border border-gray-100 border-dashed m-4 rounded-xl">{emptyMsg}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )

          return (
            <>
              {/* BLOCK 1: BATCH AKTIF */}
              <h3 className="font-semibold text-gray-800 mb-4 ml-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span> Batch Aktif
              </h3>
              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 mb-8 overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex items-center justify-between gap-4 bg-white">
                  <div className="relative flex-1 group">
                    <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors text-lg" />
                    <input type="text" placeholder="Cari kode batch atau produk..." 
                      value={activeSearch} onChange={e => {setActiveSearch(e.target.value); setActivePage(1)}}
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700 placeholder-gray-400" />
                  </div>
                  <button onClick={() => {queryClient.invalidateQueries(['batches', bCode])}} className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
                    <RiRefreshLine size={18} />
                  </button>
                </div>
                
                <BatchTable items={paginatedActive} emptyMsg="Tidak ada batch aktif ditemukan." />

                <div className="p-5 border-t border-gray-50 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500 w-full md:w-1/3">
                    Menampilkan <span className="font-semibold text-gray-700">{filteredActive.length === 0 ? 0 : (activePage - 1) * activePageSize + 1}-{Math.min(activePage * activePageSize, filteredActive.length)}</span> dari <span className="font-semibold text-gray-700">{filteredActive.length}</span> batch
                  </div>
                  <div className="flex items-center justify-center gap-1.5 w-full md:w-1/3">
                    <Pagination currentPage={activePage} totalPages={totalActivePages} onPageChange={setActivePage} />
                  </div>
                  <div className="w-full md:w-1/3 flex justify-end items-center gap-2 text-sm text-gray-500">
                    <span>Tampilkan</span>
                    <select value={activePageSize} onChange={e => {setActivePageSize(Number(e.target.value)); setActivePage(1)}} className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-gray-50 hover:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer font-medium appearance-none">
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                    <span>baris</span>
                  </div>
                </div>
              </div>

              {/* BLOCK 2: RIWAYAT BATCH */}
              {rawArchived.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-800 mb-4 ml-1 flex items-center gap-2">
                    <RiHistoryLine className="text-gray-500" /> Riwayat Batch (Habis / Kadaluarsa)
                  </h3>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden opacity-80 hover:opacity-100 transition-opacity duration-300">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
                      <div className="relative flex-1 group">
                        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors text-lg" />
                        <input type="text" placeholder="Cari arsip batch..." 
                          value={archivedSearch} onChange={e => {setArchivedSearch(e.target.value); setArchivedPage(1)}}
                          className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700 placeholder-gray-400" />
                      </div>
                      <button onClick={() => {queryClient.invalidateQueries(['batches', bCode])}} className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
                        <RiRefreshLine size={18} />
                      </button>
                    </div>

                    <BatchTable items={paginatedArchived} emptyMsg="Tidak ada data arsip ditemukan." />

                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-500 w-full md:w-1/3">
                        Menampilkan <span className="font-semibold text-gray-700">{filteredArchived.length === 0 ? 0 : (archivedPage - 1) * archivedPageSize + 1}-{Math.min(archivedPage * archivedPageSize, filteredArchived.length)}</span> dari <span className="font-semibold text-gray-700">{filteredArchived.length}</span> arsip
                      </div>
                      <div className="flex items-center justify-center gap-1.5 w-full md:w-1/3">
                        <Pagination currentPage={archivedPage} totalPages={totalArchivedPages} onPageChange={setArchivedPage} />
                      </div>
                      <div className="w-full md:w-1/3 flex justify-end items-center gap-2 text-sm text-gray-500">
                        <span>Tampilkan</span>
                        <select value={archivedPageSize} onChange={e => {setArchivedPageSize(Number(e.target.value)); setArchivedPage(1)}} className="border border-gray-200 rounded-lg px-2 py-1 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all cursor-pointer font-medium text-xs">
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="25">25</option>
                        </select>
                        <span>baris</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )
        })()}
      </div>

      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">Penerimaan Barang (Restock)</h3>
              <p className="text-xs text-gray-400 mt-1">Batch bersifat permanen. Untuk koreksi stok, gunakan Stock Opname.</p>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Produk *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); if (!e.target.value) setFormData({...formData, product: ''}) }}
                    onFocus={() => setShowProductDropdown(true)}
                    onBlur={() => setTimeout(() => setShowProductDropdown(false), 150)}
                    placeholder="Ketik nama atau kode produk..."
                    className={inputClass}
                    autoComplete="off"
                  />
                  {showProductDropdown && productSearch.length >= 0 && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                      {productList
                        .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.code.toLowerCase().includes(productSearch.toLowerCase()))
                        .slice(0, 20)
                        .map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={() => handleProductChange(String(p.id))}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${String(formData.product) === String(p.id) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}
                          >
                            <span className="font-medium">{p.name}</span>
                            <span className="ml-2 text-xs text-gray-400">{p.code}</span>
                          </button>
                        ))}
                      {productList.filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.code.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                        <p className="px-4 py-3 text-sm text-gray-400 text-center">Produk tidak ditemukan</p>
                      )}
                    </div>
                  )}
                </div>
                {formData.product && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ Dipilih: {productList.find(p => String(p.id) === String(formData.product))?.name}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kode Batch *</label>
                  <div className="relative">
                    <input value={formData.batch_code} readOnly
                      placeholder="Auto-generate" className={`${inputClass} pr-9 bg-slate-100 font-mono text-gray-600 cursor-default`} />
                    <button type="button" onClick={() => setFormData({...formData, batch_code: generateBatchCode()})}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-blue-100 text-blue-500 transition-colors" title="Generate ulang kode">
                      <RiRefreshLine size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kuantitas *</label>
                  <input type="number" min="1" value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="0" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal Beli</label>
                  <input type="date" value={formData.purchase_date}
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tgl Kadaluarsa</label>
                  <input type="date" value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Harga Beli / Modal per Unit (Rp)</label>
                <input type="text" inputMode="numeric"
                  value={formatNumberInput(formData.purchase_cost)}
                  onChange={(e) => setFormData({...formData, purchase_cost: parseFormattedNumber(e.target.value)})}
                  placeholder="0" className={inputClass} />
                <p className="text-[11px] text-gray-400 mt-1">Harga modal dari supplier untuk batch ini. Tidak mempengaruhi harga jual di kasir.</p>
              </div>

              {/* Smart Margin Info Box */}
              {(() => {
                const margin = getMarginInfo()
                if (!margin) return null
                const colorMap = {
                  RUGI:  { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Rugi' },
                  TIPIS: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Margin Tipis' },
                  SEHAT: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Margin Sehat' },
                }
                const c = colorMap[margin.status]
                return (
                  <div className={`${c.bg} ${c.border} border rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-700">Analisis Margin Batch Ini</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
                        {c.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Harga Jual Kasir</p>
                        <p className="text-sm font-bold text-gray-800">Rp {fmt(margin.hargaJual)}</p>
                        <p className="text-[10px] text-gray-400">dari Data Produk</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Modal / Unit</p>
                        <p className="text-sm font-bold text-gray-800">Rp {fmt(margin.modalPerUnit)}</p>
                        <p className="text-[10px] text-gray-400">batch ini</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">Est. Untung</p>
                        <p className={`text-sm font-bold ${margin.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          Rp {fmt(Math.abs(margin.profit))}
                        </p>
                        <p className={`text-[10px] font-semibold ${margin.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {margin.profit >= 0 ? `+${margin.marginPct}%` : `-${margin.marginPct}%`}
                        </p>
                      </div>
                    </div>
                    {margin.status !== 'SEHAT' && (
                      <p className="text-[11px] text-gray-500 mt-3 text-center">
                        Pertimbangkan untuk memperbarui Harga Jual produk ini di halaman <strong>Produk</strong>.
                      </p>
                    )}
                  </div>
                )
              })()}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={handleCloseDialog} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleSubmit} disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-colors">
                {isPending ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Menyimpan...</> : 'Simpan Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBarcodeModal && (
        <PrintBarcodeModal onClose={() => setShowBarcodeModal(false)} products={productList} />
      )}
    </MainLayout>
  )
}

function PrintBarcodeModal({ onClose, products }) {
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  
  const handlePrint = () => {
    if (!selectedProduct) return alert('Pilih produk terlebih dahulu')
    
    const product = products.find(p => String(p.id) === String(selectedProduct))
    if (!product || !product.code) return alert('Produk tidak memiliki kode')

    const doc = new jsPDF()
    const barcodeCanvas = document.createElement('canvas')
    
    try {
      JsBarcode(barcodeCanvas, product.code, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true
      })
      
      const barcodeImg = barcodeCanvas.toDataURL('image/jpeg')
      
      let x = 10
      let y = 10
      const width = 60
      const height = 30
      
      for (let i = 0; i < quantity; i++) {
        if (x + width > 200) {
          x = 10
          y += height + 10
        }
        if (y + height > 280) {
          doc.addPage()
          x = 10
          y = 10
        }
        
        doc.setFontSize(8)
        doc.text(product.name.substring(0, 30), x, y + 4)
        doc.addImage(barcodeImg, 'JPEG', x, y + 5, width, height - 10)
        
        x += width + 10
      }
      
      doc.save(`Barcode_${product.code}.pdf`)
    } catch (err) {
      console.error(err)
      alert('Gagal membuat barcode')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <RiBarcodeBoxLine className="text-blue-600" size={20} /> Cetak Barcode Produk
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <RiCloseLine size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pilih Produk</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Produk --</option>
              {products.filter(p => p.code).map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jumlah Barcode (Lembar)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="pt-4 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
              Batal
            </button>
            <button onClick={handlePrint} className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors">
              <RiPrinterLine /> Cetak PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
