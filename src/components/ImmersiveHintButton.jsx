import { useState } from 'react'
import './ImmersiveHintButton.css'

/**
 * 沉浸式提示按钮组件
 * 悬停显示气泡提示
 */
const ImmersiveHintButton = ({
  hintText,
  disabled = false
}) => {
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseEnter = () => {
    if (!disabled) setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  return (
    <div className="immersive-hint-button-container">
      {/* 主提示按钮 */}
      <button
        className={`immersive-hint-button ${disabled ? 'disabled' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        type="button"
        title="悬停查看提示"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      {/* 气泡提示 */}
      {isHovering && hintText && (
        <div className="hint-tooltip immersive-tooltip">
          {hintText}
        </div>
      )}
    </div>
  )
}

export default ImmersiveHintButton
