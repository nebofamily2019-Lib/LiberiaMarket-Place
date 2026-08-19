import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import { formatPriceWithCurrency } from '../utils/currency'
import { getImageUrl } from '../utils/imageUtils'
import '../styles/Home.css'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { savedItemService } from '../services/savedItemService'
import { ShoppingBag, ShieldCheck, Banknote, Rocket, Lock, Search, MapPin, Heart, Package, ArrowRight, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react'
import { getCategoryIcon } from '../utils/categoryIcons'

interface Product {
  id: string
  title: string
  description: string
  price: number
  currency?: string
  location: string
  images?: string[]
  category?: {
    name: string
    icon: string
    color: string
    slug: string
  }
  seller?: {
    name: string
    phone: string
  }
  status: string
  createdAt: string
}

const FeaturedProductCard = ({ product, index, navigate }: { product: Product, index: number, navigate: any }) => {
  const [isSaved, setIsSaved] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      savedItemService.checkSavedStatus(product.id).then(res => setIsSaved(res.isSaved)).catch(() => {})
    }
  }, [product.id, user])

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return
    try {
      const res = await savedItemService.toggleSavedItem(product.id)
      setIsSaved(res.saved)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      className="featured-card-small"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Product Image */}
      <div
        className="featured-card-image"
        onClick={() => navigate(`/products/${product.id}`)}
      >
        {product.images && product.images.length > 0 ? (
          <img
            src={getImageUrl(product.images[0])}
            alt={product.title}
            loading="lazy"
          />
        ) : (
          <div className="featured-card-placeholder">
            <Package size={24} className="text-gray-400" />
          </div>
        )}
        
        {/* Save Button */}
        <button
            onClick={handleToggleSave}
            className={`save-button ${isSaved ? 'saved' : ''}`}
            aria-label={isSaved ? "Unsave item" : "Save item"}
          >
            <Heart size={18} className={isSaved ? 'fill-current text-red-500' : 'text-gray-400'} />
        </button>

        {product.category && (
          <div
            className="featured-card-category"
            style={{
              background: product.category.color + '20',
              color: product.category.color,
              borderColor: product.category.color
            }}
          >
            {getCategoryIcon(product.category.slug, 16)}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div
        className="featured-card-content"
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <h3 className="featured-card-title">
          {product.title.length > 30
            ? `${product.title.substring(0, 30)}...`
            : product.title}
        </h3>

        <div className="featured-card-footer">
          <div className="featured-card-price">
            <div className="price-primary">{formatPriceWithCurrency(product.price, product.currency).primary}</div>
            <div className="price-secondary">{formatPriceWithCurrency(product.price, product.currency).secondary}</div>
          </div>
          <div className="featured-card-location">
            <MapPin size={14} />
            <span>{product.location.length > 10 ? product.location.substring(0, 10) + '...' : product.location}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const Home = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [currentSetIndex, setCurrentSetIndex] = useState(0)
  const productsPerSet = 6

  const handleLogin = () => {
    navigate('/login')
  }

  const handleBrowseAsGuest = () => {
    navigate('/products')
  }

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoadingProducts(true)
        const response = await api.get('/products?limit=12&status=active')
        if (response.data.success) {
          setFeaturedProducts(response.data.data || [])
        }
      } catch (err) {
        console.error('Failed to load featured products:', err)
        // Silently fail - home page should still work without products
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  // Calculate total sets
  const totalSets = Math.ceil(featuredProducts.length / productsPerSet)

  // Get current set of products to display
  const getCurrentProducts = () => {
    const startIndex = currentSetIndex * productsPerSet
    const endIndex = startIndex + productsPerSet
    return featuredProducts.slice(startIndex, endIndex)
  }

  const handleNextSet = () => {
    setCurrentSetIndex((prev) =>
      prev >= totalSets - 1 ? 0 : prev + 1
    )
  }

  const handlePrevSet = () => {
    setCurrentSetIndex((prev) =>
      prev <= 0 ? totalSets - 1 : prev - 1
    )
  }

  return (
    <div className="home-container">
      {/* Liberian Flag Stripe */}
      <div className="liberia-flag-bar" />
      {/* Split Hero Section */}
      <div className="hero-section-split">
        {/* Left Side - Branding & CTA */}
        <div className="hero-left">
          {/* Logo & Branding */}
          <div className="brand-section">
            <div className="logo-circle">
              <span className="logo-text">LM</span>
            </div>
            <h1 className="hero-title">
              {t.common.heroTitle}
            </h1>
            <p className="hero-subtitle">
              {t.common.heroSubtitle}
            </p>
            <div
              onClick={handleBrowseAsGuest}
              className="browse-badge"
            >
              <Search size={16} />
              <span>{t.common.browseFreely}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="cta-section">
            <a
              href="/register?role=seller"
              className="cta-button cta-primary"
              onClick={(e) => {
                e.preventDefault();
                navigate('/register?role=seller');
              }}
            >
              <Rocket size={20} />
              <span>{t.common.startSelling}</span>
            </a>

            <button
              onClick={handleLogin}
              className="cta-button cta-secondary"
            >
              <Lock size={20} />
              <span>{t.common.login}</span>
            </button>

            <button
              onClick={handleBrowseAsGuest}
              className="cta-button cta-ghost"
            >
              <ShoppingBag size={20} />
              <span>{t.common.browseAsGuest}</span>
            </button>
          </div>

          {/* Stats Section - Compact */}
          <div className="stats-section-compact">
            <div className="stat-item-compact">
              <div className="stat-number-compact">1000+</div>
              <div className="stat-label-compact">{t.common.products}</div>
            </div>
            <div className="stat-item-compact">
              <div className="stat-number-compact">500+</div>
              <div className="stat-label-compact">{t.common.sellers}</div>
            </div>
            <div className="stat-item-compact">
              <div className="stat-number-compact">24/7</div>
              <div className="stat-label-compact">{t.common.support}</div>
            </div>
          </div>
        </div>

        {/* Right Side - Featured Products Grid */}
        <div className="hero-right">
          {/* Top Right Feature Cards - Moved inside hero-right to prevent overlap */}
          <div className="top-right-features">
            <div
              className="feature-item-compact"
              onClick={handleBrowseAsGuest}
            >
              <ShoppingBag size={18} className="text-blue-600" />
              <span>{t.common.shopLocal}</span>
            </div>
            <div
              className="feature-item-compact"
              onClick={handleBrowseAsGuest}
            >
              <Banknote size={18} className="text-green-600" />
              <span>{t.common.bestPrices}</span>
            </div>
            <div
              className="feature-item-compact"
              onClick={() => navigate('/safety')}
            >
              <ShieldCheck size={18} className="text-blue-600" />
              <span>{t.common.safeSecure}</span>
            </div>
          </div>

          {!loadingProducts && featuredProducts.length > 0 && (
            <div className="product-showcase">
              <div className="showcase-header">
                <h2 className="showcase-title">
                  <Banknote size={24} className="text-yellow-500" />
                  {t.common.featuredProducts}
                </h2>
                <div className="showcase-header-controls">
                  {totalSets > 1 && (
                    <>
                      <button onClick={handlePrevSet} className="set-nav-btn" title="Previous">
                        <ChevronLeft size={20} />
                      </button>
                      <div className="set-indicators">
                        {Array.from({ length: totalSets }).map((_, index) => (
                          <div
                            key={index}
                            className={`set-indicator ${index === currentSetIndex ? 'active' : ''}`}
                            onClick={() => setCurrentSetIndex(index)}
                          />
                        ))}
                      </div>
                      <button onClick={handleNextSet} className="set-nav-btn" title="Next">
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  <button
                    className="view-all-link"
                    onClick={handleBrowseAsGuest}
                  >
                    {t.common.viewAll} <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="featured-products-grid-small" key={currentSetIndex}>
                {getCurrentProducts().map((product, index) => (
                  <FeaturedProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    navigate={navigate}
                  />
                ))}
              </div>
            </div>
          )}

          {!loadingProducts && featuredProducts.length === 0 && (
            <div className="product-showcase-empty">
              <Package size={48} className="text-gray-300 mb-4" />
              <h3>No products found</h3>
              <p>Be the first to list something!</p>
              <button onClick={() => navigate('/register?role=seller')} className="mt-4 text-blue-600 font-medium">
                Start Selling
              </button>
            </div>
          )}

          {/* Loading State */}
          {loadingProducts && (
            <div className="showcase-loading">
              <div className="loading-spinner"></div>
              <p>{t.common.loadingFeatured}</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={handleBrowseAsGuest}
        aria-label={t.common.browseProducts}
      >
        <ShoppingBag size={24} />
      </button>

      {/* Market Tip Banner */}
      <div className="market-tip-container">
        <div className="market-tip">
          <Lightbulb size={24} className="text-orange-600" />
          <div>
            <h3>Market Tip:</h3>
            <p>
              Don't be shy to bargain! Use the "Make Offer" button to agree on a good price with the seller.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home