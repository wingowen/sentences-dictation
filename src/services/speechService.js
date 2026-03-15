// 语音服务 - 预加载音频 → Edge TTS 二级降级

import { speak as edgeSpeak, isEdgeTtsAvailable, cancelSpeech as edgeCancelSpeech } from './edgeTtsService.js';
import {
  speak as preloadedSpeak,
  hasPreloadedAudio,
  preloadAudio,
  cancelSpeech as preloadedCancelSpeech,
} from './preloadedAudioService.js';

/**
 * 检查浏览器是否支持语音合成（保留兼容）
 * @returns {boolean}
 */
export const isSpeechSupported = () => {
  return isEdgeTtsAvailable() || 'speechSynthesis' in window;
};

/**
 * 朗读指定文本
 * @param {string} text - 要朗读的文本
 * @param {number} rate - 语速（Edge TTS 暂不支持变速）
 * @param {number|string} sentenceId - 可选，句子 ID（用于播放预加载音频）
 * @returns {Promise<void>}
 */
export const speak = async (text, rate = 1.0, sentenceId = null) => {
  // 1. 尝试预加载音频（Supabase Storage，秒播）
  if (sentenceId) {
    try {
      if (await hasPreloadedAudio(sentenceId)) {
        await preloadedSpeak(sentenceId);
        return;
      }
    } catch (error) {
      console.warn('[speechService] 预加载音频失败，降级到 Edge TTS:', error.message);
    }
  }

  // 2. Edge TTS 在线合成
  try {
    await edgeSpeak(text, rate);
  } catch (error) {
    console.error('[speechService] Edge TTS 也失败了:', error.message);
    throw error;
  }
};

/**
 * 取消当前所有语音朗读
 */
export const cancelSpeech = () => {
  preloadedCancelSpeech();
  edgeCancelSpeech();
};

/**
 * 检查是否正在朗读
 */
export const getIsSpeaking = () => false;

/**
 * 预加载句子音频
 * @param {string} text - 要预加载的文本
 * @param {number} rate - 语速
 * @param {number|string} sentenceId - 可选，句子 ID
 */
export const preloadSentence = async (text, rate = 1.0, sentenceId = null) => {
  if (sentenceId) {
    await preloadAudio(sentenceId);
  }
};
