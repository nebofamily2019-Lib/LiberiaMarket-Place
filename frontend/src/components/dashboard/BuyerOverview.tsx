import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { designSystem } from '../../styles/designSystem'
import { formatPriceWithCurrency } from '../../utils/currency'
import { getImageUrl } from '../../utils/imageUtils'
import OfferCard from '../OfferCard'
import { Offer } from '../../services/offerService'

interface BuyerStats {
  activeOffers: number
  awaitingYourResponse: number
  purchases: number
}

interface BuyerOverviewProps {
  purchases: any[]
  recentActivity: any[]
  pendingSentOffers: Offer[]
  counteredSentOffers: Offer[]
  activeDealOffers: Offer[]
  onOfferUpdated?: () => void
  stats?: BuyerStats
}

const groupOffersByProduct = (offers: Offer[]) =>
  offers.reduce((acc, offer) => {
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

const OfferGroups = ({ offers, onOfferUpdated }: { offers: Offer[], onOfferUpdated?: () => void }) => {
  const offersByProduct = groupOffersByProduct(offers)
  return (
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
  )
}

const BuyerOverview = ({ purchases, recentActivity, pendingSentOffers, counteredSentOffers, activeDealOffers, onOfferUpdated, stats }: BuyerOverviewProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.xl }}>

      {/* Buyer Stats */}
      {stats && (
        <div className='stats-grid'>
          <div className={`stat-card ${stats.awaitingYourResponse > 0 ? 'clickable' : ''}`}>
            <div className='stat-icon' style={stats.awaitingYourResponse > 0 ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' } : undefined}>
              {stats.awaitingYourResponse > 0 ? '🔔' : '📨'}
            </div>
            <div className='stat-info'>
              <h3>{stats.awaitingYourResponse}</h3>
              <p>{stats.awaitingYourResponse === 1 ? 'Counter-Offer Awaiting You' : 'Counter-Offers Awaiting You'}</p>
            </div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon'>💬</div>
            <div className='stat-info'>
              <h3>{stats.activeOffers}</h3>
              <p>Active Offers</p>
            </div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon'>🛍️</div>
            <div className='stat-info'>
              <h3>{stats.purchases}</h3>
              <p>Completed Purchases</p>
            </div>
          </div>
        </div>
      )}

      {/* Counter-Offers Awaiting You — matches the stat card above 1:1 */}
      {counteredSentOffers.length > 0 && (
        <section>
          <h2 style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[900], marginBottom: designSystem.spacing.md }}>
            Counter-Offers Awaiting You
          </h2>
          <OfferGroups offers={counteredSentOffers} onOfferUpdated={onOfferUpdated} />
        </section>
      )}

      {/* Active Deals — accepted offers mid handover/delivery */}
      {activeDealOffers.length > 0 && (
        <section>
          <h2 style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[900], marginBottom: designSystem.spacing.md }}>
            Active Deals
          </h2>
          <OfferGroups offers={activeDealOffers} onOfferUpdated={onOfferUpdated} />
        </section>
      )}

      {/* Waiting on Seller — offers you sent that haven't been responded to yet */}
      {pendingSentOffers.length > 0 && (
        <section>
          <h2 style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[900], marginBottom: designSystem.spacing.md }}>
            Waiting on Seller
          </h2>
          <OfferGroups offers={pendingSentOffers} onOfferUpdated={onOfferUpdated} />
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
            {purchases.map((purchase) => {
              const thumbnail = purchase.product?.images?.[0] ? getImageUrl(purchase.product.images[0]) : undefined
              return (
                <Link key={purchase.id} to={purchase.product?.id ? `/products/${purchase.product.id}` : '#'} style={{
                  background: 'white',
                  padding: designSystem.spacing.md,
                  borderRadius: designSystem.borderRadius.lg,
                  display: 'flex',
                  gap: designSystem.spacing.md,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: designSystem.shadows.sm,
                  textDecoration: 'none',
                  color: 'inherit'
                }}>
                  <div style={{ display: 'flex', gap: designSystem.spacing.md, alignItems: 'center', minWidth: 0 }}>
                    <div style={{ width: '56px', height: '56px', flexShrink: 0, borderRadius: designSystem.borderRadius.md, background: designSystem.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {thumbnail ? (
                        <img src={thumbnail} alt={purchase.product?.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Package size={24} color={designSystem.colors.neutral[400]} />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 'bold' }}>{purchase.product?.title || 'Unknown Item'}</div>
                      <div style={{ fontSize: '0.9rem', color: designSystem.colors.neutral[500] }}>
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: designSystem.colors.primary[500], flexShrink: 0 }}>
                    {formatPriceWithCurrency(purchase.amount, purchase.currency).primary}
                  </div>
                </Link>
              )
            })}
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
