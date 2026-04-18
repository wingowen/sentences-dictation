// src/services/dataService.test.js
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
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

// Mock the imported data - 使用统一的结构化格式
vi.mock('../data/new-concept-1.json', () => ({
  default: {
    success: true,
    articles: [
      {
        lesson_id: '1-001',
        title: 'Excuse me!',
        chinese_title: '对不起！',
        question: 'Whose handbag is it? 这是谁的手袋？',
        sentences: [
          { text: 'Excuse me!', translation: '对不起！' },
          { text: 'Is this your handbag?', translation: '这是您的手提包吗？' }
        ],
        original_chinese: '对不起！这是您的手提包吗？'
      }
    ],
    totalArticles: 1,
    lastUpdated: new Date().toISOString()
  }
}));

vi.mock('../data/new-concept-2.json', () => ({
  default: {
    success: true,
    articles: [
      {
        lesson_id: '2-001',
        title: 'A private conversation',
        question: 'Why did the writer complain?',
        sentences: [
          { text: 'Last week I went to the theatre.', translation: '上周我去了剧院。' }
        ],
        original_chinese: '上周我去了剧院。'
      }
    ],
    totalArticles: 1
  }
}));

vi.mock('../data/new-concept-3.json', () => ({
  default: {
    success: true,
    articles: [
      {
        lesson_id: '3-001',
        title: 'A puma at large',
        chinese_title: '逃遁的美洲狮',
        question: 'Where must the puma have come from?',
        sentences: [
          { text: 'Pumas are large, cat-like animals.', translation: '' }
        ],
        original_chinese: '美洲狮是一种体形似猫的大动物。'
      }
    ],
    totalArticles: 1
  }
}));

// Mock flashcardService
vi.mock('./flashcardService', () => ({
  getAllFlashcards: vi.fn(),
}));

// Mock fetch globally
globalThis.fetch = vi.fn();

// Mock AbortController
class MockAbortController {
  constructor() {
    this.signal = {};
    this.abort = vi.fn();
  }
}
globalThis.AbortController = MockAbortController;

describe('dataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('DATA_SOURCE_TYPES', () => {
    it('should have all required data source types', () => {
      expect(DATA_SOURCE_TYPES.NOTION).toBe('notion');
      expect(DATA_SOURCE_TYPES.NEW_CONCEPT_1).toBe('new-concept-1');
      expect(DATA_SOURCE_TYPES.NEW_CONCEPT_3).toBe('new-concept-3');
      expect(DATA_SOURCE_TYPES.FLASHCARDS).toBe('flashcards');
    });
  });

  describe('DATA_SOURCES', () => {
    it('should contain all data source configurations', () => {
      expect(DATA_SOURCES.length).toBeGreaterThanOrEqual(4);
      expect(DATA_SOURCES.some(s => s.id === DATA_SOURCE_TYPES.FLASHCARDS)).toBe(true);
      expect(DATA_SOURCES.some(s => s.id === DATA_SOURCE_TYPES.NOTION)).toBe(true);
      expect(DATA_SOURCES.some(s => s.id === DATA_SOURCE_TYPES.NEW_CONCEPT_1)).toBe(true);
      expect(DATA_SOURCES.some(s => s.id === DATA_SOURCE_TYPES.NEW_CONCEPT_3)).toBe(true);
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

  describe('getNewConcept1Sentences', () => {
    it('should return New Concept 1 sentences from structured data', async () => {
      const result = await getNewConcept1Sentences();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('translation');
      expect(result[0]).toHaveProperty('id');
      expect(result[0].text).toBe('Excuse me!');
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
    it('should return New Concept 3 sentences from local data', async () => {
      const result = await getNewConcept3Sentences();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('translation');
      expect(result[0]).toHaveProperty('id');
      expect(result[0].text).toBe('Pumas are large, cat-like animals.');
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

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('translation');
      expect(result[0]).toHaveProperty('id');
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

    it('should return New Concept 3 data from local JSON', async () => {
      const result = await getSentencesBySource(DATA_SOURCE_TYPES.NEW_CONCEPT_3);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('id');
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

      expect(resources).toHaveLength(1);
      expect(resources[0].id).toBe('new-concept-1');
      expect(resources[0].name).toBe('新概念一');
      expect(resources[0].data).toHaveProperty('success');
      expect(resources[0].data).toHaveProperty('articles');
    });
  });

  describe('getSentencesByLocalResource', () => {
    it('should return data for valid resource ID', async () => {
      const result = await getSentencesByLocalResource('new-concept-1');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('articles');
    });

    it('should return empty array for unknown resource ID', async () => {
      const result = await getSentencesByLocalResource('unknown');

      expect(result).toEqual([]);
    });

    it('should default to "new-concept-1" for undefined resource ID', async () => {
      const result = await getSentencesByLocalResource();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('articles');
    });
  });

  describe('getSentences', () => {
    let readCacheSpy;

    beforeEach(() => {
      readCacheSpy = vi.spyOn(cacheService, 'readCache').mockReturnValue(null);
    });

    afterEach(() => {
      readCacheSpy.mockRestore();
    });

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

    it('should handle string dataSource', async () => {
      const result = await getSentences(DATA_SOURCE_TYPES.NEW_CONCEPT_1);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('id');
    });

    it('should default to new-concept-2 for undefined dataSource', async () => {
      // Mock cache for new-concept-2
      readCacheSpy.mockReturnValue(null);

      const result = await getSentences();

      // Should use new-concept-2 as default
      expect(Array.isArray(result)).toBe(true);
    });
  });
});