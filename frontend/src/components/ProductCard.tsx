import { Link } from 'react-router-dom'
import { designSystem } from '../styles/designSystem'

interface ProductCardProps {
  product: {
    id: string
    title: string
    price: number
    image?: string
    condition?: string
    location?: string
    isNegotiable?: boolean
  }
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: 'white',
          borderRadius: designSystem.borderRadius.lg,
          overflow: 'hidden',
          boxShadow: designSystem.shadows.md,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = designSystem.shadows.xl
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = designSystem.shadows.md
        }}
      >
        {/* Image */}
        <div
          style={{
            height: '200px',
            background: product.image
              ? `url(${product.image}) center/cover`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
          }}
        >
          {product.condition && (
            <div
              style={{
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
              }}
            >
              {product.condition}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: designSystem.spacing.md }}>
          <h3
            style={{
              fontSize: designSystem.typography.fontSize.lg,
              fontWeight: designSystem.typography.fontWeight.bold,
              color: designSystem.colors.neutral[900],
              marginBottom: designSystem.spacing.sm,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {product.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: designSystem.spacing.sm, marginBottom: designSystem.spacing.md }}>
            <span style={{ fontSize: designSystem.typography.fontSize.sm, color: designSystem.colors.neutral[500] }}>
              📍 {product.location || 'Monrovia'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: designSystem.typography.fontSize['2xl'],
                fontWeight: designSystem.typography.fontWeight.extrabold,
                color: designSystem.colors.primary[500]
              }}>
                L${product.price}
              </span>
              {product.isNegotiable && (
                <span style={{
                  fontSize: designSystem.typography.fontSize.xs,
                  color: designSystem.colors.accent.green,
                  fontWeight: designSystem.typography.fontWeight.semibold
                }}>
                  Negotiable
                </span>
              )}
            </div>

            <button
              style={{
                background: designSystem.colors.primary[500],
                color: 'white',
                border: 'none',
                borderRadius: designSystem.borderRadius.sm,
                padding: '8px 16px',
                fontSize: designSystem.typography.fontSize.sm,
                fontWeight: designSystem.typography.fontWeight.semibold,
                cursor: 'pointer'
              }}
            >
              View
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
