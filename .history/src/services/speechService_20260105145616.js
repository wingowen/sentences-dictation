// 语音服务 - 基于Web Speech API的语音合成功能

/**
 * 检查浏览器是否支持语音合成
 * @returns {boolean} 是否支持语音合成
 */
export const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
};

/**
 * 朗读指定文本
 * @param {string} text - 要朗读的文本
 * @returns {Promise<void>} - 朗读完成的Promise
 */
export const speak = (text) => {
  return new Promise((resolve, reject) => {
    if (!isSpeechSupported()) {
      reject(new Error('Speech synthesis is not supported in this browser.'));
      return;
    }

    // 创建语音合成实例
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 设置事件监听器
    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);
    
    // 使用默认语音设置
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // 开始朗读
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * 取消当前所有语音朗读
 */
export const cancelSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};