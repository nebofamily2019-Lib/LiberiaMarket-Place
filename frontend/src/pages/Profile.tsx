import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import productService from '../services/productService'
import userService from '../services/userService'
import { getPaymentMethods } from '../data/paymentMethods'
import PaymentMethodBadge from '../components/PaymentMethodBadge'

interface Product {
  id: string
  title: string
  price: number
  status: 'active' | 'sold' | 'inactive' | 'pending'
  datePosted: string
}

const Profile = () => {
  const { user, isAuthenticated, refreshUser } = useAuth()
  const [userProducts, setUserProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'products' | 'ratings' | 'payments'>('info')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating] = useState(0) // Placeholder for user rating
  const paymentMethods = getPaymentMethods()
  const [userPaymentPreferences, setUserPaymentPreferences] = useState<string[]>(user?.preferredPaymentMethods || [])
  const [isEditingPayments, setIsEditingPayments] = useState(false)
  const [savingPayments, setSavingPayments] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (user?.preferredPaymentMethods) {
      setUserPaymentPreferences(user.preferredPaymentMethods)
    }
  }, [user])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        // Fetch user's products
        const productsResponse = await productService.getUserProducts(user.id, 1, 50)

        // Transform products data
        const transformedProducts: Product[] = productsResponse.data.map((product: any) => ({
          id: product.id,
          title: product.title,
          price: Number(product.price),
          status: product.status,
          datePosted: product.created_at || product.createdAt
        }))

        setUserProducts(transformedProducts)
      } catch (err: any) {
        console.error('Error fetching user data:', err)
        setError(err.message || 'Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, isAuthenticated])

  const handlePaymentMethodToggle = (methodId: string) => {
    setUserPaymentPreferences(prev => {
      const isSelected = prev.includes(methodId)
      if (isSelected) {
        return prev.filter(m => m !== methodId)
      } else {
        return [...prev, methodId]
      }
    })
  }

  const handleSavePaymentPreferences = async () => {
    setSavingPayments(true)
    setError('')

    try {
      await userService.updatePaymentPreferences(userPaymentPreferences)
      await refreshUser()
      setIsEditingPayments(false)
    } catch (err: any) {
      console.error('Error updating payment preferences:', err)
      setError(err.message || 'Failed to update payment preferences')
    } finally {
      setSavingPayments(false)
    }
  }

  const handleCancelPaymentEdit = () => {
    setUserPaymentPreferences(user?.preferredPaymentMethods || [])
    setIsEditingPayments(false)
    setError('')
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    setDeleting(true)
    setError('')

    try {
      await productService.deleteProduct(productToDelete)

      // Remove product from local state
      setUserProducts(prev => prev.filter(p => p.id !== productToDelete))

      // Close modal
      setDeleteModalOpen(false)
      setProductToDelete(null)
    } catch (err: any) {
      console.error('Error deleting product:', err)
      setError(err.message || 'Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteModal = (productId: string) => {
    setProductToDelete(productId)
    setDeleteModalOpen(true)
    setError('')
  }

  const closeDeleteModal = () => {
    if (!deleting) {
      setDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  const handleMarkAsSold = async (productId: string) => {
    setError('')
    try {
      const updatedProduct = await productService.updateProductStatus(productId, 'sold')

      // Update product in local state
      setUserProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, status: 'sold' as any } : p
      ))
    } catch (err: any) {
      console.error('Error marking product as sold:', err)
      setError(err.message || 'Failed to update product status')
    }
  }

  const handleMarkAsActive = async (productId: string) => {
    setError('')
    try {
      const updatedProduct = await productService.updateProductStatus(productId, 'active')

      // Update product in local state
      setUserProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, status: 'active' as any } : p
      ))
    } catch (err: any) {
      console.error('Error marking product as active:', err)
      setError(err.message || 'Failed to update product status')
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#ffc107' : '#ddd' }}>
          ★
        </span>
      )
    }
    return stars
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#28a745'
      case 'sold': return '#6c757d'
      case 'inactive': return '#dc3545'
      default: return '#6c757d'
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <h2>Please log in to view your profile</h2>
        <Link to="/login" className="btn btn-primary">
          Login
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <h2>Loading profile...</h2>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      {/* Profile Header */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--color-text-primary)' }}>{user.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div>{renderStars(rating)}</div>
              <span style={{ color: 'var(--color-text-secondary)' }}>({rating}/5)</span>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              📱 {user.phone}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            padding: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
            backgroundColor: '#fee',
            color: 'var(--color-error)',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid var(--color-error)',
            fontSize: 'var(--font-size-sm)'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: 'grid',
          gap: 'var(--space-lg)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          padding: 'var(--space-lg)',
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--border-radius-md)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {userProducts.filter(p => p.status === 'sold').length}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Items Sold</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {userProducts.length}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Total Listings</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
              {userProducts.filter(p => p.status === 'active').length}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Active Listings</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'info' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('info')}
        >
          Profile Info
        </button>
        <button
          className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('payments')}
        >
          💳 Payment Methods
        </button>
        <button
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('products')}
        >
          My Products
        </button>
        <button
          className={`btn ${activeTab === 'ratings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('ratings')}
        >
          Ratings & Reviews
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="card">
          <h2 style={{ marginBottom: 'var(--space-xl)', color: 'var(--color-text-primary)' }}>Profile Information</h2>

          <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold' }}>
                Full Name
              </label>
              <input
                type="text"
                value={user.name}
                readOnly
                className="form-input"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={user.phone || 'Not provided'}
                readOnly
                className="form-input"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 'bold' }}>
                Location
              </label>
              <input
                type="text"
                value={user.location || 'Not provided'}
                readOnly
                className="form-input"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
            <div>
              <h2 style={{ marginBottom: 'var(--space-xs)', color: 'var(--color-text-primary)' }}>
                Payment Preferences
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                Select your preferred payment methods for buying and selling
              </p>
            </div>
            {!isEditingPayments && (
              <button
                className="btn btn-primary"
                onClick={() => setIsEditingPayments(true)}
              >
                Edit
              </button>
            )}
          </div>

          {/* Current Payment Methods Summary */}
          {!isEditingPayments && userPaymentPreferences.length > 0 && (
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)', fontWeight: '600' }}>
                Your Selected Methods ({userPaymentPreferences.length})
              </h3>
              <PaymentMethodBadge
                methodIds={userPaymentPreferences}
                maxDisplay={10}
                size="large"
                showIcons={true}
              />
            </div>
          )}

          {!isEditingPayments && userPaymentPreferences.length === 0 && (
            <div style={{
              padding: 'var(--space-xl)',
              textAlign: 'center',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--border-radius-md)',
              marginBottom: 'var(--space-xl)'
            }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
                You haven't selected any payment methods yet
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setIsEditingPayments(true)}
              >
                Add Payment Methods
              </button>
            </div>
          )}

          {/* Edit Mode */}
          {isEditingPayments && (
            <>
              {/* Mobile Money */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h4 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-md)',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)'
                }}>
                  <span>📱</span> Mobile Money
                </h4>
                <div style={{ display: 'grid', gap: 'var(--space-md)', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                  {paymentMethods.filter(m => m.type === 'mobile_money').map(method => (
                    <label
                      key={method.id}
                      style={{
                        padding: 'var(--space-md)',
                        border: `2px solid ${userPaymentPreferences.includes(method.id) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--border-radius-md)',
                        backgroundColor: userPaymentPreferences.includes(method.id) ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        <input
                          type="checkbox"
                          checked={userPaymentPreferences.includes(method.id)}
                          onChange={() => handlePaymentMethodToggle(method.id)}
                          style={{ marginRight: 'var(--space-sm)', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '1.5rem', marginRight: 'var(--space-sm)' }}>{method.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600' }}>{method.name}</div>
                          {method.provider && (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                              {method.provider}
                            </div>
                          )}
                        </div>
                        {userPaymentPreferences.includes(method.id) && (
                          <span style={{ color: 'var(--color-success)', fontSize: '1.2rem' }}>✓</span>
                        )}
                      </div>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                        {method.description}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cash Methods */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h4 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-md)',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)'
                }}>
                  <span>💵</span> Cash Payment
                </h4>
                <div style={{ display: 'grid', gap: 'var(--space-md)', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                  {paymentMethods.filter(m => m.type === 'cash').map(method => (
                    <label
                      key={method.id}
                      style={{
                        padding: 'var(--space-md)',
                        border: `2px solid ${userPaymentPreferences.includes(method.id) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--border-radius-md)',
                        backgroundColor: userPaymentPreferences.includes(method.id) ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        <input
                          type="checkbox"
                          checked={userPaymentPreferences.includes(method.id)}
                          onChange={() => handlePaymentMethodToggle(method.id)}
                          style={{ marginRight: 'var(--space-sm)', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '1.5rem', marginRight: 'var(--space-sm)' }}>{method.icon}</span>
                        <div style={{ fontWeight: '600', flex: 1 }}>{method.name}</div>
                        {userPaymentPreferences.includes(method.id) && (
                          <span style={{ color: 'var(--color-success)', fontSize: '1.2rem' }}>✓</span>
                        )}
                      </div>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                        {method.description}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Other Methods */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h4 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  marginBottom: 'var(--space-md)',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)'
                }}>
                  <span>🏦</span> Other Methods
                </h4>
                <div style={{ display: 'grid', gap: 'var(--space-md)', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                  {paymentMethods.filter(m => m.type === 'bank' || m.type === 'other').map(method => (
                    <label
                      key={method.id}
                      style={{
                        padding: 'var(--space-md)',
                        border: `2px solid ${userPaymentPreferences.includes(method.id) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--border-radius-md)',
                        backgroundColor: userPaymentPreferences.includes(method.id) ? 'var(--color-primary-light)' : 'var(--color-bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        <input
                          type="checkbox"
                          checked={userPaymentPreferences.includes(method.id)}
                          onChange={() => handlePaymentMethodToggle(method.id)}
                          style={{ marginRight: 'var(--space-sm)', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '1.5rem', marginRight: 'var(--space-sm)' }}>{method.icon}</span>
                        <div style={{ fontWeight: '600', flex: 1 }}>{method.name}</div>
                        {userPaymentPreferences.includes(method.id) && (
                          <span style={{ color: 'var(--color-success)', fontSize: '1.2rem' }}>✓</span>
                        )}
                      </div>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                        {method.description}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div style={{
                padding: 'var(--space-md)',
                backgroundColor: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--color-border-light)',
                marginBottom: 'var(--space-lg)'
              }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-sm)', fontWeight: '600' }}>
                  💡 Tips
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  <li>Select multiple payment methods to attract more buyers</li>
                  <li>Mobile Money is the most popular payment method in Liberia</li>
                  <li>Cash on Delivery is trusted by buyers for first-time transactions</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelPaymentEdit}
                  disabled={savingPayments}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSavePaymentPreferences}
                  disabled={savingPayments}
                >
                  {savingPayments ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
            <h2 style={{ color: 'var(--color-text-primary)' }}>My Products ({userProducts.length})</h2>
            <Link to="/add-product" className="btn btn-primary">
              Add New Product
            </Link>
          </div>

          <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
            {userProducts.map(product => (
              <div key={product.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <h3 style={{ marginBottom: 'var(--space-sm)', color: 'var(--color-text-primary)' }}>
                      {product.title}
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)', fontSize: 'var(--font-size-sm)' }}>
                      Posted: {new Date(product.datePosted).toLocaleDateString()}
                    </p>
                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                      L${product.price}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', alignItems: 'flex-end' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      backgroundColor: getStatusColor(product.status),
                      color: 'white',
                      fontSize: 'var(--font-size-xs)',
                      textTransform: 'capitalize',
                      fontWeight: '600'
                    }}>
                      {product.status}
                    </span>

                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Link
                        to={`/products/${product.id}`}
                        className="btn btn-secondary"
                        style={{ fontSize: 'var(--font-size-sm)', padding: '8px 16px' }}
                      >
                        View
                      </Link>
                      <Link
                        to={`/edit-product/${product.id}`}
                        className="btn btn-primary"
                        style={{ fontSize: 'var(--font-size-sm)', padding: '8px 16px' }}
                      >
                        Edit
                      </Link>
                      {product.status === 'active' && (
                        <button
                          onClick={() => handleMarkAsSold(product.id)}
                          className="btn"
                          style={{
                            fontSize: 'var(--font-size-sm)',
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white'
                          }}
                        >
                          Mark as Sold
                        </button>
                      )}
                      {product.status === 'sold' && (
                        <button
                          onClick={() => handleMarkAsActive(product.id)}
                          className="btn"
                          style={{
                            fontSize: 'var(--font-size-sm)',
                            padding: '8px 16px',
                            backgroundColor: '#17a2b8',
                            color: 'white'
                          }}
                        >
                          Relist
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteModal(product.id)}
                        className="btn"
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          padding: '8px 16px',
                          backgroundColor: 'var(--color-error)',
                          color: 'white'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {userProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--color-text-secondary)' }}>
              <h3>No products yet</h3>
              <p>Start selling by adding your first product!</p>
              <Link to="/add-product" className="btn btn-primary">
                Add Product
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="card">
          <h2 style={{ marginBottom: 'var(--space-xl)', color: 'var(--color-text-primary)' }}>Ratings & Reviews</h2>

          <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--color-text-secondary)' }}>
            <h3>No reviews yet</h3>
            <p>Reviews from buyers will appear here after completed transactions.</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-lg)'
          }}
          onClick={closeDeleteModal}
        >
          <div
            className="card"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: 'var(--space-xl)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-primary)' }}>
              Delete Product
            </h2>

            <p style={{ marginBottom: 'var(--space-xl)', color: 'var(--color-text-secondary)' }}>
              Are you sure you want to delete this product? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={closeDeleteModal}
                disabled={deleting}
                style={{ minWidth: '100px' }}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleDeleteProduct}
                disabled={deleting}
                style={{
                  minWidth: '100px',
                  backgroundColor: 'var(--color-error)',
                  color: 'white',
                  opacity: deleting ? 0.6 : 1,
                  cursor: deleting ? 'not-allowed' : 'pointer'
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
