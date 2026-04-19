import React from 'react'
import HintButton from './HintButton'
import { SentenceInput } from './SentenceInput'
import { useApp } from '../contexts/AppContext'

const PracticeCard = React.memo(({
  onBack,
  currentUser,
  onAddToVocabulary,
  onRequireLogin
}) => {
  const {
    sentences,
    currentIndex,
    showOriginalText,
    setShowOriginalText,
    showTranslation,
    setShowTranslation,
    currentTranslation,
    currentWords,
    listenMode,
    isSupported: speechSupported,
    handlePlay,
    handlePlayWord,
    setShowSettingsModal: setShowSettingsModal,
    setCurrentIndex,
    totalSentences = sentences?.length || 0
  } = useApp() || {}
  
  const onToggleSettings = () => {
    if (setShowSettingsModal) setShowSettingsModal(prev => !prev)
  }
  
  const onNext = () => {
    if (setCurrentIndex) setCurrentIndex(prev => prev + 1)
  }
  
  const currentSentence = sentences?.[currentIndex];
  const sentenceText = typeof currentSentence === 'object' ? currentSentence?.text || '' : currentSentence || '';
  const [focusedInputIndex, setFocusedInputIndex] = React.useState(0);
  const [showFullText, setShowFullText] = React.useState(false);

  const handleSentenceComplete = () => {
    // 句子完成后自动进入下一句
    setTimeout(() => {
      onNext();
    }, 1000);
  };

  const handleToggleFullText = () => {
    setShowFullText(prev => !prev);
  };

  // 生成全文内容
  const fullText = sentences?.map((sentence, index) => {
    const text = typeof sentence === 'object' ? sentence?.text || '' : sentence || '';
    return `${index + 1}. ${text}`;
  }).join('\n');

  // 检查是否有课文内容
  const hasFullText = sentences && sentences.length > 1;

  const handleWordComplete = (index, word) => {
    setFocusedInputIndex(index);
  };

  const normalize = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:"()[\]{}_-]/g, '')
      .replace(/\s+/g, ' ')
  }

  return (
    <div className="practice-card">
      <div className="practice-card-header">
        <div className="progress small">
          <span>Question {currentIndex + 1} of {totalSentences}</span>
        </div>
      </div>

      {/* 翻译和原文显示区域 */}
      <div className="practice-card-content">
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
        {showFullText && fullText && (
          <div className="full-text-modal-overlay">
            <div className="full-text-modal-content">
              <div className="full-text-header">
                <h3>课文全文</h3>
                <button
                  type="button"
                  className="close-full-text-button"
                  onClick={handleToggleFullText}
                  title="关闭全文"
                >
                  ×
                </button>
              </div>
              <pre className="full-text-content">{fullText}</pre>
            </div>
          </div>
        )}
      </div>

      {/* 控制按钮 - 所有按钮放一排 */}
      <div className="practice-card-controls">
        <button
          type="button"
          className="play-button small"
          onClick={handlePlay}
          disabled={!speechSupported || listenMode}
          title={speechSupported ? 'Play sentence' : 'Speech synthesis not supported'}
        >
          播放
        </button>

        <button
          type="button"
          className="settings-button small"
          onClick={onToggleSettings}
          title="设置"
        >
          设置
        </button>

        <button
          type="button"
          className="next-sentence-button small"
          onClick={onNext}
          disabled={listenMode}
          title="切换到下一句"
        >
          下一句
        </button>

        {hasFullText && (
          <button
            type="button"
            className="full-text-button small"
            onClick={handleToggleFullText}
            disabled={listenMode}
            title={showFullText ? '隐藏全文' : '显示全文'}
          >
            {showFullText ? '隐藏全文' : '显示全文'}
          </button>
        )}

        <HintButton
          hintText={currentWords.length > 0 ? currentWords[focusedInputIndex]?.word : '暂无提示'}
          position="right"
          className="hint-button-wrapper"
        />

        <button
          type="button"
          className={`add-vocab-button small ${!currentUser ? 'disabled' : ''}`}
          onClick={() => {
            console.log('[PracticeCard] currentUser:', currentUser);
            if (!currentUser) {
              onRequireLogin?.()
              return
            }
            if (currentWords[focusedInputIndex]) {
              onAddToVocabulary(currentWords[focusedInputIndex])
            }
          }}
          title={currentUser ? '将当前单词加入生词本' : '登录后可使用生词本功能'}
        >
          📖 加入生词
        </button>
      </div>

      {/* 输入区域 - 使用整行输入模式 */}
      <SentenceInput
        targetSentence={sentenceText}
        onComplete={handleSentenceComplete}
        onWordComplete={handleWordComplete}
        onPlayWord={handlePlayWord}
        onPlaySentence={handlePlay}
        disabled={listenMode}
      />
    </div>
  )
})

PracticeCard.displayName = 'PracticeCard';

export default PracticeCard
