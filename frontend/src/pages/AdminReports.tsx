import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, User, Package, Ban, CheckCircle2, XCircle } from 'lucide-react'
import {
  getReports,
  updateReportStatus,
  suspendUser,
  reactivateUser,
  Report,
  ReportStatus
} from '../services/adminService'
import productService from '../services/productService'
import { getImageUrl } from '../utils/imageUtils'
import '../styles/SellerDashboard.css'

const STATUS_TABS: { value: ReportStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'all', label: 'All' }
]

const REASON_LABELS: Record<string, string> = {
  scam: 'Scam',
  harassment: 'Harassment',
  inappropriate_content: 'Inappropriate content',
  counterfeit: 'Counterfeit',
  other: 'Other'
}

const AdminReports = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [count, setCount] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchReports = useCallback(async (targetPage: number, status: ReportStatus | 'all') => {
    try {
      setLoading(true)
      setError(null)
      const res = await getReports({ page: targetPage, limit: 20, status })
      setReports(res.data)
      setTotalPages(res.totalPages)
      setCount(res.count)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not load reports')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
    fetchReports(1, statusFilter)
  }, [statusFilter, fetchReports])

  useEffect(() => {
    fetchReports(page, statusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const applyStatus = async (report: Report, status: ReportStatus) => {
    setBusyId(report.id)
    try {
      await updateReportStatus(report.id, status)
      setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status } : r)))
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not update report')
    } finally {
      setBusyId(null)
    }
  }

  const toggleUserSuspension = async (report: Report) => {
    if (!report.reportedUser) return
    setBusyId(report.id)
    try {
      if (report.reportedUser.isActive) {
        await suspendUser(report.reportedUser.id)
      } else {
        await reactivateUser(report.reportedUser.id)
      }
      setReports((prev) =>
        prev.map((r) =>
          r.reportedUser && r.reportedUser.id === report.reportedUser!.id
            ? { ...r, reportedUser: { ...r.reportedUser!, isActive: !r.reportedUser!.isActive } }
            : r
        )
      )
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not update user')
    } finally {
      setBusyId(null)
    }
  }

  const deactivateListing = async (report: Report) => {
    if (!report.product) return
    setBusyId(report.id)
    try {
      await productService.updateProductStatus(report.product.id, 'inactive')
      setReports((prev) =>
        prev.map((r) =>
          r.product && r.product.id === report.product!.id
            ? { ...r, product: { ...r.product!, status: 'inactive' } }
            : r
        )
      )
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not update listing')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Reports</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Reports submitted by buyers and sellers about listings or accounts.
      </p>

      <div className="seller-section-card">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '1rem 1rem 0' }}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className="btn-renew"
              style={{
                background: statusFilter === tab.value ? '#111827' : undefined,
                color: statusFilter === tab.value ? '#fff' : undefined
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="seller-empty-state">
            <p>{error}</p>
          </div>
        )}

        {!error && loading && (
          <div className="seller-empty-state">
            <p>Loading reports...</p>
          </div>
        )}

        {!error && !loading && reports.length === 0 && (
          <div className="seller-empty-state">
            <p>No reports here.</p>
            <p className="sub">Nothing has been flagged in this category.</p>
          </div>
        )}

        {!error && !loading && reports.length > 0 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
              {reports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    border: '1px solid var(--color-border, #e5e7eb)',
                    borderRadius: 10,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={16} color="#d97706" />
                      <strong>{REASON_LABELS[report.reason] || report.reason}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.6rem',
                        borderRadius: 999,
                        background: '#f3f4f6',
                        textTransform: 'capitalize'
                      }}
                    >
                      {report.status}
                    </span>
                  </div>

                  {report.description && (
                    <p style={{ margin: 0, color: '#374151', fontSize: '0.9rem' }}>{report.description}</p>
                  )}

                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    Reported by {report.reporter?.name || 'Unknown'}
                    {report.reporter?.phone ? ` (${report.reporter.phone})` : ''}
                  </div>

                  {report.reportedUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f9fafb', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                      <User size={16} color="#6b7280" />
                      <span style={{ flex: 1, fontSize: '0.9rem' }}>
                        {report.reportedUser.name} {report.reportedUser.phone ? `· ${report.reportedUser.phone}` : ''}
                        {!report.reportedUser.isActive && (
                          <span style={{ marginLeft: '0.5rem', color: '#dc2626', fontWeight: 700 }}>Suspended</span>
                        )}
                      </span>
                      <button
                        className="btn-renew"
                        disabled={busyId === report.id}
                        onClick={() => toggleUserSuspension(report)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Ban size={14} />
                        {report.reportedUser.isActive ? 'Suspend user' : 'Reactivate user'}
                      </button>
                    </div>
                  )}

                  {report.product && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f9fafb', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                      {report.product.images?.[0] ? (
                        <img
                          src={getImageUrl(report.product.images[0])}
                          alt={report.product.title}
                          style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                        />
                      ) : (
                        <Package size={16} color="#6b7280" />
                      )}
                      <span style={{ flex: 1, fontSize: '0.9rem' }}>
                        {report.product.title}
                        <span style={{ marginLeft: '0.5rem', color: report.product.status === 'inactive' ? '#dc2626' : '#6b7280' }}>
                          ({report.product.status})
                        </span>
                      </span>
                      <button
                        className="btn-renew"
                        disabled={busyId === report.id || report.product.status === 'inactive'}
                        onClick={() => deactivateListing(report)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Ban size={14} />
                        {report.product.status === 'inactive' ? 'Deactivated' : 'Deactivate listing'}
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {report.status !== 'investigating' && (
                      <button className="btn-renew" disabled={busyId === report.id} onClick={() => applyStatus(report, 'investigating')}>
                        Investigating
                      </button>
                    )}
                    {report.status !== 'resolved' && (
                      <button
                        className="btn-renew"
                        disabled={busyId === report.id}
                        onClick={() => applyStatus(report, 'resolved')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <CheckCircle2 size={14} /> Mark resolved
                      </button>
                    )}
                    {report.status !== 'dismissed' && (
                      <button
                        className="btn-renew"
                        disabled={busyId === report.id}
                        onClick={() => applyStatus(report, 'dismissed')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <XCircle size={14} /> Dismiss
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 1rem 1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{count} report{count !== 1 ? 's' : ''}</span>
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

export default AdminReports
