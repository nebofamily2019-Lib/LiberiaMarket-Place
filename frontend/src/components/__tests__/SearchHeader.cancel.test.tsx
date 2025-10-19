import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchHeader from '../SearchHeader'
import * as voiceAssistant from '../../utils/voiceAssistant'
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest'

describe('SearchHeader cancel behavior', () => {
  const fakeStop = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    // speakThenListen resolves after 1000ms and returns fakeStop
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

  it('cancels during TTS: stopSpeaking called and recognition prevented', async () => {
    const onSearch = vi.fn()
    render(<SearchHeader onSearch={onSearch} />)

    const voiceBtn = screen.getByLabelText('Voice search')
    fireEvent.click(voiceBtn)

    // Speaking indicator shown
    expect(screen.getByText(/Speaking\.\.\./i)).toBeInTheDocument()

    // Click Cancel while TTS in progress
    const cancelBtn = screen.getByRole('button', { name: /Cancel voice/i })
    fireEvent.click(cancelBtn)

    expect(voiceAssistant.stopSpeaking).toHaveBeenCalled()

    // Advance timers to when speakThenListen would resolve
    vi.advanceTimersByTime(1000)

    // fakeStop should have been called by component to ensure recognition doesn't start
    expect(fakeStop).toHaveBeenCalled()

    // No listening indicator
    expect(screen.queryByText(/Listening.../i)).toBeNull()
  })

  it('cancels during Listening: stop function invoked and listening indicator hides', async () => {
    const onSearch = vi.fn()
    render(<SearchHeader onSearch={onSearch} />)

    const voiceBtn = screen.getByLabelText('Voice search')
    fireEvent.click(voiceBtn)

    // let TTS finish and recognition start
    vi.advanceTimersByTime(1000)
    await waitFor(() => expect(screen.getByText(/Listening.../i)).toBeInTheDocument())

    // Click Cancel while listening
    const cancelBtn = screen.getByRole('button', { name: /Cancel voice/i })
    fireEvent.click(cancelBtn)

    // fakeStop should have been called to stop recognition
    expect(fakeStop).toHaveBeenCalled()

    // Listening indicator should be gone
    expect(screen.queryByText(/Listening.../i)).toBeNull()
  })
})
