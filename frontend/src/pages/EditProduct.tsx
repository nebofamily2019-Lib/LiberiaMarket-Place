import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import productService from '../services/productService'
import categoryService from '../services/categoryService'
import { useAuth } from '../context/AuthContext'
import LocationSelector from '../components/LocationSelector'
import PhoneInput from '../components/PhoneInput'
import { getPaymentMethods, type PaymentMethod } from '../data/paymentMethods'

interface ProductForm {
  title: string
  description: string
  price: string
  category: string
  condition: string
  county: string
  city: string
  phone: string
  isNegotiable: boolean
  paymentMethods: string[]
  image: File | null
}

const EditProduct = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [formData, setFormData] = useState<ProductForm>({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'new',
    county: '',
    city: '',
    phone: user?.phone || '',
    isNegotiable: true,
    paymentMethods: ['cash-on-delivery', 'cash-on-pickup'],
    image: null
  })
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([
    { value: '', label: 'Select a category' }
  ])
  const [availablePaymentMethods] = useState<PaymentMethod[]>(getPaymentMethods())

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        navigate('/profile')
        return
      }

      try {
        setLoadingProduct(true)
        const product = await productService.getProduct(id)

        // Check if user owns this product
        if (product.seller_id !== user?.id) {
          setErrors({ submit: 'You do not have permission to edit this product' })
          setTimeout(() => navigate('/profile'), 2000)
          return
        }

        // Parse location into county and city
        const [city, county] = product.location?.split(', ') || ['', '']

        setFormData({
          title: product.title || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          category: product.category_id || '',
          condition: product.condition || 'new',
          county: county || '',
          city: city || '',
          phone: product.contactPhone || user?.phone || '',
          isNegotiable: product.isNegotiable ?? true,
          paymentMethods: [],
          image: null
        })
      } catch (error: any) {
        console.error('Error fetching product:', error)
        setErrors({ submit: error.message || 'Failed to load product. Please try again.' })
      } finally {
        setLoadingProduct(false)
      }
    }

    fetchProduct()
  }, [id, user, navigate])

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories()

        if (categoriesData && categoriesData.length > 0) {
          const categoryOptions = categoriesData.map(cat => ({
            value: cat.id,
            label: `${cat.icon || ''} ${cat.name}`.trim()
          }))
          setCategories([{ value: '', label: 'Select a category' }, ...categoryOptions])
        } else {
          setCategories([{ value: '', label: 'No categories available - Please contact admin' }])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([
          { value: '', label: 'Error loading categories - Please refresh the page' }
        ])
        setErrors(prev => ({
          ...prev,
          submit: 'Unable to load categories. Please refresh the page or contact support.'
        }))
      }
    }

    fetchCategories()
  }, [])

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, image: file }))
  }

  const handlePaymentMethodToggle = (methodId: string) => {
    setFormData(prev => {
      const isSelected = prev.paymentMethods.includes(methodId)
      const newPaymentMethods = isSelected
        ? prev.paymentMethods.filter(m => m !== methodId)
        : [...prev.paymentMethods, methodId]
      return { ...prev, paymentMethods: newPaymentMethods }
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required'
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required'
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price'
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    if (!formData.county) {
      newErrors.county = 'County is required'
    }

    if (!formData.city) {
      newErrors.city = 'City/Town is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !id) {
      return
    }

    setLoading(true)

    try {
      const contactPhone = formData.phone || user?.phone || ''

      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category,
        location: `${formData.city}, ${formData.county}`,
        condition: formData.condition as 'new' | 'like-new' | 'good' | 'fair' | 'poor',
        isNegotiable: formData.isNegotiable,
        contactPhone: contactPhone
      }

      // Update product via API
      await productService.updateProduct(id, productData, formData.image || undefined)

      // Navigate to the product detail page
      navigate(`/products/${id}`)
    } catch (error: any) {
      console.error('Error updating product:', error)
      setErrors({ submit: error.message || 'Failed to update product. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (loadingProduct) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <h2>Loading product...</h2>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#007bff' }}>
          Edit Product
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Update your product details below
        </p>

        {errors.submit && (
          <div style={{
            padding: '16px',
            marginBottom: '24px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            border: '1px solid #f5c6cb'
          }}>
            <strong>Error:</strong> {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card">
          {/* Product Title */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Fresh Cassava, Traditional Kente Cloth"
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.title ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            {errors.title && (
              <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.title}</span>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your product in detail. Include condition, size, and any other relevant information."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.description ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
            {errors.description && (
              <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.description}</span>
            )}
          </div>

          {/* Price Section with Presets */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Price (Liberian Dollars) *
            </label>

            {/* Price Preset Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '12px'
            }}>
              {[50, 100, 250, 500, 1000, 2500, 5000, 10000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFormData({ ...formData, price: preset.toString() })}
                  style={{
                    padding: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    backgroundColor: formData.price === preset.toString() ? '#007bff' : '#f8f9fa',
                    color: formData.price === preset.toString() ? 'white' : '#333',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  L${preset}
                </button>
              ))}
            </div>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Or enter custom price"
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.price ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            {errors.price && (
              <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.price}</span>
            )}
          </div>

          {/* Category */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.category ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.category}</span>
            )}
          </div>

          {/* Condition */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              {conditions.map(cond => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Selector */}
          <div style={{ marginBottom: '24px' }}>
            <LocationSelector
              selectedCounty={formData.county}
              selectedCity={formData.city}
              onCountyChange={(county) => {
                setFormData(prev => ({ ...prev, county }))
                if (errors.county) {
                  setErrors(prev => ({ ...prev, county: '' }))
                }
              }}
              onCityChange={(city) => {
                setFormData(prev => ({ ...prev, city }))
                if (errors.city) {
                  setErrors(prev => ({ ...prev, city: '' }))
                }
              }}
              required
              showCityType
            />
            {errors.county && (
              <span style={{ color: '#dc3545', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
                {errors.county}
              </span>
            )}
            {errors.city && (
              <span style={{ color: '#dc3545', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
                {errors.city}
              </span>
            )}
          </div>

          {/* Phone Number */}
          <div style={{ marginBottom: '24px' }}>
            <PhoneInput
              value={formData.phone}
              onChange={(value, isValid) => {
                setFormData(prev => ({ ...prev, phone: value }))
                if (errors.phone && isValid) {
                  setErrors(prev => ({ ...prev, phone: '' }))
                }
              }}
              required={false}
              showValidation
              showCarrier
              label="Contact Phone Number (Optional)"
            />
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
              Leave blank to use your registered phone number ({user?.phone || 'not available'})
            </p>
            {errors.phone && (
              <span style={{ color: '#dc3545', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
                {errors.phone}
              </span>
            )}
          </div>

          {/* Price Negotiable Toggle */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}>
              <input
                type="checkbox"
                checked={formData.isNegotiable}
                onChange={(e) => setFormData(prev => ({ ...prev, isNegotiable: e.target.checked }))}
                style={{
                  width: '20px',
                  height: '20px',
                  marginRight: '12px',
                  cursor: 'pointer'
                }}
              />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  Price is Negotiable
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '4px' }}>
                  Allow buyers to make offers on this item
                </div>
              </div>
            </label>
          </div>

          {/* Payment Methods */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
              Accepted Payment Methods
            </label>
            <div style={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'
            }}>
              {availablePaymentMethods.map(method => (
                <label
                  key={method.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    border: `2px solid ${formData.paymentMethods.includes(method.id) ? '#007bff' : '#ddd'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: formData.paymentMethods.includes(method.id) ? '#e7f3ff' : '#fff',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes(method.id)}
                    onChange={() => handlePaymentMethodToggle(method.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      marginRight: '10px',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>
                      {method.icon && <span style={{ marginRight: '6px' }}>{method.icon}</span>}
                      {method.name}
                    </div>
                    {method.isPopular && (
                      <span style={{
                        fontSize: '0.7rem',
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginTop: '4px',
                        display: 'inline-block'
                      }}>
                        Popular
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px' }}>
              Select all payment methods you accept. Multiple selections help attract more buyers.
            </p>
          </div>

          {/* Image Upload */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Product Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
              Upload a new photo to replace the existing one. Leave empty to keep current image.
            </p>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/products/${id}`)}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '120px' }}
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProduct
