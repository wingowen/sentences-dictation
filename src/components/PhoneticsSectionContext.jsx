// src/components/PhoneticsSectionContext.jsx
import React from 'react';
import PhoneticsSection from './PhoneticsSection';
import { useApp } from '../contexts/AppContext';

/**
 * 使用Context的PhoneticsSection组件
 */
function PhoneticsSectionContext() {
  const {
    currentWords,
    currentIndex,
    sentences,
    showOriginalText,
    handleToggleOriginalText,
    currentTranslation
  } = useApp();

  return (
    <PhoneticsSection
      currentWords={currentWords}
      currentIndex={currentIndex}
      totalSentences={sentences.length}
      showOriginalText={showOriginalText}
      onToggleOriginalText={handleToggleOriginalText}
      currentTranslation={currentTranslation}
    />
  );
}

export default PhoneticsSectionContext;