import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import categoryService, { CreateCategoryData, UpdateCategoryData } from '../../services/categoryService'
import { Category } from '../../services/productService'
import './ManageCategories.css'

interface CategoryFormData extends CreateCategoryData {
  id?: string
}

const ManageCategories = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<CategoryFormData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: '',
    color: '#6B7280',
    isActive: true,
    sortOrder: 0
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('You do not have permission to access this page')
      setLoading(false)
      return
    }
    fetchCategories()
  }, [user])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getCategoriesWithCounts()
      setCategories(data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingCategory?.id) {
        // Update existing category
        const updateData: UpdateCategoryData = {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder
        }
        await categoryService.updateCategory(editingCategory.id, updateData)
        setSuccess('Category updated successfully')
      } else {
        // Create new category
        await categoryService.createCategory(formData)
        setSuccess('Category created successfully')
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        icon: '',
        color: '#6B7280',
        isActive: true,
        sortOrder: 0
      })
      setEditingCategory(null)
      setShowForm(false)
      fetchCategories()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save category')
    }
  }

  const handleEdit = (category: Category) => {
    setFormData({
      id: category.id,
      name: category.name,
      description: '',
      icon: category.icon || '',
      color: category.color || '#6B7280',
      isActive: true,
      sortOrder: 0
    })
    setEditingCategory(category as CategoryFormData)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This will fail if products are using this category.')) {
      return
    }

    try {
      await categoryService.deleteCategory(id)
      setSuccess('Category deleted successfully')
      fetchCategories()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete category. It may have products assigned to it.')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#6B7280',
      isActive: true,
      sortOrder: 0
    })
    setEditingCategory(null)
    setShowForm(false)
    setError('')
  }

  if (user?.role !== 'admin') {
    return (
      <div className="manage-categories-container">
        <div className="error-message">
          <p>Access Denied: Admin privileges required</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="manage-categories-container">
        <div className="loading">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="manage-categories-container">
      <div className="manage-categories-header">
        <h1>Manage Categories</h1>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add New Category
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="category-form-container">
          <h2>{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                minLength={2}
                maxLength={50}
                placeholder="e.g., Electronics"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description of this category"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="icon">Icon (emoji)</label>
                <input
                  type="text"
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="📱"
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">Color</label>
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sortOrder">Sort Order</label>
                <input
                  type="number"
                  id="sortOrder"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  min={0}
                />
              </div>
            </div>

            <div className="form-group-checkbox">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              <label htmlFor="isActive">Active</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-list">
        <h2>Existing Categories ({categories.length})</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-card-header">
                <div className="category-icon-name">
                  <span className="category-icon" style={{ color: category.color }}>
                    {category.icon || '📦'}
                  </span>
                  <h3>{category.name}</h3>
                </div>
                <div className="category-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(category)}
                    title="Edit category"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(category.id)}
                    title="Delete category"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="category-details">
                <div className="category-color-badge" style={{ backgroundColor: category.color }}>
                  {category.color}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ManageCategories
