/**
 * Voice Assistant Utility
 * Provides text-to-speech and speech-to-text for illiterate users
 */

// Check if browser supports speech synthesis
export const isSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window
}

// Check if browser supports speech recognition
export const isRecognitionSupported = (): boolean => {
  return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
}

/**
 * Speak text aloud using browser's text-to-speech
 * @param text Text to speak
 * @param lang Optional language code (if omitted, uses defaultLang)
 */
export const speak = (text: string, lang?: string): Promise<void> => {
  const useLang = lang ?? defaultLang

  if (!isSpeechSupported()) {
    console.warn('Speech synthesis not supported')
    return Promise.resolve()
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = useLang
  utterance.rate = 0.9 // Slightly slower for better comprehension
  utterance.pitch = 1
  utterance.volume = 1

  return new Promise((resolve) => {
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    try {
      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.error('speak error', err)
      resolve()
    }
  })
}

// Speak a prompt then start recognition. Returns the stop function from startListening.
export const speakThenListen = async (
  text: string,
  onResult: (text: string) => void,
  onError?: (error: string) => void,
  lang?: string
): Promise<() => void> => {
  // First speak the prompt (wait until finished)
  await speak(text, lang)

  // Then start recognition (if supported)
  const stopFn = startListening(onResult, onError, lang ?? defaultLang)
  return stopFn
}

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = (): void => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Start voice recognition and return transcript
 * @param onResult Callback with recognized text
 * @param onError Error callback
 * @param lang Language code (default: en-US)
 */
export const startListening = (
  onResult: (text: string) => void,
  onError?: (error: string) => void,
  lang: string = 'en-US'
): (() => void) => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    onError?.('Speech recognition not supported in this browser')
    return () => {}
  }

  const recognition = new SpeechRecognition()
  recognition.lang = lang
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.continuous = false

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript
    onResult(transcript)
  }

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error)
    onError?.(event.error)
  }

  recognition.start()

  // Return stop function
  return () => {
    recognition.stop()
  }
}

/**
 * Speak product details for illiterate users
 */
export const speakProductDetails = (product: {
  title: string
  price: number
  location?: string
  condition?: string
  description?: string
}): void => {
  const text = `
    ${product.title}.
    Price: ${product.price} Liberian dollars.
    ${product.location ? `Location: ${product.location}.` : ''}
    ${product.condition ? `Condition: ${product.condition}.` : ''}
  `.trim()

  speak(text)
}

/**
 * Speak form field instructions
 */
export const speakFieldHelp = (fieldName: string, instruction: string): void => {
  speak(`${fieldName}. ${instruction}`)
}

/**
 * Create a reusable voice input handler for forms
 */
export const createVoiceInput = (
  onResult: (text: string) => void,
  fieldLabel: string
): {
  start: () => void
  stop: () => void
  isListening: boolean
} => {
  let stopFn: (() => void) | null = null
  let listening = false

  return {
    start: () => {
      speak(`Please say the ${fieldLabel}`)
      listening = true
      stopFn = startListening(
        (text) => {
          onResult(text)
          listening = false
        },
        (error) => {
          speak('Sorry, I could not understand. Please try again.')
          listening = false
        }
      )
    },
    stop: () => {
      if (stopFn) {
        stopFn()
        listening = false
      }
    },
    isListening: listening
  }
}

/**
 * Speak button action feedback
 */
export const speakAction = (action: string): void => {
  const messages: Record<string, string> = {
    'delete': 'Are you sure you want to delete?',
    'save': 'Saving your information',
    'cancel': 'Cancelled',
    'submit': 'Submitting',
    'success': 'Success!',
    'error': 'An error occurred. Please try again.',
    'loading': 'Please wait, loading...',
  }

  const message = messages[action.toLowerCase()] || action
  speak(message)
}

/**
 * Simple audio feedback for button presses
 */
export const playClickSound = (): void => {
  // Create a simple beep sound using Web Audio API
  if (!('AudioContext' in window || 'webkitAudioContext' in window)) {
    return
  }

  const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 800
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.1)
}

// default language and supported list (moved before functions that use it)
let defaultLang = 'en-US'
export const supportedLangs = ['en-US', 'pcm'] // pcm = Pidgin placeholder

export const setDefaultLang = (lang: string) => {
  if (!supportedLangs.includes(lang)) {
    console.warn(`Language ${lang} not supported, falling back to ${defaultLang}`)
    return
  }
  defaultLang = lang
}

export const getDefaultLang = () => defaultLang

// PROMPT_TEMPLATES and renderTemplate (keeps prior templates if present)
const PROMPT_TEMPLATES: Record<string, Record<string, string>> = {
  welcome: {
    'en-US': 'Welcome to LibMarket, {name}. Tap the microphone (🎤) to speak or the speaker (🔉) to listen.',
    'pcm': 'Welcome to LibMarket, {name}. Tap di mic (🎤) fo tok or tap di speaker (🔉) fo listen.'
  },
  fieldPrompt: {
    'en-US': 'Please say the {field} now.',
    'pcm': 'Please tok the {field} now.'
  },
  successShort: {
    'en-US': 'Done. Success.',
    'pcm': 'Done. Success.'
  },
  errorShort: {
    'en-US': 'Sorry, I did not understand. Please try again.',
    'pcm': 'Sorry, I no sabi. Try again.'
  },
  confirm: {
    'en-US': 'Are you sure you want to {action}?',
    'pcm': 'You sure you wan {action}?'
  }
}

const renderTemplate = (key: string, vars: Record<string, string> = {}, lang?: string) => {
  const useLang = lang && supportedLangs.includes(lang) ? lang : defaultLang
  const templatesForKey = PROMPT_TEMPLATES[key] || {}
  const template = templatesForKey[useLang] || templatesForKey['en-US'] || ''
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
}

export const speakPrompt = (key: string, vars: Record<string, string> = {}, lang?: string): Promise<void> => {
  const text = renderTemplate(key, vars, lang)
  if (!text) {
    console.warn(`Prompt key "${key}" not found`)
    return Promise.resolve()
  }
  return speak(text, lang ?? defaultLang)
}

// helper to list available prompt keys
export const getAvailablePrompts = () => Object.keys(PROMPT_TEMPLATES)

// Default export: only include functions defined in this file
export default {
  isSpeechSupported,
  isRecognitionSupported,
  speak,
  speakPrompt,
  speakThenListen,
  stopSpeaking,
  startListening,
  speakProductDetails,
  speakFieldHelp,
  createVoiceInput,
  speakAction,
  playClickSound,
  setDefaultLang,
  getDefaultLang,
  supportedLangs,
  getAvailablePrompts
}
