// src/contexts/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePracticeStats } from '../hooks/usePracticeStats';
import { usePracticeProgress } from '../hooks/usePracticeProgress';
import { useSpeechVoices } from '../hooks/useSpeechVoices';
import { useSpeechPlayback } from '../hooks/useSpeechPlayback';
import { useSentences } from '../hooks/useSentences';
import { DATA_SOURCE_TYPES } from '../services/dataService';

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
  const practiceProgress = usePracticeProgress(sentences.currentDataSource, sentences.sentences.length);
  const speechVoices = useSpeechVoices(speechService);
  const speechPlayback = useSpeechPlayback(speechService, { rate: speechRate });
  const sentences = useSentences(DATA_SOURCE_TYPES.LOCAL);

  // 计算派生状态
  const currentWords = sentences.sentences[currentIndex]?.words || [];
  const hasSelectedDataSource = sentences.currentDataSource !== null;

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

    // 派生状态
    currentWords,
    hasSelectedDataSource,

    // Hooks状态和方法
    ...practiceStats,
    ...practiceProgress,
    ...speechVoices,
    ...speechPlayback,
    ...sentences
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