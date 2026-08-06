import axios from 'axios'

// Base URL from environment variable with fallback for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  },
  timeout: 10000, // 10 seconds
})

// Token management
const getToken = () => {
  return localStorage.getItem('access_token')
}

const setToken = (token) => {
  localStorage.setItem('access_token', token)
}

const removeToken = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_data')
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken
          })
          
          const { access } = response.data
          if (access) {
            setToken(access)
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${access}`
            return apiClient(originalRequest)
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user silently
        console.warn('Token refresh failed, redirecting to login')
      }
      
      // Save cart data to localStorage before redirect (C2: Cart persistence)
      try {
        const cartData = localStorage.getItem('pos_cart')
        if (cartData) {
          localStorage.setItem('pos_cart_backup', cartData)
        }
        localStorage.setItem('session_expired', 'true')
      } catch (e) { /* ignore localStorage errors */ }
      
      // Clear tokens and redirect
      removeToken()
      localStorage.removeItem('business_data')
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login/', credentials)
    return response.data
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    try {
      await apiClient.post('/auth/logout/', { refresh: refreshToken })
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      removeToken()
    }
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/profile/')
    return response.data
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    const response = await apiClient.post('/auth/refresh/', {
      refresh: refreshToken
    })
    return response.data
  },

  getMyBusinesses: async () => {
    const response = await apiClient.get('/auth/me/businesses/')
    return response.data
  },

  switchBranch: async (businessCode) => {
    const response = await apiClient.post('/auth/switch-branch/', { business_code: businessCode })
    return response.data
  },

  createBranch: async (data) => {
    const response = await apiClient.post('/auth/create-branch/', data)
    return response.data
  }
}

// Business Registration API (separate from auth since no token needed)
export const registerBusiness = async (data) => {
  const response = await apiClient.post('/auth/register/', data)
  return response.data
}

// Products API
export const productsAPI = {
  // Categories
  getCategories: async (params = {}) => {
    const response = await apiClient.get('/products/categories/', { params })
    return response.data
  },

  createCategory: async (data) => {
    const response = await apiClient.post('/products/categories/', data)
    return response.data
  },

  updateCategory: async (id, data) => {
    const response = await apiClient.put(`/products/categories/${id}/`, data)
    return response.data
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/products/categories/${id}/`)
    return response.data
  },

  // Suppliers
  getSuppliers: async (params = {}) => {
    const response = await apiClient.get('/products/suppliers/', { params })
    return response.data
  },

  createSupplier: async (data) => {
    const response = await apiClient.post('/products/suppliers/', data)
    return response.data
  },

  updateSupplier: async (id, data) => {
    const response = await apiClient.put(`/products/suppliers/${id}/`, data)
    return response.data
  },

  deleteSupplier: async (id) => {
    const response = await apiClient.delete(`/products/suppliers/${id}/`)
    return response.data
  },

  // Products
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products/products/', { params })
    return response.data
  },

  createProduct: async (data) => {
    const response = await apiClient.post('/products/products/', data)
    return response.data
  },

  getProduct: async (id) => {
    const response = await apiClient.get(`/products/products/${id}/`)
    return response.data
  },

  updateProduct: async (id, data) => {
    const response = await apiClient.put(`/products/products/${id}/`, data)
    return response.data
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/products/${id}/`)
    return response.data
  }
}

// Inventory API
export const inventoryAPI = {
  getBatches: async (params = {}) => {
    const response = await apiClient.get('/inventory/batches/', { params })
    return response.data
  },

  createBatch: async (data) => {
    const response = await apiClient.post('/inventory/batches/', data)
    return response.data
  },

  getBatch: async (id) => {
    const response = await apiClient.get(`/inventory/batches/${id}/`)
    return response.data
  },

  updateBatch: async (id, data) => {
    const response = await apiClient.put(`/inventory/batches/${id}/`, data)
    return response.data
  },

  getExpiringBatches: async () => {
    const response = await apiClient.get('/inventory/batches/expiring_soon/')
    return response.data
  },

  getInventorySummary: async (params = {}) => {
    const response = await apiClient.get('/inventory/batches/summary/', { params })
    return response.data
  },

  getStockMovements: async (params = {}) => {
    const response = await apiClient.get('/inventory/movements/', { params })
    return response.data
  },

  getOpnames: async (params = {}) => {
    const response = await apiClient.get('/inventory/opname/', { params })
    return response.data
  },

  createOpname: async (data) => {
    const response = await apiClient.post('/inventory/opname/', data)
    return response.data
  },

  approveOpname: async (id) => {
    const response = await apiClient.post(`/inventory/opname/${id}/approve/`)
    return response.data
  },

  rejectOpname: async (id) => {
    const response = await apiClient.post(`/inventory/opname/${id}/reject/`)
    return response.data
  }
}

// Transactions API
export const transactionsAPI = {
  getTransactions: async (params = {}) => {
    const response = await apiClient.get('/transactions/transactions/', { params })
    return response.data
  },

  getTransaction: async (id) => {
    const response = await apiClient.get(`/transactions/transactions/${id}/`)
    return response.data
  },

  createTransaction: async (data) => {
    const response = await apiClient.post('/transactions/transactions/', data)
    return response.data
  },

  checkout: async (data) => {
    // Generate idempotency key to prevent double submissions
    const idempotencyKey = `chk-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    const response = await apiClient.post('/transactions/transactions/checkout/', {
      ...data,
      idempotency_key: idempotencyKey,
    })
    return response.data
  },

  voidTransaction: async (id, reason) => {
    const response = await apiClient.post(`/transactions/transactions/${id}/void/`, { reason })
    return response.data
  },

  getDailySummary: async () => {
    const response = await apiClient.get('/transactions/transactions/daily_summary/')
    return response.data
  },

  getPaymentSummary: async () => {
    const response = await apiClient.get('/transactions/transactions/payment_summary/')
    return response.data
  },

  exportData: async (format = 'csv', startDate, endDate) => {
    const params = new URLSearchParams()
    params.append('format', format)
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    
    const response = await apiClient.get(`/transactions/transactions/export_data/?${params.toString()}`, {
      responseType: 'blob'
    })
    return response.data
  },

  getProfitLoss: async (startDate, endDate) => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    const response = await apiClient.get(`/transactions/transactions/profit_loss/?${params.toString()}`)
    return response.data
  }
}

// ========================
// KASIR MANAGEMENT API
// ========================
export const kasirAPI = {
  getKasirList: async () => {
    const response = await apiClient.get('/auth/kasir/')
    return response.data
  },

  createKasir: async (data) => {
    const response = await apiClient.post('/auth/kasir/', data)
    return response.data
  },

  getKasirDetail: async (id) => {
    const response = await apiClient.get(`/auth/kasir/${id}/`)
    return response.data
  },

  updateKasir: async (id, data) => {
    const response = await apiClient.put(`/auth/kasir/${id}/`, data)
    return response.data
  },

  deleteKasir: async (id) => {
    const response = await apiClient.delete(`/auth/kasir/${id}/`)
    return response.data
  },

  toggleKasirStatus: async (id) => {
    const response = await apiClient.post(`/auth/kasir/${id}/toggle/`)
    return response.data
  },

  resetKasirPassword: async (id, data) => {
    const response = await apiClient.post(`/auth/kasir/${id}/reset-password/`, data)
    return response.data
  },
}

// ========================
// PAYMENT METHODS API
// ========================
export const paymentMethodsAPI = {
  getMethods: async () => {
    const response = await apiClient.get('/payments/methods/')
    return response.data
  },

  createMethod: async (data) => {
    const response = await apiClient.post('/payments/methods/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  updateMethod: async (id, data) => {
    const response = await apiClient.put(`/payments/methods/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  deleteMethod: async (id) => {
    const response = await apiClient.delete(`/payments/methods/${id}/`)
    return response.data
  },

  toggleMethod: async (id) => {
    const response = await apiClient.post(`/payments/methods/${id}/toggle/`)
    return response.data
  },
}

export const profileAPI = {
  getProfile: () => apiClient.get('/auth/profile/').then(r => r.data),
  updateProfile: (data) => apiClient.put('/auth/profile/', data).then(r => r.data),
  changePassword: (data) => apiClient.post('/auth/change-password/', data).then(r => r.data),
  getBusinessProfile: () => apiClient.get('/auth/profile/business/').then(r => r.data),
  updateBusinessProfile: (data) => apiClient.put('/auth/profile/business/', data).then(r => r.data),
}

// ========================
// NOTIFICATIONS API (Stock alerts)
// ========================
export const notificationsAPI = {
  getNotifications: async (params = {}) => {
    const response = await apiClient.get('/notifications/', { params })
    return response.data
  },

  createNotification: async (data) => {
    const response = await apiClient.post('/notifications/create/', data)
    return response.data
  },

  markRead: async (id) => {
    const response = await apiClient.post(`/notifications/${id}/read/`)
    return response.data
  },

  markAllRead: async () => {
    const response = await apiClient.post('/notifications/read-all/')
    return response.data
  },
}

// Audit Log API
export const auditLogAPI = {
  getLogs: async (params = {}) => {
    const response = await apiClient.get('/auditlog/', { params })
    return response.data
  },
  
  getFilters: async () => {
    const response = await apiClient.get('/auditlog/filters/')
    return response.data
  }
}

// Promotions API
export const promotionsAPI = {
  getDiscounts: async () => {
    const response = await apiClient.get('/promotions/')
    return response.data
  },
  getActiveDiscounts: async () => {
    const response = await apiClient.get('/promotions/active/')
    return response.data
  },
  createDiscount: async (data) => {
    const response = await apiClient.post('/promotions/', data)
    return response.data
  },
  updateDiscount: async (id, data) => {
    const response = await apiClient.put(`/promotions/${id}/`, data)
    return response.data
  },
  deleteDiscount: async (id) => {
    const response = await apiClient.delete(`/promotions/${id}/`)
    return response.data
  }
}

// ========================
// MACHINE LEARNING API
// ========================
export const mlAPI = {
  getStockoutPrediction: async () => {
    const response = await apiClient.get('/ml/stockout/')
    return response.data
  },
  getRestockRecommendation: async (leadTime = 3) => {
    const response = await apiClient.get(`/ml/restock/?lead_time=${leadTime}`)
    return response.data
  },
  getExpiryRisk: async () => {
    const response = await apiClient.get('/ml/expiry-risk/')
    return response.data
  },
  getRevenueForecast: async (days = 30) => {
    const response = await apiClient.get(`/ml/forecast/?days=${days}`)
    return response.data
  },
  getProductClassification: async (days = 90) => {
    const response = await apiClient.get(`/ml/classification/?days=${days}`)
    return response.data
  },
}

// ========================
// XENDIT PAYMENT API
// ========================
export const xenditAPI = {
  createPayment: async ({ payment_method_id, amount }) => {
    const response = await apiClient.post('/payments/xendit/create-payment/', {
      payment_method_id, amount
    })
    return response.data
  },
  checkStatus: async (reference_id) => {
    const response = await apiClient.get(`/payments/xendit/check-status/${reference_id}/`)
    return response.data
  },
  simulatePayment: async (reference_id) => {
    const response = await apiClient.post(`/payments/xendit/simulate/${reference_id}/`)
    return response.data
  },
}

// Export the configured axios instance for custom usage
export default apiClient