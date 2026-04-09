import { useLocalStorage } from './useLocalStorage'

/**
 * 自定义hook用于管理练习进度
 * @returns {[object, function, function]} - [练习进度数据, 更新进度的函数, 重置进度的函数]
 */
export const usePracticeProgress = () => {
  // 初始进度数据
  const initialProgress = {}

  // 使用localStorage存储进度数据
  const [progress, setProgress, clearProgress] = useLocalStorage('practiceProgress', initialProgress)

  // 更新进度
  const updateProgress = (dataSource, currentIndex, totalSentences, isCorrect) => {
    setProgress(prevProgress => {
      // 确保当前数据源的进度对象存在
      const sourceProgress = prevProgress[dataSource] || {
        completedSentences: [],
        correctSentences: [],
        lastPracticedIndex: -1,
        progressPercentage: 0
      }

      // 更新已完成的句子列表
      const updatedCompletedSentences = [...new Set([...sourceProgress.completedSentences, currentIndex])]
      
      // 根据结果更新正确的句子列表
      let updatedCorrectSentences = [...sourceProgress.correctSentences]
      if (isCorrect) {
        // 如果答对，添加到正确列表
        updatedCorrectSentences = [...new Set([...updatedCorrectSentences, currentIndex])]
      } else {
        // 如果答错，从正确列表中移除
        updatedCorrectSentences = updatedCorrectSentences.filter(index => index !== currentIndex)
      }
      
      const updatedProgressPercentage = Math.round((updatedCompletedSentences.length / totalSentences) * 100)
      
      return {
        ...prevProgress,
        [dataSource]: {
          ...sourceProgress,
          completedSentences: updatedCompletedSentences,
          correctSentences: updatedCorrectSentences,
          lastPracticedIndex: currentIndex,
          progressPercentage: updatedProgressPercentage
        }
      }
    })
  }

  // 重置指定数据源的进度
  const resetDataSourceProgress = (dataSource) => {
    setProgress(prevProgress => ({
      ...prevProgress,
      [dataSource]: {
        completedSentences: [],
        correctSentences: [],
        lastPracticedIndex: -1,
        progressPercentage: 0
      }
    }))
  }

  // 获取指定数据源的进度
  const getDataSourceProgress = (dataSource) => {
    return progress[dataSource] || {
      completedSentences: [],
      correctSentences: [],
      lastPracticedIndex: -1,
      progressPercentage: 0
    }
  }

  return {
    progress,
    updateProgress,
    resetDataSourceProgress,
    getDataSourceProgress
  }
};