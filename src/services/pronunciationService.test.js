// src/services/pronunciationService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPhonetic,
  formatPhonetic,
  parseSentenceForPhonetics,
  detectAndExpandContractions
} from './pronunciationService';

// Mock cmu-pronouncing-dictionary
vi.mock('cmu-pronouncing-dictionary', () => ({
  dictionary: {
    'hello': 'HH AH0 L OW1',
    'world': 'W ER1 L D',
    'test': 'T EH1 S T',
    'cat': 'K AE1 T',
    'dog': 'D AO1 G',
    'apple': 'AE1 P AH0 L',
    'banana': 'B AH0 N AE1 N AH0',
    'very': 'V EH1 R IY0',
    'happy': 'HH AE1 P IY0',
    'sad': 'S AE1 D',
    'i': 'AY0',
    'am': 'AE1 M',
    'it': 'IH0 T',
    's': 'EH0 S',
    'open': 'OW1 P AH0 N',
    'world': 'W ER1 L D',
    'is': 'IH0 Z',
    're': 'ER0',
  }
}));

// Mock contraction map to exclude "it's" so we can test apostrophe splitting
vi.mock('../utils/contractionMap.js', () => ({
  CONTRACTION_MAP: {
    // Intentionally exclude "it's" to test apostrophe splitting
    "i'm": "i am",
    "you're": "you are",
    "we're": "we are",
    "they're": "they are",
  }
}));

describe('pronunciationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectAndExpandContractions', () => {
    it('should detect and expand contractions', () => {
      const result = detectAndExpandContractions("I'm happy");
      // "I'm" expands to ["I", "am"]
      expect(result.some(r => r.original === "I'm" && r.expanded === 'i' && r.isContraction)).toBe(true);
      expect(result.some(r => r.original === "I'm" && r.expanded === 'am' && r.isContraction)).toBe(true);
      expect(result.some(r => r.original === 'happy' && r.isContraction === false)).toBe(true);
    });

    it('should handle sentence without contractions', () => {
      const result = detectAndExpandContractions('hello world');
      expect(result).toEqual([
        { original: 'hello', expanded: 'hello', isContraction: false },
        { original: 'world', expanded: 'world', isContraction: false }
      ]);
    });

    it('should handle non-string input', () => {
      const result = detectAndExpandContractions(123);
      expect(result).toEqual([]);
    });

    it('should remove punctuation from sentence', () => {
      const result = detectAndExpandContractions('Hello, world!');
      // expanded keeps original case for non-contractions
      expect(result).toEqual([
        { original: 'Hello', expanded: 'Hello', isContraction: false },
        { original: 'world', expanded: 'world', isContraction: false }
      ]);
    });

    it('should handle multiple contractions', () => {
      const result = detectAndExpandContractions("I'm what's");
      expect(result.length).toBeGreaterThan(2);
    });
  });

  describe('getPhonetic', () => {
    it('should return phonetics for simple words', () => {
      const result = getPhonetic('HELLO');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should return null for unknown words', () => {
      const result = getPhonetic('XYZZY');
      expect(result).toBeNull();
    });

    it('should throw error for null input (current behavior)', () => {
      expect(() => getPhonetic(null)).toThrow();
    });

    it('should handle case insensitivity', () => {
      const result = getPhonetic('hello');
      expect(result).toBeTruthy();
    });

    it('should split words with apostrophes', () => {
      // "it's" should split to "it" + "s"
      const result = getPhonetic("it's");
      expect(result).toBeTruthy();
    });

    it('should handle contraction map expansion', () => {
      // "i'm" is in our mock contraction map
      const result = getPhonetic("i'm");
      expect(result).toBeTruthy();
    });
  });

  describe('formatPhonetic', () => {
    it('should remove stress markers (numbers)', () => {
      const result = formatPhonetic('HH AH0 L OW1');
      expect(result).not.toContain('0');
      expect(result).not.toContain('1');
    });

    it('should return empty string for falsy input', () => {
      expect(formatPhonetic('')).toBe('');
      expect(formatPhonetic(null)).toBe('');
      expect(formatPhonetic(undefined)).toBe('');
    });

    it('should replace ARPAbet with readable symbols', () => {
      const result = formatPhonetic('AE');
      expect(result).toContain('æ');
    });
  });

  describe('parseSentenceForPhonetics', () => {
    it('should parse sentence and return word-phonetic objects', () => {
      const result = parseSentenceForPhonetics('hello world');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include phonetic data for each word', () => {
      const result = parseSentenceForPhonetics('hello');
      expect(result[0]).toHaveProperty('word');
      expect(result[0]).toHaveProperty('phonetic');
    });

    it('should handle empty sentence', () => {
      const result = parseSentenceForPhonetics('');
      expect(result).toEqual([]);
    });
  });
});
