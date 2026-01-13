// 间隔重复算法服务 - 实现基于SM-2的间隔重复算法

/**
 * 响应质量评分
 */
export const RESPONSE_QUALITY = {
  AGAIN: 0,      // 完全忘记，重新开始
  HARD: 1,       // 困难，需要更多练习
  GOOD: 2,       // 良好，正常间隔
  EASY: 3        // 简单，可以延长间隔
};

/**
 * 根据用户响应更新闪卡的间隔重复参数
 * @param {Object} flashcard - 闪卡对象
 * @param {number} quality - 响应质量（0-3）
 * @returns {Object} 更新后的闪卡参数
 */
export const updateSpacedRepetitionParams = (flashcard, quality) => {
  let { easeFactor, repetitionCount, interval } = flashcard;
  
  // 根据响应质量更新难度系数
  if (quality < 2) {
    // 回答错误或困难，降低难度系数
    easeFactor = Math.max(1.3, easeFactor - 0.15);
    repetitionCount = 0;
    interval = 0;
  } else {
    // 回答正确，调整难度系数
    const easeDelta = quality === 2 ? 0 : (quality === 3 ? 0.15 : -0.1);
    easeFactor = Math.max(1.3, easeFactor + easeDelta);
    repetitionCount += 1;
  }
  
  // 计算下次复习间隔
  if (repetitionCount === 0) {
    interval = 1;
  } else if (repetitionCount === 1) {
    interval = 6;
  } else {
    interval = Math.round(interval * easeFactor);
  }
  
  // 计算下次复习日期
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  return {
    easeFactor,
    repetitionCount,
    interval,
    nextReviewDate: nextReviewDate.toISOString()
  };
};

/**
 * 计算闪卡的学习状态
 * @param {Object} flashcard - 闪卡对象
 * @returns {string} 学习状态
 */
export const getFlashcardStatus = (flashcard) => {
  const now = new Date();
  const nextReviewDate = new Date(flashcard.nextReviewDate);
  
  if (flashcard.repetitionCount === 0) {
    return 'new';
  } else if (nextReviewDate <= now) {
    return 'due';
  } else {
    return 'learning';
  }
};

/**
 * 按学习优先级排序闪卡
 * @param {Array<Object>} flashcards - 闪卡数组
 * @returns {Array<Object>} 排序后的闪卡数组
 */
export const sortFlashcardsByPriority = (flashcards) => {
  return flashcards.sort((a, b) => {
    // 首先按状态排序：新卡 > 到期卡 > 学习中卡
    const statusOrder = {
      'new': 0,
      'due': 1,
      'learning': 2
    };
    
    const statusA = getFlashcardStatus(a);
    const statusB = getFlashcardStatus(b);
    
    if (statusA !== statusB) {
      return statusOrder[statusA] - statusOrder[statusB];
    }
    
    // 状态相同时，按下次复习日期排序
    return new Date(a.nextReviewDate) - new Date(b.nextReviewDate);
  });
};

/**
 * 生成学习计划
 * @param {Array<Object>} flashcards - 闪卡数组
 * @param {number} limit - 计划数量限制
 * @returns {Array<Object>} 学习计划
 */
export const generateStudyPlan = (flashcards, limit = 20) => {
  const sortedFlashcards = sortFlashcardsByPriority(flashcards);
  return sortedFlashcards.slice(0, limit);
};

export default {
  RESPONSE_QUALITY,
  updateSpacedRepetitionParams,
  getFlashcardStatus,
  sortFlashcardsByPriority,
  generateStudyPlan
};
