import React from 'react'

const PracticeStats = ({ stats, progress, dataSource, onResetStats, onResetProgress }) => {
  const currentProgress = progress[dataSource] || {
    completedSentences: [],
    progressPercentage: 0
  }

  return (
    <div className="practice-stats-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: '0', fontSize: '1.1rem', color: '#495057' }}>练习状态</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={onResetStats}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #dc3545',
              backgroundColor: '#dc3545',
              color: '#fff',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
          >
            重置统计
          </button>
          <button 
            onClick={onResetProgress}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #ffc107',
              backgroundColor: '#ffc107',
              color: '#212529',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e0a800'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ffc107'}
          >
            重置进度
          </button>
        </div>
      </div>
      
      {/* 练习进度条 */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '0.9rem', color: '#495057' }}>当前进度</span>
          <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#28a745' }}>
            {currentProgress.progressPercentage}%
          </span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#e9ecef', 
          borderRadius: '4px', 
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${currentProgress.progressPercentage}%`, 
            height: '100%', 
            backgroundColor: '#28a745', 
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.8rem', color: '#6c757d' }}>
          <span>已完成: {currentProgress.completedSentences?.length || 0}</span>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>准确率</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>{stats.accuracy}%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>连续正确</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#17a2b8' }}>{stats.streak}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>最长连续</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffc107' }}>{stats.longestStreak}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>总尝试</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#495057' }}>{stats.totalAttempts}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>正确</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>{stats.correctAnswers}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>错误</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc3545' }}>{stats.incorrectAnswers}</div>
        </div>
      </div>
    </div>
  )
}

export default PracticeStats