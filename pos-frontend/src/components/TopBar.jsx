import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RiMenuLine, RiCloseLine } from 'react-icons/ri'
import { useAuth } from '../contexts/AuthContext'
import { notificationsAPI } from '../services/api'

export default function TopBar({
  title,
  onMenuClick,
  alertCount = 0,
  lowStockProducts = [],
  expiringBatches = [],
  onMarkRead,
  onMarkAllRead
}) {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const isOwner = isAdmin()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [showPanel, setShowPanel] = useState(false)
  const panelRef = useRef(null)

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false)
      }
    }
    if (showPanel) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPanel])

  // Send notification mutation (kasir)
  const sendNotifMutation = useMutation({
    mutationFn: notificationsAPI.createNotification,
    onSuccess: () => {},
  })

  const handleBellClick = () => {
    setShowPanel(!showPanel)
  }

  const handleItemClick = (product) => {
    if (isOwner) {
      navigate(`/inventory?highlight=${product.id}&autoEdit=true`)
      setShowPanel(false)
    }
  }

  const handleSendNotif = (product, e) => {
    e.stopPropagation()
    const type = product.currentStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
    sendNotifMutation.mutate({
      product_id: product.id,
      notif_type: type,
      message: `${product.name} (${product.code}) - Stok: ${product.currentStock} ${product.unit}`,
    })
  }

  const handleMarkItemRead = (alertId, e) => {
    e.stopPropagation() // CRITICAL: STAYS OPEN
    if (onMarkRead) {
      onMarkRead(alertId)
    }
  }

  const handleMarkAllReadClick = (e) => {
    e.stopPropagation() // STAYS OPEN
    if (onMarkAllRead) {
      onMarkAllRead()
    }
  }

  // Bell SVG icon (custom, clean design)
  const BellIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )

  const statusBadge = (status) => {
    if (status === 'HABIS') return 'bg-red-100 text-red-700'
    if (status === 'RENDAH') return 'bg-amber-100 text-amber-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <>
      {/* Offline indicator banner */}
      {isOffline && (
        <div className="bg-red-600 text-white text-center py-1.5 px-4 text-xs font-medium flex items-center justify-center gap-2 sticky top-0 z-30">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
          <span>Tidak ada koneksi internet — beberapa fitur tidak tersedia</span>
        </div>
      )}

      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 sticky top-0 z-20 shrink-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RiMenuLine size={22} />
        </button>

        {/* Page title */}
        <h1 className="text-gray-800 font-semibold text-base flex-1 truncate">
          {title}
        </h1>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification bell — always visible */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={handleBellClick}
              className="relative p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              title={alertCount > 0 ? `${alertCount} laporan stok belum dibaca` : 'Tidak ada alert'}
            >
              <BellIcon size={20} />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </button>

            {/* Dropdown notification panel */}
            {showPanel && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 class="font-bold text-gray-800 text-sm truncate">Notifikasi Stok</h3>
                    <p class="text-[10px] text-gray-400">
                      {alertCount > 0 ? `${alertCount} laporan belum dibaca` : 'Tidak ada laporan baru'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {alertCount > 0 && (
                      <button
                        onClick={handleMarkAllReadClick}
                        className={`text-xs ${isOwner ? 'text-blue-600 hover:text-blue-800' : 'text-emerald-600 hover:text-emerald-800'} font-semibold transition-colors whitespace-nowrap`}
                      >
                        Tandai Semua Dibaca
                      </button>
                    )}
                    <button onClick={() => setShowPanel(false)} className="p-1 rounded hover:bg-gray-200 text-gray-400 shrink-0">
                      <RiCloseLine size={16} />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 text-xs">
                  {lowStockProducts.length > 0 || expiringBatches.length > 0 ? (
                    <>
                      {lowStockProducts.map((p) => (
                        <div
                          key={p.alertId || p.id}
                          onClick={() => handleItemClick(p)}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-2 ${isOwner ? 'cursor-pointer' : ''}`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium text-gray-800 text-xs truncate">{p.name}</span>
                              <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold ${statusBadge(p.stockStatus)} shrink-0`}>
                                {p.stockStatus}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400">{p.code} &bull; Stok: {p.currentStock} {p.unit}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {!isOwner && (
                              <button
                                onClick={(e) => handleSendNotif(p, e)}
                                disabled={sendNotifMutation.isPending}
                                className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-[10px] font-semibold transition-colors"
                              >
                                {sendNotifMutation.isPending ? '...' : 'Kirim Notif'}
                              </button>
                            )}
                            <button
                              onClick={(e) => handleMarkItemRead(p.alertId, e)}
                              className="px-2 py-1 rounded bg-gray-100 hover:bg-slate-800 hover:text-white text-gray-600 text-[10px] font-semibold transition-all"
                            >
                              Tandai Dibaca
                            </button>
                          </div>
                        </div>
                      ))}

                      {expiringBatches.map((b) => (
                        <div
                          key={b.alertId || `batch-${b.id}`}
                          onClick={() => {
                            if (isOwner) {
                              navigate(`/inventory?highlight=${b.product_id || b.product}`)
                              setShowPanel(false)
                            }
                          }}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-2 ${isOwner ? 'cursor-pointer' : ''}`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium text-gray-800 text-xs truncate">{b.productName}</span>
                              <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold ${b.expStatus === 'KADALUARSA' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'} shrink-0`}>
                                {b.expStatus}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400">Exp: {b.expiry_date ? new Date(b.expiry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '–'} &bull; Sisa {b.quantity} item</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => handleMarkItemRead(b.alertId, e)}
                              className="px-2 py-1 rounded bg-gray-100 hover:bg-slate-800 hover:text-white text-gray-600 text-[10px] font-semibold transition-all"
                            >
                              Tandai Dibaca
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-400 text-xs">
                      <div className="flex justify-center mb-2"><BellIcon size={24} /></div>
                      <p className="font-medium text-gray-600">Semua notifikasi telah dibaca</p>
                      <p className="text-gray-400 text-[11px] mt-0.5">Tidak ada laporan baru</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User info */}
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${isOwner ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-gray-800 text-xs font-semibold leading-tight">
                {user?.full_name || user?.username}
              </p>
              <p className={`text-xs font-medium ${isOwner ? 'text-blue-600' : 'text-emerald-600'}`}>
                {isOwner ? 'Owner' : 'Kasir'}
              </p>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
