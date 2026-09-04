import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { usdToLrd } from '../utils/currency'
import { designSystem } from '../styles/designSystem'
import HamburgerMenu from '../components/HamburgerMenu'
import { getCountyByName } from '../data/liberianLocations'
import '../styles/AddProduct.css'

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

interface CountyOption {
  id: string
  name: string
}

const EditProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [counties, setCounties] = useState<CountyOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD' as 'USD' | 'LRD',
    category_id: '',
    location: 'Monrovia',
    county_id: '',
    countyName: '',
    district: '',
    landmark: '',
    condition: 'good',
  })

  // District options come from the static Liberia location data, matched by
  // county name (the DB only stores counties, not their districts/cities).
  const districtOptions = formData.countyName ? getCountyByName(formData.countyName)?.cities || [] : []

  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  useEffect(() => {
    fetchProduct()
    fetchCategories()
    fetchCounties()
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
        
        setFormData(prev => ({
          ...prev,
          title: product.title,
          description: product.description,
          price: product.price.toString(),
          currency: product.currency === 'LRD' ? 'LRD' : 'USD',
          category_id: product.category_id || '',
          location: product.location,
          county_id: product.county_id || '',
          district: product.district || '',
          landmark: product.landmark || '',
          condition: product.condition,
        }))

        // Set existing images
        if (product.images && Array.isArray(product.images)) {
          setExistingImages(product.images)
        }
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

  const fetchCounties = async () => {
    try {
      const response = await api.get('/counties')
      if (response.data.success) {
        setCounties(response.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching counties:', err)
    }
  }

  // Once both the product's county_id and the counties list are loaded,
  // resolve the county's name so the district dropdown can populate.
  useEffect(() => {
    if (!formData.county_id || counties.length === 0) return
    const match = counties.find(c => c.id === formData.county_id)
    if (match && match.name !== formData.countyName) {
      setFormData(prev => ({ ...prev, countyName: match.name }))
    }
  }, [formData.county_id, counties])

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Check total image count
    const totalImages = existingImages.length + newImages.length + files.length
    if (totalImages > 5) {
      setError('Maximum 5 images allowed in total')
      return
    }

    // Validate file sizes and types
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    for (const file of files) {
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 5MB.`)
        return
      }
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} has invalid type. Only JPEG, PNG, and WebP allowed.`)
        return
      }
    }

    setNewImages([...newImages, ...files])

    // Generate previews
    const previews = files.map(file => URL.createObjectURL(file))
    setNewImagePreviews([...newImagePreviews, ...previews])
    setError('')
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    // Revoke old preview URL
    URL.revokeObjectURL(newImagePreviews[index])

    setNewImages(newImages.filter((_, i) => i !== index))
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index))
  }

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      newImagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [newImagePreviews])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      console.log('💾 Updating product:', id, formData)

      // Create FormData for file upload
      const data = new FormData()
      data.append('title', formData.title.trim())
      data.append('description', formData.description.trim())
      data.append('price', formData.price)
      data.append('currency', formData.currency)
      data.append('category_id', formData.category_id)
      data.append('location', formData.location)
      data.append('county_id', formData.county_id)
      data.append('district', formData.district)
      data.append('landmark', formData.landmark.trim())
      data.append('condition', formData.condition)

      // Append existing images as JSON
      data.append('existingImages', JSON.stringify(existingImages))

      // Append new images
      newImages.forEach((image) => {
        data.append('images', image)
      })

      const response = await api.put(`/products/${id}`, data)

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
            <label htmlFor="price">Price *</label>
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
            <span className="helper-text">
              {formData.currency === 'USD' && formData.price && parseFloat(formData.price) > 0 && (
                <span style={{ color: designSystem.colors.accent.green, fontWeight: 600 }}>
                  ≈ L${usdToLrd(parseFloat(formData.price)).toLocaleString()} LRD
                </span>
              )}
            </span>
          </div>

          {/* Currency */}
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'USD' | 'LRD' })}
            >
              <option value="USD">USD ($)</option>
              <option value="LRD">LRD (L$)</option>
            </select>
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

          {/* County */}
          <div className="form-group">
            <label htmlFor="county">County</label>
            <select
              id="county"
              value={formData.county_id}
              onChange={(e) => {
                const selected = counties.find(c => c.id === e.target.value)
                setFormData({ ...formData, county_id: e.target.value, countyName: selected?.name || '', district: '' })
              }}
            >
              <option value="">Choose a county…</option>
              {counties.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* District / Area */}
          {districtOptions.length > 0 && (
            <div className="form-group">
              <label htmlFor="district">District / Area</label>
              <select
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              >
                <option value="">Choose a district/area…</option>
                {districtOptions.map((city) => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Landmark */}
          <div className="form-group">
            <label htmlFor="landmark">Nearby Landmark</label>
            <input
              id="landmark"
              type="text"
              placeholder="e.g. Near Total Gas Station, 12th Street"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              maxLength={200}
            />
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
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="images">
              📸 Product Images (Max 5 total)
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="existing-images-section">
                <p className="input-hint" style={{ marginBottom: '0.75rem' }}>
                  Current images ({existingImages.length}):
                </p>
                <div className="image-previews">
                  {existingImages.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="image-preview">
                      <img src={imageUrl} alt={`Existing ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="remove-image"
                        title="Remove this image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Images */}
            {(existingImages.length + newImages.length) < 5 && (
              <>
                <input
                  type="file"
                  id="images"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleNewImageChange}
                  className="input-file"
                  style={{ marginTop: existingImages.length > 0 ? '1rem' : '0' }}
                />
                <p className="input-hint">
                  JPEG, PNG, WebP, or GIF. Max 5MB per image.
                  {' '}({5 - existingImages.length - newImages.length} slots remaining)
                </p>
              </>
            )}

            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div className="new-images-section" style={{ marginTop: '1rem' }}>
                <p className="input-hint" style={{ marginBottom: '0.75rem' }}>
                  New images to upload ({newImagePreviews.length}):
                </p>
                <div className="image-previews">
                  {newImagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="image-preview">
                      <img src={preview} alt={`New ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="remove-image"
                        title="Remove this image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
