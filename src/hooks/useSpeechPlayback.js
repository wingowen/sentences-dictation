// src/hooks/useSpeechPlayback.js
import React, { useState, useCallback, useRef } from 'react';
import { speak, isSpeechSupported, cancelSpeech } from '../services/speechService';
import { speak as externalSpeak, cancelSpeech as externalCancelSpeech } from '../services/externalSpeechService';

/**
 * 语音播放控制Hook
 * @param {string} speechService - 语音服务类型 ('web_speech' | 'uberduck')
 * @param {Object} options - 播放选项
 * @returns {Object} 播放控制和状态
 */
export function useSpeechPlayback(speechService = 'web_speech', options = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [error, setError] = useState(null);

  // 播放状态引用
  const isPlayingRef = useRef(false);

  // 检查语音支持
  const checkSupport = useCallback(() => {
    const supported = isSpeechSupported();
    setIsSupported(supported);
    return supported;
  }, []);

  // 开始播放
  const play = useCallback(async (text, playOptions = {}) => {
    if (!text || isPlayingRef.current) {
      return;
    }

    try {
      setError(null);
      setIsPlaying(true);
      setCurrentText(text);
      isPlayingRef.current = true;

      const mergedOptions = {
        ...options,
        ...playOptions
      };

      if (speechService === 'web_speech') {
        await speak(text, mergedOptions.rate || 1.0);
      } else if (speechService === 'uberduck') {
        await externalSpeak(text, mergedOptions.rate || 1.0, mergedOptions.voice);
      }

      // 播放完成后清理状态
      setIsPlaying(false);
      setCurrentText('');
      isPlayingRef.current = false;

    } catch (err) {
      console.error('Speech playback error:', err);
      setError(err);
      setIsPlaying(false);
      setCurrentText('');
      isPlayingRef.current = false;

      throw err;
    }
  }, [speechService, options]);

  // 停止播放
  const stop = useCallback(() => {
    try {
      if (speechService === 'web_speech') {
        cancelSpeech();
      } else if (speechService === 'uberduck') {
        externalCancelSpeech();
      }

      setIsPlaying(false);
      setCurrentText('');
      isPlayingRef.current = false;
      setError(null);
    } catch (err) {
      console.error('Speech stop error:', err);
      setError(err);
    }
  }, [speechService]);

  // 切换播放/暂停
  const toggle = useCallback((text, playOptions = {}) => {
    if (isPlaying) {
      stop();
    } else {
      play(text, playOptions);
    }
  }, [isPlaying, play, stop]);

  // 初始化时检查支持
  React.useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  return {
    isPlaying,
    isSupported,
    currentText,
    error,
    play,
    stop,
    toggle,
    checkSupport
  };
}