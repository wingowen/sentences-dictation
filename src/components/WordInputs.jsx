import { useEffect } from 'react'

const WordInputs = ({
  wordInputs,
  currentWords,
  onWordInputChange,
  onSubmit,
  listenMode,
  speechSupported,
  speechRate,
  onPlay,
  autoPlay,
  onToggleAutoPlay,
  randomMode,
  onToggleRandomMode,
  onToggleListenMode,
  onToggleVoiceSettings,
  inputRefs,
  autoNext,
  onToggleAutoNext,
  onSpeechRateChange
}) => {
  // 聚焦第一个输入框
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
  }, [wordInputs.length, inputRefs])

  const handleWordInputChange = (index, value) => {
    onWordInputChange(index, value)
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
      .replace(/[.,!?;:"()\[\]{}_-]/g, '')
      .replace(/\s+/g, ' ')
  }

  return (
    <form className="input-form" onSubmit={onSubmit}>
      <label className="input-with-controls">
        <div className="input-controls">
          <label className="speech-rate-selector small">
            <span>语速:</span>
            <select
              value={speechRate.toFixed(1)}
              onChange={(e) => {
                if (onSpeechRateChange) {
                  onSpeechRateChange(parseFloat(e.target.value))
                }
              }}
              disabled={!speechSupported || listenMode}
              title="选择朗读语速"
            >
              <option value="0.5">0.5x (慢速)</option>
              <option value="0.75">0.75x (较慢)</option>
              <option value="1.0">1.0x (正常)</option>
              <option value="1.25">1.25x (较快)</option>
              <option value="1.5">1.5x (快速)</option>
              <option value="2.0">2.0x (很快)</option>
            </select>
          </label>
          <button 
            type="button" 
            className="play-button small"
            onClick={onPlay}
            disabled={!speechSupported || listenMode}
            title={speechSupported ? 'Play sentence' : 'Speech synthesis not supported'}
          >
            ▶️
          </button>
          <label className="auto-play-toggle small">
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => onToggleAutoPlay(e.target.checked)}
              disabled={!speechSupported || listenMode}
            />
            <span>自动朗读</span>
          </label>
          <button 
            type="button" 
            className="voice-settings-button small"
            onClick={onToggleVoiceSettings}
            disabled={!speechSupported}
            title="语音设置"
          >
            🎤 语音设置
          </button>
          <label className="random-mode-toggle small">
            <input
              type="checkbox"
              checked={randomMode}
              onChange={(e) => onToggleRandomMode(e.target.checked)}
              disabled={listenMode}
            />
            <span>随机模式</span>
          </label>
          <label className="listen-mode-toggle small">
            <input
              type="checkbox"
              checked={listenMode}
              onChange={(e) => onToggleListenMode(e.target.checked)}
              disabled={!speechSupported}
            />
            <span>听句子模式</span>
          </label>
          <label className="auto-next-toggle small">
            <input
              type="checkbox"
              checked={autoNext}
              onChange={(e) => onToggleAutoNext(e.target.checked)}
            />
            <span>自动切换下一句</span>
          </label>
        </div>
      </label>
      <div className="word-inputs">
        {wordInputs.map((input, index) => {
          const isCorrect = input.trim() && currentWords[index] && normalize(input) === normalize(currentWords[index].word)
          const wordLength = currentWords[index]?.word?.length || 5
          const currentInputLength = input.length || wordLength
          const maxLength = Math.max(wordLength, currentInputLength)
          const calculatedWidth = maxLength * 1.5 + 4
          const clampedWidth = Math.max(6, Math.min(35, calculatedWidth))
          const inputWidth = `${clampedWidth}ch`
          
          return (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              className={`word-input ${isCorrect ? 'word-correct' : ''}`}
              style={{ width: inputWidth }}
              value={input}
              onChange={(e) => handleWordInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              placeholder=""
              autoFocus={index === 0}
            />
          )
        })}
      </div>
    </form>
  )
}

export default WordInputs