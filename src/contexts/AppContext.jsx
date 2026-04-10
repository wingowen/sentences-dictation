// src/contexts/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePracticeStats } from '../hooks/usePracticeStats';
import { usePracticeProgress } from '../hooks/usePracticeProgress';
import { useSpeechVoices } from '../hooks/useSpeechVoices';
import { useSpeechPlayback } from '../hooks/useSpeechPlayback';
import { useSentences } from '../hooks/useSentences';
import { DATA_SOURCE_TYPES, newConcept2Data, newConcept3Data } from '../services/dataService';
import { speak, isSpeechSupported, cancelSpeech } from '../services/speechService';
import { parseSentenceForPhonetics } from '../services/pronunciationService';
import { getTranslation, getWordTranslation } from '../services/translationService';

// 创建Context
const AppContext = createContext();

// Context Provider组件
export function AppProvider({ children, dataSource = DATA_SOURCE_TYPES.LOCAL }) {
  // 基本状态
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordInputs, setWordInputs] = useState([]);
  const [result, setResult] = useState(null);
  const [showOriginalText, setShowOriginalText] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDataSourceSelector, setShowDataSourceSelector] = useState(false);
  const [showLessonSelector, setShowLessonSelector] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [speechRate, setSpeechRate] = useState(1);
  const [randomMode, setRandomMode] = useState(false);
  const [listenMode, setListenMode] = useState(false);
  const [speechService, setSpeechService] = useState('web_speech');
  const [autoNext, setAutoNext] = useState(true);

  // 输入框引用
  const inputRefs = useRef([]);

  // 使用自定义 hooks
  const practiceStats = usePracticeStats();
  const sentences = useSentences(dataSource);
  const speechVoices = useSpeechVoices(speechService);
  const speechPlayback = useSpeechPlayback(speechService, { rate: speechRate });
  
  // 解构 sentences 对象
  const { sentences: sentencesData, isLoading: sentencesLoading, error: sentencesError } = sentences;

  // 处理句子数据，将字符串转换为带有words属性的对象
  const processedSentences = useMemo(() => {
    return sentences.sentences.map(sentence => {
      if (typeof sentence === 'string') {
        // 如果是字符串，将其解析为单词对象
        const words = parseSentenceForPhonetics(sentence);
        // 注意：getTranslation 现在是异步的，所以这里先返回 null
        // 翻译会在实际使用时异步加载
        const translation = null; // getTranslation(sentence);

        // 为每个单词添加翻译
        const wordsWithTranslation = words.map(word => ({
          ...word,
          translation: getWordTranslation(word.word)
        }));

        return {
          text: sentence,
          translation: translation,
          words: wordsWithTranslation
        };
      } else if (sentence && sentence.words) {
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
          translation: translation,
          words: wordsWithTranslation
        };
      } else {
        // 其他情况，返回空对象
        return {
          text: sentence || '',
          translation: null,
          words: []
        };
      }
    });
  }, [sentences.sentences]);

  const practiceProgress = usePracticeProgress(sentences.currentDataSource, processedSentences.length);

  const rawArticles = useMemo(() => {
    if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_2 && newConcept2Data?.success && newConcept2Data?.articles) {
      return newConcept2Data.articles;
    }
    if (dataSource === DATA_SOURCE_TYPES.NEW_CONCEPT_3 && newConcept3Data?.success && newConcept3Data?.articles) {
      return newConcept3Data.articles;
    }
    return null;
  }, [dataSource, newConcept2Data, newConcept3Data]);

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

  // 当 currentIndex 变化时，如果启用了自动播放，则自动播放句子（只播放一次）
  useEffect(() => {
    if (autoPlay && currentWords.length > 0) {
      const sentenceText = currentWords
        .filter(w => w && w.word)
        .map(w => w.word)
        .join(' ');
      
      if (sentenceText) {
        // 使用 setTimeout 确保在渲染完成后播放
        const timer = setTimeout(() => {
          speechPlayback.play(sentenceText);
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, autoPlay]); // 只依赖 currentIndex 和 autoPlay，避免重复触发

  // 当数据源变化时，重置状态
  useEffect(() => {
    setSelectedLesson(null);
    setCurrentIndex(0);
  }, [dataSource]);

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
    
    if (sentenceText) {
      speechPlayback.play(sentenceText);
    }
  }, [speechPlayback, currentWords]);

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
    setAutoPlay(!autoPlay);
  }, [autoPlay]);

  const handleToggleRandomMode = useCallback(() => {
    setRandomMode(!randomMode);
  }, [randomMode]);

  const handleToggleListenMode = useCallback(() => {
    setListenMode(!listenMode);
  }, [listenMode]);



  const handleToggleAutoNext = useCallback(() => {
    setAutoNext(!autoNext);
  }, [autoNext]);

  const handleToggleSettings = useCallback(() => {
    setShowSettingsModal(prev => !prev);
  }, []);

  // 上下文值
  const value = {
    // 基本状态
    currentIndex,
    setCurrentIndex,
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

    handleToggleAutoNext,
    handleToggleSettings,

    // 课文选择
    showLessonSelector,
    setShowLessonSelector,
    selectedLesson,
    setSelectedLesson,

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