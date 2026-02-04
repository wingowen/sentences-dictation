import { forwardRef } from 'react'
import './TranslationDisplay.css'

/**
 * 中文翻译显示组件
 * 简洁设计，突出显示中文翻译
 */
const TranslationDisplay = forwardRef(({
  translation,
  onPlay,
  isPlaying = false
}, ref) => {
  if (!translation || translation === '翻译暂无') {
    return (
      <div className="translation-display" ref={ref}>
        <span className="translation-placeholder">翻译加载中...</span>
      </div>
    )
  }

  return (
    <div className="translation-display" ref={ref}>
      <span className="translation-text">{translation}</span>
      {onPlay && (
        <button
          className={`translation-play-button ${isPlaying ? 'playing' : ''}`}
          onClick={onPlay}
          title="播放翻译语音"
          type="button"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isPlaying ? (
              <>
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </>
            ) : (
              <>
                <polygon points="5 3 19 12 5 21 5 3" />
              </>
            )}
          </svg>
        </button>
      )}
    </div>
  )
})

TranslationDisplay.displayName = 'TranslationDisplay'

export default TranslationDisplay
