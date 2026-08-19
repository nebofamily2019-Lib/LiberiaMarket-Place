import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { designSystem } from '../styles/designSystem'
import { savedItemService } from '../services/savedItemService'
import { useAuth } from '../context/AuthContext'
import { ProductCardContent } from './ProductCardContent'

export interface Product {
  id: string
  title: string
  price: number
  currency?: string
  images?: string[]
  image?: string
  condition?: string
  location?: string
  isNegotiable?: boolean
  category?: {
    name: string
    icon: string
    color: string
  }
}

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();

  // Get the main image (support both images array and legacy image string)
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : product.image;

  useEffect(() => {
    if (user) {
      savedItemService.checkSavedStatus(product.id).then(res => {
        setIsSaved(res.isSaved);
      }).catch(() => {});
    }
  }, [product.id, user]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    if (!user) {
      // TODO: Show login toast
      return;
    }
    try {
      const res = await savedItemService.toggleSavedItem(product.id);
      setIsSaved(res.saved);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  return (
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          height: '100%',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = designSystem.shadows.xl
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <ProductCardContent
          title={product.title}
          price={product.price}
          currency={product.currency}
          image={mainImage}
          condition={product.condition}
          location={product.location}
          isNegotiable={product.isNegotiable}
          category={product.category}
        >
          {/* Save Button Overlay */}
          <button
            onClick={handleToggleSave}
            style={{
              position: 'absolute',
              top: designSystem.spacing.md,
              right: designSystem.spacing.md, // Moved to right for consistency
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: designSystem.shadows.sm,
              zIndex: 10,
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            aria-label={isSaved ? 'Unsave item' : 'Save item'}
          >
            <Heart 
              size={20} 
              fill={isSaved ? designSystem.colors.secondary[500] : 'none'} 
              color={isSaved ? designSystem.colors.secondary[500] : designSystem.colors.neutral[400]} 
            />
          </button>
        </ProductCardContent>
      </div>
    </Link>
  )
}

export default ProductCard
