import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import '../styles/Categories.css'

interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  productCount: number
}

const Categories = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      console.log('📂 Fetching categories...')
      
      const response = await api.get('/categories')
      
      if (response.data.success) {
        console.log(`✅ Loaded ${response.data.data.length} categories`)
        setCategories(response.data.data)
      }
    } catch (err: any) {
      console.error('❌ Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${categoryId}`)
  }

  if (loading) {
    return (
      <div className="categories-container">
        <HamburgerMenu />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>⏳</div>
          <p>Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="categories-container">
      <HamburgerMenu />
      
      <div className="categories-content">
        <div className="page-header">
          <h1>📂 Browse by Category</h1>
          <p className="subtitle">Explore {categories.length} product categories</p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category.id)}
              style={{ borderColor: category.color }}
            >
              <div className="category-icon" style={{ background: `${category.color}20` }}>
                <span style={{ fontSize: '3rem' }}>{category.icon}</span>
              </div>
              
              <div className="category-info">
                <h3 style={{ color: category.color }}>{category.name}</h3>
                <p className="category-description">{category.description}</p>
                <div className="category-count">
                  {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                </div>
              </div>

              <button 
                className="btn-browse"
                style={{ 
                  background: category.color,
                  borderColor: category.color 
                }}
              >
                Browse →
              </button>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h2>No categories available</h2>
            <p>Check back later for new categories</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Categories
