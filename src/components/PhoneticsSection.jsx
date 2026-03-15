import React from 'react'

const PhoneticsSection = React.memo(({ sentences, currentIndex, totalSentences, showOriginalText, onToggleOriginalText, showTranslation, onToggleTranslation, currentTranslation }) => {
  const currentSentence = sentences[currentIndex];
  const sentenceText = typeof currentSentence === 'object' ? currentSentence?.text || '' : currentSentence || '';

  return (
    <div className="phonetics-section">
      <div className="progress small">
        <span>Question {currentIndex + 1} of {totalSentences}</span>
      </div>
      <div className="phonetics-list">
        {showTranslation && currentTranslation && (
          <div className="sentence-translation">
            <span className="translation-text">{currentTranslation}</span>
          </div>
        )}
        {showOriginalText && sentenceText && (
          <div className="original-text-display">
            <span className="original-text-content">{sentenceText}</span>
          </div>
        )}
        <div className="toggle-buttons">
          {currentTranslation && (
            <button
              className="toggle-text-button"
              onClick={onToggleTranslation}
              title={showTranslation ? '隐藏中文' : '显示中文'}
            >
              {showTranslation ? '隐藏中文' : '显示中文'}
            </button>
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
    </div>
  )
});

PhoneticsSection.displayName = 'PhoneticsSection';

export default PhoneticsSection;
