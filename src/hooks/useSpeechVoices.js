// src/hooks/useSpeechVoices.js
// 简化版：Edge TTS 使用固定语音，不再需要用户选择

import { useState, useCallback } from 'react';

/**
 * 语音配置 Hook（简化版）
 * @returns {Object} 语音配置
 */
export function useSpeechVoices() {
  const [isLoading] = useState(false);

  return {
    availableVoices: [],
    selectedVoice: null,
    speechConfig: { pitch: 1.0, volume: 1.0 },
    isLoading,
    selectVoice: () => {},
    updateConfig: () => {},
    changeSpeechService: () => {},
    reloadVoices: () => {}
  };
}
