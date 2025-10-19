import { useState, useRef } from 'react'
import { startListening, speakPrompt, speakThenListen, stopSpeaking, getDefaultLang } from '../utils/voiceAssistant'

const VoiceInput = ({
  value,
  onChange,
  placeholder = '',
  label = '',
  helpText = '',
  multiline = false,
  rows = 3,
  required = false,
  onFocus
}: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false)
  const [stopFn, setStopFn] = useState<(() => void) | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const abortedRef = useRef(false) // track cancel while TTS in progress

  const handleVoiceInput = async () => {
    if (isListening && stopFn) {
      // cancel listening
      stopFn()
      setIsListening(false)
      setStopFn(null)
      return
    }

    // Speak the label to guide user and then start recognition when speech ends
    try {
      abortedRef.current = false
      setIsSpeaking(true) // show speaking indicator while TTS plays
      const prompt = label ? `Please say the ${label}` : 'Please speak now'
      // speakThenListen will return the stop function for recognition
      const stop = await speakThenListen(
        prompt,
        (text) => {
          onChange(text)
          setIsListening(false)
          setStopFn(null)
          // short confirmation
          speakPrompt('successShort')
        },
        (error) => {
          speakPrompt('errorShort')
          setIsListening(false)
          setStopFn(null)
        },
        getDefaultLang()
      )

      // If user cancelled during speaking, immediately stop returned recognition and don't set listening
      if (abortedRef.current) {
        try { stop && stop() } catch (err) { /*noop*/ }
        setIsSpeaking(false)
        setIsListening(false)
        setStopFn(null)
        abortedRef.current = false
        return
      }

      // recognition started; keep track so we can stop later
      setStopFn(() => stop)
      setIsListening(true)
    } catch (err) {
      console.error('Voice input failed:', err)
      speakPrompt('errorShort')
    } finally {
      // TTS finished; hide speaking indicator. (Recognition may have started.)
      setIsSpeaking(false)
    }
  }

  const handleReadBack = () => {
    if (value) {
      speak(`${label || 'Current value'}: ${value}`)
    } else {
      speak('No text entered yet')
    }
  }

  const handleCancel = () => {
     // Called when user presses Cancel during speaking or listening
     abortedRef.current = true
     stopSpeaking()
     if (stopFn) {
       try { stopFn() } catch (err) { /* noop */ }
       setStopFn(null)
     }
     setIsSpeaking(false)
     setIsListening(false)
   }

  const InputElement = multiline ? 'textarea' : 'input'

  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      {/* Label with voice help button */}
      {label && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-sm)'
        }}>
          <label style={{
            fontWeight: 'bold',
            fontSize: 'var(--font-size-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)'
          }}>
            {label}
            {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
          </label>

          {/* Read label button */}
          {helpText && (
            <button
              type="button"
              onClick={() => speak(helpText)}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              aria-label="Help"
            >
              ❓ Help
            </button>
          )}
        </div>
      )}

      {/* Input container with voice buttons */}
      <div style={{ position: 'relative' }}>
        <InputElement
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          onFocus={() => {
            onFocus?.()
          }}
          placeholder={placeholder}
          rows={multiline ? rows : undefined}
          className="form-input"
          aria-label={label || placeholder}
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            paddingRight: '100px',
            fontSize: 'var(--font-size-lg)',
            minHeight: multiline ? '100px' : '56px',
            resize: multiline ? 'vertical' : 'none'
          }}
        />

        {/* Voice buttons */}
        <div style={{
          position: 'absolute',
          right: '8px',
          top: '8px',
          display: 'flex',
          gap: '8px',
          flexDirection: 'column'
        }}>
          <button
            type="button"
            onClick={handleVoiceInput}
            style={{
              width: '40px',
              height: '40px',
              background: isListening ? '#25D366' : 'var(--color-primary)',
              border: 'none',
              borderRadius: '50%',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              boxShadow: 'var(--shadow-md)',
              animation: isListening ? 'pulse 1s infinite' : 'none'
            }}
            title={isListening ? 'Stop listening' : 'Speak to type'}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            {isListening ? '🔴' : '🎤'}
          </button>

          {value && (
            <button
              type="button"
              onClick={handleReadBack}
              style={{
                width: '40px',
                height: '40px',
                background: 'var(--color-secondary)',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                boxShadow: 'var(--shadow-md)'
              }}
              title="Read what you typed"
              aria-label="Read back text"
            >
              🔉
            </button>
          )}
        </div>
      </div>

      {/* Cancel button visible during speaking or listening */}
      {(isSpeaking || isListening) && (
        <div style={{ marginTop: '8px' }}>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Cancel voice"
            style={{
              padding: '8px 12px',
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              color: '#721c24',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            ✖ Cancel
          </button>
        </div>
      )}

      {/* Speaking indicator */}
      {isSpeaking && (
        <div style={{
          marginTop: 'var(--space-sm)',
          padding: '8px 10px',
          backgroundColor: '#fff8e1',
          border: '1px solid #ffd54f',
          borderRadius: '8px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.95rem'
        }} role="status" aria-live="polite">
          <span>🗣️</span>
          <strong>Speaking...</strong>
        </div>
      )}

      {/* Visual listening indicator */}
      {isListening && (
        <div style={{
          marginTop: 'var(--space-sm)',
          padding: 'var(--space-md)',
          backgroundColor: '#e8f5e9',
          border: '2px solid #4caf50',
          borderRadius: 'var(--border-radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          fontSize: 'var(--font-size-lg)'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎤</span>
          <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>
            Listening... Speak now!
          </span>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>
    </div>
  )
}

export default VoiceInput
