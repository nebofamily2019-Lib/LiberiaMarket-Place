import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

// Mock MediaStream
global.MediaStream = class MediaStream {
  constructor() {}
  getAudioTracks() { return [] }
  getVideoTracks() { return [] }
  getTracks() { return [] }
  addTrack() {}
  removeTrack() {}
  clone() { return new MediaStream() }
} as any

// Mock MediaRecorder
global.MediaRecorder = class MediaRecorder {
  static isTypeSupported = vi.fn(() => true)
  constructor() {}
  start = vi.fn()
  stop = vi.fn()
  pause = vi.fn()
  resume = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  state = 'inactive'
  stream = null
  mimeType = 'audio/webm'
} as any

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(() => Promise.resolve(new MediaStream())),
  },
})

// Mock speechSynthesis
global.speechSynthesis = {
  speak: vi.fn(),
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

// Mock SpeechRecognition
;(global as any).SpeechRecognition = class SpeechRecognition {
  constructor() {}
  start = vi.fn()
  stop = vi.fn()
  abort = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  continuous = false
  interimResults = false
  lang = 'en-US'
} as any

;(global as any).webkitSpeechRecognition = (global as any).SpeechRecognition

// Mock Geolocation
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: vi.fn((success) => 
      success({
        coords: {
          latitude: 6.3156,
          longitude: -10.8074,
          accuracy: 10,
        },
      })
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
})

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock HTMLAudioElement
global.Audio = class Audio {
  constructor() {}
  play = vi.fn(() => Promise.resolve())
  pause = vi.fn()
  load = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  currentTime = 0
  duration = 10
  paused = true
  volume = 1
  src = ''
} as any

// Suppress console errors in tests (optional - can be removed for debugging)
// global.console.error = vi.fn()
// global.console.warn = vi.fn()
