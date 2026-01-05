import { useState, useEffect } from 'react'
import './App.css'
import { getSentences } from './services/dataService'
import { speak, isSpeechSupported, cancelSpeech } from './services/speechService'

function App() {
  // 状态管理
  const [sentences, setSentences] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [result, setResult] = useState(null) // null, 'correct', 'incorrect'
  const [isLoading, setIsLoading] = useState(true)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [notionUrl, setNotionUrl] = useState('') // 可以从环境变量或配置文件读取

  // 初始化
  useEffect(() => {
    // 检查语音合成支持
    setSpeechSupported(isSpeechSupported())
    
    // 加载句子数据
    loadSentences()
  }, [])

  // 加载句子数据
  const loadSentences = async () => {
    setIsLoading(true)
    try {
      const data = await getSentences(notionUrl)
      setSentences(data)
    } catch (error) {
      console.error('Error loading sentences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 句子比对算法
  const compareSentences = (userInput, correctSentence) => {
    // 规范化处理：忽略大小写、前后空格和常见标点
    const normalize = (str) => {
      return str
        .toLowerCase()
        .trim()
        .replace(/[.,!?;:"'()\[\]{}\-_]/g, '')
        .replace(/\s+/g, ' ')
    }

    return normalize(userInput) === normalize(correctSentence)
  }

  // 处理提交
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!userInput.trim()) return

    const correct = compareSentences(userInput, sentences[currentIndex])
    setResult(correct ? 'correct' : 'incorrect')
  }

  // 播放当前句子
  const handlePlay = () => {
    if (speechSupported && sentences[currentIndex]) {
      cancelSpeech() // 取消之前的朗读
      speak(sentences[currentIndex])
        .catch(error => {
          console.error('Error speaking:', error)
        })
    }
  }

  // 下一题
  const handleNext = () => {
    cancelSpeech()
    setCurrentIndex((prev) => (prev + 1) % sentences.length)
    setUserInput('')
    setResult(null)
  }

  // 重新开始
  const handleRestart = () => {
    cancelSpeech()
    setCurrentIndex(0)
    setUserInput('')
    setResult(null)
  }

  if (isLoading) {
    return <div className="loading">Loading sentences...</div>
  }

  if (sentences.length === 0) {
    return <div className="error">No sentences available. Please check your data source.</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sentence Dictation Practice</h1>
      </header>
      
      <main className="app-main">
        <div className="progress">
          <span>Question {currentIndex + 1} of {sentences.length}</span>
        </div>

        <div className="sentence-section">
          <button 
            className="play-button" 
            onClick={handlePlay}
            disabled={!speechSupported}
            title={speechSupported ? 'Play sentence' : 'Speech synthesis not supported'}
          >
            ▶️ Play
          </button>
          
          {!speechSupported && (
            <p className="speech-warning">Speech synthesis is not supported in your browser.</p>
          )}
        </div>

        <form className="input-form" onSubmit={handleSubmit}>
          <label htmlFor="user-input">Type what you hear:</label>
          <textarea
            id="user-input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter the sentence you heard..."
            rows={4}
            autoFocus
          />
          
          <div className="button-group">
            <button type="submit" className="submit-button">
              Check Answer
            </button>
            <button type="button" className="next-button" onClick={handleNext}>
              Next Question
            </button>
          </div>
        </form>

        {result && (
          <div className={`result ${result}`}>
            <h2>
              {result === 'correct' ? '✅ Correct!' : '❌ Incorrect!'}
            </h2>
            <p className="correct-sentence">
              Correct sentence: <strong>{sentences[currentIndex]}</strong>
            </p>
          </div>
        )}

        <div className="controls">
          <button type="button" className="restart-button" onClick={handleRestart}>
            🔄 Restart
          </button>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Sentence Dictation Practice Tool</p>
      </footer>
    </div>
  )
}

export default App
