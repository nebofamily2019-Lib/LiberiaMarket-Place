import { useState, useEffect } from 'react'
import categoryService from '../services/categoryService'
import { getCategoryIcon } from '../utils/categoryIcons'
import { Tag } from 'lucide-react'

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
  slug: string
  color?: string
}

const CategoryFilter = ({ onCategoryChange }: CategoryFilterProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([
    { id: 'all', label: 'All', slug: 'all', color: '#6B7280' }
  ])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories()

        // Transform API categories
        const apiCategories: Category[] = categoriesData.map(cat => ({
          id: cat.id,
          label: cat.name,
          slug: cat.slug,
          color: cat.color
        }))

        setCategories([
          { id: 'all', label: 'All', slug: 'all', color: '#6B7280' },
          ...apiCategories
        ])
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Use placeholder categories matching database defaults
        setCategories([
          { id: 'all', label: 'All', slug: 'all', color: '#6B7280' },
          { id: 'market-grounds', label: 'Market Grounds', slug: 'market-grounds', color: '#10B981' },
          { id: 'fashion-tailoring', label: 'Fashion & Tailoring', slug: 'fashion-tailoring', color: '#EC4899' },
          { id: 'phones-electronics', label: 'Phones & Electronics', slug: 'phones-electronics', color: '#3B82F6' },
          { id: 'vehicles-transport', label: 'Vehicles & Pehn-Pehn', slug: 'vehicles-transport', color: '#EF4444' },
          { id: 'building-materials', label: 'Building Materials', slug: 'building-materials', color: '#F59E0B' },
          { id: 'home-energy', label: 'Home & Solar', slug: 'home-energy', color: '#FBBF24' },
          { id: 'services-labor', label: 'Services', slug: 'services-labor', color: '#06B6D4' },
          { id: 'education', label: 'Education', slug: 'education', color: '#8B5CF6' }
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
              padding: '12px 16px',
              minWidth: '60px',  /* Wider for better touch */
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
            title={category.label}  /* Tooltip shows full name */
          >
            <div className="category-icon">
              {category.id === 'all' ? <Tag size={24} /> : getCategoryIcon(category.slug, 24, '', isActive ? 'white' : category.color)}
            </div>
            {/* Show short label only - or hide completely for icon-only */}
            <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              {category.label.split(' ')[0]}  {/* First word only */}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryFilter
