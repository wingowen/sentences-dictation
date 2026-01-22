// 外部语音服务 - 集成免费的TTS API

import { debounce } from '../utils/debounce.js';

// 服务配置
const SERVICES = {
  UBERDUCK: 'uberduck',
  WEB_SPEECH: 'web_speech'
};

// 当前使用的服务
let currentService = SERVICES.WEB_SPEECH;

// API端点配置
const API_CONFIG = {
  [SERVICES.UBERDUCK]: {
    // Uberduck.ai 免费API端点
    // 注意：免费版可能有请求限制和较慢的响应时间
    // 这里使用示例配置，实际使用需要根据Uberduck.ai的最新文档调整
    endpoint: 'https://api.uberduck.ai/speak',
    // 免费版可能不需要API密钥，但某些功能可能需要
    apiKey: ''
  }
};

// 语音合成状态管理
let isSpeaking = false;
let lastSpeakTime = 0;
const SPEAK_DEBOUNCE_DELAY = 300; // 防抖延迟（毫秒）

// 语音缓存
const speechCache = new Map();
const CACHE_EXPIRY_TIME = 3600000; // 缓存过期时间（1小时）

// 清理过期缓存的函数
const cleanupExpiredCache = () => {
  const now = Date.now();
  speechCache.forEach((cachedItem, cacheKey) => {
    if (now - cachedItem.timestamp > CACHE_EXPIRY_TIME) {
      // 释放URL对象
      if (cachedItem.url) {
        URL.revokeObjectURL(cachedItem.url);
      }
      // 删除过期缓存
      speechCache.delete(cacheKey);
    }
  });
};

// 定期清理过期缓存（每10分钟执行一次）
setInterval(cleanupExpiredCache, 10 * 60 * 1000);

/**
 * 检查外部TTS服务是否可用
 * @param {string} service 服务名称
 * @returns {boolean} 服务是否可用
 */
export const isExternalServiceAvailable = (service) => {
  // 对于Uberduck.ai，检查网络连接
  if (service === SERVICES.UBERDUCK) {
    return navigator.onLine;
  }
  return false;
};

/**
 * 设置当前使用的语音服务
 * @param {string} service 服务名称
 */
export const setCurrentService = (service) => {
  if (Object.values(SERVICES).includes(service)) {
    currentService = service;
  }
};

/**
 * 获取当前使用的语音服务
 * @returns {string} 当前服务名称
 */
export const getCurrentService = () => {
  return currentService;
};

/**
 * 生成语音缓存键
 * @param {string} text 文本内容
 * @param {number} rate 语速
 * @param {string} voice 语音名称
 * @returns {string} 缓存键
 */
const generateCacheKey = (text, rate, voice) => {
  return `${currentService}_${text}_${rate}_${voice}`;
};

/**
 * 检查缓存是否有效
 * @param {Object} cachedItem 缓存项
 * @returns {boolean} 缓存是否有效
 */
const isCacheValid = (cachedItem) => {
  return Date.now() - cachedItem.timestamp < CACHE_EXPIRY_TIME;
};

/**
 * 使用Uberduck.ai API合成语音
 * @param {string} text 文本内容
 * @param {number} rate 语速
 * @param {string} voice 语音名称
 * @returns {Promise<Audio>} 音频对象
 */
const speakWithUberduck = async (text, rate, voice = 'en-us-amy-low') => {
  // 生成缓存键
  const cacheKey = generateCacheKey(text, rate, voice);
  
  // 检查缓存
  if (speechCache.has(cacheKey)) {
    const cachedItem = speechCache.get(cacheKey);
    if (isCacheValid(cachedItem)) {
      // 使用缓存的音频
      const audio = new Audio(cachedItem.url);
      return audio;
    }
  }
  
  // 构建请求参数
  const params = new URLSearchParams();
  params.append('text', text);
  params.append('voice', voice);
  params.append('speed', rate);
  
  // 发送请求
  const response = await fetch(`${API_CONFIG[ SERVICES.UBERDUCK ].endpoint}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'audio/wav'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Uberduck API error: ${response.statusText}`);
  }
  
  // 转换响应为Blob
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  
  // 缓存音频
  speechCache.set(cacheKey, {
    url,
    timestamp: Date.now()
  });
  
  // 创建音频对象
  const audio = new Audio(url);
  
  // 音频播放完成后释放URL对象
  audio.onended = () => {
    URL.revokeObjectURL(url);
  };
  
  return audio;
};

/**
 * 使用外部服务朗读文本
 * @param {string} text 文本内容
 * @param {number} rate 语速
 * @param {string} voice 语音名称
 * @returns {Promise<void>}
 */
export const speak = async (text, rate = 1.0, voice = 'en-us-amy-low') => {
  // 防抖处理
  const now = Date.now();
  if (now - lastSpeakTime < SPEAK_DEBOUNCE_DELAY) {
    throw new Error('Speech synthesis is debounced. Please wait a moment and try again.');
  }
  lastSpeakTime = now;
  
  try {
    isSpeaking = true;
    
    let audio;
    
    // 根据当前服务选择合成方法
    switch (currentService) {
      case SERVICES.UBERDUCK:
        audio = await speakWithUberduck(text, rate, voice);
        break;
      default:
        throw new Error('Invalid speech service');
    }
    
    // 播放音频
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        isSpeaking = false;
        resolve();
      };
      
      audio.onerror = (error) => {
        isSpeaking = false;
        reject(error);
      };
      
      audio.play();
    });
  } catch (error) {
    isSpeaking = false;
    throw error;
  }
};

/**
 * 取消当前朗读
 */
export const cancelSpeech = () => {
  isSpeaking = false;
  // 这里可以添加取消音频播放的逻辑
};

/**
 * 检查是否正在朗读
 * @returns {boolean} 是否正在朗读
 */
export const getIsSpeaking = () => {
  return isSpeaking;
};

/**
 * 获取可用的语音列表
 * @returns {Promise<Array>} 可用语音列表
 */
export const getAvailableVoices = async () => {
  // 对于Uberduck.ai，返回一些预设的英语语音
  // 实际项目中可以调用API获取完整列表
  return [
    { name: 'en-us-amy-low', lang: 'en-US', displayName: 'Amy (English US)' },
    { name: 'en-us-betty-low', lang: 'en-US', displayName: 'Betty (English US)' },
    { name: 'en-us-dave-low', lang: 'en-US', displayName: 'Dave (English US)' },
    { name: 'en-us-joe-low', lang: 'en-US', displayName: 'Joe (English US)' }
  ];
};
