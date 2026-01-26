import React from 'react'

const PhoneticsSection = React.memo(({ sentences, currentIndex, totalSentences, showOriginalText, onToggleOriginalText, currentTranslation }) => {
  const currentSentence = sentences[currentIndex];

  return (
    <div className="phonetics-section">
      <div className="progress small">
        <span>Question {currentIndex + 1} of {totalSentences}</span>
      </div>
      <div className="phonetics-list">
        <div className="sentence-translation">
          <span className="translation-text">{currentTranslation}</span>
        </div>
        {showOriginalText && currentSentence && (
          <div className="original-text-display">
            <span className="original-text-content">{currentSentence}</span>
          </div>
        )}
        <button
          className="toggle-text-button"
          onClick={onToggleOriginalText}
          title={showOriginalText ? '隐藏原文' : '显示原文'}
        >
          {showOriginalText ? '隐藏原文' : '显示原文'}
        </button>
      </div>
    </div>
  )
});

PhoneticsSection.displayName = 'PhoneticsSection';

export default PhoneticsSection;