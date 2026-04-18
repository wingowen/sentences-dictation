import { useState, useCallback, useMemo, useEffect } from 'react';
import { SentenceValidator } from '../utils/sentenceValidator';

/**
 * 句子输入 Hook - 用于整行输入模式
 * @param {string} targetSentence - 目标句子
 * @param {Function} onComplete - 完成回调
 * @param {Function} onWordComplete - 单个单词完成回调
 */
export function useSentenceInput(targetSentence, onComplete, onWordComplete) {
  const [input, setInput] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const validator = useMemo(() => {
    return new SentenceValidator(targetSentence);
  }, [targetSentence]);

  const validation = useMemo(() => {
    validator.moveTo(currentWordIndex);
    return validator.validate(input);
  }, [input, currentWordIndex, validator]);

  // 检测是否完成
  useEffect(() => {
    if (validation.isComplete && !isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    }
  }, [validation.isComplete, isCompleted, onComplete]);

  /**
   * 处理输入变化
   */
  const handleInputChange = useCallback((value) => {
    setInput(value);
    
    // 自动检测当前输入位置
    const words = value.trim().split(/\s+/).filter(w => w.length > 0);
    
    if (value.endsWith(' ')) {
      // 最后一个单词后面有空格，说明已完成该单词
      const lastWordIndex = words.length - 1;
      const lastWord = words[lastWordIndex];
      const targetWord = validator.targetWords[lastWordIndex];
      
      if (targetWord && validator.normalize(lastWord) === validator.normalize(targetWord)) {
        setCurrentWordIndex(words.length);
        onWordComplete?.(lastWordIndex, lastWord);
      }
    } else if (words.length > 0) {
      // 正在输入当前单词
      setCurrentWordIndex(words.length - 1);
    } else {
      setCurrentWordIndex(0);
    }
  }, [validator, onWordComplete]);

  /**
   * 处理单词点击
   */
  const handleWordClick = useCallback((index) => {
    setCurrentWordIndex(index);
  }, []);

  /**
   * 跳转到下一个单词
   */
  const jumpToNextWord = useCallback(() => {
    setCurrentWordIndex(prev => {
      const next = Math.min(prev + 1, validator.targetWords.length - 1);
      return next;
    });
  }, [validator]);

  /**
   * 跳转到上一个单词
   */
  const jumpToPrevWord = useCallback(() => {
    setCurrentWordIndex(prev => Math.max(prev - 1, 0));
  }, []);

  /**
   * 重置输入
   */
  const reset = useCallback(() => {
    setInput('');
    setCurrentWordIndex(0);
    setIsCompleted(false);
  }, []);

  /**
   * 设置输入值（用于外部控制）
   */
  const setInputValue = useCallback((value) => {
    setInput(value);
  }, []);

  return {
    // 状态
    input,
    currentWordIndex,
    validation,
    isCompleted,
    targetWords: validator.getTargetWords(),
    
    // 操作方法
    handleInputChange,
    handleWordClick,
    jumpToNextWord,
    jumpToPrevWord,
    reset,
    setInputValue
  };
}

export default useSentenceInput;
