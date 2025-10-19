import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import productService from '../services/productService'
import categoryService from '../services/categoryService'
import { useAuth } from '../context/AuthContext'
import LocationSelector from '../components/LocationSelector'
import PhoneInput from '../components/PhoneInput'
import { validateLiberianPhone } from '../utils/phoneValidation'
import { getPaymentMethods, type PaymentMethod } from '../data/paymentMethods'
import VoiceInput from '../components/VoiceInput'
import LargeActionButton from '../components/LargeActionButton'
import { speakPrompt } from '../utils/voiceAssistant'

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

const AddProduct = () => {
  const navigate = useNavigate()
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([
    { value: '', label: 'Select a category' }
  ])
  const [availablePaymentMethods] = useState<PaymentMethod[]>(getPaymentMethods())
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<string | number>('')
  const [tags, setTags] = useState('') // New state for tags

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
          console.log(`Loaded ${categoriesData.length} categories from API`)
        } else {
          console.warn('No categories returned from API')
          setCategories([{ value: '', label: 'No categories available - Please contact admin' }])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Show error to user
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

    // No phone validation needed - we use the user's registered phone

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    // If called as form submit, prevent default; if called programmatically (no event), skip
    if (e && typeof (e as any).preventDefault === 'function') {
      (e as any).preventDefault()
    }

    setLoading(true)

    try {
      // Always use the user's registered phone number (keeps it simple)
      const contactPhone = user?.phone || ''

      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category,
        location: `${formData.city}, ${formData.county}`,
        county: formData.county,
        city: formData.city,
        condition: formData.condition as 'new' | 'like-new' | 'good' | 'fair' | 'poor',
        isNegotiable: formData.isNegotiable,
        paymentMethods: formData.paymentMethods,
        contactPhone: contactPhone
      }

      // Create product via API
      const newProduct = await productService.createProduct(productData, formData.image || undefined)

      // Navigate to the newly created product
      navigate(`/products/${newProduct.id}`)
    } catch (error: any) {
      console.error('Error adding product:', error)
      setErrors({ submit: error.message || 'Failed to add product. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#007bff' }}>
          Add New Product
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          Fill in the details below to list your product on LibMarket
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
          {/* Title (voice-enabled) */}
          <VoiceInput
            label="Product Title"
            placeholder="e.g., Samsung S21"
            value={title}
            onChange={(v) => setTitle(v)}
            helpText="Speak the product title, e.g., Samsung S21"
            required
            onFocus={() => speakPrompt('fieldPrompt', { field: 'product title' })}
          />

          {/* Description (voice-enabled) */}
          <VoiceInput
            label="Description"
            placeholder="Describe condition, model, etc."
            value={description}
            onChange={(v) => setDescription(v)}
            helpText="Describe the product in a few words"
            multiline
            rows={4}
            required
            onFocus={() => speakPrompt('fieldPrompt', { field: 'description' })}
          />

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
              onFocus={() => speakPrompt('fieldPrompt', { field: 'price' })}
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
              onFocus={() => speakPrompt('fieldPrompt', { field: 'category' })}
              aria-label="Category"
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
            <button
              type="button"
              onClick={() => speakPrompt('fieldPrompt', { field: 'category' })}
              aria-label="Category help"
              style={{ marginTop: '8px' }}
            >
              ❓ Category help
            </button>
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
              onFocus={() => speakPrompt('fieldPrompt', { field: 'contact phone number' })}
              aria-label="Contact Phone Number"
            />
            <div style={{ marginTop: 'var(--space-xs)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Leave blank to use your registered phone number
            </div>
            <button
              type="button"
              onClick={() => speakPrompt('fieldPrompt', { field: 'contact phone number' })}
              aria-label="Contact phone help"
              style={{ marginTop: '8px' }}
            >
              ❓ Phone help
            </button>
            {errors.phone && (
              <span style={{ color: '#dc3545', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
                {errors.phone}
              </span>
            )}
          </div>

          {/* Tags (voice-enabled) */}
          <VoiceInput
            label="Tags"
            placeholder="e.g., smartphone, samsung"
            value={tags}
            onChange={(v) => setTags(v)}
            helpText="Say tags separated by commas"
            onFocus={() => speakPrompt('fieldPrompt', { field: 'tags' })}
          />
          <button
            type="button"
            onClick={() => speakPrompt('fieldPrompt', { field: 'tags' })}
            aria-label="Tags help"
            style={{ marginTop: '8px', marginBottom: 'var(--space-md)' }}
          >
            ❓ Tags help
          </button>

          {/* Negotiable toggle */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label className="form-label" style={{ margin: 0 }}>Negotiable</label>
            <input
              type="checkbox"
              checked={formData.isNegotiable}
              onChange={(e) => setFormData(prev => ({ ...prev, isNegotiable: e.target.checked }))}
              onFocus={() => speakPrompt('fieldPrompt', { field: 'negotiable' })}
              aria-label="Negotiable"
            />
            <button
              type="button"
              onClick={() => speakPrompt('fieldPrompt', { field: 'negotiable' })}
              aria-label="Negotiable help"
              style={{ marginLeft: '8px' }}
            >
              ❓ Negotiable help
            </button>
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
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              onFocus={() => speakPrompt('fieldPrompt', { field: 'image upload' })}
              aria-label="Product Images"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <button
              type="button"
              onClick={() => speakPrompt('fieldPrompt', { field: 'image upload' })}
              aria-label="Image upload help"
              style={{ marginTop: '8px' }}
            >
              ❓ Image help
            </button>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
              Upload a clear photo of your product. Supported formats: JPG, PNG (max 5MB)
            </p>
          </div>

          {/* Submit button (large, accessible, voice feedback) */}
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <LargeActionButton
              label={loading ? 'Posting...' : 'Post Product'}
              icon="➕"
              variant="primary"
              voicePromptKey="successShort" /* speaks short success prompt when pressed */
              onClick={handleSubmit}
              ariaLabel="Post product"
            />
          </div>
        </form>

        {/* Guidelines */}
        <div className="card" style={{ marginTop: '24px', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ marginBottom: '16px' }}>Listing Guidelines</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
            <li>Be honest about the condition of your item</li>
            <li>Include clear, well-lit photos</li>
            <li>Provide accurate descriptions</li>
            <li>Price fairly based on market value</li>
            <li>Respond promptly to buyer inquiries</li>
            <li>Only list items you legally own</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AddProduct