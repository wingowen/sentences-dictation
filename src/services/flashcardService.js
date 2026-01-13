// 闪卡服务 - 处理闪卡的存储和管理

/**
 * 闪卡数据模型
 * @typedef {Object} Flashcard
 * @property {string} id - 闪卡唯一ID
 * @property {string} question - 闪卡问题
 * @property {string} answer - 闪卡答案
 * @property {string} category - 闪卡分类
 * @property {Array<string>} tags - 闪卡标签
 * @property {number} difficulty - 难度级别（1-5）
 * @property {number} easeFactor - 间隔重复算法的难度系数
 * @property {number} repetitionCount - 重复次数
 * @property {number} interval - 下次复习间隔（天）
 * @property {Date} nextReviewDate - 下次复习日期
 * @property {Date} createdAt - 创建时间
 * @property {Date} updatedAt - 更新时间
 */

/**
 * 闪卡存储键
 */
const FLASHCARDS_STORAGE_KEY = 'flashcards';
const FLASHCARD_CATEGORIES_KEY = 'flashcard_categories';
const FLASHCARD_LEARNING_HISTORY_KEY = 'flashcard_learning_history';

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 获取所有闪卡
 * @returns {Array<Flashcard>} 闪卡数组
 */
export const getAllFlashcards = () => {
  try {
    const flashcards = localStorage.getItem(FLASHCARDS_STORAGE_KEY);
    return flashcards ? JSON.parse(flashcards) : [];
  } catch (error) {
    console.error('Error getting flashcards:', error);
    return [];
  }
};

/**
 * 获取闪卡分类
 * @returns {Array<string>} 分类数组
 */
export const getFlashcardCategories = () => {
  try {
    const categories = localStorage.getItem(FLASHCARD_CATEGORIES_KEY);
    return categories ? JSON.parse(categories) : [];
  } catch (error) {
    console.error('Error getting flashcard categories:', error);
    return [];
  }
};

/**
 * 保存闪卡分类
 * @param {Array<string>} categories - 分类数组
 */
export const saveFlashcardCategories = (categories) => {
  try {
    localStorage.setItem(FLASHCARD_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving flashcard categories:', error);
  }
};

/**
 * 获取学习历史
 * @returns {Array<Object>} 学习历史数组
 */
export const getLearningHistory = () => {
  try {
    const history = localStorage.getItem(FLASHCARD_LEARNING_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting learning history:', error);
    return [];
  }
};

/**
 * 保存学习历史
 * @param {Array<Object>} history - 学习历史数组
 */
export const saveLearningHistory = (history) => {
  try {
    localStorage.setItem(FLASHCARD_LEARNING_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving learning history:', error);
  }
};

/**
 * 添加学习记录
 * @param {string} flashcardId - 闪卡ID
 * @param {boolean} correct - 是否正确
 * @param {number} responseTime - 响应时间（毫秒）
 */
export const addLearningRecord = (flashcardId, correct, responseTime) => {
  const history = getLearningHistory();
  const record = {
    id: generateId(),
    flashcardId,
    correct,
    responseTime,
    timestamp: new Date().toISOString()
  };
  history.push(record);
  // 只保留最近1000条记录
  const trimmedHistory = history.slice(-1000);
  saveLearningHistory(trimmedHistory);
};

/**
 * 创建闪卡
 * @param {Object} flashcardData - 闪卡数据
 * @returns {Flashcard} 创建的闪卡
 */
export const createFlashcard = (flashcardData) => {
  const flashcards = getAllFlashcards();
  const newFlashcard = {
    id: generateId(),
    question: flashcardData.question,
    answer: flashcardData.answer,
    category: flashcardData.category || '默认',
    tags: flashcardData.tags || [],
    difficulty: flashcardData.difficulty || 3,
    easeFactor: 2.5, // 初始难度系数
    repetitionCount: 0,
    interval: 0,
    nextReviewDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  flashcards.push(newFlashcard);
  saveFlashcards(flashcards);
  
  // 更新分类
  updateCategories(newFlashcard.category);
  
  return newFlashcard;
};

/**
 * 更新分类
 * @param {string} category - 分类名称
 */
const updateCategories = (category) => {
  const categories = getFlashcardCategories();
  if (!categories.includes(category)) {
    categories.push(category);
    saveFlashcardCategories(categories);
  }
};

/**
 * 保存闪卡
 * @param {Array<Flashcard>} flashcards - 闪卡数组
 */
const saveFlashcards = (flashcards) => {
  try {
    localStorage.setItem(FLASHCARDS_STORAGE_KEY, JSON.stringify(flashcards));
  } catch (error) {
    console.error('Error saving flashcards:', error);
  }
};

/**
 * 获取闪卡
 * @param {string} id - 闪卡ID
 * @returns {Flashcard|null} 闪卡
 */
export const getFlashcard = (id) => {
  const flashcards = getAllFlashcards();
  return flashcards.find(flashcard => flashcard.id === id) || null;
};

/**
 * 更新闪卡
 * @param {string} id - 闪卡ID
 * @param {Object} updates - 更新数据
 * @returns {Flashcard|null} 更新后的闪卡
 */
export const updateFlashcard = (id, updates) => {
  const flashcards = getAllFlashcards();
  const index = flashcards.findIndex(flashcard => flashcard.id === id);
  
  if (index !== -1) {
    const updatedFlashcard = {
      ...flashcards[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    flashcards[index] = updatedFlashcard;
    saveFlashcards(flashcards);
    
    // 更新分类
    if (updates.category) {
      updateCategories(updates.category);
    }
    
    return updatedFlashcard;
  }
  
  return null;
};

/**
 * 删除闪卡
 * @param {string} id - 闪卡ID
 * @returns {boolean} 是否删除成功
 */
export const deleteFlashcard = (id) => {
  const flashcards = getAllFlashcards();
  const newFlashcards = flashcards.filter(flashcard => flashcard.id !== id);
  
  if (newFlashcards.length !== flashcards.length) {
    saveFlashcards(newFlashcards);
    return true;
  }
  
  return false;
};

/**
 * 批量创建闪卡
 * @param {Array<Object>} flashcardDataArray - 闪卡数据数组
 * @returns {Array<Object>} 创建的闪卡数组
 */
export const batchCreateFlashcards = (flashcardDataArray) => {
  const flashcards = getAllFlashcards();
  const createdFlashcards = [];
  
  flashcardDataArray.forEach(flashcardData => {
    const newFlashcard = {
      id: generateId(),
      question: flashcardData.question,
      answer: flashcardData.answer,
      category: flashcardData.category || '默认',
      tags: flashcardData.tags || [],
      difficulty: flashcardData.difficulty || 3,
      easeFactor: 2.5, // 初始难度系数
      repetitionCount: 0,
      interval: 0,
      nextReviewDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    flashcards.push(newFlashcard);
    createdFlashcards.push(newFlashcard);
    
    // 更新分类
    updateCategories(newFlashcard.category);
  });
  
  saveFlashcards(flashcards);
  return createdFlashcards;
};

/**
 * 检查闪卡是否存在（基于问题内容）
 * @param {string} question - 闪卡问题
 * @returns {Object|null} 存在的闪卡或null
 */
export const getFlashcardByQuestion = (question) => {
  const flashcards = getAllFlashcards();
  return flashcards.find(flashcard => 
    flashcard.question.trim() === question.trim()
  ) || null;
};

/**
 * 清理闪卡数据（移除重复项）
 * @param {Array<Object>} flashcardDataArray - 闪卡数据数组
 * @returns {Array<Object>} 清理后的闪卡数据数组
 */
export const cleanFlashcardData = (flashcardDataArray) => {
  const seenQuestions = new Set();
  return flashcardDataArray.filter(flashcardData => {
    const question = flashcardData.question.trim();
    if (seenQuestions.has(question)) {
      return false;
    }
    seenQuestions.add(question);
    return true;
  });
};

/**
 * 按分类获取闪卡
 * @param {string} category - 分类名称
 * @returns {Array<Flashcard>} 闪卡数组
 */
export const getFlashcardsByCategory = (category) => {
  const flashcards = getAllFlashcards();
  return flashcards.filter(flashcard => flashcard.category === category);
};

/**
 * 按标签获取闪卡
 * @param {string} tag - 标签名称
 * @returns {Array<Flashcard>} 闪卡数组
 */
export const getFlashcardsByTag = (tag) => {
  const flashcards = getAllFlashcards();
  return flashcards.filter(flashcard => flashcard.tags.includes(tag));
};

/**
 * 获取需要复习的闪卡
 * @returns {Array<Flashcard>} 需要复习的闪卡数组
 */
export const getFlashcardsForReview = () => {
  const flashcards = getAllFlashcards();
  const now = new Date();
  return flashcards.filter(flashcard => {
    const nextReviewDate = new Date(flashcard.nextReviewDate);
    return nextReviewDate <= now;
  }).sort((a, b) => {
    return new Date(a.nextReviewDate) - new Date(b.nextReviewDate);
  });
};

/**
 * 获取学习统计数据
 * @returns {Object} 统计数据
 */
export const getFlashcardStats = () => {
  const flashcards = getAllFlashcards();
  const history = getLearningHistory();
  
  const totalFlashcards = flashcards.length;
  const dueFlashcards = getFlashcardsForReview().length;
  
  // 计算今日学习记录
  const today = new Date().toDateString();
  const todayRecords = history.filter(record => {
    return new Date(record.timestamp).toDateString() === today;
  });
  
  const todayCorrect = todayRecords.filter(record => record.correct).length;
  const todayTotal = todayRecords.length;
  const todayAccuracy = todayTotal > 0 ? Math.round((todayCorrect / todayTotal) * 100) : 0;
  
  // 计算总体学习记录
  const totalCorrect = history.filter(record => record.correct).length;
  const totalRecords = history.length;
  const overallAccuracy = totalRecords > 0 ? Math.round((totalCorrect / totalRecords) * 100) : 0;
  
  // 按分类统计
  const categoryStats = {};
  flashcards.forEach(flashcard => {
    if (!categoryStats[flashcard.category]) {
      categoryStats[flashcard.category] = 0;
    }
    categoryStats[flashcard.category]++;
  });
  
  return {
    totalFlashcards,
    dueFlashcards,
    todayCorrect,
    todayTotal,
    todayAccuracy,
    overallAccuracy,
    categoryStats
  };
};

export default {
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
};
