import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CategoriesPage from './pages/CategoriesPage'
import ProductsPage from './pages/ProductsPage'
import SuppliersPage from './pages/SuppliersPage'
import InventoryPage from './pages/InventoryPage'
import TransactionsPage from './pages/TransactionsPage'
import ReportsPage from './pages/ReportsPage'
import MLPredictionsPage from './pages/MLPredictionsPage'
import UserManagementPage from './pages/UserManagementPage'
import PaymentSettingsPage from './pages/PaymentSettingsPage'
import KasirPOSPage from './pages/KasirPOSPage'
import ProfilePage from './pages/ProfilePage'
import AuditLogPage from './pages/AuditLogPage'
import DiscountManagementPage from './pages/DiscountManagementPage'
import StockOpnamePage from './pages/StockOpnamePage'
import BusinessSelectionPage from './pages/BusinessSelectionPage'

function App() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">Memuat POS System...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
      />
      <Route
        path="/businesses"
        element={<ProtectedRoute requireBusiness={false} requiredRole="admin"><BusinessSelectionPage /></ProtectedRoute>}
      />
      <Route
        path="/categories"
        element={<ProtectedRoute requiredRole="admin"><CategoriesPage /></ProtectedRoute>}
      />
      <Route
        path="/suppliers"
        element={<ProtectedRoute requiredRole="admin"><SuppliersPage /></ProtectedRoute>}
      />
      <Route
        path="/products"
        element={<ProtectedRoute requiredRole="admin"><ProductsPage /></ProtectedRoute>}
      />
      <Route
        path="/inventory"
        element={<ProtectedRoute requiredRole="admin"><InventoryPage /></ProtectedRoute>}
      />
      <Route
        path="/stock-opname"
        element={<ProtectedRoute><StockOpnamePage /></ProtectedRoute>}
      />
      <Route
        path="/pos"
        element={<ProtectedRoute><KasirPOSPage /></ProtectedRoute>}
      />
      <Route
        path="/transactions"
        element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>}
      />
      <Route
        path="/reports"
        element={<ProtectedRoute requiredRole="admin"><ReportsPage /></ProtectedRoute>}
      />
      <Route
        path="/ml-predictions"
        element={<ProtectedRoute requiredRole="admin"><MLPredictionsPage /></ProtectedRoute>}
      />
      <Route
        path="/users"
        element={<ProtectedRoute requiredRole="admin"><UserManagementPage /></ProtectedRoute>}
      />
      <Route
        path="/payment-settings"
        element={<ProtectedRoute requiredRole="admin"><PaymentSettingsPage /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
      />
      <Route
        path="/auditlog"
        element={<ProtectedRoute requiredRole="admin"><AuditLogPage /></ProtectedRoute>}
      />
      <Route
        path="/promotions"
        element={<ProtectedRoute requiredRole="admin"><DiscountManagementPage /></ProtectedRoute>}
      />

      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">404 - Halaman tidak ditemukan</h2>
              <p className="text-gray-500">Halaman yang kamu cari tidak ada.</p>
              <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
