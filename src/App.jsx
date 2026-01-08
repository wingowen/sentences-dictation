import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import { getSentences, DATA_SOURCE_TYPES, DATA_SOURCES } from './services/dataService'
import { speak, isSpeechSupported, cancelSpeech, getAvailableVoices, setVoice, getSelectedVoice, updateSpeechConfig, getSpeechConfig } from './services/speechService'
import { speak as externalSpeak, cancelSpeech as externalCancelSpeech, getAvailableVoices as getExternalAvailableVoices, setCurrentService, getCurrentService, isExternalServiceAvailable } from './services/externalSpeechService'
import { parseSentenceForPhonetics, detectAndExpandContractions } from './services/pronunciationService'

/**
 * 转换句子中的缩写为完整形式
 * @param {string} sentence - 包含缩写的句子
 * @returns {string} 转换后的完整形式句子
 */
const expandContractionsInSentence = (sentence) => {
  // 检测并转换缩写形式
  const wordsWithContractions = detectAndExpandContractions(sentence)
  // 提取转换后的单词并重新组合成句子
  const expandedWords = wordsWithContractions.map(wordData => wordData.expanded)
  return expandedWords.join(' ')
}

function App() {
  const [sentences, setSentences] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [wordInputs, setWordInputs] = useState([])
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [dataSource, setDataSource] = useState(DATA_SOURCE_TYPES.LOCAL)
  const [dataSourceError, setDataSourceError] = useState(null)
  const [currentWords, setCurrentWords] = useState([])
  const [showOriginalText, setShowOriginalText] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDataSourceSelector, setShowDataSourceSelector] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const [speechRate, setSpeechRate] = useState(0.5)
  const [newConcept3Articles, setNewConcept3Articles] = useState([])
  const [selectedArticleId, setSelectedArticleId] = useState(null)
  const [hasSelectedDataSource, setHasSelectedDataSource] = useState(false)
  const [randomMode, setRandomMode] = useState(false)
  const [listenMode, setListenMode] = useState(false)
  const [availableVoices, setAvailableVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [speechService, setSpeechService] = useState('web_speech')
  const [externalVoices, setExternalVoices] = useState([])
  const [selectedExternalVoice, setSelectedExternalVoice] = useState(null)
  // 练习状态
  const [practiceStats, setPracticeStats] = useState({
    totalAttempts: 0,       // 总尝试次数
    correctAnswers: 0,      // 正确次数
    incorrectAnswers: 0,    // 错误次数
    accuracy: 0,            // 准确率
    streak: 0,              // 连续正确次数
    longestStreak: 0,       // 最长连续正确次数
    totalTime: 0,           // 总练习时间（秒）
    startTime: null          // 当前练习开始时间
  })
  const inputRefs = useRef([])
  const autoNextTimerRef = useRef(null)
  const isFallbackInProgressRef = useRef(false)
  const randomOrderRef = useRef([])
  const currentRandomIndexRef = useRef(0)
  const listenModeTimerRef = useRef(null)
  const isListenModePlayingRef = useRef(false)

  // 初始化
  useEffect(() => {
    // 检查语音合成支持
    setSpeechSupported(isSpeechSupported())
    // 不再自动设置本地数据源为已选择，确保每次启动都显示数据源选择页面
    
    // 从localStorage加载练习状态
    console.log('尝试从localStorage加载练习状态');
    const savedStats = localStorage.getItem('practiceStats');
    console.log('localStorage中的练习状态:', savedStats);
    
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        console.log('解析后的练习状态:', parsedStats);
        setPracticeStats(parsedStats);
        console.log('从localStorage加载练习状态成功');
      } catch (error) {
        console.error('从localStorage加载练习状态失败:', error);
        // 清除损坏的存储
        localStorage.removeItem('practiceStats');
        console.log('已清除损坏的练习状态存储');
      }
    } else {
      console.log('localStorage中没有保存的练习状态');
    }
  }, [])

  // 初始化语音服务
  useEffect(() => {
    if (speechSupported) {
      // 监听语音加载事件
      const handleVoicesChanged = () => {
        let voices = getAvailableVoices();
        console.log('获取到的语音列表:', voices);
        
        // 额外过滤，确保只保留英文语音
        voices = voices.filter(voice => voice.lang.startsWith('en-'));
        console.log('过滤后的英文语音列表:', voices);
        
        setAvailableVoices(voices);
        
        // 选择默认英语语音（只考虑英文语音）
        const defaultVoice = voices.find(voice => 
          voice.lang.startsWith('en-')
        );
        if (defaultVoice) {
          setSelectedVoice(defaultVoice);
          setVoice(defaultVoice);
          console.log('选择的默认语音:', defaultVoice);
        }
      };
      
      // 注册语音加载事件监听器
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      
      // 立即尝试获取语音列表
      handleVoicesChanged();
      
      return () => {
        // 清理事件监听器
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [speechSupported])

  // 初始化外部语音服务
  useEffect(() => {
    // 获取外部语音服务可用语音列表
    const loadExternalVoices = async () => {
      try {
        const voices = await getExternalAvailableVoices();
        setExternalVoices(voices);
        
        // 选择默认外部语音
        if (voices.length > 0) {
          setSelectedExternalVoice(voices[0]);
        }
      } catch (error) {
        console.error('Error loading external voices:', error);
      }
    };
    
    loadExternalVoices();
  }, [])

  // 监听练习状态变化，保存到localStorage
  useEffect(() => {
    // 保存练习状态到localStorage
    console.log('保存练习状态到localStorage:', practiceStats);
    localStorage.setItem('practiceStats', JSON.stringify(practiceStats));
    console.log('练习状态已保存到localStorage，当前localStorage内容:', localStorage.getItem('practiceStats'));
  }, [practiceStats])

  // 组件卸载时清理
  useEffect(() => {
    // 监听页面关闭或刷新事件，确保保存练习状态
    const handleBeforeUnload = () => {
      console.log('页面即将关闭，保存练习状态');
      localStorage.setItem('practiceStats', JSON.stringify(practiceStats));
    };
    
    // 添加事件监听器
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      // 清除所有定时器
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
      if (listenModeTimerRef.current) {
        clearTimeout(listenModeTimerRef.current);
      }
      // 取消所有朗读
      cancelSpeech();
      // 保存练习状态
      console.log('组件卸载，保存练习状态');
      localStorage.setItem('practiceStats', JSON.stringify(practiceStats));
      // 移除事件监听器
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [practiceStats])

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
          
          // 检查响应类型
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Netlify Functions 未运行或返回了非 JSON 数据。请确保使用 `npm run netlify-dev` 启动项目。');
          }

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.articles) {
              setNewConcept3Articles(data.articles);
            } else {
              throw new Error(data.error || '获取文章列表失败');
            }
          } else {
            throw new Error('Netlify Functions 在开发环境下不可用，请使用生产环境或选择其他数据源');
          }
        } catch (error) {
          console.error('Error fetching New Concept 3 articles:', error);
          setDataSourceError(error.message || '加载新概念三文章失败');
          setNewConcept3Articles([]);
        }
      };
      
      fetchNewConcept3Articles();
    } else {
      // 切换到其他数据源时重置状态
      setNewConcept3Articles([]);
      setSelectedArticleId(null);
      setDataSourceError(null);
    }
  }, [dataSource])

  // 加载句子数据（当数据源变化时重新加载）
  useEffect(() => {
    // 如果正在进行回退操作，跳过执行
    if (isFallbackInProgressRef.current) {
      return
    }
    // 只有在用户已经选择数据源后才加载数据
    if (hasSelectedDataSource) {
      loadSentences()
    }
  }, [dataSource, selectedArticleId, hasSelectedDataSource])

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
          // 根据当前选择的语音服务使用相应的speak函数
          if (speechService === 'web_speech') {
            cancelSpeech() // 取消之前的朗读
            speak(sentence, speechRate).catch(error => {
              console.error('Error speaking:', error)
            })
          } else if (speechService === 'uberduck') {
            externalCancelSpeech() // 取消之前的朗读
            externalSpeak(sentence, speechRate, selectedExternalVoice?.name)
              .catch(error => {
                console.error('Error speaking with external service:', error)
                // 如果外部服务失败，尝试回退到Web Speech API
                cancelSpeech()
                speak(sentence, speechRate)
                  .catch(fallbackError => {
                    console.error('Fallback to web speech also failed:', fallbackError)
                  })
              })
          }
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

  // 生成随机顺序的句子索引
  const generateRandomOrder = (length) => {
    const order = Array.from({ length }, (_, i) => i);
    // Fisher-Yates 洗牌算法
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  };

  // 加载句子数据
  const loadSentences = useCallback(async () => {
    console.log('开始加载句子数据', { dataSource, selectedArticleId, hasSelectedDataSource });
    
    // 如果正在进行回退操作，避免重复执行
    if (isFallbackInProgressRef.current) {
      console.log('正在进行回退操作，跳过加载');
      return
    }
    
    // 如果用户还未选择数据源，不执行加载
    if (!hasSelectedDataSource) {
      console.log('用户未选择数据源，跳过加载');
      return
    }
    
    // 如果是新概念三但未选择文章，优雅地跳过加载
    if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_3 && !selectedArticleId) {
      console.log('新概念三未选择文章，跳过加载');
      setIsLoading(false)
      setSentences([])
      setDataSourceError(null)
      return
    }
    
    setIsLoading(true)
    setDataSourceError(null)
    setCurrentIndex(0) // 切换数据源时重置到第一题
    currentRandomIndexRef.current = 0 // 重置随机索引
    
    // 更新练习开始时间
    setPracticeStats(prevStats => ({
      ...prevStats,
      startTime: Date.now()
    }))
    
    try {
      let data;
      
      if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_3 && selectedArticleId) {
        // 对于新概念三，获取选中文章的链接并动态加载内容
        console.log('加载新概念三课程内容', { selectedArticleId });
        const selectedArticle = newConcept3Articles.find(article => article.id === selectedArticleId);
        if (selectedArticle && selectedArticle.link) {
          // 调用新的函数获取课程内容
          const functionUrl = '/.netlify/functions/get-new-concept-3-lesson';
          console.log('调用新概念三API', { functionUrl });
          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ link: selectedArticle.link })
          });
          
          // 检查响应类型
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Netlify Functions 未运行或返回了非 JSON 数据。请确保使用 `npm run netlify-dev` 启动项目。');
          }
          
          if (response.ok) {
            const lessonData = await response.json();
            if (lessonData.success && lessonData.sentences) {
              // 转换所有句子中的缩写为完整形式
              data = lessonData.sentences.map(sentence => expandContractionsInSentence(sentence));
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
        console.log('获取数据源', { dataSource });
        data = await getSentences(dataSource);
        console.log('获取到数据', { dataLength: data?.length || 0 });
        
        // 对于非本地数据源，需要转换缩写
        if (dataSource !== DATA_SOURCE_TYPES.LOCAL && data && data.length > 0) {
          console.log('转换非本地数据源的缩写');
          data = data.map(sentence => expandContractionsInSentence(sentence));
          console.log('转换完成', { dataLength: data.length });
        }
      }
      
      if (data && data.length > 0) {
        console.log('设置句子数据', { dataLength: data.length });
        setSentences(data)
        setDataSourceError(null)
        // 生成随机顺序
        randomOrderRef.current = generateRandomOrder(data.length);
        console.log('生成随机顺序完成');
      } else {
        throw new Error('数据源返回空数据')
      }
    } catch (error) {
      console.error('加载句子数据失败:', error)
      setDataSourceError(error.message || '加载数据失败')
      
      // 如果当前不是本地数据源，尝试回退到本地数据源
      if (dataSource !== DATA_SOURCE_TYPES.LOCAL) {
        console.warn('回退到本地数据源')
        isFallbackInProgressRef.current = true
        try {
          const localData = await getSentences(DATA_SOURCE_TYPES.LOCAL)
          console.log('获取本地数据成功', { localDataLength: localData.length });
          setSentences(localData)
          setDataSourceError(`数据源加载失败，已切换到本地数据: ${error.message}`)
          // 生成随机顺序
          randomOrderRef.current = generateRandomOrder(localData.length);
          console.log('生成本地数据随机顺序完成');
          // 更新数据源状态，但标记回退已完成，避免触发重复加载
          setDataSource(DATA_SOURCE_TYPES.LOCAL)
          console.log('更新数据源为本地');
          // 在下一个事件循环中重置回退标记，确保状态更新完成
          setTimeout(() => {
            isFallbackInProgressRef.current = false
            console.log('重置回退标记');
          }, 0)
        } catch (fallbackError) {
          console.error('回退到本地数据源也失败:', fallbackError)
          setSentences([])
          isFallbackInProgressRef.current = false
        }
      } else {
        console.log('本地数据源加载失败，设置空句子');
        setSentences([])
      }
    } finally {
      console.log('加载完成，设置isLoading为false');
      setIsLoading(false)
    }
  }, [dataSource, selectedArticleId, newConcept3Articles, hasSelectedDataSource])

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
          // 所有单词都正确，更新练习状态
          setPracticeStats(prevStats => {
            const newStreak = prevStats.streak + 1;
            const newLongestStreak = Math.max(newStreak, prevStats.longestStreak);
            const newTotalAttempts = prevStats.totalAttempts + 1;
            const newCorrectAnswers = prevStats.correctAnswers + 1;
            const newAccuracy = Math.round((newCorrectAnswers / newTotalAttempts) * 100);
            
            return {
              ...prevStats,
              totalAttempts: newTotalAttempts,
              correctAnswers: newCorrectAnswers,
              accuracy: newAccuracy,
              streak: newStreak,
              longestStreak: newLongestStreak
            };
          });
          
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
    
    // 更新练习状态
    if (correct) {
      setPracticeStats(prevStats => {
        const newStreak = prevStats.streak + 1;
        const newLongestStreak = Math.max(newStreak, prevStats.longestStreak);
        const newTotalAttempts = prevStats.totalAttempts + 1;
        const newCorrectAnswers = prevStats.correctAnswers + 1;
        const newAccuracy = Math.round((newCorrectAnswers / newTotalAttempts) * 100);
        
        return {
          ...prevStats,
          totalAttempts: newTotalAttempts,
          correctAnswers: newCorrectAnswers,
          accuracy: newAccuracy,
          streak: newStreak,
          longestStreak: newLongestStreak
        };
      });
    } else {
      setPracticeStats(prevStats => {
        const newTotalAttempts = prevStats.totalAttempts + 1;
        const newIncorrectAnswers = prevStats.incorrectAnswers + 1;
        const newAccuracy = prevStats.totalAttempts > 0 
          ? Math.round((prevStats.correctAnswers / newTotalAttempts) * 100) 
          : 0;
        
        return {
          ...prevStats,
          totalAttempts: newTotalAttempts,
          incorrectAnswers: newIncorrectAnswers,
          accuracy: newAccuracy,
          streak: 0 // 重置连续正确次数
        };
      });
    }
    
    setResult(correct ? 'correct' : 'incorrect')
    setShowModal(true)
  }

  // 播放当前句子
  const handlePlay = () => {
    if (speechSupported && sentences[currentIndex]) {
      const sentence = sentences[currentIndex];
      
      // 根据当前选择的语音服务使用相应的speak函数
      if (speechService === 'web_speech') {
        cancelSpeech() // 取消之前的朗读
        speak(sentence, speechRate)
          .catch(error => {
            console.error('Error speaking:', error)
          })
      } else if (speechService === 'uberduck') {
        externalCancelSpeech() // 取消之前的朗读
        externalSpeak(sentence, speechRate, selectedExternalVoice?.name)
          .catch(error => {
            console.error('Error speaking with external service:', error)
            // 如果外部服务失败，尝试回退到Web Speech API
            cancelSpeech()
            speak(sentence, speechRate)
              .catch(fallbackError => {
                console.error('Fallback to web speech also failed:', fallbackError)
              })
          })
      }
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
    
    if (randomMode) {
      // 随机模式：按照随机顺序切换句子
      currentRandomIndexRef.current = (currentRandomIndexRef.current + 1) % sentences.length;
      if (currentRandomIndexRef.current === 0) {
        // 如果已经遍历完所有句子，重新生成随机顺序
        randomOrderRef.current = generateRandomOrder(sentences.length);
      }
      setCurrentIndex(randomOrderRef.current[currentRandomIndexRef.current]);
    } else {
      // 顺序模式：按照顺序切换句子
      setCurrentIndex((prev) => (prev + 1) % sentences.length);
    }
    
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

  // 播放句子两次（第一次0.75倍速，第二次1倍速）
  const playSentenceTwice = async (sentence) => {
    try {
      // 根据当前选择的语音服务使用相应的speak函数
      if (speechService === 'web_speech') {
        // 第一次朗读：0.75倍速
        await speak(sentence, 0.75);
        // 短暂停顿
        await new Promise(resolve => setTimeout(resolve, 500));
        // 第二次朗读：1倍速
        await speak(sentence, 1.0);
      } else if (speechService === 'uberduck') {
        // 第一次朗读：0.75倍速
        await externalSpeak(sentence, 0.75, selectedExternalVoice?.name);
        // 短暂停顿
        await new Promise(resolve => setTimeout(resolve, 500));
        // 第二次朗读：1倍速
        await externalSpeak(sentence, 1.0, selectedExternalVoice?.name);
      }
    } catch (error) {
      console.error('Error playing sentence twice:', error);
      // 如果外部服务失败，尝试回退到Web Speech API
      try {
        // 第一次朗读：0.75倍速
        await speak(sentence, 0.75);
        // 短暂停顿
        await new Promise(resolve => setTimeout(resolve, 500));
        // 第二次朗读：1倍速
        await speak(sentence, 1.0);
      } catch (fallbackError) {
        console.error('Fallback to web speech also failed:', fallbackError);
      }
    }
  };

  // 开始听句子模式
  const startListenMode = () => {
    if (!speechSupported || sentences.length === 0) return;

    const listenModeLoop = async () => {
      if (!listenMode) return;

      try {
        // 播放当前句子两次
        await playSentenceTwice(sentences[currentIndex]);
        // 短暂停顿后切换到下一个句子
        listenModeTimerRef.current = setTimeout(() => {
          // 使用现有的handleNext逻辑切换句子
          handleNext();
          // 继续循环
          if (listenMode) {
            startListenMode();
          }
        }, 1000);
      } catch (error) {
        console.error('Error in listen mode loop:', error);
        // 即使出错也继续循环
        if (listenMode) {
          listenModeTimerRef.current = setTimeout(startListenMode, 1000);
        }
      }
    };

    isListenModePlayingRef.current = true;
    listenModeLoop();
  };

  // 停止听句子模式
  const stopListenMode = () => {
    if (listenModeTimerRef.current) {
      clearTimeout(listenModeTimerRef.current);
      listenModeTimerRef.current = null;
    }
    cancelSpeech();
    isListenModePlayingRef.current = false;
  };

  // 重置练习状态
  const resetPracticeStats = () => {
    const resetStats = {
      totalAttempts: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0,
      streak: 0,
      longestStreak: 0,
      totalTime: 0,
      startTime: Date.now()
    };
    setPracticeStats(resetStats);
    // 直接更新localStorage，确保重置状态立即保存
    localStorage.setItem('practiceStats', JSON.stringify(resetStats));
    console.log('练习状态已重置并保存到localStorage');
  };

  // 切换听句子模式
  const handleListenModeToggle = (enabled) => {
    setListenMode(enabled);
    
    if (enabled) {
      // 启用听句子模式
      setShowOriginalText(true); // 自动显示原文
      startListenMode();
    } else {
      // 禁用听句子模式
      stopListenMode();
    }
  };

  const currentDataSource = DATA_SOURCES.find(s => s.id === dataSource)

  const DataSourceSelectionPage = () => (
    <div className="data-source-selection-page">
      <div className="selection-container">
        <h1>选择数据源</h1>
        <p>请选择您想要练习的数据源开始拼写练习</p>
        {dataSourceError && (
          <div className="data-source-error">
            <span>⚠️ {dataSourceError}</span>
          </div>
        )}
        <div className="data-source-cards">
          {DATA_SOURCES.map((source) => (
            <button
              key={source.id}
              className="data-source-card"
              onClick={() => {
                setDataSource(source.id)
                setHasSelectedDataSource(true)
                setDataSourceError(null)
              }}
            >
              <span className="card-icon">{source.icon}</span>
              <div className="card-content">
                <h3>{source.name}</h3>
                <p>{source.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (!hasSelectedDataSource) {
    return <DataSourceSelectionPage />
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
    if (dataSource !== DATA_SOURCE_TYPES.NEW_CONCEPT_3 || selectedArticleId) {
      return <div className="error">No sentences available. Please check your data source.</div>
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => setHasSelectedDataSource(false)}
            title="返回数据源选择"
          >
            ← 返回
          </button>
        </div>
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
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedArticleId(value ? parseInt(value) : null);
                }}
              >
                <option value="">请选择文章</option>
                {newConcept3Articles.map(article => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        
        {/* 新概念三未选择文章时的提示 */}
        {dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_3 && newConcept3Articles.length > 0 && !selectedArticleId && !isLoading && (
          <div className="article-selector-hint">
            <p>👆 请在上方选择一篇文章开始练习</p>
          </div>
        )}
        
        {/* 只有当有句子数据时才显示听写区域 */}
        {sentences.length > 0 && (
          <>
            {/* 练习状态面板 */}
            <div className="practice-stats-section" style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px', 
              border: '1px solid #dee2e6',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: '0', fontSize: '1.1rem', color: '#495057' }}>练习状态</h3>
                <button 
                  onClick={resetPracticeStats}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #dc3545',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                >
                  重置
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>准确率</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>{practiceStats.accuracy}%</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>连续正确</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#17a2b8' }}>{practiceStats.streak}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>最长连续</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffc107' }}>{practiceStats.longestStreak}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>总尝试</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#495057' }}>{practiceStats.totalAttempts}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>正确</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745' }}>{practiceStats.correctAnswers}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>错误</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc3545' }}>{practiceStats.incorrectAnswers}</div>
                </div>
              </div>
            </div>
            
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
                    onClick={handlePlay}
                    disabled={!speechSupported || listenMode}
                    title={speechSupported ? 'Play sentence' : 'Speech synthesis not supported'}
                  >
                    ▶️
                  </button>
                  <label className="auto-play-toggle small">
                    <input
                      type="checkbox"
                      checked={autoPlay}
                      onChange={(e) => setAutoPlay(e.target.checked)}
                      disabled={!speechSupported || listenMode}
                    />
                    <span>自动朗读</span>
                  </label>
                  <button 
                    type="button" 
                    className="voice-settings-button small"
                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                    disabled={!speechSupported}
                    title="语音设置"
                  >
                    🎤 语音设置
                  </button>
                  <label className="random-mode-toggle small">
                    <input
                      type="checkbox"
                      checked={randomMode}
                      onChange={(e) => {
                        setRandomMode(e.target.checked);
                        // 切换随机模式时重置索引
                        currentRandomIndexRef.current = 0;
                        if (e.target.checked && sentences.length > 0) {
                          // 启用随机模式时生成新的随机顺序
                          randomOrderRef.current = generateRandomOrder(sentences.length);
                          // 切换到第一个随机句子
                          setCurrentIndex(randomOrderRef.current[0]);
                        }
                      }}
                      disabled={listenMode}
                    />
                    <span>随机模式</span>
                  </label>
                  <label className="listen-mode-toggle small">
                    <input
                      type="checkbox"
                      checked={listenMode}
                      onChange={(e) => handleListenModeToggle(e.target.checked)}
                      disabled={!speechSupported}
                    />
                    <span>听句子模式</span>
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
                    {/* 显示练习状态更新 */}
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '10px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '6px', 
                      border: '1px solid #dee2e6'
                    }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '8px', color: '#495057' }}>练习状态</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>准确率:</span>
                          <span style={{ marginLeft: '5px', fontWeight: '500', color: '#28a745' }}>{practiceStats.accuracy}%</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>连续正确:</span>
                          <span style={{ marginLeft: '5px', fontWeight: '500', color: '#17a2b8' }}>{practiceStats.streak}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>总尝试:</span>
                          <span style={{ marginLeft: '5px', fontWeight: '500', color: '#495057' }}>{practiceStats.totalAttempts}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>正确/错误:</span>
                          <span style={{ marginLeft: '5px', fontWeight: '500', color: '#28a745' }}>{practiceStats.correctAnswers}</span>
                          <span style={{ marginLeft: '5px', fontWeight: '500', color: '#dc3545' }}>/{practiceStats.incorrectAnswers}</span>
                        </div>
                      </div>
                    </div>
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
            
            {/* 语音设置独立弹窗 */}
            {showVoiceSettings && speechSupported && (
              <div className="modal-overlay" onClick={() => setShowVoiceSettings(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '400px', maxWidth: '90%' }}>
                  <div className="voice-settings-modal" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ margin: '0 0 10px 0', textAlign: 'center', fontSize: '1.2rem' }}>语音设置</h3>
                    <div className="service-selector" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>语音服务:</span>
                        <select
                          value={speechService}
                          onChange={(e) => {
                            const newService = e.target.value;
                            setSpeechService(newService);
                            setCurrentService(newService);
                          }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '0.9rem',
                            backgroundColor: '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="web_speech">Web Speech API (浏览器内置)</option>
                          <option value="uberduck">Uberduck.ai (外部服务)</option>
                        </select>
                      </label>
                    </div>
                    <div className="voice-selector" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>选择语音:</span>
                        {speechService === 'web_speech' ? (
                          <select
                            value={selectedVoice ? selectedVoice.name : ''}
                            onChange={(e) => {
                              const selectedVoiceName = e.target.value;
                              const voice = availableVoices.find(v => v.name === selectedVoiceName);
                              if (voice) {
                                setSelectedVoice(voice);
                                setVoice(voice);
                              }
                            }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              fontSize: '0.9rem',
                              backgroundColor: '#fff',
                              cursor: 'pointer'
                            }}
                          >
                            {availableVoices.map((voice) => (
                              <option key={voice.name} value={voice.name}>
                                {voice.name} ({voice.lang})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={selectedExternalVoice ? selectedExternalVoice.name : ''}
                            onChange={(e) => {
                              const selectedVoiceName = e.target.value;
                              const voice = externalVoices.find(v => v.name === selectedVoiceName);
                              if (voice) {
                                setSelectedExternalVoice(voice);
                              }
                            }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              fontSize: '0.9rem',
                              backgroundColor: '#fff',
                              cursor: 'pointer'
                            }}
                          >
                            {externalVoices.map((voice) => (
                              <option key={voice.name} value={voice.name}>
                                {voice.displayName}
                              </option>
                            ))}
                          </select>
                        )}
                      </label>
                    </div>
                    <button 
                      type="button" 
                      className="modal-close-button"
                      onClick={() => setShowVoiceSettings(false)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        alignSelf: 'center',
                        marginTop: '10px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#0069d9'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Sentence Dictation Practice Tool</p>
      </footer>
    </div>
  )
}

export default App
