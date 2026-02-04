import { forwardRef, useEffect, useState } from 'react'
import './SpellingInput.css'

/**
 * 沉浸式拼写输入框组件
 * 简洁设计，底部单线边框，实时反馈
 */
const SpellingInput = forwardRef(({
  value,
  onChange,
  placeholder,
  isCorrect = false,
  showError = false,
  autoFocus = false,
  disabled = false
}, ref) => {
  const [focused, setFocused] = useState(false)

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && ref?.current) {
      ref.current.focus()
    }
  }, [autoFocus, ref])

  const handleFocus = () => setFocused(true)
  const handleBlur = () => setFocused(false)

  return (
    <div
      className={`spelling-input-wrapper
        ${focused ? 'focused' : ''}
        ${isCorrect ? 'correct' : ''}
        ${showError ? 'error' : ''}
        ${disabled ? 'disabled' : ''}
      `}
    >
      <input
        ref={ref}
        type="text"
        className="spelling-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        autoCapitalize="off"
      />
      {/* 状态指示器 */}
      {value.length > 0 && (
        <span className={`input-status ${isCorrect ? 'correct' : ''}`}>
          {isCorrect ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
        </span>
      )}
    </div>
  )
})

SpellingInput.displayName = 'SpellingInput'

export default SpellingInput
