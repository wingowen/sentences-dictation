// 预加载音频服务 - 直接播放 Supabase Storage 中预生成的 .opus 文件
// 优先级最高：秒播、零延迟、无需 TTS 服务器

const SUPABASE_URL = 'https://gtcnjqeloworstrimcsr.supabase.co';
const AUDIO_BUCKET = 'sentence-audios';

// 音频缓存（浏览器 Audio 对象）
const audioCache = new Map();
const CACHE_MAX_SIZE = 50;

// 当前播放的 Audio 对象
let currentAudio = null;

// 检测浏览器是否支持 Opus 格式
const canPlayOpus = () => {
  const audio = document.createElement('audio');
  // 检测 audio/ogg; codecs=opus 或 audio/opus
  return audio.canPlayType('audio/ogg; codecs=opus') !== '' ||
         audio.canPlayType('audio/opus') !== '';
};

const isOpusSupported = canPlayOpus();
console.log(`[PreloadAudio] Opus 格式支持: ${isOpusSupported}`);

// 详细的 Opus 支持检测
const audioTest = document.createElement('audio');
console.log(`[PreloadAudio] canPlayType('audio/ogg; codecs=opus'): "${audioTest.canPlayType('audio/ogg; codecs=opus')}"`);
console.log(`[PreloadAudio] canPlayType('audio/opus'): "${audioTest.canPlayType('audio/opus')}"`);

/**
 * 构建音频公共 URL
 * @param {number|string} sentenceId - 句子 ID
 * @returns {string} 音频文件 URL
 */
const getAudioUrl = (sentenceId) => {
  return `${SUPABASE_URL}/storage/v1/object/public/${AUDIO_BUCKET}/${sentenceId}.opus`;
};

// 音频存在性缓存（基于实际播放结果）
const audioExistsCache = new Map();

/**
 * 检查句子是否有预加载音频
 * 通过 HEAD 请求验证文件是否实际存在于 Supabase Storage
 */
export const hasPreloadedAudio = async (sentenceId) => {
  if (!sentenceId) return false;

  // 如果浏览器不支持 Opus 格式，直接返回 false
  if (!isOpusSupported) {
    console.log(`[PreloadAudio] 浏览器不支持 Opus 格式，跳过预加载音频`);
    return false;
  }

  const cacheKey = String(sentenceId);

  // 检查缓存：已知存在的音频
  if (audioExistsCache.get(cacheKey) === true) {
    console.log(`[PreloadAudio] ✅ 缓存命中(存在): sentence ${sentenceId}`);
    return true;
  }

  // 检查缓存：已知不存在的音频
  if (audioExistsCache.get(cacheKey) === false) {
    console.log(`[PreloadAudio] ❌ 缓存命中(不存在): sentence ${sentenceId}`);
    return false;
  }

  // 发送 HEAD 请求验证文件是否存在
  try {
    const url = getAudioUrl(sentenceId);
    console.log(`[PreloadAudio] 🔍 检查音频存在性: sentence ${sentenceId}`);

    // 使用 AbortController 设置超时，避免请求挂起
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      // 不发送 cookies，避免 CORS 预检问题
      credentials: 'omit',
      // 跟随重定向
      redirect: 'follow'
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log(`[PreloadAudio] ✅ 音频存在: sentence ${sentenceId}`);
      audioExistsCache.set(cacheKey, true);
      return true;
    } else {
      console.log(`[PreloadAudio] ❌ 音频不存在: sentence ${sentenceId} (HTTP ${response.status})`);
      audioExistsCache.set(cacheKey, false);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`[PreloadAudio] ⏱️ 检查超时: sentence ${sentenceId}`);
    } else {
      console.warn(`[PreloadAudio] ⚠️ 检查失败: sentence ${sentenceId} -`, error.message);
    }
    // 网络错误时保守处理，假设不存在
    audioExistsCache.set(cacheKey, false);
    return false;
  }
};

/**
 * 预加载音频文件
 * @param {number|string} sentenceId - 句子 ID
 */
export const preloadAudio = async (sentenceId) => {
  if (!sentenceId) return;
  const cacheKey = String(sentenceId);

  if (audioCache.has(cacheKey)) return; // 已缓存

  try {
    const url = getAudioUrl(sentenceId);
    const res = await fetch(url);

    if (res.ok) {
      const blob = await res.blob();

      // 控制缓存大小
      if (audioCache.size >= CACHE_MAX_SIZE) {
        const firstKey = audioCache.keys().next().value;
        const oldUrl = audioCache.get(firstKey);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        audioCache.delete(firstKey);
      }

      // 明确指定 MIME 类型为 audio/ogg
      const audioBlob = new Blob([blob], { type: 'audio/ogg; codecs=opus' });
      const blobUrl = URL.createObjectURL(audioBlob);
      audioCache.set(cacheKey, blobUrl);
      audioExistsCache.set(cacheKey, true);
      console.log(`[PreloadAudio] 预加载完成: sentence ${sentenceId}`);
    }
  } catch (e) {
    console.debug(`[PreloadAudio] 预加载失败: sentence ${sentenceId}`, e.message);
  }
};

/**
 * 播放预加载音频
 * @param {number|string} sentenceId - 句子 ID
 * @returns {Promise<void>}
 */
export const speak = async (sentenceId) => {
  if (!sentenceId) {
    throw new Error('sentenceId is required');
  }

  const cacheKey = String(sentenceId);
  let audioUrl;

  if (audioCache.has(cacheKey)) {
    // 使用缓存的 blob URL
    audioUrl = audioCache.get(cacheKey);
    console.log(`[PreloadAudio] ✅ 使用缓存: sentence ${sentenceId}`);
  } else {
    // 直接使用 Supabase URL（浏览器会自动缓存）
    audioUrl = getAudioUrl(sentenceId);
    console.log(`[PreloadAudio] 🔗 直播放: sentence ${sentenceId} → ${audioUrl}`);
  }

  return new Promise((resolve, reject) => {
    // 停止当前播放
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    currentAudio = new Audio();
    // 设置音频类型，帮助浏览器正确解码
    currentAudio.type = 'audio/ogg; codecs=opus';
    currentAudio.src = audioUrl;
    currentAudio.onended = () => {
      console.log(`[PreloadAudio] ✅ 播放完成: sentence ${sentenceId}`);
      currentAudio = null;
      resolve();
    };
    currentAudio.onerror = (e) => {
      const err = currentAudio?.error;
      console.error(`[PreloadAudio] ❌ 播放失败: sentence ${sentenceId}`, err?.code, err?.message);

      // 标记该音频不存在，下次跳过
      audioExistsCache.set(cacheKey, false);

      currentAudio = null;
      reject(new Error(`Audio playback failed for sentence ${sentenceId}: ${err?.message || 'unknown'}`));
    };
    currentAudio.play().catch((e) => {
      console.error(`[PreloadAudio] ❌ play() rejected: sentence ${sentenceId}`, e.message);
      reject(e);
    });
  });
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
 * 是否正在播放
 */
export const getIsSpeaking = () => {
  return currentAudio !== null && !currentAudio.paused;
};

/**
 * 清除缓存
 */
export const clearCache = () => {
  for (const url of audioCache.values()) {
    URL.revokeObjectURL(url);
  }
  audioCache.clear();
  audioExistsCache.clear();
};
