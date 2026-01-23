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

      saveFlashcardCategories(categories);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcard_categories',
        JSON.stringify(categories)
      );
    });

    it('should handle localStorage error gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => saveFlashcardCategories(['test'])).not.toThrow();
    });
  });

  describe('getLearningHistory', () => {
    it('should return empty array when no history exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getLearningHistory();
      expect(result).toEqual([]);
    });

    it('should return parsed history from localStorage', () => {
      const mockHistory = [
        { flashcardId: '1', correct: true, responseTime: 1000 }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));

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

      saveLearningHistory(history);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcard_learning_history',
        JSON.stringify(history)
      );
    });

    it('should handle localStorage error gracefully', () => {
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

    it('should limit history to 1000 records', () => {
      // Create 1001 records (1000 existing + 1 new)
      const existingHistory = Array.from({ length: 1000 }, (_, i) => ({
        id: `record${i}`,
        flashcardId: i.toString(),
        correct: true
      }));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));

      addLearningRecord('new', false, 1000);

      const callArgs = localStorageMock.setItem.mock.calls[0];
      const savedHistory = JSON.parse(callArgs[1]);
      expect(savedHistory).toHaveLength(1000); // Should be trimmed
    });
  });

  describe('createFlashcard', () => {
    it('should create and save a new flashcard', () => {
      const flashcardData = {
        question: 'What is 2+2?',
        answer: '4',
        category: 'Math',
        tags: ['arithmetic'],
        difficulty: 2
      };

      const result = createFlashcard(flashcardData);

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

    it('should use default values for missing fields', () => {
      const flashcardData = {
        question: 'Test question',
        answer: 'Test answer'
      };

      const result = createFlashcard(flashcardData);

      expect(result.category).toBe('默认');
      expect(result.tags).toEqual([]);
      expect(result.difficulty).toBe(3);
    });

    it('should update categories when creating flashcard with new category', () => {
      localStorageMock.getItem.mockReturnValueOnce(null); // categories
      localStorageMock.getItem.mockReturnValueOnce(null); // flashcards

      createFlashcard({
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
    it('should return flashcard by id', () => {
      const mockFlashcards = [
        { id: '1', question: 'Q1', answer: 'A1' },
        { id: '2', question: 'Q2', answer: 'A2' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = getFlashcard('1');
      expect(result).toEqual({ id: '1', question: 'Q1', answer: 'A1' });
    });

    it('should return null when flashcard not found', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const result = getFlashcard('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('updateFlashcard', () => {
    it('should update existing flashcard', () => {
      const mockFlashcards = [
        { id: '1', question: 'Q1', answer: 'A1', updatedAt: '2023-01-01' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const updates = { answer: 'Updated A1', difficulty: 4 };
      const result = updateFlashcard('1', updates);

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

    it('should update categories when category changes', () => {
      const mockFlashcards = [{ id: '1', question: 'Q1', answer: 'A1', category: 'Old' }];
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockFlashcards));
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(['Old'])); // categories

      updateFlashcard('1', { category: 'New Category' });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcard_categories',
        JSON.stringify(['Old', 'New Category'])
      );
    });

    it('should return null when flashcard not found', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const result = updateFlashcard('nonexistent', { answer: 'test' });
      expect(result).toBeNull();
    });
  });

  describe('deleteFlashcard', () => {
    it('should delete existing flashcard', () => {
      const mockFlashcards = [
        { id: '1', question: 'Q1', answer: 'A1' },
        { id: '2', question: 'Q2', answer: 'A2' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = deleteFlashcard('1');

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flashcards',
        JSON.stringify([{ id: '2', question: 'Q2', answer: 'A2' }])
      );
    });

    it('should return false when flashcard not found', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const result = deleteFlashcard('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getFlashcardsByCategory', () => {
    it('should filter flashcards by category', () => {
      const mockFlashcards = [
        { id: '1', category: 'Math' },
        { id: '2', category: 'Science' },
        { id: '3', category: 'Math' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = getFlashcardsByCategory('Math');
      expect(result).toEqual([
        { id: '1', category: 'Math' },
        { id: '3', category: 'Math' }
      ]);
    });
  });

  describe('getFlashcardsByTag', () => {
    it('should filter flashcards by tag', () => {
      const mockFlashcards = [
        { id: '1', tags: ['math', 'algebra'] },
        { id: '2', tags: ['science'] },
        { id: '3', tags: ['math', 'geometry'] }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = getFlashcardsByTag('math');
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

    it('should return flashcards due for review', () => {
      const mockFlashcards = [
        { id: '1', nextReviewDate: '2023-12-31' }, // Due (past date)
        { id: '2', nextReviewDate: '2024-01-02' }, // Not due (future date)
        { id: '3', nextReviewDate: '2023-12-30' }  // Due (past date)
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = getFlashcardsForReview();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
    });

    it('should sort flashcards by next review date', () => {
      const mockFlashcards = [
        { id: '1', nextReviewDate: '2023-12-31' },
        { id: '2', nextReviewDate: '2023-12-25' } // Earlier date
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = getFlashcardsForReview();

      expect(result[0].id).toBe('2'); // Earlier date first
      expect(result[1].id).toBe('1');
    });
  });

  describe('getFlashcardStats', () => {
    beforeEach(() => {
      vi.setSystemTime(new Date('2024-01-01'));
    });

    it('should calculate comprehensive statistics', () => {
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

      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockFlashcards)) // flashcards
        .mockReturnValueOnce(JSON.stringify(mockHistory)); // history

      const result = getFlashcardStats();

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

    it('should handle empty data', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const result = getFlashcardStats();

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
    it('should create multiple flashcards', () => {
      const flashcardDataArray = [
        { question: 'Q1', answer: 'A1', category: 'Math' },
        { question: 'Q2', answer: 'A2', category: 'Science' }
      ];

      const result = batchCreateFlashcards(flashcardDataArray);

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

    it('should update categories for new categories', () => {
      // Mock empty categories initially
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'flashcard_categories') return null;
        if (key === 'flashcards') return null;
        return null;
      });

      batchCreateFlashcards([
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
    it('should find flashcard by exact question match', () => {
      const mockFlashcards = [
        { id: '1', question: 'What is 2+2?' },
        { id: '2', question: 'What is 3+3?' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = getFlashcardByQuestion('What is 2+2?');
      expect(result).toEqual({ id: '1', question: 'What is 2+2?' });
    });

    it('should return null when no match found', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

      const result = getFlashcardByQuestion('Nonexistent question');
      expect(result).toBeNull();
    });

    it('should be case sensitive', () => {
      const mockFlashcards = [
        { id: '1', question: 'What is 2+2?' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlashcards));

      const result = getFlashcardByQuestion('what is 2+2?');
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