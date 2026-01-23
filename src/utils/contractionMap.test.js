// src/utils/contractionMap.test.js
import { describe, it, expect } from 'vitest'
import { CONTRACTION_MAP, expandContraction, isContraction } from './contractionMap'

describe('contractionMap', () => {
  describe('CONTRACTION_MAP', () => {
    it('should contain expected contractions', () => {
      expect(CONTRACTION_MAP["i'm"]).toBe("i am")
      expect(CONTRACTION_MAP["don't"]).toBe("do not")
      expect(CONTRACTION_MAP["can't"]).toBe("cannot")
      expect(CONTRACTION_MAP["we're"]).toBe("we are")
    })

    it('should have reasonable number of contractions', () => {
      expect(Object.keys(CONTRACTION_MAP).length).toBeGreaterThan(40)
    })
  })

  describe('expandContraction', () => {
    it('should expand known contractions', () => {
      expect(expandContraction("i'm")).toBe("i am")
      expect(expandContraction("DON'T")).toBe("do not") // case insensitive
      expect(expandContraction("we're")).toBe("we are")
    })

    it('should return original word for unknown contractions', () => {
      expect(expandContraction("hello")).toBe("hello")
      expect(expandContraction("world")).toBe("world")
      expect(expandContraction("")).toBe("")
    })

    it('should handle contractions with punctuation', () => {
      expect(expandContraction("don't!")).toBe("don't!") // punctuation preserved
    })
  })

  describe('isContraction', () => {
    it('should identify contractions correctly', () => {
      expect(isContraction("don't")).toBe(true)
      expect(isContraction("i'm")).toBe(true)
      expect(isContraction("hello")).toBe(false)
      expect(isContraction("world")).toBe(false)
      expect(isContraction("")).toBe(false)
    })

    it('should be case insensitive', () => {
      expect(isContraction("DON'T")).toBe(true)
      expect(isContraction("Can't")).toBe(true)
    })
  })
})