import { useState, useEffect, useRef, useCallback } from 'react'
import TranslationDisplay from './TranslationDisplay'
import ImmersiveHintButton from './ImmersiveHintButton'
import './ImmersiveSpelling.css'

/**
 * 沉浸式拼写句子模式组件
 * 核心设计：极简专注，只显示中文翻译、输入框和提示图标
 * 支持逐词校验，每个单词正确后自动跳转
 */
const ImmersiveSpelling = ({
  translation,
  currentWords = [],
  sentenceIndex = 0,
  onComplete
}) => {
  const [wordInputs, setWordInputs] = useState([])
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const inputRefs = useRef([])
  const lastSentenceIndexRef = useRef(-1)

  // 规范化处理：忽略大小写、前后空格和常见标点
  const normalize = useCallback((str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:"()[\]{}_-]/g, '')
      .replace(/\s+/g, ' ')
  }, [])

  // 检查单个单词是否正确
  const checkWordCorrect = useCallback((userWord, correctWord) => {
    if (!userWord || !correctWord) return false
    return normalize(userWord) === normalize(correctWord)
  }, [normalize])

  // 检查是否所有单词都正确完成
  const checkAllWordsComplete = useCallback((inputs, words) => {
    if (inputs.length !== words.length) return false
    return inputs.every((input, index) => 
      checkWordCorrect(input, words[index]?.word)
    )
  }, [checkWordCorrect])

  // 初始化单词输入数组
  useEffect(() => {
    // 当句子索引变化时，重置所有状态
    if (currentWords.length > 0 && sentenceIndex !== lastSentenceIndexRef.current) {
      const timer = setTimeout(() => {
        setWordInputs(new Array(currentWords.length).fill(''))
        setFocusedIndex(0)
        setIsCompleted(false)
        inputRefs.current = new Array(currentWords.length).fill(null)
        lastSentenceIndexRef.current = sentenceIndex
        
        // 聚焦第一个输入框并重置光标位置
        setTimeout(() => {
          const firstInput = inputRefs.current[0]
          if (firstInput) {
            firstInput.focus()
            // 重置光标到开头
            firstInput.setSelectionRange(0, 0)
          }
        }, 10)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [currentWords.length, sentenceIndex])

  // 确保输入框渲染后光标在开头
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

  // 处理单个单词输入变化
  const handleWordInputChange = (index, value) => {
    setWordInputs(prev => {
      return [...prev.slice(0, index), value, ...prev.slice(index + 1)]
    })

    // 检查当前单词是否正确，正确则跳转
    const userWord = value
    const correctWord = currentWords[index]?.word
    
    if (userWord.trim() && correctWord) {
      const isCorrect = checkWordCorrect(userWord, correctWord)
      
      if (isCorrect && index < wordInputs.length - 1) {
        setTimeout(() => {
          if (inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus()
          }
        }, 100)
      }
    }
  }

  // 处理按键事件
  const handleKeyDown = (index, e) => {
    // 空格或回车：检查当前单词是否正确
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      const userWord = wordInputs[index]
      const correctWord = currentWords[index]?.word
      
      if (userWord.trim() && correctWord) {
        const isCorrect = checkWordCorrect(userWord, correctWord)
        
        if (isCorrect && index < wordInputs.length - 1) {
          // 单词正确，跳转到下一个输入框
          setTimeout(() => {
            inputRefs.current[index + 1]?.focus()
          }, 100)
        }
      }
    }
  }

  // 处理输入框聚焦
  const handleInputFocus = (index) => {
    setFocusedIndex(index)
  }

  // 监听所有单词完成
  useEffect(() => {
    if (wordInputs.length === currentWords.length && currentWords.length > 0) {
      const allCorrect = checkAllWordsComplete(wordInputs, currentWords)
      
      if (allCorrect && !isCompleted) {
        // 显示完成动画
        const timer = setTimeout(() => {
          setIsCompleted(true)
        }, 0)
        
        // 动画结束后切换下一句
        const nextTimer = setTimeout(() => {
          onComplete?.(true)
        }, 800)
        
        return () => {
          clearTimeout(timer)
          clearTimeout(nextTimer)
        }
      }
    }
  }, [wordInputs, currentWords, checkAllWordsComplete, isCompleted, onComplete])

  // 获取当前提示文本
  const getHintText = () => {
    if (currentWords.length > 0 && currentWords[focusedIndex]) {
      return currentWords[focusedIndex].word
    }
    return ''
  }

  // 计算输入框宽度
  const calculateInputWidth = (wordLength) => {
    const maxLength = Math.max(wordLength, 3)
    return `${maxLength * 1.2 + 2}ch`
  }

  return (
    <div className="immersive-spelling">
      {/* 中文翻译显示 */}
      <TranslationDisplay
        translation={translation}
      />

      {/* 鼓励动画 */}
      {isCompleted && (
        <div className="completion-celebration">
          <div className="checkmark-circle">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        </div>
      )}

      {/* 单词输入区 */}
      <div className={`immersive-word-inputs ${isCompleted ? 'completed' : ''}`}>
        {wordInputs.map((input, index) => {
          const isCorrect = input.trim() && currentWords[index] && 
            checkWordCorrect(input, currentWords[index].word)
          const wordLength = currentWords[index]?.word?.length || 5
          const inputWidth = calculateInputWidth(wordLength)
          const placeholder = '_'.repeat(wordLength)
          
          return (
            <div 
              key={index} 
              className={`immersive-word-wrapper ${isCorrect ? 'correct' : ''} ${focusedIndex === index ? 'focused' : ''}`}
            >
              <input
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                className={`immersive-word-input ${isCorrect ? 'word-correct' : ''}`}
                style={{ width: inputWidth }}
                value={input}
                onChange={(e) => handleWordInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => handleInputFocus(index)}
                placeholder={placeholder}
                autoFocus={index === 0}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>
          )
        })}
      </div>

      {/* 提示按钮 */}
      <div className="immersive-controls">
        <ImmersiveHintButton
          hintText={getHintText()}
          disabled={false}
        />
      </div>
    </div>
  )
}

export default ImmersiveSpelling
