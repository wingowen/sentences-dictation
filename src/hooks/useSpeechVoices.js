// src/hooks/useSpeechVoices.js
import { useState, useEffect, useCallback } from 'react';
import { getAvailableVoices, setVoice, getSelectedVoice, updateSpeechConfig, getSpeechConfig } from '../services/speechService';
import { getAvailableVoices as getExternalAvailableVoices, setCurrentService } from '../services/externalSpeechService';

/**
 * 语音配置Hook
 * @param {string} speechService - 语音服务类型 ('web_speech' | 'uberduck')
 * @returns {Object} 语音配置和控制函数
 */
export function useSpeechVoices(speechService = 'web_speech') {
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechConfig, setSpeechConfig] = useState({
    pitch: 1.0,
    volume: 1.0
  });
  const [isLoading, setIsLoading] = useState(true);

  // 加载语音列表
  const loadVoices = useCallback(() => {
    try {
      let voices = [];

      if (speechService === 'web_speech') {
        voices = getAvailableVoices();
      } else if (speechService === 'uberduck') {
        // 外部语音服务的处理可以在这里扩展
        voices = getExternalAvailableVoices ? getExternalAvailableVoices() : [];
      }

      setAvailableVoices(voices);

      // 如果没有选定的语音，选择第一个可用的
      if (!selectedVoice && voices.length > 0) {
        setSelectedVoice(voices[0]);
        setVoice(voices[0]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading voices:', error);
      setIsLoading(false);
    }
  }, [speechService, selectedVoice]);

  // 切换语音服务
  const changeSpeechService = useCallback((newService) => {
    if (newService !== speechService) {
      setCurrentService(newService);
      loadVoices(); // 重新加载语音列表
    }
  }, [speechService, loadVoices]);

  // 选择语音
  const selectVoice = useCallback((voice) => {
    setSelectedVoice(voice);
    setVoice(voice);
  }, []);

  // 更新语音配置
  const updateConfig = useCallback((config) => {
    const newConfig = {
      ...speechConfig,
      ...config
    };
    setSpeechConfig(newConfig);
    updateSpeechConfig(newConfig);
  }, [speechConfig]);

  // 初始化时加载语音
  useEffect(() => {
    loadVoices();

    // 监听语音列表变化（Web Speech API有时异步加载）
    if (speechService === 'web_speech' && window.speechSynthesis) {
      const handleVoicesChanged = () => {
        loadVoices();
      };

      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, [speechService, loadVoices]);

  // 加载当前配置
  useEffect(() => {
    const currentConfig = getSpeechConfig();
    if (currentConfig) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSpeechConfig(currentConfig);
    }

    const currentVoice = getSelectedVoice();
    if (currentVoice) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedVoice(currentVoice);
    }
  }, []);

  return {
    availableVoices,
    selectedVoice,
    speechConfig,
    isLoading,
    selectVoice,
    updateConfig,
    changeSpeechService,
    reloadVoices: loadVoices
  };
}