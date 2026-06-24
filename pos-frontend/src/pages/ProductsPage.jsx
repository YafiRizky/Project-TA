import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import MainLayout from '../components/MainLayout'
import Pagination from '../components/Pagination'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiSearchLine, RiRefreshLine } from 'react-icons/ri'
import { generateCode } from '../utils/generateCode'
import { formatNumberInput, parseFormattedNumber, fmt } from '../utils/formatCurrency'
import { usePageSize } from '../hooks/usePageSize'

const emptyForm = {
  category: '', supplier: '', code: '', name: '', description: '',
  purchase_price: '', selling_price: '', unit: 'PCS', min_stock: 0, is_active: true
}

export default function ProductsPage() {
  const { user, business } = useAuth()
  const bCode = business?.code
  const queryClient = useQueryClient()
  const [openDialog, setOpenDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = usePageSize(10)

  const { data: products, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['products', bCode],
    queryFn: () => productsAPI.getProducts(),
    retry: 1,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories', bCode],
    queryFn: () => productsAPI.getCategories(),
    retry: 1,
  })

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers', bCode],
    queryFn: () => productsAPI.getSuppliers(),
    retry: 1,
  })

  const createMutation = useMutation({
    mutationFn: (data) => productsAPI.createProduct({
      ...data,
      purchase_price: parseFloat(data.purchase_price),
      selling_price: parseFloat(data.selling_price),
      min_stock: parseInt(data.min_stock)
    }),
    onSuccess: () => { queryClient.invalidateQueries(['products', bCode]); handleCloseDialog(); setError(null) },
    onError: (err) => setError(err.response?.data?.message || 'Gagal membuat produk'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productsAPI.updateProduct(id, {
      ...data,
      purchase_price: parseFloat(data.purchase_price),
      selling_price: parseFloat(data.selling_price),
      min_stock: parseInt(data.min_stock)
    }),
    onSuccess: () => { queryClient.invalidateQueries(['products', bCode]); handleCloseDialog(); setError(null) },
    onError: (err) => setError(err.response?.data?.message || 'Gagal memperbarui produk'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => productsAPI.deleteProduct?.(id),
    onSuccess: () => queryClient.invalidateQueries(['products', bCode]),
    onError: (err) => {
      setError(err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Gagal menghapus produk')
      setTimeout(() => setError(null), 5000)
    },
  })

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        category: product.category || '', supplier: product.supplier || '',
        code: product.code, name: product.name, description: product.description || '',
        purchase_price: Math.round(parseFloat(product.purchase_price) || 0),
        selling_price: Math.round(parseFloat(product.selling_price) || 0),
        unit: product.unit, min_stock: product.min_stock, is_active: product.is_active
      })
    } else {
      setEditingProduct(null)
      setFormData(emptyForm)
    }
    setError(null)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => { setOpenDialog(false); setEditingProduct(null) }

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

  const handleSubmit = () => {
    if (!formData.code || !formData.name || !formData.selling_price) {
      setError('Kode, nama, dan harga jual wajib diisi')
      return
    }
    const sellingPrice = parseFloat(formData.selling_price)
    const purchasePrice = parseFloat(formData.purchase_price)
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      setError('Harga jual harus berupa angka yang valid dan tidak boleh negatif')
      return
    }
    if (formData.purchase_price && (isNaN(purchasePrice) || purchasePrice < 0)) {
      setError('Harga beli harus berupa angka yang valid dan tidak boleh negatif')
      return
    }
    if (formData.purchase_price && !isNaN(purchasePrice) && sellingPrice < purchasePrice) {
      setError('Harga jual tidak boleh lebih rendah dari harga beli')
      return
    }
    editingProduct
      ? updateMutation.mutate({ id: editingProduct.id, data: formData })
      : createMutation.mutate(formData)
  }

  const handleDelete = (product) => {
    setDeleteConfirm(product)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

  const productsList = Array.isArray(products) ? products : (products?.results || [])
  const filteredProducts = productsList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <MainLayout title="Produk">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-gray-800 font-bold text-lg">Daftar Produk</h2>
          <p className="text-gray-400 text-sm">{productsList.length} produk terdaftar</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <RiAddLine size={16} /> Tambah Produk
        </button>
      </div>

      {/* Error */}
      {isError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {queryError?.message || 'Gagal memuat data'}
        </div>
      )}

      {error && !openDialog && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 mb-8 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between gap-4 bg-white">
          <div className="relative flex-1 group">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors text-lg" />
            <input type="text" placeholder="Cari kode atau nama produk..." 
              value={search} onChange={e => {setSearch(e.target.value); setCurrentPage(1)}}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700 placeholder-gray-400" />
          </div>
          <button onClick={() => {queryClient.invalidateQueries(['products', bCode])}} className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
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
                    <th className="px-5 py-4">Kode</th>
                    <th className="px-5 py-4">Nama</th>
                    <th className="px-5 py-4">Kategori</th>
                    <th className="px-5 py-4 text-right">Harga Beli</th>
                    <th className="px-5 py-4 text-right">Harga Jual</th>
                    <th className="px-5 py-4 text-center">Satuan</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm bg-white">
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-mono font-semibold text-gray-700 text-xs">{product.code}</td>
                        <td className="px-5 py-4 font-medium text-gray-800">{product.name}</td>
                        <td className="px-5 py-4 text-gray-500">{product.category_name || '-'}</td>
                        <td className="px-5 py-4 text-right text-gray-600 font-mono">
                          Rp {fmt(Math.round(parseFloat(product.purchase_price) || 0))}
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-gray-800 font-mono">
                          Rp {fmt(Math.round(parseFloat(product.selling_price) || 0))}
                        </td>
                        <td className="px-5 py-4 text-center text-gray-500">{product.unit}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border uppercase ${product.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                            {product.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleOpenDialog(product)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                              <RiEditLine size={15} />
                            </button>
                            <button onClick={() => handleDelete(product)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                              <RiDeleteBinLine size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                        Belum ada produk. Klik "Tambah Produk" untuk memulai.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Box */}
            <div className="p-5 border-t border-gray-50 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500 w-full md:w-1/3">
                Menampilkan <span className="font-semibold text-gray-700">{filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredProducts.length)}</span> dari <span className="font-semibold text-gray-700">{filteredProducts.length}</span> produk
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

      {/* Dialog Modal */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kode *</label>
                  <div className="relative">
                    <input value={formData.code} readOnly
                      placeholder="Auto-generate" className="w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-xl text-sm outline-none bg-slate-100 font-mono text-gray-600 cursor-default" />
                    {!editingProduct && (
                      <button type="button" onClick={() => setFormData({...formData, code: generateCode(formData.name)})}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-blue-100 text-blue-500 transition-colors" title="Generate ulang kode">
                        <RiRefreshLine size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Satuan</label>
                  <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    {['PCS', 'KG', 'L', 'BOX', 'PACK', 'BTL'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Produk *</label>
                <input value={formData.name} onChange={(e) => {
                  const newName = e.target.value
                  setFormData(prev => ({...prev, name: newName, code: !editingProduct ? generateCode(newName) : prev.code}))
                }}
                  placeholder="Nama produk" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2} placeholder="Deskripsi produk (opsional)"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kategori</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">-- Pilih --</option>
                    {(Array.isArray(categories) ? categories : (categories?.results || [])).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Supplier</label>
                  <select value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="">-- Pilih --</option>
                    {(Array.isArray(suppliers) ? suppliers : (suppliers?.results || [])).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Harga Beli</label>
                  <input type="text" inputMode="numeric" value={formatNumberInput(formData.purchase_price)} onChange={(e) => setFormData({...formData, purchase_price: parseFormattedNumber(e.target.value)})}
                    placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  <p className="text-[11px] text-gray-400 mt-1">Modal dari supplier (estimasi)</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Harga Jual * <span className="text-blue-500">(harga di kasir)</span></label>
                  <input type="text" inputMode="numeric" value={formatNumberInput(formData.selling_price)} onChange={(e) => setFormData({...formData, selling_price: parseFormattedNumber(e.target.value)})}
                    placeholder="0" className="w-full px-3 py-2.5 border border-blue-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold" />
                  <p className="text-[11px] text-blue-400 mt-1">Harga yang ditampilkan ke pelanggan</p>
                </div>
              </div>

              {/* Live Margin Preview */}
              {(() => {
                const beli = parseFloat(formData.purchase_price)
                const jual = parseFloat(formData.selling_price)
                if (!beli || !jual || beli <= 0 || jual <= 0) return null
                const profit = jual - beli
                const marginPct = ((profit / jual) * 100).toFixed(1)
                const isLoss = profit < 0
                const isThin = !isLoss && parseFloat(marginPct) < 10
                const bgColor = isLoss ? 'bg-red-50 border-red-200' : isThin ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
                const textColor = isLoss ? 'text-red-600' : isThin ? 'text-amber-600' : 'text-emerald-600'
                const label = isLoss ? 'Rugi' : isThin ? 'Margin Tipis' : 'Margin Sehat'
                return (
                  <div className={`border rounded-xl px-4 py-3 flex items-center justify-between ${bgColor}`}>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Estimasi Margin</p>
                      <p className={`text-xs mt-0.5 ${textColor}`}>{label}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-extrabold ${textColor}`}>{profit >= 0 ? '+' : '-'}Rp {fmt(Math.abs(profit))}</p>
                      <p className={`text-xs font-semibold ${textColor}`}>{profit >= 0 ? '+' : ''}{marginPct}% margin</p>
                    </div>
                  </div>
                )
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Min. Stok</label>
                  <input type="number" value={formData.min_stock} onChange={(e) => setFormData({...formData, min_stock: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  <p className="text-[11px] text-gray-400 mt-1">Pengingat Jumlah Minimal Stok pada Produk</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                  <select value={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={handleCloseDialog} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={handleSubmit} disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-colors">
                {isPending ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Menyimpan...</> : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <RiDeleteBinLine size={20} className="text-red-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">Hapus Produk?</h3>
            <p className="text-sm text-gray-500 mb-4">Produk <strong>{deleteConfirm.name}</strong> ({deleteConfirm.code}) akan dihapus secara permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Batal</button>
              <button onClick={confirmDelete} disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:bg-red-400">
                {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

