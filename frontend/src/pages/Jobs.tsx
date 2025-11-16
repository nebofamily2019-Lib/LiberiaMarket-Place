import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import jobService, { Job, JobFilters } from '../services/jobService'
import VoiceButton from '../components/VoiceButton'

const Jobs = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    limit: 12,
    status: 'active'
  })
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState<'browse' | 'my-jobs'>('browse')

  useEffect(() => {
    fetchJobs()
  }, [filters, activeTab])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      if (activeTab === 'browse') {
        const response = await jobService.getJobs(filters)
        setJobs(response.data)
        setTotalPages(response.pagination.pages)
      } else if (activeTab === 'my-jobs' && user?.id) {
        const response = await jobService.getUserJobs(user.id, filters.page, filters.limit)
        setJobs(response.data)
        setTotalPages(response.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const jobTypeColors: Record<string, string> = {
    'full-time': '#007bff',
    'part-time': '#28a745',
    'contract': '#ffc107',
    'temporary': '#17a2b8',
    'gig': '#6f42c1'
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-sm)' }}>
            Jobs 💼
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
            Post or find job opportunities in Liberia
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/post-job" className="btn btn-primary">
            ➕ Post Job
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', borderBottom: '2px solid var(--color-border)' }}>
        <button
          onClick={() => setActiveTab('browse')}
          style={{
            padding: 'var(--space-md) var(--space-xl)',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'browse' ? '3px solid var(--color-primary)' : 'none',
            color: activeTab === 'browse' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'browse' ? 'bold' : 'normal',
            fontSize: 'var(--font-size-lg)',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          Browse Jobs
        </button>
        {isAuthenticated && (
          <button
            onClick={() => setActiveTab('my-jobs')}
            style={{
              padding: 'var(--space-md) var(--space-xl)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'my-jobs' ? '3px solid var(--color-primary)' : 'none',
              color: activeTab === 'my-jobs' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'my-jobs' ? 'bold' : 'normal',
              fontSize: 'var(--font-size-lg)',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            My Job Postings
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
              Job Type
            </label>
            <select
              className="form-input"
              value={filters.jobType || ''}
              onChange={(e) => setFilters({ ...filters, jobType: e.target.value || undefined, page: 1 })}
            >
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
              <option value="gig">Gig</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
              Location
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter location"
              value={filters.location || ''}
              onChange={(e) => setFilters({ ...filters, location: e.target.value || undefined, page: 1 })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
              Category
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter category"
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined, page: 1 })}
            />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
          <p>Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>💼</div>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>No jobs found</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
            {activeTab === 'my-jobs' ? 'You haven\'t posted any jobs yet.' : 'No jobs match your filters.'}
          </p>
          {isAuthenticated && activeTab === 'my-jobs' && (
            <Link to="/post-job" className="btn btn-primary">
              Post Your First Job
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              className="card"
              style={{
                padding: 'var(--space-xl)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => navigate(`/jobs/${job.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-md)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', margin: 0 }}>
                      {job.title}
                    </h3>
                    <VoiceButton
                      text={`Job: ${job.title}. Type: ${job.jobType}. Location: ${job.location}. ${job.description}`}
                      size="small"
                      ariaLabel={`Listen to ${job.title}`}
                    />
                  </div>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'bold',
                      backgroundColor: jobTypeColors[job.jobType] || '#6c757d',
                      color: 'white'
                    }}
                  >
                    {job.jobType}
                  </span>
                  {job.status !== 'active' && (
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'bold',
                        backgroundColor: job.status === 'filled' ? '#28a745' : '#6c757d',
                        color: 'white'
                      }}
                    >
                      {job.status}
                    </span>
                  )}
                </div>
              </div>

              <p style={{ fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-md)', color: 'var(--color-text-primary)' }}>
                {job.description.length > 150 ? `${job.description.substring(0, 150)}...` : job.description}
              </p>

              <div style={{ display: 'flex', gap: 'var(--space-xl)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                <div>📍 {job.location}</div>
                {job.category && <div>🏷️ {job.category}</div>}
                {job.salary && <div>💰 {job.salary}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
          <button
            className="btn btn-secondary"
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
          >
            Previous
          </button>
          <span style={{ padding: 'var(--space-md)', alignSelf: 'center' }}>
            Page {filters.page} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={filters.page === totalPages}
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Jobs
