import { useState, useEffect } from 'react'
import SearchHeader from '../components/SearchHeader'
import CategoryFilter from '../components/CategoryFilter'
import ProductGrid from '../components/ProductGrid'
import { Product } from '../components/ProductCard'
import productService from '../services/productService'

/**
 * Products Page - Browse All Products
 * - Mobile-first marketplace view
 * - Search, filter, and browse functionality
 */
const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError('')

        let response

        // Build filters object
        const filters: any = {}

        // Add price filters if set
        if (minPrice) {
          filters.minPrice = parseFloat(minPrice)
        }
        if (maxPrice) {
          filters.maxPrice = parseFloat(maxPrice)
        }

        if (searchQuery) {
          // Search products
          response = await productService.searchProducts(searchQuery)
        } else if (selectedCategory) {
          // Get products by category with filters
          filters.category = selectedCategory
          response = await productService.getProducts(filters)
        } else {
          // Get all products with filters
          response = await productService.getProducts(filters)
        }

        // Transform API data to match ProductCard interface
        const transformedProducts = response.data.map((product: any) => ({
          id: product.id,
          title: product.title,
          price: Number(product.price),
          location: product.location,
          imageUrl: product.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image',
          category: product.category?.name || 'general'
        }))

        setProducts(transformedProducts)
      } catch (err: any) {
        console.error('Error fetching products:', err)
        setError(err.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchQuery, selectedCategory, minPrice, maxPrice])

  const handleClearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
  }

  const hasActiveFilters = minPrice || maxPrice

  // Quick price range presets for Liberian market
  const pricePresets = [
    { label: 'Under L$100', min: '', max: '100' },
    { label: 'L$100 - L$500', min: '100', max: '500' },
    { label: 'L$500 - L$1,000', min: '500', max: '1000' },
    { label: 'L$1,000 - L$5,000', min: '1000', max: '5000' },
    { label: 'Over L$5,000', min: '5000', max: '' }
  ]

  const handlePresetClick = (min: string, max: string) => {
    setMinPrice(min)
    setMaxPrice(max)
  }

  if (loading) {
    return (
      <div className="container text-center mt-xl">
        <p className="text-secondary">Loading products...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container text-center mt-xl">
        <div style={{
          padding: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h3>Error Loading Products</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
            style={{ marginTop: '12px' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Search Header - Sticky */}
      <SearchHeader
        onSearch={setSearchQuery}
        placeholder="Search products..."
      />

      {/* Main Content */}
      <div className="container-fluid">
        {/* Category Filters */}
        <CategoryFilter onCategoryChange={setSelectedCategory} />

        {/* Price Filters */}
        <div style={{ marginTop: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-sm)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <span>💰</span>
              <span style={{ fontWeight: '600' }}>Price Filter</span>
              {hasActiveFilters && (
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  Active
                </span>
              )}
            </span>
            <span>{showFilters ? '▲' : '▼'}</span>
          </button>

          {/* Filter Panel */}
          {showFilters && (
            <div className="card" style={{ padding: 'var(--space-md)' }}>
              {/* Quick Presets */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--space-sm)',
                  fontWeight: '600',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  Quick Select
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 'var(--space-sm)'
                }}>
                  {pricePresets.map((preset, index) => {
                    const isActive = minPrice === preset.min && maxPrice === preset.max
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handlePresetClick(preset.min, preset.max)}
                        className="btn"
                        style={{
                          padding: '8px 12px',
                          fontSize: 'var(--font-size-sm)',
                          backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                          color: isActive ? 'white' : 'var(--color-text-primary)',
                          border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          fontWeight: isActive ? '600' : 'normal'
                        }}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom Range */}
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--space-sm)',
                  fontWeight: '600',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  Custom Range
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-sm)'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-secondary)'
                    }}>
                      Min Price (L$)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="form-input"
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: 'var(--font-size-sm)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-secondary)'
                    }}>
                      Max Price (L$)
                    </label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="form-input"
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: 'var(--font-size-sm)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: 'var(--space-sm)',
                    fontSize: 'var(--font-size-sm)'
                  }}
                >
                  Clear Price Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="mt-md mb-md">
          <h2 className="font-bold" style={{ fontSize: 'var(--font-size-xl)' }}>
            {selectedCategory
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
              : 'All Products'}
          </h2>
          <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
            {products.length} items available
            {hasActiveFilters && (
              <span style={{ marginLeft: 'var(--space-xs)' }}>
                (filtered by price)
              </span>
            )}
          </p>
        </div>

        {/* Product Grid */}
        <ProductGrid products={products} />

        {/* Bottom Spacing */}
        <div className="mb-xl"></div>
      </div>
    </>
  )
}

export default Products