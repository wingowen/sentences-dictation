// src/utils/debounce.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce, throttle } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('debounce function', () => {
    it('should delay function execution', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should cancel previous calls when called again within delay', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      vi.advanceTimersByTime(50)

      debouncedFn() // Should cancel first call
      vi.advanceTimersByTime(50)
      expect(mockFn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should pass arguments correctly', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1', 'arg2')
      vi.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should work with default delay', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn)

      debouncedFn()
      vi.advanceTimersByTime(300)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle function', () => {
    it('should limit function execution rate', () => {
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1)

      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(1) // Still 1

      vi.advanceTimersByTime(100)
      throttledFn()
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should pass arguments correctly', () => {
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('arg1', 'arg2')
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })
})