import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import { getSentences, DATA_SOURCE_TYPES, DATA_SOURCES } from './services/dataService'
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
  const [dataSource, setDataSource] = useState(DATA_SOURCE_TYPES.LOCAL) // 当前数据源，默认为本地
  const [dataSourceError, setDataSourceError] = useState(null) // 数据源错误信息
  const [currentWords, setCurrentWords] = useState([]) // 当前句子的单词和音标
  const [showOriginalText, setShowOriginalText] = useState(false) // 控制是否显示原文
  const [showModal, setShowModal] = useState(false) // 控制弹窗显示
  const [showDataSourceSelector, setShowDataSourceSelector] = useState(false) // 控制数据源选择器显示
  const [autoPlay, setAutoPlay] = useState(true) // 控制自动朗读，默认打开
  const [speechRate, setSpeechRate] = useState(0.5) // 语速，默认0.5（慢速）
  const [newConcept3Articles, setNewConcept3Articles] = useState([]) // 新概念三文章列表
  const [selectedArticleId, setSelectedArticleId] = useState(null) // 当前选择的文章ID
  const inputRefs = useRef([]) // 输入框引用数组
  const autoNextTimerRef = useRef(null) // 自动跳转定时器引用
  const isFallbackInProgressRef = useRef(false) // 标记是否正在进行回退操作

  // 初始化
  useEffect(() => {
    // 检查语音合成支持
    setSpeechSupported(isSpeechSupported())
  }, [])

  // 点击外部区域关闭数据源选择器
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDataSourceSelector && !event.target.closest('.data-source-controls')) {
        setShowDataSourceSelector(false)
      }
    }

    if (showDataSourceSelector) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showDataSourceSelector])

  // 加载新概念三文章列表
  useEffect(() => {
    if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_3) {
      const fetchNewConcept3Articles = async () => {
        try {
          const functionUrl = '/.netlify/functions/get-new-concept-3';
          const response = await fetch(functionUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.articles) {
              setNewConcept3Articles(data.articles);
              // 默认选择第一篇文章
              if (data.articles.length > 0 && !selectedArticleId) {
                setSelectedArticleId(data.articles[0].id);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching New Concept 3 articles:', error);
        }
      };
      
      fetchNewConcept3Articles();
    } else {
      // 切换到其他数据源时重置状态
      setNewConcept3Articles([]);
      setSelectedArticleId(null);
    }
  }, [dataSource, selectedArticleId])

  // 加载句子数据（当数据源变化时重新加载）
  useEffect(() => {
    // 如果正在进行回退操作，跳过执行
    if (isFallbackInProgressRef.current) {
      return
    }
    loadSentences()
  }, [dataSource, selectedArticleId])

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
          speak(sentence, speechRate).catch(error => {
            console.error('Error speaking:', error)
          })
        }, 300)
      }
    }
  }, [currentIndex, sentences, autoPlay, speechSupported, speechRate])

  // 获取转换后的完整句子
  const getExpandedSentence = (sentence) => {
    const wordsWithPhonetics = parseSentenceForPhonetics(sentence)
    return wordsWithPhonetics.map(wordData => wordData.word).join(' ')
  }

  // 当输入框数组变化时，更新引用数组
  useEffect(() => {
    if (wordInputs.length !== inputRefs.current.length) {
      inputRefs.current = new Array(wordInputs.length).fill(null)
    }
  }, [wordInputs.length])

  // 加载句子数据
  const loadSentences = useCallback(async () => {
    // 如果正在进行回退操作，避免重复执行
    if (isFallbackInProgressRef.current) {
      return
    }
    
    setIsLoading(true)
    setDataSourceError(null)
    setCurrentIndex(0) // 切换数据源时重置到第一题
    
    try {
      let data;
      
      if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_3 && selectedArticleId) {
        // 对于新概念三，获取选中文章的链接并动态加载内容
        const selectedArticle = newConcept3Articles.find(article => article.id === selectedArticleId);
        if (selectedArticle && selectedArticle.link) {
          // 调用新的函数获取课程内容
          const functionUrl = '/.netlify/functions/get-new-concept-3-lesson';
          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ link: selectedArticle.link })
          });
          
          if (response.ok) {
            const lessonData = await response.json();
            if (lessonData.success && lessonData.sentences) {
              data = lessonData.sentences;
              console.log(`Loaded ${data.length} sentences from lesson: ${selectedArticle.title}`);
            } else {
              throw new Error('获取课程内容失败');
            }
          } else {
            throw new Error('请求课程内容失败');
          }
        } else {
          throw new Error('未找到选中的文章或文章链接');
        }
      } else {
        // 其他数据源正常获取
        data = await getSentences(dataSource);
      }
      
      if (data && data.length > 0) {
        setSentences(data)
        setDataSourceError(null)
      } else {
        throw new Error('数据源返回空数据')
      }
    } catch (error) {
      console.error('Error loading sentences:', error)
      setDataSourceError(error.message || '加载数据失败')
      // 如果当前不是本地数据源，尝试回退到本地数据源
      if (dataSource !== DATA_SOURCE_TYPES.LOCAL) {
        console.warn('Falling back to local data source')
        isFallbackInProgressRef.current = true
        try {
          const localData = await getSentences(DATA_SOURCE_TYPES.LOCAL)
          setSentences(localData)
          setDataSourceError(`数据源加载失败，已切换到本地数据: ${error.message}`)
          // 更新数据源状态，但标记回退已完成，避免触发重复加载
          setDataSource(DATA_SOURCE_TYPES.LOCAL)
          // 在下一个事件循环中重置回退标记，确保状态更新完成
          setTimeout(() => {
            isFallbackInProgressRef.current = false
          }, 0)
        } catch (fallbackError) {
          console.error('Fallback to local also failed:', fallbackError)
          setSentences([])
          isFallbackInProgressRef.current = false
        }
      } else {
        setSentences([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [dataSource, selectedArticleId, newConcept3Articles])

  // 规范化处理：忽略大小写、前后空格和常见标点，保留缩略词中的单引号
  const normalize = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:\"()\[\]{}_\-]/g, '')
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
    // 获取转换后的完整句子
    const expandedCorrectSentence = getExpandedSentence(correctSentence)
    return normalize(userSentence) === normalize(expandedCorrectSentence)
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
      speak(sentences[currentIndex], speechRate)
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

  // 切换数据源
  const handleDataSourceChange = (newDataSource) => {
    if (newDataSource !== dataSource) {
      setDataSource(newDataSource)
      setShowDataSourceSelector(false)
    }
  }

  if (isLoading) {
    return (
      <div className="loading">
        <div>Loading sentences...</div>
        <div className="loading-source">从 {DATA_SOURCES.find(s => s.id === dataSource)?.name || '数据源'} 加载中...</div>
      </div>
    )
  }

  if (sentences.length === 0 && !dataSourceError) {
    return <div className="error">No sentences available. Please check your data source.</div>
  }

  const currentDataSource = DATA_SOURCES.find(s => s.id === dataSource)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sentence Dictation Practice</h1>
        <div className="data-source-controls">
          <button 
            className="data-source-button"
            onClick={() => setShowDataSourceSelector(!showDataSourceSelector)}
            title="切换数据源"
          >
            {currentDataSource?.icon} {currentDataSource?.name || '数据源'}
            <span className="dropdown-arrow">{showDataSourceSelector ? '▲' : '▼'}</span>
          </button>
          {showDataSourceSelector && (
            <div className="data-source-selector">
              {DATA_SOURCES.map((source) => (
                <button
                  key={source.id}
                  className={`data-source-option ${dataSource === source.id ? 'active' : ''}`}
                  onClick={() => handleDataSourceChange(source.id)}
                  title={source.description}
                >
                  <span className="source-icon">{source.icon}</span>
                  <div className="source-info">
                    <div className="source-name">{source.name}</div>
                    <div className="source-description">{source.description}</div>
                  </div>
                  {dataSource === source.id && <span className="check-mark">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      
      <main className="app-main">
        {dataSourceError && (
          <div className="data-source-warning">
            <span>⚠️ {dataSourceError}</span>
          </div>
        )}
        
        {/* 新概念三文章选择器 */}
        {dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_3 && newConcept3Articles.length > 0 && (
          <div className="article-selector">
            <label>
              选择文章:
              <select
                value={selectedArticleId || ''}
                onChange={(e) => setSelectedArticleId(parseInt(e.target.value))}
              >
                {newConcept3Articles.map(article => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        {/* 音标显示部分 */}
        {currentWords.length > 0 && (
          <div className="phonetics-section">
            <div className="progress small">
              <span>Question {currentIndex + 1} of {sentences.length}</span>
            </div>
            <div className="phonetics-list">
              {currentWords.map((wordData, index) => (
                <div key={index} className="phonetic-item">
                  {/* 根据状态决定是否显示原文 */}
                  {showOriginalText && (
                    <span className="word">{wordData.word}</span>
                  )}
                  {wordData.phonetic ? (
                    <span className="phonetic">/{wordData.phonetic}/</span>
                  ) : (
                    <span className="phonetic missing">—</span>
                  )}
                </div>
              ))}
              <button 
                className="toggle-text-button"
                onClick={() => setShowOriginalText(!showOriginalText)}
                title={showOriginalText ? '隐藏原文' : '显示原文'}
              >
                {showOriginalText ? '👁️ 隐藏原文' : '👁️‍🗨️ 显示原文'}
              </button>
            </div>
          </div>
        )}

        {/* 按词输入部分 */}
        <form className="input-form" onSubmit={handleSubmit}>
          <label className="input-with-controls">
            Type what you hear (one word per blank):
            <div className="input-controls">
              <label className="speech-rate-selector small">
                <span>语速:</span>
                <select
                  value={speechRate.toFixed(1)}
                  onChange={(e) => {
                    const newRate = parseFloat(e.target.value);
                    setSpeechRate(newRate);
                  }}
                  disabled={!speechSupported}
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
                onClick={handlePlay}
                disabled={!speechSupported}
                title={speechSupported ? 'Play sentence' : 'Speech synthesis not supported'}
              >
                ▶️
              </button>
              <label className="auto-play-toggle small">
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                  disabled={!speechSupported}
                />
                <span>自动朗读</span>
              </label>
            </div>
          </label>
          <div className="word-inputs">
            {wordInputs.map((input, index) => {
              const isCorrect = input.trim() && currentWords[index] && compareWord(input, currentWords[index].word)
              const wordLength = currentWords[index]?.word?.length || 5
              // 使用实际输入长度和原始单词长度中的较大值，确保能显示完整输入
              const currentInputLength = input.length || wordLength
              const maxLength = Math.max(wordLength, currentInputLength)
              // 根据单词长度计算输入框宽度：使用更保守的系数和更大的padding
              // 每个字符约 1.5ch（考虑不同字符宽度差异），加上额外的padding
              // 最小6ch，最大35ch（允许更长的单词）
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
                  placeholder=""
                  autoFocus={index === 0}
                />
              )
            })}
          </div>
          
        </form>

        {!speechSupported && (
          <p className="speech-warning">Speech synthesis is not supported in your browser.</p>
        )}

        {/* 弹窗显示结果 */}
        {showModal && result && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className={`modal-result ${result}`}>
                <h2>
                  {result === 'correct' ? '✅ Correct!' : '❌ Incorrect!'}
                </h2>
                <p className="correct-sentence">
                  Correct sentence: <strong>{getExpandedSentence(sentences[currentIndex])}</strong>
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
