import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchHeader from '../SearchHeader'
import * as voiceAssistant from '../../utils/voiceAssistant'
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest'

describe('SearchHeader speaking indicator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(voiceAssistant, 'speakThenListen').mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(() => {}), 1000)
      })
    })
    vi.spyOn(voiceAssistant, 'speakPrompt').mockImplementation(() => Promise.resolve())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('displays speaking indicator then listening indicator', async () => {
    const onSearch = vi.fn()
    render(<SearchHeader onSearch={onSearch} />)

    const button = screen.getByLabelText('Voice search')
    fireEvent.click(button)

    expect(screen.getByText(/Speaking\.\.\./i)).toBeInTheDocument()

    vi.advanceTimersByTime(1000)

    await waitFor(() => {
      expect(screen.queryByText(/Speaking\.\.\./i)).toBeNull()
      expect(screen.getByText(/Listening.../i)).toBeInTheDocument()
    })
  })
})
