import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import ManageCategories from './pages/admin/ManageCategories'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Top Navbar - shown on desktop, hidden on mobile */}
          <Navbar />

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-product"
                element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-product/:id"
                element={
                  <ProtectedRoute>
                    <EditProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute>
                    <ManageCategories />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          {/* Bottom Navigation - shown on mobile, hidden on desktop */}
          <BottomNav />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App