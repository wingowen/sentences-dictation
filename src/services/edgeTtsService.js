// Edge TTS Service - Client-side service for Microsoft Edge TTS via Netlify Function
// import { debounce } from '../utils/debounce.js'; // Not currently used

// Configuration
const API_ENDPOINT = '/.netlify/functions/get-tts-audio';

// State management
let isSpeaking = false;
let lastSpeakTime = 0;
const SPEAK_DEBOUNCE_DELAY = 300; // Debounce delay (ms)

// Audio cache
const audioCache = new Map();
const CACHE_EXPIRY_TIME = 3600000; // 1 hour in milliseconds

// Current audio element for playback
let currentAudio = null;

/**
 * Generate cache key
 * @param {string} text - Text content
 * @param {number} rate - Speech rate
 * @param {string} voice - Voice name
 * @returns {string} Cache key
 */
const generateCacheKey = (text, rate, voice) => {
  return `edge_tts_${text}_${rate}_${voice}`;
};

/**
 * Check if cache item is valid
 * @param {Object} cachedItem - Cached item
 * @returns {boolean} Whether cache is valid
 */
const isCacheValid = (cachedItem) => {
  return Date.now() - cachedItem.timestamp < CACHE_EXPIRY_TIME;
};

/**
 * Cleanup expired cache entries
 */
const cleanupExpiredCache = () => {
  const now = Date.now();
  audioCache.forEach((cachedItem, cacheKey) => {
    if (now - cachedItem.timestamp > CACHE_EXPIRY_TIME) {
      // Release audio URL if it exists
      if (cachedItem.url) {
        URL.revokeObjectURL(cachedItem.url);
      }
      // Delete expired cache
      audioCache.delete(cacheKey);
    }
  });
};

// Periodically cleanup expired cache (every 10 minutes)
setInterval(cleanupExpiredCache, 10 * 60 * 1000);

/**
 * Check if Edge TTS service is available
 * @returns {boolean} Whether the service is available
 */
export const isEdgeTtsAvailable = () => {
  return navigator.onLine;
};

/**
 * Fetch TTS audio from Netlify Function
 * @param {string} text - Text to synthesize
 * @param {number} rate - Speech rate
 * @param {string} voice - Voice name
 * @returns {Promise<Audio>} Audio element
 */
const fetchTtsAudio = async (text, rate = 1.0, voice = 'en-US-AriaNeural') => {
  // Generate cache key
  const cacheKey = generateCacheKey(text, rate, voice);

  // Check cache
  if (audioCache.has(cacheKey)) {
    const cachedItem = audioCache.get(cacheKey);
    if (isCacheValid(cachedItem)) {
      // Use cached audio
      const audio = new Audio(cachedItem.url);
      return audio;
    }
  }

  // Fetch new audio
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      voice,
      rate
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `TTS API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success || !data.audio) {
    throw new Error(data.error || 'Invalid TTS response');
  }

  // Convert base64 to blob
  const byteCharacters = atob(data.audio);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: data.contentType || 'audio/mpeg' });

  // Create URL for blob
  const url = URL.createObjectURL(blob);

  // Cache the audio URL
  audioCache.set(cacheKey, {
    url,
    timestamp: Date.now()
  });

  // Create audio element
  const audio = new Audio(url);

  // Release URL when audio ends
  audio.onended = () => {
    // Keep URL in cache, release when cache expires
  };

  return audio;
};

/**
 * Speak text using Edge TTS
 * @param {string} text - Text to speak
 * @param {number} rate - Speech rate (0.5 - 2.0)
 * @param {string} voice - Voice name
 * @returns {Promise<void>}
 */
export const speak = async (text, rate = 1.0, voice = 'en-US-AriaNeural') => {
  // Debounce handling
  const now = Date.now();
  if (now - lastSpeakTime < SPEAK_DEBOUNCE_DELAY) {
    throw new Error('Speech synthesis is debounced. Please wait a moment and try again.');
  }
  lastSpeakTime = now;

  try {
    isSpeaking = true;

    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Fetch and play audio
    const audio = await fetchTtsAudio(text, rate, voice);
    currentAudio = audio;

    // Return promise that resolves when audio finishes playing
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        isSpeaking = false;
        currentAudio = null;
        resolve();
      };

      audio.onerror = (error) => {
        isSpeaking = false;
        currentAudio = null;
        reject(error);
      };

      audio.play().catch(error => {
        isSpeaking = false;
        currentAudio = null;
        reject(error);
      });
    });
  } catch (error) {
    isSpeaking = false;
    currentAudio = null;
    throw error;
  }
};

/**
 * Preload TTS audio for a sentence
 * @param {string} text - Text to preload
 * @param {number} rate - Speech rate
 * @param {string} voice - Voice name
 * @returns {Promise<void>}
 */
export const preloadSentence = async (text, rate = 1.0, voice = 'en-US-AriaNeural') => {
  try {
    // Generate cache key
    const cacheKey = generateCacheKey(text, rate, voice);

    // Check if already cached
    if (audioCache.has(cacheKey)) {
      const cachedItem = audioCache.get(cacheKey);
      if (isCacheValid(cachedItem)) {
        return; // Already preloaded and valid
      }
    }

    // Fetch and cache the audio (don't play it)
    // The fetchTtsAudio function handles caching internally
    await fetchTtsAudio(text, rate, voice);
    console.log(`Preloaded audio for: "${text.substring(0, 30)}..."`);
  } catch (error) {
    console.warn(`Failed to preload audio for "${text.substring(0, 30)}...":`, error.message);
    // Don't throw - preload failure shouldn't break the app
  }
};

/**
 * Cancel current speech
 */
export const cancelSpeech = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  isSpeaking = false;
};

/**
 * Check if currently speaking
 * @returns {boolean}
 */
export const getIsSpeaking = () => {
  return isSpeaking;
};

/**
 * Clear entire audio cache
 */
export const clearCache = () => {
  audioCache.forEach((cachedItem) => {
    if (cachedItem.url) {
      URL.revokeObjectURL(cachedItem.url);
    }
  });
  audioCache.clear();
};
