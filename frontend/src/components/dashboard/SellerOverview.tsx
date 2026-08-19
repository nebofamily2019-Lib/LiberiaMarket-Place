import { Link } from 'react-router-dom'
import { designSystem } from '../../styles/designSystem'
import { formatPriceWithCurrency } from '../../utils/currency'
import OfferCard from '../OfferCard'
import { Offer } from '../../services/offerService'

interface Product {
  id: string
  title: string
  price: number
  status: string
  currency?: string
  image?: string
}

interface SellerOverviewProps {
  products: Product[]
  receivedOffers: Offer[]
  onOfferUpdated?: () => void
}

const SellerOverview = ({ products, receivedOffers, onOfferUpdated }: SellerOverviewProps) => {
  // Group offers by product
  const offersByProduct = receivedOffers.reduce((acc, offer) => {
    const productId = offer.product?.id || 'unknown';
    if (!acc[productId]) {
      acc[productId] = {
        product: offer.product,
        offers: []
      };
    }
    acc[productId].offers.push(offer);
    return acc;
  }, {} as Record<string, { product: Offer['product'], offers: Offer[] }>);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.xl }}>
      
      {/* Received Offers */}
      {Object.keys(offersByProduct).length > 0 && (
        <section>
          <h2 style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[900], marginBottom: designSystem.spacing.md }}>
            Received Offers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.xl }}>
            {Object.values(offersByProduct).map(({ product, offers }) => (
              <div key={product?.id || 'unknown'} style={{ 
                background: '#f8fafc', 
                borderRadius: designSystem.borderRadius.lg, 
                padding: designSystem.spacing.md,
                border: `1px solid ${designSystem.colors.neutral[200]}`
              }}>
                <div style={{ 
                  marginBottom: designSystem.spacing.md, 
                  paddingBottom: designSystem.spacing.sm, 
                  borderBottom: `1px solid ${designSystem.colors.neutral[200]}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                    {product?.title || 'Unknown Item'} 
                    <span style={{ 
                      marginLeft: '10px', 
                      fontSize: '0.9rem', 
                      fontWeight: 'normal', 
                      color: '#64748b',
                      background: '#e2e8f0',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {offers.length} offer{offers.length !== 1 ? 's' : ''}
                    </span>
                  </h3>
                  {product?.id && (
                    <Link to={`/products/${product.id}`} style={{ fontSize: '0.9rem', color: designSystem.colors.primary[500], textDecoration: 'none' }}>
                      View Item →
                    </Link>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.md }}>
                  {offers.map(offer => (
                    <OfferCard 
                      key={offer.id} 
                      offer={offer} 
                      viewType='seller' 
                      onOfferUpdated={onOfferUpdated}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Products */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: designSystem.spacing.md }}>
          <h2 style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[900] }}>
            My Products
          </h2>
          <Link to='/my-products' style={{ color: designSystem.colors.primary[500], textDecoration: 'none' }}>
            Manage All
          </Link>
        </div>

        {products.length === 0 ? (
          <div style={{ 
            padding: designSystem.spacing.xl, 
            background: 'white', 
            borderRadius: designSystem.borderRadius.lg,
            textAlign: 'center',
            color: designSystem.colors.neutral[500]
          }}>
            You haven't listed any products yet. <Link to='/products/add'>Start selling!</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: designSystem.spacing.md }}>
            {products.map((product) => (
              <div key={product.id} style={{
                background: 'white',
                borderRadius: designSystem.borderRadius.lg,
                overflow: 'hidden',
                boxShadow: designSystem.shadows.sm,
                border: `1px solid ${designSystem.colors.neutral[200]}`
              }}>
                <div style={{ padding: designSystem.spacing.md }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{product.title}</div>
                  <div style={{ color: designSystem.colors.secondary[500], fontWeight: 'bold' }}>
                    {formatPriceWithCurrency(product.price, product.currency).primary}
                    <span style={{ fontSize: '0.8em', color: designSystem.colors.neutral[500], fontWeight: 'normal', marginLeft: '4px' }}>
                      {formatPriceWithCurrency(product.price, product.currency).secondary}
                    </span>
                  </div>
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '0.8rem', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    background: product.status === 'active' ? '#dcfce7' : '#f3f4f6',
                    color: product.status === 'active' ? '#166534' : '#374151',
                    display: 'inline-block'
                  }}>
                    {product.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default SellerOverview
