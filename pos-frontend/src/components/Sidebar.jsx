import { useRef, useEffect, useCallback, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  RiDashboardLine,
  RiShoppingBag3Line,
  RiListCheck2,
  RiTruckLine,
  RiArchiveLine,
  RiShoppingCartLine,
  RiBarChartBoxLine,
  RiBrainLine,
  RiUserSettingsLine,
  RiLogoutBoxLine,
  RiStoreLine,
  RiCloseLine,
  RiAddLine,
  RiHistoryLine,
  RiBankCardLine,
  RiServerLine,
  RiPriceTag3Line,
  RiClipboardLine,
  RiAccountCircleLine,
  RiExchangeBoxLine
} from 'react-icons/ri'
import { useAuth } from '../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { transactionsAPI } from '../services/api'
import { fmt } from '../utils/formatCurrency'

// Persist sidebar scroll position across remounts (module-level, survives component lifecycle)
let _savedScrollTop = 0

const ownerMenu = [
  { label: 'Dashboard', path: '/dashboard', icon: RiDashboardLine },
  {
    section: 'Master Data',
    items: [
      { label: 'Kategori', path: '/categories', icon: RiListCheck2 },
      { label: 'Supplier', path: '/suppliers', icon: RiTruckLine },
      { label: 'Produk', path: '/products', icon: RiShoppingBag3Line },
      { label: 'Manajemen Diskon', path: '/promotions', icon: RiPriceTag3Line },
    ]
  },
  {
    section: 'Inventori',
    items: [
      { label: 'Stok Batch', path: '/inventory', icon: RiArchiveLine },
      { label: 'Stock Opname', path: '/stock-opname', icon: RiClipboardLine },
    ]
  },
  {
    section: 'Transaksi',
    items: [
      { label: 'Daftar Transaksi', path: '/transactions', icon: RiShoppingCartLine },
    ]
  },
  {
    section: 'Laporan',
    items: [
      { label: 'Laporan Penjualan', path: '/reports', icon: RiBarChartBoxLine },
    ]
  },
  {
    section: 'AI & Prediksi',
    items: [
      { label: 'Prediksi & Rekomendasi', path: '/ml-predictions', icon: RiBrainLine, badge: 'AI' },
    ]
  },
  {
    section: 'Pengaturan',
    items: [
      { label: 'Profil Saya', path: '/profile', icon: RiAccountCircleLine },
      { label: 'Kelola Kasir', path: '/users', icon: RiUserSettingsLine },
      { label: 'Pengaturan Pembayaran', path: '/payment-settings', icon: RiBankCardLine },
      { label: 'Riwayat Sistem', path: '/auditlog', icon: RiServerLine },
    ]
  },
]

const kasirMenu = [
  { label: 'Dashboard', path: '/dashboard', icon: RiDashboardLine },
  {
    section: 'Transaksi',
    items: [
      { label: 'Transaksi Baru', path: '/pos', icon: RiAddLine },
      { label: 'Riwayat Transaksi', path: '/transactions', icon: RiHistoryLine },
    ]
  },
  {
    section: 'Inventori',
    items: [
      { label: 'Stock Opname', path: '/stock-opname', icon: RiClipboardLine },
    ]
  },
  {
    section: 'Pengaturan',
    items: [
      { label: 'Profil Saya', path: '/profile', icon: RiAccountCircleLine },
    ]
  },
]

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, business, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const navRef = useRef(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showShiftSummary, setShowShiftSummary] = useState(false)
  const isOwner = isAdmin()

  // Fetch daily summary for shift summary modal (kasir only)
  const { data: shiftData } = useQuery({
    queryKey: ['daily-summary', business?.code],
    queryFn: transactionsAPI.getDailySummary,
    enabled: !isOwner,
    staleTime: 30000,
  })


  // Restore scroll position when sidebar mounts
  useEffect(() => {
    const el = navRef.current
    if (el && _savedScrollTop > 0) {
      el.scrollTop = _savedScrollTop
    }
  }, [])

  // Save scroll position on every scroll event
  const handleNavScroll = useCallback((e) => {
    _savedScrollTop = e.target.scrollTop
  }, [])

  const menuConfig = isAdmin() ? ownerMenu : kasirMenu

  const activeClass = isOwner
    ? 'bg-blue-600 text-white'
    : 'bg-emerald-600 text-white'

  const hoverClass = 'hover:bg-slate-700 hover:text-white'

  const accentDot = isOwner ? 'bg-blue-400' : 'bg-emerald-400'
  const sectionTextColor = 'text-slate-500'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const renderMenuItem = (item) => {
    const Icon = item.icon
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onMobileClose}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            isActive
              ? activeClass
              : `text-slate-300 ${hoverClass}`
          }`
        }
      >
        <Icon size={17} className="shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">{item.badge}</span>
        )}
      </NavLink>
    )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header - anchored at top */}
      <div className="shrink-0">
        <div className="flex items-center gap-3 px-5 py-5">
          <img src="/logo.png" alt="Mercatura POS" className="w-8 h-8 rounded-lg object-contain bg-slate-800 p-0.5 border border-slate-700 shrink-0" />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate leading-tight">
              {business?.name || 'POS System'}
            </p>
            <p className="text-slate-400 text-xs truncate">
              {business?.code || '---'}
            </p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onMobileClose}
            className="ml-auto text-slate-400 hover:text-white lg:hidden"
          >
            <RiCloseLine size={20} />
          </button>
        </div>
        {/* Role badge */}
        <div className="px-5 pb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${isOwner ? 'bg-blue-900/40 text-blue-300' : 'bg-emerald-900/40 text-emerald-300'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${accentDot}`}></span>
            {isOwner ? 'Owner' : 'Kasir'}
          </span>
        </div>
        <div className="border-b border-slate-700"></div>
      </div>

      {/* Navigation - scrollable middle */}
      <nav ref={navRef} onScroll={handleNavScroll} className="sidebar-nav flex-1 px-3 py-2 overflow-y-auto">
        {menuConfig.map((entry, idx) => {
          // Top-level menu item (no section)
          if (entry.path) {
            return renderMenuItem(entry)
          }
          // Section group
          if (entry.section) {
            return (
              <div key={entry.section}>
                <p className={`px-3 pt-5 pb-1.5 ${sectionTextColor} text-xs font-semibold uppercase tracking-wider`}>
                  {entry.section}
                </p>
                <div className="space-y-0.5">
                  {entry.items.map(item => renderMenuItem(item))}
                </div>
              </div>
            )
          }
          return null
        })}
      </nav>

      {/* Footer - anchored at bottom */}
      <div className="shrink-0 px-3 pb-4 border-t border-slate-700 pt-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${isOwner ? 'bg-blue-600' : 'bg-emerald-600'}`}>
            {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user?.full_name || user?.username || 'User'}
            </p>
            <p className="text-slate-400 text-xs truncate">{user?.username}</p>
          </div>
        </div>
        
        {isOwner && (
          <button
            onClick={() => navigate('/businesses')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-150"
          >
            <RiExchangeBoxLine size={17} className="text-indigo-400" />
            <span>Ganti Cabang</span>
          </button>
        )}
        
        <button
          onClick={() => isOwner ? setShowLogoutConfirm(true) : setShowShiftSummary(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-900/30 hover:text-red-400 transition-all duration-150"
        >
          <RiLogoutBoxLine size={17} />
          <span>Logout</span>
        </button>
      </div>

      {/* Shift Summary Modal — Kasir only */}
      {showShiftSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 rounded-xl p-6 mx-4 max-w-sm w-full shadow-2xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-900/40 flex items-center justify-center shrink-0">
                <RiBarChartBoxLine size={20} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Ringkasan Shift Anda</h3>
                <p className="text-slate-400 text-xs mt-0.5">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center bg-slate-700/50 rounded-lg px-4 py-3">
                <span className="text-slate-300 text-sm">Total Transaksi</span>
                <span className="text-white font-bold text-sm">{shiftData?.transaction_count || 0} transaksi</span>
              </div>
              <div className="flex justify-between items-center bg-slate-700/50 rounded-lg px-4 py-3">
                <span className="text-slate-300 text-sm">Total Omzet</span>
                <span className="text-emerald-400 font-bold text-sm">Rp {fmt(shiftData?.total_revenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-700/50 rounded-lg px-4 py-3">
                <span className="text-slate-300 text-sm">Total Item Terjual</span>
                <span className="text-white font-bold text-sm">{shiftData?.item_count || 0} item</span>
              </div>
              {shiftData?.payment_methods && Object.entries(shiftData.payment_methods).map(([method, data]) => (
                <div key={method} className="flex justify-between items-center bg-slate-700/30 rounded-lg px-4 py-2">
                  <span className="text-slate-400 text-xs">{method}</span>
                  <span className="text-slate-200 text-xs font-medium">{data.count}x · Rp {fmt(data.amount || 0)}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowShiftSummary(false)}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={() => { setShowShiftSummary(false); setShowLogoutConfirm(true) }}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors"
              >
                Lanjut Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 rounded-xl p-6 mx-4 max-w-sm w-full shadow-2xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Konfirmasi Logout</h3>
                <p className="text-slate-400 text-xs mt-0.5">Apakah Anda yakin ingin keluar?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); handleLogout() }}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-slate-900 shrink-0 fixed top-0 left-0 h-full z-30">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onMobileClose}
          />
          <aside className="relative w-60 bg-slate-900 flex flex-col z-50 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
