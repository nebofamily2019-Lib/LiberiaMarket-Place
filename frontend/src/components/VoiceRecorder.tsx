import { useState, useRef } from 'react'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, audioUrl: string) => void
  onRecordingDelete: () => void
  existingAudioUrl?: string
  label?: string
  helpText?: string
  maxDuration?: number // in seconds
}

/**
 * VoiceRecorder Component - Record audio descriptions for products
 * Perfect for illiterate sellers who can speak about their products
 */
const VoiceRecorder = ({
  onRecordingComplete,
  onRecordingDelete,
  existingAudioUrl,
  label = 'Product Voice Description',
  helpText = 'Record a voice description of your product (optional)',
  maxDuration = 120 // 2 minutes max
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState(existingAudioUrl || '')
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      setError('')
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Handle data collection
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Handle recording completion
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        onRecordingComplete(audioBlob, url)
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          
          // Auto-stop at max duration
          if (newTime >= maxDuration) {
            stopRecording()
          }
          
          return newTime
        })
      }, 1000)

    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Could not access microphone. Please allow microphone permission.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    setIsRecording(false)
    setIsPaused(false)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (newTime >= maxDuration) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)
    }
  }

  const deleteRecording = () => {
    setAudioUrl('')
    setRecordingTime(0)
    onRecordingDelete()
    
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="voice-recorder" style={{ marginBottom: '24px' }}>
      {/* Label */}
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontWeight: 'bold',
        fontSize: '1.1rem'
      }}>
        {label}
      </label>

      {/* Help Text */}
      <p style={{
        fontSize: '0.9rem',
        color: '#666',
        marginBottom: '16px',
        lineHeight: '1.4'
      }}>
        {helpText}
      </p>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Recording Controls */}
      {!audioUrl && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #ddd'
        }}>
          {/* Recording Status */}
          {isRecording && (
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              border: '2px solid #ffc107'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                {isPaused ? '⏸️' : '🔴'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d39e00' }}>
                {formatTime(recordingTime)} / {formatTime(maxDuration)}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#856404', marginTop: '4px' }}>
                {isPaused ? 'Recording paused' : 'Recording...'}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {!isRecording ? (
              <button
                onClick={startRecording}
                style={{
                  padding: '16px 24px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '160px',
                  justifyContent: 'center'
                }}
              >
                🎤 Start Recording
              </button>
            ) : (
              <>
                {!isPaused ? (
                  <button
                    onClick={pauseRecording}
                    style={{
                      padding: '12px 20px',
                      fontSize: '1rem',
                      backgroundColor: '#ffc107',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    ⏸️ Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    style={{
                      padding: '12px 20px',
                      fontSize: '1rem',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    ▶️ Resume
                  </button>
                )}

                <button
                  onClick={stopRecording}
                  style={{
                    padding: '12px 20px',
                    fontSize: '1rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  ⏹️ Stop
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Audio Playback */}
      {audioUrl && (
        <div style={{
          padding: '20px',
          backgroundColor: '#d4edda',
          borderRadius: '12px',
          border: '2px solid #28a745'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '2rem' }}>🎵</span>
              <div>
                <div style={{ fontWeight: 'bold', color: '#155724' }}>
                  Voice Description Recorded
                </div>
                <div style={{ fontSize: '0.9rem', color: '#155724' }}>
                  Duration: {formatTime(recordingTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={playAudio}
              style={{
                padding: '12px 20px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                backgroundColor: isPlaying ? '#ffc107' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>

            <button
              onClick={deleteRecording}
              style={{
                padding: '12px 20px',
                fontSize: '1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🗑️ Delete
            </button>

            <button
              onClick={startRecording}
              style={{
                padding: '12px 20px',
                fontSize: '1rem',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🎤 Record New
            </button>
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={audioUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  )
}

export default VoiceRecorder