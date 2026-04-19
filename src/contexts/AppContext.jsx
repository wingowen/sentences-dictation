// src/contexts/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePracticeStats } from '../hooks/usePracticeStats';
import { usePracticeProgress } from '../hooks/usePracticeProgress';
import { useSpeechVoices } from '../hooks/useSpeechVoices';
import { useSpeechPlayback } from '../hooks/useSpeechPlayback';
import { useSentences } from '../hooks/useSentences';
import { DATA_SOURCE_TYPES, newConcept1Data, newConcept2Data, newConcept3Data } from '../services/dataService';
import { speak, isSpeechSupported, cancelSpeech } from '../services/speechService';
import { parseSentenceForPhonetics } from '../services/pronunciationService';
import { getTranslation, getWordTranslation } from '../services/translationService';


// 创建Context
const AppContext = createContext();

// Context Provider组件
export function AppProvider({ children, dataSource }) {
  // 如果没有指定数据源，不加载任何句子数据
  const effectiveDataSource = dataSource || null;
  // 基本状态
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordInputs, setWordInputs] = useState([]);
  const [result, setResult] = useState(null);
  const [showOriginalText, setShowOriginalText] = useState(() => {
    const saved = localStorage.getItem('showOriginalText');
    return saved ? saved === 'true' : false;
  });
  const [showModal, setShowModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDataSourceSelector, setShowDataSourceSelector] = useState(false);
  const [showLessonSelector, setShowLessonSelector] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [autoPlay, setAutoPlay] = useState(() => {
    const saved = localStorage.getItem('autoPlay');
    return saved ? saved === 'true' : false;
  });
  const [speechRate, setSpeechRate] = useState(() => {
    const saved = localStorage.getItem('speechRate');
    return saved ? parseFloat(saved) : 1;
  });
  const [randomMode, setRandomMode] = useState(() => {
    const saved = localStorage.getItem('randomMode');
    return saved ? saved === 'true' : false;
  });
  const [listenMode, setListenMode] = useState(() => {
    const saved = localStorage.getItem('listenMode');
    return saved ? saved === 'true' : false;
  });
  const [speechService, setSpeechService] = useState('web_speech');
  const [autoNext, setAutoNext] = useState(() => {
    const saved = localStorage.getItem('autoNext');
    return saved ? saved === 'true' : true;
  });
  const [showCounter, setShowCounter] = useState(() => {
    const saved = localStorage.getItem('showCounter');
    return saved ? saved === 'true' : false;
  });
  const [showTranslation, setShowTranslation] = useState(() => {
    const saved = localStorage.getItem('showTranslation');
    return saved ? saved === 'true' : false;
  });

  // 输入框引用
  const inputRefs = useRef([]);
  
  // 用于跟踪上次播放的句子索引，避免重复播放
  const lastPlayedIndexRef = useRef(-1);

  // 使用自定义 hooks
  const practiceStats = usePracticeStats();
  const sentences = useSentences(effectiveDataSource);
  const speechVoices = useSpeechVoices(speechService);
  const speechPlayback = useSpeechPlayback(speechService, { rate: speechRate });
  
  // 解构 sentences 对象
  const { sentences: sentencesData, isLoading: sentencesLoading, error: sentencesError } = sentences;

  // 当数据源变化时，清除已选择的课程
  useEffect(() => {
    setSelectedLesson(null);
    setCurrentIndex(0);
    lastPlayedIndexRef.current = -1;
  }, [dataSource]);

  // 处理句子数据，将字符串转换为带有words属性的对象
  // 如果选择了特定课程（selectedLesson），只使用该课程的句子
  const processedSentences = useMemo(() => {
    // 确定要处理的句子数据源
    let sentencesToProcess = [];
    
    if (selectedLesson && selectedLesson.sentences) {
      // 如果选择了特定课程，使用该课程的句子
      sentencesToProcess = selectedLesson.sentences;
    } else if (sentences.sentences && sentences.sentences.length > 0) {
      // 否则使用默认的句子数据
      sentencesToProcess = sentences.sentences;
    }
    
    return sentencesToProcess.map((sentence) => {
      if (sentence && sentence.words) {
        // 如果已经有words属性，添加翻译信息
        // 注意：getTranslation 现在是异步的，所以这里先返回 null
        const translation = null; // getTranslation(sentence.text || sentence);

        // 为每个单词添加翻译
        const wordsWithTranslation = sentence.words.map(word => ({
          ...word,
          translation: getWordTranslation(word.word)
        }));

        return {
          ...sentence,
          id: sentence.id,
          translation: translation,
          words: wordsWithTranslation
        };
      } else if (sentence && sentence.text) {
        // 对象格式但只有 text 属性（如新概念二/三的数据）
        const words = parseSentenceForPhonetics(sentence.text);

        // 为每个单词添加翻译
        const wordsWithTranslation = words.map(word => ({
          ...word,
          translation: getWordTranslation(word.word)
        }));

        return {
          id: sentence.id,
          text: sentence.text,
          translation: sentence.translation || null,
          words: wordsWithTranslation
        };
      } else {
        // 其他情况，返回空对象
        return {
          id: sentence.id,
          text: sentence.text || sentence || '',
          translation: sentence.translation || null,
          words: []
        };
      }
    });
  }, [sentences.sentences, selectedLesson]);

  const practiceProgress = usePracticeProgress(sentences.currentDataSource, processedSentences.length);

  const rawArticles = useMemo(() => {
    if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_1 && newConcept1Data?.success && newConcept1Data?.articles) {
      return newConcept1Data.articles;
    }
    if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_2 && newConcept2Data?.success && newConcept2Data?.articles) {
      return newConcept2Data.articles;
    }
    if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_3 && newConcept3Data?.success && newConcept3Data?.articles) {
      return newConcept3Data.articles;
    }
    return null;
  }, [dataSource]);

  // 计算派生状态
  const currentWords = processedSentences[currentIndex]?.words || [];
  const currentTranslation = processedSentences[currentIndex]?.translation || '翻译暂无';
  const hasSelectedDataSource = sentences.currentDataSource !== null;

  // 初始化 wordInputs 数组，确保与 currentWords 长度一致
  useEffect(() => {
    if (currentWords.length > 0) {
      const initialWordInputs = currentWords.map(() => '');
      setWordInputs(initialWordInputs);
      // 初始化输入框引用数组
      inputRefs.current = new Array(currentWords.length).fill(null);
    }
  }, [currentWords.length, currentWords]);

  // 当 currentIndex 变化时，如果启用了自动播放且已选择课文，则自动播放句子（只播放一次）
  useEffect(() => {
    if (autoPlay && selectedLesson && currentWords.length > 0 && currentIndex !== lastPlayedIndexRef.current) {
      const sentenceText = currentWords
        .filter(w => w && w.word)
        .map(w => w.word)
        .join(' ');

      const currentSentence = processedSentences[currentIndex];
      const sentenceId = currentSentence?.id;

      if (sentenceText) {
        // 使用 setTimeout 确保在渲染完成后播放
        const timer = setTimeout(() => {
          speechPlayback.play(sentenceText, { sentenceId });
          lastPlayedIndexRef.current = currentIndex;
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, autoPlay, selectedLesson, currentWords.length]); // 只依赖 currentIndex、autoPlay、selectedLesson，避免 processedSentences 和 speechPlayback 导致的重复触发

  // 标准化字符串比较
  const normalize = useCallback((str) => str.toLowerCase().trim().replace(/[^\w]/g, ''), []);

  // 事件处理函数（使用useCallback优化性能）
  const handleWordInputChange = useCallback((index, value) => {
    const newWordInputs = [...wordInputs];
    newWordInputs[index] = value;
    setWordInputs(newWordInputs);

    // 检查当前单词是否正确，自动跳转
    const userWord = value;
    const correctWord = currentWords[index]?.word;

    if (userWord.trim() && correctWord) {
      const isCorrect = normalize(userWord) === normalize(correctWord);

      if (isCorrect && index < currentWords.length - 1) {
        // 单词正确，跳转到下一个输入框
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 100);
      }
    }
  }, [wordInputs, currentWords, normalize]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (wordInputs.some(input => input.trim() === '')) return;

    // 检查所有单词是否都正确
    const allCorrect = wordInputs.every((input, index) => {
      const correctWord = currentWords[index]?.word;
      return correctWord && normalize(input) === normalize(correctWord);
    });

    // 设置结果
    setResult(allCorrect ? 'correct' : 'incorrect');
    setShowModal(true);
  }, [wordInputs, currentWords, normalize]);

  const handlePlay = useCallback(() => {
    const sentenceText = currentWords
      .filter(w => w && w.word)
      .map(w => w.word)
      .join(' ');

    const currentSentence = processedSentences[currentIndex];
    const sentenceId = currentSentence?.id;

    if (sentenceText) {
      speechPlayback.play(sentenceText, { sentenceId });
    }
  }, [speechPlayback, currentWords, processedSentences, currentIndex]);

  const handlePlayWord = useCallback((word) => {
    console.log('[AppContext] Playing word:', word);
    if (word && speechPlayback) {
      console.log('[AppContext] speechPlayback.play called with:', word);
      speechPlayback.play(word);
    } else {
      console.warn('[AppContext] Cannot play word - word:', word, 'speechPlayback:', !!speechPlayback);
    }
  }, [speechPlayback]);

  const handleToggleAutoPlay = useCallback(() => {
    const newValue = !autoPlay;
    setAutoPlay(newValue);
    localStorage.setItem('autoPlay', newValue.toString());
  }, [autoPlay]);

  const handleToggleRandomMode = useCallback(() => {
    const newValue = !randomMode;
    setRandomMode(newValue);
    localStorage.setItem('randomMode', newValue.toString());
  }, [randomMode]);

  const handleToggleListenMode = useCallback(() => {
    const newValue = !listenMode;
    setListenMode(newValue);
    localStorage.setItem('listenMode', newValue.toString());
  }, [listenMode]);

  const handleSpeechRateChange = useCallback((newRate) => {
    setSpeechRate(newRate);
    localStorage.setItem('speechRate', newRate.toString());
  }, []);

  const handleToggleAutoNext = useCallback(() => {
    const newValue = !autoNext;
    setAutoNext(newValue);
    localStorage.setItem('autoNext', newValue.toString());
  }, [autoNext]);

  const handleToggleSettings = useCallback(() => {
    setShowSettingsModal(prev => !prev);
  }, []);

  const handleToggleShowCounter = useCallback(() => {
    const newValue = !showCounter;
    setShowCounter(newValue);
    localStorage.setItem('showCounter', newValue.toString());
  }, [showCounter]);

  const handleToggleShowTranslation = useCallback(() => {
    const newValue = !showTranslation;
    setShowTranslation(newValue);
    localStorage.setItem('showTranslation', newValue.toString());
  }, [showTranslation]);

  const handleToggleShowOriginalText = useCallback(() => {
    const newValue = !showOriginalText;
    setShowOriginalText(newValue);
    localStorage.setItem('showOriginalText', newValue.toString());
  }, [showOriginalText]);

  // 安全的索引设置函数，当索引超出范围时自动切换到下一篇课文
  const safeSetCurrentIndex = useCallback((newIndex) => {
    if (!processedSentences || processedSentences.length === 0) {
      setCurrentIndex(0);
      return;
    }
    
    // 计算新索引
    const index = typeof newIndex === 'function' ? newIndex(currentIndex) : newIndex;
    
    if (index >= processedSentences.length) {
      // 索引超出范围，尝试切换到下一篇课文
      if (rawArticles && selectedLesson) {
        const currentLessonIndex = rawArticles.findIndex(article => 
          article.lesson_id === selectedLesson.lesson_id
        );
        
        if (currentLessonIndex !== -1 && currentLessonIndex < rawArticles.length - 1) {
          // 切换到下一篇课文
          const nextLesson = {
            lesson_id: rawArticles[currentLessonIndex + 1].lesson_id || `lesson-${currentLessonIndex + 2}`,
            lesson_number: `Lesson ${currentLessonIndex + 2}`,
            title: rawArticles[currentLessonIndex + 1].title || `第 ${currentLessonIndex + 2} 课`,
            sentences: rawArticles[currentLessonIndex + 1].sentences || []
          };
          setSelectedLesson(nextLesson);
          setCurrentIndex(0);
          lastPlayedIndexRef.current = -1;
        } else {
          // 已经是最后一篇课文，保持在最后一句
          setCurrentIndex(processedSentences.length - 1);
        }
      } else {
        // 没有选择课文或没有课文数据，保持在最后一句
        setCurrentIndex(processedSentences.length - 1);
      }
    } else if (index < 0) {
      // 索引小于0，保持在第一句
      setCurrentIndex(0);
    } else {
      // 索引正常，直接设置
      setCurrentIndex(index);
    }
  }, [processedSentences.length, rawArticles, selectedLesson, currentIndex]);

  // 上下文值
  const value = {
    // 基本状态
    currentIndex,
    setCurrentIndex: safeSetCurrentIndex,
    wordInputs,
    setWordInputs,
    result,
    setResult,
    showOriginalText,
    setShowOriginalText,
    showModal,
    setShowModal,
    showSettingsModal,
    setShowSettingsModal,
    showDataSourceSelector,
    setShowDataSourceSelector,
    autoPlay,
    setAutoPlay,
    speechRate,
    setSpeechRate,
    randomMode,
    setRandomMode,
    showCounter,
    setShowCounter,
    showTranslation,
    setShowTranslation,
    listenMode,
    setListenMode,

    speechService,
    setSpeechService,
    autoNext,
    setAutoNext,
    inputRefs,
    // 事件处理函数
    handleWordInputChange,
    handleSubmit,
    handlePlay,
    handlePlayWord,
    handleToggleAutoPlay,
    handleToggleRandomMode,
    handleToggleListenMode,
    handleSpeechRateChange,
    handleToggleAutoNext,
    handleToggleSettings,
    handleToggleShowCounter,
    handleToggleShowTranslation,
    handleToggleShowOriginalText,

    // 课文选择
    showLessonSelector,
    setShowLessonSelector,
    selectedLesson,
    setSelectedLesson: (lesson) => {
      setSelectedLesson(lesson);
      setCurrentIndex(0); // 选择新课程时重置索引
      lastPlayedIndexRef.current = -1; // 重置播放记录
    },

    // 数据源和加载状态
    dataSource,
    sentencesLoading,
    rawArticles,

    // 派生状态
    currentWords,
    currentTranslation,
    hasSelectedDataSource,

    // Hooks 状态和方法
    ...practiceStats,
    ...practiceProgress,
    ...speechVoices,
    ...speechPlayback,

    // 修改 sentences 以使用处理后的句子数据
    sentences: processedSentences,
    sentencesData: sentencesData // 保留原始 sentences 对象以防需要
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// 使用Context的hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;