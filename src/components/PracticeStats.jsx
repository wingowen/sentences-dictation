import React from 'react'

const PracticeStats = ({ stats, progress, dataSource, onResetStats, onResetProgress }) => {
  const currentProgress = progress[dataSource] || {
    completedSentences: [],
    progressPercentage: 0
  }

  return (
    <div className="practice-stats-section">
      <div className="practice-stats-header">
        <h3 className="practice-stats-title">练习状态</h3>
        <div className="practice-stats-actions">
          <button 
            onClick={onResetStats}
            className="reset-stats-button"
          >
            重置统计
          </button>
          <button 
            onClick={onResetProgress}
            className="reset-progress-button"
          >
            重置进度
          </button>
        </div>
      </div>
      
      {/* 练习进度条 */}
      <div className="practice-progress-container">
        <div className="practice-progress-header">
          <span className="practice-progress-label">当前进度</span>
          <span className="practice-progress-value">
            {currentProgress.progressPercentage}%
          </span>
        </div>
        <div className="practice-progress-bar-bg">
          <div 
            className="practice-progress-bar-fill" 
            style={{ width: `${currentProgress.progressPercentage}%` }} 
          />
        </div>
        <div className="practice-progress-footer">
          <span>已完成: {currentProgress.completedSentences?.length || 0}</span>
        </div>
      </div>
      
      <div className="practice-stats-grid">
        <div className="practice-stat-item">
          <div className="practice-stat-label">准确率</div>
          <div className="practice-stat-value accuracy">{stats.accuracy}%</div>
        </div>
        <div className="practice-stat-item">
          <div className="practice-stat-label">连续正确</div>
          <div className="practice-stat-value streak">{stats.streak}</div>
        </div>
        <div className="practice-stat-item">
          <div className="practice-stat-label">最长连续</div>
          <div className="practice-stat-value longest-streak">{stats.longestStreak}</div>
        </div>
        <div className="practice-stat-item">
          <div className="practice-stat-label">总尝试</div>
          <div className="practice-stat-value total">{stats.totalAttempts}</div>
        </div>
        <div className="practice-stat-item">
          <div className="practice-stat-label">正确</div>
          <div className="practice-stat-value correct">{stats.correctAnswers}</div>
        </div>
        <div className="practice-stat-item">
          <div className="practice-stat-label">错误</div>
          <div className="practice-stat-value incorrect">{stats.incorrectAnswers}</div>
        </div>
      </div>
    </div>
  )
}

export default PracticeStats
