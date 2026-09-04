import { useState, useEffect, useCallback } from 'react'
import { Search, Package, Ban, RotateCcw } from 'lucide-react'
import { getListings, Listing } from '../services/adminService'
import productService from '../services/productService'
import { formatPriceWithCurrency } from '../utils/currency'
import { getImageUrl } from '../utils/imageUtils'
import '../styles/SellerDashboard.css'

const STATUS_TABS: { value: Listing['status'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'sold', label: 'Sold' },
  { value: 'inactive', label: 'Inactive' }
]

const ListingImage = ({ images, title }: { images?: string[]; title?: string }) => {
  const [err, setErr] = useState(false)
  const src = images?.[0] ? getImageUrl(images[0]) : undefined
  const style: React.CSSProperties = {
    width: 44, height: 44, borderRadius: 8, objectFit: 'cover',
    border: '1px solid var(--color-border)', flexShrink: 0, display: 'block'
  }
  if (!src || err) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <Package size={18} color="#9ca3af" />
      </div>
    )
  }
  return <img src={src} alt={title || 'Product'} style={style} onError={() => setErr(true)} />
}

const AdminListings = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sellerSearch, setSellerSearch] = useState('')
  const [status, setStatus] = useState<Listing['status'] | 'all'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [count, setCount] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchListings = useCallback(async (targetPage: number, s: string, sellerS: string, st: Listing['status'] | 'all') => {
    try {
      setLoading(true)
      setError(null)
      const res = await getListings({ page: targetPage, limit: 20, search: s || undefined, sellerSearch: sellerS || undefined, status: st })
      setListings(res.data)
      setTotalPages(res.totalPages)
      setCount(res.count)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not load listings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
    fetchListings(1, search, sellerSearch, status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1)
      fetchListings(1, search, sellerSearch, status)
    }, 350)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sellerSearch])

  useEffect(() => {
    fetchListings(page, search, sellerSearch, status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const toggleActive = async (listing: Listing) => {
    setBusyId(listing.id)
    const nextStatus = listing.status === 'inactive' ? 'active' : 'inactive'
    try {
      await productService.updateProductStatus(listing.id, nextStatus)
      setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, status: nextStatus } : l)))
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not update listing')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Listings</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Every listing on the platform, across all sellers and statuses.
      </p>

      <div className="seller-section-card">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', padding: '1rem 1rem 0', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatus(tab.value)}
                className="btn-renew"
                style={{
                  background: status === tab.value ? '#111827' : undefined,
                  color: status === tab.value ? '#fff' : undefined
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.9rem', width: '100%' }}
            />
          </div>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by seller name/phone..."
              value={sellerSearch}
              onChange={(e) => setSellerSearch(e.target.value)}
              style={{ padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.9rem', width: '100%' }}
            />
          </div>
        </div>

        {error && (
          <div className="seller-empty-state">
            <p>{error}</p>
          </div>
        )}

        {!error && loading && (
          <div className="seller-empty-state">
            <p>Loading listings...</p>
          </div>
        )}

        {!error && !loading && listings.length === 0 && (
          <div className="seller-empty-state">
            <p>No listings match this filter.</p>
          </div>
        )}

        {!error && !loading && listings.length > 0 && (
          <>
            <div className="seller-table-wrap">
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Seller</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Listed</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <ListingImage images={l.images} title={l.title} />
                          <span style={{ fontWeight: 600, lineHeight: 1.3 }}>{l.title}</span>
                        </div>
                      </td>
                      <td>
                        {l.seller ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>{l.seller.name}</div>
                            {l.seller.phone && <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{l.seller.phone}</div>}
                            {!l.seller.isActive && <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>Suspended</div>}
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>Unknown</span>
                        )}
                      </td>
                      <td>{l.category?.name || '—'}</td>
                      <td>
                        <div className="price-main">{formatPriceWithCurrency(l.price).primary}</div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{l.status}</td>
                      <td>{l.views}</td>
                      <td style={{ color: '#6b7280' }}>{new Date(l.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn-renew"
                          disabled={busyId === l.id}
                          onClick={() => toggleActive(l)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}
                        >
                          {l.status === 'inactive' ? <RotateCcw size={14} /> : <Ban size={14} />}
                          {l.status === 'inactive' ? 'Reactivate' : 'Deactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{count} listing{count !== 1 ? 's' : ''}</span>
              {totalPages > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-renew">
                    Previous
                  </button>
                  <span style={{ alignSelf: 'center', fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn-renew">
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminListings
