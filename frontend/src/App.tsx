import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import AddProduct from './pages/AddProduct'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import MyProducts from './pages/MyProducts'
import MyPurchases from './pages/MyPurchases'
import BrowseProducts from './pages/BrowseProducts'

// Create a component to handle the root route logic
const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh' 
    }}>
      <div style={{ fontSize: '3rem' }}>⏳</div>
    </div>
  }

  // If authenticated, redirect based on role
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  // If not authenticated, show the beautiful home page
  return <Home />
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Root - Show Home or redirect based on auth status */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/browse-products" element={<BrowseProducts />} />
            
            {/* Protected Routes - Any authenticated user */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Products />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            
            {/* Protected Routes - Seller/Admin only */}
            <Route
              path="/products/add"
              element={
                <ProtectedRoute requiredRole="seller">
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            
            {/* Protected Routes - Admin only */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Seller's product management */}
            <Route
              path="/my-products"
              element={
                <ProtectedRoute requiredRole="seller">
                  <MyProducts />
                </ProtectedRoute>
              }
            />
            
            {/* Buyer's purchase history */}
            <Route
              path="/my-purchases"
              element={
                <ProtectedRoute>
                  <MyPurchases />
                </ProtectedRoute>
              }
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App