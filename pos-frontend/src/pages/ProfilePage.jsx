import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import MainLayout from '../components/MainLayout'
import { RiUserLine, RiLockLine, RiSaveLine, RiArrowDownSLine, RiArrowUpSLine, RiCheckLine, RiStoreLine, RiShieldKeyholeLine, RiFileCopyLine } from 'react-icons/ri'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import kodeposData from '../data/kodepos.json'

const BUSINESS_TYPES = [
  'Warung Kelontong',
  'Toko Sembako',
  'Minimart',
  'Cafe',
  'Restoran',
  'Toko Elektronik',
  'Toko Bangunan',
  'Toko Pakaian',
  'Apotek',
  'Lainnya',
]

// Indonesian Wilayah API (same as RegisterPage)
const ID_API = 'https://www.emsifa.com/api-wilayah-indonesia/api'
const titleCase = (s) => s ? s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : ''

export default function ProfilePage() {
  const { user, business, updateUserData, isAdmin } = useAuth()
  const bCode = business?.code
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const [showBusiness, setShowBusiness] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [businessMsg, setBusinessMsg] = useState(null)
  const [copied, setCopied] = useState(false)
  const [businessForm, setBusinessForm] = useState({
    business_name: '', business_type: '', phone: '', address: '',
    country: 'Indonesia', province: '', city: '', district: '', postal_code: ''
  })

  // Cascading dropdown state
  const [idProvinces, setIdProvinces] = useState([])
  const [idCities, setIdCities] = useState([])
  const [idDistricts, setIdDistricts] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedCityId, setSelectedCityId] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationInitialized, setLocationInitialized] = useState(false)
  const [postalCodes, setPostalCodes] = useState([])
  const [useCustomPostalCode, setUseCustomPostalCode] = useState(false)

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', bCode],
    queryFn: profileAPI.getProfile,
    retry: 1,
  })

  // Fetch business profile (admin only)
  const { data: businessData } = useQuery({
    queryKey: ['business-profile', bCode],
    queryFn: profileAPI.getBusinessProfile,
    retry: 1,
    enabled: isAdmin(),
  })

  // Fetch provinces on mount
  useEffect(() => {
    fetch(`${ID_API}/provinces.json`)
      .then(r => r.json())
      .then(data => setIdProvinces(data.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => setIdProvinces([]))
  }, [])

  // Reverse-lookup: when businessData loads, find the matching province/city/district IDs
  const initializeLocationFromNames = useCallback(async (province, city, district) => {
    if (!province || locationInitialized) return
    setLocationLoading(true)
    try {
      // 1. Fetch provinces and find match
      const provRes = await fetch(`${ID_API}/provinces.json`)
      const provinces = await provRes.json()
      const matchedProvince = provinces.find(p =>
        titleCase(p.name) === province || p.name === province || p.name.toUpperCase() === province.toUpperCase()
      )
      if (!matchedProvince) { setLocationLoading(false); return }
      setSelectedProvinceId(matchedProvince.id)

      // 2. Fetch cities for that province and find match
      if (city) {
        const cityRes = await fetch(`${ID_API}/regencies/${matchedProvince.id}.json`)
        const cities = await cityRes.json()
        setIdCities(cities.sort((a, b) => a.name.localeCompare(b.name)))
        const matchedCity = cities.find(c =>
          titleCase(c.name) === city || c.name === city || c.name.toUpperCase() === city.toUpperCase()
        )
        if (matchedCity) {
          setSelectedCityId(matchedCity.id)

          // 3. Fetch districts for that city and find match
          if (district) {
            const distRes = await fetch(`${ID_API}/districts/${matchedCity.id}.json`)
            const districts = await distRes.json()
            setIdDistricts(districts.sort((a, b) => a.name.localeCompare(b.name)))
            const matchedDistrict = districts.find(d =>
              titleCase(d.name) === district || d.name === district || d.name.toUpperCase() === district.toUpperCase()
            )
            if (matchedDistrict) {
              setSelectedDistrictId(matchedDistrict.id)
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to reverse-lookup location:', e)
    }
    setLocationLoading(false)
    setLocationInitialized(true)
  }, [locationInitialized])

  // Populate business form when data loads
  useEffect(() => {
    if (businessData) {
      setBusinessForm({
        business_name: businessData.business_name || '',
        business_type: businessData.business_type || '',
        phone: businessData.phone || '',
        address: businessData.address || '',
        country: businessData.country || 'Indonesia',
        province: businessData.province || '',
        city: businessData.city || '',
        district: businessData.district || '',
        postal_code: businessData.postal_code || '',
      })
      // Reverse-lookup IDs from saved names
      initializeLocationFromNames(businessData.province, businessData.city, businessData.district)
    }
  }, [businessData, initializeLocationFromNames])

  // Cascade: fetch cities when province changes (user interaction)
  const handleProvinceChange = async (e) => {
    const provId = e.target.value
    const provObj = idProvinces.find(p => p.id === provId)
    setSelectedProvinceId(provId)
    setSelectedCityId('')
    setSelectedDistrictId('')
    setIdCities([])
    setIdDistricts([])
    setBusinessForm(prev => ({
      ...prev,
      province: provObj ? titleCase(provObj.name) : '',
      city: '',
      district: ''
    }))
    if (provId) {
      try {
        const res = await fetch(`${ID_API}/regencies/${provId}.json`)
        const data = await res.json()
        setIdCities(data.sort((a, b) => a.name.localeCompare(b.name)))
      } catch { setIdCities([]) }
    }
  }

  // Cascade: fetch districts when city changes
  const handleCityChange = async (e) => {
    const cityId = e.target.value
    const cityObj = idCities.find(c => c.id === cityId)
    setSelectedCityId(cityId)
    setSelectedDistrictId('')
    setIdDistricts([])
    setBusinessForm(prev => ({
      ...prev,
      city: cityObj ? titleCase(cityObj.name) : '',
      district: ''
    }))
    if (cityId) {
      try {
        const res = await fetch(`${ID_API}/districts/${cityId}.json`)
        const data = await res.json()
        setIdDistricts(data.sort((a, b) => a.name.localeCompare(b.name)))
      } catch { setIdDistricts([]) }
    }
  }

  const handleDistrictChange = (e) => {
    const distId = e.target.value
    const distObj = idDistricts.find(d => d.id === distId)
    setSelectedDistrictId(distId)
    setBusinessForm(prev => ({
      ...prev,
      district: distObj ? titleCase(distObj.name) : '',
      postal_code: ''
    }))
    // Reset postal code state
    setPostalCodes([])
    setUseCustomPostalCode(false)
  }

  // Lookup postal codes from local JSON when district is selected
  useEffect(() => {
    if (!selectedDistrictId) {
      setPostalCodes([])
      return
    }
    const dist = idDistricts.find(d => d.id === selectedDistrictId)
    if (!dist) return

    const cityObj = idCities.find(c => c.id === selectedCityId)
    const rawCityName = (cityObj?.name || '').toUpperCase().trim()
    const cityName = rawCityName.replace(/^(KABUPATEN|KOTA)\s+/i, '')
    const distName = (dist.name || '').toUpperCase().trim()

    const key = `${cityName}|${distName}`
    let codes = kodeposData[key] || []

    if (codes.length === 0) {
      codes = kodeposData[`${rawCityName}|${distName}`] || []
    }
    if (codes.length === 0) {
      const fallbackKey = Object.keys(kodeposData).find(k => k.endsWith(`|${distName}`))
      if (fallbackKey) codes = kodeposData[fallbackKey]
    }

    if (codes && codes.length > 0) {
      setPostalCodes(codes)
      setBusinessForm(prev => ({ ...prev, postal_code: codes[0] }))
    } else {
      setPostalCodes([])
    }
  }, [selectedDistrictId, idDistricts, idCities, selectedCityId])

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm()

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm()

  const newPassword = watchPassword('new_password')

  // Unwrap nested user data from backend response { user: { ... } }
  const profileData = profile?.user || profile

  // Populate profile form when data loads
  useEffect(() => {
    if (profileData) {
      resetProfile({
        full_name: profileData.full_name || '',
        email: profileData.email || '',
      })
    }
  }, [profileData, resetProfile])

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: profileAPI.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['profile', bCode])
      // Update AuthContext so sidebar/topbar reflect changes immediately
      if (data) {
        updateUserData({
          full_name: data.full_name || data.user?.full_name,
          email: data.email || data.user?.email,
        })
      }
      setProfileMsg({ type: 'success', text: 'Profil berhasil diperbarui' })
      setTimeout(() => setProfileMsg(null), 3000)
    },
    onError: (err) => {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || err.response?.data?.error || 'Gagal memperbarui profil' })
      setTimeout(() => setProfileMsg(null), 5000)
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: profileAPI.changePassword,
    onSuccess: () => {
      resetPassword()
      setPasswordMsg({ type: 'success', text: 'Password berhasil diubah' })
      setTimeout(() => setPasswordMsg(null), 3000)
    },
    onError: (err) => {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || err.response?.data?.error || err.response?.data?.old_password?.[0] || 'Gagal mengubah password' })
      setTimeout(() => setPasswordMsg(null), 5000)
    },
  })

  // Update business mutation — sync to AuthContext + sidebar
  const updateBusinessMutation = useMutation({
    mutationFn: profileAPI.updateBusinessProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['business-profile', bCode])
      // Update AuthContext business data so sidebar reflects changes immediately
      const updatedBusiness = {
        ...business,
        name: data.business_name || businessForm.business_name,
        type: data.business_type || businessForm.business_type,
      }
      localStorage.setItem('business_data', JSON.stringify(updatedBusiness))
      // Force re-render sidebar by updating business in window scope
      window.dispatchEvent(new CustomEvent('business-updated', { detail: updatedBusiness }))
      setBusinessMsg({ type: 'success', text: 'Profil bisnis berhasil diperbarui' })
      setTimeout(() => setBusinessMsg(null), 3000)
    },
    onError: (err) => {
      setBusinessMsg({ type: 'error', text: err.response?.data?.error || err.response?.data?.message || 'Gagal memperbarui profil bisnis' })
      setTimeout(() => setBusinessMsg(null), 5000)
    },
  })

  const onProfileSubmit = (data) => {
    updateProfileMutation.mutate(data)
  }

  const onPasswordSubmit = (data) => {
    changePasswordMutation.mutate({
      old_password: data.old_password,
      new_password: data.new_password,
    })
  }

  const onBusinessSubmit = () => {
    if (!businessForm.business_name.trim()) {
      setBusinessMsg({ type: 'error', text: 'Nama bisnis tidak boleh kosong' })
      setTimeout(() => setBusinessMsg(null), 3000)
      return
    }
    updateBusinessMutation.mutate(businessForm)
  }

  const initial = (profileData?.full_name || profileData?.username || user?.username || 'U').charAt(0).toUpperCase()
  const roleBadge = profileData?.role || user?.role || 'user'

  const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
  const selectClass = `${inputClass} bg-white appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%239CA3AF%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10`

  return (
    <MainLayout title="Profil">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-gray-800 font-bold text-lg">Pengaturan Profil</h2>
          <p className="text-gray-400 text-sm">Kelola informasi akun dan keamanan Anda</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl shrink-0">
                  {initial}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">{profileData?.full_name || profileData?.username || user?.username}</h3>
                  <p className="text-sm text-gray-500">@{profileData?.username || user?.username}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${roleBadge === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {roleBadge === 'admin' ? 'Administrator' : 'Kasir'}
                  </span>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                {profileMsg && (
                  <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${profileMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {profileMsg.text}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Lengkap</label>
                    <input
                      {...registerProfile('full_name', { required: 'Nama lengkap wajib diisi' })}
                      placeholder="Nama lengkap"
                      className={inputClass}
                    />
                    {profileErrors.full_name && <p className="text-red-500 text-xs mt-1">{profileErrors.full_name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                    <input
                      type="email"
                      {...registerProfile('email', {
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' }
                      })}
                      placeholder="email@contoh.com"
                      className={inputClass}
                    />
                    {profileErrors.email && <p className="text-red-500 text-xs mt-1">{profileErrors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Username</label>
                    <input
                      value={profileData?.username || user?.username || ''}
                      readOnly
                      className={`${inputClass} bg-gray-50 text-gray-500 cursor-default`}
                    />
                    <p className="text-xs text-gray-400 mt-1">Username tidak dapat diubah</p>
                  </div>
                </div>

                {/* Owner Code — Admin Only */}
                {isAdmin() && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <RiShieldKeyholeLine size={16} className="text-purple-600" />
                      <span className="text-xs font-bold text-purple-700">Kode Admin (Owner Code)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-800 font-mono text-lg font-bold tracking-widest text-center">
                        {profileData?.owner_code || '------'}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(profileData?.owner_code || '')
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        }}
                        className="p-2.5 bg-white border border-purple-200 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
                        title="Salin kode"
                      >
                        {copied ? <RiCheckLine size={16} className="text-green-600" /> : <RiFileCopyLine size={16} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-purple-500 mt-2">Gunakan kode ini saat login sebagai Admin. Jaga kerahasiaannya.</p>
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    {updateProfileMutation.isPending ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Menyimpan...</>
                    ) : (
                      <><RiSaveLine size={16} /> Simpan Profil</>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Business Info Card (Admin only) */}
            {isAdmin() && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <button
                  type="button"
                  onClick={() => setShowBusiness(!showBusiness)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                      <RiStoreLine size={18} className="text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-800 text-sm">Informasi Bisnis</h3>
                      <p className="text-xs text-gray-400">Kelola nama, tipe usaha, dan alamat bisnis</p>
                    </div>
                  </div>
                  {showBusiness ? <RiArrowUpSLine size={20} className="text-gray-400" /> : <RiArrowDownSLine size={20} className="text-gray-400" />}
                </button>

                {showBusiness && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    {businessMsg && (
                      <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${businessMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                        {businessMsg.text}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Bisnis *</label>
                          <input
                            value={businessForm.business_name}
                            onChange={(e) => setBusinessForm({...businessForm, business_name: e.target.value})}
                            placeholder="Nama bisnis Anda"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipe Usaha</label>
                          <select
                            value={businessForm.business_type}
                            onChange={(e) => setBusinessForm({...businessForm, business_type: e.target.value})}
                            className={selectClass}
                          >
                            <option value="">-- Pilih Tipe --</option>
                            {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            {/* Show current value if it doesn't match any option */}
                            {businessForm.business_type && !BUSINESS_TYPES.includes(businessForm.business_type) && (
                              <option value={businessForm.business_type}>{businessForm.business_type}</option>
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Telepon Bisnis</label>
                          <PhoneInput
                            value={businessForm.phone}
                            onChange={(val) => setBusinessForm({...businessForm, phone: val || ''})}
                            defaultCountry="ID"
                            countries={['ID']}
                            international
                            withCountryCallingCode
                            countryCallingCodeEditable={false}
                            countrySelectProps={{ disabled: true, tabIndex: -1 }}
                            className={`w-full px-3 py-2 border rounded-xl text-sm transition-colors outline-none focus-within:ring-2 border-gray-200 bg-gray-50 focus-within:bg-white focus-within:ring-blue-500/20 focus-within:border-blue-500`}
                            style={{
                              '--PhoneInputCountryFlag-height': '1.2em',
                              '--PhoneInputCountryFlag-borderColor': 'transparent',
                              '--PhoneInputCountrySelectArrow-opacity': '0',
                              '--PhoneInputCountrySelectArrow-marginLeft': '0',
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kode Pos</label>
                          {postalCodes.length > 0 && !useCustomPostalCode ? (
                            <select
                              value={businessForm.postal_code || ''}
                              onChange={(e) => {
                                if (e.target.value === '__custom__') {
                                  setUseCustomPostalCode(true)
                                  setBusinessForm({...businessForm, postal_code: ''})
                                } else {
                                  setBusinessForm({...businessForm, postal_code: e.target.value})
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
                                value={businessForm.postal_code}
                                onChange={(e) => setBusinessForm({...businessForm, postal_code: e.target.value})}
                                placeholder="Kode pos"
                                className={inputClass}
                              />
                              {postalCodes.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => { setUseCustomPostalCode(false); setBusinessForm({...businessForm, postal_code: postalCodes[0]}) }}
                                  className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Kembali ke pilihan kode pos
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Cascading Location Dropdowns */}
                      {locationLoading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          Memuat data lokasi...
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Provinsi</label>
                              <select
                                value={selectedProvinceId}
                                onChange={handleProvinceChange}
                                className={selectClass}
                              >
                                <option value="">-- Pilih Provinsi --</option>
                                {idProvinces.map(p => (
                                  <option key={p.id} value={p.id}>{titleCase(p.name)}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kota/Kabupaten</label>
                              <select
                                value={selectedCityId}
                                onChange={handleCityChange}
                                disabled={!selectedProvinceId}
                                className={`${selectClass} ${!selectedProvinceId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                              >
                                <option value="">-- Pilih Kota --</option>
                                {idCities.map(c => (
                                  <option key={c.id} value={c.id}>{titleCase(c.name)}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kecamatan</label>
                            <select
                              value={selectedDistrictId}
                              onChange={handleDistrictChange}
                              disabled={!selectedCityId}
                              className={`${selectClass} ${!selectedCityId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                            >
                              <option value="">-- Pilih Kecamatan --</option>
                              {idDistricts.map(d => (
                                <option key={d.id} value={d.id}>{titleCase(d.name)}</option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alamat Lengkap</label>
                        <textarea
                          value={businessForm.address}
                          onChange={(e) => setBusinessForm({...businessForm, address: e.target.value})}
                          rows={2}
                          placeholder="Nama jalan, nomor, RT/RW, dll."
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kode Bisnis</label>
                        <input
                          value={businessData?.business_code || '---'}
                          readOnly
                          className={`${inputClass} bg-gray-50 text-gray-500 cursor-default font-mono`}
                        />
                        <p className="text-xs text-gray-400 mt-1">Kode bisnis tidak dapat diubah (dibuat otomatis oleh sistem)</p>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={onBusinessSubmit}
                        disabled={updateBusinessMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-colors"
                      >
                        {updateBusinessMutation.isPending ? (
                          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Menyimpan...</>
                        ) : (
                          <><RiSaveLine size={16} /> Simpan Bisnis</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Change Password Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                    <RiLockLine size={18} className="text-amber-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800 text-sm">Ubah Password</h3>
                    <p className="text-xs text-gray-400">Perbarui password akun Anda</p>
                  </div>
                </div>
                {showPassword ? <RiArrowUpSLine size={20} className="text-gray-400" /> : <RiArrowDownSLine size={20} className="text-gray-400" />}
              </button>

              {showPassword && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                    {passwordMsg && (
                      <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${passwordMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                        {passwordMsg.text}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password Lama</label>
                        <input
                          type="password"
                          {...registerPassword('old_password', { required: 'Password lama wajib diisi' })}
                          placeholder="Masukkan password lama"
                          className={inputClass}
                        />
                        {passwordErrors.old_password && <p className="text-red-500 text-xs mt-1">{passwordErrors.old_password.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password Baru</label>
                        <input
                          type="password"
                          {...registerPassword('new_password', {
                            required: 'Password baru wajib diisi',
                            minLength: { value: 8, message: 'Password minimal 8 karakter' }
                          })}
                          placeholder="Masukkan password baru"
                          className={inputClass}
                        />
                        {passwordErrors.new_password && <p className="text-red-500 text-xs mt-1">{passwordErrors.new_password.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Konfirmasi Password Baru</label>
                        <input
                          type="password"
                          {...registerPassword('confirm_password', {
                            required: 'Konfirmasi password wajib diisi',
                            validate: value => value === newPassword || 'Password tidak cocok'
                          })}
                          placeholder="Ulangi password baru"
                          className={inputClass}
                        />
                        {passwordErrors.confirm_password && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirm_password.message}</p>}
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold rounded-xl text-sm transition-colors"
                      >
                        {changePasswordMutation.isPending ? (
                          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Mengubah...</>
                        ) : (
                          <><RiLockLine size={16} /> Ubah Password</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}
