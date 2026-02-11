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
  const isCompletedRef = useRef(false) // 使用 ref 追踪完成状态，避免 useEffect 依赖问题

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
    const normalizedUser = normalize(userWord)
    const normalizedCorrect = normalize(correctWord)
    const result = normalizedUser === normalizedCorrect
    console.log(`[checkWordCorrect] 用户="${userWord}"(规范化为"${normalizedUser}") vs 正确="${correctWord}"(规范化为"${normalizedCorrect}") = ${result}`)
    return result
  }, [normalize])

  // 检查是否所有单词都正确完成
  const checkAllWordsComplete = useCallback((inputs, words) => {
    if (inputs.length !== words.length) {
      console.log(`[checkAllWordsComplete] 长度不匹配: inputs.length=${inputs.length}, words.length=${words.length}`)
      return false
    }
    const results = inputs.map((input, index) => 
      checkWordCorrect(input, words[index]?.word)
    )
    console.log(`[checkAllWordsComplete] 每个单词的检查结果:`, results)
    return results.every(r => r)
  }, [checkWordCorrect])

  // 初始化单词输入数组
  useEffect(() => {
    // 当句子索引变化时，重置所有状态
    if (currentWords.length > 0 && sentenceIndex !== lastSentenceIndexRef.current) {
      const timer = setTimeout(() => {
        setWordInputs(new Array(currentWords.length).fill(''))
        setFocusedIndex(0)
        setIsCompleted(false)
        isCompletedRef.current = false // 同时重置 ref
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
        }, 50) // 增加延迟确保DOM已更新
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
    console.log(`[ImmersiveSpelling] 输入变化: 索引=${index}, 值="${value}"`)
    
    setWordInputs(prev => {
      const newInputs = [...prev.slice(0, index), value, ...prev.slice(index + 1)]
      console.log(`[ImmersiveSpelling] 更新后的wordInputs:`, newInputs)
      return newInputs
    })

    // 检查当前单词是否正确，正确则跳转
    const userWord = value
    const correctWord = currentWords[index]?.word
    
    console.log(`[ImmersiveSpelling] 单词检查: 用户="${userWord}", 正确="${correctWord}"`)
    
    if (userWord.trim() && correctWord) {
      const isCorrect = checkWordCorrect(userWord, correctWord)
      console.log(`[ImmersiveSpelling] 单词正确性: ${isCorrect}`)
      
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
      
      // 调试日志
      console.log('[ImmersiveSpelling] 状态检查:')
      console.log('  wordInputs:', wordInputs)
      console.log('  currentWords:', currentWords.map(w => w.word))
      console.log('  allCorrect:', allCorrect)
      console.log('  isCompleted:', isCompletedRef.current)
      
      // 使用 ref 检查完成状态，避免依赖 isCompleted 导致定时器被清除
      if (allCorrect && !isCompletedRef.current) {
        console.log('[ImmersiveSpelling] 所有单词正确！触发切换...')
        
        // 标记为已完成（同时更新 ref 和 state）
        isCompletedRef.current = true
        setIsCompleted(true)
        
        // 使用更短的延迟来切换下一句，但确保UI有反馈
        const nextTimer = setTimeout(() => {
          console.log('[ImmersiveSpelling] 调用onComplete回调...')
          onComplete?.(true)
        }, 300) // 减少到300ms
        
        return () => {
          clearTimeout(nextTimer)
        }
      }
    }
  }, [wordInputs, currentWords, checkAllWordsComplete, onComplete]) // 移除 isCompleted 依赖

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
