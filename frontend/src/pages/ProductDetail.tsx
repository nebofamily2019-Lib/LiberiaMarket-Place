import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import productService from '../services/productService'
import VoiceButton from '../components/VoiceButton'
import { useAuth } from '../context/AuthContext'

/**
 * ProductDetail Page - Full-screen mobile product view
 * - Large hero image
 * - Sticky action buttons at bottom
 * - Seller info card
 * - Similar to Facebook Marketplace detail view
 */

interface Product {
  id: string
  title: string
  description: string
  price: number
  imageUrl?: string
  category?: string
  seller: {
    name: string
    phone: string
    rating: number
    totalSales: number
  }
  condition: string
  location: string
  datePosted: string
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  // Check if product is favorited
  useEffect(() => {
    if (!id) return
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsFavorite(favorites.includes(id))
  }, [id])

  // Toggle favorite
  const toggleFavorite = () => {
    if (!id) return
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')

    if (isFavorite) {
      // Remove from favorites
      const newFavorites = favorites.filter((fav: string) => fav !== id)
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
      setIsFavorite(false)
    } else {
      // Add to favorites
      favorites.push(id)
      localStorage.setItem('favorites', JSON.stringify(favorites))
      setIsFavorite(true)
    }
  }

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return

      try {
        setLoading(true)

        const productData = await productService.getProduct(id)

        // Transform API data
        const transformedProduct: Product = {
          id: productData.id,
          title: productData.title,
          description: productData.description,
          price: Number(productData.price),
          imageUrl: productData.images?.[0] || 'https://via.placeholder.com/600x600?text=No+Image',
          category: productData.category?.name || 'general',
          seller: {
            name: productData.seller?.name || 'Unknown Seller',
            phone: productData.contactPhone || '+231-00-000-0000',
            rating: 0, // Placeholder - will be replaced with actual rating
            totalSales: 0 // Placeholder
          },
          condition: productData.condition,
          location: productData.location,
          datePosted: productData.created_at
        }

        setProduct(transformedProduct)
      } catch (err: any) {
        console.error('Error fetching product:', err)
        // Use placeholder data if API fails
        setProduct({
          id: id,
          title: 'Product Details',
          description: 'Unable to load product details. Please check your connection and try again.',
          price: 0,
          imageUrl: 'https://via.placeholder.com/600x600?text=No+Image',
          category: 'general',
          seller: {
            name: 'Seller',
            phone: '+231-00-000-0000',
            rating: 0,
            totalSales: 0
          },
          condition: 'unknown',
          location: 'Liberia',
          datePosted: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#ffc107' : '#ddd' }}>
          ★
        </span>
      )
    }
    return stars
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <h2>Loading product...</h2>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/products" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    )
  }

  // Create comprehensive voice text for entire product
  const fullVoiceText = `
    ${product.title}.
    Price: ${product.price} Liberian dollars.
    Condition: ${product.condition}.
    Location: ${product.location}.
    Description: ${product.description}.
    Seller: ${product.seller.name}.
    Contact: ${product.seller.phone}.
  `.replace(/\s+/g, ' ').trim()

  return (
    <div className="container" style={{ paddingTop: '40px', position: 'relative' }}>
      {/* Floating Voice Button - Always accessible */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 1000
      }}>
        <VoiceButton
          text={fullVoiceText}
          size="large"
          ariaLabel="Listen to all product details"
        />
      </div>

      {/* Navigation */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/products" style={{ color: '#007bff', textDecoration: 'none', fontSize: 'var(--font-size-lg)' }}>
          ← Back to Products
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gap: '32px',
        gridTemplateColumns: '1fr'
      }}>
        {/* Product Image with Favorite Button */}
        <div style={{ position: 'relative' }}>
          <img
            src={product.imageUrl}
            alt={product.title}
            style={{
              width: '100%',
              height: '400px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '16px',
              backgroundColor: '#f8f9fa'
            }}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=No+Image'
            }}
          />

          {/* Favorite/Heart Button */}
          <button
            onClick={toggleFavorite}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        {/* Product Info */}
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: '#333' }}>
            {product.title}
          </h1>

          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#007bff',
            marginBottom: '24px'
          }}>
            L${product.price}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '8px' }}>Description</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              {product.description}
            </p>
          </div>

          {/* Product Details */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Product Details</h3>

            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Category:</span>
                <span style={{ textTransform: 'capitalize' }}>{product.category}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Condition:</span>
                <span>{product.condition}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Location:</span>
                <span>{product.location}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>Posted:</span>
                <span>{new Date(product.datePosted).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Seller Information</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#007bff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {product.seller.name.charAt(0)}
              </div>
              <div>
                <h4 style={{ marginBottom: '4px' }}>{product.seller.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div>{renderStars(product.seller.rating)}</div>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    ({product.seller.totalSales} sales)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Actions - Simple & Direct */}
          <div style={{ display: 'grid', gap: '12px' }}>
            {isAuthenticated ? (
              <>
                {/* WhatsApp Button - HIGHEST PRIORITY */}
                <a
                  href={`https://wa.me/${product.seller.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I'm interested in "${product.title}" for L$${product.price.toLocaleString()}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    padding: '18px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    backgroundColor: '#25D366',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    textDecoration: 'none'
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>💬</span>
                  WhatsApp Seller
                </a>

                {/* Call Button - Direct phone call */}
                <a
                  href={`tel:${product.seller.phone}`}
                  className="btn btn-primary"
                  style={{
                    padding: '18px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    textDecoration: 'none'
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>📞</span>
                  Call Seller
                </a>

                {/* Share Product via WhatsApp */}
                <button
                  onClick={() => {
                    const shareText = `Check out this product on LibMarket!\n\n${product.title}\nL$${product.price.toLocaleString()}\n\n${window.location.href}`
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  style={{
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    backgroundColor: '#f8f9fa',
                    color: '#25D366',
                    border: '2px solid #25D366',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>📤</span>
                  Share via WhatsApp
                </button>

                {/* Show phone number */}
                <div className="card" style={{
                  backgroundColor: '#f8f9fa',
                  textAlign: 'center',
                  padding: '16px'
                }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#333' }}>
                    {product.seller.phone}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Login Required Message */}
                <div className="card" style={{
                  backgroundColor: '#fff3cd',
                  border: '2px solid #ffc107',
                  textAlign: 'center',
                  padding: 'var(--spacing-lg)'
                }}>
                  <p style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)', fontWeight: 600 }}>
                    Login Required
                  </p>
                  <p style={{ marginBottom: 'var(--spacing-md)', color: '#856404' }}>
                    Please create an account or login to contact the seller
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn btn-primary"
                    style={{ width: '100%', marginBottom: 'var(--spacing-sm)' }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    Create Account
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail