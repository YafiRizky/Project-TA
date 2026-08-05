import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsAPI } from '../services/api'
import MainLayout from '../components/MainLayout'
import Pagination from '../components/Pagination'
import { useAuth } from '../contexts/AuthContext'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiSearchLine, RiRefreshLine } from 'react-icons/ri'
import { generateCode } from '../utils/generateCode'
import { usePageSize } from '../hooks/usePageSize'

const emptyForm = { code: '', name: '', description: '', is_active: true }

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const { business } = useAuth()
  const bCode = business?.code
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = usePageSize('categories', 10)

  const { data: categories, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['categories', bCode],
    queryFn: () => productsAPI.getCategories(),
    retry: 1,
  })

  const createMutation = useMutation({
    mutationFn: (data) => productsAPI.createCategory(data),
    onSuccess: () => { queryClient.invalidateQueries(['categories', bCode]); handleCloseDialog(); setError(null) },
    onError: (err) => setError(err.response?.data?.message || 'Gagal membuat kategori'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productsAPI.updateCategory(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['categories', bCode]); handleCloseDialog(); setError(null) },
    onError: (err) => setError(err.response?.data?.message || 'Gagal memperbarui kategori'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => productsAPI.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries(['categories', bCode]),
    onError: (err) => {
      setError(err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || 'Gagal menghapus kategori')
      setTimeout(() => setError(null), 5000)
    },
  })

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ code: category.code, name: category.name, description: category.description || '', is_active: category.is_active })
    } else {
      setEditingCategory(null)
      setFormData(emptyForm)
    }
    setError(null)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => { setOpenDialog(false); setEditingCategory(null); setError(null) }

  const handleSubmit = () => {
    if (!formData.code || !formData.name) { setError('Kode dan nama wajib diisi'); return }
    editingCategory
      ? updateMutation.mutate({ id: editingCategory.id, data: formData })
      : createMutation.mutate(formData)
  }

  const handleDelete = (category) => {
    setDeleteConfirm(category)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id)
      setDeleteConfirm(null)
    }
  }

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

  const list = Array.isArray(categories) ? categories : (categories?.results || [])
  const filtered = list.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginatedCategories = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <MainLayout title="Kategori">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-gray-800 font-bold text-lg">Daftar Kategori</h2>
          <p className="text-gray-400 text-sm">{list.length} kategori terdaftar</p>
        </div>
        <button onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <RiAddLine size={16} /> Tambah Kategori
        </button>
      </div>

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

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 mb-8 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between gap-4 bg-white">
          <div className="relative flex-1 group">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors text-lg" />
            <input type="text" placeholder="Cari kode atau nama kategori..." 
              value={search} onChange={e => {setSearch(e.target.value); setCurrentPage(1)}}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700 placeholder-gray-400" />
          </div>
          <button onClick={() => {queryClient.invalidateQueries(['categories', bCode])}} className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
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
                    <th className="px-5 py-4">Deskripsi</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm bg-white">
                  {paginatedCategories.length > 0 ? paginatedCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-mono font-semibold text-gray-700 text-xs">{category.code}</td>
                      <td className="px-5 py-4 font-medium text-gray-800">{category.name}</td>
                      <td className="px-5 py-4 text-gray-500">{category.description || '-'}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border uppercase ${category.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {category.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleOpenDialog(category)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><RiEditLine size={15} /></button>
                          <button onClick={() => handleDelete(category)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><RiDeleteBinLine size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">Belum ada kategori.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Box */}
            <div className="p-5 border-t border-gray-50 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500 w-full md:w-1/3">
                Menampilkan <span className="font-semibold text-gray-700">{filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)}</span> dari <span className="font-semibold text-gray-700">{filtered.length}</span> kategori
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

      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kode *</label>
                <div className="relative">
                  <input value={formData.code} readOnly
                    placeholder="Auto-generate" className="w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-xl text-sm font-mono outline-none bg-slate-100 text-gray-600 cursor-default" />
                  <button type="button" onClick={() => setFormData({...formData, code: generateCode(formData.name)})}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-blue-100 text-blue-500 transition-colors" title="Generate ulang kode">
                    <RiRefreshLine size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama *</label>
                <input value={formData.name} onChange={(e) => {
                  const newName = e.target.value
                  setFormData(prev => ({...prev, name: newName, code: !editingCategory ? generateCode(newName) : prev.code}))
                }}
                  placeholder="Nama kategori" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3} placeholder="Deskripsi kategori (opsional)"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.is_active ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-gray-700">Status Aktif</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={handleCloseDialog} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
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
            <h3 className="font-bold text-gray-800 mb-1">Hapus Kategori?</h3>
            <p className="text-sm text-gray-500 mb-4">Kategori <strong>{deleteConfirm.name}</strong> ({deleteConfirm.code}) akan dihapus secara permanen.</p>
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

