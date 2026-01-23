// src/contexts/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePracticeStats } from '../hooks/usePracticeStats';
import { usePracticeProgress } from '../hooks/usePracticeProgress';
import { useSpeechVoices } from '../hooks/useSpeechVoices';
import { useSpeechPlayback } from '../hooks/useSpeechPlayback';
import { useSentences } from '../hooks/useSentences';
import { DATA_SOURCE_TYPES } from '../services/dataService';
import { speak, isSpeechSupported, cancelSpeech, getAvailableVoices, setVoice } from '../services/speechService';
import { speak as externalSpeak, cancelSpeech as externalCancelSpeech, getAvailableVoices as getExternalAvailableVoices, setCurrentService } from '../services/externalSpeechService';
import { parseSentenceForPhonetics } from '../services/pronunciationService';

// 创建Context
const AppContext = createContext();

// Context Provider组件
export function AppProvider({ children }) {
  // 基本状态
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordInputs, setWordInputs] = useState([]);
  const [result, setResult] = useState(null);
  const [showOriginalText, setShowOriginalText] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDataSourceSelector, setShowDataSourceSelector] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [speechRate, setSpeechRate] = useState(1);
  const [randomMode, setRandomMode] = useState(false);
  const [listenMode, setListenMode] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [speechService, setSpeechService] = useState('web_speech');
  const [autoNext, setAutoNext] = useState(true);

  // 输入框引用
  const inputRefs = useRef([]);

  // 使用自定义hooks
  const practiceStats = usePracticeStats();
  const sentences = useSentences(DATA_SOURCE_TYPES.LOCAL);
  const practiceProgress = usePracticeProgress(sentences.currentDataSource, processedSentences.length);
  const speechVoices = useSpeechVoices(speechService);
  const speechPlayback = useSpeechPlayback(speechService, { rate: speechRate }) || {
    isPlaying: false,
    isSupported: false,
    currentText: '',
    error: null,
    play: () => {},
    stop: () => {},
    toggle: () => {},
    checkSupport: () => false
  };

  // 处理句子数据，将字符串转换为带有words属性的对象
  const processedSentences = useMemo(() => {
    return sentences.sentences.map(sentence => {
      if (typeof sentence === 'string') {
        // 如果是字符串，将其解析为单词对象
        const words = parseSentenceForPhonetics(sentence);
        return {
          text: sentence,
          words: words
        };
      } else if (sentence && sentence.words) {
        // 如果已经有words属性，直接使用
        return sentence;
      } else {
        // 其他情况，返回空对象
        return {
          text: sentence || '',
          words: []
        };
      }
    });
  }, [sentences.sentences]);

  // 计算派生状态
  const currentWords = processedSentences[currentIndex]?.words || [];
  const hasSelectedDataSource = sentences.currentDataSource !== null;

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

      if (isCorrect && index < wordInputs.length - 1) {
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

    // 这里应该调用实际的提交逻辑
    // 暂时保持简单
  }, [wordInputs]);

  const handlePlay = useCallback(() => {
    speechPlayback.play(currentWords.map(w => w.word).join(' '));
  }, [speechPlayback, currentWords]);

  const handleToggleAutoPlay = useCallback(() => {
    setAutoPlay(!autoPlay);
  }, [autoPlay]);

  const handleToggleRandomMode = useCallback(() => {
    setRandomMode(!randomMode);
  }, [randomMode]);

  const handleToggleListenMode = useCallback(() => {
    setListenMode(!listenMode);
  }, [listenMode]);

  const handleToggleVoiceSettings = useCallback(() => {
    setShowVoiceSettings(prev => !prev);
  }, []);

  const handleToggleAutoNext = useCallback(() => {
    setAutoNext(!autoNext);
  }, [autoNext]);

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
    showVoiceSettings,
    setShowVoiceSettings,
    speechService,
    setSpeechService,
    autoNext,
    setAutoNext,
    inputRefs,
    // 事件处理函数
    handleWordInputChange,
    handleSubmit,
    handlePlay,
    handleToggleAutoPlay,
    handleToggleRandomMode,
    handleToggleListenMode,
    handleToggleVoiceSettings,
    handleToggleAutoNext,

    // 派生状态
    currentWords,
    hasSelectedDataSource,

    // Hooks状态和方法
    ...practiceStats,
    ...practiceProgress,
    ...speechVoices,
    ...speechPlayback,

    // 修改sentences以使用处理后的句子数据
    sentences: processedSentences,
    sentencesData: sentences // 保留原始sentences对象以防需要
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