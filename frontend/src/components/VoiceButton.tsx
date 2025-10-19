import { useState } from 'react'
import { speak, stopSpeaking } from '../utils/voiceAssistant'

interface VoiceButtonProps {
  text: string
  size?: 'small' | 'medium' | 'large'
  ariaLabel?: string
}

/**
 * Voice Button - Read text aloud for illiterate users
 * Simple, large, visual button with speaker icon
 */
const VoiceButton = ({ text, size = 'medium', ariaLabel }: VoiceButtonProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleClick = () => {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
    } else {
      setIsSpeaking(true)
      speak(text)

      // Auto-reset after speech ends
      setTimeout(() => {
        setIsSpeaking(false)
      }, text.length * 50) // Rough estimate of speech duration
    }
  }

  const sizes = {
    small: { width: '32px', height: '32px', fontSize: '1rem' },
    medium: { width: '40px', height: '40px', fontSize: '1.3rem' },
    large: { width: '56px', height: '56px', fontSize: '1.8rem' }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={ariaLabel || 'Listen to this'}
      title="Tap to hear"
      style={{
        ...sizes[size],
        background: isSpeaking ? '#25D366' : 'var(--color-primary)',
        border: 'none',
        borderRadius: '50%',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-md)',
        transition: 'all 0.2s ease',
        animation: isSpeaking ? 'pulse 1s infinite' : 'none'
      }}
    >
      {isSpeaking ? '🔊' : '🔉'}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>
    </button>
  )
}

export default VoiceButton
