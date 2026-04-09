import React from 'react'
import HintButton from './HintButton'
import Icon from './Icon'
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
    wordInputs,
    currentWords,
    handleWordInputChange,
    handleSubmit,
    listenMode,
    isSupported: speechSupported,
    handlePlay,
    handlePlayWord,
    inputRefs,
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
  const inputRefsLocal = React.useRef([]);

  // 聚焦第一个输入框
  React.useEffect(() => {
    setTimeout(() => {
      (inputRefs?.current || inputRefsLocal.current)?.[0]?.focus()
    }, 100)
  }, [wordInputs?.length])

  const onWordChange = (index, value) => {
    if (handleWordInputChange) handleWordInputChange(index, value)
  }

  const handleInputFocus = (index) => {
    setFocusedInputIndex(index)
  }

  const handleKeyDown = (index, e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      const userWord = wordInputs[index]
      const correctWord = currentWords[index]?.word

      if (userWord.trim() && correctWord) {
        const isCorrect = normalize(userWord) === normalize(correctWord)
        if (isCorrect && index < wordInputs.length - 1) {
          setTimeout(() => {
            (inputRefs?.current || inputRefsLocal.current)?.[index + 1]?.focus()
          }, 100)
        }
      }
    }
  }

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
      </div>

      {/* 控制按钮 - 所有按钮放一排 */}
      <div className="practice-card-controls">
        <button
          type="button"
          className="play-button small"
          onClick={handlePlay}
          disabled={!speechSupported || listenMode}
          title={speechSupported ? 'Play sentence' : 'Speech synthesis not supported'}
          aria-label="播放句子"
        >
          <Icon name="Play" size={16} aria-hidden="true" />
          播放
        </button>

        <button
          type="button"
          className="settings-button small"
          onClick={onToggleSettings}
          title="设置"
          aria-label="打开设置"
        >
          <Icon name="Settings" size={16} aria-hidden="true" />
          设置
        </button>

        <button
          type="button"
          className="next-sentence-button small"
          onClick={onNext}
          disabled={listenMode}
          title="切换到下一句"
          aria-label="下一句"
        >
          <Icon name="ChevronRight" size={16} aria-hidden="true" />
          下一句
        </button>

        <HintButton
          hintText={currentWords.length > 0 ? currentWords[focusedInputIndex]?.word : '暂无提示'}
          position="right"
          className="hint-button-wrapper"
          aria-label="查看提示"
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
          aria-label={currentUser ? '将当前单词加入生词本' : '登录后可使用生词本功能'}
          aria-disabled={!currentUser}
        >
          <Icon name="Book" size={16} aria-hidden="true" />
          加入生词
        </button>
      </div>

      {/* 输入区域 */}
      <form className="word-inputs-form" onSubmit={handleSubmit} aria-label="单词输入表单">
        <div className="word-inputs" role="group" aria-label="单词输入">
          {wordInputs.map((input, index) => {
            const isCorrect = input.trim() && currentWords[index] && normalize(input) === normalize(currentWords[index].word)
            const wordLength = currentWords[index]?.word?.length || 5
            const currentInputLength = input.length || wordLength
            const maxLength = Math.max(wordLength, currentInputLength)
            const calculatedWidth = Math.max(5, wordLength * 1.2 + 2);
            const clampedWidth = Math.max(4, Math.min(40, calculatedWidth))
            const inputWidth = `${clampedWidth}ch`
            const underlinePlaceholder = '_'.repeat(wordLength)

            return (
              <div key={index} className="word-input-wrapper">
                <div className="word-input-container">
                  <input
                    ref={(el) => {
                      const refs = inputRefs?.current || inputRefsLocal.current
                      if (refs) refs[index] = el
                    }}
                    type="text"
                    className={`word-input ${isCorrect ? 'word-correct' : ''}`}
                    style={{ width: inputWidth }}
                    value={input}
                    onChange={(e) => onWordChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={() => handleInputFocus(index)}
                    onClick={() => handlePlayWord?.(currentWords[index]?.word)}
                    placeholder={underlinePlaceholder}
                    autoFocus={index === 0}
                    aria-label={`第${index + 1}个单词`}
                    aria-invalid={!isCorrect && input.trim() !== ''}
                    aria-describedby={`word-hint-${index}`}
                  />
                  <button
                    type="button"
                    className="word-pronounce-button"
                    onClick={() => handlePlayWord?.(currentWords[index]?.word)}
                    disabled={!speechSupported || !currentWords[index]?.word}
                    title="点击发音"
                    tabIndex={-1}
                    aria-label="发音"
                  >
                    <Icon name="Volume2" size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </form>
    </div>
  )
})

PracticeCard.displayName = 'PracticeCard';

export default PracticeCard
