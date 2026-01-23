// src/services/dataService.test.js
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getLocalSentences,
  getNewConcept1Sentences,
  getNotionSentences,
  getSentencesBySource,
  getNewConcept3Sentences,
  getLocalResources,
  getSentencesByLocalResource,
  getSentences,
  DATA_SOURCE_TYPES,
  DATA_SOURCES
} from './dataService';
import cacheService from './cacheService';
import { getAllFlashcards } from './flashcardService';

// Mock the imported data
vi.mock('../data/简单句.json', () => ({
  default: [
    { id: 1, text: 'This is a simple sentence.' },
    { id: 2, text: 'Another simple sentence.' }
  ]
}));

vi.mock('../data/新概念一.json', () => ({
  default: [
    { id: 1, text: 'New Concept 1 sentence 1.' },
    { id: 2, text: 'New Concept 1 sentence 2.' }
  ]
}));

// Mock flashcardService
vi.mock('./flashcardService', () => ({
  getAllFlashcards: vi.fn(),
}));

// Mock fetch globally
globalThis.fetch = vi.fn();

// Mock AbortController
globalThis.AbortController = vi.fn().mockImplementation(() => ({
  abort: vi.fn(),
  signal: {}
}));

describe('dataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('DATA_SOURCE_TYPES', () => {
    it('should have all required data source types', () => {
      expect(DATA_SOURCE_TYPES.LOCAL).toBe('local');
      expect(DATA_SOURCE_TYPES.NOTION).toBe('notion');
      expect(DATA_SOURCE_TYPES.NEW_CONCEPT_1).toBe('new-concept-1');
      expect(DATA_SOURCE_TYPES.NEW_CONCEPT_3).toBe('new-concept-3');
      expect(DATA_SOURCE_TYPES.FLASHCARDS).toBe('flashcards');
    });
  });

  describe('DATA_SOURCES', () => {
    it('should contain all data source configurations', () => {
      expect(DATA_SOURCES).toHaveLength(5);
      expect(DATA_SOURCES[0].id).toBe(DATA_SOURCE_TYPES.FLASHCARDS);
      expect(DATA_SOURCES[1].id).toBe(DATA_SOURCE_TYPES.LOCAL);
      expect(DATA_SOURCES[2].id).toBe(DATA_SOURCE_TYPES.NOTION);
      expect(DATA_SOURCES[3].id).toBe(DATA_SOURCE_TYPES.NEW_CONCEPT_1);
      expect(DATA_SOURCES[4].id).toBe(DATA_SOURCE_TYPES.NEW_CONCEPT_3);
    });

    it('should have proper structure for each data source', () => {
      DATA_SOURCES.forEach(source => {
        expect(source).toHaveProperty('id');
        expect(source).toHaveProperty('name');
        expect(source).toHaveProperty('description');
        expect(source).toHaveProperty('icon');
      });
    });
  });

  describe('getLocalSentences', () => {
    it('should return local sentences data', async () => {
      const result = await getLocalSentences();
      expect(result).toEqual([
        { id: 1, text: 'This is a simple sentence.' },
        { id: 2, text: 'Another simple sentence.' }
      ]);
    });
  });

  describe('getNewConcept1Sentences', () => {
    it('should return New Concept 1 sentences data', async () => {
      const result = await getNewConcept1Sentences();
      expect(result).toEqual([
        { id: 1, text: 'New Concept 1 sentence 1.' },
        { id: 2, text: 'New Concept 1 sentence 2.' }
      ]);
    });
  });

  describe('getNotionSentences', () => {
    it('should fetch sentences from Notion API successfully', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: vi.fn().mockResolvedValue({
          success: true,
          sentences: ['Sentence 1', 'Sentence 2']
        })
      };

      globalThis.fetch.mockResolvedValue(mockResponse);

      const result = await getNotionSentences();
      expect(result).toEqual(['Sentence 1', 'Sentence 2']);
      expect(global.fetch).toHaveBeenCalledWith('/.netlify/functions/get-notion-sentences', {
        signal: expect.any(AbortSignal)
      });
    });

    it('should throw error when response is not JSON', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: () => 'text/html'
        }
      };

      globalThis.fetch.mockResolvedValue(mockResponse);

      await expect(getNotionSentences()).rejects.toThrow(
        'Netlify Functions 未运行或返回了非 JSON 数据。请确保使用 `npm run netlify-dev` 启动项目。'
      );
    });

    it('should throw error on HTTP error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        headers: {
          get: () => 'application/json'
        },
        json: vi.fn().mockResolvedValue({ error: 'Server error' })
      };

      globalThis.fetch.mockResolvedValue(mockResponse);

      await expect(getNotionSentences()).rejects.toThrow('HTTP error! status: 500');
    });

    it('should throw error on API error response', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: vi.fn().mockResolvedValue({
          error: 'API Error',
          message: 'Notion API failed'
        })
      };

      globalThis.fetch.mockResolvedValue(mockResponse);

      await expect(getNotionSentences()).rejects.toThrow('Notion API failed');
    });

    it('should handle timeout', async () => {
      // Mock AbortController
      const mockController = {
        abort: vi.fn(),
        signal: {}
      };
      global.AbortController = vi.fn().mockImplementation(() => mockController);

      // Mock setTimeout to immediately abort
      vi.useFakeTimers();
      global.fetch.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          }, 10000);
        });
      });

      const promise = getNotionSentences();

      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(10000);

      await expect(promise).rejects.toThrow('请求超时，请检查网络连接');

      vi.useRealTimers();
    });
  });

  describe('getNewConcept3Sentences', () => {
    it('should fetch New Concept 3 sentences successfully', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: vi.fn().mockResolvedValue({
          success: true,
          articles: [
            { sentences: ['Article 1 sentence 1', 'Article 1 sentence 2'] },
            { sentences: ['Article 2 sentence 1'] }
          ]
        })
      };

      globalThis.fetch.mockResolvedValue(mockResponse);

      const result = await getNewConcept3Sentences();
      expect(result).toEqual([
        'Article 1 sentence 1',
        'Article 1 sentence 2',
        'Article 2 sentence 1'
      ]);
    });

    it('should throw error when no articles found', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: vi.fn().mockResolvedValue({
          success: false,
          articles: []
        })
      };

      globalThis.fetch.mockResolvedValue(mockResponse);

      await expect(getNewConcept3Sentences()).rejects.toThrow('获取新概念三文章失败或无数据');
    });

    it('should handle timeout for New Concept 3 API', async () => {
      const mockController = {
        abort: vi.fn(),
        signal: {}
      };
      global.AbortController = vi.fn().mockImplementation(() => mockController);

      vi.useFakeTimers();
      global.fetch.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          }, 15000);
        });
      });

      const promise = getNewConcept3Sentences();

      vi.advanceTimersByTime(15000);

      await expect(promise).rejects.toThrow('请求超时，请检查网络连接');

      vi.useRealTimers();
    });
  });

  describe('getSentencesBySource', () => {
    let readCacheSpy;
    let writeCacheSpy;

    beforeEach(() => {
      // Mock cacheService
      readCacheSpy = vi.spyOn(cacheService, 'readCache').mockReturnValue(null);
      writeCacheSpy = vi.spyOn(cacheService, 'writeCache').mockReturnValue(true);
    });

    afterEach(() => {
      readCacheSpy.mockRestore();
      writeCacheSpy.mockRestore();
    });

    it('should return cached data when available', async () => {
      const cachedData = ['cached sentence 1', 'cached sentence 2'];
      cacheService.readCache.mockReturnValue(cachedData);

      const result = await getSentencesBySource(DATA_SOURCE_TYPES.LOCAL);

      expect(result).toBe(cachedData);
      expect(cacheService.readCache).toHaveBeenCalledWith('getSentencesBySource', {
        dataSourceType: DATA_SOURCE_TYPES.LOCAL
      });
      expect(cacheService.writeCache).not.toHaveBeenCalled();
    });

    it('should fetch and cache local data when not cached', async () => {
      const result = await getSentencesBySource(DATA_SOURCE_TYPES.LOCAL);

      expect(result).toEqual([
        { id: 1, text: 'This is a simple sentence.' },
        { id: 2, text: 'Another simple sentence.' }
      ]);
      expect(cacheService.writeCache).toHaveBeenCalledWith(
        'getSentencesBySource',
        expect.any(Array),
        { dataSourceType: DATA_SOURCE_TYPES.LOCAL }
      );
    });

    it('should fetch and cache New Concept 1 data', async () => {
      const result = await getSentencesBySource(DATA_SOURCE_TYPES.NEW_CONCEPT_1);

      expect(result).toEqual([
        { id: 1, text: 'New Concept 1 sentence 1.' },
        { id: 2, text: 'New Concept 1 sentence 2.' }
      ]);
      expect(cacheService.writeCache).toHaveBeenCalled();
    });

    it('should fetch Notion data when requested', async () => {
      const mockResponse = {
        ok: true,
        headers: { get: () => 'application/json' },
        json: vi.fn().mockResolvedValue({ success: true, sentences: ['Notion sentence'] })
      };
      globalThis.fetch.mockResolvedValue(mockResponse);

      const result = await getSentencesBySource(DATA_SOURCE_TYPES.NOTION);

      expect(result).toEqual(['Notion sentence']);
    });

    it('should fetch New Concept 3 data when requested', async () => {
      const mockResponse = {
        ok: true,
        headers: { get: () => 'application/json' },
        json: vi.fn().mockResolvedValue({
          success: true,
          articles: [{ sentences: ['NC3 sentence'] }]
        })
      };
      globalThis.fetch.mockResolvedValue(mockResponse);

      const result = await getSentencesBySource(DATA_SOURCE_TYPES.NEW_CONCEPT_3);

      expect(result).toEqual(['NC3 sentence']);
    });

    it('should handle flashcards data source', async () => {
      // Mock getAllFlashcards
      const mockFlashcards = ['flashcard 1', 'flashcard 2'];
      getAllFlashcards.mockReturnValue(mockFlashcards);

      const result = await getSentencesBySource(DATA_SOURCE_TYPES.FLASHCARDS);

      expect(result).toBe(mockFlashcards);
      expect(getAllFlashcards).toHaveBeenCalled();
    });

    it('should default to local data for unknown source', async () => {
      const result = await getSentencesBySource('unknown-source');

      expect(result).toEqual([
        { id: 1, text: 'This is a simple sentence.' },
        { id: 2, text: 'Another simple sentence.' }
      ]);
    });
  });

  describe('getLocalResources', () => {
    it('should return local resources configuration', () => {
      const resources = getLocalResources();

      expect(resources).toHaveLength(2);
      expect(resources[0]).toEqual({
        id: 'simple',
        name: '简单句',
        description: '基础简单句子练习',
        icon: '📝',
        data: [
          { id: 1, text: 'This is a simple sentence.' },
          { id: 2, text: 'Another simple sentence.' }
        ]
      });

      expect(resources[1]).toEqual({
        id: 'new-concept-1',
        name: '新概念一',
        description: '新概念英语第一册句子',
        icon: '📚',
        data: [
          { id: 1, text: 'New Concept 1 sentence 1.' },
          { id: 2, text: 'New Concept 1 sentence 2.' }
        ]
      });
    });
  });

  describe('getSentencesByLocalResource', () => {
    it('should return data for valid resource ID', async () => {
      const result = await getSentencesByLocalResource('simple');

      expect(result).toEqual([
        { id: 1, text: 'This is a simple sentence.' },
        { id: 2, text: 'Another simple sentence.' }
      ]);
    });

    it('should return default local data for unknown resource ID', async () => {
      const result = await getSentencesByLocalResource('unknown');

      expect(result).toEqual([
        { id: 1, text: 'This is a simple sentence.' },
        { id: 2, text: 'Another simple sentence.' }
      ]);
    });

    it('should default to "simple" for undefined resource ID', async () => {
      const result = await getSentencesByLocalResource();

      expect(result).toEqual([
        { id: 1, text: 'This is a simple sentence.' },
        { id: 2, text: 'Another simple sentence.' }
      ]);
    });
  });

  describe('getSentences', () => {
    it('should handle boolean dataSource for backward compatibility', async () => {
      // Mock cache and fetch for Notion
      readCacheSpy.mockReturnValue(null);
      const mockResponse = {
        ok: true,
        headers: { get: () => 'application/json' },
        json: vi.fn().mockResolvedValue({ success: true, sentences: ['Notion sentence'] })
      };
      globalThis.fetch.mockResolvedValue(mockResponse);

      const result = await getSentences(true); // true = use Notion

      expect(result).toEqual(['Notion sentence']);
    });

    it('should handle false boolean dataSource', async () => {
      const result = await getSentences(false); // false = use local

      expect(result).toEqual([
        { id: 1, text: 'This is a simple sentence.' },
        { id: 2, text: 'Another simple sentence.' }
      ]);
    });

    it('should handle string dataSource', async () => {
      const result = await getSentences(DATA_SOURCE_TYPES.NEW_CONCEPT_1);

      expect(result).toEqual([
        { id: 1, text: 'New Concept 1 sentence 1.' },
        { id: 2, text: 'New Concept 1 sentence 2.' }
      ]);
    });

    it('should default to local for undefined dataSource', async () => {
      const result = await getSentences();

      expect(result).toEqual([
        { id: 1, text: 'This is a simple sentence.' },
        { id: 2, text: 'Another simple sentence.' }
      ]);
    });
  });
});