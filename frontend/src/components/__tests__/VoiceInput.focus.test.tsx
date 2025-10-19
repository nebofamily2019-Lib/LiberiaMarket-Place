import { render, screen, fireEvent } from '@testing-library/react'
import VoiceInput from '../VoiceInput'
import * as voiceAssistant from '../../utils/voiceAssistant'
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest'

describe('VoiceInput focus triggers speakPrompt', () => {
  const speakPromptSpy = vi.spyOn(voiceAssistant, 'speakPrompt').mockImplementation(() => {})

  beforeEach(() => {
    speakPromptSpy.mockClear()
  })

  afterEach(() => {
    speakPromptSpy.mockClear()
  })

  it('calls speakPrompt when focused (single-line input)', () => {
    render(
      <VoiceInput
        label="Test Field"
        value=""
        onChange={() => {}}
        onFocus={() => voiceAssistant.speakPrompt('fieldPrompt', { field: 'test field' })}
      />
    )

    const input = screen.getByLabelText('Test Field')
    fireEvent.focus(input)
    expect(speakPromptSpy).toHaveBeenCalledWith('fieldPrompt', { field: 'test field' })
  })

  it('calls speakPrompt when focused (multiline textarea)', () => {
    render(
      <VoiceInput
        label="Details"
        value=""
        onChange={() => {}}
        multiline
        rows={4}
        onFocus={() => voiceAssistant.speakPrompt('fieldPrompt', { field: 'details' })}
      />
    )

    const textarea = screen.getByLabelText('Details')
    fireEvent.focus(textarea)
    expect(speakPromptSpy).toHaveBeenCalledWith('fieldPrompt', { field: 'details' })
  })
})
