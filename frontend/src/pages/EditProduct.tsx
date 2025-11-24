import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import '../styles/AddProduct.css'

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

const EditProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    location: 'Monrovia',
    condition: 'good',
  })

  useEffect(() => {
    fetchProduct()
    fetchCategories()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      console.log('📦 Fetching product:', id)
      
      const response = await api.get(`/products/${id}`)
      
      if (response.data.success) {
        const product = response.data.data
        
        // Check if user can edit
        const isAdmin = user?.roles?.includes('admin')
        const isOwner = product.seller_id === user?.id
        
        if (!isAdmin && !isOwner) {
          alert('❌ You do not have permission to edit this product')
          navigate('/dashboard')
          return
        }
        
        setFormData({
          title: product.title,
          description: product.description,
          price: product.price.toString(),
          category_id: product.category_id || '',
          location: product.location,
          condition: product.condition,
        })
      }
    } catch (err: any) {
      console.error('❌ Error fetching product:', err)
      setError(err.response?.data?.error || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      if (response.data.success) {
        setCategories(response.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      console.log('💾 Updating product:', id, formData)
      
      const response = await api.put(`/products/${id}`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        location: formData.location,
        condition: formData.condition,
      })

      if (response.data.success) {
        alert('✅ Product updated successfully!')
        navigate('/my-products')
      }
    } catch (err: any) {
      console.error('❌ Error updating product:', err)
      setError(err.response?.data?.error || 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="add-product-container">
        <HamburgerMenu />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>⏳</div>
          <p>Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="add-product-container">
      <HamburgerMenu />
      
      <div className="add-product-content">
        <div className="page-header">
          <h1>✏️ Edit Product</h1>
          <p className="subtitle">Update your product listing</p>
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          {/* Product Title */}
          <div className="form-group required">
            <label htmlFor="title">Product Title *</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. iPhone 13 Pro Max 256GB"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          {/* Price */}
          <div className="form-group required">
            <label htmlFor="price">Price (USD) *</label>
            <input
              id="price"
              type="number"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* Category */}
          <div className="form-group required">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Describe your product..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              maxLength={1000}
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <select
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            >
              <option value="Monrovia">Monrovia</option>
              <option value="Paynesville">Paynesville</option>
              <option value="Sinkor">Sinkor</option>
              <option value="Congo Town">Congo Town</option>
              <option value="Bushrod Island">Bushrod Island</option>
              <option value="Red Light">Red Light</option>
              <option value="Other">Other Location</option>
            </select>
          </div>

          {/* Condition */}
          <div className="form-group">
            <label htmlFor="condition">Condition</label>
            <select
              id="condition"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            >
              <option value="new">New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/my-products')}
              className="btn-cancel"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProduct
