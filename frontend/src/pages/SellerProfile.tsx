import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import HamburgerMenu from '../components/HamburgerMenu';
import ProductCard from '../components/ProductCard';

interface Seller {
  id: string;
  name: string;
  phone: string;
  avg_rating: number;
  total_reviews: number;
  total_sales: number;
  response_rate: number;
  is_verified: boolean;
  joined_at: string;
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images?: string[];
  category?: {
    name: string;
    icon: string;
    color: string;
  };
  view_count: number;
  status: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: {
    name: string;
    is_verified: boolean;
  };
  product: {
    id: string;
    title: string;
  };
}

const SellerProfile = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');

  useEffect(() => {
    fetchSellerData();
  }, [sellerId]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const [sellerRes, productsRes, reviewsRes] = await Promise.all([
        api.get(`/auth/users/${sellerId}`).catch(() => ({ data: { success: false } })),
        api.get(`/products?seller_id=${sellerId}&status=active`),
        api.get(`/reviews/seller/${sellerId}`)
      ]);

      if (sellerRes.data.success) {
        setSeller(sellerRes.data.data);
      }

      if (productsRes.data.success) {
        setProducts(productsRes.data.data || []);
      }

      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast.error('Failed to load seller profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <HamburgerMenu />
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '6rem 1rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>Loading...</div>
          <p>Loading seller profile...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="dashboard-container">
        <HamburgerMenu />
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '6rem 1rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>Seller Not Found</div>
          <h2>Seller not found</h2>
          <button
            onClick={() => navigate('/products')}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <HamburgerMenu />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '6rem 1rem 2rem'
      }}>
        {/* Seller Header Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              {/* Avatar & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  color: 'white',
                  fontWeight: 600
                }}>
                  {seller.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1F2937' }}>
                      {seller.name}
                    </h1>
                    {seller.is_verified && (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#10b981',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0.25rem 0 0', color: '#6B7280' }}>
                    Member since {formatDate(seller.joined_at || seller.created_at)}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                    {products.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    Active Listings
                  </div>
                </div>
                {seller.response_rate > 0 && (
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3B82F6' }}>
                      {seller.response_rate}%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                      Response Rate
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => toast.info('Messaging feature coming soon!')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Contact Seller
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid #E5E7EB'
        }}>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: `3px solid ${activeTab === 'products' ? '#667eea' : 'transparent'}`,
              color: activeTab === 'products' ? '#667eea' : '#6B7280',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              padding: '1rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: `3px solid ${activeTab === 'reviews' ? '#667eea' : 'transparent'}`,
              color: activeTab === 'reviews' ? '#667eea' : '#6B7280',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' ? (
          products.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#9CA3AF'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>No Products</div>
              <p style={{ margin: 0 }}>No active products at the moment</p>
            </div>
          )
        ) : (
          reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: '#1F2937' }}>
                          {review.reviewer.name}
                        </span>
                        {review.reviewer.is_verified && (
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            background: '#10b981',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '0.75rem'
                          }}>
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {review.comment && (
                    <p style={{ margin: '0 0 1rem', color: '#374151', lineHeight: 1.6 }}>
                      {review.comment}
                    </p>
                  )}

                  <div style={{
                    padding: '0.75rem',
                    background: '#F9FAFB',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: '#6B7280'
                  }}>
                    Product: <span
                      onClick={() => navigate(`/products/${review.product.id}`)}
                      style={{
                        color: '#667eea',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {review.product.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#9CA3AF'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
              <p style={{ margin: 0 }}>No reviews yet</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
