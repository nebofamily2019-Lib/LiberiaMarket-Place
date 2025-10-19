import { useState, useEffect, useRef } from 'react'
import { speakThenListen, speakPrompt, getDefaultLang, stopSpeaking } from '../utils/voiceAssistant'
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
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [stopFn, setStopFn] = useState<(() => void) | null>(null)
  const { isAuthenticated, logout } = useAuth()
  const abortedRef = useRef(false)

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setVoiceSupported(!!SpeechRecognition)
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const startVoiceSearch = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    try {
      abortedRef.current = false
      setIsSpeaking(true)
      const stop = await speakThenListen(
        'Please say your search query',
        (transcript: string) => {
          setSearchQuery(transcript)
          onSearch?.(transcript)
        },
        (error: any) => {
          console.error('Voice search error:', error)
          speakPrompt('errorShort')
          setIsListening(false)
        },
        getDefaultLang()
      )

      // If user cancelled while TTS was playing, stop recognition immediately and do not enter listening state
      if (abortedRef.current) {
        try { stop && stop() } catch (err) { /* noop */ }
        setIsSpeaking(false)
        setIsListening(false)
        setStopFn(null)
        abortedRef.current = false
        return
      }

      setIsSpeaking(false)
      setIsListening(true)
      setStopFn(() => stop)
    } catch (err) {
      console.error('Voice search failed to start', err)
      speakPrompt('errorShort')
      setIsSpeaking(false)
    }
  }

  const handleCancel = () => {
    // Abort both TTS and STT
    abortedRef.current = true
    stopSpeaking()
    if (stopFn) {
      try { stopFn() } catch (err) { /* noop */ }
      setStopFn(null)
    }
    setIsSpeaking(false)
    setIsListening(false)
  }

  // Simple logout: call backend then clear client token/user and redirect
  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      // best-effort: still navigate
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
          style={{ paddingRight: voiceSupported ? '60px' : '16px' }}
        />

        {/* Voice Search Button */}
        {voiceSupported && (
          <button
            type="button"
            onClick={startVoiceSearch}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: isListening ? '#25D366' : 'transparent',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              fontSize: '1.5rem',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            aria-label="Voice search"
            title="Speak to search"
          >
            {isListening ? '🔴' : '🎤'}
          </button>
        )}

        {/* Speaking indicator */}
        {isSpeaking && (
          <span style={{ position: 'absolute', right: voiceSupported ? '72px' : '12px', top: '50%', transform: 'translateY(-50%)', background: '#fff8e1', padding: '6px 8px', borderRadius: 8, border: '1px solid #ffd54f', fontSize: '0.85rem' }} role="status" aria-live="polite">
            🗣️ Speaking...
          </span>
        )}

        {/* Cancel control visible while speaking or listening */}
        {(isSpeaking || isListening) && (
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Cancel voice"
            style={{
              position: 'absolute',
              right: voiceSupported ? '150px' : '72px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              color: '#721c24',
              padding: '6px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            ✖ Cancel
          </button>
        )}

        {/* Logout button (visible when authenticated) */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
            style={{
              position: 'absolute',
              left: '12px',
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
