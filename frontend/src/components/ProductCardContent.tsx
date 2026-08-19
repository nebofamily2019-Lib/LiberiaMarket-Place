import { MapPin, Package } from 'lucide-react'
import { useState } from 'react'
import { designSystem } from '../styles/designSystem'
import { formatPriceWithCurrency } from '../utils/currency'
import { getImageUrl } from '../utils/imageUtils'

export interface ProductCardContentProps {
  title: string
  price: number
  currency?: string
  image?: string
  condition?: string
  location?: string
  isNegotiable?: boolean
  category?: {
    name: string
    icon: React.ReactNode
    color: string
  }
  children?: React.ReactNode // For overlays like Save button
}

export const ProductCardContent = ({
  title,
  price,
  currency,
  image,
  condition,
  location,
  isNegotiable,
  category,
  children
}: ProductCardContentProps) => {
  const [imgError, setImgError] = useState(false)
  return (
    <div style={{
      background: 'white',
      borderRadius: designSystem.borderRadius.lg,
      overflow: 'hidden',
      boxShadow: designSystem.shadows.md,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Image Section */}
      <div style={{
        aspectRatio: '4/3',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: designSystem.colors.neutral[100]
      }}>
        {image && !imgError ? (
          <img
            src={getImageUrl(image)}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: `linear-gradient(135deg, ${designSystem.colors.neutral[100]} 0%, ${designSystem.colors.neutral[200]} 100%)`
          }}>
            <Package size={32} color={designSystem.colors.neutral[400]} />
            <span style={{ fontSize: '0.7rem', color: designSystem.colors.neutral[400], fontWeight: 500 }}>
              No image
            </span>
          </div>
        )}

        {/* Condition Badge — bottom-left so it doesn't clash with the save button */}
        {condition && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            background: 'rgba(255,255,255,0.95)',
            padding: '3px 8px',
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: '#1f2937',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            zIndex: 1,
            textTransform: 'capitalize'
          }}>
            {condition}
          </div>
        )}
        
        {/* Category Badge (if provided) */}
        {category && (
          <div style={{
            position: 'absolute',
            bottom: designSystem.spacing.sm,
            left: designSystem.spacing.sm,
            background: category.color || designSystem.colors.primary[500],
            color: 'white',
            padding: '2px 8px',
            borderRadius: designSystem.borderRadius.md,
            fontSize: designSystem.typography.fontSize.xs,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </div>
        )}

        {/* Custom Overlays (like Save Button) */}
        {children}
      </div>

      {/* Content Section */}
      <div style={{ padding: designSystem.spacing.md, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: designSystem.typography.fontSize.lg,
          fontWeight: designSystem.typography.fontWeight.bold,
          color: designSystem.colors.neutral[900],
          marginBottom: designSystem.spacing.xs,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.35',
          minHeight: '2.7em'
        }}>
          {title}
        </h3>

        <div style={{ marginBottom: '4px' }}>
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#BF0A30',
          }}>
            {formatPriceWithCurrency(price, currency).primary}
          </div>
          <div style={{
            fontSize: '0.78rem',
            color: '#6b7280',
            fontWeight: 500
          }}>
            {formatPriceWithCurrency(price, currency).secondary}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 'auto',
          fontSize: designSystem.typography.fontSize.sm,
          color: designSystem.colors.neutral[500]
        }}>
          {location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          )}
          
          {isNegotiable && (
            <span style={{ 
              color: designSystem.colors.accent.green,
              fontWeight: designSystem.typography.fontWeight.medium,
              background: designSystem.colors.neutral[100],
              padding: '2px 6px',
              borderRadius: designSystem.borderRadius.sm
            }}>
              Negotiable
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
