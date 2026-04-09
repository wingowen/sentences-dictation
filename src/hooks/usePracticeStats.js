import { useLocalStorage } from './useLocalStorage'

/**
 * 自定义hook用于管理练习统计数据
 * @returns {[object, function, function]} - [练习统计数据, 更新统计数据的函数, 重置统计数据的函数]
 */
export const usePracticeStats = () => {
  // 初始统计数据
  const initialStats = {
    totalAttempts: 0,       // 总尝试次数
    correctAnswers: 0,      // 正确次数
    incorrectAnswers: 0,    // 错误次数
    accuracy: 0,            // 准确率
    streak: 0,              // 连续正确次数
    longestStreak: 0,       // 最长连续正确次数
    totalTime: 0,           // 总练习时间（秒）
    startTime: null          // 当前练习开始时间
  }

  // 使用localStorage存储统计数据
  const [stats, setStats, clearStats] = useLocalStorage('practiceStats', initialStats)

  // 更新统计数据
  const updateStats = (isCorrect) => {
    setStats(prevStats => {
      const newTotalAttempts = prevStats.totalAttempts + 1
      let newCorrectAnswers = prevStats.correctAnswers
      let newIncorrectAnswers = prevStats.incorrectAnswers
      let newStreak = prevStats.streak
      let newLongestStreak = prevStats.longestStreak

      if (isCorrect) {
        newCorrectAnswers += 1
        newStreak += 1
        newLongestStreak = Math.max(newStreak, prevStats.longestStreak)
      } else {
        newIncorrectAnswers += 1
        newStreak = 0
      }

      const newAccuracy = Math.round((newCorrectAnswers / newTotalAttempts) * 100)

      return {
        ...prevStats,
        totalAttempts: newTotalAttempts,
        correctAnswers: newCorrectAnswers,
        incorrectAnswers: newIncorrectAnswers,
        accuracy: newAccuracy,
        streak: newStreak,
        longestStreak: newLongestStreak
      }
    })
  }

  // 重置统计数据
  const resetStats = () => {
    const resetData = {
      ...initialStats,
      startTime: Date.now()
    }
    setStats(resetData)
  }

  // 开始练习
  const startPractice = () => {
    setStats(prevStats => ({
      ...prevStats,
      startTime: Date.now()
    }))
  }

  return {
    stats,
    updateStats,
    resetStats,
    startPractice
  }
};