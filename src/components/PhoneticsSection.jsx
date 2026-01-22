import React from 'react'

const PhoneticsSection = React.memo(({ currentWords, currentIndex, totalSentences, showOriginalText, onToggleOriginalText }) => {
  return (
    <div className="phonetics-section">
      <div className="progress small">
        <span>Question {currentIndex + 1} of {totalSentences}</span>
      </div>
      <div className="phonetics-list">
        {currentWords.map((wordData, index) => (
          <div key={index} className="phonetic-item">
            {showOriginalText && (
              <span className="word">{wordData.word}</span>
            )}
            {wordData.phonetic ? (
              <span className="phonetic">/{wordData.phonetic}/</span>
            ) : (
              <span className="phonetic missing">—</span>
            )}
          </div>
        ))}
        <button 
          className="toggle-text-button"
          onClick={onToggleOriginalText}
          title={showOriginalText ? '隐藏原文' : '显示原文'}
        >
          {showOriginalText ? '👁️ 隐藏原文' : '👁️‍🗨️ 显示原文'}
        </button>
      </div>
    </div>
  )
});

PhoneticsSection.displayName = 'PhoneticsSection';

export default PhoneticsSection;