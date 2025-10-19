import { Link } from 'react-router-dom'
import VoiceButton from './VoiceButton'
import LowLiteracyCard from './LowLiteracyCard'
import { useState } from 'react'

/**
 * Product type definition
 */
export interface Product {
  id: number
  title: string
  price: number
  location?: string
  imageUrl?: string
  category?: string
}

/**
 * ProductCard Component
 * - Image-first design (square 1:1 aspect ratio)
 * - Optimized for mobile grid layout
 * - Similar to Facebook Marketplace card design
 */
interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { id, title, price, location, imageUrl } = product
  const [simpleView, setSimpleView] = useState(false)

  // Format price in Liberian Dollars
  const formatPrice = (price: number) => {
    return `L$${price.toLocaleString()}`
  }

  // Create voice-friendly text
  const voiceText = `${title}. Price: ${price} Liberian dollars. ${location ? `Location: ${location}` : ''}`

  const handleVoiceClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation()
  }

  return (
    <Link to={`/products/${id}`} className="product-card" style={{ position: 'relative' }}>
      {/* Product Image - Square aspect ratio */}
      <img
        src={imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'}
        alt={title}
        className="product-card-image"
        loading="lazy"
      />

      {/* Voice Button - Floating on top right of image */}
      <div
        onClick={handleVoiceClick}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          zIndex: 10
        }}
      >
        <VoiceButton text={voiceText} size="medium" ariaLabel={`Listen to ${title} details`} />
      </div>

      {/* Small toggle for low-literacy users to switch to simple card */}
      <div style={{ position: 'absolute', left: '8px', bottom: '8px', zIndex: 20 }}>
        <button
          onClick={(e) => { e.preventDefault(); setSimpleView(!simpleView) }}
          aria-label="Toggle simple view"
          style={{
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            border: 'none',
            padding: '6px 8px',
            borderRadius: 8,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          {simpleView ? 'Standard' : 'Simple'}
        </button>
      </div>

      {/* Render LowLiteracyCard when toggled */}
      {simpleView && (
        <div style={{ marginTop: '12px' }}>
          <LowLiteracyCard
            icon={moduleIconFor(product.category)}
            title={title}
            subtitle={location ? `📍 ${location}` : ''}
            voiceText={voiceText}
            onClick={() => { /* navigate or keep default link behaviour */ }}
            ariaLabel={`Simple view for ${title}`}
          />
        </div>
      )}

      {/* Product Info */}
      <div className="product-card-content">
        {/* Price - Most prominent */}
        <div className="product-card-price">{formatPrice(price)}</div>

        {/* Title - 2 lines max with ellipsis */}
        <div className="product-card-title">{title}</div>

        {/* Location - Secondary info */}
        {location && (
          <div className="product-card-location">📍 {location}</div>
        )}
      </div>
    </Link>
  )
}

// Minimal helper (inline) to pick icon based on category name
function moduleIconFor(category?: string) {
  if (!category) return '📦'
  const map: Record<string, string> = {
    electronics: '📱',
    fashion: '👗',
    'home & garden': '🏡',
    books: '📚'
  }
  return map[(category || '').toLowerCase()] || '📦'
}

export default ProductCard
