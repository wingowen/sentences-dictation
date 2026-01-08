// 语音服务 - 基于Web Speech API的语音合成功能

// 语音合成状态管理
let isSpeaking = false;
let lastSpeakTime = 0;
const SPEAK_DEBOUNCE_DELAY = 300; // 防抖延迟（毫秒）

// 语音配置
let selectedVoice = null;
let availableVoices = [];
let speechConfig = {
  pitch: 1.0,
  volume: 1.0
};

/**
 * 检查浏览器是否支持语音合成
 * @returns {boolean} 是否支持语音合成
 */
export const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
};

/**
 * 获取可用的语音列表
 * @returns {Array} 可用语音列表
 */
export const getAvailableVoices = () => {
  if (!isSpeechSupported()) {
    return [];
  }
  
  // 确保语音列表已加载
  if (window.speechSynthesis.getVoices().length === 0) {
    // 触发语音加载
    window.speechSynthesis.getVoices();
  }
  
  availableVoices = window.speechSynthesis.getVoices();
  // 只返回英文语音选项（语言代码以"en-"开头）
  const englishVoices = availableVoices.filter(voice => voice.lang.startsWith('en-'));
  return englishVoices;
};

/**
 * 设置选定的语音
 * @param {Object} voice 语音对象
 */
export const setVoice = (voice) => {
  selectedVoice = voice;
};

/**
 * 获取当前选定的语音
 * @returns {Object} 当前选定的语音
 */
export const getSelectedVoice = () => {
  return selectedVoice;
};

/**
 * 更新语音配置
 * @param {Object} config 语音配置对象
 */
export const updateSpeechConfig = (config) => {
  speechConfig = {
    ...speechConfig,
    ...config
  };
};

/**
 * 获取当前语音配置
 * @returns {Object} 当前语音配置
 */
export const getSpeechConfig = () => {
  return { ...speechConfig };
};



/**
 * 清除所有语音任务并重置状态
 */
const clearSpeechTasks = () => {
  if (isSpeechSupported()) {
    // 完全清除所有语音任务
    window.speechSynthesis.cancel();
    // 重置状态
    isSpeaking = false;
  }
};

/**
 * 朗读指定文本
 * @param {string} text - 要朗读的文本
 * @param {number} rate - 语速 (0.1 - 10, 默认 1.0)
 * @returns {Promise<void>} - 朗读完成的Promise
 */
export const speak = (text, rate = 1.0) => {
  return new Promise((resolve, reject) => {
    if (!isSpeechSupported()) {
      reject(new Error('Speech synthesis is not supported in this browser.'));
      return;
    }

    // 防抖处理，防止快速连续调用
    const now = Date.now();
    if (now - lastSpeakTime < SPEAK_DEBOUNCE_DELAY) {
      reject(new Error('Speech synthesis is debounced. Please wait a moment and try again.'));
      return;
    }
    lastSpeakTime = now;

    // 清除所有现有的语音任务
    clearSpeechTasks();

    try {
      // 创建语音合成实例
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 设置事件监听器
      utterance.onend = () => {
        isSpeaking = false;
        resolve();
      };
      utterance.onerror = (error) => {
        isSpeaking = false;
        reject(error);
      };
      utterance.onstart = () => {
        isSpeaking = true;
      };
      utterance.onpause = () => {
        isSpeaking = false;
      };
      utterance.onresume = () => {
        isSpeaking = true;
      };
      
      // 使用默认语音设置
      utterance.lang = 'en-US';
      utterance.rate = Math.max(0.1, Math.min(10, rate)); // 限制语速范围
      utterance.pitch = speechConfig.pitch;
      utterance.volume = speechConfig.volume;
      
      // 使用选定的语音（如果有）
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // 开始朗读
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      isSpeaking = false;
      reject(error);
    }
  });
};

/**
 * 取消当前所有语音朗读
 */
export const cancelSpeech = () => {
  clearSpeechTasks();
};

/**
 * 检查是否正在朗读
 * @returns {boolean} 是否正在朗读
 */
export const getIsSpeaking = () => {
  return isSpeaking;
};