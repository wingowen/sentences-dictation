import { useState, useEffect } from 'react'
import './App.css'
import { getSentences } from './services/dataService'
import { speak, isSpeechSupported, cancelSpeech } from './services/speechService'
import { parseSentenceForPhonetics } from './services/pronunciationService'

function App() {
  // 状态管理
  const [sentences, setSentences] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [wordInputs, setWordInputs] = useState([]) // 按词输入的状态
  const [result, setResult] = useState(null) // null, 'correct', 'incorrect'
  const [isLoading, setIsLoading] = useState(true)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [notionUrl, setNotionUrl] = useState('') // 可以从环境变量或配置文件读取
  const [currentWords, setCurrentWords] = useState([]) // 当前句子的单词和音标

  // 初始化
  useEffect(() => {
    // 检查语音合成支持
    setSpeechSupported(isSpeechSupported())
    
    // 加载句子数据
    loadSentences()
  }, [])

  // 当当前句子变化时，更新单词和音标
  useEffect(() => {
    if (sentences[currentIndex]) {
      const sentence = sentences[currentIndex]
      // 解析句子，获取单词和音标
      const wordsWithPhonetics = parseSentenceForPhonetics(sentence)
      setCurrentWords(wordsWithPhonetics)
      
      // 初始化按词输入数组
      const initialWordInputs = wordsWithPhonetics.map(() => '')
      setWordInputs(initialWordInputs)
    }
  }, [currentIndex, sentences])

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

  // 句子比对算法（按词比较）
  const compareSentences = (wordInputs, correctSentence) => {
    // 构建用户输入的句子
    const userSentence = wordInputs.join(' ')
    
    // 规范化处理：忽略大小写、前后空格和常见标点
    const normalize = (str) => {
      return str
        .toLowerCase()
        .trim()
        .replace(/[.,!?;:"'()\[\]{}\-_]/g, '')
        .replace(/\s+/g, ' ')
    }

    return normalize(userSentence) === normalize(correctSentence)
  }

  // 处理单个单词输入变化
  const handleWordInputChange = (index, value) => {
    const newWordInputs = [...wordInputs]
    newWordInputs[index] = value
    setWordInputs(newWordInputs)
  }

  // 处理提交
  const handleSubmit = (e) => {
    e.preventDefault()
    if (wordInputs.some(input => input.trim() === '')) return

    const correct = compareSentences(wordInputs, sentences[currentIndex])
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

        {/* 音标显示部分 */}
        {currentWords.length > 0 && (
          <div className="phonetics-section">
            <h3>Words & Phonetics:</h3>
            <div className="phonetics-list">
              {currentWords.map((wordData, index) => (
                <div key={index} className="phonetic-item">
                  <span className="word">{wordData.word}</span>
                  {wordData.phonetic && (
                    <span className="phonetic">/{wordData.phonetic}/</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 按词输入部分 */}
        <form className="input-form" onSubmit={handleSubmit}>
          <label>Type what you hear (one word per blank):</label>
          <div className="word-inputs">
            {wordInputs.map((input, index) => (
              <input
                key={index}
                type="text"
                className="word-input"
                value={input}
                onChange={(e) => handleWordInputChange(index, e.target.value)}
                placeholder="_ _"
                autoFocus={index === 0}
              />
            ))}
          </div>
          
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
