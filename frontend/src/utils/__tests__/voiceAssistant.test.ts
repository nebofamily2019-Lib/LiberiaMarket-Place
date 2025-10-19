import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { speakPrompt, setDefaultLang, getAvailablePrompts } from '../voiceAssistant'

describe('voiceAssistant speakPrompt / templates', () => {
  let originalSpeechSynthesis: any
  beforeEach(() => {
    // Mock speechSynthesis
    originalSpeechSynthesis = (global as any).speechSynthesis
    (global as any).speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn()
    }
  })

  afterEach(() => {
    // restore
    (global as any).speechSynthesis = originalSpeechSynthesis
    vi.clearAllMocks()
  })

  it('speakPrompt renders fieldPrompt template in en-US', () => {
    speakPrompt('fieldPrompt', { field: 'title' }, 'en-US')
    expect((global as any).speechSynthesis.speak).toHaveBeenCalled()
    const utterance = (global as any).speechSynthesis.speak.mock.calls[0][0]
    expect(utterance).toBeDefined()
    expect(utterance.text).toContain('Please say the title')
    expect(utterance.lang).toBe('en-US')
  })

  it('speakPrompt uses provided language (pcm) for pidgin template', () => {
    // Ensure the prompt key exists
    const available = getAvailablePrompts()
    expect(available.length).toBeGreaterThan(0)

    speakPrompt('confirm', { action: 'delete' }, 'pcm')
    expect((global as any).speechSynthesis.speak).toHaveBeenCalled()
    const utterance = (global as any).speechSynthesis.speak.mock.calls[0][0]
    expect(utterance.lang).toBe('pcm')
    // pcm template contains 'wan' per our design (pidgin example)
    expect(utterance.text.toLowerCase()).toContain('wan')
  })
})
