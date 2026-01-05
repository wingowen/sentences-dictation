// 发音服务 - 基于CMU发音字典获取单词音标

import { dictionary } from 'cmu-pronouncing-dictionary';

/**
 * 获取单个单词的音标
 * @param {string} word - 要获取音标的单词
 * @returns {string|null} 单词的音标，未找到则返回null
 */
export const getPhonetic = (word) => {
  // 转换为小写，CMU字典中的单词都是小写的
  const lowerWord = word.toLowerCase();
  
  // 从CMU字典中获取音标
  const phonetic = dictionary[lowerWord];
  
  if (phonetic) {
    return phonetic;
  }
  
  return null;
};

/**
 * 将ARPAbet音标转换为更易读的形式
 * @param {string} arpabet - ARPAbet格式的音标
 * @returns {string} 美化后的音标
 */
export const formatPhonetic = (arpabet) => {
  if (!arpabet) return '';
  
  // 简单替换一些常见的ARPAbet符号，使其更易读
  // 注意：这是一个简化的实现，完整的转换需要更复杂的映射
  return arpabet
    .replace(/\d/g, '') // 移除重音标记
    .replace(/AA/g, 'ɑ')
    .replace(/AE/g, 'æ')
    .replace(/AH/g, 'ʌ')
    .replace(/AO/g, 'ɔ')
    .replace(/AW/g, 'aʊ')
    .replace(/AY/g, 'aɪ')
    .replace(/EH/g, 'ɛ')
    .replace(/ER/g, 'ɜr')
    .replace(/EY/g, 'eɪ')
    .replace(/IH/g, 'ɪ')
    .replace(/IY/g, 'i')
    .replace(/OW/g, 'oʊ')
    .replace(/OY/g, 'ɔɪ')
    .replace(/UH/g, 'ʊ')
    .replace(/UW/g, 'u')
    .replace(/B/g, 'b')
    .replace(/CH/g, 'tʃ')
    .replace(/D/g, 'd')
    .replace(/DH/g, 'ð')
    .replace(/F/g, 'f')
    .replace(/G/g, 'ɡ')
    .replace(/HH/g, 'h')
    .replace(/JH/g, 'dʒ')
    .replace(/K/g, 'k')
    .replace(/L/g, 'l')
    .replace(/M/g, 'm')
    .replace(/N/g, 'n')
    .replace(/NG/g, 'ŋ')
    .replace(/P/g, 'p')
    .replace(/R/g, 'r')
    .replace(/S/g, 's')
    .replace(/SH/g, 'ʃ')
    .replace(/T/g, 't')
    .replace(/TH/g, 'θ')
    .replace(/V/g, 'v')
    .replace(/W/g, 'w')
    .replace(/Y/g, 'j')
    .replace(/Z/g, 'z')
    .replace(/ZH/g, 'ʒ');
};

/**
 * 解析句子，获取每个单词的音标
 * @param {string} sentence - 要解析的句子
 * @returns {Array} 包含单词和音标的对象数组
 */
export const parseSentenceForPhonetics = (sentence) => {
  // 移除句子中的标点符号，只保留单词
  const words = sentence
    .replace(/[.,!?;:"'()\[\]{}\-_]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  // 为每个单词获取音标
  return words.map(word => {
    const phonetic = getPhonetic(word);
    return {
      word,
      phonetic: phonetic ? formatPhonetic(phonetic) : null
    };
  });
};