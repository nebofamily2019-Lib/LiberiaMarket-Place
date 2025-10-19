import { useState, useEffect } from 'react'
import categoryService from '../services/categoryService'

/**
 * CategoryFilter Component
 * - Horizontal scrolling category chips
 * - Similar to Facebook Marketplace category filters
 * - Touch-friendly, swipeable on mobile
 */

interface CategoryFilterProps {
  onCategoryChange?: (category: string | null) => void
}

interface Category {
  id: string
  label: string
  icon: string
  color?: string
}

const CategoryFilter = ({ onCategoryChange }: CategoryFilterProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', label: 'All', icon: '🏷️', color: '#6B7280' }
  ])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories()

        // Transform API categories
        const apiCategories: Category[] = categoriesData.map(cat => ({
          id: cat.id,
          label: cat.name,
          icon: cat.icon || '📦',
          color: cat.color
        }))

        setCategories([
          { id: 'all', label: 'All', icon: '🏷️', color: '#6B7280' },
          ...apiCategories
        ])
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Use placeholder categories matching database defaults
        setCategories([
          { id: 'all', label: 'All', icon: '🏷️', color: '#6B7280' },
          { id: 'electronics', label: 'Electronics', icon: '📱', color: '#3B82F6' },
          { id: 'fashion', label: 'Fashion', icon: '👗', color: '#EC4899' },
          { id: 'home-garden', label: 'Home & Garden', icon: '🏡', color: '#10B981' },
          { id: 'sports', label: 'Sports', icon: '⚽', color: '#F59E0B' },
          { id: 'books', label: 'Books', icon: '📚', color: '#8B5CF6' },
          { id: 'vehicles', label: 'Vehicles', icon: '🚗', color: '#EF4444' },
          { id: 'services', label: 'Services', icon: '🔧', color: '#06B6D4' },
          { id: 'other', label: 'Other', icon: '📦', color: '#6B7280' }
        ])
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = categoryId === 'all' ? null : categoryId
    setActiveCategory(newCategory)
    onCategoryChange?.(newCategory)
  }

  return (
    <div className="category-chips">
      {categories.map((category) => {
        const isActive = (activeCategory === null && category.id === 'all') || activeCategory === category.id
        return (
          <button
            key={category.id}
            className={`chip ${isActive ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category.id)}
            style={{
              borderColor: isActive && category.color ? category.color : undefined,
              backgroundColor: isActive && category.color ? category.color : undefined,
              color: isActive ? 'white' : '#333',
              fontSize: '2rem',  /* BIGGER icons */
              padding: '12px 16px',
              minWidth: '60px',  /* Wider for better touch */
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
            title={category.label}  /* Tooltip shows full name */
          >
            <span style={{ fontSize: '2.5rem' }}>{category.icon}</span>
            {/* Show short label only - or hide completely for icon-only */}
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
              {category.label.split(' ')[0]}  {/* First word only */}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryFilter
