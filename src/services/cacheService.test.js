// src/services/cacheService.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import cacheService from './cacheService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0,
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('cacheService', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    // Reset localStorage length
    localStorageMock.length = 0;
  });

  afterEach(() => {
    // Clear all cache after each test
    localStorageMock.clear();
  });

  describe('generateCacheKey', () => {
    it('should generate consistent cache keys for same input', () => {
      const key1 = cacheService.generateCacheKey('testFunc', { param: 'value' });
      const key2 = cacheService.generateCacheKey('testFunc', { param: 'value' });
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different functions', () => {
      const key1 = cacheService.generateCacheKey('func1', { param: 'value' });
      const key2 = cacheService.generateCacheKey('func2', { param: 'value' });
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different parameters', () => {
      const key1 = cacheService.generateCacheKey('testFunc', { param: 'value1' });
      const key2 = cacheService.generateCacheKey('testFunc', { param: 'value2' });
      expect(key1).not.toBe(key2);
    });

    it('should handle empty parameters', () => {
      const key = cacheService.generateCacheKey('testFunc', {});
      expect(key).toMatch(/^testFunc_/);
    });

    it('should sanitize special characters in cache key', () => {
      const params = { 'special/chars': 'value+with=chars' };
      const key = cacheService.generateCacheKey('testFunc', params);
      expect(key).not.toMatch(/[/+=]/);
    });
  });

  describe('readCache', () => {
    it('should return null when not in browser environment', () => {
      // Temporarily mock as non-browser
      const _originalIsBrowser = typeof window !== 'undefined';
      delete window.localStorage;

      const result = cacheService.readCache('testFunc', {});
      expect(result).toBeNull();

      // Restore
      window.localStorage = localStorageMock;
    });

    it('should return null when cache key does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = cacheService.readCache('testFunc', {});
      expect(result).toBeNull();
      expect(localStorageMock.getItem).toHaveBeenCalled();
    });

    it('should return null when cache is expired', () => {
      const expiredCache = {
        timestamp: Date.now() - 7200000, // 2 hours ago
        ttl: 3600000, // 1 hour TTL
        data: 'test data'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCache));

      const result = cacheService.readCache('testFunc', {});
      expect(result).toBeNull();
      // Should have removed expired cache
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('should return cached data when valid', () => {
      const validCache = {
        timestamp: Date.now(),
        ttl: 3600000,
        data: 'test data'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(validCache));

      const result = cacheService.readCache('testFunc', {});
      expect(result).toBe('test data');
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = cacheService.readCache('testFunc', {});
      expect(result).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = cacheService.readCache('testFunc', {});
      expect(result).toBeNull();
    });
  });

  describe('writeCache', () => {
    it('should return false when not in browser environment', () => {
      delete window.localStorage;

      const result = cacheService.writeCache('testFunc', 'data', {});
      expect(result).toBe(false);

      window.localStorage = localStorageMock;
    });

    it('should write cache data successfully', () => {
      const result = cacheService.writeCache('testFunc', 'test data', { param: 'value' });

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        expect.stringMatching(/^testFunc_/),
        expect.stringContaining('"data":"test data"')
      );
    });

    it('should use default TTL when not specified', () => {
      cacheService.writeCache('testFunc', 'data', {});

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const cacheData = JSON.parse(callArgs[1]);
      expect(cacheData.ttl).toBe(3600000); // 1 hour
    });

    it('should use specified TTL', () => {
      const customTtl = 7200000; // 2 hours
      cacheService.writeCache('testFunc', 'data', {}, customTtl);

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const cacheData = JSON.parse(callArgs[1]);
      expect(cacheData.ttl).toBe(customTtl);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = cacheService.writeCache('testFunc', 'data', {});
      expect(result).toBe(false);
    });
  });

  describe('clearCache', () => {
    beforeEach(() => {
      // Mock localStorage with multiple keys
      localStorageMock.length = 3;
      localStorageMock.key.mockImplementation((index) => {
        const keys = ['testFunc_abc', 'otherFunc_xyz', 'testFunc_def'];
        return keys[index] || null;
      });
    });

    it('should return false when not in browser environment', () => {
      delete window.localStorage;

      const result = cacheService.clearCache('testFunc');
      expect(result).toBe(false);

      window.localStorage = localStorageMock;
    });

    it('should clear all cache entries for specific function', () => {
      const result = cacheService.clearCache('testFunc');

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('testFunc_abc');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('testFunc_def');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.key.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = cacheService.clearCache('testFunc');
      expect(result).toBe(false);
    });
  });

  describe('clearAllCache', () => {
    beforeEach(() => {
      localStorageMock.length = 3;
      localStorageMock.key.mockImplementation((index) => {
        const keys = ['func1_cache', 'func2_cache', 'func3_cache'];
        return keys[index] || null;
      });
    });

    it('should return false when not in browser environment', () => {
      delete window.localStorage;

      const result = cacheService.clearAllCache();
      expect(result).toBe(false);

      window.localStorage = localStorageMock;
    });

    it('should clear all cache entries', () => {
      const result = cacheService.clearAllCache();

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(3);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.key.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = cacheService.clearAllCache();
      expect(result).toBe(false);
    });
  });

  describe('getFileHash', () => {
    it('should return null in browser environment', () => {
      const result = cacheService.getFileHash('test.js');
      expect(result).toBeNull();
    });

    it('should return null for any file path in browser', () => {
      const result = cacheService.getFileHash('/path/to/file.js');
      expect(result).toBeNull();
    });
  });
});