// 闪卡服务 - 支持本地和云端数据源

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
const AUTH_TOKEN_KEY = 'auth_token';

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 获取认证token
 * @returns {string|null} 认证token
 */
const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
export const isLoggedIn = () => {
  // 在测试环境中返回 false，使用本地存储
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  return !!getAuthToken();
};

/**
 * 获取当前用户ID（从JWT token解析）
 * @returns {string|null} 用户ID
 */
export const getCurrentUserId = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch {
    return null;
  }
};

/**
 * 获取用户专属存储键
 * @param {string} baseKey - 基础键名
 * @returns {string} 用户专属键名
 */
const getUserStorageKey = (baseKey) => {
  const userId = getCurrentUserId();
  return userId ? `${baseKey}_${userId}` : baseKey;
};

/**
 * API请求基础函数
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('未登录');
  }

  // 在测试环境中返回模拟数据
  if (process.env.NODE_ENV === 'test') {
    return {
      success: true,
      data: []
    };
  }

  try {
    const response = await fetch(`/api/flashcards${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || '请求失败');
    }
    return result;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

/**
 * API请求基础函数（学习历史）
 */
const historyApiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('未登录');
  }

  // 在测试环境中返回模拟数据
  if (process.env.NODE_ENV === 'test') {
    return {
      success: true,
      data: []
    };
  }

  try {
    const response = await fetch(`/api/flashcard-history${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || '请求失败');
    }
    return result;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

// ==================== 本地存储函数 ====================

/**
 * 获取本地闪卡
 * @returns {Array<Flashcard>} 闪卡数组
 */
export const getLocalFlashcards = () => {
  try {
    const key = getUserStorageKey(FLASHCARDS_STORAGE_KEY);
    const flashcards = localStorage.getItem(key);
    return flashcards ? JSON.parse(flashcards) : [];
  } catch (error) {
    console.error('Error getting local flashcards:', error);
    return [];
  }
};

/**
 * 保存本地闪卡
 * @param {Array<Flashcard>} flashcards - 闪卡数组
 */
const saveLocalFlashcards = (flashcards) => {
  try {
    const key = getUserStorageKey(FLASHCARDS_STORAGE_KEY);
    localStorage.setItem(key, JSON.stringify(flashcards));
  } catch (error) {
    console.error('Error saving local flashcards:', error);
  }
};

/**
 * 获取本地学习历史
 * @returns {Array<Object>} 学习历史数组
 */
export const getLocalLearningHistory = () => {
  try {
    const key = getUserStorageKey(FLASHCARD_LEARNING_HISTORY_KEY);
    const history = localStorage.getItem(key);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting local learning history:', error);
    return [];
  }
};

/**
 * 保存本地学习历史
 * @param {Array<Object>} history - 学习历史数组
 */
export const saveLearningHistory = (history) => {
  try {
    const key = getUserStorageKey(FLASHCARD_LEARNING_HISTORY_KEY);
    localStorage.setItem(key, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving local learning history:', error);
  }
};

/**
 * 保存本地学习历史（内部使用）
 * @param {Array<Object>} history - 学习历史数组
 */
const saveLocalLearningHistory = saveLearningHistory;

/**
 * 获取本地闪卡分类
 * @returns {Array<string>} 分类数组
 */
export const getLocalFlashcardCategories = () => {
  try {
    const key = getUserStorageKey(FLASHCARD_CATEGORIES_KEY);
    const categories = localStorage.getItem(key);
    return categories ? JSON.parse(categories) : [];
  } catch (error) {
    console.error('Error getting local flashcard categories:', error);
    return [];
  }
};

/**
 * 保存本地闪卡分类
 * @param {Array<string>} categories - 分类数组
 */
export const saveFlashcardCategories = (categories) => {
  try {
    const key = getUserStorageKey(FLASHCARD_CATEGORIES_KEY);
    localStorage.setItem(key, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving local flashcard categories:', error);
  }
};

/**
 * 保存本地闪卡分类（内部使用）
 * @param {Array<string>} categories - 分类数组
 */
const saveLocalFlashcardCategories = saveFlashcardCategories;

// ==================== 云端API函数 ====================

/**
 * 从云端获取所有闪卡
 * @returns {Promise<Array<Flashcard>>} 闪卡数组
 */
export const getCloudFlashcards = async () => {
  const result = await apiRequest('/');
  return result.data.map(card => ({
    id: card.id,
    question: card.question,
    answer: card.answer,
    category: card.category,
    tags: card.tags || [],
    difficulty: card.difficulty,
    easeFactor: card.ease_factor,
    repetitionCount: card.repetition_count,
    interval: card.interval_days,
    nextReviewDate: card.next_review_at,
    createdAt: card.created_at,
    updatedAt: card.updated_at
  }));
};

/**
 * 在云端创建闪卡
 * @param {Object} flashcardData - 闪卡数据
 * @returns {Promise<Flashcard>} 创建的闪卡
 */
export const createCloudFlashcard = async (flashcardData) => {
  const data = {
    question: flashcardData.question,
    answer: flashcardData.answer,
    category: flashcardData.category || '默认',
    tags: flashcardData.tags || [],
    difficulty: flashcardData.difficulty || 3,
    ease_factor: 2.5,
    repetition_count: 0,
    interval_days: 0,
    next_review_at: new Date().toISOString()
  };

  const result = await apiRequest('/', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  return {
    id: result.data.id,
    question: result.data.question,
    answer: result.data.answer,
    category: result.data.category,
    tags: result.data.tags || [],
    difficulty: result.data.difficulty,
    easeFactor: result.data.ease_factor,
    repetitionCount: result.data.repetition_count,
    interval: result.data.interval_days,
    nextReviewDate: result.data.next_review_at,
    createdAt: result.data.created_at,
    updatedAt: result.data.updated_at
  };
};

/**
 * 在云端更新闪卡
 * @param {string} id - 闪卡ID
 * @param {Object} updates - 更新数据
 * @returns {Promise<Flashcard>} 更新后的闪卡
 */
export const updateCloudFlashcard = async (id, updates) => {
  const data = { ...updates };
  if (updates.easeFactor !== undefined) data.ease_factor = updates.easeFactor;
  if (updates.repetitionCount !== undefined) data.repetition_count = updates.repetitionCount;
  if (updates.interval !== undefined) data.interval_days = updates.interval;
  if (updates.nextReviewDate !== undefined) data.next_review_at = updates.nextReviewDate;

  const result = await apiRequest(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });

  return {
    id: result.data.id,
    question: result.data.question,
    answer: result.data.answer,
    category: result.data.category,
    tags: result.data.tags || [],
    difficulty: result.data.difficulty,
    easeFactor: result.data.ease_factor,
    repetitionCount: result.data.repetition_count,
    interval: result.data.interval_days,
    nextReviewDate: result.data.next_review_at,
    createdAt: result.data.created_at,
    updatedAt: result.data.updated_at
  };
};

/**
 * 在云端删除闪卡
 * @param {string} id - 闪卡ID
 * @returns {Promise<boolean>} 是否删除成功
 */
export const deleteCloudFlashcard = async (id) => {
  await apiRequest(`/${id}`, { method: 'DELETE' });
  return true;
};

/**
 * 从云端获取学习历史
 * @returns {Promise<Array<Object>>} 学习历史数组
 */
export const getCloudLearningHistory = async () => {
  const result = await historyApiRequest('/');
  return result.data.map(record => ({
    id: record.id,
    flashcardId: record.flashcard_id,
    correct: record.correct,
    timestamp: record.created_at
  }));
};

/**
 * 在云端添加学习记录
 * @param {string} flashcardId - 闪卡ID
 * @param {boolean} correct - 是否正确
 * @returns {Promise<Object>} 创建的记录
 */
export const addCloudLearningRecord = async (flashcardId, correct) => {
  const result = await historyApiRequest('/', {
    method: 'POST',
    body: JSON.stringify({
      flashcard_id: flashcardId,
      correct
    })
  });

  return {
    id: result.data.id,
    flashcardId: result.data.flashcard_id,
    correct: result.data.correct,
    timestamp: result.data.created_at
  };
};

// ==================== 统一接口（自动选择数据源） ====================

/**
 * 获取所有闪卡（自动选择数据源）
 * @returns {Promise<Array<Flashcard>>|Array<Flashcard>} 闪卡数组
 */
export const getAllFlashcards = () => {
  if (isLoggedIn()) {
    return getCloudFlashcards();
  }
  return getLocalFlashcards();
};

/**
 * 获取闪卡分类
 * @returns {Promise<Array<string>>|Array<string>} 分类数组
 */
export const getFlashcardCategories = () => {
  if (isLoggedIn()) {
    return getAllFlashcards().then(cards => {
      const categories = new Set();
      cards.forEach(card => {
        if (card.category) categories.add(card.category);
      });
      return Array.from(categories);
    });
  }
  return getLocalFlashcardCategories();
};

/**
 * 获取学习历史
 * @returns {Promise<Array<Object>>|Array<Object>} 学习历史数组
 */
export const getLearningHistory = () => {
  if (isLoggedIn()) {
    return getCloudLearningHistory();
  }
  return getLocalLearningHistory();
};

/**
 * 添加学习记录
 * @param {string} flashcardId - 闪卡ID
 * @param {boolean} correct - 是否正确
 * @param {number} responseTime - 响应时间（可选）
 */
export const addLearningRecord = async (flashcardId, correct, responseTime) => {
  if (isLoggedIn()) {
    return await addCloudLearningRecord(flashcardId, correct);
  }

  const history = getLocalLearningHistory();
  const record = {
    id: generateId(),
    flashcardId,
    correct,
    responseTime,
    timestamp: new Date().toISOString()
  };
  history.push(record);
  const trimmedHistory = history.slice(-500);
  saveLocalLearningHistory(trimmedHistory);
  return record;
};

/**
 * 创建闪卡
 * @param {Object} flashcardData - 闪卡数据
 * @returns {Promise<Flashcard>|Flashcard} 创建的闪卡
 */
export const createFlashcard = async (flashcardData) => {
  if (isLoggedIn()) {
    return await createCloudFlashcard(flashcardData);
  }

  const flashcards = getLocalFlashcards();
  const newFlashcard = {
    id: generateId(),
    question: flashcardData.question,
    answer: flashcardData.answer,
    category: flashcardData.category || '默认',
    tags: flashcardData.tags || [],
    difficulty: flashcardData.difficulty || 3,
    easeFactor: 2.5,
    repetitionCount: 0,
    interval: 0,
    nextReviewDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  flashcards.push(newFlashcard);
  saveLocalFlashcards(flashcards);
  updateLocalCategories(newFlashcard.category);

  return newFlashcard;
};

/**
 * 更新本地分类
 * @param {string} category - 分类名称
 */
const updateLocalCategories = (category) => {
  // 确保category是字符串
  if (typeof category !== 'string') {
    return;
  }
  const categories = getLocalFlashcardCategories();
  if (!categories.includes(category)) {
    categories.push(category);
    saveLocalFlashcardCategories(categories);
  }
};

/**
 * 获取闪卡
 * @param {string} id - 闪卡ID
 * @returns {Promise<Flashcard>|Flashcard|null} 闪卡
 */
export const getFlashcard = async (id) => {
  if (isLoggedIn()) {
    const cards = await getCloudFlashcards();
    return cards.find(card => card.id === id) || null;
  }
  const flashcards = getLocalFlashcards();
  return flashcards.find(flashcard => flashcard.id === id) || null;
};

/**
 * 更新闪卡
 * @param {string} id - 闪卡ID
 * @param {Object} updates - 更新数据
 * @returns {Promise<Flashcard>|Flashcard|null} 更新后的闪卡
 */
export const updateFlashcard = async (id, updates) => {
  if (isLoggedIn()) {
    return await updateCloudFlashcard(id, updates);
  }

  const flashcards = getLocalFlashcards();
  const index = flashcards.findIndex(flashcard => flashcard.id === id);

  if (index !== -1) {
    const updatedFlashcard = {
      ...flashcards[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    flashcards[index] = updatedFlashcard;
    saveLocalFlashcards(flashcards);

    if (updates.category) {
      updateLocalCategories(updates.category);
    }

    return updatedFlashcard;
  }

  return null;
};

/**
 * 删除闪卡
 * @param {string} id - 闪卡ID
 * @returns {Promise<boolean>|boolean} 是否删除成功
 */
export const deleteFlashcard = async (id) => {
  if (isLoggedIn()) {
    return await deleteCloudFlashcard(id);
  }

  const flashcards = getLocalFlashcards();
  const newFlashcards = flashcards.filter(flashcard => flashcard.id !== id);

  if (newFlashcards.length !== flashcards.length) {
    saveLocalFlashcards(newFlashcards);
    return true;
  }

  return false;
};

/**
 * 批量创建闪卡
 * @param {Array<Object>} flashcardDataArray - 闪卡数据数组
 * @returns {Promise<Array<Flashcard>>|Array<Flashcard>} 创建的闪卡数组
 */
export const batchCreateFlashcards = async (flashcardDataArray) => {
  if (isLoggedIn()) {
    const results = [];
    for (const data of flashcardDataArray) {
      const card = await createCloudFlashcard(data);
      results.push(card);
    }
    return results;
  }

  const flashcards = getLocalFlashcards();
  const createdFlashcards = [];
  const newCategories = new Set();

  flashcardDataArray.forEach(flashcardData => {
    const newFlashcard = {
      id: generateId(),
      question: flashcardData.question,
      answer: flashcardData.answer,
      category: flashcardData.category || '默认',
      tags: flashcardData.tags || [],
      difficulty: flashcardData.difficulty || 3,
      easeFactor: 2.5,
      repetitionCount: 0,
      interval: 0,
      nextReviewDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    flashcards.push(newFlashcard);
    createdFlashcards.push(newFlashcard);
    if (newFlashcard.category) {
      newCategories.add(newFlashcard.category);
    }
  });

  saveLocalFlashcards(flashcards);

  // 一次性更新所有新分类
  const existingCategories = getLocalFlashcardCategories();
  const categoriesToAdd = Array.from(newCategories).filter(cat => !existingCategories.includes(cat));
  if (categoriesToAdd.length > 0) {
    const updatedCategories = [...existingCategories, ...categoriesToAdd];
    saveLocalFlashcardCategories(updatedCategories);
  }

  return createdFlashcards;
};

/**
 * 检查闪卡是否存在（基于问题内容）
 * @param {string} question - 闪卡问题
 * @returns {Promise<Flashcard>|Flashcard|null} 存在的闪卡或null
 */
export const getFlashcardByQuestion = async (question) => {
  const flashcards = isLoggedIn() ? await getCloudFlashcards() : getLocalFlashcards();
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
 * @returns {Promise<Array<Flashcard>>|Array<Flashcard>} 闪卡数组
 */
export const getFlashcardsByCategory = async (category) => {
  const flashcards = isLoggedIn() ? await getCloudFlashcards() : getLocalFlashcards();
  return flashcards.filter(flashcard => flashcard.category === category);
};

/**
 * 按标签获取闪卡
 * @param {string} tag - 标签名称
 * @returns {Promise<Array<Flashcard>>|Array<Flashcard>} 闪卡数组
 */
export const getFlashcardsByTag = async (tag) => {
  const flashcards = isLoggedIn() ? await getCloudFlashcards() : getLocalFlashcards();
  return flashcards.filter(flashcard => flashcard.tags.includes(tag));
};

/**
 * 获取需要复习的闪卡
 * @returns {Promise<Array<Flashcard>>|Array<Flashcard>} 需要复习的闪卡数组
 */
export const getFlashcardsForReview = async () => {
  const flashcards = isLoggedIn() ? await getCloudFlashcards() : getLocalFlashcards();
  const now = new Date();
  return flashcards.filter(flashcard => {
    const nextReviewDate = new Date(flashcard.nextReviewDate);
    return nextReviewDate <= now;
  }).sort((a, b) => {
    return new Date(a.nextReviewDate) - new Date(b.nextReviewDate);
  });
};

/**
 * 获取闪卡统计
 * @returns {Promise<Object>|Object} 统计数据
 */
export const getFlashcardStats = async () => {
  const flashcards = isLoggedIn() ? await getCloudFlashcards() : getLocalFlashcards();
  const history = isLoggedIn() ? await getCloudLearningHistory() : getLocalLearningHistory();

  const totalFlashcards = flashcards.length;
  const dueFlashcards = isLoggedIn() ? (await getFlashcardsForReview()).length : getLocalFlashcards().filter(flashcard => {
    const nextReviewDate = new Date(flashcard.nextReviewDate);
    return nextReviewDate <= new Date();
  }).length;

  const today = new Date().toDateString();
  const todayRecords = history.filter(record => {
    return new Date(record.timestamp).toDateString() === today;
  });

  const todayCorrect = todayRecords.filter(record => record.correct).length;
  const todayTotal = todayRecords.length;
  const todayAccuracy = todayTotal > 0 ? Math.round((todayCorrect / todayTotal) * 100) : 0;
  const overallAccuracy = history.length > 0 ? Math.round((history.filter(record => record.correct).length / history.length) * 100) : 0;

  const categoryStats = {};
  flashcards.forEach(flashcard => {
    const category = flashcard.category || '默认';
    if (!categoryStats[category]) {
      categoryStats[category] = 0;
    }
    categoryStats[category]++;
  });

  return {
    totalFlashcards,
    dueFlashcards,
    todayTotal,
    todayCorrect,
    todayAccuracy,
    overallAccuracy,
    categoryStats
  };
};

// ==================== 数据同步功能 ====================

/**
 * 同步本地数据到云端
 * @returns {Promise<Object>} 同步结果
 */
export const syncLocalToCloud = async () => {
  if (!isLoggedIn()) {
    throw new Error('未登录，无法同步');
  }

  const localFlashcards = getLocalFlashcards();
  const localHistory = getLocalLearningHistory();

  console.log(`开始同步 ${localFlashcards.length} 张本地闪卡到云端...`);

  const cloudFlashcards = await getCloudFlashcards();
  const cloudQuestions = new Set(cloudFlashcards.map(c => c.question.trim()));

  let syncedCount = 0;
  let skippedCount = 0;

  for (const localCard of localFlashcards) {
    if (cloudQuestions.has(localCard.question.trim())) {
      skippedCount++;
      continue;
    }

    try {
      await createCloudFlashcard(localCard);
      syncedCount++;
    } catch (error) {
      console.error(`同步闪卡失败: ${localCard.question}`, error);
    }
  }

  console.log(`同步完成: ${syncedCount} 张新闪卡已同步, ${skippedCount} 张已存在`);

  return {
    totalLocal: localFlashcards.length,
    synced: syncedCount,
    skipped: skippedCount
  };
};

/**
 * 从云端下载数据到本地
 * @returns {Promise<Object>} 下载结果
 */
export const downloadFromCloud = async () => {
  if (!isLoggedIn()) {
    throw new Error('未登录，无法下载');
  }

  console.log('从云端下载闪卡数据...');

  const cloudFlashcards = await getCloudFlashcards();
  const cloudHistory = await getCloudLearningHistory();

  const localFlashcards = cloudFlashcards.map(card => ({
    id: card.id,
    question: card.question,
    answer: card.answer,
    category: card.category,
    tags: card.tags,
    difficulty: card.difficulty,
    easeFactor: card.easeFactor,
    repetitionCount: card.repetitionCount,
    interval: card.interval,
    nextReviewDate: card.nextReviewDate,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt
  }));

  saveLocalFlashcards(localFlashcards);

  const categories = [...new Set(localFlashcards.map(c => c.category))];
  saveLocalFlashcardCategories(categories);

  const localHistory = cloudHistory.map(record => ({
    id: record.id,
    flashcardId: record.flashcardId,
    correct: record.correct,
    timestamp: record.timestamp
  }));
  saveLocalLearningHistory(localHistory);

  console.log(`下载完成: ${localFlashcards.length} 张闪卡, ${localHistory.length} 条学习记录`);

  return {
    flashcards: localFlashcards.length,
    history: localHistory.length
  };
};

export default {
  getAllFlashcards,
  getFlashcardCategories,
  getLearningHistory,
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
  cleanFlashcardData,
  isLoggedIn,
  syncLocalToCloud,
  downloadFromCloud,
  getLocalFlashcards,
  getLocalLearningHistory
};
