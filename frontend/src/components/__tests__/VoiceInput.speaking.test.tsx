import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VoiceInput from '../VoiceInput'
import * as voiceAssistant from '../../utils/voiceAssistant'
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest'
import { stopSpeaking } from '../../utils/voiceAssistant'

describe('VoiceInput speaking indicator', () => {
  const fakeStop = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    // speakThenListen resolves after 1000ms returning fakeStop
    vi.spyOn(voiceAssistant, 'speakThenListen').mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(() => fakeStop()), 1000)
      })
    })
    vi.spyOn(voiceAssistant, 'speakPrompt').mockImplementation(() => Promise.resolve())
    vi.spyOn(voiceAssistant, 'stopSpeaking').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    fakeStop.mockReset()
  })

  it('shows Speaking... during TTS and then Listening...', async () => {
    render(<VoiceInput value="" onChange={() => {}} label="Test Field" />)

    const voiceButton = screen.getByLabelText('Start voice input')
    fireEvent.click(voiceButton)

    // Speaking indicator should appear immediately
    expect(screen.getByText(/Speaking\.\.\./i)).toBeInTheDocument()

    // Advance time to resolve speakThenListen (simulate TTS end)
    vi.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(screen.queryByText(/Speaking\.\.\./i)).toBeNull()
      expect(screen.getByText(/Listening.../i)).toBeInTheDocument()
    })
  })

  it('cancels during TTS: stops speaking and prevents listening', async () => {
    render(<VoiceInput value="" onChange={() => {}} label="Test Field" />)

    const voiceButton = screen.getByLabelText('Start voice input')
    fireEvent.click(voiceButton)

    // Speaking indicator visible
    expect(screen.getByText(/Speaking\.\.\./i)).toBeInTheDocument()

    // Click Cancel while still speaking
    const cancelBtn = screen.getByRole('button', { name: /Cancel voice/i })
    fireEvent.click(cancelBtn)

    // stopSpeaking should have been called (mock)
    expect(voiceAssistant.stopSpeaking).toHaveBeenCalled()

    // Advance time to when speakThenListen would resolve
    vi.advanceTimersByTime(1000)

    // The fakeStop returned by speakThenListen should have been invoked by component (to ensure recognition doesn't start)
    expect(fakeStop).toHaveBeenCalled()

    // No Listening indicator should appear
    expect(screen.queryByText(/Listening.../i)).toBeNull()
  })

  it('cancels during Listening: stops recognition', async () => {
    render(<VoiceInput value="" onChange={() => {}} label="Test Field" />)

    const voiceButton = screen.getByLabelText('Start voice input')
    fireEvent.click(voiceButton)

    // let TTS finish and recognition start
    vi.advanceTimersByTime(1000)
    await waitFor(() => expect(screen.getByText(/Listening.../i)).toBeInTheDocument())

    // Click Cancel while listening
    const cancelBtn = screen.getByRole('button', { name: /Cancel voice/i })
    fireEvent.click(cancelBtn)

    // fakeStop should have been called to stop recognition
    expect(fakeStop).toHaveBeenCalled()

    // Listening indicator should disappear
    expect(screen.queryByText(/Listening.../i)).toBeNull()
  })

  it('cancels during TTS: stops speaking and prevents listening (mocked speakThenListen, stopSpeaking)', async () => {
    render(<VoiceInput value="" onChange={() => {}} label="Test Field" />)

    const voiceButton = screen.getByLabelText('Start voice input')
    fireEvent.click(voiceButton)

    // Speaking indicator visible
    expect(screen.getByText(/Speaking\.\.\./i)).toBeInTheDocument()

    // Click Cancel while still speaking
    const cancelBtn = screen.getByRole('button', { name: /Cancel voice/i })
    fireEvent.click(cancelBtn)

    // stopSpeaking should have been called (mock)
    expect(voiceAssistant.stopSpeaking).toHaveBeenCalled()

    // Advance time to when speakThenListen would resolve
    vi.advanceTimersByTime(1000)

    // The fakeStop returned by speakThenListen should have been invoked by component (to ensure recognition doesn't start)
    expect(fakeStop).toHaveBeenCalled()

    // No Listening indicator should appear
    expect(screen.queryByText(/Listening.../i)).toBeNull()
  })
})
