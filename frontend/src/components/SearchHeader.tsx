import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { speakThenListen } from '../utils/voiceAssistant'

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
  const [isListening, setIsListening] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleVoiceSearch = async () => {
    setIsListening(true)
    try {
      await speakThenListen(
        "What are you looking for?",
        (text) => {
          setSearchQuery(text)
          onSearch?.(text)
          setIsListening(false)
        }
      )
    } catch (e) {
      console.error(e)
      setIsListening(false)
    }
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
          style={{ paddingRight: isAuthenticated ? '150px' : '60px' }}
        />

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          style={{
            position: 'absolute',
            right: isAuthenticated ? '90px' : '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '4px',
            animation: isListening ? 'pulse 1.5s infinite' : 'none'
          }}
          aria-label="Voice Search"
          title="Search by voice"
        >
          {isListening ? '👂' : '🎤'}
        </button>

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
