// 语音服务 - 基于Web Speech API的语音合成功能

// 语音合成状态管理
let isSpeaking = false;
let currentUtterance = null;
let lastSpeakTime = 0;
const SPEAK_DEBOUNCE_DELAY = 300; // 防抖延迟（毫秒）

/**
 * 检查浏览器是否支持语音合成
 * @returns {boolean} 是否支持语音合成
 */
export const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
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
    currentUtterance = null;
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
      currentUtterance = utterance;
      
      // 设置事件监听器
      utterance.onend = () => {
        isSpeaking = false;
        currentUtterance = null;
        resolve();
      };
      utterance.onerror = (error) => {
        isSpeaking = false;
        currentUtterance = null;
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
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // 开始朗读
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      isSpeaking = false;
      currentUtterance = null;
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