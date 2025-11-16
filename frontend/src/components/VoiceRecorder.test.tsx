import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import VoiceRecorder from './VoiceRecorder'
import userEvent from '@testing-library/user-event'

// Mock MediaRecorder
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  state: 'inactive',
  stream: null,
  mimeType: 'audio/webm',
  audioBitsPerSecond: 0,
  videoBitsPerSecond: 0,
  onstart: null,
  onstop: null,
  ondataavailable: null,
  onpause: null,
  onresume: null,
  onerror: null,
}

// Mock getUserMedia
const mockGetUserMedia = vi.fn()

// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()

describe('VoiceRecorder', () => {
  let user: ReturnType<typeof userEvent.setup>
  
  // Helper function to trigger MediaRecorder events safely
  const triggerMediaRecorderEvent = (eventType: string, ...args: any[]) => {
    const callback = mockMediaRecorder.addEventListener.mock.calls
      .find(call => call[0] === eventType)?.[1]
    if (callback) callback(...args)
  }
  
  beforeEach(() => {
    user = userEvent.setup()
    
    // Setup MediaRecorder mock
    global.MediaRecorder = vi.fn(() => mockMediaRecorder) as any
    global.MediaRecorder.isTypeSupported = vi.fn(() => true)
    
    // Setup getUserMedia mock
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: mockGetUserMedia,
      },
    })
    
    // Setup URL mocks
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
    
    // Reset all mocks
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial render', () => {
    it('renders with default props', () => {
      render(
        <VoiceRecorder 
          onRecordingComplete={vi.fn()} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      expect(screen.getByText('🎤 Start Recording')).toBeInTheDocument()
      expect(screen.getByText('Record voice message')).toBeInTheDocument()
    })

    it('renders with custom label and help text', () => {
      render(
        <VoiceRecorder 
          onRecordingComplete={vi.fn()} 
          onRecordingDelete={vi.fn()}
          label="Custom Label"
          helpText="Custom help text"
        />
      )
      
      expect(screen.getByText('Custom Label')).toBeInTheDocument()
      expect(screen.getByText('Custom help text')).toBeInTheDocument()
    })

    it('shows proper initial state', () => {
      render(
        <VoiceRecorder 
          onRecordingComplete={vi.fn()} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      const recordButton = screen.getByText('🎤 Start Recording')
      expect(recordButton).toBeEnabled()
      expect(screen.queryByText('▶️ Play')).not.toBeInTheDocument()
      expect(screen.queryByText('🗑️ Delete')).not.toBeInTheDocument()
    })
  })

  describe('Recording functionality', () => {
    it('starts recording when start button is clicked', async () => {
      mockGetUserMedia.mockResolvedValueOnce(new MediaStream())
      
      render(
        <VoiceRecorder 
          onRecordingComplete={vi.fn()} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      const startButton = screen.getByText('🎤 Start Recording')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true })
        expect(mockMediaRecorder.start).toHaveBeenCalled()
      })
    })

    it('shows recording state correctly', async () => {
      mockGetUserMedia.mockResolvedValueOnce(new MediaStream())
      mockMediaRecorder.state = 'recording'
      
      render(
        <VoiceRecorder 
          onRecordingComplete={vi.fn()} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      const startButton = screen.getByText('🎤 Start Recording')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByText('🔴 Recording...')).toBeInTheDocument()
        expect(screen.getByText('⏹️ Stop')).toBeInTheDocument()
        expect(screen.getByText('⏸️ Pause')).toBeInTheDocument()
      })
    })

    it('handles microphone permission denial', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'))
      
      render(
        <VoiceRecorder 
          onRecordingComplete={vi.fn()} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      const startButton = screen.getByText('🎤 Start Recording')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByText(/microphone access/i)).toBeInTheDocument()
      })
    })

    it('updates timer during recording', async () => {
      mockGetUserMedia.mockResolvedValueOnce(new MediaStream())
      
      render(
        <VoiceRecorder 
          onRecordingComplete={vi.fn()} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      const startButton = screen.getByText('🎤 Start Recording')
      await user.click(startButton)
      
      // Timer should start at 00:00
      await waitFor(() => {
        expect(screen.getByText('00:00')).toBeInTheDocument()
      })
    })
  })

  describe('Playback functionality', () => {
    it('shows playback controls after recording', async () => {
      const onRecordingComplete = vi.fn()
      mockGetUserMedia.mockResolvedValueOnce(new MediaStream())
      
      render(
        <VoiceRecorder 
          onRecordingComplete={onRecordingComplete} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      // Start recording
      const startButton = screen.getByText('🎤 Start Recording')
      await user.click(startButton)
      
      // Simulate recording completion
      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' })
      const dataEvent = { data: mockBlob }
      
      // Trigger dataavailable event
      const dataCallback = mockMediaRecorder.addEventListener.mock.calls
        .find(call => call[0] === 'dataavailable')?.[1]
      if (dataCallback) dataCallback(dataEvent)
      
      // Stop recording
      mockMediaRecorder.state = 'inactive'
      const stopCallback = mockMediaRecorder.addEventListener.mock.calls
        .find(call => call[0] === 'stop')?.[1]
      if (stopCallback) stopCallback()
      
      await waitFor(() => {
        expect(screen.getByText('▶️ Play')).toBeInTheDocument()
        expect(screen.getByText('🗑️ Delete')).toBeInTheDocument()
        expect(onRecordingComplete).toHaveBeenCalledWith(mockBlob, 'blob:mock-url')
      })
    })

    it('handles play button click', async () => {
      const onRecordingComplete = vi.fn()
      mockGetUserMedia.mockResolvedValueOnce(new MediaStream())
      
      // Mock HTMLAudioElement
      const mockAudio = {
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        currentTime: 0,
        duration: 10,
        paused: true,
      }
      global.Audio = vi.fn(() => mockAudio) as any
      
      render(
        <VoiceRecorder 
          onRecordingComplete={onRecordingComplete} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      // Complete recording first
      const startButton = screen.getByText('🎤 Start Recording')
      await user.click(startButton)
      
      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' })
      const dataEvent = { data: mockBlob }
      mockMediaRecorder.addEventListener.mock.calls
        .find(call => call[0] === 'dataavailable')[1](dataEvent)
      mockMediaRecorder.state = 'inactive'
      mockMediaRecorder.addEventListener.mock.calls
        .find(call => call[0] === 'stop')[1]()
      
      await waitFor(() => {
        expect(screen.getByText('▶️ Play')).toBeInTheDocument()
      })
      
      // Click play
      const playButton = screen.getByText('▶️ Play')
      await user.click(playButton)
      
      expect(mockAudio.play).toHaveBeenCalled()
    })
  })

  describe('Delete functionality', () => {
    it('shows delete confirmation dialog', async () => {
      const onRecordingComplete = vi.fn()
      mockGetUserMedia.mockResolvedValueOnce(new MediaStream())
      
      render(
        <VoiceRecorder 
          onRecordingComplete={onRecordingComplete} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      // Complete recording first
      const startButton = screen.getByText('🎤 Start Recording')
      await user.click(startButton)
      
      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' })
      const dataEvent = { data: mockBlob }
      mockMediaRecorder.addEventListener.mock.calls
        .find(call => call[0] === 'dataavailable')[1](dataEvent)
      mockMediaRecorder.state = 'inactive'
      mockMediaRecorder.addEventListener.mock.calls
        .find(call => call[0] === 'stop')[1]()
      
      await waitFor(() => {
        expect(screen.getByText('🗑️ Delete')).toBeInTheDocument()
      })
      
      // Click delete
      const deleteButton = screen.getByText('🗑️ Delete')
      await user.click(deleteButton)
      
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
      expect(screen.getByText('Yes, delete')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('calls onRecordingDelete when confirmed', async () => {
      const onRecordingComplete = vi.fn()
      const onRecordingDelete = vi.fn()
      mockGetUserMedia.mockResolvedValueOnce(new MediaStream())
      
      render(
        <VoiceRecorder 
          onRecordingComplete={onRecordingComplete} 
          onRecordingDelete={onRecordingDelete} 
        />
      )
      
      // Complete recording and delete
      const startButton = screen.getByText('🎤 Start Recording')
      await user.click(startButton)
      
      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' })
      const dataEvent = { data: mockBlob }
      mockMediaRecorder.addEventListener.mock.calls
        .find(call => call[0] === 'dataavailable')[1](dataEvent)
      mockMediaRecorder.state = 'inactive'
      mockMediaRecorder.addEventListener.mock.calls
        .find(call => call[0] === 'stop')[1]()
      
      await waitFor(() => {
        expect(screen.getByText('🗑️ Delete')).toBeInTheDocument()
      })
      
      const deleteButton = screen.getByText('🗑️ Delete')
      await user.click(deleteButton)
      
      const confirmButton = screen.getByText('Yes, delete')
      await user.click(confirmButton)
      
      expect(onRecordingDelete).toHaveBeenCalled()
    })

    it('cancels delete when cancel is clicked', async () => {
      const onRecordingComplete = vi.fn()
      const onRecordingDelete = vi.fn()
      mockGetUserMedia.mockResolvedValueOnce(new MediaStream())
      
      render(
        <VoiceRecorder 
          onRecordingComplete={onRecordingComplete} 
          onRecordingDelete={onRecordingDelete} 
        />
      )
      
      // Complete recording and attempt delete
      const startButton = screen.getByText('🎤 Start Recording')
      await user.click(startButton)
      
      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' })
      const dataEvent = { data: mockBlob }
      mockMediaRecorder.addEventListener.mock.calls
        .find(call => call[0] === 'dataavailable')[1](dataEvent)
      mockMediaRecorder.state = 'inactive'
      mockMediaRecorder.addEventListener.mock.calls
        .find(call => call[0] === 'stop')[1]()
      
      await waitFor(() => {
        expect(screen.getByText('🗑️ Delete')).toBeInTheDocument()
      })
      
      const deleteButton = screen.getByText('🗑️ Delete')
      await user.click(deleteButton)
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(onRecordingDelete).not.toHaveBeenCalled()
      expect(screen.getByText('🗑️ Delete')).toBeInTheDocument() // Still shows delete button
    })
  })

  describe('Error handling', () => {
    it('handles MediaRecorder not supported', () => {
      global.MediaRecorder = undefined as any
      
      render(
        <VoiceRecorder 
          onRecordingComplete={vi.fn()} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      expect(screen.getByText(/voice recording not supported/i)).toBeInTheDocument()
    })

    it('handles recording errors gracefully', async () => {
      mockGetUserMedia.mockResolvedValueOnce(new MediaStream())
      
      render(
        <VoiceRecorder 
          onRecordingComplete={vi.fn()} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      const startButton = screen.getByText('🎤 Start Recording')
      await user.click(startButton)
      
      // Simulate recording error
      const errorEvent = new Event('error')
      mockMediaRecorder.addEventListener.mock.calls
        .find(call => call[0] === 'error')[1](errorEvent)
      
      await waitFor(() => {
        expect(screen.getByText(/recording error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <VoiceRecorder 
          onRecordingComplete={vi.fn()} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      const startButton = screen.getByText('🎤 Start Recording')
      expect(startButton).toHaveAttribute('aria-label')
    })

    it('provides audio feedback for actions', async () => {
      mockGetUserMedia.mockResolvedValueOnce(new MediaStream())
      
      // Mock speech synthesis
      const mockSpeak = vi.fn()
      global.speechSynthesis = {
        speak: mockSpeak,
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn(() => []),
        speaking: false,
        pending: false,
        paused: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as any
      
      render(
        <VoiceRecorder 
          onRecordingComplete={vi.fn()} 
          onRecordingDelete={vi.fn()} 
        />
      )
      
      const startButton = screen.getByText('🎤 Start Recording')
      await user.click(startButton)
      
      // Should provide voice feedback
      await waitFor(() => {
        expect(mockSpeak).toHaveBeenCalled()
      })
    })
  })
})