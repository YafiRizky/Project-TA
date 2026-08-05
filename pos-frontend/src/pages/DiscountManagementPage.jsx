import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  RiPriceTag3Line,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCloseLine,
  RiSaveLine,
  RiInformationLine
} from 'react-icons/ri'
import MainLayout from '../components/MainLayout'
import { promotionsAPI, productsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { formatNumberInput, parseFormattedNumber } from '../utils/formatCurrency'
import Select from 'react-select'
import Pagination from '../components/Pagination'
import { usePageSize } from '../hooks/usePageSize'
import { RiSearchLine, RiRefreshLine } from 'react-icons/ri'

export default function DiscountManagementPage() {
  const queryClient = useQueryClient()
  const { business } = useAuth()
  const bCode = business?.code
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    min_quantity: 1,
    products: [],
    is_active: true
  })
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = usePageSize('discounts', 10)

  const { data: discounts, isLoading } = useQuery({
    queryKey: ['discounts', bCode],
    queryFn: promotionsAPI.getDiscounts
  })

  const { data: productsData } = useQuery({
    queryKey: ['products', bCode, { limit: 1000 }],
    queryFn: () => productsAPI.getProducts({ limit: 1000 })
  })

  const discountList = Array.isArray(discounts) ? discounts : (discounts?.results || [])
  const filteredDiscounts = discountList.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  )
  
  const totalPages = Math.ceil(filteredDiscounts.length / pageSize)
  const paginatedDiscounts = filteredDiscounts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const createMutation = useMutation({
    mutationFn: promotionsAPI.createDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries(['discounts', bCode])
      closeModal()
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => promotionsAPI.updateDiscount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discounts', bCode])
      closeModal()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: promotionsAPI.deleteDiscount,
    onSuccess: () => queryClient.invalidateQueries(['discounts', bCode])
  })

  const productOptions = (Array.isArray(productsData) ? productsData : productsData?.results || []).map(p => ({
    value: p.id,
    label: `${p.name} - Rp ${Number(p.selling_price).toLocaleString('id-ID')}`
  }))

  const openAddModal = () => {
    setEditingId(null)
    setFormData({
      name: '',
      discount_type: 'PERCENTAGE',
      discount_value: '',
      min_quantity: 1,
      products: [],
      is_active: true
    })
    setIsModalOpen(true)
  }

  const openEditModal = (discount) => {
    setEditingId(discount.id)
    setFormData({
      name: discount.name,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      min_quantity: discount.min_quantity,
      products: discount.products_detail?.map(p => p.id) || [],
      is_active: discount.is_active
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Hapus diskon ini?')) {
      deleteMutation.mutate(id)
    }
  }

  const toggleStatus = (discount) => {
    updateMutation.mutate({
      id: discount.id,
      data: { is_active: !discount.is_active }
    })
  }

  return (
    <MainLayout title="Manajemen Diskon">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <RiPriceTag3Line className="text-blue-600" />
              Promo & Diskon
            </h1>
            <p className="text-gray-500 text-sm mt-1">Kelola aturan diskon untuk diterapkan otomatis di Kasir</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <RiAddLine /> Tambah Diskon
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 mb-8 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between gap-4 bg-white">
            <div className="relative flex-1 group">
              <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors text-lg" />
              <input type="text" placeholder="Cari nama diskon..." 
                value={search} onChange={e => {setSearch(e.target.value); setCurrentPage(1)}}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700 placeholder-gray-400" />
            </div>
            <button onClick={() => {queryClient.invalidateQueries(['discounts', bCode])}} className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
              <RiRefreshLine size={18} />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"></div></div>
          ) : filteredDiscounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <RiPriceTag3Line className="w-16 h-16 text-gray-200 mb-4" />
              <p>{search ? 'Diskon tidak ditemukan' : 'Belum ada aturan diskon yang dibuat'}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-5 py-4">Nama Diskon</th>
                      <th className="px-5 py-4">Tipe & Nilai</th>
                      <th className="px-5 py-4">Syarat Qty</th>
                      <th className="px-5 py-4">Produk Berlaku</th>
                      <th className="px-5 py-4 text-center">Status</th>
                      <th className="px-5 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm bg-white">
                    {paginatedDiscounts.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-medium text-gray-900">{item.name}</td>
                        <td className="px-5 py-4 font-mono font-semibold text-gray-700 text-xs">
                          {item.discount_type === 'PERCENTAGE' 
                            ? `${Number(item.discount_value)}%` 
                            : `Rp ${Number(item.discount_value).toLocaleString('id-ID')}`}
                        </td>
                        <td className="px-5 py-4 text-gray-600">Min {item.min_quantity} item</td>
                        <td className="px-5 py-4 text-gray-600">
                          {item.products_detail?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.products_detail.slice(0, 2).map(p => (
                                <span key={p.id} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">
                                  {p.name}
                                </span>
                              ))}
                              {item.products_detail.length > 2 && (
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                  +{item.products_detail.length - 2} lain
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Tidak ada produk spesifik</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => toggleStatus(item)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${item.is_active ? 'bg-emerald-500' : 'bg-gray-200'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${item.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </button>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <RiEditLine size={15}/>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <RiDeleteBinLine size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Box */}
              <div className="p-5 border-t border-gray-50 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500 w-full md:w-1/3">
                  Menampilkan <span className="font-semibold text-gray-700">{filteredDiscounts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredDiscounts.length)}</span> dari <span className="font-semibold text-gray-700">{filteredDiscounts.length}</span> diskon
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Diskon' : 'Tambah Diskon Baru'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <RiCloseLine className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Promo / Diskon</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="Contoh: Promo Lebaran 10%"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Diskon</label>
                  <select
                    value={formData.discount_type}
                    onChange={e => setFormData({...formData, discount_type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="PERCENTAGE">Persen (%)</option>
                    <option value="NOMINAL">Nominal (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Diskon</label>
                  {formData.discount_type === 'NOMINAL' ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={formatNumberInput(formData.discount_value)}
                      onChange={e => setFormData({...formData, discount_value: parseFormattedNumber(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="Contoh: 5.000"
                    />
                  ) : (
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      step="0.01"
                      value={formData.discount_value}
                      onChange={e => setFormData({...formData, discount_value: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="Contoh: 10"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Minimal Kuantitas Beli <RiInformationLine className="text-blue-500" title="Pembeli harus membeli minimal jumlah item ini agar diskon ter-apply pada produk yang berlaku."/>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.min_quantity}
                  onChange={e => setFormData({...formData, min_quantity: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produk Yang Berlaku</label>
                <Select
                  isMulti
                  options={productOptions}
                  value={productOptions.filter(o => formData.products.includes(o.value))}
                  onChange={selected => setFormData({...formData, products: selected.map(s => s.value)})}
                  placeholder="Pilih produk..."
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ada produk spesifik. (Diskon hanya berlaku untuk produk yang dipilih)</p>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <RiSaveLine /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
