import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { designSystem } from '../../styles/designSystem'
import { formatPriceWithCurrency } from '../../utils/currency'
import { getImageUrl } from '../../utils/imageUtils'
import OfferCard from '../OfferCard'
import { Offer } from '../../services/offerService'

interface Product {
  id: string
  title: string
  price: number
  status: string
  currency?: string
  images?: string[]
}

interface SellerStats {
  myProducts: number
  activeProducts: number
  pendingProducts: number
  soldProducts: number
  pendingOffers: number
}

interface SellerOverviewProps {
  activeProducts: Product[]
  soldProducts: Product[]
  pendingOffers: Offer[]
  activeDealOffers: Offer[]
  onOfferUpdated?: () => void
  stats?: SellerStats
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending: 'Pending Review',
  sold: 'Sold',
  inactive: 'Inactive'
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

const ProductGrid = ({ products, emptyMessage }: { products: Product[], emptyMessage: React.ReactNode }) => {
  if (products.length === 0) {
    return (
      <div style={{
        padding: designSystem.spacing.xl,
        background: 'white',
        borderRadius: designSystem.borderRadius.lg,
        textAlign: 'center',
        color: designSystem.colors.neutral[500]
      }}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: designSystem.spacing.md }}>
      {products.map((product) => {
        const thumbnail = product.images?.[0] ? getImageUrl(product.images[0]) : undefined
        return (
          <Link key={product.id} to={`/products/${product.id}`} style={{
            background: 'white',
            borderRadius: designSystem.borderRadius.lg,
            overflow: 'hidden',
            boxShadow: designSystem.shadows.sm,
            border: `1px solid ${designSystem.colors.neutral[200]}`,
            textDecoration: 'none',
            color: 'inherit',
            display: 'block'
          }}>
            <div style={{ width: '100%', aspectRatio: '4 / 3', background: designSystem.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {thumbnail ? (
                <img src={thumbnail} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Package size={32} color={designSystem.colors.neutral[400]} />
              )}
            </div>
            <div style={{ padding: designSystem.spacing.md }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{product.title}</div>
              <div style={{ color: designSystem.colors.secondary[500], fontWeight: 'bold' }}>
                {formatPriceWithCurrency(product.price, product.currency).primary}
                <span style={{ fontSize: '0.8em', color: designSystem.colors.neutral[500], fontWeight: 'normal', marginLeft: '4px' }}>
                  {formatPriceWithCurrency(product.price, product.currency).secondary}
                </span>
              </div>
              <div className={`product-status status-${product.status}`} style={{ marginTop: '8px', display: 'inline-block' }}>
                {STATUS_LABELS[product.status] || product.status}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

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
                viewType='seller'
                onOfferUpdated={onOfferUpdated}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const SellerOverview = ({ activeProducts, soldProducts, pendingOffers, activeDealOffers, onOfferUpdated, stats }: SellerOverviewProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: designSystem.spacing.xl }}>

      {/* Seller Stats */}
      {stats && (
        <div className='stats-grid'>
          <div className={`stat-card ${stats.pendingOffers > 0 ? 'clickable' : ''}`}>
            <div className='stat-icon' style={stats.pendingOffers > 0 ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' } : undefined}>
              {stats.pendingOffers > 0 ? '🔔' : '📬'}
            </div>
            <div className='stat-info'>
              <h3>{stats.pendingOffers}</h3>
              <p>{stats.pendingOffers === 1 ? 'Offer Awaiting Your Response' : 'Offers Awaiting Your Response'}</p>
            </div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon'>📦</div>
            <div className='stat-info'>
              <h3>{stats.activeProducts}</h3>
              <p>Active Listings</p>
            </div>
          </div>
          <div className='stat-card'>
            <div className='stat-icon'>✅</div>
            <div className='stat-info'>
              <h3>{stats.soldProducts}</h3>
              <p>Items Sold</p>
            </div>
          </div>
        </div>
      )}

      {/* Offers Awaiting Your Response — matches the stat card above 1:1 */}
      {pendingOffers.length > 0 && (
        <section>
          <h2 style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[900], marginBottom: designSystem.spacing.md }}>
            Offers Awaiting Your Response
          </h2>
          <OfferGroups offers={pendingOffers} onOfferUpdated={onOfferUpdated} />
        </section>
      )}

      {/* Active Deals — accepted offers mid handover/delivery, not "awaiting response" but still need action */}
      {activeDealOffers.length > 0 && (
        <section>
          <h2 style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[900], marginBottom: designSystem.spacing.md }}>
            Active Deals
          </h2>
          <OfferGroups offers={activeDealOffers} onOfferUpdated={onOfferUpdated} />
        </section>
      )}

      {/* Active Listings — matches the stat card above 1:1 */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: designSystem.spacing.md }}>
          <h2 style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[900] }}>
            Active Listings
          </h2>
          <Link to='/my-products?status=active' style={{ color: designSystem.colors.primary[500], textDecoration: 'none' }}>
            Manage All
          </Link>
        </div>
        <ProductGrid
          products={activeProducts}
          emptyMessage={<>You haven't listed any products yet. <Link to='/products/add'>Start selling!</Link></>}
        />
      </section>

      {/* Items Sold — matches the stat card above 1:1 */}
      {soldProducts.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: designSystem.spacing.md }}>
            <h2 style={{ fontSize: designSystem.typography.fontSize.xl, color: designSystem.colors.neutral[900] }}>
              Items Sold
            </h2>
            <Link to='/my-products?status=sold' style={{ color: designSystem.colors.primary[500], textDecoration: 'none' }}>
              Manage All
            </Link>
          </div>
          <ProductGrid products={soldProducts} emptyMessage='No items sold yet.' />
        </section>
      )}
    </div>
  )
}

export default SellerOverview
