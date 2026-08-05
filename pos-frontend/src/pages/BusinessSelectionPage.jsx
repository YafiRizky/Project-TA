import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'
import { Store, Plus, Building2, LogOut, ChevronRight, Loader2, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import kodeposData from '../data/kodepos.json'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

const ID_API = 'https://www.emsifa.com/api-wilayah-indonesia/api'
const titleCase = (s) => s ? s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : ''

const BUSINESS_TYPES = [
  'Warung / Toko Kelontong',
  'Minimarket',
  'Cafe / Restoran',
  'Toko Pakaian / Fashion',
  'Apotek / Toko Obat',
  'Toko Elektronik',
  'Bengkel',
  'Salon / Barbershop',
  'Toko Bangunan',
  'Lainnya',
]

export default function BusinessSelectionPage() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [switchingTo, setSwitchingTo] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    business_name: '',
    business_type: '',
    phone: '',
    address: '',
    country: 'ID',
    province: '',
    city: '',
    district: '',
    postal_code: ''
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [customBusinessType, setCustomBusinessType] = useState('')

  // Region states
  const selectedCountry = 'ID'
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const [idProvinces, setIdProvinces] = useState([])
  const [idCities, setIdCities] = useState([])
  const [idDistricts, setIdDistricts] = useState([])
  const [postalCodes, setPostalCodes] = useState([])
  const [useCustomPostalCode, setUseCustomPostalCode] = useState(false)
  
  const { user, logout, updateBusinessData } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchBusinesses()
  }, [])

  // Fetch Indonesian provinces on mount
  useEffect(() => {
    fetch(`${ID_API}/provinces.json`)
      .then(r => r.json())
      .then(data => setIdProvinces(data.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => setIdProvinces([]))
  }, [])



  // Cascade: reset city & kecamatan when province changes + fetch cities (Indonesia)
  useEffect(() => {
    setSelectedCity('')
    setSelectedDistrictId('')
    setIdDistricts([])
    setCreateFormData(prev => ({ ...prev, city: '', district: '' }))
    if (selectedCountry === 'ID' && selectedProvince) {
      fetch(`${ID_API}/regencies/${selectedProvince}.json`)
        .then(r => r.json())
        .then(data => setIdCities(data.sort((a, b) => a.name.localeCompare(b.name))))
        .catch(() => setIdCities([]))
    } else if (selectedCountry === 'ID') {
      setIdCities([])
    }
  }, [selectedProvince, selectedCountry])

  // Cascade: fetch kecamatan when city changes (Indonesia)
  useEffect(() => {
    setSelectedDistrictId('')
    setCreateFormData(prev => ({ ...prev, district: '' }))
    if (selectedCountry === 'ID' && selectedCity) {
      fetch(`${ID_API}/districts/${selectedCity}.json`)
        .then(r => r.json())
        .then(data => setIdDistricts(data.sort((a, b) => a.name.localeCompare(b.name))))
        .catch(() => setIdDistricts([]))
    } else {
      setIdDistricts([])
    }
  }, [selectedCity, selectedCountry])

  const handleProvinceChange = (e) => {
    const val = e.target.value
    setSelectedProvince(val)
    const prov = idProvinces.find(p => p.id === val)
    setCreateFormData(prev => ({ ...prev, province: prov ? titleCase(prov.name) : '' }))
  }

  const handleCityChange = (e) => {
    const val = e.target.value
    setSelectedCity(val)
    const city = idCities.find(c => c.id === val)
    setCreateFormData(prev => ({ ...prev, city: city ? titleCase(city.name) : '' }))
  }

  const handleDistrictChange = (e) => {
    const val = e.target.value
    setSelectedDistrictId(val)
    const dist = idDistricts.find(d => d.id === val)
    setCreateFormData(prev => ({ ...prev, district: dist ? titleCase(dist.name) : '' }))
    // Reset postal code
    setPostalCodes([])
    setUseCustomPostalCode(false)
    setCreateFormData(prev => ({ ...prev, postal_code: '' }))
  }

  // Lookup postal codes from local JSON when district is selected
  useEffect(() => {
    if (!selectedDistrictId) {
      setPostalCodes([])
      return
    }
    const dist = idDistricts.find(d => d.id === selectedDistrictId)
    if (!dist) return

    // Get city name from selected city (strip KABUPATEN/KOTA prefix)
    const cityObj = idCities.find(c => c.id === selectedCity)
    const rawCityName = (cityObj?.name || '').toUpperCase().trim()
    const cityName = rawCityName.replace(/^(KABUPATEN|KOTA)\s+/i, '')
    const distName = (dist.name || '').toUpperCase().trim()

    // Try exact match: "KOTA/KAB|KECAMATAN"
    const key = `${cityName}|${distName}`
    let codes = kodeposData[key] || []

    // If no match, try with full name (including prefix)
    if (codes.length === 0) {
      codes = kodeposData[`${rawCityName}|${distName}`] || []
    }

    // If still no match, try searching all keys containing the district name
    if (codes.length === 0) {
      const fallbackKey = Object.keys(kodeposData).find(k => k.endsWith(`|${distName}`))
      if (fallbackKey) codes = kodeposData[fallbackKey]
    }

    if (codes && codes.length > 0) {
      setPostalCodes(codes)
      setCreateFormData(prev => ({ ...prev, postal_code: codes[0] }))
    } else {
      setPostalCodes([])
    }
  }, [selectedDistrictId, idDistricts, idCities, selectedCity])

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      const response = await authAPI.getMyBusinesses()
      if (response.businesses) {
        setBusinesses(response.businesses)
      }
    } catch (error) {
      toast.error('Gagal mengambil daftar bisnis')
    } finally {
      setLoading(false)
    }
  }

  const queryClient = useQueryClient()

  const handleSelectBusiness = async (businessCode) => {
    try {
      setSwitchingTo(businessCode)
      const response = await authAPI.switchBranch(businessCode)
      if (response.success) {
        // Update tokens
        localStorage.setItem('access_token', response.tokens.access)
        localStorage.setItem('refresh_token', response.tokens.refresh)
        
        // CRITICAL FIX: Clear ALL react-query cache to prevent multi-tenant data leak
        // Without this, cached data from the previous branch would persist and display
        // in the new branch context, causing cross-branch data contamination.
        queryClient.clear()
        
        // Update business context
        const businessInfo = {
          id: response.business.id,
          code: response.business.business_code,
          name: response.business.business_name,
          type: response.business.business_type
        }
        updateBusinessData(businessInfo)
        
        toast.success(`Berhasil masuk ke ${response.business.business_name}`)
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal beralih ke bisnis')
    } finally {
      setSwitchingTo(null)
    }
  }

  const handleCreateBusiness = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!createFormData.business_name || !createFormData.business_type || !createFormData.country || !createFormData.province || !createFormData.city) {
      toast.error('Mohon isi semua field wajib (*)')
      return
    }

    try {
      setCreateLoading(true)
      
      const finalBusinessType = createFormData.business_type === 'Lainnya' && customBusinessType.trim()
        ? customBusinessType.trim()
        : createFormData.business_type

      const response = await authAPI.createBranch({
        business_name: createFormData.business_name,
        business_type: finalBusinessType,
        phone: createFormData.phone,
        address: createFormData.address,
        country: createFormData.country,
        province: createFormData.province,
        city: createFormData.city,
        district: createFormData.district,
        postal_code: createFormData.postal_code,
      })
      
      if (response.success) {
        toast.success('Cabang baru berhasil dibuat!')
        setShowCreateModal(false)
        setCreateFormData({
          business_name: '',
          business_type: '',
          phone: '',
          address: '',
          country: 'ID',
          province: '',
          city: '',
          district: '',
          postal_code: ''
        })
        setSelectedCountry('ID')
        setSelectedProvince('')
        setSelectedCity('')
        setSelectedDistrictId('')
        setCustomBusinessType('')
        queryClient.invalidateQueries() // Force refetch semua data setelah create bisnis baru
        fetchBusinesses()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat cabang baru')
    } finally {
      setCreateLoading(false)
    }
  }

  const selectClass = "w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%239CA3AF%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md">
            <Store size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Metracrura POS</h1>
            <p className="text-xs text-gray-500 font-medium">Business Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center gap-2 font-medium"
            title="Keluar"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline text-sm">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Selamat Datang, {user?.full_name}</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Pilih bisnis yang ingin Anda kelola hari ini atau tambahkan cabang baru untuk memperluas usaha Anda.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Memuat daftar bisnis...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Business Cards */}
            {businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => handleSelectBusiness(business.business_code)}
                disabled={switchingTo !== null}
                className={`group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col text-left relative overflow-hidden ${
                  switchingTo === business.business_code ? 'opacity-80 scale-95 ring-2 ring-indigo-500' : 'hover:-translate-y-1'
                }`}
              >
                {/* Decorative background element */}
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="bg-indigo-100 text-indigo-700 p-3 rounded-xl">
                    <Building2 size={24} />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    {business.business_code}
                  </span>
                </div>
                
                <div className="flex-1 relative z-10">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-indigo-700 transition-colors">
                    {business.business_name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{business.business_type || 'Tipe belum diatur'}</p>
                  
                  {business.address && (
                    <div className="flex items-start gap-2 text-xs text-gray-400 mt-auto">
                      <MapPin size={14} className="mt-0.5 shrink-0" />
                      <span className="line-clamp-2 leading-relaxed">{business.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center relative z-10">
                  <span className="text-sm font-medium text-gray-500 group-hover:text-indigo-600 transition-colors">
                    {switchingTo === business.business_code ? 'Memasuki...' : 'Kelola Bisnis'}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    switchingTo === business.business_code ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white'
                  }`}>
                    {switchingTo === business.business_code ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* Create New Business Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl p-6 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 flex flex-col items-center justify-center text-center group min-h-[240px]"
            >
              <div className="bg-white text-indigo-600 p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <Plus size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">Buat Bisnis Baru</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-[200px]">
                Tambahkan cabang atau unit bisnis baru untuk dikelola
              </p>
            </button>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 opacity-100 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Store size={20} className="text-indigo-600" />
                Buat Cabang Baru
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateBusiness} className="p-6 max-h-[75vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bisnis *</label>
                  <input
                    type="text"
                    required
                    value={createFormData.business_name}
                    onChange={(e) => setCreateFormData({...createFormData, business_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Contoh: Toko Maju Jaya Cabang Barat"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Bisnis *</label>
                  <select
                    value={createFormData.business_type}
                    onChange={(e) => setCreateFormData({...createFormData, business_type: e.target.value})}
                    className={selectClass}
                    required
                  >
                    <option value="">Pilih tipe bisnis</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {createFormData.business_type === 'Lainnya' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={customBusinessType}
                        onChange={(e) => setCustomBusinessType(e.target.value)}
                        placeholder="Masukkan tipe bisnis Anda"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                  <PhoneInput
                    defaultCountry="ID"
                    countries={['ID']}
                    international
                    withCountryCallingCode
                    countryCallingCodeEditable={false}
                    countrySelectProps={{ disabled: true, tabIndex: -1 }}
                    value={createFormData.phone}
                    onChange={(val) => setCreateFormData({...createFormData, phone: val})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 outline-none transition-all"
                    style={{
                      '--PhoneInputCountryFlag-height': '1.2em',
                      '--PhoneInputCountryFlag-borderColor': 'transparent',
                      '--PhoneInputCountrySelectArrow-opacity': '0',
                      '--PhoneInputCountrySelectArrow-marginLeft': '0',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Negara</label>
                  <input
                    type="text"
                    value="Indonesia"
                    readOnly
                    className="w-full px-4 py-2 border border-gray-200 bg-gray-100 rounded-xl text-sm text-gray-600 cursor-default outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi *</label>
                  <select
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    className={selectClass}
                    required
                  >
                    <option value="">Pilih provinsi</option>
                    {idProvinces.map(p => <option key={p.id} value={p.id}>{titleCase(p.name)}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kota / Kab *</label>
                  <select
                    value={selectedCity}
                    onChange={handleCityChange}
                    className={selectClass}
                    required
                  >
                    <option value="">Pilih kota</option>
                    {idCities.map(c => <option key={c.id} value={c.id}>{titleCase(c.name)}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                  <select
                    value={selectedDistrictId}
                    onChange={handleDistrictChange}
                    className={selectClass}
                  >
                    <option value="">Pilih kecamatan</option>
                    {idDistricts.map(d => <option key={d.id} value={d.id}>{titleCase(d.name)}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                  {postalCodes.length > 0 && !useCustomPostalCode ? (
                    <select
                      value={createFormData.postal_code || ''}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setUseCustomPostalCode(true)
                          setCreateFormData({...createFormData, postal_code: ''})
                        } else {
                          setCreateFormData({...createFormData, postal_code: e.target.value})
                        }
                      }}
                      className={selectClass}
                    >
                      <option value="">Pilih kode pos</option>
                      {postalCodes.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                      <option value="__custom__">Lainnya (isi manual)</option>
                    </select>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={createFormData.postal_code}
                        onChange={(e) => setCreateFormData({...createFormData, postal_code: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="Contoh: 12345"
                      />
                      {postalCodes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => { setUseCustomPostalCode(false); setCreateFormData({...createFormData, postal_code: postalCodes[0]}) }}
                          className="mt-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Kembali ke pilihan kode pos
                        </button>
                      )}
                    </>
                  )}
                </div>

                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                  <textarea
                    rows="2"
                    value={createFormData.address}
                    onChange={(e) => setCreateFormData({...createFormData, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="Nama jalan, nomor bangunan, RT/RW"
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 px-4 text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !createFormData.business_name}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-md shadow-indigo-200"
                >
                  {createLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                  ) : (
                    'Buat Bisnis'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
