import { useState } from 'react'

interface SwipeableCardProps {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  children: React.ReactNode
}

const SwipeableCard = ({ onSwipeLeft, onSwipeRight, children }: SwipeableCardProps) => {
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
      if (currentX < 0 && onSwipeLeft) onSwipeLeft()
      if (currentX > 0 && onSwipeRight) onSwipeRight()
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
        transform: `translateX(${currentX}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s',
        touchAction: 'pan-y'
      }}
    >
      {children}
    </div>
  )
}

export default SwipeableCard
