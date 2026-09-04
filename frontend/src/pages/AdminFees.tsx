import { useState, useEffect, useCallback } from 'react'
import { DollarSign, Package, TrendingUp, Search } from 'lucide-react'
import { getFeeSummary, getFeeCollections, FeeSummary, FeeRecord } from '../services/adminService'
import { formatPriceWithCurrency } from '../utils/currency'
import { getImageUrl } from '../utils/imageUtils'
import '../styles/SellerDashboard.css'

const GroupImage = ({ images, title }: { images?: string[]; title?: string }) => {
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

const PersonCell = ({ person }: { person: FeeRecord['seller'] }) => {
  if (!person) return <span style={{ color: '#9ca3af' }}>Unknown</span>
  return (
    <div>
      <div style={{ fontWeight: 600 }}>{person.name}</div>
      {person.phone && <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{person.phone}</div>}
    </div>
  )
}

const AdminFees = () => {
  const [summary, setSummary] = useState<FeeSummary | null>(null)
  const [records, setRecords] = useState<FeeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [count, setCount] = useState(0)

  const fetchSummary = useCallback(async () => {
    try {
      const data = await getFeeSummary()
      setSummary(data)
    } catch (err) {
      console.error('Error fetching fee summary:', err)
    }
  }, [])

  const fetchRecords = useCallback(async (targetPage: number, searchTerm: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await getFeeCollections({ page: targetPage, limit: 20, search: searchTerm || undefined })
      setRecords(res.data)
      setTotalPages(res.totalPages)
      setCount(res.count)
    } catch (err: any) {
      console.error('Error fetching fee collections:', err)
      setError(err.response?.data?.error || 'Could not load fee records')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1)
      fetchRecords(1, search)
    }, 350)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    fetchRecords(page, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Fee Collection</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Platform commission collected on every completed sale{summary ? ` (${(summary.feeRate * 100).toFixed(0)}% of sale price)` : ''}.
      </p>

      <div className="seller-stats-grid">
        <div className="seller-stat-card">
          <div className="seller-stat-label"><DollarSign size={16} /> Fees Collected</div>
          <div className="seller-stat-value">{formatPriceWithCurrency(summary?.totalFeesCollected || 0).primary}</div>
          <div className="seller-stat-secondary">{formatPriceWithCurrency(summary?.totalFeesCollected || 0).secondary}</div>
          <div className="seller-stat-desc">Total platform revenue</div>
        </div>
        <div className="seller-stat-card accent-blue">
          <div className="seller-stat-label"><TrendingUp size={16} /> Total Sales Value</div>
          <div className="seller-stat-value">{formatPriceWithCurrency(summary?.totalSoldValue || 0).primary}</div>
          <div className="seller-stat-desc">Gross value of all sold items</div>
        </div>
        <div className="seller-stat-card accent-red">
          <div className="seller-stat-label"><Package size={16} /> Items Sold</div>
          <div className="seller-stat-value">{summary?.totalItemsSold || 0}</div>
          <div className="seller-stat-desc">Paid out {formatPriceWithCurrency(summary?.totalPaidToSellers || 0).primary} to sellers</div>
        </div>
      </div>

      <div className="seller-section-card" style={{ marginTop: '1.25rem' }}>
        <div className="seller-section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h2>Fee Ledger</h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by item title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem 0.5rem 2rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '0.9rem',
                minWidth: '220px'
              }}
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
            <p>Loading fee records...</p>
          </div>
        )}

        {!error && !loading && records.length === 0 && (
          <div className="seller-empty-state">
            <p>No fees collected yet.</p>
            <p className="sub">Fees show up here as soon as items are sold.</p>
          </div>
        )}

        {!error && !loading && records.length > 0 && (
          <>
            <div className="seller-table-wrap">
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Seller</th>
                    <th>Buyer</th>
                    <th>Sale Price</th>
                    <th>Fee</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.product_id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <GroupImage images={r.images} title={r.title} />
                          <span style={{ fontWeight: 600, lineHeight: 1.3 }}>{r.title}</span>
                        </div>
                      </td>
                      <td><PersonCell person={r.seller} /></td>
                      <td><PersonCell person={r.buyer} /></td>
                      <td>
                        <div className="price-main">{formatPriceWithCurrency(r.sold_price).primary}</div>
                        <div className="price-sub">{formatPriceWithCurrency(r.sold_price).secondary}</div>
                      </td>
                      <td>
                        <div className="price-main" style={{ color: '#059669' }}>{formatPriceWithCurrency(r.platform_fee).primary}</div>
                      </td>
                      <td style={{ color: '#6b7280' }}>{r.sold_at ? new Date(r.sold_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{count} total sale{count !== 1 ? 's' : ''}</span>
              {totalPages > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="btn-renew"
                  >
                    Previous
                  </button>
                  <span style={{ alignSelf: 'center', fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="btn-renew"
                  >
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

export default AdminFees
