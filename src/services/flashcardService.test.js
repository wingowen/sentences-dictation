// src/services/flashcardService.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getAllFlashcards,
  getFlashcardCategories,
  saveFlashcardCategories,
  getLearningHistory,
  saveLearningHistory,
  addLearningRecord,
  createFlashcard,
  getFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getFlashcardsByCategory,
  getFlashcardsByTag,
  getFlashcardsForReview,
  getFlashcardStats,
  batchCreateFlashcards,
  getFlashcardByQuestion,
  cleanFlashcardData
} from './flashcardService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('flashcardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    localStorageMock.clear();
  });

  describe('getAllFlashcards', () => {
    it('should return empty array when no flashcards exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getAllFlashcards();
      expect(result).toEqual([]);
    });

    it('should return parsed flashcards from localStorage', () => {
      const mockFlashcards = [
        { id: '1', question: 'Q1', answer: 'A1' },
        { id: '2', question: 'Q2', answer: 'A2' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = getAllFlashcards();
      expect(result).toEqual(mockFlashcards);
    });

    it('should return empty array on localStorage error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = getAllFlashcards();
      expect(result).toEqual([]);
    });
  });

  describe('getFlashcardCategories', () => {
    it('should return empty array when no categories exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getFlashcardCategories();
      expect(result).toEqual([]);
    });

    it('should return parsed categories from localStorage', () => {
      const mockCategories = ['Math', 'Science', 'History'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockCategories));

      const result = getFlashcardCategories();
      expect(result).toEqual(mockCategories);
    });

    it('should return empty array on localStorage error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = getFlashcardCategories();
      expect(result).toEqual([]);
    });
  });

  describe('saveFlashcardCategories', () => {
    it('should save categories to localStorage', () => {
      const categories = ['Math', 'Science'];

      // 模拟 getAuthToken 调用
      localStorageMock.getItem.mockReturnValue(null);

      saveFlashcardCategories(categories);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcard_categories',
        JSON.stringify(categories)
      );
    });

    it('should handle localStorage error gracefully', () => {
      // 模拟 getAuthToken 调用
      localStorageMock.getItem.mockReturnValue(null);
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => saveFlashcardCategories(['test'])).not.toThrow();
    });
  });

  describe('getLearningHistory', () => {
    it('should return empty array when no history exists', () => {
      // 模拟 getAuthToken 调用
      localStorageMock.getItem.mockReturnValue(null);

      const result = getLearningHistory();
      expect(result).toEqual([]);
    });

    it('should return parsed history from localStorage', () => {
      const mockHistory = [
        { flashcardId: '1', correct: true, responseTime: 1000 }
      ];
      // 模拟 getAuthToken 调用和历史数据调用
      localStorageMock.getItem
        .mockReturnValueOnce(null) // AUTH_TOKEN_KEY
        .mockReturnValueOnce(JSON.stringify(mockHistory)); // flashcard_learning_history

      const result = getLearningHistory();
      expect(result).toEqual(mockHistory);
    });

    it('should return empty array on localStorage error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = getLearningHistory();
      expect(result).toEqual([]);
    });
  });

  describe('saveLearningHistory', () => {
    it('should save history to localStorage', () => {
      const history = [{ flashcardId: '1', correct: true }];

      // 模拟 getAuthToken 调用
      localStorageMock.getItem.mockReturnValue(null);

      saveLearningHistory(history);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcard_learning_history',
        JSON.stringify(history)
      );
    });

    it('should handle localStorage error gracefully', () => {
      // 模拟 getAuthToken 调用
      localStorageMock.getItem.mockReturnValue(null);
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => saveLearningHistory([{ test: true }])).not.toThrow();
    });
  });

  describe('addLearningRecord', () => {
    it('should add learning record to history', () => {
      const existingHistory = [{ id: 'old', flashcardId: '1', correct: false }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));

      addLearningRecord('2', true, 1500);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcard_learning_history',
        expect.stringContaining('"flashcardId":"2"')
      );

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const savedHistory = JSON.parse(callArgs[1]);
      expect(savedHistory).toHaveLength(2);
      expect(savedHistory[1]).toMatchObject({
        flashcardId: '2',
        correct: true,
        responseTime: 1500
      });
    });

    it('should limit history to 500 records', async () => {
      // Create 501 records (500 existing + 1 new)
      const existingHistory = Array.from({ length: 500 }, (_, i) => ({
        id: `record${i}`,
        flashcardId: i.toString(),
        correct: true
      }));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));

      await addLearningRecord('new', false, 1000);

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const savedHistory = JSON.parse(callArgs[1]);
      expect(savedHistory).toHaveLength(500); // Should be trimmed
    });
  });

  describe('createFlashcard', () => {
    it('should create and save a new flashcard', async () => {
      const flashcardData = {
        question: 'What is 2+2?',
        answer: '4',
        category: 'Math',
        tags: ['arithmetic'],
        difficulty: 2
      };

      const result = await createFlashcard(flashcardData);

      expect(result).toMatchObject({
        question: 'What is 2+2?',
        answer: '4',
        category: 'Math',
        tags: ['arithmetic'],
        difficulty: 2,
        easeFactor: 2.5,
        repetitionCount: 0,
        interval: 0
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcards',
        expect.stringContaining('"question":"What is 2+2?"')
      );
    });

    it('should use default values for missing fields', async () => {
      const flashcardData = {
        question: 'Test question',
        answer: 'Test answer'
      };

      const result = await createFlashcard(flashcardData);

      expect(result.category).toBe('默认');
      expect(result.tags).toEqual([]);
      expect(result.difficulty).toBe(3);
    });

    it('should update categories when creating flashcard with new category', async () => {
      // 重置 localStorageMock
      vi.clearAllMocks();
      
      // 正确的调用顺序：
      // 1. AUTH_TOKEN_KEY (isLoggedIn)
      // 2. AUTH_TOKEN_KEY (getLocalFlashcards)
      // 3. flashcards (getLocalFlashcards)
      // 4. AUTH_TOKEN_KEY (updateLocalCategories)
      // 5. flashcard_categories (updateLocalCategories)
      localStorageMock.getItem
        .mockReturnValueOnce(null) // AUTH_TOKEN_KEY (isLoggedIn)
        .mockReturnValueOnce(null) // AUTH_TOKEN_KEY (getLocalFlashcards)
        .mockReturnValueOnce(null) // flashcards (getLocalFlashcards)
        .mockReturnValueOnce(null) // AUTH_TOKEN_KEY (updateLocalCategories)
        .mockReturnValueOnce(null); // flashcard_categories (updateLocalCategories)

      await createFlashcard({
        question: 'Q',
        answer: 'A',
        category: 'New Category'
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcard_categories',
        JSON.stringify(['New Category'])
      );
    });
  });

  describe('getFlashcard', () => {
    it('should return flashcard by id', async () => {
      const mockFlashcards = [
        { id: '1', question: 'Q1', answer: 'A1' },
        { id: '2', question: 'Q2', answer: 'A2' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = await getFlashcard('1');
      expect(result).toEqual({ id: '1', question: 'Q1', answer: 'A1' });
    });

    it('should return null when flashcard not found', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const result = await getFlashcard('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('updateFlashcard', () => {
    it('should update existing flashcard', async () => {
      const mockFlashcards = [
        { id: '1', question: 'Q1', answer: 'A1', updatedAt: '2023-01-01' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const updates = { answer: 'Updated A1', difficulty: 4 };
      const result = await updateFlashcard('1', updates);

      expect(result).toMatchObject({
        id: '1',
        question: 'Q1',
        answer: 'Updated A1',
        difficulty: 4,
        updatedAt: expect.any(String)
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcards',
        expect.stringContaining('"answer":"Updated A1"')
      );
    });

    it('should update categories when category changes', async () => {
      // 重置 localStorageMock
      vi.clearAllMocks();
      
      const mockFlashcards = [{ id: '1', question: 'Q1', answer: 'A1', category: 'Old' }];
      
      // 正确的调用顺序：
      // 1. AUTH_TOKEN_KEY (isLoggedIn)
      // 2. flashcards (getLocalFlashcards)
      // 3. AUTH_TOKEN_KEY (updateLocalCategories)
      // 4. flashcard_categories (updateLocalCategories)
      // 5. AUTH_TOKEN_KEY (saveLocalFlashcardCategories)
      localStorageMock.getItem
        .mockReturnValueOnce(null) // AUTH_TOKEN_KEY (isLoggedIn)
        .mockReturnValueOnce(JSON.stringify(mockFlashcards)) // flashcards (getLocalFlashcards)
        .mockReturnValueOnce(null) // AUTH_TOKEN_KEY (updateLocalCategories)
        .mockReturnValueOnce(JSON.stringify(['Old'])) // flashcard_categories (updateLocalCategories)
        .mockReturnValueOnce(null); // AUTH_TOKEN_KEY (saveLocalFlashcardCategories)

      await updateFlashcard('1', { category: 'New Category' });

      // 验证设置分类的调用
      let categoriesSetCall = null;
      for (const call of localStorageMock.setItem.mock.calls) {
        if (call[0] === 'flashcard_categories') {
          categoriesSetCall = call;
          break;
        }
      }
      expect(categoriesSetCall).toBeDefined();
      // 解析后应该是分类数组
      const parsedCategories = JSON.parse(categoriesSetCall[1]);
      expect(Array.isArray(parsedCategories)).toBe(true);
      expect(parsedCategories).toContain('New Category');
    });

    it('should return null when flashcard not found', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const result = await updateFlashcard('nonexistent', { answer: 'test' });
      expect(result).toBeNull();
    });
  });

  describe('deleteFlashcard', () => {
    it('should delete existing flashcard', async () => {
      const mockFlashcards = [
        { id: '1', question: 'Q1', answer: 'A1' },
        { id: '2', question: 'Q2', answer: 'A2' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = await deleteFlashcard('1');

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcards',
        JSON.stringify([{ id: '2', question: 'Q2', answer: 'A2' }])
      );
    });

    it('should return false when flashcard not found', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const result = await deleteFlashcard('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getFlashcardsByCategory', () => {
    it('should filter flashcards by category', async () => {
      const mockFlashcards = [
        { id: '1', category: 'Math' },
        { id: '2', category: 'Science' },
        { id: '3', category: 'Math' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = await getFlashcardsByCategory('Math');
      expect(result).toEqual([
        { id: '1', category: 'Math' },
        { id: '3', category: 'Math' }
      ]);
    });
  });

  describe('getFlashcardsByTag', () => {
    it('should filter flashcards by tag', async () => {
      const mockFlashcards = [
        { id: '1', tags: ['math', 'algebra'] },
        { id: '2', tags: ['science'] },
        { id: '3', tags: ['math', 'geometry'] }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = await getFlashcardsByTag('math');
      expect(result).toEqual([
        { id: '1', tags: ['math', 'algebra'] },
        { id: '3', tags: ['math', 'geometry'] }
      ]);
    });
  });

  describe('getFlashcardsForReview', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2024-01-01'));
    });

    it('should return flashcards due for review', async () => {
      const mockFlashcards = [
        { id: '1', nextReviewDate: '2023-12-31' }, // Due (past date)
        { id: '2', nextReviewDate: '2024-01-02' }, // Not due (future date)
        { id: '3', nextReviewDate: '2023-12-30' }  // Due (past date)
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = await getFlashcardsForReview();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('3'); // 2023-12-30 比 2023-12-31 更早
      expect(result[1].id).toBe('1');
    });

    it('should sort flashcards by next review date', async () => {
      const mockFlashcards = [
        { id: '1', nextReviewDate: '2023-12-31' },
        { id: '2', nextReviewDate: '2023-12-25' } // Earlier date
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = await getFlashcardsForReview();

      expect(result[0].id).toBe('2'); // Earlier date first
      expect(result[1].id).toBe('1');
    });
  });

  describe('getFlashcardStats', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2024-01-01'));
    });

    it('should calculate comprehensive statistics', async () => {
      const mockFlashcards = [
        { id: '1', category: 'Math', nextReviewDate: '2023-12-31' },
        { id: '2', category: 'Science', nextReviewDate: '2024-01-02' },
        { id: '3', category: 'Math', nextReviewDate: '2024-01-01' }
      ];

      const mockHistory = [
        { timestamp: '2024-01-01T10:00:00.000Z', correct: true },
        { timestamp: '2024-01-01T11:00:00.000Z', correct: false },
        { timestamp: '2023-12-31T10:00:00.000Z', correct: true } // Different day
      ];

      // 先返回 null 作为 AUTH_TOKEN_KEY 的值，然后返回闪卡和历史数据
      localStorageMock.getItem
        .mockReturnValueOnce(null) // AUTH_TOKEN_KEY (调用 getAuthToken)
        .mockReturnValueOnce(JSON.stringify(mockFlashcards)) // flashcards (第一次调用 getLocalFlashcards)
        .mockReturnValueOnce(null) // AUTH_TOKEN_KEY (再次调用 getAuthToken)
        .mockReturnValueOnce(JSON.stringify(mockHistory)) // history (调用 getLocalLearningHistory)
        .mockReturnValueOnce(null) // AUTH_TOKEN_KEY (再次调用 getAuthToken)
        .mockReturnValueOnce(JSON.stringify(mockFlashcards)); // flashcards (第二次调用 getLocalFlashcards 计算 dueFlashcards)

      const result = await getFlashcardStats();

      expect(result).toEqual({
        totalFlashcards: 3,
        dueFlashcards: 2, // 2 cards due today or past
        todayCorrect: 1,
        todayTotal: 2,
        todayAccuracy: 50,
        overallAccuracy: 67, // 2 correct out of 3 total
        categoryStats: {
          Math: 2,
          Science: 1
        }
      });
    });

    it('should handle empty data', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const result = await getFlashcardStats();

      expect(result).toEqual({
        totalFlashcards: 0,
        dueFlashcards: 0,
        todayCorrect: 0,
        todayTotal: 0,
        todayAccuracy: 0,
        overallAccuracy: 0,
        categoryStats: {}
      });
    });
  });

  describe('batchCreateFlashcards', () => {
    it('should create multiple flashcards', async () => {
      const flashcardDataArray = [
        { question: 'Q1', answer: 'A1', category: 'Math' },
        { question: 'Q2', answer: 'A2', category: 'Science' }
      ];

      const result = await batchCreateFlashcards(flashcardDataArray);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        question: 'Q1',
        answer: 'A1',
        category: 'Math'
      });
      expect(result[1]).toMatchObject({
        question: 'Q2',
        answer: 'A2',
        category: 'Science'
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcards',
        expect.any(String)
      );
    });

    it('should update categories for new categories', async () => {
      // Mock empty categories initially
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'flashcard_categories') return null;
        if (key === 'flashcards') return null;
        return null;
      });

      await batchCreateFlashcards([
        { question: 'Q1', answer: 'A1', category: 'NewCat1' },
        { question: 'Q2', answer: 'A2', category: 'NewCat2' }
      ]);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcard_categories',
        JSON.stringify(['NewCat1', 'NewCat2'])
      );
    });
  });

  describe('getFlashcardByQuestion', () => {
    it('should find flashcard by exact question match', async () => {
      const mockFlashcards = [
        { id: '1', question: 'What is 2+2?' },
        { id: '2', question: 'What is 3+3?' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = await getFlashcardByQuestion('What is 2+2?');
      expect(result).toEqual({ id: '1', question: 'What is 2+2?' });
    });

    it('should return null when no match found', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const result = await getFlashcardByQuestion('Nonexistent question');
      expect(result).toBeNull();
    });

    it('should be case sensitive', async () => {
      const mockFlashcards = [
        { id: '1', question: 'What is 2+2?' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = await getFlashcardByQuestion('what is 2+2?');
      expect(result).toBeNull();
    });
  });

  describe('cleanFlashcardData', () => {
    it('should remove duplicate questions', () => {
      const flashcardDataArray = [
        { question: 'Q1', answer: 'A1' },
        { question: 'Q1', answer: 'A1 duplicate' },
        { question: 'Q2', answer: 'A2' },
        { question: 'Q1', answer: 'A1 another duplicate' }
      ];

      const result = cleanFlashcardData(flashcardDataArray);

      expect(result).toHaveLength(2);
      expect(result[0].question).toBe('Q1');
      expect(result[1].question).toBe('Q2');
    });

    it('should preserve order and take first occurrence', () => {
      const flashcardDataArray = [
        { question: 'Q1', answer: 'First A1' },
        { question: 'Q1', answer: 'Second A1' }
      ];

      const result = cleanFlashcardData(flashcardDataArray);

      expect(result).toHaveLength(1);
      expect(result[0].answer).toBe('First A1');
    });
  });
});