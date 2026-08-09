import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { productsAPI, inventoryAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

/**
 * Global hook for low-stock alerts and expiring batches with read/unread state.
 * Returns unread counts, filtered unread items, and markRead handlers.
 */
export function useStockAlerts() {
  const { user, business } = useAuth()
  const bCode = business?.code
  const storageKey = `read_alerts_${user?.id || 'guest'}_${bCode || 'default'}`

  const [readAlertIds, setReadAlertIds] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(readAlertIds))
    } catch (e) {
      console.error('Failed to save read alerts to localStorage', e)
    }
  }, [readAlertIds, storageKey])

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
        alertId: `low-${p.id}-${currentStock}`,
        id: p.id,
        name: p.name,
        code: p.code,
        category: p.category_name || 'Umum',
        currentStock,
        minStock,
        stockStatus,
        unit: p.unit || 'PCS',
        alertType: 'LOW_STOCK'
      }
    })
    .filter(p => p.stockStatus !== 'AMAN')
    .sort((a, b) => {
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
      
      const product = productsList.find(p => p.id === (b.product_id || b.product))
      const productName = product?.name || 'Produk'
      const category = product?.category_name || 'Umum'
      
      return {
        ...b,
        alertId: `exp-${b.id}-${b.quantity}`,
        productName,
        category,
        expStatus,
        daysLeft: Math.ceil((expDate - today) / (1000 * 60 * 60 * 24)),
        alertType: 'EXPIRING_BATCH'
      }
    })
    .filter(b => b.expStatus !== 'AMAN')
    .sort((a, b) => a.daysLeft - b.daysLeft)

  // Unread Items
  const unreadLowStockProducts = lowStockProducts.filter(p => !readAlertIds.includes(p.alertId))
  const unreadExpiringBatches = expiringBatches.filter(b => !readAlertIds.includes(b.alertId))

  const markAlertAsRead = useCallback((alertId) => {
    setReadAlertIds(prev => prev.includes(alertId) ? prev : [...prev, alertId])
  }, [])

  const markAllAlertsAsRead = useCallback(() => {
    const allIds = [
      ...lowStockProducts.map(p => p.alertId),
      ...expiringBatches.map(b => b.alertId)
    ]
    setReadAlertIds(prev => Array.from(new Set([...prev, ...allIds])))
  }, [lowStockProducts, expiringBatches])

  return {
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    unreadLowStockCount: unreadLowStockProducts.length,
    unreadLowStockProducts,
    expiringBatchesCount: expiringBatches.length,
    expiringBatches,
    unreadExpiringBatchesCount: unreadExpiringBatches.length,
    unreadExpiringBatches,
    totalUnreadCount: unreadLowStockProducts.length + unreadExpiringBatches.length,
    markAlertAsRead,
    markAllAlertsAsRead,
    readAlertIds,
    stockMap,
    productCount: productsList.filter(p => p.is_active).length,
    refetch,
  }
}

