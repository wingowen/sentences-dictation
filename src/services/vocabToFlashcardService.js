import { getVocabularies, reviewVocabulary } from './vocabularyService';
import { createFlashcard, getFlashcard, updateFlashcard } from './flashcardService';

/**
 * 从生词本生成闪卡
 * @param {Object} options - 选项
 * @param {number} options.limit - 最大数量
 * @param {boolean} options.onlyDue - 只生成待复习的
 * @returns {Promise<Array>} 生成的闪卡列表
 */
export const generateFlashcardsFromVocab = async (options = {}) => {
  const { limit = 50, onlyDue = true } = options;

  const params = { limit };
  if (onlyDue) {
    params.review = 'due';
  }

  const vocabularies = await getVocabularies(params);

  const flashcards = [];
  for (const vocab of vocabularies) {
    const flashcard = await createFlashcard({
      question: vocab.sentence_context || vocab.meaning || `翻译: ${vocab.word}`,
      answer: `{{${vocab.word}}}`,
      category: '生词本',
      tags: [vocab.part_of_speech].filter(Boolean),
      difficulty: 3,
      sourceVocabId: vocab.id
    });
    flashcards.push(flashcard);
  }

  return flashcards;
};

/**
 * 学习记录回写生词本
 * @param {string} flashcardId - 闪卡ID
 * @param {boolean} correct - 是否正确
 */
export const syncLearningToVocab = async (flashcardId, correct) => {
  const flashcard = await getFlashcard(flashcardId);
  if (flashcard && flashcard.sourceVocabId) {
    await reviewVocabulary(flashcard.sourceVocabId, correct);
  }
};

export default {
  generateFlashcardsFromVocab,
  syncLearningToVocab
};
