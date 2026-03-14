import { useState, useEffect, useRef, useCallback } from 'react'
import { speak, cancelSpeech, isSpeechSupported } from '../../services/speechService'
import { debounce } from '../../utils/debounce'
import './PracticeLayout.css'

/**
 * 练习页面主组件
 * 按照设计规范 V1.0 实现：
 * - 顶部导航栏 (48px)
 * - 全局进度条 (4px)
 * - 核心练习卡片 (max-width 800px)
 * - 统计抽屉 (右侧滑入)
 */
const PracticePage = ({
  translation,
  currentWords = [],
  sentenceIndex = 0,
  totalSentences = 0,
  showOriginalText = false,
  originalSentence = '',
  practiceStats,
  practiceProgress,
  dataSource,
  autoNext = true,
  autoPlay = true,
  speechSupported = true,
  onComplete,
  onNext,
  onBack,
  onToggleOriginalText,
  onPlayAudio,
  onResetStats,
  onResetProgress,
}) => {
  // 单词输入状态
  const [wordInputs, setWordInputs] = useState([])
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [lastSentenceIndex, setLastSentenceIndex] = useState(-1)

  // 统计抽屉
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Refs
  const inputRefs = useRef([])
  const isCompletedRef = useRef(false)

  // 规范化处理
  const normalize = useCallback((str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:"()[\]{}_-]/g, '')
      .replace(/\s+/g, ' ')
  }, [])

  // 检查单个单词
  const checkWordCorrect = useCallback((userWord, correctWord) => {
    if (!userWord || !correctWord) return false
    return normalize(userWord) === normalize(correctWord)
  }, [normalize])

  // 检查所有单词完成
  const checkAllWordsComplete = useCallback((inputs, words) => {
    if (inputs.length !== words.length) return false
    return inputs.every((input, index) =>
      checkWordCorrect(input, words[index]?.word)
    )
  }, [checkWordCorrect])

  // 计算进度
  const progress = practiceProgress?.[dataSource] || {
    completedSentences: [],
    correctSentences: [],
    progressPercentage: 0
  }
  const progressPercent = totalSentences > 0
    ? Math.round(((sentenceIndex + 1) / totalSentences) * 100)
    : 0

  // 初始化/切换句子时重置
  useEffect(() => {
    if (currentWords.length > 0 && sentenceIndex !== lastSentenceIndex) {
      setWordInputs(new Array(currentWords.length).fill(''))
      setFocusedIndex(0)
      setIsCompleted(false)
      isCompletedRef.current = false
      inputRefs.current = new Array(currentWords.length).fill(null)
      setLastSentenceIndex(sentenceIndex)

      // 聚焦第一个输入框
      setTimeout(() => {
        const firstInput = inputRefs.current[0]
        if (firstInput) {
          firstInput.focus()
          firstInput.setSelectionRange(0, 0)
        }
      }, 50)
    }
  }, [currentWords.length, sentenceIndex, lastSentenceIndex])

  // 确保空输入时光标在开头
  useEffect(() => {
    if (wordInputs.length > 0 && wordInputs.every(v => v === '') && inputRefs.current[0]) {
      const timer = setTimeout(() => {
        const firstInput = inputRefs.current[0]
        if (firstInput) {
          firstInput.focus()
          firstInput.setSelectionRange(0, 0)
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [wordInputs])

  // 处理输入变化（防抖）
  const handleWordInputChange = useCallback(debounce((index, value) => {
    setWordInputs(prev => {
      const newInputs = [...prev]
      newInputs[index] = value
      return newInputs
    })

    const userWord = value
    const correctWord = currentWords[index]?.word

    if (userWord.trim() && correctWord) {
      const isCorrect = checkWordCorrect(userWord, correctWord)
      if (isCorrect && index < wordInputs.length - 1) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus()
        }, 100)
      }
    }
  }, 150), [checkWordCorrect, wordInputs.length, currentWords])

  // 按键处理
  const handleKeyDown = (index, e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      const userWord = wordInputs[index]
      const correctWord = currentWords[index]?.word

      if (userWord?.trim() && correctWord) {
        const isCorrect = checkWordCorrect(userWord, correctWord)
        if (isCorrect && index < wordInputs.length - 1) {
          setTimeout(() => {
            inputRefs.current[index + 1]?.focus()
          }, 100)
        }
      }
    }
  }

  // 监听完成
  useEffect(() => {
    if (wordInputs.length === currentWords.length && currentWords.length > 0) {
      const allCorrect = checkAllWordsComplete(wordInputs, currentWords)

      if (allCorrect && !isCompletedRef.current) {
        isCompletedRef.current = true
        setIsCompleted(true)

        setTimeout(() => {
          onComplete?.(true)
        }, 300)
      }
    }
  }, [wordInputs, currentWords, checkAllWordsComplete, onComplete])

  // 键盘快捷键
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Escape 关闭抽屉
      if (e.key === 'Escape') {
        if (drawerOpen) {
          setDrawerOpen(false)
        }
      }
      // R 键播放音频（非输入状态）
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault()
        onPlayAudio?.()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [drawerOpen, onPlayAudio])

  // 计算输入框宽度
  const calculateInputWidth = (wordLength) => {
    const maxLength = Math.max(wordLength, 3)
    return `${maxLength * 1.2 + 2}ch`
  }

  // 获取提示文本
  const getHintText = () => {
    if (currentWords.length > 0 && currentWords[focusedIndex]) {
      return currentWords[focusedIndex].word
    }
    return ''
  }

  return (
    <div className="practice-layout">
      {/* === 顶部导航栏 (48px) === */}
      <header className="practice-navbar">
        <div className="navbar-left">
          <button className="navbar-back-btn" onClick={onBack} title="返回">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>返回</span>
          </button>
        </div>

        <div className="navbar-center">
          <span className="navbar-counter">
            <span className="current">{sentenceIndex + 1}</span>
            <span className="separator">/</span>
            <span className="total">{totalSentences}</span>
          </span>
        </div>

        <div className="navbar-right">
          {/* 显示原文按钮 */}
          <button
            className={`navbar-icon-btn ${showOriginalText ? 'active' : ''}`}
            onClick={onToggleOriginalText}
            title="显示/隐藏原文"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          {/* 统计按钮 */}
          <button
            className={`navbar-icon-btn ${drawerOpen ? 'active' : ''}`}
            onClick={() => setDrawerOpen(true)}
            title="查看统计"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
          </button>
        </div>
      </header>

      {/* === 全局进度条 (4px) === */}
      <div className="practice-progress-bar">
        <div
          className="practice-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* === 主内容区 === */}
      <main className="practice-main">
        <div className="practice-container">

          {/* 原文显示（可选） */}
          {showOriginalText && originalSentence && (
            <div className="practice-card original-text-card">
              <div className="original-text-label">原文</div>
              <div className="original-text-content">{originalSentence}</div>
            </div>
          )}

          {/* 翻译卡片 */}
          <div className="practice-card translation-card">
            {translation && translation !== '翻译暂无' ? (
              <>
                <div className="translation-label">中文翻译</div>
                <div className="translation-content">{translation}</div>
              </>
            ) : (
              <div className="translation-placeholder">翻译加载中...</div>
            )}
          </div>

          {/* 拼写练习卡片 */}
          <div className="practice-card spelling-card">
            <div className="spelling-header">
              <span className="spelling-title">听写练习</span>
              <span className="spelling-mode-badge">沉浸式</span>
            </div>

            {/* 完成动画 */}
            {isCompleted && (
              <div className="completion-overlay">
                <svg className="completion-check" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="25" fill="none" stroke="#00B42A" strokeWidth="3"
                    strokeDasharray="166" strokeDashoffset="166"
                    style={{ animation: 'stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards' }}
                  />
                  <path fill="none" stroke="#00B42A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                    strokeDasharray="48" strokeDashoffset="48"
                    style={{ animation: 'stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.4s forwards' }}
                  />
                </svg>
              </div>
            )}

            {/* 单词输入区 */}
            <div className={`spelling-inputs ${isCompleted ? 'completed' : ''}`}>
              {wordInputs.map((input, index) => {
                const isCorrect = input.trim() && currentWords[index] &&
                  checkWordCorrect(input, currentWords[index].word)
                const wordLength = currentWords[index]?.word?.length || 5
                const inputWidth = calculateInputWidth(wordLength)
                const placeholder = '_'.repeat(wordLength)

                return (
                  <div
                    key={index}
                    className={`spelling-word-wrapper ${isCorrect ? 'correct' : ''} ${focusedIndex === index ? 'focused' : ''}`}
                  >
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      className={`spelling-word-input ${isCorrect ? 'word-correct' : ''}`}
                      style={{ width: inputWidth }}
                      value={input}
                      onChange={(e) => handleWordInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onFocus={() => setFocusedIndex(index)}
                      placeholder={placeholder}
                      autoFocus={index === 0 && wordInputs.every(v => v === '')}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      aria-label={`单词 ${index + 1}`}
                    />
                  </div>
                )
              })}
            </div>

            {/* 操作按钮区 */}
            <div className="spelling-actions">
              <AudioPlayButton
                onClick={onPlayAudio}
                disabled={!speechSupported}
              />
              <HintButton hintText={getHintText()} />
              <button
                className="next-btn"
                onClick={onNext}
                title="下一题 (N)"
              >
                下一题
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* 快捷键提示 */}
          <div className="keyboard-hints">
            <span className="keyboard-hint"><kbd>Tab</kbd> 切换单词</span>
            <span className="keyboard-hint"><kbd>Space</kbd> / <kbd>Enter</kbd> 确认单词</span>
            <span className="keyboard-hint"><kbd>R</kbd> 播放音频</span>
            <span className="keyboard-hint"><kbd>Esc</kbd> 关闭面板</span>
          </div>

        </div>
      </main>

      {/* === 统计抽屉 === */}
      {drawerOpen && (
        <>
          <div
            className="practice-drawer-overlay"
            onClick={() => setDrawerOpen(false)}
          />
          <StatsDrawer
            stats={practiceStats}
            progress={progress}
            totalSentences={totalSentences}
            onClose={() => setDrawerOpen(false)}
            onResetStats={onResetStats}
            onResetProgress={onResetProgress}
          />
        </>
      )}

      {/* Stroke 动画 keyframes */}
      <style>{`
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}

/* === 音频播放按钮 === */
const AudioPlayButton = ({ onClick, disabled }) => (
  <button
    className="audio-btn"
    onClick={onClick}
    disabled={disabled}
    title="播放音频 (R)"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
    播放
  </button>
)

/* === 提示按钮 === */
const HintButton = ({ hintText }) => {
  const [showHint, setShowHint] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        className="hint-btn"
        onMouseEnter={() => setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
        title="悬停查看提示"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
      {showHint && hintText && (
        <div style={{
          position: 'absolute',
          bottom: '54px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 14px',
          background: '#1D2129',
          color: 'white',
          fontSize: '14px',
          fontFamily: '"SF Mono", "Menlo", monospace',
          borderRadius: '8px',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 100,
          animation: 'tooltipFadeIn 0.2s ease',
        }}>
          {hintText}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '6px solid transparent',
            borderTopColor: '#1D2129',
          }} />
        </div>
      )}
    </div>
  )
}

/* === 统计抽屉 === */
const StatsDrawer = ({ stats, progress, totalSentences, onClose, onResetStats, onResetProgress }) => (
  <div className="practice-drawer">
    <div className="drawer-header">
      <span className="drawer-title">练习统计</span>
      <button className="drawer-close-btn" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <div className="drawer-content">
      {/* 进度统计 */}
      <div className="stats-section">
        <div className="stats-section-title">当前进度</div>
        <div className="progress-stats">
          <div className="progress-stats-header">
            <span className="progress-stats-label">完成度</span>
            <span className="progress-stats-value">{progress.progressPercentage || 0}%</span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress.progressPercentage || 0}%` }}
            />
          </div>
          <div className="progress-stats-footer">
            <span>已完成 {progress.completedSentences?.length || 0} / {totalSentences}</span>
            <span>正确 {progress.correctSentences?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* 核心统计 */}
      <div className="stats-section">
        <div className="stats-section-title">练习数据</div>
        <div className="stats-grid">
          <div className="stats-item">
            <div className="stats-item-value success">{stats?.accuracy || 0}%</div>
            <div className="stats-item-label">准确率</div>
          </div>
          <div className="stats-item">
            <div className="stats-item-value primary">{stats?.streak || 0}</div>
            <div className="stats-item-label">连续正确</div>
          </div>
          <div className="stats-item">
            <div className="stats-item-value">{stats?.longestStreak || 0}</div>
            <div className="stats-item-label">最长连续</div>
          </div>
          <div className="stats-item">
            <div className="stats-item-value">{stats?.totalAttempts || 0}</div>
            <div className="stats-item-label">总尝试</div>
          </div>
          <div className="stats-item">
            <div className="stats-item-value success">{stats?.correctAnswers || 0}</div>
            <div className="stats-item-label">正确</div>
          </div>
          <div className="stats-item">
            <div className="stats-item-value error">{stats?.incorrectAnswers || 0}</div>
            <div className="stats-item-label">错误</div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="stats-actions">
        <button className="stats-action-btn warning" onClick={onResetProgress}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          重置练习进度
        </button>
        <button className="stats-action-btn danger" onClick={onResetStats}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          重置统计数据
        </button>
      </div>
    </div>
  </div>
)

export default PracticePage
