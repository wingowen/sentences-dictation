import { useEffect, useState } from 'react'
import HintButton from './HintButton'

const WordInputs = ({
  wordInputs,
  currentWords,
  onWordInputChange,
  onSubmit,
  listenMode,
  speechSupported,
  onPlay,
  inputRefs,
  onToggleSettings,
  onNext,
  showCounter
}) => {
  const [focusedInputIndex, setFocusedInputIndex] = useState(0)


  // 调试：打印 currentWords 的变化
  useEffect(() => {
    console.log('=== WordInputs Debug ===')
    console.log('currentWords:', currentWords)
    console.log('currentWords.length:', currentWords?.length)
    console.log('focusedInputIndex:', focusedInputIndex)
    console.log('wordInputs:', wordInputs)
  }, [currentWords, focusedInputIndex, wordInputs])
  // 聚焦第一个输入框
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
  }, [wordInputs.length, inputRefs])

   const handleWordInputChange = (index, value) => {
     onWordInputChange(index, value)
   }

   const handleInputFocus = (index) => {
     setFocusedInputIndex(index)
   }

    const handleInputBlur = () => {
      // 输入框失去焦点时的处理逻辑
    }

  const handleKeyDown = (index, e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      // 检查当前单词是否正确
      const userWord = wordInputs[index]
      const correctWord = currentWords[index]?.word
      
      if (userWord.trim() && correctWord) {
        const isCorrect = normalize(userWord) === normalize(correctWord)
        
        if (isCorrect && index < wordInputs.length - 1) {
          // 单词正确，跳转到下一个输入框
          setTimeout(() => {
            inputRefs.current[index + 1]?.focus()
          }, 100)
        }
      }
    }
  }

  // 规范化处理：忽略大小写、前后空格和常见标点
  const normalize = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:"()[\]{}_-]/g, '')
      .replace(/\s+/g, ' ')
  }

  return (
    <form className="input-form" onSubmit={onSubmit}>
      <label className="input-with-controls">
        <div className="input-controls">
          <button
            type="button"
            className="play-button small"
            onClick={onPlay}
            disabled={!speechSupported || listenMode}
            title={speechSupported ? 'Play sentence' : 'Speech synthesis not supported'}
          >
            播放
          </button>

          <button
            type="button"
            className="settings-button small"
            onClick={onToggleSettings}
            title="设置"
          >
            设置
          </button>
           <button
             type="button"
             className="next-sentence-button small"
             onClick={onNext}
             disabled={listenMode}
             title="切换到下一句"
           >
             下一句
           </button>
           
           {/* 全局提示按钮 */}
            <HintButton
              hintText={currentWords.length > 0 ? currentWords[focusedInputIndex]?.word : '暂无提示'}
              position="right"
              className="hint-button-wrapper"
            />
        </div>
      </label>
      <div className="word-inputs">
        {wordInputs.map((input, index) => {
          const isCorrect = input.trim() && currentWords[index] && normalize(input) === normalize(currentWords[index].word)
          const wordLength = currentWords[index]?.word?.length || 5
          const currentInputLength = input.length || wordLength
          const maxLength = Math.max(wordLength, currentInputLength)
          const calculatedWidth = maxLength * 1.2 + 2
          const clampedWidth = Math.max(4, Math.min(40, calculatedWidth))
          const inputWidth = `${clampedWidth}ch`
          const underlinePlaceholder = '_'.repeat(wordLength)
          // 计算已输入的字母数（排除空格）
          const inputCharCount = input.replace(/\s/g, '').length

           return (
             <div key={index} className="word-input-wrapper">
               <input
                 ref={(el) => (inputRefs.current[index] = el)}
                 type="text"
                 className={`word-input ${isCorrect ? 'word-correct' : ''}`}
                 style={{ width: inputWidth }}
                 value={input}
                 onChange={(e) => handleWordInputChange(index, e.target.value)}
                 onKeyDown={(e) => handleKeyDown(index, e)}
                 onFocus={() => handleInputFocus(index)}
                 onBlur={handleInputBlur}
                 placeholder={underlinePlaceholder}
                 autoFocus={index === 0}
               />
               {showCounter && (
                 <div className="word-input-counter">
                   {inputCharCount} / {wordLength}
                 </div>
               )}
             </div>
           )
        })}
      </div>
    </form>
  )
}

export default WordInputs