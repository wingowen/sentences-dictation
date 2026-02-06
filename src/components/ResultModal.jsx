import React from 'react'

const ResultModal = ({ isOpen, result, correctSentence, practiceStats, onClose }) => {
  if (!isOpen || !result) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-result ${result}`}>
          <h2>
            {result === 'correct' ? '✅ Correct!' : '❌ Incorrect!'}
          </h2>
          <p className="correct-sentence">
            Correct sentence: <strong>{correctSentence}</strong>
          </p>
          {/* 显示练习状态更新 */}
          <div className="modal-stats-container">
            <div className="modal-stats-title">练习状态</div>
            <div className="modal-stats-grid">
              <div className="modal-stat-row">
                <span className="modal-stat-label">准确率:</span>
                <span className="modal-stat-value accuracy">{practiceStats.accuracy}%</span>
              </div>
              <div className="modal-stat-row">
                <span className="modal-stat-label">连续正确:</span>
                <span className="modal-stat-value streak">{practiceStats.streak}</span>
              </div>
              <div className="modal-stat-row">
                <span className="modal-stat-label">总尝试:</span>
                <span className="modal-stat-value total">{practiceStats.totalAttempts}</span>
              </div>
              <div className="modal-stat-row">
                <span className="modal-stat-label">正确/错误:</span>
                <span>
                  <span className="modal-stat-value correct">{practiceStats.correctAnswers}</span>
                  <span className="modal-stat-value" style={{ margin: '0 2px', color: 'var(--text-muted)' }}>/</span>
                  <span className="modal-stat-value incorrect">{practiceStats.incorrectAnswers}</span>
                </span>
              </div>
            </div>
          </div>
          {result === 'correct' && (
            <p className="auto-next-hint">自动跳转到下一题...</p>
          )}
          <button className="modal-close-button" onClick={onClose}>
            {result === 'correct' ? 'Next' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultModal
