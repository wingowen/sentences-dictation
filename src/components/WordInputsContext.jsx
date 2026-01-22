// src/components/WordInputsContext.jsx
import React, { useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';

/**
 * 使用Context的WordInputs组件 - 极大地减少了props数量
 */
function WordInputsContext() {
  const {
    wordInputs,
    setWordInputs,
    currentWords,
    listenMode,
    speechSupported,
    speechRate,
    autoPlay,
    setAutoPlay,
    randomMode,
    setRandomMode,
    setListenMode,
    setShowVoiceSettings,
    inputRefs,
    autoNext,
    setAutoNext,
    setSpeechRate,
    speechPlayback,
    // 需要的事件处理函数
    onWordInputChange,
    onSubmit,
    onPlay,
    onToggleAutoPlay,
    onToggleRandomMode,
    onToggleListenMode,
    onToggleVoiceSettings,
    onToggleAutoNext,
    onSpeechRateChange
  } = useApp();

  // 聚焦第一个输入框
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, [wordInputs.length, inputRefs]);

  const handleWordInputChange = (index, value) => {
    const newWordInputs = [...wordInputs];
    newWordInputs[index] = value;
    setWordInputs(newWordInputs);

    // 调用原始的处理函数
    if (onWordInputChange) {
      onWordInputChange(index, value);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();

      // 检查当前单词是否正确
      const userWord = wordInputs[index];
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
    }
  };

  // 标准化字符串比较
  const normalize = (str) => str.toLowerCase().trim().replace(/[^\w]/g, '');

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    } else {
      speechPlayback.play(currentWords.map(w => w.word).join(' '));
    }
  };

  const handleToggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
    if (onToggleAutoPlay) onToggleAutoPlay();
  };

  const handleToggleRandomMode = () => {
    setRandomMode(!randomMode);
    if (onToggleRandomMode) onToggleRandomMode();
  };

  const handleToggleListenMode = () => {
    setListenMode(!listenMode);
    if (onToggleListenMode) onToggleListenMode();
  };

  const handleToggleVoiceSettings = () => {
    setShowVoiceSettings(prev => !prev);
    if (onToggleVoiceSettings) onToggleVoiceSettings();
  };

  const handleToggleAutoNext = () => {
    setAutoNext(!autoNext);
    if (onToggleAutoNext) onToggleAutoNext();
  };

  const handleSpeechRateChange = (rate) => {
    setSpeechRate(rate);
    if (onSpeechRateChange) onSpeechRateChange(rate);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (wordInputs.some(input => input.trim() === '')) return;

    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className="word-inputs-container">
      {/* 控制面板 */}
      <div className="input-controls">
        <button
          onClick={handlePlay}
          disabled={!speechSupported || speechPlayback.isPlaying}
          className="play-button"
        >
          {speechPlayback.isPlaying ? '⏸️' : '▶️'} 播放
        </button>

        <label className="control-label">
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={handleToggleAutoPlay}
          />
          自动播放
        </label>

        <label className="control-label">
          <input
            type="checkbox"
            checked={randomMode}
            onChange={handleToggleRandomMode}
          />
          随机模式
        </label>

        <label className="control-label">
          <input
            type="checkbox"
            checked={listenMode}
            onChange={handleToggleListenMode}
          />
          听写模式
        </label>

        <label className="control-label">
          <input
            type="checkbox"
            checked={autoNext}
            onChange={handleToggleAutoNext}
          />
          自动下一题
        </label>

        <div className="speech-rate-control">
          <label>语速: </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speechRate}
            onChange={(e) => handleSpeechRateChange(parseFloat(e.target.value))}
          />
          <span>{speechRate}x</span>
        </div>

        <button
          onClick={handleToggleVoiceSettings}
          className="voice-settings-button"
        >
          🎵 语音设置
        </button>
      </div>

      {/* 输入区域 */}
      <form onSubmit={handleSubmit} className="word-inputs-form">
        <div className="word-inputs">
          {currentWords.map((wordData, index) => (
            <div key={index} className="word-input-group">
              <label className="word-label">
                {wordData.word}
                {wordData.phonetic && (
                  <span className="phonetic">[{wordData.phonetic}]</span>
                )}
              </label>
              <input
                ref={(el) => inputRefs.current[index] = el}
                type="text"
                value={wordInputs[index] || ''}
                onChange={(e) => handleWordInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`word-input ${
                  wordInputs[index] && wordInputs[index].trim() &&
                  normalize(wordInputs[index]) === normalize(wordData.word)
                    ? 'correct'
                    : wordInputs[index] && wordInputs[index].trim() &&
                      normalize(wordInputs[index]) !== normalize(wordData.word)
                    ? 'incorrect'
                    : ''
                }`}
                placeholder={`输入单词 ${index + 1}`}
                disabled={listenMode}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={wordInputs.some(input => input.trim() === '')}
          className="submit-button"
        >
          提交答案
        </button>
      </form>
    </div>
  );
}

export default WordInputsContext;