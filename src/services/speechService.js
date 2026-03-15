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
 * 浏览器原生 SpeechSynthesis 回退
 * @param {string} text
 * @param {number} rate
 * @returns {Promise<void>}
 */
const speakWithBrowserSpeech = (text, rate = 1.0) => {
  if (!('speechSynthesis' in window)) {
    throw new Error('SpeechSynthesis is not available');
  }

  const SynthesisUtterance = window.SpeechSynthesisUtterance;
  if (typeof SynthesisUtterance !== 'function') {
    throw new Error('SpeechSynthesisUtterance is not available');
  }

  const synthesis = window.speechSynthesis;
  const utterance = new SynthesisUtterance(text);
  utterance.rate = rate;

  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      reject(new Error(event?.error || 'SpeechSynthesis failed'));
    };

    synthesis.cancel();
    synthesis.speak(utterance);
  });
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
    console.warn('[speechService] Edge TTS 失败，降级到浏览器 SpeechSynthesis:', error.message);

    try {
      await speakWithBrowserSpeech(text, rate);
      return;
    } catch (fallbackError) {
      console.error('[speechService] 浏览器 SpeechSynthesis 也失败了:', fallbackError.message);
      throw error;
    }
  }
};

/**
 * 取消当前所有语音朗读
 */
export const cancelSpeech = () => {
  preloadedCancelSpeech();
  edgeCancelSpeech();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
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
