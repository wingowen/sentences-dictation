// Flashcard Import Service - Handles importing flashcards from parsed data

import * as flashcardService from './flashcardService';
import * as markdownParserService from './markdownParserService';

/**
 * Validates flashcard data
 * @param {Object} flashcard - Flashcard data to validate
 * @returns {Object} Validation result
 */
export const validateFlashcard = (flashcard) => {
  const errors = [];
  
  if (!flashcard.question || flashcard.question.trim() === '') {
    errors.push('Question cannot be empty');
  }
  
  if (!flashcard.answer || flashcard.answer.trim() === '') {
    errors.push('Answer cannot be empty');
  }
  
  if (!flashcard.category || flashcard.category.trim() === '') {
    errors.push('Category cannot be empty');
  }
  
  if (flashcard.difficulty && (flashcard.difficulty < 1 || flashcard.difficulty > 5)) {
    errors.push('Difficulty must be between 1 and 5');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates batch of flashcards
 * @param {Array<Object>} flashcards - Array of flashcard data
 * @returns {Object} Validation result
 */
export const validateFlashcards = (flashcards) => {
  const results = {
    valid: [],
    invalid: [],
    total: flashcards.length,
    validCount: 0,
    invalidCount: 0
  };
  
  flashcards.forEach((flashcard, index) => {
    const validation = validateFlashcard(flashcard);
    if (validation.isValid) {
      results.valid.push(flashcard);
      results.validCount++;
    } else {
      results.invalid.push({
        index,
        flashcard,
        errors: validation.errors
      });
      results.invalidCount++;
    }
  });
  
  return results;
};

/**
 * Imports flashcards from parsed data
 * @param {Object} parsedData - Parsed flashcard data
 * @returns {Object} Import result
 */
export const importFlashcards = (parsedData) => {
  try {
    const { flashcards } = parsedData;
    
    // Validate flashcards
    const validationResults = validateFlashcards(flashcards);
    
    // Import valid flashcards
    const importedFlashcards = [];
    validationResults.valid.forEach(flashcardData => {
      const importedFlashcard = flashcardService.createFlashcard(flashcardData);
      importedFlashcards.push(importedFlashcard);
    });
    
    const result = {
      success: true,
      total: validationResults.total,
      imported: validationResults.validCount,
      failed: validationResults.invalidCount,
      flashcards: importedFlashcards,
      errors: validationResults.invalid
    };
    
    // Log import results
    console.log('Flashcard import completed:', result);
    
    return result;
  } catch (error) {
    console.error('Error importing flashcards:', error);
    return {
      success: false,
      error: error.message,
      total: 0,
      imported: 0,
      failed: 0,
      flashcards: [],
      errors: []
    };
  }
};

/**
 * Imports flashcards from Markdown file
 * @param {string} filePath - Path to Markdown file
 * @returns {Promise<Object>} Import result
 */
export const importFlashcardsFromFile = async (filePath) => {
  try {
    // Read and parse Markdown file
    const parsedData = await markdownParserService.readAndParseMarkdownFile(filePath);
    
    // Import flashcards
    const importResult = importFlashcards(parsedData);
    
    return {
      ...importResult,
      source: filePath
    };
  } catch (error) {
    console.error('Error importing flashcards from file:', error);
    return {
      success: false,
      error: error.message,
      total: 0,
      imported: 0,
      failed: 0,
      flashcards: [],
      errors: [],
      source: filePath
    };
  }
};

/**
 * Imports flashcards from File object
 * @param {File} file - File object
 * @returns {Promise<Object>} Import result
 */
export const importFlashcardsFromFileObject = async (file) => {
  try {
    // Parse file content
    const parsedData = await markdownParserService.parseFlashcardFile(file);
    
    // Import flashcards
    const importResult = importFlashcards(parsedData);
    
    return {
      ...importResult,
      source: file.name
    };
  } catch (error) {
    console.error('Error importing flashcards from file object:', error);
    return {
      success: false,
      error: error.message,
      total: 0,
      imported: 0,
      failed: 0,
      flashcards: [],
      errors: [],
      source: file.name
    };
  }
};

/**
 * Gets import statistics
 * @param {Object} importResult - Import result
 * @returns {Object} Statistics
 */
export const getImportStatistics = (importResult) => {
  if (!importResult.success) {
    return {
      success: false,
      error: importResult.error,
      total: 0,
      imported: 0,
      failed: 0,
      successRate: 0
    };
  }
  
  const successRate = importResult.total > 0 
    ? Math.round((importResult.imported / importResult.total) * 100)
    : 0;
  
  return {
    success: true,
    total: importResult.total,
    imported: importResult.imported,
    failed: importResult.failed,
    successRate,
    source: importResult.source
  };
};

export default {
  validateFlashcard,
  validateFlashcards,
  importFlashcards,
  importFlashcardsFromFile,
  importFlashcardsFromFileObject,
  getImportStatistics
};