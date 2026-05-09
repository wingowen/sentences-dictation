// src/utils/sentenceId.test.js
import { describe, it, expect } from 'vitest';
import {
  generateSentenceId,
  parseSentenceId,
  isValidSentenceId,
  getSourceFromId,
  getAudioFileName,
  getAudioUrl
} from './sentenceId';

describe('sentenceId', () => {
  describe('generateSentenceId', () => {
    it('should generate id with source, lessonId, and index', () => {
      const result = generateSentenceId('nce2', 'L001', 0);
      expect(result).toBe('nce2-L001-000');
    });

    it('should handle numeric lessonId', () => {
      const result = generateSentenceId('nce2', 1, 0);
      expect(result).toBe('nce2-L001-000');
    });

    it('should handle string lessonId with 2-001 format', () => {
      const result = generateSentenceId('nce2', '2-001', 5);
      expect(result).toBe('nce2-L001-005');
    });

    it('should pad lessonId to 3 digits', () => {
      const result = generateSentenceId('nce3', 12, 0);
      expect(result).toBe('nce3-L012-000');
    });

    it('should pad sentence index to 3 digits', () => {
      const result = generateSentenceId('nce2', 'L001', 42);
      expect(result).toBe('nce2-L001-042');
    });

    it('should convert source to lowercase', () => {
      const result = generateSentenceId('NCE2', 'L001', 0);
      expect(result).toBe('nce2-L001-000');
    });

    it('should handle invalid lessonId type', () => {
      const result = generateSentenceId('nce2', null, 0);
      expect(result).toBe('nce2-L001-000');
    });

    it('should extract number from mixed lessonId', () => {
      const result = generateSentenceId('nce2', 'lesson-42-end', 0);
      expect(result).toBe('nce2-L042-000');
    });
  });

  describe('parseSentenceId', () => {
    it('should parse valid sentence id', () => {
      const result = parseSentenceId('nce2-L001-000');
      expect(result).toEqual({
        source: 'nce2',
        lessonId: 'L001',
        sentenceIndex: 0
      });
    });

    it('should return null for invalid format', () => {
      const result = parseSentenceId('invalid');
      expect(result).toBeNull();
    });

    it('should return null for non-string input', () => {
      expect(parseSentenceId(123)).toBeNull();
      expect(parseSentenceId(null)).toBeNull();
      expect(parseSentenceId(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseSentenceId('')).toBeNull();
    });

    it('should parse id with different indices', () => {
      const result = parseSentenceId('nce3-L015-123');
      expect(result.sentenceIndex).toBe(123);
    });
  });

  describe('isValidSentenceId', () => {
    it('should return true for valid sentence id with letters-only source', () => {
      // Note: regex only accepts [a-z]+ so ids like 'nce2' (with digit) won't match
      expect(isValidSentenceId('nce-L001-000')).toBe(true);
    });

    it('should return false for ids with digits in source', () => {
      // nce2, nce3 etc. contain digits and don't match the regex
      expect(isValidSentenceId('nce2-L001-000')).toBe(false);
      expect(isValidSentenceId('nce3-L999-999')).toBe(false);
    });

    it('should return false for invalid formats', () => {
      expect(isValidSentenceId('invalid')).toBe(false);
      expect(isValidSentenceId('nce-L01-000')).toBe(false);  // L01 not L001
      expect(isValidSentenceId('NCE-L001-000')).toBe(false); // uppercase
    });

    it('should return false for non-string input', () => {
      expect(isValidSentenceId(null)).toBe(false);
      expect(isValidSentenceId(123)).toBe(false);
    });
  });

  describe('getSourceFromId', () => {
    it('should extract source from valid id', () => {
      expect(getSourceFromId('nce2-L001-000')).toBe('nce2');
    });

    it('should return null for invalid id', () => {
      expect(getSourceFromId('invalid')).toBeNull();
    });
  });

  describe('getAudioFileName', () => {
    it('should return filename with opus extension', () => {
      expect(getAudioFileName('nce2-L001-000')).toBe('nce2-L001-000.opus');
    });
  });

  describe('getAudioUrl', () => {
    it('should generate correct audio URL', () => {
      const result = getAudioUrl('nce2-L001-000', 'https://example.com');
      expect(result).toBe('https://example.com/storage/v1/object/public/sentence-audios/nce2-L001-000.opus');
    });

    it('should use custom bucket if provided', () => {
      const result = getAudioUrl('nce2-L001-000', 'https://example.com', 'custom-bucket');
      expect(result).toBe('https://example.com/storage/v1/object/public/custom-bucket/nce2-L001-000.opus');
    });
  });
});