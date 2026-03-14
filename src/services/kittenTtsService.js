// KittenTTS 本地服务 - 调用本地 Python 服务器
// 模型仅 25MB，无需 GPU，音质远超 Web Speech API

let KITTEN_TTS_URL = localStorage.getItem('kittenTtsUrl') || 'http://127.0.0.1:8765';

/**
 * 设置 KittenTTS 服务器地址
 * @param {string} url - 服务器地址，如 'http://127.0.0.1:8765' 或 'https://xxx.ngrok.io'
 */
export const setKittenTtsUrl = (url) => {
  KITTEN_TTS_URL = url.replace(/\/$/, ''); // 去除尾部斜杠
  localStorage.setItem('kittenTtsUrl', KITTEN_TTS_URL);
  isServerAvailable = null; // 重置检测状态
  lastHealthCheck = 0;
};

/**
 * 获取当前 KittenTTS 服务器地址
 */
export const getKittenTtsUrl = () => KITTEN_TTS_URL;
const CACHE_MAX_SIZE = 100;

// 音频缓存
const audioCache = new Map();
let isServerAvailable = null; // null=未检测, true/false=已检测
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30秒重新检测一次

/**
 * 检测 KittenTTS 本地服务器是否可用
 */
export const isKittenTtsAvailable = async () => {
  const now = Date.now();
  // 缓存检测结果，避免频繁请求
  if (isServerAvailable !== null && now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return isServerAvailable;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2秒超时

    const res = await fetch(`${KITTEN_TTS_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      isServerAvailable = data.status === 'ok';
      console.log('[KittenTTS] 服务器可用:', data.model);
    } else {
      isServerAvailable = false;
    }
  } catch (e) {
    isServerAvailable = false;
  }

  lastHealthCheck = now;
  return isServerAvailable;
};

/**
 * 生成缓存键
 */
const getCacheKey = (text, voice) => `${voice}:${text}`;

/**
 * 朗读文本
 * @param {string} text - 要朗读的文本
 * @param {number} rate - 语速 (暂未支持，KittenTTS 固定速率)
 * @param {string} voice - 语音名 (Bella/Jasper/Luna/Bruno/Rosie/Hugo/Kiki/Leo)
 */
export const speak = async (text, rate = 1.0, voice = 'Jasper') => {
  const available = await isKittenTtsAvailable();
  if (!available) {
    throw new Error('KittenTTS 服务器不可用，请启动: python3 scripts/kitten_tts_server.py');
  }

  const cacheKey = getCacheKey(text, voice);

  // 检查缓存
  if (audioCache.has(cacheKey)) {
    console.log('[KittenTTS] 使用缓存:', text.substring(0, 30));
    playAudioBlob(audioCache.get(cacheKey));
    return;
  }

  try {
    const res = await fetch(`${KITTEN_TTS_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, speed: rate }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    // base64 -> Blob
    const binary = atob(data.audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });

    // 存入缓存
    if (audioCache.size >= CACHE_MAX_SIZE) {
      const firstKey = audioCache.keys().next().value;
      audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, blob);

    console.log('[KittenTTS] 生成成功:', text.substring(0, 30), `(${data.duration_ms}ms)`);
    playAudioBlob(blob);
  } catch (e) {
    console.error('[KittenTTS] 请求失败:', e.message);
    throw e;
  }
};

/**
 * 播放音频 Blob
 */
let currentAudio = null;

const playAudioBlob = (blob) => {
  // 停止当前播放
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const url = URL.createObjectURL(blob);
  currentAudio = new Audio(url);
  currentAudio.onended = () => {
    URL.revokeObjectURL(url);
    currentAudio = null;
  };
  currentAudio.play();
};

/**
 * 取消当前播放
 */
export const cancelSpeech = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
};

/**
 * 预加载句子音频
 * @param {string} text - 要预加载的文本
 * @param {number} rate - 语速
 * @param {string} voice - 语音名
 */
export const preloadSentence = async (text, rate = 1.0, voice = 'Jasper') => {
  const available = await isKittenTtsAvailable();
  if (!available) return;

  const cacheKey = getCacheKey(text, voice);
  if (audioCache.has(cacheKey)) return; // 已缓存

  try {
    const res = await fetch(`${KITTEN_TTS_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, speed: rate }),
    });

    if (res.ok) {
      const data = await res.json();
      const binary = atob(data.audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/wav' });

      if (audioCache.size >= CACHE_MAX_SIZE) {
        const firstKey = audioCache.keys().next().value;
        audioCache.delete(firstKey);
      }
      audioCache.set(cacheKey, blob);
      console.log('[KittenTTS] 预加载完成:', text.substring(0, 30));
    }
  } catch (e) {
    // 预加载静默失败
    console.debug('[KittenTTS] 预加载失败:', e.message);
  }
};

/**
 * 获取可用语音列表
 */
export const getAvailableVoices = async () => {
  try {
    const res = await fetch(`${KITTEN_TTS_URL}/voices`);
    if (res.ok) {
      const data = await res.json();
      return data.voices;
    }
  } catch (e) {}
  return ['Bella', 'Jasper', 'Luna', 'Bruno', 'Rosie', 'Hugo', 'Kiki', 'Leo'];
};
