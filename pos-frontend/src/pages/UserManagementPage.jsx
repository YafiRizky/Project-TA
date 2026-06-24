import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import MainLayout from '../components/MainLayout'
import { kasirAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { RiUserAddLine, RiEditLine, RiDeleteBinLine, RiLockPasswordLine, RiToggleLine, RiToggleFill, RiCloseLine, RiUserLine, RiTeamLine, RiCheckboxCircleLine, RiCloseCircleLine, RiSearchLine, RiRefreshLine } from 'react-icons/ri'
import Pagination from '../components/Pagination'
import { usePageSize } from '../hooks/usePageSize'

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export default function UserManagementPage() {
  const queryClient = useQueryClient()
  const { business } = useAuth()
  const bCode = business?.code
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showResetPwModal, setShowResetPwModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showToggleConfirm, setShowToggleConfirm] = useState(false)
  const [selectedKasir, setSelectedKasir] = useState(null)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({ username: '', password: '', full_name: '', email: '', schedule: '' })
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = usePageSize(10)

  // Fetch kasir list
  const { data, isLoading, isError } = useQuery({
    queryKey: ['kasir-list', bCode],
    queryFn: kasirAPI.getKasirList,
  })
  const kasirList = data?.kasir || []
  const filteredList = kasirList.filter(k =>
    k.full_name.toLowerCase().includes(search.toLowerCase()) ||
    k.username.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredList.length / pageSize)
  const paginatedKasir = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const totalKasir = kasirList.length
  const activeKasir = kasirList.filter(k => k.is_active).length
  const inactiveKasir = totalKasir - activeKasir

  // Mutations
  const createMutation = useMutation({
    mutationFn: kasirAPI.createKasir,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['kasir-list', bCode])
      setShowCreateModal(false)
      resetForm()
      setSuccess(data.message)
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (err) => setError(err.response?.data?.error || 'Gagal membuat kasir')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => kasirAPI.updateKasir(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['kasir-list', bCode])
      setShowEditModal(false)
      setSuccess(data.message)
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (err) => setError(err.response?.data?.error || 'Gagal mengupdate kasir')
  })

  const deleteMutation = useMutation({
    mutationFn: kasirAPI.deleteKasir,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['kasir-list', bCode])
      setShowDeleteConfirm(false)
      setSuccess(data.message)
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (err) => setError(err.response?.data?.error || 'Gagal menghapus kasir')
  })

  const toggleMutation = useMutation({
    mutationFn: kasirAPI.toggleKasirStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['kasir-list', bCode])
      setShowToggleConfirm(false)
      setSuccess(data.message)
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (err) => setError(err.response?.data?.error || 'Gagal mengubah status')
  })

  const resetPwMutation = useMutation({
    mutationFn: ({ id, data }) => kasirAPI.resetKasirPassword(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['kasir-list', bCode])
      setShowResetPwModal(false)
      setNewPassword('')
      setSuccess(data.message)
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (err) => setError(err.response?.data?.error || 'Gagal mereset password')
  })

  const resetForm = () => {
    setFormData({ username: '', password: '', full_name: '', email: '', schedule: '' })
    setError('')
  }

  const openCreate = () => { resetForm(); setShowCreateModal(true) }
  const openEdit = (kasir) => {
    setSelectedKasir(kasir)
    setFormData({ username: kasir.username, full_name: kasir.full_name, email: kasir.email, schedule: kasir.schedule || '' })
    setError('')
    setShowEditModal(true)
  }
  const openResetPw = (kasir) => { setSelectedKasir(kasir); setNewPassword(''); setError(''); setShowResetPwModal(true) }
  const openDelete = (kasir) => { setSelectedKasir(kasir); setShowDeleteConfirm(true) }
  const openToggle = (kasir) => { setSelectedKasir(kasir); setShowToggleConfirm(true) }

  const handleCreate = () => {
    setError('')
    if (!formData.username || formData.username.trim().length < 3) {
      setError('Username wajib diisi, minimal 3 karakter')
      return
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password wajib diisi, minimal 6 karakter')
      return
    }
    if (!formData.full_name || !formData.full_name.trim()) {
      setError('Nama lengkap wajib diisi')
      return
    }
    createMutation.mutate(formData)
  }
  const handleUpdate = () => {
    setError('')
    updateMutation.mutate({ id: selectedKasir.id, data: formData })
  }
  const handleDelete = () => deleteMutation.mutate(selectedKasir.id)
  const handleToggle = () => toggleMutation.mutate(selectedKasir.id)
  const handleResetPw = () => {
    setError('')
    resetPwMutation.mutate({ id: selectedKasir.id, data: { new_password: newPassword } })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const colors = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700', 'bg-rose-100 text-rose-700']

  return (
    <MainLayout title="Kelola Kasir">
      {/* Success toast */}
      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
          <RiCheckboxCircleLine size={18} /> {success}
        </div>
      )}
      {/* Error toast */}
      {error && !showCreateModal && !showEditModal && !showResetPwModal && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
          <RiCloseCircleLine size={18} /> {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Manajemen Kasir</h2>
          <p className="text-gray-400 text-sm">Tambah, edit, dan kelola akun kasir bisnis Anda</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
          <RiUserAddLine size={16} /> Tambah Kasir
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><RiTeamLine size={20} className="text-blue-600" /></div>
            <div><p className="text-gray-500 text-xs">Total Kasir</p><p className="text-xl font-bold text-gray-800">{totalKasir}</p></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><RiCheckboxCircleLine size={20} className="text-green-600" /></div>
            <div><p className="text-gray-500 text-xs">Kasir Aktif</p><p className="text-xl font-bold text-green-600">{activeKasir}</p></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><RiCloseCircleLine size={20} className="text-gray-400" /></div>
            <div><p className="text-gray-500 text-xs">Kasir Nonaktif</p><p className="text-xl font-bold text-gray-500">{inactiveKasir}</p></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 mb-8 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between gap-4 bg-white">
          <div className="relative flex-1 group">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors text-lg" />
            <input type="text" placeholder="Cari nama atau username kasir..." 
              value={search} onChange={e => {setSearch(e.target.value); setCurrentPage(1)}}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-gray-700 placeholder-gray-400" />
          </div>
          <button onClick={() => {queryClient.invalidateQueries(['kasir-list', bCode])}} className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
            <RiRefreshLine size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-red-500">Gagal memuat data kasir</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="px-5 py-4">Nama</th>
                    <th className="px-5 py-4">Username</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Jadwal</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm bg-white">
                  {paginatedKasir.length > 0 ? paginatedKasir.map((kasir, idx) => (
                    <tr key={kasir.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${colors[idx % colors.length]}`}>
                            {getInitials(kasir.full_name)}
                          </div>
                          <span className="font-medium text-gray-800">{kasir.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-mono font-semibold text-xs">{kasir.username}</td>
                      <td className="px-5 py-4 text-gray-500">{kasir.email || '-'}</td>
                      <td className="px-5 py-4 text-gray-500">{kasir.schedule || '-'}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border uppercase ${kasir.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {kasir.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(kasir)} title="Edit" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <RiEditLine size={15} />
                          </button>
                          <button onClick={() => openToggle(kasir)} title={kasir.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                            {kasir.is_active ? <RiToggleFill size={15} /> : <RiToggleLine size={15} />}
                          </button>
                          <button onClick={() => openResetPw(kasir)} title="Reset Password" className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                            <RiLockPasswordLine size={15} />
                          </button>
                          <button onClick={() => openDelete(kasir)} title="Hapus" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <RiDeleteBinLine size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3"><RiUserLine size={24} className="text-gray-400" /></div>
                        <p className="text-gray-500 font-semibold text-sm mb-1">{search ? 'Kasir tidak ditemukan' : 'Belum ada kasir'}</p>
                        <p className="text-gray-400 text-xs">{search ? 'Coba kata kunci lain' : 'Klik "Tambah Kasir" untuk menambahkan kasir pertama Anda'}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination Box */}
            <div className="p-5 border-t border-gray-50 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500 w-full md:w-1/3">
                Menampilkan <span className="font-semibold text-gray-700">{filteredList.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredList.length)}</span> dari <span className="font-semibold text-gray-700">{filteredList.length}</span> kasir
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

      {/* Create Modal */}
      {showCreateModal && (
        <Modal title="Tambah Kasir Baru" onClose={() => setShowCreateModal(false)}>
          {error && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <div className="space-y-4">
            <Field label="Username *" value={formData.username} onChange={(v) => setFormData({...formData, username: v})} placeholder="min 3 karakter" />
            <Field label="Password *" value={formData.password} onChange={(v) => setFormData({...formData, password: v})} placeholder="min 6 karakter" type="password" />
            <Field label="Nama Lengkap *" value={formData.full_name} onChange={(v) => setFormData({...formData, full_name: v})} placeholder="Nama lengkap kasir" />
            <Field label="Email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} placeholder="Opsional" type="email" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jadwal Kerja</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => {
                  const selected = formData.schedule.split(',').map(d => d.trim()).includes(day)
                  return (
                    <button key={day} type="button" onClick={() => {
                      const days = formData.schedule ? formData.schedule.split(',').map(d => d.trim()).filter(Boolean) : []
                      const newDays = selected ? days.filter(d => d !== day) : [...days, day]
                      setFormData({...formData, schedule: newDays.join(',')})
                    }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button>
            <button onClick={handleCreate} disabled={createMutation.isPending}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400">
              {createMutation.isPending ? 'Membuat...' : 'Buat Kasir'}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedKasir && (
        <Modal title={`Edit Kasir - ${selectedKasir.full_name}`} onClose={() => setShowEditModal(false)}>
          {error && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <div className="space-y-4">
            <Field label="Username" value={formData.username} onChange={(v) => setFormData({...formData, username: v})} />
            <Field label="Nama Lengkap" value={formData.full_name} onChange={(v) => setFormData({...formData, full_name: v})} />
            <Field label="Email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} type="email" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jadwal Kerja</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => {
                  const selected = formData.schedule.split(',').map(d => d.trim()).includes(day)
                  return (
                    <button key={day} type="button" onClick={() => {
                      const days = formData.schedule ? formData.schedule.split(',').map(d => d.trim()).filter(Boolean) : []
                      const newDays = selected ? days.filter(d => d !== day) : [...days, day]
                      setFormData({...formData, schedule: newDays.join(',')})
                    }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button>
            <button onClick={handleUpdate} disabled={updateMutation.isPending}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400">
              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {showResetPwModal && selectedKasir && (
        <Modal title={`Reset Password - ${selectedKasir.full_name}`} onClose={() => setShowResetPwModal(false)}>
          {error && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <p className="text-sm text-gray-500 mb-4">Masukkan password baru untuk kasir <strong>{selectedKasir.full_name}</strong>.</p>
          <Field label="Password Baru" value={newPassword} onChange={setNewPassword} placeholder="min 6 karakter" type="password" />
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowResetPwModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button>
            <button onClick={handleResetPw} disabled={resetPwMutation.isPending}
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:bg-purple-400">
              {resetPwMutation.isPending ? 'Mereset...' : 'Reset Password'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && selectedKasir && (
        <Modal title="Konfirmasi Hapus" onClose={() => setShowDeleteConfirm(false)}>
          <div className="text-center mb-5">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <RiDeleteBinLine size={24} className="text-red-600" />
            </div>
            <p className="text-gray-700 text-sm">Yakin ingin menonaktifkan kasir <strong>{selectedKasir.full_name}</strong>?</p>
            <p className="text-gray-400 text-xs mt-1">Kasir tidak akan bisa login setelah dinonaktifkan.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button>
            <button onClick={handleDelete} disabled={deleteMutation.isPending}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:bg-red-400">
              {deleteMutation.isPending ? 'Menghapus...' : 'Ya, Nonaktifkan'}
            </button>
          </div>
        </Modal>
      )}

      {/* Toggle Confirmation */}
      {showToggleConfirm && selectedKasir && (
        <Modal title="Konfirmasi Ubah Status" onClose={() => setShowToggleConfirm(false)}>
          <div className="text-center mb-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${selectedKasir.is_active ? 'bg-amber-100' : 'bg-green-100'}`}>
              {selectedKasir.is_active ? <RiToggleLine size={24} className="text-amber-600" /> : <RiToggleFill size={24} className="text-green-600" />}
            </div>
            <p className="text-gray-700 text-sm">
              {selectedKasir.is_active
                ? <>Yakin ingin <strong>menonaktifkan</strong> kasir <strong>{selectedKasir.full_name}</strong>?</>
                : <>Yakin ingin <strong>mengaktifkan kembali</strong> kasir <strong>{selectedKasir.full_name}</strong>?</>
              }
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowToggleConfirm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button>
            <button onClick={handleToggle} disabled={toggleMutation.isPending}
              className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors ${selectedKasir.is_active ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400' : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'}`}>
              {toggleMutation.isPending ? 'Memproses...' : (selectedKasir.is_active ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan')}
            </button>
          </div>
        </Modal>
      )}
    </MainLayout>
  )
}

// Reusable components
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <RiCloseLine size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder = '', type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors" />
    </div>
  )
}
