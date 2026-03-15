import React from 'react'

const PhoneticsSection = React.memo(({ sentences, currentIndex, totalSentences, showOriginalText, showTranslation, currentTranslation }) => {
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
      </div>
    </div>
  )
});

PhoneticsSection.displayName = 'PhoneticsSection';

export default PhoneticsSection;
