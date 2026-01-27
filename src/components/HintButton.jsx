import React, { useState } from 'react';

/**
 * 提示按钮组件 - 鼠标悬停时显示小气泡提示
 * @param {Object} props
 * @param {string} props.hintText - 提示文本内容
 * @param {string} [props.position='top'] - 提示位置: 'top', 'bottom', 'left', 'right'
 * @param {string} [props.className=''] - 自定义类名
 * @param {React.ReactNode} [props.children] - 按钮内容
 */
const HintButton = ({
  hintText,
  position = 'top',
  className = '',
  children = '💡',
  ...props
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div className={`hint-button-wrapper ${className}`}>
      <button
        className="hint-button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </button>

      {/* 小气泡提示 */}
      {isHovering && hintText && (
        <div className={`hint-tooltip ${position}`}>
          {hintText}
        </div>
      )}
    </div>
  );
};

export default HintButton;