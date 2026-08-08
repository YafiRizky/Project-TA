import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { registerBusiness } from '../services/api'
import kodeposData from '../data/kodepos.json'
import {
  RiStoreLine, RiUserLine, RiLockLine, RiBuildingLine,
  RiPhoneLine, RiMapPinLine, RiMailLine, RiCheckLine,
  RiArrowLeftLine, RiArrowRightLine, RiEyeLine, RiEyeOffLine
} from 'react-icons/ri'

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

const registerSchema = z.object({
  business_name: z.string().min(1, 'Nama bisnis wajib diisi').min(3, 'Minimal 3 karakter').max(100),
  business_type: z.string().min(1, 'Tipe bisnis wajib diisi'),
  phone: z.string().min(1, 'Nomor telepon wajib diisi').min(10, 'Minimal 10 digit'),
  address: z.string().optional(),
  username: z.string().min(1, 'Username wajib diisi').min(3, 'Minimal 3 karakter').max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Hanya huruf, angka, dan underscore'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi').min(8, 'Minimal 8 karakter'),
  password_confirm: z.string().min(1, 'Konfirmasi password wajib diisi'),
  full_name: z.string().min(1, 'Nama lengkap wajib diisi').min(2, 'Minimal 2 karakter'),
  country: z.string().min(1, 'Negara wajib diisi'),
  province: z.string().min(1, 'Provinsi wajib diisi'),
  city: z.string().min(1, 'Kota wajib diisi'),
  district: z.string().optional(),
  postal_code: z.string().min(1, 'Kode pos wajib diisi').max(10, 'Maksimal 10 karakter'),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Password tidak cocok',
  path: ['password_confirm']
})

const STEPS = [
  { title: 'Akun Admin', desc: 'Data login' },
  { title: 'Data Pemilik', desc: 'Informasi personal' },
  { title: 'Data Bisnis', desc: 'Informasi toko' },
  { title: 'Konfirmasi', desc: 'Periksa & daftar' },
]

// Indonesian Wilayah API (provinces, regencies, districts)
const ID_API = 'https://www.emsifa.com/api-wilayah-indonesia/api'
const titleCase = (s) => s ? s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : ''

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [customBusinessType, setCustomBusinessType] = useState('')
  const selectedCountry = 'ID'
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [idProvinces, setIdProvinces] = useState([])
  const [idCities, setIdCities] = useState([])
  const [idDistricts, setIdDistricts] = useState([])
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const [postalCodes, setPostalCodes] = useState([])
  const [useCustomPostalCode, setUseCustomPostalCode] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch, trigger, setValue } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      business_name: '', business_type: '', phone: '', address: '',
      username: '', email: '', password: '', password_confirm: '', full_name: '',
      country: 'ID', province: '', city: '', district: '', postal_code: ''
    }
  })

  const watched = watch()

  const stepFields = [
    ['username', 'password', 'password_confirm'],
    ['full_name', 'email', 'phone'],
    ['business_name', 'business_type', 'country', 'province', 'city', 'postal_code'],
    [],
  ]

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
    setValue('city', '')
    setValue('district', '')
    if (selectedCountry === 'ID' && selectedProvince) {
      fetch(`${ID_API}/regencies/${selectedProvince}.json`)
        .then(r => r.json())
        .then(data => setIdCities(data.sort((a, b) => a.name.localeCompare(b.name))))
        .catch(() => setIdCities([]))
    } else if (selectedCountry === 'ID') {
      setIdCities([])
    }
  }, [selectedProvince, selectedCountry, setValue])

  // Cascade: fetch kecamatan when city changes (Indonesia)
  useEffect(() => {
    setSelectedDistrictId('')
    setValue('district', '')
    if (selectedCountry === 'ID' && selectedCity) {
      fetch(`${ID_API}/districts/${selectedCity}.json`)
        .then(r => r.json())
        .then(data => setIdDistricts(data.sort((a, b) => a.name.localeCompare(b.name))))
        .catch(() => setIdDistricts([]))
    } else {
      setIdDistricts([])
    }
  }, [selectedCity, selectedCountry, setValue])

  const handleProvinceChange = (e) => {
    const val = e.target.value
    setSelectedProvince(val)
    const prov = idProvinces.find(p => p.id === val)
    setValue('province', prov ? titleCase(prov.name) : '')
  }

  const handleCityChange = (e) => {
    const val = e.target.value
    setSelectedCity(val)
    const city = idCities.find(c => c.id === val)
    setValue('city', city ? titleCase(city.name) : '')
  }

  const handleDistrictChange = (e) => {
    const val = e.target.value
    setSelectedDistrictId(val)
    const dist = idDistricts.find(d => d.id === val)
    setValue('district', dist ? titleCase(dist.name) : '')
    // Reset postal code state when district changes
    setPostalCodes([])
    setUseCustomPostalCode(false)
    setValue('postal_code', '')
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
      setValue('postal_code', codes[0])
    } else {
      setPostalCodes([])
    }
  }, [selectedDistrictId, idDistricts, idCities, selectedCity, setValue])

  const handleNext = async () => {
    const valid = await trigger(stepFields[step])
    if (valid) setStep((s) => s + 1)
  }

  const onSubmit = async (data) => {
    setError('')
    setFieldErrors({})
    setSuccess('')

    // If business_type is 'Lainnya', use custom value
    const finalBusinessType = data.business_type === 'Lainnya' && customBusinessType.trim()
      ? customBusinessType.trim()
      : data.business_type

    const payload = {
      business_name: data.business_name,
      business_type: finalBusinessType,
      phone: data.phone || '',
      address: data.address || '',
      username: data.username,
      email: data.email || '',
      password: data.password,
      full_name: data.full_name || '',
      country: data.country || '',
      province: data.province || '',
      city: data.city || '',
      district: data.district || '',
      postal_code: data.postal_code || '',
    }

    try {
      const response = await registerBusiness(payload)
      if (response.success) {
        if (response.tokens) {
          localStorage.setItem('access_token', response.tokens.access)
          localStorage.setItem('refresh_token', response.tokens.refresh)
          localStorage.setItem('user_data', JSON.stringify({
            id: response.user.id, username: response.user.username, email: response.user.email,
            role: response.user.role, full_name: response.user.full_name,
            owner_code: response.user.owner_code || null
          }))
          // business_data is not set, so ProtectedRoute will redirect to /businesses if they try to access /dashboard
          localStorage.removeItem('business_data')
        }
        const ownerCode = response.user?.owner_code || ''
        const bizCode = response.business?.business_code || ''
        setSuccess(`Berhasil! Kode Admin Anda: ${ownerCode} | Kode Bisnis: ${bizCode}. Simpan kedua kode ini!`)
        setTimeout(() => { 
          // Force reload to apply AuthContext state properly
          window.location.href = '/businesses'
        }, 3500)
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors)
        setStep(0)
      } else {
        setError(err.response?.data?.message || 'Pendaftaran gagal. Coba lagi.')
      }
    }
  }

  const inputClass = (hasError) =>
    `w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm transition-colors outline-none focus:ring-2 ${
      hasError
        ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400'
        : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-blue-500/20 focus:border-blue-500'
    }`

  const selectClass = (hasError) =>
    `w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm transition-colors outline-none focus:ring-2 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%239CA3AF%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10 ${
      hasError
        ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400'
        : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-blue-500/20 focus:border-blue-500'
    }`

  const plainInputClass = (hasError) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm transition-colors outline-none focus:ring-2 ${
      hasError
        ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400'
        : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-blue-500/20 focus:border-blue-500'
    }`

  const plainSelectClass = (hasError) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm transition-colors outline-none focus:ring-2 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%239CA3AF%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10 ${
      hasError
        ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400'
        : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-blue-500/20 focus:border-blue-500'
    }`

  // Country is always Indonesia
  const getCountryName = () => 'Indonesia'

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Brand */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Mercatura POS" className="inline-block w-12 h-12 rounded-2xl mb-2 shadow-lg shadow-blue-600/30 object-contain bg-slate-800 p-1.5" />
          <h1 className="text-xl font-bold text-white">Daftarkan Bisnis</h1>
          <p className="text-slate-400 text-sm mt-0.5">Mercatura POS ML System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? 'bg-blue-600 text-white' :
                    i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {i < step ? <RiCheckLine size={14} /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${i === step ? 'text-blue-600' : 'text-gray-400'}`}>
                    {s.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 rounded ${i < step ? 'bg-blue-600' : 'bg-gray-100'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 0: Akun Admin */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-gray-800 font-bold text-lg">Akun Admin</h2>
                  <p className="text-gray-400 text-sm">Username dan password untuk login</p>
                </div>
                {(error || fieldErrors.username) && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error || fieldErrors.username?.[0]}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username *</label>
                  <div className="relative">
                    <RiUserLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('username')} placeholder="Contoh: admin01" className={inputClass(errors.username || fieldErrors.username)} />
                  </div>
                  {(errors.username || fieldErrors.username) && (
                    <p className="mt-1 text-xs text-red-600">{errors.username?.message || fieldErrors.username?.[0]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <RiLockLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 karakter" className={inputClass(errors.password)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password *</label>
                  <div className="relative">
                    <RiLockLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('password_confirm')} type={showConfirm ? 'text' : 'password'} placeholder="Ulangi password" className={inputClass(errors.password_confirm)} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                    </button>
                  </div>
                  {errors.password_confirm && <p className="mt-1 text-xs text-red-600">{errors.password_confirm.message}</p>}
                </div>
              </div>
            )}

            {/* Step 1: Data Pemilik */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-gray-800 font-bold text-lg">Data Pemilik</h2>
                  <p className="text-gray-400 text-sm">Informasi personal pemilik bisnis</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap *</label>
                  <div className="relative">
                    <RiUserLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('full_name')} placeholder="Nama lengkap Anda" className={inputClass(errors.full_name)} />
                  </div>
                  {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <div className="relative">
                    <RiMailLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('email')} type="email" placeholder="email@bisnis.com" className={inputClass(errors.email)} />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Telepon *</label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        {...field}
                        defaultCountry="ID"
                        countries={['ID']}
                        international
                        withCountryCallingCode
                        countryCallingCodeEditable={false}
                        countrySelectProps={{ disabled: true, tabIndex: -1 }}
                        className={`w-full px-3 py-2.5 border rounded-xl text-sm transition-colors outline-none focus-within:ring-2 ${
                          errors.phone 
                            ? 'border-red-400 bg-red-50 focus-within:ring-red-500/20 focus-within:border-red-400' 
                            : 'border-gray-200 bg-gray-50 focus-within:bg-white focus-within:ring-blue-500/20 focus-within:border-blue-500'
                        }`}
                        style={{
                          '--PhoneInputCountryFlag-height': '1.2em',
                          '--PhoneInputCountryFlag-borderColor': 'transparent',
                          '--PhoneInputCountrySelectArrow-opacity': '0',
                          '--PhoneInputCountrySelectArrow-marginLeft': '0',
                        }}
                      />
                    )}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Data Bisnis */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-gray-800 font-bold text-lg">Data Bisnis</h2>
                  <p className="text-gray-400 text-sm">Informasi toko/usaha Anda</p>
                </div>
                {/* Nama Bisnis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Bisnis *</label>
                  <div className="relative">
                    <RiStoreLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input {...register('business_name')} placeholder="Contoh: Warung Berkah" className={inputClass(errors.business_name)} />
                  </div>
                  {errors.business_name && <p className="mt-1 text-xs text-red-600">{errors.business_name.message}</p>}
                </div>
                {/* Tipe Bisnis - Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Bisnis *</label>
                  <div className="relative">
                    <RiBuildingLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                    <select
                      {...register('business_type')}
                      className={selectClass(errors.business_type)}
                    >
                      <option value="">Pilih tipe bisnis</option>
                      {BUSINESS_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {errors.business_type && <p className="mt-1 text-xs text-red-600">{errors.business_type.message}</p>}
                  {/* Custom business type input when 'Lainnya' is selected */}
                  {watched.business_type === 'Lainnya' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={customBusinessType}
                        onChange={(e) => setCustomBusinessType(e.target.value)}
                        placeholder="Masukkan tipe bisnis Anda"
                        className={plainInputClass(false)}
                      />
                    </div>
                  )}
                </div>

                {/* Negara (locked to Indonesia) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Negara</label>
                  <div className="relative">
                    <RiMapPinLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                    <input
                      type="text"
                      value="Indonesia"
                      readOnly
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-gray-100 rounded-xl text-sm text-gray-600 cursor-default outline-none"
                    />
                  </div>
                </div>

                {/* Provinsi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Provinsi *</label>
                  <select
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    className={plainSelectClass(errors.province)}
                  >
                    <option value="">Pilih provinsi</option>
                    {idProvinces.map(p => <option key={p.id} value={p.id}>{titleCase(p.name)}</option>)}
                  </select>
                  {errors.province && <p className="mt-1 text-xs text-red-600">{errors.province.message}</p>}
                </div>

                {/* Kota / Kabupaten */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kota / Kabupaten *</label>
                  <select
                    value={selectedCity}
                    onChange={handleCityChange}
                    className={plainSelectClass(errors.city)}
                  >
                    <option value="">Pilih kota</option>
                    {idCities.map(c => <option key={c.id} value={c.id}>{titleCase(c.name)}</option>)}
                  </select>
                  {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
                </div>

                {/* Kecamatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kecamatan</label>
                  <select
                    value={selectedDistrictId}
                    onChange={handleDistrictChange}
                    className={plainSelectClass(errors.district)}
                  >
                    <option value="">
                      {idDistricts.length > 0 ? 'Pilih kecamatan' : 'Pilih kota terlebih dahulu'}
                    </option>
                    {idDistricts.map(d => (
                      <option key={d.id} value={d.id}>{titleCase(d.name)}</option>
                    ))}
                  </select>
                  {errors.district && <p className="mt-1 text-xs text-red-600">{errors.district.message}</p>}
                </div>

                {/* Kode Pos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Pos *</label>
                  {postalCodes.length > 0 && !useCustomPostalCode ? (
                    <>
                      <select
                        value={watched.postal_code || ''}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setUseCustomPostalCode(true)
                            setValue('postal_code', '')
                          } else {
                            setValue('postal_code', e.target.value)
                          }
                        }}
                        className={plainSelectClass(errors.postal_code)}
                      >
                        <option value="">Pilih kode pos</option>
                        {postalCodes.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                        <option value="__custom__">Lainnya (isi manual)</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <input
                        {...register('postal_code')}
                        placeholder="Contoh: 12345"
                        maxLength={10}
                        className={plainInputClass(errors.postal_code)}
                      />
                      {postalCodes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => { setUseCustomPostalCode(false); setValue('postal_code', postalCodes[0]) }}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Kembali ke pilihan kode pos
                        </button>
                      )}
                    </>
                  )}
                  {errors.postal_code && <p className="mt-1 text-xs text-red-600">{errors.postal_code.message}</p>}
                </div>

                {/* Detail Alamat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Detail Alamat</label>
                  <div className="relative">
                    <RiMapPinLine size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    <textarea {...register('address')} placeholder="Nama jalan, nomor rumah, RT/RW, dll." rows={3}
                      className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm resize-none transition-colors outline-none focus:ring-2 ${
                        errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-blue-500/20 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Konfirmasi */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-gray-800 font-bold text-lg">Konfirmasi Data</h2>
                  <p className="text-gray-400 text-sm">Periksa data sebelum mendaftar</p>
                </div>
                {(error || success) && (
                  <div className={`px-4 py-3 rounded-lg text-sm ${success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {success || error}
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-400 text-xs">Username</p>
                      <p className="text-gray-800 font-medium">{watched.username || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Nama Lengkap</p>
                      <p className="text-gray-800 font-medium">{watched.full_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Email</p>
                      <p className="text-gray-800 font-medium">{watched.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Telepon</p>
                      <p className="text-gray-800 font-medium">{watched.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Nama Bisnis</p>
                      <p className="text-gray-800 font-medium">{watched.business_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Tipe Bisnis</p>
                      <p className="text-gray-800 font-medium">
                        {watched.business_type === 'Lainnya' && customBusinessType.trim()
                          ? customBusinessType.trim()
                          : watched.business_type || '-'}
                      </p>
                    </div>
                  </div>
                  {/* Structured address display */}
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-gray-400 text-xs mb-1">Alamat</p>
                    <div className="text-gray-800 font-medium space-y-0.5">
                      {watched.address && <p>{watched.address}</p>}
                      <p>
                        {[
                          watched.district,
                          watched.city,
                          watched.province,
                        ].filter(Boolean).join(', ')}
                      </p>
                      <p>
                        {[
                          getCountryName(watched.country),
                          watched.postal_code ? `(${watched.postal_code})` : '',
                        ].filter(Boolean).join(' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <RiArrowLeftLine size={15} /> Kembali
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Lanjut <RiArrowRightLine size={15} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !!success}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Mendaftarkan...
                    </>
                  ) : (
                    <><RiCheckLine size={15} /> Daftarkan Bisnis</>
                  )}
                </button>
              )}
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
