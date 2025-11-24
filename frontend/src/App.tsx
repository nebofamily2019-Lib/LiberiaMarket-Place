import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/ToastContainer'

// Import all pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import MyProducts from './pages/MyProducts'
import Categories from './pages/Categories'
import BuyerInbox from './pages/BuyerInbox'
import SellerInbox from './pages/SellerInbox'
import Messages from './pages/Messages'
import MessageThread from './pages/MessageThread'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <ToastContainer />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Public Product Browsing */}
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/categories" element={<Categories />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route
                path="/products/add"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/products/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <EditProduct />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-products"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <MyProducts />
                  </ProtectedRoute>
                }
              />
              
              <Route 
                path="/buyer/inbox" 
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                    <BuyerInbox />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/seller/inbox" 
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <SellerInbox />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/messages/:id" 
                element={
                  <ProtectedRoute>
                    <MessageThread />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route for debugging */}
              <Route 
                path="*" 
                element={
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <h1>404 - Page Not Found</h1>
                    <p>Current path: {window.location.pathname}</p>
                    <button onClick={() => window.location.href = '/'}>
                      Go Home
                    </button>
                    <button onClick={() => window.location.href = '/register'}>
                      Go to Register
                    </button>
                  </div>
                } 
              />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App