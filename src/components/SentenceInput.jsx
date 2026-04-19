import React, { useEffect, useRef } from 'react';
import { useSentenceInput } from '../hooks/useSentenceInput';
import { WordIndicator } from './WordIndicator';

/**
 * 句子输入组件 - 整行输入模式
 * 替代原有的单词分散输入框
 */
export function SentenceInput({ 
  targetSentence,
  onComplete,
  onWordComplete,
  onPlayWord,
  onPlaySentence,
  autoFocus = true,
  disabled = false
}) {
  const inputRef = useRef(null);
  
  const {
    input,
    currentWordIndex,
    validation,
    isCompleted,
    targetWords,
    handleInputChange,
    handleWordClick,
    reset
  } = useSentenceInput(targetSentence, onComplete, onWordComplete);

  // 当目标句子变化时重置
  useEffect(() => {
    reset();
  }, [targetSentence, reset]);

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled, targetSentence]);

  const handlePlayWord = (word) => {
    onPlayWord?.(word);
  };

  const handlePlaySentence = () => {
    onPlaySentence?.(targetSentence);
  };

  const handleKeyDown = (e) => {
    // Tab 键播放当前单词
    if (e.key === 'Tab') {
      e.preventDefault();
      const currentWord = targetWords[currentWordIndex];
      if (currentWord) {
        handlePlayWord(currentWord);
      }
    }
  };

  return (
    <div className="sentence-input-container">
      {/* 主输入框 */}
      <div className="sentence-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className={`sentence-input ${isCompleted ? 'completed' : ''}`}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入完整句子..."
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>

      {/* 单词指示器 */}
      <div className="word-indicators">
        {validation.words.map((wordResult, index) => {
          // 计算该单词是否应该显示
          // 规则：
          // 1. 初始状态所有单词都不显示
          // 2. 只有当前单词（用户正在输入）、已经正确的单词、或者前一个单词已经正确的下一个单词才显示
          let isVisible = false;
          
          // 检查是否有任何输入
          const hasAnyInput = validation.words.some(word => word.input && word.input.trim());
          
          if (hasAnyInput) {
            if (wordResult.isCurrent || wordResult.isCorrect) {
              isVisible = true;
            } else if (index > 0) {
              // 检查前一个单词是否正确
              const prevWordResult = validation.words[index - 1];
              if (prevWordResult && prevWordResult.isCorrect) {
                isVisible = true;
              }
            }
          }
          
          return (
            <WordIndicator
              key={index}
              word={wordResult.target}
              input={wordResult.input}
              isCorrect={wordResult.isCorrect}
              isCurrent={wordResult.isCurrent}
              isEmpty={wordResult.isEmpty}
              isExtra={wordResult.isExtra}
              isVisible={isVisible}
              onPlay={handlePlayWord}
              onClick={() => handleWordClick(index)}
            />
          );
        })}
      </div>

      {/* 进度提示 */}
      <div className="sentence-progress">
        <span className="progress-text">
          进度: {validation.correctCount}/{validation.wordCount} 
          ({Math.round(validation.progress * 100)}%)
        </span>
        {isCompleted && (
          <span className="completion-badge">🎉 完成!</span>
        )}
      </div>

      {/* 提示信息 */}
      <div className="input-hints">
        <span className="hint">💡 按 Tab 键播放当前单词</span>
      </div>
    </div>
  );
}

export default SentenceInput;
