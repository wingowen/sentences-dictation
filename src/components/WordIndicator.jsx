import React from 'react';

/**
 * 单词指示器组件
 * 显示单词的验证状态，点击即可发音
 */
export function WordIndicator({
  word,
  input,
  isCorrect,
  isCurrent,
  isEmpty,
  isExtra,
  isVisible = true,
  onPlay,
  onClick
}) {
  // 只有用户输入了内容后才显示单词，否则显示占位符
  const hasInput = input && input.trim();
  // 当前单词（isCurrent）或已填写的单词可以播放
  const canPlay = isCurrent || hasInput;
  // 决定是否显示单词
  const shouldDisplay = isVisible && (hasInput || isCurrent);
  const displayWord = shouldDisplay ? (word || input) : '\u00A0';

  const handleClick = (e) => {
    // 只有可见的单词才能被点击
    if (!isVisible) return;
    
    // 点击整个指示器播放单词（当前单词或已填写的单词）
    if (canPlay && word) {
      onPlay?.(word);
    }
    // 同时触发 onClick（用于设置当前单词索引）
    onClick?.();
  };

  return (
    <span
      className={`word-indicator
        ${isCorrect ? 'correct' : ''}
        ${isCurrent ? 'current' : ''}
        ${isEmpty ? 'empty' : ''}
        ${isExtra ? 'extra' : ''}
        ${!hasInput ? 'hidden-word' : ''}
        ${!isVisible ? 'invisible-word' : ''}`}
      onClick={handleClick}
      title={isVisible ? (canPlay ? `点击播放 "${word}"${isCorrect ? ' ✓' : ''}` : '输入单词后显示') : '完成上一个单词后显示'}
    >
      <span className="word-text">{displayWord}</span>
      {isCorrect && <span className="word-status">✓</span>}
    </span>
  );
}

export default WordIndicator;
