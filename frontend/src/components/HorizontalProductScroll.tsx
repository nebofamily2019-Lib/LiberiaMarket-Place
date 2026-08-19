import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { formatPriceWithCurrency } from '../utils/currency'
import { getImageUrl } from '../utils/imageUtils'
import '../styles/HorizontalProductScroll.css'

interface Product {
  id: string
  title: string
  description?: string
  price: number
  currency?: string
  images?: string[]
  condition?: string
  location?: string
  category?: {
    id: string
    name: string
    icon?: string
    color?: string
  }
  seller?: {
    id: string
    name: string
    rating?: number
    total_reviews?: number
  }
  view_count?: number
  recent_views?: number
}

interface HorizontalProductScrollProps {
  title: string
  icon?: string
  products: Product[]
  loading?: boolean
  emptyMessage?: string
  showViewAll?: boolean
  onViewAll?: () => void
}

const HorizontalProductScroll = ({
  title,
  icon,
  products,
  loading = false,
  emptyMessage = 'No products to display',
  showViewAll = false,
  onViewAll
}: HorizontalProductScrollProps) => {
  const navigate = useNavigate()
  const [scrollPosition, setScrollPosition] = useState(0)

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`scroll-container-${title}`)
    if (!container) return

    const scrollAmount = 300
    const newPosition =
      direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount)

    container.scrollTo({ left: newPosition, behavior: 'smooth' })
    setScrollPosition(newPosition)
  }

  const canScrollLeft = scrollPosition > 0
  const canScrollRight = () => {
    const container = document.getElementById(`scroll-container-${title}`)
    if (!container) return false
    return scrollPosition < container.scrollWidth - container.clientWidth - 10
  }

  if (loading) {
    return (
      <div className="horizontal-scroll-section">
        <div className="section-header">
          <h2 className="section-title">
            {icon && <span className="title-icon">{icon}</span>}
            {title}
          </h2>
        </div>
        <div className="horizontal-scroll-loading">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="product-card-skeleton">
              <div className="skeleton-image" />
              <div className="skeleton-title" />
              <div className="skeleton-price" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="horizontal-scroll-section">
        <div className="section-header">
          <h2 className="section-title">
            {icon && <span className="title-icon">{icon}</span>}
            {title}
          </h2>
        </div>
        <div className="horizontal-scroll-empty">
          <p>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="horizontal-scroll-section">
      <div className="section-header">
        <h2 className="section-title">
          {icon && <span className="title-icon">{icon}</span>}
          {title}
        </h2>
        {showViewAll && onViewAll && (
          <button className="view-all-button" onClick={onViewAll}>
            View All →
          </button>
        )}
      </div>

      <div className="horizontal-scroll-wrapper">
        {canScrollLeft && (
          <button
            className="scroll-button scroll-button-left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            ←
          </button>
        )}

        <div
          id={`scroll-container-${title}`}
          className="horizontal-scroll-container"
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="horizontal-product-card"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              {/* Product Image */}
              <div className="product-card-image">
                {product.images && product.images.length > 0 ? (
                  <img src={getImageUrl(product.images[0])} alt={product.title} loading="lazy" />
                ) : (
                  <div className="product-card-placeholder">📦</div>
                )}

                {/* View Count Badge */}
                {product.view_count !== undefined && product.view_count > 0 && (
                  <div className="view-count-badge">
                    👁️ {product.view_count}
                  </div>
                )}

                {/* Trending Badge */}
                {product.recent_views !== undefined && product.recent_views > 10 && (
                  <div className="trending-badge">🔥 Trending</div>
                )}

                {/* Category Badge */}
                {product.category && (
                  <div
                    className="category-badge"
                    style={{
                      background: product.category.color
                        ? `${product.category.color}20`
                        : 'rgba(59, 130, 246, 0.2)',
                      color: product.category.color || '#3b82f6',
                      borderColor: product.category.color || '#3b82f6'
                    }}
                  >
                    {product.category.icon} {product.category.name}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="product-card-info">
                <h3 className="product-card-title">
                  {product.title.length > 50
                    ? `${product.title.substring(0, 50)}...`
                    : product.title}
                </h3>
                <div className="product-card-price">
                  <div className="price-primary">{formatPriceWithCurrency(product.price, product.currency).primary}</div>
                  <div className="price-secondary">{formatPriceWithCurrency(product.price, product.currency).secondary}</div>
                </div>

                {product.condition && (
                  <div className="product-card-condition">{product.condition}</div>
                )}

                {product.location && (
                  <div className="product-card-location">📍 {product.location}</div>
                )}

                {product.seller && (
                  <div className="product-card-seller">
                    <span>🏪 {product.seller.name}</span>
                    {product.seller.rating && product.seller.rating > 0 && (
                      <span className="seller-rating">
                        ⭐ {product.seller.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {canScrollRight() && (
          <button
            className="scroll-button scroll-button-right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            →
          </button>
        )}
      </div>
    </div>
  )
}

export default HorizontalProductScroll
