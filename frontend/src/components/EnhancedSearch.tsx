import { useState, useEffect } from 'react'
import '../styles/EnhancedSearch.css'

interface SearchFilters {
  search: string
  category_id: string
  minPrice: string
  maxPrice: string
  condition: string
  location: string
  sort: string
}

interface EnhancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  categories: Array<{ id: string; name: string; icon: string }>
}

const EnhancedSearch = ({ onSearch, categories }: EnhancedSearchProps) => {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    category_id: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    location: '',
    sort: 'newest'
  })

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onSearch(newFilters)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      search: '',
      category_id: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      location: '',
      sort: 'newest'
    }
    setFilters(clearedFilters)
    onSearch(clearedFilters)
  }

  const hasActiveFilters = 
    filters.category_id || 
    filters.minPrice || 
    filters.maxPrice || 
    filters.condition || 
    filters.location

  return (
    <div className="enhanced-search">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="search"
            placeholder="🔍 Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            Search
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`filter-toggle ${hasActiveFilters ? 'active' : ''}`}
        >
          <span>🎛️</span>
          <span>Filters</span>
          {hasActiveFilters && <span className="filter-badge">•</span>}
        </button>

        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="sort-select"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="title">Title: A-Z</option>
        </select>
      </form>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>🎛️ Filter Products</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* Category Filter */}
            <div className="filter-group">
              <label>📂 Category</label>
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label>💰 Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min ($)"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="price-input"
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max ($)"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="price-input"
                  min="0"
                />
              </div>
            </div>

            {/* Condition Filter */}
            <div className="filter-group">
              <label>✨ Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="filter-select"
              >
                <option value="">Any Condition</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <label>📍 Location</label>
              <input
                type="text"
                placeholder="Enter location..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="active-filters">
              <span className="active-filters-label">Active filters:</span>
              {filters.category_id && (
                <span className="filter-chip">
                  📂 {categories.find(c => c.id === filters.category_id)?.name}
                  <button onClick={() => handleFilterChange('category_id', '')}>✕</button>
                </span>
              )}
              {filters.minPrice && (
                <span className="filter-chip">
                  Min: ${filters.minPrice}
                  <button onClick={() => handleFilterChange('minPrice', '')}>✕</button>
                </span>
              )}
              {filters.maxPrice && (
                <span className="filter-chip">
                  Max: ${filters.maxPrice}
                  <button onClick={() => handleFilterChange('maxPrice', '')}>✕</button>
                </span>
              )}
              {filters.condition && (
                <span className="filter-chip">
                  ✨ {filters.condition}
                  <button onClick={() => handleFilterChange('condition', '')}>✕</button>
                </span>
              )}
              {filters.location && (
                <span className="filter-chip">
                  📍 {filters.location}
                  <button onClick={() => handleFilterChange('location', '')}>✕</button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EnhancedSearch
