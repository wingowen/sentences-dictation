// 预加载音频服务 - 直接播放 Supabase Storage 中预生成的 .opus 文件
// 优先级最高：秒播、零延迟、无需 TTS 服务器

const SUPABASE_URL = 'https://gtcnjqeloworstrimcsr.supabase.co';
const AUDIO_BUCKET = 'sentence-audios';

// 音频缓存（浏览器 Audio 对象）
const audioCache = new Map();
const CACHE_MAX_SIZE = 50;

// 当前播放的 Audio 对象
let currentAudio = null;

/**
 * 构建音频公共 URL
 * @param {number|string} sentenceId - 句子 ID
 * @returns {string} 音频文件 URL
 */
const getAudioUrl = (sentenceId) => {
  return `${SUPABASE_URL}/storage/v1/object/public/${AUDIO_BUCKET}/${sentenceId}.opus`;
};

/**
 * 检查句子是否有预加载音频
 * 简化版：只要有 sentenceId 就假设有音频（948句全部已生成）
 * 播放失败时自动降级到下一级 TTS
 */
export const hasPreloadedAudio = async (sentenceId) => {
  if (!sentenceId) return false;
  // 所有句子都有预生成音频，跳过 HEAD 检查（避免 CORS/超时问题）
  return true;
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

      const blobUrl = URL.createObjectURL(blob);
      audioCache.set(cacheKey, blobUrl);
      audioExistsCache.set(sentenceId, true);
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

    currentAudio = new Audio(audioUrl);
    currentAudio.onended = () => {
      console.log(`[PreloadAudio] ✅ 播放完成: sentence ${sentenceId}`);
      currentAudio = null;
      resolve();
    };
    currentAudio.onerror = (e) => {
      const err = currentAudio?.error;
      console.error(`[PreloadAudio] ❌ 播放失败: sentence ${sentenceId}`, err?.code, err?.message);
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
