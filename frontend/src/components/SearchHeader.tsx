import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * SearchHeader Component
 * - Sticky search bar at top of page
 * - Voice search for illiterate users
 * - Large touch target for mobile
 */

interface SearchHeaderProps {
  onSearch?: (query: string) => void
  placeholder?: string
}

const SearchHeader = ({ onSearch, placeholder = 'Search marketplace...' }: SearchHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated, logout } = useAuth()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      window.location.href = '/login'
    }
  }

  return (
    <div className="search-header">
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <input
          type="search"
          className="search-input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search products"
        />

        {/* Logout button (visible when authenticated) */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#fff',
              border: '1px solid #ddd',
              padding: '6px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Logout
          </button>
        )}
      </form>
    </div>
  )
}

export default SearchHeader
