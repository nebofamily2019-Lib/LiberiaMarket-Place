import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock browser APIs that aren't available in test environment
beforeEach(() => {
  // Mock speechSynthesis API for voice features
  global.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    paused: false,
    pending: false,
    speaking: false,
    getVoices: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onvoiceschanged: null
  } as any

  // Mock SpeechSynthesisUtterance
  global.SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
    text,
    lang: 'en-US',
    voice: null,
    volume: 1,
    rate: 1,
    pitch: 1,
    onstart: null,
    onend: null,
    onerror: null,
    onpause: null,
    onresume: null,
    onmark: null,
    onboundary: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  })) as any

  // Mock matchMedia for responsive design tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: vi.fn(() => [])
  })) as any

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  })) as any

  // Mock localStorage with actual storage functionality
  const localStorageData: Record<string, string> = {}
  const localStorageMock = {
    getItem: vi.fn((key: string) => localStorageData[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageData[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageData[key]
    }),
    clear: vi.fn(() => {
      Object.keys(localStorageData).forEach(key => delete localStorageData[key])
    }),
    get length() {
      return Object.keys(localStorageData).length
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(localStorageData)
      return keys[index] ?? null
    })
  }
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true
  })

  // Mock sessionStorage with actual storage functionality
  const sessionStorageData: Record<string, string> = {}
  const sessionStorageMock = {
    getItem: vi.fn((key: string) => sessionStorageData[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      sessionStorageData[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete sessionStorageData[key]
    }),
    clear: vi.fn(() => {
      Object.keys(sessionStorageData).forEach(key => delete sessionStorageData[key])
    }),
    get length() {
      return Object.keys(sessionStorageData).length
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(sessionStorageData)
      return keys[index] ?? null
    })
  }
  Object.defineProperty(global, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
    configurable: true
  })

  // Mock fetch if needed
  if (!global.fetch) {
    global.fetch = vi.fn()
  }

  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    // Keep error for important messages
  }

  // Mock MediaRecorder for voice recording tests
  global.MediaRecorder = vi.fn().mockImplementation(() => ({
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
    dispatchEvent: vi.fn()
  })) as any

  // Add isTypeSupported static method
  if (global.MediaRecorder) {
    (global.MediaRecorder as any).isTypeSupported = vi.fn(() => true)
  }

  // Mock navigator.mediaDevices
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: vi.fn(),
      enumerateDevices: vi.fn(() => Promise.resolve([])),
      getSupportedConstraints: vi.fn(() => ({}))
    }
  })

  // Mock Audio constructor
  global.Audio = vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    currentTime: 0,
    duration: 10,
    paused: true,
    volume: 1,
    muted: false,
    src: '',
    load: vi.fn()
  })) as any

  // Mock URL.createObjectURL and revokeObjectURL
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()
})

// Clean up mocks after each test
afterEach(() => {
  vi.clearAllMocks()
})
