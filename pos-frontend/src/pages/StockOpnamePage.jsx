import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RiAddLine, RiCheckLine, RiCloseLine, RiSearchLine, RiDeleteBinLine, RiClipboardLine, RiTimeLine, RiRefreshLine, RiArchiveLine } from 'react-icons/ri'
import MainLayout from '../components/MainLayout'
import { useAuth } from '../contexts/AuthContext'
import { inventoryAPI, productsAPI } from '../services/api'
import { toast } from 'react-hot-toast'
import Pagination from '../components/Pagination'
import { usePageSize } from '../hooks/usePageSize'

export default function StockOpnamePage() {
  const { isAdmin, business } = useAuth()
  const isOwner = isAdmin()
  const bCode = business?.code
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = usePageSize('stock_opname', 10)

  const { data: opnames, isLoading } = useQuery({
    queryKey: ['opnames', bCode],
    queryFn: () => inventoryAPI.getOpnames()
  })

  const { data: products } = useQuery({
    queryKey: ['products', bCode],
    queryFn: () => productsAPI.getProducts()
  })

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id) => inventoryAPI.approveOpname(id),
    onSuccess: () => {
      toast.success('Stock Opname disetujui & stok disesuaikan')
      queryClient.invalidateQueries({ queryKey: ['opnames', bCode] })
      queryClient.invalidateQueries({ queryKey: ['products', bCode] })
      queryClient.invalidateQueries({ queryKey: ['batches', bCode] })
    },
    onError: () => toast.error('Gagal menyetujui Stock Opname')
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => inventoryAPI.rejectOpname(id),
    onSuccess: () => {
      toast.success('Stock Opname ditolak')
      queryClient.invalidateQueries({ queryKey: ['opnames', bCode] })
    },
    onError: () => toast.error('Gagal menolak Stock Opname')
  })

  const handleApprove = (id) => {
    if (window.confirm('Setujui Stock Opname ini? Stok akan disesuaikan secara otomatis.')) {
      approveMutation.mutate(id)
    }
  }

  const handleReject = (id) => {
    if (window.confirm('Tolak Stock Opname ini?')) {
      rejectMutation.mutate(id)
    }
  }

  const filteredOpnames = (opnames?.results || opnames || []).filter(o =>
    o.document_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.created_by.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredOpnames.length / pageSize)
  const paginatedOpnames = filteredOpnames.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <MainLayout title="Stock Opname">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Stock Opname</h2>
          <p className="text-sm text-gray-500">Sesuaikan stok fisik dengan sistem per batch</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <RiAddLine size={18} />
          Buat Opname
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 mb-8 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between gap-4 bg-white">
          <div className="relative flex-1 group">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors text-lg" />
            <input type="text" placeholder="Cari nomor dokumen atau pembuat..."
              value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700 placeholder-gray-400" />
          </div>
          <button onClick={() => { queryClient.invalidateQueries(['opnames', bCode]) }} className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
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
                    <th className="px-5 py-4">Dokumen</th>
                    <th className="px-5 py-4">Pembuat</th>
                    <th className="px-5 py-4">Tanggal</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4">Item Selisih</th>
                    <th className="px-5 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm bg-white">
                  {paginatedOpnames.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center">
                        <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3"><RiClipboardLine size={24} className="text-gray-400" /></div>
                        <p className="text-gray-500 font-semibold text-sm mb-1">{searchQuery ? 'Dokumen tidak ditemukan' : 'Belum ada data Stock Opname.'}</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedOpnames.map((opname) => (
                      <tr key={opname.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-800">{opname.document_number}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{opname.notes || '-'}</p>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{opname.created_by}</td>
                        <td className="px-5 py-4 text-gray-600 font-mono text-xs">
                          {new Date(opname.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border uppercase ${opname.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100/50' :
                            opname.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                              'bg-red-50 text-red-600 border-red-100/50'
                            }`}>
                            {opname.status === 'PENDING' && <RiTimeLine />}
                            {opname.status === 'APPROVED' && <RiCheckLine />}
                            {opname.status === 'REJECTED' && <RiCloseLine />}
                            {opname.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {opname.items.map((item, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium text-gray-700">{item.product_name}</span>
                                <span className="text-gray-400 mx-1">·</span>
                                <span className="font-mono text-gray-500">{item.batch_code}</span>:
                                <span className={item.difference < 0 ? 'text-red-600 font-bold ml-1' : item.difference > 0 ? 'text-green-600 font-bold ml-1' : 'text-gray-500 ml-1'}>
                                  {item.difference > 0 ? `+${item.difference}` : item.difference}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {isOwner && opname.status === 'PENDING' ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleApprove(opname.id)}
                                disabled={approveMutation.isPending}
                                className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                title="Setujui & Terapkan"
                              >
                                <RiCheckLine size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(opname.id)}
                                disabled={rejectMutation.isPending}
                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Tolak"
                              >
                                <RiCloseLine size={18} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium whitespace-normal">Oleh:<br />{opname.approved_by || '-'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Box */}
            <div className="p-5 border-t border-gray-50 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500 w-full md:w-1/3">
                Menampilkan <span className="font-semibold text-gray-700">{filteredOpnames.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredOpnames.length)}</span> dari <span className="font-semibold text-gray-700">{filteredOpnames.length}</span> opname
              </div>
              <div className="flex items-center justify-center w-full md:w-1/3">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
              <div className="w-full md:w-1/3 flex justify-end items-center gap-2 text-sm text-gray-500">
                <span>Tampilkan</span>
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1) }} className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-gray-50 hover:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer font-medium appearance-none">
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

      {showModal && (
        <CreateOpnameModal
          onClose={() => setShowModal(false)}
          products={products?.results || products || []}
        />
      )}
    </MainLayout>
  )
}

// =============================================
// CREATE OPNAME MODAL — Batch-Based
// =============================================
function CreateOpnameModal({ onClose, products }) {
  const queryClient = useQueryClient()
  const { business } = useAuth()
  const bCode = business?.code
  const [items, setItems] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [batchInputs, setBatchInputs] = useState({}) // { batchId: actualQty }
  const [notes, setNotes] = useState('')

  // Fetch batches for selected product
  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ['batches-for-opname', bCode, selectedProduct],
    queryFn: () => inventoryAPI.getBatches({ product_id: selectedProduct, status: 'ACTIVE' }),
    enabled: !!selectedProduct,
  })

  const batches = batchesData?.results || batchesData || []

  const createMutation = useMutation({
    mutationFn: (data) => inventoryAPI.createOpname(data),
    onSuccess: () => {
      toast.success('Stock Opname berhasil dibuat dan menunggu persetujuan')
      queryClient.invalidateQueries({ queryKey: ['opnames'] })
      onClose()
    },
    onError: () => toast.error('Gagal membuat Stock Opname')
  })

  const handleProductSelect = (prodId) => {
    setSelectedProduct(prodId)
    setBatchInputs({})
  }

  const handleBatchQtyChange = (batchId, value) => {
    if (value === '') {
      const updated = { ...batchInputs }
      delete updated[batchId]
      setBatchInputs(updated)
    } else {
      setBatchInputs({ ...batchInputs, [batchId]: parseInt(value) })
    }
  }

  const handleAddBatchesToOpname = () => {
    if (!selectedProduct || Object.keys(batchInputs).length === 0) {
      toast.error('Isi stok fisik minimal 1 batch')
      return
    }

    const prod = products.find(p => p.id === parseInt(selectedProduct))
    let addedCount = 0

    batches.forEach(batch => {
      if (batchInputs[batch.id] !== undefined) {
        // Skip if already added
        if (items.some(i => i.batch === batch.id)) {
          toast.error(`Batch ${batch.batch_code} sudah ditambahkan`)
          return
        }

        const sysQty = batch.quantity
        const actQty = batchInputs[batch.id]

        items.push({
          batch: batch.id,
          batch_code: batch.batch_code,
          product_name: prod?.name || batch.product_name,
          expiry_date: batch.expiry_date,
          system_qty: sysQty,
          actual_qty: actQty,
          difference: actQty - sysQty
        })
        addedCount++
      }
    })

    if (addedCount > 0) {
      setItems([...items])
      setSelectedProduct('')
      setBatchInputs({})
      toast.success(`${addedCount} batch ditambahkan ke opname`)
    }
  }

  const handleRemoveItem = (batchId) => {
    setItems(items.filter(i => i.batch !== batchId))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (items.length === 0) return toast.error('Tambahkan minimal 1 batch')

    createMutation.mutate({
      notes,
      items: items.map(i => ({
        batch: i.batch,
        system_qty: i.system_qty,
        actual_qty: i.actual_qty,
        difference: i.difference
      }))
    })
  }

  // Sort products: products with stock first, then products without stock
  const sortedProducts = [...products].sort((a, b) => (b.current_stock || 0) - (a.current_stock || 0))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Buat Dokumen Stock Opname</h3>
            <p className="text-xs text-gray-500 mt-0.5">Pilih produk → cek per batch → input stok fisik</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <RiCloseLine size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <RiClipboardLine size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Cek fisik barang <strong>per batch</strong> dan masukkan jumlah stok nyata. Hanya jumlah (qty) yang bisa disesuaikan — data batch asli (harga beli, expired) tidak berubah.
            </p>
          </div>

          {/* Step 1: Pilih Produk + Batch Table */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Pilih Produk
                <span className="text-gray-400 font-normal ml-1">(pilih produk untuk menampilkan daftar batch)</span>
              </label>
              <select
                value={selectedProduct}
                onChange={e => handleProductSelect(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">-- Pilih Produk --</option>
                {sortedProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stok Sistem: {p.current_stock || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Table */}
            {selectedProduct && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                    <RiArchiveLine /> Batch Aktif — <span className="text-blue-600">{products.find(p => p.id === parseInt(selectedProduct))?.name}</span>
                  </p>
                  <span className="text-xs text-gray-400">
                    {batchesLoading ? 'Memuat...' : `${batches.length} batch ditemukan`}
                  </span>
                </div>

                {batchesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : batches.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-500">Tidak ada batch aktif untuk produk ini.</div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          <th className="px-4 py-3">Kode Batch</th>
                          <th className="px-4 py-3">Expired</th>
                          <th className="px-4 py-3 text-center">Stok Sistem</th>
                          <th className="px-4 py-3 text-center">Stok Fisik</th>
                          <th className="px-4 py-3 text-center">Selisih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {batches.map(batch => {
                          const alreadyAdded = items.some(i => i.batch === batch.id)
                          const actualVal = batchInputs[batch.id]
                          const diff = actualVal !== undefined ? actualVal - batch.quantity : null

                          return (
                            <tr key={batch.id} className={alreadyAdded ? 'opacity-50 bg-gray-50' : ''}>
                              <td className="px-4 py-3">
                                <span className="font-mono font-bold text-gray-800">{batch.batch_code}</span>
                                {alreadyAdded && (
                                  <span className="ml-2 text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold">SUDAH DITAMBAH</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-600 text-xs">
                                {batch.expiry_date ? (
                                  <span className="font-medium">{new Date(batch.expiry_date).toLocaleDateString('id-ID')}</span>
                                ) : (
                                  <span className="text-gray-400">Tanpa Expired</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center justify-center w-10 h-7 bg-gray-100 rounded-lg font-bold text-gray-700">{batch.quantity}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {alreadyAdded ? (
                                  <span className="text-xs text-gray-400">—</span>
                                ) : (
                                  <input
                                    type="number"
                                    min="0"
                                    value={batchInputs[batch.id] ?? ''}
                                    onChange={e => handleBatchQtyChange(batch.id, e.target.value)}
                                    placeholder="Qty"
                                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold"
                                  />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {diff === null ? (
                                  <span className="font-bold text-gray-300">—</span>
                                ) : (
                                  <span className={`font-bold ${diff < 0 ? 'text-red-600' : diff > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {diff > 0 ? `+${diff}` : diff}
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {batches.length > 0 && (
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      onClick={handleAddBatchesToOpname}
                      disabled={Object.keys(batchInputs).length === 0}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RiAddLine size={16} /> Tambahkan ke Opname
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Opname Items Review Table */}
          {items.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-800">Daftar Item Opname</p>
                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold">{items.length} item</span>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Produk</th>
                      <th className="px-4 py-3">Batch</th>
                      <th className="px-4 py-3">Expired</th>
                      <th className="px-4 py-3 text-center">Sistem</th>
                      <th className="px-4 py-3 text-center">Nyata</th>
                      <th className="px-4 py-3 text-center">Selisih</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map(item => (
                      <tr key={item.batch}>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{item.product_name}</td>
                        <td className="px-4 py-2.5 font-mono text-gray-600 text-xs">{item.batch_code}</td>
                        <td className="px-4 py-2.5 text-gray-600 text-xs">
                          {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="px-4 py-2.5 text-center text-gray-500">{item.system_qty}</td>
                        <td className="px-4 py-2.5 text-center font-bold">{item.actual_qty}</td>
                        <td className={`px-4 py-2.5 text-center font-bold ${item.difference < 0 ? 'text-red-600' : item.difference > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {item.difference > 0 ? `+${item.difference}` : item.difference}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button type="button" onClick={() => handleRemoveItem(item.batch)} className="text-red-500 hover:text-red-700 p-1">
                            <RiDeleteBinLine />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan Tambahan</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Stok mie goreng BTH-001 rusak dimakan tikus (5 pcs)"
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={items.length === 0 || createMutation.isPending}
              className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RiCheckLine size={18} />
              {createMutation.isPending ? 'Menyimpan...' : 'Ajukan Opname'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
