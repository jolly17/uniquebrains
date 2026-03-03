import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(() => null),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
  writable: true,
})

// Cleanup after each test case
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
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
}

// Mock geolocation API
global.navigator.geolocation = {
  getCurrentPosition: (success) => {
    success({
      coords: {
        latitude: 39.8283,
        longitude: -98.5795,
        accuracy: 100,
      },
    })
  },
  watchPosition: () => {},
  clearWatch: () => {},
}
