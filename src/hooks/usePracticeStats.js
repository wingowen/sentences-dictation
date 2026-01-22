// src/hooks/usePracticeStats.js
import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const STATS_KEY = 'practiceStats';

const INITIAL_STATS = {
  totalAttempts: 0,       // 总尝试次数
  correctAnswers: 0,      // 正确次数
  incorrectAnswers: 0,    // 错误次数
  accuracy: 0,            // 准确率
  streak: 0,              // 连续正确次数
  longestStreak: 0,       // 最长连续正确次数
  totalTime: 0,           // 总练习时间（秒）
  startTime: null         // 当前练习开始时间
};

/**
 * 练习统计Hook
 * @returns {Object} 统计数据和更新函数
 */
export function usePracticeStats() {
  const [stats, setStats, error] = useLocalStorage(
    STATS_KEY,
    INITIAL_STATS,
    1000 // 防抖1秒
  );

  const updateStats = useCallback((correct) => {
    setStats(prevStats => {
      const newStreak = correct ? prevStats.streak + 1 : 0;
      const newLongestStreak = Math.max(newStreak, prevStats.longestStreak);
      const newTotalAttempts = prevStats.totalAttempts + 1;
      const newCorrectAnswers = correct
        ? prevStats.correctAnswers + 1
        : prevStats.correctAnswers;
      const newIncorrectAnswers = correct
        ? prevStats.incorrectAnswers
        : prevStats.incorrectAnswers + 1;
      const newAccuracy = newTotalAttempts > 0
        ? Math.round((newCorrectAnswers / newTotalAttempts) * 100)
        : 0;

      return {
        ...prevStats,
        totalAttempts: newTotalAttempts,
        correctAnswers: newCorrectAnswers,
        incorrectAnswers: newIncorrectAnswers,
        accuracy: newAccuracy,
        streak: newStreak,
        longestStreak: newLongestStreak,
        startTime: prevStats.startTime || Date.now()
      };
    });
  }, []);

  const resetStats = useCallback(() => {
    const resetData = {
      ...INITIAL_STATS,
      startTime: Date.now()
    };
    setStats(resetData);
  }, []);

  return {
    stats,
    updateStats,
    resetStats,
    error
  };
}