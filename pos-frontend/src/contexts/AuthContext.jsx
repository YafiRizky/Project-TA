import { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already logged in on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const userData = localStorage.getItem('user_data')
        const businessData = localStorage.getItem('business_data')

        if (token && userData) {
          setUser(JSON.parse(userData))
          if (businessData && businessData !== 'undefined') {
            setBusiness(JSON.parse(businessData))
          } else {
            setBusiness(null)
          }
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear invalid data
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('business_data')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      
      // Call Django login API
      const response = await authAPI.login(credentials)
      
      if (response.success) {
        const { tokens, user: userData } = response  // Fix: Remove .data
        
        // Store tokens
        localStorage.setItem('access_token', tokens.access)
        localStorage.setItem('refresh_token', tokens.refresh)
        
        // Store user and business data - Fix: Use nested structure
        const userInfo = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          full_name: userData.full_name
        }
        
        let businessInfo = null;
        if (userData.business) {
          businessInfo = {
            id: userData.business.id,
            code: userData.business.business_code,
            name: userData.business.business_name,
            type: userData.business.business_type
          }
          localStorage.setItem('business_data', JSON.stringify(businessInfo))
        } else {
          localStorage.removeItem('business_data')
        }
        
        localStorage.setItem('user_data', JSON.stringify(userInfo))
        
        setUser(userInfo)
        setBusiness(businessInfo)
        setIsAuthenticated(true)
        
        return { success: true, user: userInfo, business: businessInfo }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      
      // Handle different error types
      if (error.response?.data) {
        const errorMessage = error.response.data.message || 'Login failed'
        const errors = error.response.data.errors || {}
        return { 
          success: false, 
          message: errorMessage,
          errors: errors
        }
      }
      
      return { 
        success: false, 
        message: error.message || 'Network error. Please check your connection.' 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      // Call Django logout API to blacklist refresh token
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear local state regardless of API call success
      setUser(null)
      setBusiness(null)
      setIsAuthenticated(false)
      
      // Clear localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('business_data')
      
      setLoading(false)
    }
  }

  const refreshUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser()
      if (response.user) {
        const userData = response.user
        const userInfo = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          full_name: userData.full_name
        }
        localStorage.setItem('user_data', JSON.stringify(userInfo))
        setUser(userInfo)
      }
    } catch (error) {
      console.error('Refresh user data error:', error)
    }
  }

  const updateUserData = (newData) => {
    const updatedUser = { ...user, ...newData }
    localStorage.setItem('user_data', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const updateBusinessData = (newData) => {
    const updatedBusiness = { ...business, ...newData }
    localStorage.setItem('business_data', JSON.stringify(updatedBusiness))
    setBusiness(updatedBusiness)
  }

  // Listen for business-updated events from ProfilePage
  useEffect(() => {
    const handler = (e) => {
      if (e.detail) {
        setBusiness(e.detail)
        localStorage.setItem('business_data', JSON.stringify(e.detail))
      }
    }
    window.addEventListener('business-updated', handler)
    return () => window.removeEventListener('business-updated', handler)
  }, [])

  const value = {
    // State
    user,
    business,
    loading,
    isAuthenticated,
    
    // Actions
    login,
    logout,
    refreshUserData,
    updateUserData,
    updateBusinessData,
    
    // Helper functions
    getBusinessCode: () => business?.code,
    getBusinessName: () => business?.name,
    getUserRole: () => user?.role,
    isAdmin: () => user?.role === 'admin',
    isKasir: () => user?.role === 'kasir'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}