import { useState } from 'react'
import { Link } from 'react-router-dom'
import { designSystem } from '../styles/designSystem'

interface SwipeableProductCardProps {
  product: {
    id: string
    title: string
    price: number
    image?: string
    condition?: string
    location?: string
    isNegotiable?: boolean
  }
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

const SwipeableProductCard = ({ product, onSwipeLeft, onSwipeRight }: SwipeableProductCardProps) => {
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX - startX)
  }

  const handleTouchEnd = () => {
    if (Math.abs(currentX) > 100) {
      if (currentX < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
      if (currentX > 0 && onSwipeRight) {
        onSwipeRight()
      }
    }
    setCurrentX(0)
    setIsDragging(false)
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        touchAction: 'pan-y'
      }}
    >
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          background: 'white',
          borderRadius: designSystem.borderRadius.lg,
          overflow: 'hidden',
          boxShadow: designSystem.shadows.md,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Image */}
          <div style={{
            height: '200px',
            background: product.image 
              ? `url(${product.image}) center/cover` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
          }}>
            {product.condition && (
              <div style={{
                position: 'absolute',
                top: designSystem.spacing.md,
                right: designSystem.spacing.md,
                background: 'rgba(255,255,255,0.95)',
                padding: '6px 12px',
                borderRadius: designSystem.borderRadius.full,
                fontSize: designSystem.typography.fontSize.xs,
                fontWeight: designSystem.typography.fontWeight.semibold,
                color: designSystem.colors.neutral[900],
                backdropFilter: 'blur(10px)'
              }}>
                {product.condition}
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: designSystem.spacing.md }}>
            <h3 style={{
              fontSize: designSystem.typography.fontSize.lg,
              fontWeight: designSystem.typography.fontWeight.bold,
              color: designSystem.colors.neutral[900],
              marginBottom: designSystem.spacing.sm,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {product.title}
            </h3>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <span style={{ 
                fontSize: designSystem.typography.fontSize['2xl'], 
                fontWeight: designSystem.typography.fontWeight.extrabold, 
                color: designSystem.colors.primary[500] 
              }}>
                L${product.price}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Swipe indicators */}
      {isDragging && Math.abs(currentX) > 50 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: currentX > 0 ? '10%' : 'auto',
          right: currentX < 0 ? '10%' : 'auto',
          transform: 'translateY(-50%)',
          fontSize: '3rem',
          opacity: Math.min(Math.abs(currentX) / 100, 1)
        }}>
          {currentX > 0 ? '❤️' : '👎'}
        </div>
      )}
    </div>
  )
}

export default SwipeableProductCard
