import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import { useToast } from '../context/ToastContext'
import { compressImage } from '../utils/imageCompression'
import { getCountyByName } from '../data/liberianLocations'

interface Category {
  id: string
  name: string
  icon: string
}

interface CountyOption {
  id: string
  name: string
}

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
]

const AddProduct = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [counties, setCounties] = useState<CountyOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'LRD'>('USD')
  const [categoryId, setCategoryId] = useState('')
  const [condition, setCondition] = useState('good')
  const [location, setLocation] = useState('Monrovia')
  const [countyId, setCountyId] = useState('')
  const [countyName, setCountyName] = useState('')
  const [district, setDistrict] = useState('')
  const [landmark, setLandmark] = useState('')

  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    api.get('/categories')
      .then(res => { if (res.data.success) setCategories(res.data.data) })
      .catch(() => toast.error('Could not load categories'))
    api.get('/counties')
      .then(res => { if (res.data.success) setCounties(res.data.data) })
      .catch(() => toast.error('Could not load counties'))
  }, [])

  // District options come from the static Liberia location data, matched by
  // county name (the DB only stores counties, not their districts/cities).
  const districtOptions = countyName ? getCountyByName(countyName)?.cities || [] : []

  useEffect(() => {
    return () => { previews.forEach(url => URL.revokeObjectURL(url)) }
  }, [previews])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || [])
    const remaining = 5 - images.length
    if (remaining <= 0) {
      toast.warning('Maximum 5 photos already added')
      return
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const valid = incoming.slice(0, remaining).filter(f => {
      if (!allowed.includes(f.type)) {
        toast.error(`${f.name}: only JPEG, PNG or WebP allowed`)
        return false
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name}: max 10 MB`)
        return false
      }
      return true
    })

    if (!valid.length) return
    setLoading(true)
    try {
      const compressed = await Promise.all(valid.map(f => compressImage(f)))
      setImages(prev => [...prev, ...compressed])
      setPreviews(prev => [...prev, ...compressed.map(f => URL.createObjectURL(f))])
    } catch {
      toast.error('Failed to process images')
    } finally {
      setLoading(false)
      // Reset so the same file can be re-selected
      e.target.value = ''
    }
  }

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i])
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) return setError('Please enter a product title')
    if (!price || parseFloat(price) <= 0) return setError('Please enter a valid price')
    if (!categoryId) return setError('Please select a category')

    const data = new FormData()
    data.append('title', title.trim())
    data.append('price', price)
    data.append('currency', currency)
    data.append('category_id', categoryId)
    data.append('condition', condition)
    data.append('location', location.trim() || 'Monrovia')
    if (countyId) data.append('county_id', countyId)
    if (district) data.append('district', district)
    if (landmark.trim()) data.append('landmark', landmark.trim())
    images.forEach(img => data.append('images', img))

    setLoading(true)
    try {
      const res = await api.post('/products', data)
      if (res.data.success) {
        toast.success('Product listed!')
        navigate('/my-products')
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to post product'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <HamburgerMenu />

      <div style={styles.content}>
        <h1 style={styles.heading}>Sell Something</h1>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* ── Photos ── */}
          <section style={styles.section}>
            <label style={styles.label}>Photos</label>

            <div style={styles.photoRow}>
              {previews.map((src, i) => (
                <div key={i} style={styles.thumb}>
                  <img src={src} alt="" style={styles.thumbImg} />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    style={styles.removeBtn}
                    aria-label="Remove photo"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={styles.addPhotoBtn}
                  disabled={loading}
                >
                  <span style={styles.addPhotoIcon}>+</span>
                  <span style={styles.addPhotoText}>
                    {images.length === 0 ? 'Add Photo' : 'More'}
                  </span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <p style={styles.hint}>Up to 5 photos · JPEG, PNG or WebP</p>
          </section>

          {/* ── Title ── */}
          <section style={styles.section}>
            <label htmlFor="title" style={styles.label}>What are you selling? *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Samsung TV 43-inch"
              style={styles.input}
              autoComplete="off"
              maxLength={200}
              required
            />
          </section>

          {/* ── Price ── */}
          <section style={styles.section}>
            <label htmlFor="price" style={styles.label}>Price *</label>
            <div style={styles.priceRow}>
              <span style={styles.currencySymbol}>{currency === 'USD' ? '$' : 'L$'}</span>
              <input
                id="price"
                type="number"
                inputMode="decimal"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                style={{ ...styles.input, paddingLeft: '2.75rem', marginBottom: 0 }}
                required
              />
            </div>
            <div style={styles.pills}>
              {(['USD', 'LRD'] as const).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  style={{ ...styles.pill, ...(currency === c ? styles.pillActive : {}) }}
                >
                  {c}
                </button>
              ))}
            </div>
          </section>

          {/* ── Category ── */}
          <section style={styles.section}>
            <label htmlFor="category" style={styles.label}>Category *</label>
            <select
              id="category"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              style={styles.input}
              required
            >
              <option value="">Choose a category…</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </section>

          {/* ── Condition ── */}
          <section style={styles.section}>
            <label style={styles.label}>Condition</label>
            <div style={styles.pills}>
              {CONDITIONS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCondition(c.value)}
                  style={{
                    ...styles.pill,
                    ...(condition === c.value ? styles.pillActive : {})
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          {/* ── Location ── */}
          <section style={styles.section}>
            <label htmlFor="location" style={styles.label}>Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Monrovia, Paynesville…"
              style={styles.input}
              maxLength={100}
            />
          </section>

          {/* ── County ── */}
          <section style={styles.section}>
            <label htmlFor="county" style={styles.label}>County</label>
            <select
              id="county"
              value={countyId}
              onChange={e => {
                const selected = counties.find(c => c.id === e.target.value)
                setCountyId(e.target.value)
                setCountyName(selected?.name || '')
                setDistrict('')
              }}
              style={styles.input}
            >
              <option value="">Choose a county…</option>
              {counties.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </section>

          {/* ── District / Area ── */}
          {districtOptions.length > 0 && (
            <section style={styles.section}>
              <label htmlFor="district" style={styles.label}>District / Area</label>
              <select
                id="district"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                style={styles.input}
              >
                <option value="">Choose a district/area…</option>
                {districtOptions.map(city => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>
            </section>
          )}

          {/* ── Landmark ── */}
          <section style={styles.section}>
            <label htmlFor="landmark" style={styles.label}>Nearby Landmark</label>
            <input
              id="landmark"
              type="text"
              value={landmark}
              onChange={e => setLandmark(e.target.value)}
              placeholder="e.g. Near Total Gas Station, 12th Street"
              style={styles.input}
              maxLength={200}
            />
          </section>

          {/* ── Actions ── */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Posting…' : 'Post Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f5f6fa',
    padding: '5rem 1rem 3rem',
  },
  content: {
    maxWidth: 480,
    margin: '0 auto',
  },
  heading: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '1.25rem',
    textAlign: 'center',
  },
  errorBanner: {
    background: '#fee2e2',
    color: '#b91c1c',
    borderRadius: 10,
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  form: {
    background: '#fff',
    borderRadius: 16,
    padding: '1.5rem',
    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    fontSize: '1rem',
    color: '#111827',
    background: '#fafafa',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  hint: {
    fontSize: '0.78rem',
    color: '#9ca3af',
    margin: 0,
  },
  /* Photos */
  photoRow: {
    display: 'flex',
    gap: '0.6rem',
    flexWrap: 'wrap',
  },
  thumb: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    border: '1.5px solid #e5e7eb',
    flexShrink: 0,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 22,
    height: 22,
    background: 'rgba(220,38,38,0.88)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    fontSize: '0.7rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    border: '1.5px dashed #d1d5db',
    background: '#f9fafb',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flexShrink: 0,
    transition: 'border-color 0.15s, background 0.15s',
  },
  addPhotoIcon: {
    fontSize: '1.6rem',
    color: '#9ca3af',
    lineHeight: 1,
  },
  addPhotoText: {
    fontSize: '0.7rem',
    color: '#9ca3af',
  },
  /* Price */
  priceRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  currencySymbol: {
    position: 'absolute',
    left: '1rem',
    fontSize: '1rem',
    color: '#6b7280',
    pointerEvents: 'none',
    zIndex: 1,
  },
  /* Condition pills */
  pills: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  pill: {
    padding: '0.45rem 1rem',
    borderRadius: 20,
    border: '1.5px solid #e5e7eb',
    background: '#f9fafb',
    color: '#374151',
    fontSize: '0.88rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  pillActive: {
    background: '#00205B',
    borderColor: '#00205B',
    color: '#fff',
  },
  /* Actions */
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  cancelBtn: {
    flex: 1,
    padding: '0.85rem',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    background: '#fff',
    color: '#374151',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 2,
    padding: '0.85rem',
    border: 'none',
    borderRadius: 10,
    background: '#00205B',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
}

export default AddProduct
