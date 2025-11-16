import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import productService from '../services/productService'
import categoryService from '../services/categoryService'
import { useAuth } from '../context/AuthContext'
import LocationSelector from '../components/LocationSelector'
import PhoneInput from '../components/PhoneInput'
// import { validateLiberianPhone } from '../utils/phoneValidation' - not currently used
import { getPaymentMethods, type PaymentMethod } from '../data/paymentMethods'
import VoiceRecorder from '../components/VoiceRecorder'
import LargeActionButton from '../components/LargeActionButton'
import { designSystem } from '../styles/designSystem'
import HamburgerMenu from '../components/HamburgerMenu'
import TopNav from '../components/TopNav'

const AddProduct = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [county, setCounty] = useState('')
  const [city, setCity] = useState('')
  const [condition, setCondition] = useState('good')
  const [contactPhone, setContactPhone] = useState('')
  const [tags, setTags] = useState('')
  const [isNegotiable, setIsNegotiable] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoryError, setCategoryError] = useState('')
  const [availablePaymentMethods] = useState<PaymentMethod[]>(getPaymentMethods())

  // Sync formData title and description with separate state for voice inputs
  const handleTitleChange = (value: string) => {
    setTitle(value)
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value)
  }

  // Handle voice recording for product description
  const handleVoiceRecording = (audioBlob: Blob, audioUrl: string) => {
    // Not used in this version
  }

  const handleVoiceRecordingDelete = () => {
    // Not used in this version
  }

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await categoryService.getCategories()
        console.log('Fetched categories:', response) // Debug log
        
        // Handle different response shapes
        const categoryList = response.data || response.categories || response || []
        setCategories(categoryList)
        
        if (categoryList.length === 0) {
          setCategoryError('No categories available. Please contact admin.')
        }
      } catch (error: any) {
        console.error('Error loading categories:', error)
        setCategoryError('Failed to load categories. Please try again.')
      } finally {
        setLoadingCategories(false)
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
    // setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImage(file)
  }

  const handlePaymentMethodToggle = (methodId: string) => {
    // setFormData(prev => {
    //   const isSelected = prev.paymentMethods.includes(methodId)
    //   const newPaymentMethods = isSelected
    //     ? prev.paymentMethods.filter(m => m !== methodId)
    //     : [...prev.paymentMethods, methodId]
    //   return { ...prev, paymentMethods: newPaymentMethods }
    // })
  }

  // Form validation function - available for future enhancement if needed
  // Currently using basic HTML5 validation and backend validation
  // const validateForm = (): boolean => {
  //   const newErrors: Record<string, string> = {}

  //   if (!formData.title.trim()) {
  //     newErrors.title = 'Product title is required'
  //   }

  //   if (!formData.description.trim()) {
  //     newErrors.description = 'Product description is required'
  //   }

  //   if (!formData.price.trim()) {
  //     newErrors.price = 'Price is required'
  //   } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
  //     newErrors.price = 'Please enter a valid price'
  //   }

  //   if (!formData.category) {
  //     newErrors.category = 'Please select a category'
  //   }

  //   if (!formData.county) {
  //     newErrors.county = 'County is required'
  //   }

  //   if (!formData.city) {
  //     newErrors.city = 'City/Town is required'
  //   }

  //   setErrors(newErrors)
  //   return Object.keys(newErrors).length === 0
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setErrors({})

    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData()
      
      // Add random suffix to title to avoid duplicates during testing
      const testTitle = title.trim() || `Test Product ${Date.now()}`
      
      // Append fields
      formData.append('title', testTitle)
      if (description.trim()) formData.append('description', description.trim())
      if (price) formData.append('price', price)
      if (category) formData.append('category_id', category)
      
      // Location fields
      if (county) formData.append('location', county)
      if (city) formData.append('location', `${city}, ${county}`)
      
      if (contactPhone) formData.append('contactPhone', contactPhone)
      if (condition) formData.append('condition', condition)
      if (tags) formData.append('tags', tags)
      formData.append('isNegotiable', isNegotiable.toString())
      
      // Append image if selected
      if (image) {
        formData.append('image', image)
      }
      
      console.log('Submitting product data...')
      
      // Log FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }
      
      const response = await productService.createProduct(formData)

      if (response.success) {
        alert('Product posted successfully!')
        // Clear form after successful submission
        setTitle('')
        setDescription('')
        setPrice('')
        setCategory('')
        setCounty('')
        setCity('')
        setContactPhone('')
        setTags('')
        setCondition('good')
        setIsNegotiable(false)
        setImage(null)
        navigate('/products')
      } else {
        setErrors({ submit: response.error || 'Failed to post product' })
      }
    } catch (error: any) {
      console.error('Error posting product:', error)
      console.error('Error response:', error.response?.data)
      
      // Better error message
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Failed to post product. Please try again.'
      
      setErrors({ submit: errorMessage })
      alert(`Failed to post product: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Liberian counties
  const counties = [
    'Montserrado',
    'Margibi',
    'Grand Bassa',
    'Bong',
    'Nimba',
    'Grand Gedeh',
    'Lofa',
    'Sinoe',
    'Rivercess',
    'Grand Cape Mount',
    'Gbarpolu',
    'Bomi',
    'Grand Kru',
    'Maryland',
    'River Gee'
  ]

  // Cities by county
  const citiesByCounty: Record<string, string[]> = {
    'Montserrado': ['Monrovia', 'Paynesville', 'New Kru Town', 'Congo Town', 'Sinkor', 'Mamba Point', 'Caldwell'],
    'Margibi': ['Kakata', 'Harbel', 'Salala', 'Cinta'],
    'Grand Bassa': ['Buchanan', 'Compound #3', 'Owensgrove'],
    'Bong': ['Gbarnga', 'Totota', 'Salayea', 'Suakoko'],
    'Nimba': ['Sanniquellie', 'Ganta', 'Tappita', 'Saclepea'],
    'Grand Gedeh': ['Zwedru', 'Tchien', 'Putu'],
    'Lofa': ['Voinjama', 'Kolahun', 'Foya', 'Zorzor'],
    'Sinoe': ['Greenville', 'Juarzon', 'Butaw'],
    'Rivercess': ['Rivercess City', 'Yarpah Town'],
    'Grand Cape Mount': ['Robertsport', 'Sinje', 'Porkpa'],
    'Gbarpolu': ['Bopolu', 'Gbarma'],
    'Bomi': ['Tubmanburg', 'Suehn Mecca', 'Klay'],
    'Grand Kru': ['Barclayville', 'Sasstown', 'Picnicess'],
    'Maryland': ['Harper', 'Pleebo', 'Karloken'],
    'River Gee': ['Fish Town', 'Gbeapo', 'Chedepo']
  }

  return (
    <div className="add-product-container">
      <HamburgerMenu />
      <TopNav />
      
      <div className="container">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#007bff' }}>
            Add New Product
          </h1>
          <p style={{ color: '#666', marginBottom: '32px' }}>
            Fill in at least one field to test the product listing flow
          </p>

          {errors.submit && (
            <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="card">
            {/* Title (optional for testing) */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="title" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
               Product Title <span style={{ fontSize: '0.8rem', color: '#666' }}>(Optional)</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Samsung S21"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
              />
            </div>

            {/* Description (optional for testing) */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="description" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
               Description <span style={{ fontSize: '0.8rem', color: '#666' }}>(Optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe condition, model, features..."
                rows={4}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', resize: 'vertical' }}
              />
            </div>

            {/* Voice Recording for Audio Description */}
            <div style={{ marginTop: '16px', marginBottom: '24px' }}>
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecording}
                onRecordingDelete={handleVoiceRecordingDelete}
                label="Voice Description (Optional)"
                helpText="Record a voice description for customers who prefer listening"
              />
            </div>

            {/* Price (optional for testing) */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="price" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
               Price (LD) <span style={{ fontSize: '0.8rem', color: '#666' }}>(Optional)</span>
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 5000"
                min="0"
                step="0.01"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
              />
            </div>

            {/* Category (optional - no longer required) */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="category" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
                Category <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 400 }}>(Optional)</span>
              </label>
              
              {loadingCategories ? (
                <div style={{ padding: '12px', color: '#666', fontStyle: 'italic' }}>
                  Loading categories...
                </div>
              ) : categoryError ? (
                <div style={{ padding: '12px', color: '#d9534f', background: '#f8d7da', borderRadius: '8px' }}>
                  {categoryError}
                </div>
              ) : (
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon && `${cat.icon} `}{cat.name}
                    </option>
                  ))}
                </select>
              )}
              
              <small style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginTop: '4px' }}>
                Products without categories will appear in "Uncategorized"
              </small>
            </div>

            {/* Condition */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="condition" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
                Condition <span style={{ color: '#d9534f' }}>*</span>
              </label>
              <select
                name="condition"
                value={condition}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              >
                <option value="">Select Condition</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="county" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
                County
              </label>
              <select
                id="county"
                value={county}
                onChange={(e) => {
                  setCounty(e.target.value)
                  setCity('') // Reset city when county changes
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  background: 'white'
                }}
              >
                <option value="">Select County</option>
                {counties.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* City/Town Selector (only show if county selected) */}
            {county && (
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="city" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
                  City/Town
                </label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                >
                  <option value="">Select City/Town</option>
                  {citiesByCounty[county]?.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <small style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginTop: '4px' }}>
                  Selected: {city ? `${city}, ${county}` : 'Please select a city'}
                </small>
              </div>
            )}

            {/* Contact Phone (regular input) */}
            <div style={{ marginBottom: '24px' }}>
              <PhoneInput
                value={contactPhone}
                onChange={(value, isValid) => {
                  setContactPhone(value)
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

            {/* Tags (regular input) */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="tags" style={{ display: 'block', fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>
                Tags
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., smartphone, samsung, android"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
              />
              <small style={{ fontSize: '0.75rem', color: '#666' }}>Separate tags with commas</small>
            </div>

            {/* Negotiable toggle */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label className="form-label" style={{ margin: 0 }}>Negotiable</label>
              <input
                type="checkbox"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {[
                  { id: 'cash', label: 'Cash', icon: '💵' },
                  { id: 'mobilemoney', label: 'Mobile Money', icon: '📱' },
                  { id: 'bank', label: 'Bank Transfer', icon: '🏦' }
                ].map((method) => (
                  <label
                    key={method.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      border: `2px solid ${false ? '#007bff' : '#ddd'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '1.2rem' }}>{method.icon}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
             {loading ? '⏳ Testing Post...' : '➕ Post Product'}
            </button>
          </form>

         {/* Testing Note */}
         <div style={{ 
           marginTop: '24px', 
           padding: '16px', 
           background: '#fff3cd', 
           border: '1px solid #ffc107',
           borderRadius: '8px',
           fontSize: '0.9rem'
         }}>
           <strong>🧪 Testing Mode:</strong> All fields are now optional. You can submit with minimal data to test the flow.
         </div>
        </div>
      </div>
    </div>
  )
}

export default AddProduct