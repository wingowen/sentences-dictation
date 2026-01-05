import { useState, useEffect, useRef } from 'react'
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
  const [showOriginalText, setShowOriginalText] = useState(false) // 控制是否显示原文
  const [showModal, setShowModal] = useState(false) // 控制弹窗显示
  const [autoPlay, setAutoPlay] = useState(true) // 控制自动朗读，默认打开
  const inputRefs = useRef([]) // 输入框引用数组
  const autoNextTimerRef = useRef(null) // 自动跳转定时器引用

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
      
      // 重置弹窗状态
      setShowModal(false)
      setResult(null)
      
      // 初始化输入框引用数组
      inputRefs.current = new Array(wordsWithPhonetics.length).fill(null)
      
      // 如果自动朗读开启，则自动朗读句子
      if (autoPlay && speechSupported) {
        // 延迟一点时间，确保页面已经更新
        setTimeout(() => {
          cancelSpeech() // 取消之前的朗读
          speak(sentence).catch(error => {
            console.error('Error speaking:', error)
          })
        }, 300)
      }
    }
  }, [currentIndex, sentences, autoPlay, speechSupported])

  // 当输入框数组变化时，更新引用数组
  useEffect(() => {
    if (wordInputs.length !== inputRefs.current.length) {
      inputRefs.current = new Array(wordInputs.length).fill(null)
    }
  }, [wordInputs.length])

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

  // 规范化处理：忽略大小写、前后空格和常见标点
  const normalize = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:"'()\[\]{}\-_]/g, '')
      .replace(/\s+/g, ' ')
  }

  // 比较单个单词是否正确
  const compareWord = (userWord, correctWord) => {
    return normalize(userWord) === normalize(correctWord)
  }

  // 句子比对算法（按词比较）
  const compareSentences = (wordInputs, correctSentence) => {
    // 构建用户输入的句子
    const userSentence = wordInputs.join(' ')
    return normalize(userSentence) === normalize(correctSentence)
  }

  // 检查所有单词是否都正确
  const checkAllWordsCorrect = (wordInputs, correctWords) => {
    if (wordInputs.length !== correctWords.length) return false
    return wordInputs.every((input, index) => {
      return compareWord(input, correctWords[index].word)
    })
  }

  // 处理单个单词输入变化
  const handleWordInputChange = (index, value) => {
    const newWordInputs = [...wordInputs]
    newWordInputs[index] = value
    setWordInputs(newWordInputs)

    // 检查当前单词是否正确
    if (value.trim() && currentWords[index]) {
      const isCorrect = compareWord(value, currentWords[index].word)
      
      if (isCorrect) {
        // 单词正确，检查是否所有单词都正确
        const allCorrect = checkAllWordsCorrect(newWordInputs, currentWords)
        
        if (allCorrect) {
          // 所有单词都正确，显示成功弹窗并自动跳转
          setResult('correct')
          setShowModal(true)
          
          // 清除之前的定时器（如果存在）
          if (autoNextTimerRef.current) {
            clearTimeout(autoNextTimerRef.current)
          }
          
          // 延迟跳转到下一题，让用户看到成功提示
          autoNextTimerRef.current = setTimeout(() => {
            handleNext()
            autoNextTimerRef.current = null
          }, 1500)
        } else {
          // 单个单词正确，自动跳转到下一个输入框
          if (index < wordInputs.length - 1) {
            setTimeout(() => {
              inputRefs.current[index + 1]?.focus()
            }, 100)
          }
        }
      }
    }
  }

  // 处理提交
  const handleSubmit = (e) => {
    e.preventDefault()
    if (wordInputs.some(input => input.trim() === '')) return

    const correct = compareSentences(wordInputs, sentences[currentIndex])
    setResult(correct ? 'correct' : 'incorrect')
    setShowModal(true)
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
    // 清除自动跳转定时器
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current)
      autoNextTimerRef.current = null
    }
    
    cancelSpeech()
    setCurrentIndex((prev) => (prev + 1) % sentences.length)
    setUserInput('')
    setResult(null)
    setShowModal(false)
    
    // 聚焦第一个输入框
    setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
  }

  // 关闭弹窗
  const handleCloseModal = () => {
    // 清除自动跳转定时器
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current)
      autoNextTimerRef.current = null
    }
    
    setShowModal(false)
    if (result === 'correct') {
      handleNext()
    }
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
          <div className="play-controls">
            <button 
              className="play-button" 
              onClick={handlePlay}
              disabled={!speechSupported}
              title={speechSupported ? 'Play sentence' : 'Speech synthesis not supported'}
            >
              ▶️ Play
            </button>
            
            <label className="auto-play-toggle">
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
                disabled={!speechSupported}
              />
              <span>自动朗读</span>
            </label>
          </div>
          
          {!speechSupported && (
            <p className="speech-warning">Speech synthesis is not supported in your browser.</p>
          )}
        </div>

        {/* 音标显示部分 */}
        {currentWords.length > 0 && (
          <div className="phonetics-section">
            <div className="phonetics-header">
              <h3>Words & Phonetics:</h3>
              <button 
                className="toggle-text-button"
                onClick={() => setShowOriginalText(!showOriginalText)}
                title={showOriginalText ? '隐藏原文' : '显示原文'}
              >
                {showOriginalText ? '👁️ 隐藏原文' : '👁️‍🗨️ 显示原文'}
              </button>
            </div>
            <div className="phonetics-list">
              {currentWords.map((wordData, index) => (
                <div key={index} className="phonetic-item">
                  {/* 根据状态决定是否显示原文 */}
                  {showOriginalText && (
                    <span className="word">{wordData.word}</span>
                  )}
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
            {wordInputs.map((input, index) => {
              const isCorrect = input.trim() && currentWords[index] && compareWord(input, currentWords[index].word)
              return (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  className={`word-input ${isCorrect ? 'word-correct' : ''}`}
                  value={input}
                  onChange={(e) => handleWordInputChange(index, e.target.value)}
                  placeholder=""
                  autoFocus={index === 0}
                />
              )
            })}
          </div>
          
        </form>

        {/* 弹窗显示结果 */}
        {showModal && result && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className={`modal-result ${result}`}>
                <h2>
                  {result === 'correct' ? '✅ Correct!' : '❌ Incorrect!'}
                </h2>
                <p className="correct-sentence">
                  Correct sentence: <strong>{sentences[currentIndex]}</strong>
                </p>
                {result === 'correct' && (
                  <p className="auto-next-hint">自动跳转到下一题...</p>
                )}
                <button className="modal-close-button" onClick={handleCloseModal}>
                  {result === 'correct' ? 'Next' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Sentence Dictation Practice Tool</p>
      </footer>
    </div>
  )
}

export default App
