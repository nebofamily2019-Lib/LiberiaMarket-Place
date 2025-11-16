import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import jobService, { CreateJobData } from '../services/jobService'
import VoiceButton from '../components/VoiceButton'

const PostJob = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    description: '',
    category: '',
    location: '',
    jobType: 'full-time',
    salary: '',
    contactPhone: '',
    contactEmail: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a job title')
      return
    }
    if (!formData.description.trim()) {
      setError('Please enter a job description')
      return
    }
    if (!formData.location.trim()) {
      setError('Please enter a location')
      return
    }
    if (!formData.contactPhone.trim()) {
      setError('Please enter a contact phone number')
      return
    }

    try {
      setLoading(true)
      await jobService.createJob(formData)
      navigate('/jobs')
    } catch (err: any) {
      setError(err.message || 'Failed to post job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-sm)' }}>
          Post a Job 💼
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
          Fill out the details below to post your job listing
        </p>
      </div>

      {/* Form */}
      <div className="card" style={{ padding: 'var(--space-xl)' }}>
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: 'var(--space-md)',
                marginBottom: 'var(--space-lg)',
                backgroundColor: '#fee',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-error)'
              }}
            >
              {error}
            </div>
          )}

          {/* Job Title */}
          <div className="form-group">
            <label className="form-label">
              Job Title *
              <VoiceButton
                text="Enter the job title"
                size="small"
                ariaLabel="Listen to job title instructions"
              />
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Sales Associate, Driver, Cashier"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Job Description */}
          <div className="form-group">
            <label className="form-label">
              Job Description *
              <VoiceButton
                text="Describe the job responsibilities and requirements"
                size="small"
                ariaLabel="Listen to description instructions"
              />
            </label>
            <textarea
              className="form-input"
              rows={6}
              placeholder="Describe the job responsibilities, requirements, and qualifications..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Job Type */}
          <div className="form-group">
            <label className="form-label">Job Type *</label>
            <select
              className="form-input"
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value as any })}
              required
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
              <option value="gig">Gig</option>
            </select>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Retail, Transportation, Hospitality"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Monrovia, Paynesville, Buchanan"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          {/* Salary */}
          <div className="form-group">
            <label className="form-label">Salary (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., L$500-1000/month, Negotiable"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
          </div>

          {/* Contact Phone */}
          <div className="form-group">
            <label className="form-label">Contact Phone *</label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g., 0770123456"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              required
            />
          </div>

          {/* Contact Email */}
          <div className="form-group">
            <label className="form-label">Contact Email (Optional)</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g., jobs@example.com"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/jobs')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostJob
