// src/hooks/usePracticeProgress.js
import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const PROGRESS_KEY = 'practiceProgress';

const INITIAL_PROGRESS = {};

/**
 * 练习进度Hook
 * @param {string} dataSource - 当前数据源
 * @param {number} totalSentences - 数据源的总句子数
 * @returns {Object} 进度数据和操作函数
 */
export function usePracticeProgress(dataSource, totalSentences = 0) {
  const [progress, setProgress] = useLocalStorage(
    PROGRESS_KEY,
    INITIAL_PROGRESS,
    1000
  );

  const updateProgress = useCallback((currentIndex, correct) => {
    setProgress(prevProgress => {
      const sourceProgress = prevProgress[dataSource] || {
        completedSentences: [],
        correctSentences: [],
        lastPracticedIndex: -1,
        progressPercentage: 0
      };

      // 更新已完成的句子列表
      const updatedCompletedSentences = [...new Set([
        ...sourceProgress.completedSentences,
        currentIndex
      ])];

      // 根据结果更新正确的句子列表
      let updatedCorrectSentences = [...sourceProgress.correctSentences];
      if (correct) {
        // 如果答对，添加到正确列表
        updatedCorrectSentences = [...new Set([...updatedCorrectSentences, currentIndex])];
      } else {
        // 如果答错，从正确列表中移除
        updatedCorrectSentences = updatedCorrectSentences.filter(index => index !== currentIndex);
      }

      const updatedProgressPercentage = totalSentences > 0
        ? Math.round((updatedCompletedSentences.length / totalSentences) * 100)
        : 0;

      return {
        ...prevProgress,
        [dataSource]: {
          ...sourceProgress,
          completedSentences: updatedCompletedSentences,
          correctSentences: updatedCorrectSentences,
          lastPracticedIndex: currentIndex,
          progressPercentage: updatedProgressPercentage
        }
      };
    });
  }, [dataSource, totalSentences]);

  const resetProgress = useCallback((source = null) => {
    const sourceToReset = source || dataSource;
    setProgress(prevProgress => {
      const newProgress = { ...prevProgress };
      delete newProgress[sourceToReset];
      return newProgress;
    });
  }, [dataSource]);

  const getProgress = useCallback((source = null) => {
    const sourceToGet = source || dataSource;
    return progress[sourceToGet] || {
      completedSentences: [],
      correctSentences: [],
      lastPracticedIndex: -1,
      progressPercentage: 0
    };
  }, [progress, dataSource]);

  return {
    progress: getProgress(),
    allProgress: progress,
    updateProgress,
    resetProgress,
    getProgress
  };
}