import { useState } from 'react'
import '../styles/VoiceSearch.css'

const VoiceSearchButton = () => {
  const [showModal, setShowModal] = useState(false)

  const handleClick = () => {
    setShowModal(true)
    console.log('🎤 Voice search feature clicked - Coming soon!')
  }

  return (
    <>
      <button 
        className="voice-search-button"
        onClick={handleClick}
        aria-label="Voice search"
        title="Voice search (coming soon)"
      >
        🎤
      </button>

      {showModal && (
        <div className="voice-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="voice-modal" onClick={(e) => e.stopPropagation()}>
            <h2>🎤 Voice Search</h2>
            <p>Voice-powered search is coming soon!</p>
            <p className="feature-description">
              Soon you'll be able to search for products by speaking in English, Liberian Kreyol, or any language.
            </p>
            <button onClick={() => setShowModal(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default VoiceSearchButton
