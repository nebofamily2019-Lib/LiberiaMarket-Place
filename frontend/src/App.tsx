import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/ToastContainer'
import HamburgerMenu from './components/HamburgerMenu'
import BottomNav from './components/BottomNav'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const AddProduct = lazy(() => import('./pages/AddProduct'))
const EditProduct = lazy(() => import('./pages/EditProduct'))
const MyProducts = lazy(() => import('./pages/MyProducts'))
const Categories = lazy(() => import('./pages/Categories'))
const Messages = lazy(() => import('./pages/Messages'))
const MessageThread = lazy(() => import('./pages/MessageThread'))
const SellerProfile = lazy(() => import('./pages/SellerProfile'))
const SavedItems = lazy(() => import('./pages/SavedItems'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Wallet = lazy(() => import('./pages/Wallet'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const Safety = lazy(() => import('./pages/Safety'))
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'))

// Loading component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '50vh',
    color: '#666'
  }}>
    <div className="page-spinner" />
    <span style={{ marginLeft: '10px' }}>Loading...</span>
  </div>
)

// Inner component to use useLocation hook
function AppContent() {
  const location = useLocation()

  // Routes where sidebar should NOT be shown
  const noSidebarRoutes = ['/', '/login', '/register']
  const showSidebar = !noSidebarRoutes.includes(location.pathname)

  return (
    <>
      {showSidebar && <HamburgerMenu />}
      {showSidebar && <BottomNav />}
      <div className={showSidebar ? "app-main-content" : ""}>
        <ToastContainer />
        <Suspense fallback={<PageLoader />}>
          <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public Product Browsing */}
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/seller/:sellerId" element={<SellerProfile />} />

              {/* Protected Routes - Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/saved-items"
                element={
                  <ProtectedRoute>
                    <SavedItems />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                }
              />

              {/* Legal & Safety */}
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/safety" element={<Safety />} />

              {/* Protected Routes - Seller Financial Dashboard */}
              <Route
                path="/seller/financials"
                element={
                  <ProtectedRoute allowedRoles={['seller', 'admin']}>
                    <SellerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - Product Management */}
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

              {/* Protected Routes - Messaging */}
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
                    <p>The page you're looking for doesn't exist.</p>
                    <button onClick={() => window.location.href = '/'}>
                      Go Home
                    </button>
                  </div>
                } 
              />
        </Routes>
        </Suspense>
      </div>
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <Router>
              <AppContent />
            </Router>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App