import { useQuery } from '@tanstack/react-query'
import { productsAPI, inventoryAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

/**
 * Global hook for low-stock alerts.
 * Returns lowStockCount, lowStockProducts (with status), and refetch.
 * Used by MainLayout -> TopBar so bell icon works on ALL pages.
 */
export function useStockAlerts() {
  const { business } = useAuth()
  const bCode = business?.code

  const { data: productsData } = useQuery({
    queryKey: ['products-stock-check', bCode],
    queryFn: () => productsAPI.getProducts({ limit: 500 }),
    refetchInterval: 120000,
    staleTime: 120000,
    retry: 1,
  })

  const { data: batchesData, refetch } = useQuery({
    queryKey: ['batches-stock-check', bCode],
    queryFn: () => inventoryAPI.getBatches({ status: 'ACTIVE', limit: 1000 }),
    refetchInterval: 120000,
    staleTime: 120000,
    retry: 1,
  })

  const productsList = Array.isArray(productsData) ? productsData : (productsData?.results || [])
  const batchesList = Array.isArray(batchesData) ? batchesData : (batchesData?.results || [])

  // Build stock map: productId -> total qty (exclude expired batches)
  const stockMap = {}
  batchesList.filter(b => !b.is_expired).forEach(b => {
    const pid = b.product_id || b.product
    stockMap[pid] = (stockMap[pid] || 0) + (b.quantity || 0)
  })

  // Calculate low stock products with status
  const lowStockProducts = productsList
    .filter(p => p.is_active)
    .map(p => {
      const currentStock = stockMap[p.id] || 0
      const minStock = p.min_stock || 0
      let stockStatus = 'AMAN'
      if (currentStock === 0) stockStatus = 'HABIS'
      else if (currentStock <= minStock) stockStatus = 'RENDAH'
      return {
        id: p.id,
        name: p.name,
        code: p.code,
        currentStock,
        minStock,
        stockStatus,
        unit: p.unit || 'PCS',
      }
    })
    .filter(p => p.stockStatus !== 'AMAN')
    .sort((a, b) => {
      // HABIS first, then RENDAH
      if (a.stockStatus === 'HABIS' && b.stockStatus !== 'HABIS') return -1
      if (a.stockStatus !== 'HABIS' && b.stockStatus === 'HABIS') return 1
      return a.currentStock - b.currentStock
    })

  // Calculate expiring batches
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const next30Days = new Date(today)
  next30Days.setDate(today.getDate() + 30)

  const expiringBatches = batchesList
    .filter(b => b.expiry_date && b.quantity > 0)
    .map(b => {
      const expDate = new Date(b.expiry_date)
      expDate.setHours(0, 0, 0, 0)
      
      let expStatus = 'AMAN'
      if (expDate < today) expStatus = 'KADALUARSA'
      else if (expDate <= next30Days) expStatus = 'HAMPIR KADALUARSA'
      
      const productName = productsList.find(p => p.id === (b.product_id || b.product))?.name || 'Produk'
      
      return {
        ...b,
        productName,
        expStatus,
        daysLeft: Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))
      }
    })
    .filter(b => b.expStatus !== 'AMAN')
    .sort((a, b) => a.daysLeft - b.daysLeft)

  return {
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    expiringBatchesCount: expiringBatches.length,
    expiringBatches,
    stockMap,
    productCount: productsList.filter(p => p.is_active).length,
    refetch,
  }
}
