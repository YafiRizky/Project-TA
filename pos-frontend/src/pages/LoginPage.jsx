import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../contexts/AuthContext'
import { RiEyeLine, RiEyeOffLine, RiStoreLine, RiLockLine, RiUserLine, RiBuildingLine, RiShieldKeyholeLine } from 'react-icons/ri'

const loginSchema = z.object({
  login_as: z.enum(['admin', 'kasir']),
  code: z.string().optional(),
  username: z.string()
    .min(1, 'Username wajib diisi')
    .min(3, 'Username minimal 3 karakter'),
  password: z.string()
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter')
}).superRefine((data, ctx) => {
  if (!data.code || data.code.trim() === '') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: data.login_as === 'admin'
        ? 'Kode admin wajib diisi'
        : 'Kode bisnis wajib diisi',
      path: ['code'],
    });
  } else if (data.code.length !== 6 || !/^[A-Z0-9]+$/.test(data.code)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Kode harus 6 karakter huruf kapital/angka',
      path: ['code'],
    });
  }
})

export default function LoginPage() {
  const { login, loading } = useAuth()
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loginAs, setLoginAs] = useState('admin')

  const isAdmin = loginAs === 'admin'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { code: '', username: '', password: '', login_as: 'admin' }
  })

  const onSubmit = async (data) => {
    setError('')
    setFieldErrors({})
    
    // Build the login payload based on role
    const payload = {
      username: data.username,
      password: data.password,
      login_as: loginAs,
    }
    
    if (loginAs === 'admin') {
      payload.owner_code = data.code
    } else {
      payload.business_code = data.code
    }
    
    const result = await login(payload)
    if (!result || !result.success) {
      if (result && result.errors) {
        setFieldErrors(result.errors)
      } else {
        setError(result?.message || 'Login gagal. Silakan periksa koneksi atau kredensial Anda.')
      }
    }
  }

  // Dynamic theme colors based on loginAs selection
  const accentBg = isAdmin ? 'bg-blue-600' : 'bg-emerald-600'
  const accentHoverBg = isAdmin ? 'hover:bg-blue-700' : 'hover:bg-emerald-700'
  const accentDisabledBg = isAdmin ? 'disabled:bg-blue-400' : 'disabled:bg-emerald-400'
  const accentShadow = isAdmin ? 'shadow-blue-600/30' : 'shadow-emerald-600/30'
  const focusRing = isAdmin ? 'focus:ring-blue-500/20 focus:border-blue-500' : 'focus:ring-emerald-500/20 focus:border-emerald-500'

  const inputClass = (hasError) =>
    `w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm transition-colors outline-none focus:ring-2 ${
      hasError
        ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400'
        : `border-gray-200 bg-gray-50 focus:bg-white ${focusRing}`
    }`

  const passwordInputClass = (hasError) =>
    `w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm transition-colors outline-none focus:ring-2 ${
      hasError
        ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400'
        : `border-gray-200 bg-gray-50 focus:bg-white ${focusRing}`
    }`

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Mercatura POS" className="inline-block w-14 h-14 rounded-2xl mb-3 shadow-lg shadow-blue-600/30 object-contain bg-slate-800 p-1.5" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Mercatura POS</h1>
          <p className="text-slate-400 text-sm mt-1">Multi-Tenant Point of Sale & ML System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-8">
          <h2 className="text-gray-800 font-bold text-xl mb-1">Masuk ke akun</h2>
          <p className="text-gray-400 text-sm mb-5">
            {isAdmin ? 'Login sebagai Admin / Pemilik Bisnis' : 'Login sebagai Kasir'}
          </p>

          {/* Admin/Kasir Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setLoginAs('admin'); setValue('login_as', 'admin'); setValue('code', '') }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                isAdmin
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => { setLoginAs('kasir'); setValue('login_as', 'kasir'); setValue('code', '') }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                !isAdmin
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Kasir
            </button>
          </div>

          {/* Global error */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Code Input (Admin = Owner Code, Kasir = Business Code) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isAdmin ? 'Kode Admin (Owner)' : 'Kode Bisnis'}
              </label>
              <div className="relative">
                {isAdmin ? (
                  <RiShieldKeyholeLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                ) : (
                  <RiBuildingLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                )}
                <input
                  {...register('code')}
                  placeholder={isAdmin ? 'Kode admin Anda (6 karakter)' : 'Kode bisnis (6 karakter)'}
                  maxLength={6}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm font-mono uppercase tracking-widest transition-colors outline-none focus:ring-2 ${focusRing} ${
                    errors.code || fieldErrors.code
                      ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400'
                      : 'border-gray-200 bg-gray-50 focus:bg-white'
                  }`}
                  onChange={(e) => setValue('code', e.target.value.toUpperCase())}
                />
              </div>
              {(errors.code || fieldErrors.code) && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.code?.message || fieldErrors.code?.[0]}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <RiUserLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('username')}
                  placeholder="Masukkan username"
                  className={inputClass(errors.username || fieldErrors.username)}
                />
              </div>
              {(errors.username || fieldErrors.username) && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.username?.message || fieldErrors.username?.[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <RiLockLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  className={passwordInputClass(errors.password || fieldErrors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                </button>
              </div>
              {(errors.password || fieldErrors.password) && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password?.message || fieldErrors.password?.[0]}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className={`w-full ${accentBg} ${accentHoverBg} ${accentDisabledBg} text-white font-semibold py-2.5 rounded-xl text-sm transition-colors mt-2 flex items-center justify-center gap-2`}
            >
              {loading || isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Masuk...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun bisnis?{' '}
            <Link to="/register" className={`font-semibold transition-colors ${isAdmin ? 'text-blue-600 hover:text-blue-700' : 'text-emerald-600 hover:text-emerald-700'}`}>
              Daftarkan Bisnis
            </Link>
          </p>

          {/* Contextual hint */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              {isAdmin
                ? 'Gunakan Kode Admin yang diberikan saat registrasi bisnis'
                : 'Gunakan Kode Bisnis dan kredensial yang diberikan oleh admin'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
