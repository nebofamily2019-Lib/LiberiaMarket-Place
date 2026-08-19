import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, X } from 'lucide-react'
import { ProductCardContent } from './ProductCardContent'

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
        touchAction: 'pan-y',
        position: 'relative'
      }}
    >
      <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
        <ProductCardContent
          title={product.title}
          price={product.price}
          image={product.image}
          condition={product.condition}
          location={product.location}
          isNegotiable={product.isNegotiable}
        />
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
          opacity: Math.min(Math.abs(currentX) / 100, 1),
          zIndex: 10
        }}>
          {currentX > 0 ? <Heart size={48} fill="red" color="red" /> : <X size={48} color="black" />}
        </div>
      )}
    </div>
  )
}

export default SwipeableProductCard
