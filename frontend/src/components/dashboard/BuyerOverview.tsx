import { Link } from 'react-router-dom'
import { designSystem } from '../../styles/designSystem'
import { formatPriceWithCurrency } from '../../utils/currency'
import OfferCard from '../OfferCard'
import { Offer } from '../../services/offerService'

interface BuyerOverviewProps {
  purchases: any[]
  recentActivity: any[]
  sentOffers: Offer[]
  onOfferUpdated?: () => void
}

const BuyerOverview = ({ purchases, recentActivity, sentOffers, onOfferUpdated }: BuyerOverviewProps) => {
  // Group offers by product
  const offersByProduct = sentOffers.reduce((acc, offer) => {
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
      
      {/* Active Offers */}
      {Object.keys(offersByProduct).length > 0 && (
        <section>
          <h2 style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[900], marginBottom: designSystem.spacing.md }}>
            Your Offers
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
                      viewType='buyer' 
                      onOfferUpdated={onOfferUpdated}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Purchases */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: designSystem.spacing.md }}>
          <h2 style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[900] }}>
            Recent Purchases
          </h2>
          <Link to='/purchases' style={{ color: designSystem.colors.primary[500], textDecoration: 'none' }}>
            View All
          </Link>
        </div>

        {purchases.length === 0 ? (
          <div style={{ 
            padding: designSystem.spacing.xl, 
            background: 'white', 
            borderRadius: designSystem.borderRadius.lg,
            textAlign: 'center',
            color: designSystem.colors.neutral[500]
          }}>
            No purchases yet. <Link to='/products'>Start shopping!</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: designSystem.spacing.md }}>
            {purchases.map((purchase) => (
              <div key={purchase.id} style={{
                background: 'white',
                padding: designSystem.spacing.md,
                borderRadius: designSystem.borderRadius.lg,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: designSystem.shadows.sm
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{purchase.product?.title || 'Unknown Item'}</div>
                  <div style={{ fontSize: '0.9rem', color: designSystem.colors.neutral[500] }}>
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', color: designSystem.colors.primary[500] }}>
                  {formatPriceWithCurrency(purchase.amount, purchase.currency).primary}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <h2 style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[900], marginBottom: designSystem.spacing.md }}>
          Recent Activity
        </h2>
        <div style={{ background: 'white', borderRadius: designSystem.borderRadius.lg, overflow: 'hidden', boxShadow: designSystem.shadows.sm }}>
          {recentActivity.length === 0 ? (
            <div style={{ padding: designSystem.spacing.lg, textAlign: 'center', color: designSystem.colors.neutral[500] }}>
              No recent activity
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} style={{
                padding: designSystem.spacing.md,
                borderBottom: index < recentActivity.length - 1 ? `1px solid ${designSystem.colors.neutral[200]}` : 'none'
              }}>
                {activity.description}
                <div style={{ fontSize: '0.8rem', color: designSystem.colors.neutral[500], marginTop: '4px' }}>
                  {new Date(activity.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default BuyerOverview
