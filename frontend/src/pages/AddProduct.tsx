import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import { useToast } from '../context/ToastContext'
import '../styles/AddProduct.css'

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

const AddProduct = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    location: 'Monrovia', // Default location
    condition: 'good', // Default condition
    contactPhone: '', // Contact phone for product
  })

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      console.log('📂 Fetching categories...')
      const response = await api.get('/categories')
      console.log('📂 Categories response:', response.data)

      if (response.data.success) {
        setCategories(response.data.data)
        console.log(`✅ Loaded ${response.data.data.length} categories`)
      } else {
        console.warn('⚠️ No categories found')
        toast.warning('No categories available')
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      const errorMsg = 'Failed to load categories. Please refresh the page.';
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file count
    if (files.length > 5) {
      const errorMsg = 'Maximum 5 images allowed';
      setError(errorMsg);
      toast.warning(errorMsg);
      return;
    }

    // Validate file sizes and types
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    for (const file of files) {
      if (file.size > maxSize) {
        const errorMsg = `File ${file.name} is too large. Maximum size is 5MB.`;
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = `File ${file.name} has invalid type. Only JPEG, PNG, WebP, and GIF allowed.`;
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
    }

    setImages(files);

    // Generate previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    setError('');
    toast.success(`${files.length} image(s) added successfully`);
  };
  
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke old preview URL
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
     // Validate required fields
     if (!formData.title.trim()) {
       throw new Error('Please enter a product title')
     }
     if (!formData.price || parseFloat(formData.price) <= 0) {
       throw new Error('Please enter a valid price')
     }
     if (!formData.category_id) {
       throw new Error('Please select a category')
     }

     // Create FormData for file upload
     const data = new FormData();
     data.append('title', formData.title);
     data.append('description', formData.description);
     data.append('price', formData.price);
     data.append('category_id', formData.category_id);
     data.append('location', formData.location);
     data.append('condition', formData.condition);
     data.append('contactPhone', formData.contactPhone);
     
     // Append images
     images.forEach((image) => {
       data.append('images', image);
     });
     
     const response = await api.post('/products', data, {
       headers: {
         'Content-Type': 'multipart/form-data'
       }
     })

      if (response.data.success) {
        toast.success('Product listed successfully! 🎉')
        navigate('/my-products')
      }
    } catch (err: any) {
     const errorMsg = err.response?.data?.error || 'Failed to create product'
     setError(errorMsg)
     toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  return (
    <div className="add-product-container">
      <HamburgerMenu />
      
      <div className="add-product-content">
        <div className="page-header">
          <h1>📦 List Your Product</h1>
          <p className="subtitle">Sell to thousands of buyers in Liberia</p>
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
            {categories.length === 0 && (
              <button 
                onClick={fetchCategories}
                style={{
                  marginLeft: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Retry Loading Categories
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          {/* Product Title - REQUIRED */}
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
            <span className="helper-text">Be specific and descriptive</span>
          </div>

          {/* Price - REQUIRED */}
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
            <span className="helper-text">Enter price in US Dollars</span>
          </div>

          {/* Category - REQUIRED */}
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
            {categories.length === 0 && (
              <span className="helper-text" style={{ color: '#dc2626' }}>
                ⚠️ No categories available. Please contact support.
              </span>
            )}
          </div>

          {/* Description - OPTIONAL */}
          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              placeholder="Describe your product... (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              maxLength={1000}
            />
            <span className="helper-text">
              {formData.description.length}/1000 characters
            </span>
          </div>

          {/* Location - Pre-filled with Monrovia */}
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
              <option value="Duport Road">Duport Road</option>
              <option value="Other">Other Location</option>
            </select>
          </div>

          {/* Condition - Pre-filled with Good */}
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

          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="images">
              📸 Product Images (Max 5)
            </label>
            <input
              type="file"
              id="images"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              multiple
              onChange={handleImageChange}
              className="input-file"
            />
            <p className="input-hint">
              JPEG, PNG, WebP, or GIF. Max 5MB per image.
            </p>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="image-previews">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/my-products')}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? '⏳ Posting...' : '📤 Post Product'}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="help-section">
          <h3>💡 Tips for a Great Listing</h3>
          <ul>
            <li>Use a clear, descriptive title</li>
            <li>Set a fair, competitive price</li>
            <li>Select the correct category</li>
            <li>Be honest about the condition</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AddProduct