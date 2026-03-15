import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import './App.css'
import { getSentences, DATA_SOURCE_TYPES, DATA_SOURCES, getLocalResources, getSentencesByLocalResource } from './services/dataService'
import { newConcept3Data, newConcept2Data } from './services/dataService'
import { speak, isSpeechSupported, cancelSpeech } from './services/speechService'
import { preloadSentence } from './services/speechService';
import { parseSentenceForPhonetics, detectAndExpandContractions } from './services/pronunciationService'
// Translation features removed: translationService imports removed

// 导入组件
import React, { Suspense } from 'react'
import DataSourceSelection from './components/DataSourceSelection'
import PracticeStats from './components/PracticeStats'
import PhoneticsSection from './components/PhoneticsSection'
import WordInputs from './components/WordInputs'
import WordInputsContext from './components/WordInputsContext'
// 懒加载大型组件
const FlashcardApp = React.lazy(() => import('./components/FlashcardApp'))
import ArticleSelector from './components/ArticleSelector'
import LocalResourceSelector from './components/LocalResourceSelector'
import ArticleSelectorHint from './components/ArticleSelectorHint'
import SupabaseSelector from './components/SupabaseSelector'
import { AppProvider } from './contexts/AppContext'

// 懒加载弹窗组件
const ResultModal = React.lazy(() => import('./components/ResultModal'))
const SettingsModal = React.lazy(() => import('./components/SettingsModal'))

/**
 * 转换句子中的缩写为完整形式
 * @param {string} sentence - 包含缩写的句子
 * @returns {string} 转换后的完整形式句子
 */
const expandContractionsInSentence = (sentence) => {
  const text = typeof sentence === 'object' ? sentence.text || sentence : sentence;
  const translation = typeof sentence === 'object' ? sentence.translation || '' : '';
  const wordsWithContractions = detectAndExpandContractions(text);
  const expandedText = wordsWithContractions.map(w => w.expanded).join(' ');
  // Preserve translation if it existed
  return translation ? { text: expandedText, translation } : expandedText;
}

function AppContent() {
  const [sentences, setSentences] = useState([])
  const [sentenceIds, setSentenceIds] = useState([]) // Supabase 句子 ID（用于预加载音频）
  const [currentIndex, setCurrentIndex] = useState(0)
  const [wordInputs, setWordInputs] = useState([])
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [dataSource, setDataSource] = useState(DATA_SOURCE_TYPES.LOCAL)
  const [dataSourceError, setDataSourceError] = useState(null)
  const [currentWords, setCurrentWords] = useState([])
  const [currentTranslation, setCurrentTranslation] = useState('')
  // translation removed
  const [showOriginalText, setShowOriginalText] = useState(false)
  const [showCounter, setShowCounter] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  // translation provider removed
  // translationConfig removed
  const [showDataSourceSelector, setShowDataSourceSelector] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [speechRate, _setSpeechRate] = useState(1)
  const [newConcept3Articles, setNewConcept3Articles] = useState([])
  const [newConcept2Articles, setNewConcept2Articles] = useState([])
  const [selectedArticleId, setSelectedArticleId] = useState(null)
  const [hasSelectedDataSource, setHasSelectedDataSource] = useState(false)
  const [randomMode, setRandomMode] = useState(false)
  const [listenMode, setListenMode] = useState(false)
  const [autoNext, setAutoNext] = useState(true)
  const [localResourceId, setLocalResourceId] = useState('simple')
  const [localResources, setLocalResources] = useState([])
  const [showFlashcardApp, setShowFlashcardApp] = useState(false)


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
  
  // 练习进度 - 按数据源缓存每个句子的练习状态
  const [practiceProgress, setPracticeProgress] = useState({})
  const inputRefs = useRef([])
  const autoNextTimerRef = useRef(null)
  const isFallbackInProgressRef = useRef(false)
  const randomOrderRef = useRef([])
  const currentRandomIndexRef = useRef(0)
  const listenModeTimerRef = useRef(null)
  const isListenModePlayingRef = useRef(false)
  
  // 句子数据缓存 - 预计算每个句子的解析结果，避免切换时重复计算
  const [sentenceCache, setSentenceCache] = useState({})

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
    
    // 从localStorage加载练习进度
    console.log('尝试从localStorage加载练习进度');
    const savedProgress = localStorage.getItem('practiceProgress');
    console.log('localStorage中的练习进度:', savedProgress);
    
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        console.log('解析后的练习进度:', parsedProgress);
        setPracticeProgress(parsedProgress);
        console.log('从localStorage加载练习进度成功');
      } catch (error) {
        console.error('从localStorage加载练习进度失败:', error);
        // 清除损坏的存储
        localStorage.removeItem('practiceProgress');
        console.log('已清除损坏的练习进度存储');
      }
    } else {
      console.log('localStorage中没有保存的练习进度');
    }
  }, [])

  // 监听练习状态变化，保存到localStorage
  useEffect(() => {
    // 保存练习状态到localStorage
    try {
      console.log('保存练习状态到localStorage:', practiceStats);
      localStorage.setItem('practiceStats', JSON.stringify(practiceStats));
      console.log('练习状态已保存到localStorage，当前localStorage内容:', localStorage.getItem('practiceStats'));
    } catch (error) {
      console.error('保存练习状态到localStorage失败:', error);
    }
  }, [practiceStats])

  // 监听练习进度变化，保存到localStorage
  useEffect(() => {
    // 保存练习进度到localStorage
    try {
      console.log('保存练习进度到localStorage:', practiceProgress);
      localStorage.setItem('practiceProgress', JSON.stringify(practiceProgress));
      console.log('练习进度已保存到localStorage，当前localStorage内容:', localStorage.getItem('practiceProgress'));
    } catch (error) {
      console.error('保存练习进度到localStorage失败:', error);
    }
  }, [practiceProgress])

  // 组件卸载时清理
  useEffect(() => {
    // 监听页面关闭或刷新事件，确保保存练习状态和进度
    const handleBeforeUnload = () => {
      console.log('页面即将关闭，保存练习状态和进度');
      localStorage.setItem('practiceStats', JSON.stringify(practiceStats));
      localStorage.setItem('practiceProgress', JSON.stringify(practiceProgress));
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
      // 保存练习状态和进度
      console.log('组件卸载，保存练习状态和进度');
      localStorage.setItem('practiceStats', JSON.stringify(practiceStats));
      localStorage.setItem('practiceProgress', JSON.stringify(practiceProgress));
      // 移除事件监听器
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
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

  // 加载本地资源列表
  useEffect(() => {
    if (dataSource === DATA_SOURCE_TYPES.LOCAL) {
      const resources = getLocalResources();
      setLocalResources(resources);
      // 如果当前没有选择本地资源，默认选择第一个
      if (!localResourceId) {
        setLocalResourceId(resources[0]?.id || 'simple');
      }
    }
  }, [dataSource])

  // 加载新概念三文章列表
  useEffect(() => {
    if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_3) {
      try {
        // Load articles from local JSON file
        if (newConcept3Data.success && newConcept3Data.articles) {
          setNewConcept3Articles(newConcept3Data.articles);
          setDataSourceError(null);
        } else {
          throw new Error('本地新概念三数据格式错误');
        }
      } catch (error) {
        console.error('Error loading New Concept 3 articles:', error);
        setDataSourceError(error.message || '加载新概念三文章失败');
        setNewConcept3Articles([]);
      }
    } else {
      // 切换到其他数据源时重置状态
      setNewConcept3Articles([]);
      setSelectedArticleId(null);
      setDataSourceError(null);
    }
  }, [dataSource])

  // 加载新概念二文章列表（从本地 JSON）
  useEffect(() => {
    if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_2) {
      try {
        if (newConcept2Data.success && newConcept2Data.articles) {
          setNewConcept2Articles(newConcept2Data.articles);
          setDataSourceError(null);
        } else {
          throw new Error('本地新概念二数据格式错误');
        }
      } catch (error) {
        console.error('Error loading NCE2 articles:', error);
        setDataSourceError(error.message);
        setNewConcept2Articles([]);
      }
    } else {
      setNewConcept2Articles([]);
      setSelectedArticleId(null);
      setDataSourceError(null);
    }
  }, [dataSource])

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
    
    // 如果是新概念三但未选择文章，等待用户选择文章
    if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_3 && !selectedArticleId) {
      console.log('新概念三未选择文章，等待用户选择');
      setIsLoading(false)
      setSentences([])
      setSentenceIds([])
      setSentenceCache({})
      setDataSourceError(null)
      return
    }

    // 如果是新概念二但未选择文章，等待用户选择文章
    if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_2 && !selectedArticleId) {
      console.log('新概念二未选择文章，等待用户选择');
      setIsLoading(false)
      setSentences([])
      setSentenceIds([])
      setSentenceCache({})
      setDataSourceError(null)
      return
    }

    // 如果是在线课程(Supabase)但未选择文章，等待用户选择文章
    if (dataSource === DATA_SOURCE_TYPES.SUPABASE) {
      console.log('在线课程数据源，等待用户通过选择器加载句子');
      setIsLoading(false)
      setSentences([])
      setSentenceIds([])
      setSentenceCache({})
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
        // 对于新概念三，从本地数据获取选中文章的句子
        console.log('加载新概念三课程内容', { selectedArticleId });
        const selectedArticle = newConcept3Articles.find(article => article.id === selectedArticleId);
        if (selectedArticle && selectedArticle.sentences) {
          // 转换所有句子中的缩写为完整形式
          data = selectedArticle.sentences.map(sentence => expandContractionsInSentence(sentence));
          console.log(`Loaded ${data.length} sentences from lesson: ${selectedArticle.title}`);
        } else {
          throw new Error('未找到选中的文章或文章内容');
         }
       } else if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_2 && selectedArticleId) {
        // 对于新概念二，从本地 JSON 获取选中文章的句子
        console.log('加载新概念二课程内容', { selectedArticleId });
        const selectedArticle = newConcept2Articles.find(article => article.lesson_id === selectedArticleId);
        if (selectedArticle && selectedArticle.sentences) {
          data = selectedArticle.sentences.map(sentence => expandContractionsInSentence(sentence));
          console.log(`Loaded ${data.length} sentences from NCE2 lesson: ${selectedArticle.title}`);
        } else {
          throw new Error('未找到选中的文章或文章内容');
        }
       } else {
        // 其他数据源正常获取
        console.log('获取数据源', { dataSource });
        if (dataSource === DATA_SOURCE_TYPES.LOCAL) {
          console.log('获取本地资源数据', { localResourceId });
          data = await getSentencesByLocalResource(localResourceId);
        } else {
          data = await getSentences(dataSource);
        }
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
        
        // 预计算所有句子的解析数据 - 避免切换时重复计算
        console.log('开始预计算句子数据');
        const cache = {};
        data.forEach((sentence, index) => {
          const text = typeof sentence === 'object' ? sentence.text || '' : sentence;
          const translation = typeof sentence === 'object' ? sentence.translation || '' : '';
          const wordsWithPhonetics = parseSentenceForPhonetics(text);
          cache[index] = {
            wordsWithPhonetics,
            translation,
            wordsWithTranslation: wordsWithPhonetics.map(word => ({
              ...word,
              translation: ''
            }))
          };
        });
        setSentenceCache(cache);
        console.log('预计算句子数据完成', { cacheSize: Object.keys(cache).length });
        
        setDataSourceError(null)
        // 生成随机顺序
        randomOrderRef.current = generateRandomOrder(data.length);
        console.log('生成随机顺序完成');
        
        // 恢复练习进度 - 从localStorage直接读取，避免依赖practiceProgress状态
        try {
          const savedProgress = localStorage.getItem('practiceProgress');
          if (savedProgress) {
            const parsedProgress = JSON.parse(savedProgress);
            const sourceProgress = parsedProgress[dataSource];
            if (sourceProgress && sourceProgress.lastPracticedIndex >= 0) {
              // 如果有保存的进度，恢复到上次练习的位置
              console.log('恢复练习进度，从索引', sourceProgress.lastPracticedIndex, '开始');
              // 延迟设置索引，确保句子数据已经更新
              setTimeout(() => {
                setCurrentIndex(sourceProgress.lastPracticedIndex);
              }, 0);
            } else {
              // 没有保存的进度，从第一题开始
              console.log('没有保存的练习进度，从第一题开始');
              setCurrentIndex(0);
            }
          } else {
            // 没有保存的进度，从第一题开始
            console.log('没有保存的练习进度，从第一题开始');
            setCurrentIndex(0);
          }
        } catch (error) {
          console.error('读取练习进度失败:', error);
          // 读取失败，从第一题开始
          setCurrentIndex(0);
        }
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
          // 先更新数据源状态，避免触发重复加载
          setDataSource(DATA_SOURCE_TYPES.LOCAL)
          console.log('更新数据源为本地');
          
          const localData = await getSentences(DATA_SOURCE_TYPES.LOCAL)
          console.log('获取本地数据成功', { localDataLength: localData.length });
          setSentences(localData)
          setSentenceCache({})  // 清除缓存
          setDataSourceError(`数据源加载失败，已切换到本地数据: ${error.message}`)
          // 生成随机顺序
          randomOrderRef.current = generateRandomOrder(localData.length);
          console.log('生成本地数据随机顺序完成');
          // 重置回退标记
          isFallbackInProgressRef.current = false
          console.log('重置回退标记');
        } catch (fallbackError) {
          console.error('回退到本地数据源也失败:', fallbackError)
          setSentences([])
          setSentenceIds([])
          setSentenceCache({})  // 清除缓存
          isFallbackInProgressRef.current = false
          // 回退到本地数据源也失败，允许用户重新选择数据源
          setHasSelectedDataSource(false)
        }
      } else {
        console.log('本地数据源加载失败，设置空句子');
        setSentences([])
        setSentenceIds([])
        setSentenceCache({})  // 清除缓存
        // 本地数据源加载失败，允许用户重新选择数据源
        setHasSelectedDataSource(false)
      }
    } finally {
      console.log('加载完成，设置isLoading为false');
      setIsLoading(false)
    }
  }, [dataSource, selectedArticleId, newConcept3Articles, hasSelectedDataSource, localResourceId])

  // 加载句子数据（当数据源变化时重新加载）
  useEffect(() => {
    // 如果正在进行回退操作，跳过执行
    if (isFallbackInProgressRef.current) {
      return
    }
    // SUPABASE 数据源不需要自动加载句子，由 SupabaseSelector 组件手动触发
    if (dataSource === DATA_SOURCE_TYPES.SUPABASE) {
      setIsLoading(false)
      setSentences([])
      setSentenceIds([])
      return
    }
    // 只有在用户已经选择数据源后才加载数据
    if (hasSelectedDataSource) {
      loadSentences()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, selectedArticleId, hasSelectedDataSource, loadSentences])

  // 当当前句子变化时，更新单词和音标
  useEffect(() => {
    const loadCurrentSentence = async () => {
      if (sentences[currentIndex]) {
        const sentence = sentences[currentIndex]
        const text = typeof sentence === 'object' ? sentence.text || '' : sentence;

        // 优先使用预计算的缓存数据
        let wordsWithPhonetics, wordsWithTranslation, translation = '';

        if (sentenceCache[currentIndex]) {
          // 使用预计算的数据
          wordsWithPhonetics = sentenceCache[currentIndex].wordsWithPhonetics
          wordsWithTranslation = sentenceCache[currentIndex].wordsWithTranslation
          translation = sentenceCache[currentIndex].translation || '';
        } else {
          // 回退到实时计算
          wordsWithPhonetics = parseSentenceForPhonetics(text)
          wordsWithTranslation = wordsWithPhonetics.map(word => ({
            ...word,
            translation: ''
          }))
          translation = typeof sentence === 'object' ? sentence.translation || '' : '';
        }

        // 重置状态并设置新数据
        setCurrentWords(wordsWithTranslation)
        setCurrentTranslation(translation)

        // 初始化按词输入数组
        const initialWordInputs = wordsWithPhonetics.map(() => '')
        setWordInputs(initialWordInputs)
        
        // 重置弹窗状态
        setShowModal(false)
        setResult(null)
        
        // 初始化输入框引用数组
        inputRefs.current = new Array(wordsWithPhonetics.length).fill(null)
        
        // 聚焦第一个输入框 - 确保在下一个事件循环中执行
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
            // 重置光标到开头
            inputRefs.current[0].setSelectionRange(0, 0)
          }
        }, 100)

        // 如果自动朗读开启，则自动朗读句子
        if (autoPlay && speechSupported) {
          const sid = sentenceIds[currentIndex] || null;
          setTimeout(() => {
            cancelSpeech()
            speak(sentence, speechRate, sid).catch(error => {
              console.error('Error speaking:', error)
            })
          }, 300)
        }
      }
    };

    loadCurrentSentence();
  }, [currentIndex, sentences, sentenceIds, autoPlay, speechSupported, speechRate, sentenceCache])

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



  // 规范化处理：忽略大小写、前后空格和常见标点，保留缩略词中的单引号
  const normalize = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:"()[\]{}_-]/g, '')
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
  const _handleWordInputChange = (index, value) => {
    const newWordInputs = [...wordInputs]
    newWordInputs[index] = value
    setWordInputs(newWordInputs)

    // 检查当前单词是否正确
    if (value.trim() && currentWords[index]) {
      const isCorrect = compareWord(value, currentWords[index].word)
      
      if (isCorrect) {
        // 检查是否所有单词都已输入
        const allFilled = newWordInputs.every(input => input.trim() !== '')
        
        if (allFilled) {
          // 所有单词都已输入，检查是否所有单词都正确
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
            
            // 更新练习进度
            setPracticeProgress(prevProgress => {
              const currentDataSource = dataSource;
              const currentIndexValue = currentIndex;
              const totalSentences = sentences.length;
              
              // 确保当前数据源的进度对象存在
              const sourceProgress = prevProgress[currentDataSource] || {
                completedSentences: [],
                correctSentences: [],
                lastPracticedIndex: -1,
                progressPercentage: 0
              };
              
              // 更新已完成和正确的句子列表
              const updatedCompletedSentences = [...new Set([...sourceProgress.completedSentences, currentIndexValue])];
              const updatedCorrectSentences = [...new Set([...sourceProgress.correctSentences, currentIndexValue])];
              const updatedProgressPercentage = Math.round((updatedCompletedSentences.length / totalSentences) * 100);
              
              return {
                ...prevProgress,
                [currentDataSource]: {
                  ...sourceProgress,
                  completedSentences: updatedCompletedSentences,
                  correctSentences: updatedCorrectSentences,
                  lastPracticedIndex: currentIndexValue,
                  progressPercentage: updatedProgressPercentage
                }
              };
            });
            
            // 所有单词都正确，显示成功弹窗并延迟三秒自动关闭
            console.log('All words correct, showing modal');
            setResult('correct')
            setShowModal(true)
            
            // 清除之前的定时器（如果存在）
            if (autoNextTimerRef.current) {
              clearTimeout(autoNextTimerRef.current)
            }
            
            // 根据autoNext状态决定是否自动跳转到下一题
            if (autoNext) {
              // 延迟三秒关闭弹窗并跳转到下一题，让用户看到成功提示
              autoNextTimerRef.current = setTimeout(() => {
                console.log('Closing modal and going to next sentence');
                handleCloseModal()
                autoNextTimerRef.current = null
              }, 3000)
            } else {
              console.log('Auto next disabled, user needs to click Next manually');
            }
          } else {
            console.log('Not all words correct:', newWordInputs, currentWords);
          }
        } else {
          console.log('Not all words filled:', newWordInputs);
          // 单个单词正确，自动跳转到下一个输入框
          if (index < currentWords.length - 1) {
            // 使用更合理的延迟，确保用户有足够的时间完成输入
            setTimeout(() => {
              // 再次检查输入框是否存在，避免DOM已经更新的情况
              if (inputRefs.current[index + 1]) {
                inputRefs.current[index + 1].focus()
              }
            }, 200)
          }
        }
      } else {
        console.log('Current word incorrect:', value, currentWords[index].word);
      }
    }
  }

  // 处理提交
  const _handleSubmit = (e) => {
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
        const newAccuracy = prevStats.correctAnswers > 0 
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
    
    // 更新练习进度
    setPracticeProgress(prevProgress => {
      const currentDataSource = dataSource;
      const currentIndexValue = currentIndex;
      const totalSentences = sentences.length;
      
      // 确保当前数据源的进度对象存在
      const sourceProgress = prevProgress[currentDataSource] || {
        completedSentences: [],
        correctSentences: [],
        lastPracticedIndex: -1,
        progressPercentage: 0
      };
      
      // 更新已完成的句子列表
      const updatedCompletedSentences = [...new Set([...sourceProgress.completedSentences, currentIndexValue])];
      
      // 根据结果更新正确的句子列表
      let updatedCorrectSentences = [...sourceProgress.correctSentences];
      if (correct) {
        // 如果答对，添加到正确列表
        updatedCorrectSentences = [...new Set([...updatedCorrectSentences, currentIndexValue])];
      } else {
        // 如果答错，从正确列表中移除
        updatedCorrectSentences = updatedCorrectSentences.filter(index => index !== currentIndexValue);
      }
      
      const updatedProgressPercentage = Math.round((updatedCompletedSentences.length / totalSentences) * 100);
      
      return {
        ...prevProgress,
        [currentDataSource]: {
          ...sourceProgress,
          completedSentences: updatedCompletedSentences,
          correctSentences: updatedCorrectSentences,
          lastPracticedIndex: currentIndexValue,
          progressPercentage: updatedProgressPercentage
        }
      };
    });
    
    setResult(correct ? 'correct' : 'incorrect')
    setShowModal(true)
  }

  // 播放当前句子
  const _handlePlay = () => {
    if (speechSupported && sentences[currentIndex]) {
      const sentence = sentences[currentIndex];
      const sid = sentenceIds[currentIndex] || null;
      cancelSpeech()
      speak(sentence, speechRate, sid)
        .catch(error => {
          console.error('Error speaking:', error)
        })
    }
  }

  // 下一题
  const handleNext = () => {
    console.log('[handleNext] 函数被调用, currentIndex:', currentIndex, 'randomMode:', randomMode, 'sentences.length:', sentences.length);
    
    // 清除自动跳转定时器
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current)
      autoNextTimerRef.current = null
    }
    
    cancelSpeech()
    
    let nextIndex;
    if (randomMode) {
      // 随机模式：按照随机顺序切换句子
      if (sentences.length === 0) {
        console.log('[handleNext] 没有可用的句子，返回');
        return;
      }
      const nextRandomIndex = (currentRandomIndexRef.current + 1) % sentences.length;
      if (nextRandomIndex === 0) {
        // 如果已经遍历完所有句子，重新生成随机顺序
        randomOrderRef.current = generateRandomOrder(sentences.length);
      }
      currentRandomIndexRef.current = nextRandomIndex;
      nextIndex = randomOrderRef.current[currentRandomIndexRef.current];
      console.log('[handleNext] 下一个句子 (随机模式):', nextIndex);
    } else {
      // 顺序模式：按照顺序切换句子
      if (sentences.length === 0) {
        console.log('[handleNext] 没有可用的句子，返回');
        return;
      }
      nextIndex = (currentIndex + 1) % sentences.length;
      console.log('[handleNext] 下一个句子 (顺序模式):', nextIndex, '(从', currentIndex, '切换到', nextIndex, ')');
    }
    
    // 重置当前状态，确保切换更流畅
    setResult(null)
    setShowModal(false)
    
    // 更新练习进度的最后练习索引
    setPracticeProgress(prevProgress => {
      const currentDataSource = dataSource;
      
      // 确保当前数据源的进度对象存在
      const sourceProgress = prevProgress[currentDataSource] || {
        completedSentences: [],
        correctSentences: [],
        lastPracticedIndex: -1,
        progressPercentage: 0
      };
      
      return {
        ...prevProgress,
        [currentDataSource]: {
          ...sourceProgress,
          lastPracticedIndex: nextIndex
        }
      };
    });
    
    // 预加载下一句的音频（优先预生成音频）
    if (sentences[nextIndex]) {
      preloadSentence(sentences[nextIndex], speechRate, sentenceIds[nextIndex] || null);
    }

    // 直接设置新的当前索引（移除 setTimeout）
    console.log('[handleNext] 更新 currentIndex:', nextIndex);
    setCurrentIndex(nextIndex);

    // 确保状态更新后立即预加载
    // (Preloading is already done above before state update)
  }

  // 关闭弹窗
  const handleCloseModal = () => {
    // 清除自动跳转定时器
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current)
      autoNextTimerRef.current = null
    }
    
    setShowModal(false)
    handleNext()
  }

  // 切换数据源
  const handleDataSourceChange = (newDataSource) => {
    if (newDataSource !== dataSource) {
      setDataSource(newDataSource)
      setShowDataSourceSelector(false)
    }
  }

  // 播放句子两次（第一次0.75倍速，第二次1倍速）
  const playSentenceTwice = async (sentence, sentenceId = null) => {
    try {
      await speak(sentence, 0.75, sentenceId);
      await new Promise(resolve => setTimeout(resolve, 500));
      await speak(sentence, 1.0, sentenceId);
    } catch (error) {
      console.error('Error playing sentence twice:', error);
    }
  };

  // 开始听句子模式
  const startListenMode = useCallback(() => {
    console.log('startListenMode called, speechSupported:', speechSupported, 'sentences.length:', sentences.length, 'listenMode:', listenMode);
    if (!speechSupported || sentences.length === 0) {
      return;
    }

    const listenModeLoop = async () => {
      if (!listenMode) {
        return;
      }

      try {
        console.log('Playing sentence at index:', currentIndex);
        // 播放当前句子两次
        await playSentenceTwice(sentences[currentIndex], sentenceIds[currentIndex] || null);
        // 短暂停顿后切换到下一个句子
        listenModeTimerRef.current = setTimeout(() => {
          console.log('Calling handleNext in listenModeLoop');
          // 使用现有的handleNext逻辑切换句子
          handleNext();
          // 继续循环 - 延迟调用startListenMode，确保状态更新完成
          if (listenMode) {
            setTimeout(() => {
              startListenMode();
            }, 100); // 延迟100ms，确保currentIndex状态更新完成
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
  }, [speechSupported, sentences, listenMode, playSentenceTwice]);

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
  const _handleListenModeToggle = (enabled) => {
    setListenMode(enabled);
    
    if (!enabled) {
      // 禁用听句子模式
      stopListenMode();
    }
  };
  
  // 重置练习进度
  const resetPracticeProgress = useCallback(() => {
    // 重置当前数据源的练习进度
    setPracticeProgress(prevProgress => ({
      ...prevProgress,
      [dataSource]: {
        completedSentences: [],
        correctSentences: [],
        lastPracticedIndex: -1,
        progressPercentage: 0
      }
    }));
    // 重置到第一题
    setCurrentIndex(0);
  }, [dataSource]);
  
  // 切换随机模式
  const _handleRandomModeToggle = useCallback((enabled) => {
    setRandomMode(enabled);
    // 切换随机模式时重置索引
    currentRandomIndexRef.current = 0;
    if (enabled && sentences.length > 0) {
      // 启用随机模式时生成新的随机顺序
      randomOrderRef.current = generateRandomOrder(sentences.length);
      // 切换到第一个随机句子
      setCurrentIndex(randomOrderRef.current[0]);
    }
  }, [sentences.length]);
  
  // 切换自动朗读
  const _handleAutoPlayToggle = useCallback((enabled) => {
    setAutoPlay(enabled);
  }, []);
  
  // 切换自动切换下一句
  const _handleToggleAutoNext = useCallback((enabled) => {
    setAutoNext(enabled);
  }, []);
  
  // 切换显示原文
  const handleToggleOriginalText = useCallback(() => {
    setShowOriginalText(!showOriginalText);
  }, [showOriginalText]);

  // 切换计数器显示
  const handleToggleShowCounter = useCallback(() => {
    setShowCounter(!showCounter);
  }, [showCounter]);

  // 切换设置弹窗
  const handleToggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
  }, [showSettings]);

  // 处理数据源选择
  const handleSelectDataSource = useCallback((sourceId) => {
    if (sourceId === 'flashcards') {
      // 如果选择闪卡模式，直接进入闪卡应用
      setShowFlashcardApp(true);
      setHasSelectedDataSource(true);
      setDataSourceError(null);
    } else {
      // 其他数据源正常处理
      setDataSource(sourceId);
      setHasSelectedDataSource(true);
      setDataSourceError(null);
    }
  }, []);
  
  // 处理从 SupabaseSelector 加载的句子
  const handleSupabaseSentencesLoad = useCallback((loadedSentences, loadedIds) => {
    console.log('[App] 收到 Supabase 句子:', loadedSentences?.length, 'IDs:', loadedIds?.length);
    setSentences(loadedSentences);
    setSentenceIds(loadedIds || []);
    setCurrentIndex(0);
    setDataSourceError(null);
  }, []);
  
  const handleSupabaseError = useCallback((error) => {
    setDataSourceError(error);
  }, []);
  useEffect(() => {
    if (listenMode) {
      // 启用听句子模式
      setShowOriginalText(true); // 自动显示原文
      startListenMode();
    }
  }, [listenMode, startListenMode]);

  const currentDataSource = useMemo(() => {
    return DATA_SOURCES.find(s => s.id === dataSource)
  }, [dataSource])

  if (!hasSelectedDataSource) {
    return (
      <DataSourceSelection 
        dataSourceError={dataSourceError}
        onSelectDataSource={handleSelectDataSource}
      />
    )
  }

  if (isLoading && dataSource !== DATA_SOURCE_TYPES.SUPABASE) {
    return (
      <div className="loading">
        <div>Loading sentences...</div>
        <div className="loading-source">从 {currentDataSource?.name || '数据源'} 加载中...</div>
      </div>
    )
  }

  if (sentences.length === 0 && !dataSourceError) {
    // 对于需要选择文章的数据源，不显示错误，而是显示选择器
    const needsArticleSelection = 
      (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_3 && !selectedArticleId) ||
      dataSource === DATA_SOURCE_TYPES.SUPABASE;
    
    if (!needsArticleSelection) {
      return <div className="error">No sentences available. Please check your data source.</div>
    }
  }

  return (
    <div className="app">
      {showFlashcardApp ? (
        <Suspense fallback={<div className="loading">加载闪卡应用中...</div>}>
          <FlashcardApp onBack={() => {
            setShowFlashcardApp(false);
            setHasSelectedDataSource(false);
          }} />
        </Suspense>
      ) : (
        <>
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
            <div className="app-controls">
              <button
                className="flashcard-button"
                onClick={() => setShowFlashcardApp(true)}
                title="闪卡功能"
              >
                📇 闪卡
              </button>
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
            </div>
          </header>
       
      <main className="app-main">
        {dataSourceError && (
          <div className="data-source-warning">
            <span>⚠️ {dataSourceError}</span>
          </div>
        )}
        
        {/* 文章选择器 */}
        <ArticleSelector
          dataSource={dataSource}
          articles={dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_2 ? newConcept2Articles : newConcept3Articles}
          selectedArticleId={selectedArticleId}
          onArticleChange={setSelectedArticleId}
          isLoading={isLoading}
        />

        <ArticleSelectorHint
          dataSource={dataSource}
          articles={dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_2 ? newConcept2Articles : newConcept3Articles}
          selectedArticleId={selectedArticleId}
          isLoading={isLoading}
        />

        <LocalResourceSelector
          dataSource={dataSource}
          resources={localResources}
          selectedResourceId={localResourceId}
          onResourceChange={setLocalResourceId}
        />

        {/* Supabase 选择器 - 按标签筛选文章 */}
        <SupabaseSelector
          dataSource={dataSource}
          onSentencesLoad={handleSupabaseSentencesLoad}
          onError={handleSupabaseError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
        
        {/* 只有当有句子数据时才显示听写区域 */}
        {sentences.length > 0 && (
          <>
            <PracticeStats 
                stats={practiceStats}
                progress={practiceProgress}
                dataSource={dataSource}
                onResetStats={resetPracticeStats}
                onResetProgress={resetPracticeProgress}
              />
            
             {/* 音标显示部分 */}
              <PhoneticsSection
                sentences={sentences}
                currentIndex={currentIndex}
                totalSentences={sentences.length}
                showOriginalText={showOriginalText}
                onToggleOriginalText={handleToggleOriginalText}
                currentTranslation={currentTranslation}
              />
            
            {/* 标准按词输入部分 */}
              <WordInputs
                wordInputs={wordInputs}
                currentWords={currentWords}
                onWordInputChange={_handleWordInputChange}
                onSubmit={_handleSubmit}
                listenMode={listenMode}
                speechSupported={speechSupported}
                onPlay={_handlePlay}
                inputRefs={inputRefs}
                onToggleSettings={handleToggleSettings}
                onNext={handleNext}
                showCounter={showCounter}
              />

            {/* 语音警告 */}
            {!speechSupported && (
              <p className="speech-warning">Speech synthesis is not supported in your browser.</p>
            )}

            {/* 弹窗显示结果 */}
            <Suspense fallback={<div>加载中...</div>}>
              <ResultModal
                isOpen={showModal}
                result={result}
                correctSentence={sentences[currentIndex] ? getExpandedSentence(sentences[currentIndex]) : ''}
                practiceStats={practiceStats}
                onClose={handleCloseModal}
              />
            </Suspense>

            {/* 设置弹窗 */}
            <Suspense fallback={<div>加载中...</div>}>
              <SettingsModal
                isOpen={showSettings}
                onClose={handleToggleSettings}
                autoPlay={autoPlay}
                onToggleAutoPlay={_handleAutoPlayToggle}
                randomMode={randomMode}
                onToggleRandomMode={_handleRandomModeToggle}
                listenMode={listenMode}
                onToggleListenMode={_handleListenModeToggle}
                autoNext={autoNext}
                onToggleAutoNext={_handleToggleAutoNext}
                showCounter={showCounter}
                onToggleShowCounter={handleToggleShowCounter}
                speechRate={speechRate}
                onSpeechRateChange={_setSpeechRate}
                speechSupported={speechSupported}
                // translation features removed
              />
            </Suspense>
          </>
        )}
      </main>
       
      <footer className="app-footer">
          <p>Sentence Dictation Practice Tool</p>
        </footer>
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App
