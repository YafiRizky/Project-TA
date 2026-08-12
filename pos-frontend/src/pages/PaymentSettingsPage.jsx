import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import MainLayout from '../components/MainLayout'
import { paymentMethodsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import {
  RiAddLine, RiEditLine, RiDeleteBinLine, RiToggleLine, RiToggleFill,
  RiCloseLine, RiBankCardLine, RiQrCodeLine, RiWalletLine, RiMoneyDollarCircleLine,
  RiCheckboxCircleLine, RiCloseCircleLine, RiImageAddLine, RiBankLine
} from 'react-icons/ri'

const METHOD_TYPES = [
  { value: 'QRIS', label: 'QRIS', icon: RiQrCodeLine, color: 'bg-blue-100 text-blue-700' },
  { value: 'TRANSFER', label: 'Transfer Bank', icon: RiBankLine, color: 'bg-purple-100 text-purple-700' },
  { value: 'EWALLET', label: 'E-Wallet', icon: RiWalletLine, color: 'bg-amber-100 text-amber-700' },
  { value: 'CARD', label: 'Kartu Debit/Kredit', icon: RiBankCardLine, color: 'bg-rose-100 text-rose-700' },
]

const XENDIT_CHANNELS = {
  TRANSFER: [
    { value: 'BCA', label: 'BCA' },
    { value: 'BNI', label: 'BNI' },
    { value: 'BRI', label: 'BRI' },
    { value: 'MANDIRI', label: 'Mandiri' },
    { value: 'PERMATA', label: 'Permata' },
    { value: 'BSI', label: 'BSI' },
    { value: 'CIMB', label: 'CIMB Niaga' },
    { value: 'BJB', label: 'BJB' },
  ],
  EWALLET: [
    { value: 'ID_DANA', label: 'Dana' },
    { value: 'ID_OVO', label: 'OVO' },
    { value: 'ID_SHOPEEPAY', label: 'ShopeePay' },
    { value: 'ID_LINKAJA', label: 'LinkAja' },
    { value: 'ID_ASTRAPAY', label: 'AstraPay' },
  ],
}

// All types including cash (for display/lookup only)
const ALL_METHOD_TYPES = [
  { value: 'CASH', label: 'Tunai', icon: RiMoneyDollarCircleLine, color: 'bg-green-100 text-green-700' },
  ...METHOD_TYPES,
]

export default function PaymentSettingsPage() {
  const queryClient = useQueryClient()
  const { business } = useAuth()
  const bCode = business?.code
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [formData, setFormData] = useState({ method_type: '', name: '', account_number: '', account_name: '', instructions: '', use_xendit: false, xendit_channel: '' })
  const [qrisFile, setQrisFile] = useState(null)
  const [qrisPreview, setQrisPreview] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['payment-methods', bCode],
    queryFn: paymentMethodsAPI.getMethods,
  })
  const methods = data?.methods || []

  const createMutation = useMutation({
    mutationFn: paymentMethodsAPI.createMethod,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['payment-methods', bCode])
      closeModal()
      setSuccess(data.message)
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (err) => setError(err.response?.data?.error || 'Gagal menambahkan')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => paymentMethodsAPI.updateMethod(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['payment-methods', bCode])
      closeModal()
      setSuccess(data.message)
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (err) => setError(err.response?.data?.error || 'Gagal mengupdate')
  })

  const deleteMutation = useMutation({
    mutationFn: paymentMethodsAPI.deleteMethod,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['payment-methods', bCode])
      setShowDeleteConfirm(false)
      setSuccess(data.message)
      setTimeout(() => setSuccess(''), 3000)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: paymentMethodsAPI.toggleMethod,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['payment-methods', bCode])
      setSuccess(data.message)
      setTimeout(() => setSuccess(''), 3000)
    },
  })

  const closeModal = () => {
    setShowModal(false)
    setEditingMethod(null)
    setFormData({ method_type: '', name: '', account_number: '', account_name: '', instructions: '', use_xendit: false, xendit_channel: '' })
    setQrisFile(null)
    setQrisPreview(null)
    setError('')
  }

  const openCreate = () => { closeModal(); setShowModal(true) }
  const openEdit = (method) => {
    setEditingMethod(method)
    setFormData({
      method_type: method.method_type,
      name: method.name,
      account_number: method.account_number || '',
      account_name: method.account_name || '',
      instructions: method.instructions || '',
      use_xendit: method.use_xendit || false,
      xendit_channel: method.xendit_channel || '',
    })
    setQrisPreview(method.qris_image)
    setShowModal(true)
  }

  const handleSubmit = () => {
    setError('')
    const fd = new FormData()
    fd.append('method_type', formData.method_type)
    fd.append('name', formData.name)
    fd.append('account_number', formData.account_number)
    fd.append('account_name', formData.account_name)
    fd.append('instructions', formData.instructions)
    fd.append('use_xendit', formData.use_xendit)
    fd.append('xendit_channel', formData.xendit_channel)
    if (qrisFile) fd.append('qris_image', qrisFile)

    if (editingMethod) {
      updateMutation.mutate({ id: editingMethod.id, data: fd })
    } else {
      createMutation.mutate(fd)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setQrisFile(file)
      if (qrisPreview) URL.revokeObjectURL(qrisPreview)
      setQrisPreview(URL.createObjectURL(file))
    }
  }

  const getTypeConfig = (type) => ALL_METHOD_TYPES.find(t => t.value === type) || ALL_METHOD_TYPES[0]
  const showAccountFields = ['TRANSFER', 'EWALLET', 'CARD'].includes(formData.method_type)
  const showQrisField = formData.method_type === 'QRIS'

  return (
    <MainLayout title="Pengaturan Pembayaran">
      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
          <RiCheckboxCircleLine size={18} /> {success}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Pengaturan Metode Pembayaran</h2>
          <p className="text-gray-400 text-sm">Kelola metode pembayaran yang tersedia untuk kasir</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
          <RiAddLine size={16} /> Tambah Metode
        </button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <RiBankCardLine size={16} className="text-blue-600" />
        </div>
        <p className="text-sm text-blue-700">
          Metode pembayaran yang Anda aktifkan di sini akan muncul sebagai opsi bagi kasir saat proses checkout.
          Untuk QRIS, upload gambar QR code agar customer bisa langsung scan.
        </p>
      </div>

      {/* Methods Grid */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-400">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Memuat data...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Permanent Cash Card — always first, built-in */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100 text-green-700">
                  <RiMoneyDollarCircleLine size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Tunai (Cash)</p>
                  <p className="text-xs text-gray-400">Pembayaran tunai</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Bawaan</span>
            </div>
            <p className="text-xs text-gray-400">Metode bawaan sistem. Selalu aktif dan tersedia untuk semua kasir.</p>
          </div>

          {methods.filter(m => m.method_type !== 'CASH').map(method => {
            const config = getTypeConfig(method.method_type)
            const Icon = config.icon
            return (
              <div key={method.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all ${!method.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{method.name}</p>
                      <p className="text-xs text-gray-400">{method.method_type_display}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${method.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {method.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                  {method.use_xendit && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 ml-1">Xendit</span>
                  )}
                </div>

                {method.account_number && (
                  <div className="text-xs text-gray-500 mb-1">
                    <span className="text-gray-400">No. Rekening:</span> <span className="font-mono">{method.account_number}</span>
                  </div>
                )}
                {method.account_name && (
                  <div className="text-xs text-gray-500 mb-1">
                    <span className="text-gray-400">A/N:</span> {method.account_name}
                  </div>
                )}
                {method.method_type === 'QRIS' && method.qris_image && (
                  <div className="mt-2 mb-2">
                    <img src={method.qris_image} alt="QRIS" className="w-24 h-24 object-contain rounded-lg border border-gray-200" />
                  </div>
                )}
                {method.instructions && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{method.instructions}</p>
                )}

                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(method)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <RiEditLine size={15} />
                  </button>
                  <button onClick={() => toggleMutation.mutate(method.id)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Toggle">
                    {method.is_active ? <RiToggleFill size={15} /> : <RiToggleLine size={15} />}
                  </button>
                  <button onClick={() => { setSelectedMethod(method); setShowDeleteConfirm(true) }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                    <RiDeleteBinLine size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">{editingMethod ? 'Edit Metode' : 'Tambah Metode Pembayaran'}</h3>
              <button onClick={closeModal} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <RiCloseLine size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

              {/* Method Type */}
              {!editingMethod && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Pembayaran</label>
                  <div className="grid grid-cols-2 gap-2">
                    {METHOD_TYPES.map(type => {
                      const Icon = type.icon
                      const selected = formData.method_type === type.value
                      return (
                        <button key={type.value} type="button" onClick={() => setFormData({...formData, method_type: type.value})}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          <Icon size={16} /> {type.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder={formData.method_type === 'QRIS' ? 'QRIS Toko Makmur' : formData.method_type === 'TRANSFER' ? 'BCA' : formData.method_type === 'EWALLET' ? 'GoPay' : 'Nama metode'}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors" />
              </div>

              {/* Account fields for Transfer/E-Wallet/Card */}
              {showAccountFields && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Rekening/Akun</label>
                    <input type="text" value={formData.account_number} onChange={e => setFormData({...formData, account_number: e.target.value})}
                      placeholder="1234567890"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Pemilik</label>
                    <input type="text" value={formData.account_name} onChange={e => setFormData({...formData, account_name: e.target.value})}
                      placeholder="Nama pemilik rekening"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors" />
                  </div>
                </>
              )}

              {/* QRIS Image upload */}
              {showQrisField && !formData.use_xendit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gambar QR Code QRIS (Manual)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('qris-upload').click()}>
                    {qrisPreview ? (
                      <img src={qrisPreview} alt="QRIS Preview" className="w-32 h-32 object-contain mx-auto rounded-lg" />
                    ) : (
                      <>
                        <RiImageAddLine size={32} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Klik untuk upload gambar QR</p>
                        <p className="text-xs text-gray-400">Screenshot QR code QRIS Anda</p>
                      </>
                    )}
                    <input id="qris-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </div>
                </div>
              )}

              {/* Xendit Integration Toggle */}
              {['QRIS', 'TRANSFER', 'EWALLET'].includes(formData.method_type) && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Gunakan Xendit</p>
                      <p className="text-xs text-blue-600 mt-0.5">Proses pembayaran otomatis via Xendit Payment Gateway</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, use_xendit: !formData.use_xendit, xendit_channel: ''})}
                      className={`relative w-12 h-6 rounded-full transition-colors ${formData.use_xendit ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${formData.use_xendit ? 'translate-x-6' : ''}`} />
                    </button>
                  </div>

                  {/* Channel Picker (only for TRANSFER and EWALLET when Xendit is ON) */}
                  {formData.use_xendit && formData.method_type === 'TRANSFER' && (
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1.5">Pilih Bank</label>
                      <select
                        value={formData.xendit_channel}
                        onChange={e => setFormData({...formData, xendit_channel: e.target.value})}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        <option value="">Pilih bank...</option>
                        {XENDIT_CHANNELS.TRANSFER.map(ch => (
                          <option key={ch.value} value={ch.value}>{ch.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.use_xendit && formData.method_type === 'EWALLET' && (
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1.5">Pilih E-Wallet</label>
                      <select
                        value={formData.xendit_channel}
                        onChange={e => setFormData({...formData, xendit_channel: e.target.value})}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        <option value="">Pilih e-wallet...</option>
                        {XENDIT_CHANNELS.EWALLET.map(ch => (
                          <option key={ch.value} value={ch.value}>{ch.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.use_xendit && formData.method_type === 'QRIS' && (
                    <p className="text-xs text-blue-600 italic">✓ QRIS akan digenerate otomatis per transaksi (tidak perlu upload gambar)</p>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Instruksi Tambahan (opsional)</label>
                <textarea value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})}
                  placeholder="Instruksi pembayaran untuk kasir..."
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors resize-none" />
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400">
                {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : (editingMethod ? 'Simpan' : 'Tambah')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && selectedMethod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <RiDeleteBinLine size={24} className="text-red-600" />
              </div>
              <p className="text-gray-700 text-sm mb-1">Hapus metode pembayaran <strong>{selectedMethod.name}</strong>?</p>
              <p className="text-gray-400 text-xs">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={() => deleteMutation.mutate(selectedMethod.id)} disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:bg-red-400">
                {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
