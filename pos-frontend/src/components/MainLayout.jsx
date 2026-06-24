import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useStockAlerts } from '../hooks/useStockAlerts'

export default function MainLayout({ children, title = 'POS ML System' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { lowStockCount, lowStockProducts, expiringBatchesCount, expiringBatches } = useStockAlerts()

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Content area - offset for fixed sidebar on desktop */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <TopBar
          title={title}
          onMenuClick={() => setMobileOpen(true)}
          alertCount={lowStockCount + expiringBatchesCount}
          lowStockProducts={lowStockProducts}
          expiringBatches={expiringBatches}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
