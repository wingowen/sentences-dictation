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
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '6px', 
            border: '1px solid #dee2e6'
          }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '8px', color: '#495057' }}>练习状态</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>准确率:</span>
                <span style={{ marginLeft: '5px', fontWeight: '500', color: '#28a745' }}>{practiceStats.accuracy}%</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>连续正确:</span>
                <span style={{ marginLeft: '5px', fontWeight: '500', color: '#17a2b8' }}>{practiceStats.streak}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>总尝试:</span>
                <span style={{ marginLeft: '5px', fontWeight: '500', color: '#495057' }}>{practiceStats.totalAttempts}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>正确/错误:</span>
                <span style={{ marginLeft: '5px', fontWeight: '500', color: '#28a745' }}>{practiceStats.correctAnswers}</span>
                <span style={{ marginLeft: '5px', fontWeight: '500', color: '#dc3545' }}>/{practiceStats.incorrectAnswers}</span>
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