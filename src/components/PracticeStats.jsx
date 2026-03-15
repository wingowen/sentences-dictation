import React from 'react'

const PracticeStats = ({ stats }) => {
  return (
    <div className="practice-stats-section">
      <div className="practice-stats-compact">
        <span className="stat-pill">
          准确率 <strong>{stats.accuracy}%</strong>
        </span>
        <span className="stat-pill">
          连续 <strong>{stats.streak}</strong>
        </span>
        <span className="stat-pill">
          最长 <strong>{stats.longestStreak}</strong>
        </span>
        <span className="stat-pill">
          {stats.correctAnswers}/{stats.totalAttempts}
        </span>
      </div>
    </div>
  )
}

export default PracticeStats
